#!/usr/bin/env python3
"""한국어 페이지(루트)에서 영문 페이지(en/)를 생성한다.
사용: python3 tools/build_en.py   (한국어 문구를 고친 뒤에는 tools/en.json 에 번역을 추가하고 다시 실행)
- 번역은 tools/en.json (한국어 → 영어). 키는 tools/i18n_extract.py 규칙으로 만든다.
- 번역이 없는 한글이 남으면 경고로 출력한다."""
import sys, os, re, json, glob, html
sys.path.insert(0, os.path.dirname(__file__))
from bs4 import BeautifulSoup, NavigableString, Tag
from i18n_extract import units, encode, norm, HAN, OPAQUE
from lang_block import lang_block

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN = json.load(open(os.path.join(ROOT, 'tools/en.json'), encoding='utf-8'))
missing = {}

def lookup(key, raw=True):
    if key in EN: return EN[key]
    esc = key.replace('&', '&amp;')
    if esc in EN: return EN[esc]
    return None

TOKEN = re.compile(r'<(/?)([a-z]+):(\d+)(/?)>')

def rebuild(el, parts, en, soup):
    """el의 자식을 번역문 en 으로 교체. <tag:N> 은 원래 요소의 속성을 복사해 되살린다."""
    originals = list(parts)
    el.clear()
    stack = [el]; pos = 0
    def add_text(t):
        if t: stack[-1].append(NavigableString(html.unescape(t)))
    for m in TOKEN.finditer(en):
        add_text(en[pos:m.start()]); pos = m.end()
        close, name, n, selfc = m.group(1), m.group(2), int(m.group(3)), m.group(4)
        orig = originals[n - 1]
        if close:
            stack.pop()
        elif selfc:
            if name in ('x',):
                stack[-1].append(orig.extract() if orig.parent is not None else orig)
            else:
                stack[-1].append(soup.new_tag(name))
        else:
            t = soup.new_tag(orig.name, attrs=dict(orig.attrs))
            stack[-1].append(t); stack.append(t)
    add_text(en[pos:])

def fix_paths(soup):
    pat = re.compile(r'((?:\.\./)*)assets/')
    for t in soup.find_all(True):
        for a in ('href', 'src', 'srcset', 'poster', 'style', 'data-src'):
            v = t.get(a)
            if isinstance(v, str) and 'assets/' in v and not re.match(r'(https?:)?//', v):
                t[a] = pat.sub(lambda m: '../' + m.group(1) + 'assets/', v)

def build(src, rel):
    soup = BeautifulSoup(open(src, encoding='utf-8').read(), 'html.parser')
    # 번역 단위는 먼저 모두 모은 뒤 적용(적용 중 트리가 바뀌므로)
    work = []
    for kind, el, key in units(soup):
        work.append((kind, el, key, encode(el)[1] if kind == 'block' else None))
    for kind, el, key, parts in work:
        en = lookup(key)
        if en is None:
            missing.setdefault(key, []).append(rel or 'index'); continue
        if kind == 'block': rebuild(el, parts, en, soup)
        elif kind == 'text': el.replace_with(NavigableString(html.unescape(en)))
        elif kind == 'title': el.string = html.unescape(en)
        elif kind == 'meta': el['content'] = html.unescape(en)
        elif kind.startswith('attr:'): el[kind[5:]] = html.unescape(en)
    # 언어·경로·언어선택
    if soup.html: soup.html['lang'] = 'en'
    fix_paths(soup)
    old = soup.find('div', class_='lang')
    if old:
        old.replace_with(BeautifulSoup(lang_block(rel, 'en'), 'html.parser'))
    # 접근성 문구 중 번역 단위에 안 잡히는 고정 문구
    for t in soup.select('svg.logo-full[role=img]'):
        t['aria-label'] = 'Jeongsu E&G energy & green'
    for t in soup.select('input[type=hidden][name=type]'):
        if t.get('value') == '고객 상담': t['value'] = 'Consultation'
    return str(soup)

def main():
    pages = sorted(glob.glob(os.path.join(ROOT, '**/index.html'), recursive=True))
    out_n = 0
    for f in pages:
        rel = os.path.relpath(os.path.dirname(f), ROOT); rel = '' if rel == '.' else rel
        if rel.startswith('en') and (rel == 'en' or rel.startswith('en/')): continue
        if rel == 'support/contact':
            body = open(f, encoding='utf-8').read()
            body = body.replace('lang="ko"', 'lang="en"').replace('실사 및 견적 신청 | 정수 E&amp;G', 'Site Survey & Quote Request | Jeongsu E&amp;G').replace('실사 및 견적 신청 페이지로 이동', 'Go to the Site Survey & Quote Request page')
            dst = os.path.join(ROOT, 'en', rel, 'index.html')
        else:
            body = build(f, rel)
            dst = os.path.join(ROOT, 'en', rel, 'index.html')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, 'w', encoding='utf-8').write(body); out_n += 1
    print('written', out_n, 'pages')
    if missing:
        print('MISSING translations:', len(missing))
        for k, v in list(missing.items())[:30]: print(' ', repr(k)[:100], v[:2])
    # 남은 한글 점검 (언어 이름 '한국어'와 주석 제외)
    left = 0
    for f in glob.glob(os.path.join(ROOT, 'en/**/index.html'), recursive=True):
        s = open(f, encoding='utf-8').read()
        s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
        s = re.sub(r'<div class="lang".*?</div>', '', s, flags=re.S)
        s = re.sub(r'<script.*?</script>|<style.*?</style>', '', s, flags=re.S)
        for m in re.finditer(r'[^<>]*[가-힣][^<>]*', s):
            left += 1; print('  KOREAN LEFT', os.path.relpath(f, ROOT), repr(m.group(0).strip())[:90])
    print('leftover korean fragments:', left)

if __name__ == '__main__':
    main()
