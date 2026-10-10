"""한국어 페이지에서 번역 단위를 추출한다 (tools/build_en.py 와 같은 규칙을 공유).
번역 단위: (1) 인라인 요소만 가진 블록의 내용, (2) 단독 텍스트, (3) 속성(alt/aria-label/placeholder/title/data-chip/meta content), (4) <title>.
인라인 태그는 <a:1>..</a:1> 처럼 속성을 번호로 치환해 키에 넣는다 (번역문도 같은 번호 태그를 그대로 사용)."""
import re, copy
from bs4 import BeautifulSoup, NavigableString, Comment

SKIP = {'script','style','svg','symbol','noscript','head'}
INLINE = {'a','b','strong','em','i','span','small','br','sup','sub','mark','u','abbr','code','input','img','svg','label','button','time','wbr','select','option','textarea'}
OPAQUE = {'svg','input','img','select','textarea'}   # 내용을 번역하지 않고 통째로 보존
ATTRS = ('alt','aria-label','placeholder','title','data-chip')
HAN = re.compile(r'[가-힣]')

def norm(s): return re.sub(r'\s+',' ',s).strip()

def is_unit_candidate(el):
    return any(isinstance(c,NavigableString) and not isinstance(c,Comment) and c.strip() for c in el.children)

def all_inline(el):
    for d in el.descendants:
        if getattr(d,'name',None) and d.name not in INLINE: return False
    return True

def encode(el):
    """el의 자식들을 키 문자열로. 반환: (key, parts) parts = 복원용 요소 목록"""
    out=[]; parts=[]
    def enc(node):
        if isinstance(node,Comment): return
        if isinstance(node,NavigableString):
            out.append(str(node).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')); return
        n=len(parts)+1; parts.append(node)
        if node.name in OPAQUE or node.name in ('br','wbr'):
            out.append(f'<x:{n}/>' if node.name not in ('br','wbr') else f'<{node.name}:{n}/>'); return
        out.append(f'<{node.name}:{n}>')
        for c in node.children: enc(c)
        out.append(f'</{node.name}:{n}>')
    for c in el.children: enc(c)
    return norm(''.join(out)), parts

def units(soup):
    """(kind, element, key) 목록. kind: 'block' | 'text' | 'attr:<name>' | 'title' | 'meta'"""
    res=[]
    if soup.title and soup.title.string and HAN.search(soup.title.string): res.append(('title',soup.title,norm(soup.title.string)))
    for m in soup.find_all('meta'):
        if m.get('name') in ('description',) or (m.get('property') or '') in ('og:title','og:description'):
            if m.get('content') and HAN.search(m['content']): res.append(('meta',m,norm(m['content'])))
    body=soup.body
    def visit(el):
        if el.name in SKIP or el.get('data-no-i18n') is not None: return
        for a in ATTRS:
            if el.get(a) and HAN.search(el[a]): res.append(('attr:'+a,el,norm(el[a])))
        if is_unit_candidate(el):
            if all_inline(el):
                key,_=encode(el)
                if HAN.search(key): res.append(('block',el,key))
                return
            for c in list(el.children):
                if isinstance(c,NavigableString) and not isinstance(c,Comment) and c.strip() and HAN.search(c):
                    res.append(('text',c,norm(str(c))))
        for c in el.children:
            if getattr(c,'name',None): visit(c)
    visit(body)
    return res
