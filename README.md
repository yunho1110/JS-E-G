# 정수 E&G 홈페이지

전남 광양 태양광·ESS 기업 정수 E&G (energy & green) 홈페이지. GitHub Pages: https://yunho1110.github.io/JS-E-G/

- `index.html` — 메인 홈 (단일 파일, 외부 의존성은 Google Fonts뿐)
- `about/greeting/index.html` — 인사말
- `docs/` — 원고·회의 정리

## 구조 (기획서 기준)

회사 소개 / 사업 분야 / 제품 / 시공 실적 및 사례 / 고객지원 — 상단 GNB 호버 드롭다운, 모바일 아코디언 메뉴. 서브페이지는 `폴더/index.html` 구조로 만들고 링크는 상대경로로 쓴다 (GitHub Pages 하위경로 대응).

## 채워야 할 것

`「 」`로 표시된 값은 대표 확인 후 기재. 현장 사진은 `<figure class="ph">` 자리에 `<img>`로 넣는다 (`.ph img`가 `object-fit:cover` 처리).

## 이미지 출처

- `assets/hero-solar.jpg` — Unsplash (Unsplash License · 상업적 이용 가능, 출처 표기 의무 없음)

## 실제 현장·사무실 사진 (2026-11 반영)

- `assets/img/real/` — 대표님이 카카오톡으로 보내주신 현장·사무실 사진(웹용 변환본). 고흥 현장 4장은 대표님이 붙인 구역명(쏠라파워 / 파워제네레이션 / 쏠라뱅크)을 사진 설명에 사용.
- 로고는 대표님 원본 `로고.ai`(PDF 기반)를 SVG로 변환해 `<symbol id="jsl-full">` 로 삽입 (파일 상단 스프라이트).
- 양도 방법은 `docs/handover.md`.
