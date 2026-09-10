(function(){
  var header=document.getElementById('header'),burger=document.getElementById('burger'),mnav=document.getElementById('mnav');
  function onScroll(){ if(!header.classList.contains('open')) header.classList.toggle('solid', window.scrollY>40); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  burger.addEventListener('click',function(){
    var open=!mnav.classList.contains('open');
    mnav.classList.toggle('open',open); header.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open); burger.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
    document.body.style.overflow=open?'hidden':''; if(!open) onScroll();
  });
  document.querySelectorAll('.macc>button').forEach(function(btn){
    btn.addEventListener('click',function(){
      var item=btn.parentElement,open=!item.classList.contains('open');
      document.querySelectorAll('.macc.open').forEach(function(o){o.classList.remove('open');o.querySelector('button').setAttribute('aria-expanded','false');});
      item.classList.toggle('open',open); btn.setAttribute('aria-expanded',open);
    });
  });
  window.addEventListener('resize',function(){ if(window.innerWidth>960 && mnav.classList.contains('open')) burger.click(); });
  // 데스크톱 드롭다운: 키보드 접근 시 하위 메뉴 유지, 터치 시 첫 탭은 펼치기
  document.addEventListener('touchstart',function(e){ if(!e.target.closest('.gnb')) document.querySelectorAll('.gnb>li.touched').forEach(function(o){o.classList.remove('touched');o.querySelector('.sub').style.cssText='';}); },{passive:true});
  document.querySelectorAll('.gnb>li>a').forEach(function(a){
    a.addEventListener('touchstart',function(e){
      var li=a.parentElement; if(!li.classList.contains('touched')){ e.preventDefault(); document.querySelectorAll('.gnb>li.touched').forEach(function(o){o.classList.remove('touched')}); li.classList.add('touched'); li.querySelector('.sub').style.cssText='opacity:1;visibility:visible;transform:translate(-50%,0)'; }
    },{passive:false});
  });
})();

// 서브페이지: 헤더 항상 흰색
if(document.body.classList.contains('subpage')){ document.getElementById('header').classList.add('solid','sub-page'); }
// FAQ 아코디언 + 탭
document.querySelectorAll('.faq>li>button').forEach(function(b){ b.addEventListener('click',function(){ b.parentElement.classList.toggle('open'); }); });
document.querySelectorAll('[data-tabs]').forEach(function(t){
  var target=document.querySelector(t.getAttribute('data-tabs'));
  t.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){
    t.querySelectorAll('button').forEach(function(o){o.classList.remove('on')}); b.classList.add('on');
    var f=b.getAttribute('data-f'); target.querySelectorAll('[data-cat]').forEach(function(li){ li.classList.toggle('hide', f!=='all' && li.getAttribute('data-cat')!==f); });
  }); });
});
// 문의 폼: 백엔드 연결 전까지 메일 앱으로 전달
var cf=document.getElementById('contactForm');
if(cf){ cf.addEventListener('submit',function(e){
  e.preventDefault(); var d=new FormData(cf), L=[];
  d.forEach(function(v,k){ if(k!=='files' && k!=='agree') L.push(k+': '+v); });
  location.href='mailto:5000220@daum.net?subject='+encodeURIComponent('[홈페이지 문의] '+(d.get('type')||''))+'&body='+encodeURIComponent(L.join('\n'));
}); }
