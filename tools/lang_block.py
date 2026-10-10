"""헤더 우측 지구본 언어 선택 마크업. 한국어 페이지는 루트, 영문 페이지는 en/ 아래에 있다."""
GLOBE = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
         'aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.2"/><path d="M2.8 12h18.4"/>'
         '<path d="M12 2.8c2.6 2.5 4 5.7 4 9.2s-1.4 6.7-4 9.2c-2.6-2.5-4-5.7-4-9.2s1.4-6.7 4-9.2z"/></svg>')

def lang_block(rel, current):
    """rel: 'business/roof' 같은 페이지 경로(홈은 ''), current: 'ko' | 'en'"""
    depth = len([x for x in rel.split('/') if x])
    tail = (rel + '/') if rel else ''
    if current == 'ko':
        ko = './'
        en = '../' * depth + 'en/' + tail
    else:
        en = './'
        ko = '../' * (depth + 1) + tail
    ca = ' aria-current="true"'
    return ('<div class="lang" data-no-i18n>'
            '<button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="언어 선택 · Language">' + GLOBE + '</button>'
            '<ul class="lang-list">'
            f'<li><a href="{ko}" lang="ko" hreflang="ko"{ca if current=="ko" else ""}>한국어</a></li>'
            f'<li><a href="{en}" lang="en" hreflang="en"{ca if current=="en" else ""}>English</a></li>'
            '</ul></div>')
