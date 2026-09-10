# 정수 E&G 홈페이지

전남 광양 태양광·ESS 기업 정수 E&G (energy & green) 홈페이지. GitHub Pages: https://yunho1110.github.io/JS-E-G/

- `index.html` — 메인 홈 (단일 파일, 외부 의존성은 Google Fonts뿐)
- `about/greeting/index.html` — 인사말
- `docs/` — 원고·회의 정리

## 구조 (기획서 기준)

회사 소개 / 사업 분야 / 제품 / 시공 실적 및 사례 / 고객지원 — 상단 GNB 호버 드롭다운, 모바일 아코디언 메뉴. 서브페이지는 `폴더/index.html` 구조로 만들고 링크는 상대경로로 쓴다 (GitHub Pages 하위경로 대응).

## 채워야 할 것

`「 」`로 표시된 값은 대표 확인 후 기재. 사진은 `.hero .bg`, `.card .thumb`, `.case`에 `background-image`로 넣는다. 사진이 들어오면 `.case::after`(현장 사진 자리 표시)는 삭제.
