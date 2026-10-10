#!/usr/bin/env python3
"""site.css / site.js 참조에 내용 해시(?v=)를 붙여 브라우저 캐시 때문에 옛 CSS·JS가 남는 문제를 막는다.
CSS/JS를 고친 뒤 실행: python3 tools/bust.py  (en/ 은 build_en.py가 KO에서 복사하므로 그 뒤에 실행해도 됨)"""
import glob, hashlib, re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def h(p): return hashlib.md5(open(os.path.join(root, p), 'rb').read()).hexdigest()[:8]
v = {'css': h('assets/site.css'), 'js': h('assets/site.js')}
n = 0
for f in glob.glob(os.path.join(root, '**/index.html'), recursive=True) + glob.glob(os.path.join(root, '*.html')):
    s = open(f, encoding='utf-8').read(); o = s
    s = re.sub(r'(assets/site\.css)(\?v=[0-9a-f]+)?', r'\1?v=' + v['css'], s)
    s = re.sub(r'(assets/site\.js)(\?v=[0-9a-f]+)?', r'\1?v=' + v['js'], s)
    if s != o: open(f, 'w', encoding='utf-8').write(s); n += 1
print('updated', n, 'files', v)
