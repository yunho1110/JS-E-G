/* 정수 E&G — 공통 스크립트. 외부 라이브러리 없음.
   모든 기능은 점진적 향상: JS가 없어도 메뉴 링크·콘텐츠·표·폼 구조는 그대로 사용 가능하다. */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var touchMq = window.matchMedia('(hover: none)');
  var header = $('#header'), burger = $('#burger'), mnav = $('#mnav');
  var isHome = d.body.classList.contains('home');

  /* ── 1. 헤더: 스크롤 상태 전환 (rAF로 한 프레임에 한 번만) ── */
  var ticking = false, heroEl = $('.hero'), shotEl = $('.hero-shot'), heroVisible = !!heroEl;
  function frame() {
    ticking = false;
    var y = window.pageYOffset || 0;
    if (header && !header.classList.contains('open')) {
      if (isHome) header.classList.toggle('solid', y > 40);
      header.classList.toggle('scrolled', y > 40);
    }
    if (shotEl && heroVisible && !reduceMq.matches && window.innerWidth > 960) {
      shotEl.style.setProperty('--py', Math.min(y * 0.06, 36).toFixed(1) + 'px');   /* 미세 패럴랙스 */
    }
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if (d.body.classList.contains('subpage') && header) header.classList.add('solid', 'sub-page');
  frame();
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe(heroEl);
  }

  /* ── 2. 현재 페이지 위치 표시 (aria-current) ── */
  function norm(p) { return p.replace(/index\.html$/, '').replace(/\/+$/, '/'); }
  var here = norm(location.pathname);
  $$('.gnb a, .mnav a').forEach(function (a) {
    if (a.getAttribute('href') && a.pathname && norm(a.pathname) === here) a.setAttribute('aria-current', 'page');
  });
  $$('.gnb>li').forEach(function (li) {
    var top = li.querySelector(':scope>a');
    if (top && !top.hasAttribute('aria-current') && li.querySelector('.sub a[aria-current]')) top.setAttribute('aria-current', 'true');
  });
  $$('.macc').forEach(function (m) { if (m.querySelector('a[aria-current]')) m.classList.add('current'); });

  /* ── 3. 모바일 메뉴: 열기/닫기 · Esc · 바깥 클릭 · 포커스 순환 ── */
  function setMenu(open, restoreFocus) {
    if (!mnav || !burger) return;
    mnav.classList.toggle('open', open);
    header.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    d.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      var cur = $('.macc.current', mnav);
      if (cur && !$('.macc.open', mnav)) toggleAcc(cur, true);
    } else {
      frame();
      if (restoreFocus) burger.focus();
    }
  }
  function isOpen() { return mnav && mnav.classList.contains('open'); }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(!isOpen()); });
    d.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setMenu(false, true); return; }
      if (e.key === 'Tab') {   /* 메뉴가 열린 동안 포커스가 뒤쪽 페이지로 새지 않게 */
        var items = [burger].concat($$('a[href], button', mnav)).filter(function (el) { return el.offsetParent !== null; });
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    d.addEventListener('click', function (e) {
      if (isOpen() && !mnav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960 && isOpen()) setMenu(false); });
  }
  function toggleAcc(item, open) {
    $$('.macc.open', mnav).forEach(function (o) {
      if (o !== item) { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); }
    });
    item.classList.toggle('open', open);
    $('button', item).setAttribute('aria-expanded', open);
  }
  $$('.macc>button').forEach(function (btn, i) {
    var ul = btn.nextElementSibling;
    if (ul) { ul.id = ul.id || 'macc-' + i; btn.setAttribute('aria-controls', ul.id); }
    btn.addEventListener('click', function () { toggleAcc(btn.parentElement, !btn.parentElement.classList.contains('open')); });
  });

  /* ── 4. 데스크톱 드롭다운: 키보드 · Esc · 터치 첫 탭 펼치기 ── */
  var tops = $$('.gnb>li');
  function topLink(li) { return li.querySelector(':scope>a'); }
  function subLinks(li) { return $$('.sub a', li); }
  tops.forEach(function (li, idx) {
    var a = topLink(li);
    li.addEventListener('mouseenter', function () { li.classList.remove('dismissed'); });
    li.addEventListener('mouseleave', function () { li.classList.remove('dismissed'); });
    li.addEventListener('focusin', function () { li.classList.remove('dismissed'); });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) li.classList.remove('dismissed'); });
    li.addEventListener('keydown', function (e) {
      var links = subLinks(li), cur = links.indexOf(d.activeElement), k = e.key, t;
      if (k === 'Escape') { a.focus(); li.classList.add('dismissed'); e.preventDefault(); }
      else if (k === 'ArrowDown' && links.length) { e.preventDefault(); links[(cur + 1) % links.length].focus(); }
      else if (k === 'ArrowUp' && links.length) { e.preventDefault(); (cur <= 0 ? links[links.length - 1] : links[cur - 1]).focus(); }
      else if (k === 'ArrowRight') { t = tops[(idx + 1) % tops.length]; if (t) { e.preventDefault(); topLink(t).focus(); } }
      else if (k === 'ArrowLeft') { t = tops[(idx - 1 + tops.length) % tops.length]; if (t) { e.preventDefault(); topLink(t).focus(); } }
      else if (k === 'Home' && links.length && cur >= 0) { e.preventDefault(); links[0].focus(); }
      else if (k === 'End' && links.length && cur >= 0) { e.preventDefault(); links[links.length - 1].focus(); }
    });
    /* 터치 기기(태블릿): 첫 탭은 하위 메뉴만 펼치고, 같은 항목을 한 번 더 누르면 이동 */
    a.addEventListener('click', function (e) {
      if (touchMq.matches && li.querySelector('.sub') && !li.classList.contains('touched')) {
        e.preventDefault();
        tops.forEach(function (o) { o.classList.remove('touched'); });
        li.classList.add('touched');
      }
    });
  });
  d.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('.gnb')) tops.forEach(function (o) { o.classList.remove('touched'); });
  });

  /* ── 5. 스크롤 리빌 — 첫 화면 밖의 요소만, 늦게 뜨지 않도록 짧게 ── */
  var revealSel = [
    '.sec-title', '.prose', '.side', '.vals .val', '.prods .prod', '.pf .item', '.steps li', '.pintro li',
    '.linklist li', '.tl li', '.news li', '.tbl-wrap', '.form', '.faq', '.tabs', '.filter', '.dl', '.stat',
    '.case-head', '.case-story', '.case-photos .ph', '.two>*', '.two-3>*', '.sec>.wrap>.ph', '.mission', '.letter', '.portrait', '.next .wrap'
  ].join(',');
  function initReveal() {
    if (reduceMq.matches || !('IntersectionObserver' in window)) return;
    var vh = window.innerHeight, targets = [];
    $$(revealSel, d.querySelector('main')).forEach(function (el) {
      if (el.closest('.hero, .page-hero, [data-reveal]')) return;               /* 이미 표시되는 영역·중첩 방지 */
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) return;                             /* 첫 화면은 그대로 */
      targets.push(el);
    });
    /* 같은 부모 안에서의 순서로 70ms씩 시차 */
    targets.forEach(function (el) {
      var n = 0, s = el.previousElementSibling;
      while (s) { if (targets.indexOf(s) > -1) n++; s = s.previousElementSibling; }
      el.style.setProperty('--i', Math.min(n, 5));
      el.setAttribute('data-reveal', '');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    /* 안전장치: 관찰이 어떤 이유로 실패해도 4초 뒤에는 모두 표시 */
    window.setTimeout(function () {
      $$('[data-reveal]:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 4000);
  }
  initReveal();
  reduceMq.addEventListener && reduceMq.addEventListener('change', function () {
    if (reduceMq.matches) $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  });

  /* ── 6. FAQ 아코디언 · 탭/필터 ── */
  $$('.faq>li>button').forEach(function (b, i) {
    var panel = b.nextElementSibling;
    if (panel) { panel.id = panel.id || 'faq-a-' + i; b.setAttribute('aria-controls', panel.id); }
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', function () {
      var open = b.parentElement.classList.toggle('open');
      b.setAttribute('aria-expanded', open);
    });
  });
  $$('[data-tabs]').forEach(function (t) {
    var target = $(t.getAttribute('data-tabs'));
    if (!target) return;
    $$('button', t).forEach(function (b) {
      b.setAttribute('aria-pressed', b.classList.contains('on'));
      b.addEventListener('click', function () {
        $$('button', t).forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        var f = b.getAttribute('data-f');
        $$('[data-cat]', target).forEach(function (li) { li.classList.toggle('hide', f !== 'all' && li.getAttribute('data-cat') !== f); });
      });
    });
  });

  /* ── 7. 문의 폼: 필수 항목 확인 후, 백엔드 연결 전까지 메일 앱으로 전달 (기존 동작 유지) ── */
  var cf = $('#contactForm');
  if (cf) {
    cf.addEventListener('invalid', function (e) { e.target.setAttribute('aria-invalid', 'true'); }, true);
    cf.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); });
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!cf.reportValidity()) return;
      var data = new FormData(cf), lines = [];
      data.forEach(function (v, k) { if (k !== 'files' && k !== 'agree') lines.push(k + ': ' + v); });
      location.href = 'mailto:5000220@daum.net?subject=' + encodeURIComponent('[홈페이지 문의] ' + (data.get('type') || '')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
