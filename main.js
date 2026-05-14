const IS_DESKTOP = () => window.innerWidth >= 769;

// ── Scroll reveal ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Hamburger (mobile) ──
const hamburger = document.querySelector('.hamburger');
const drawer    = document.getElementById('mobDrawer');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  drawer.classList.toggle('open');
});
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open');
  drawer.classList.remove('open');
}));

// ── 카운트업 ──
let counted = false;
const statsEl = document.querySelector('.pg-stats');
const countObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseInt(el.dataset.count), suffix = el.dataset.suffix || '', dur = 1800;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1-p, 3)) * end) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
}, { threshold: 0.3 });
if (statsEl) countObs.observe(statsEl);

// ── PC 가로 페이지 전환 ──
const pagesEl  = document.getElementById('pages');
const sections = Array.from(pagesEl.querySelectorAll(':scope > section'));
const dotsWrap = document.getElementById('pgDots');
const prevBtn  = document.getElementById('pgPrev');
const nextBtn  = document.getElementById('pgNext');
const sectionIds = sections.map(s => s.id);

let currentIdx = 0;

// 점 생성
sections.forEach((s, i) => {
  const btn = document.createElement('button');
  btn.className = 'pg-dot' + (i === 0 ? ' active' : '');
  btn.setAttribute('aria-label', s.id);
  btn.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(btn);
});

function goTo(idx) {
  if (!IS_DESKTOP()) return;
  currentIdx = Math.max(0, Math.min(idx, sections.length - 1));
  sections[currentIdx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  syncUI();
}

function syncUI() {
  document.querySelectorAll('.pg-dot').forEach((d, i) => d.classList.toggle('active', i === currentIdx));
  prevBtn.disabled = currentIdx === 0;
  nextBtn.disabled = currentIdx === sections.length - 1;
  // nav 링크 active 표시
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('active', href === sectionIds[currentIdx]);
  });
}

prevBtn.addEventListener('click', () => goTo(currentIdx - 1));
nextBtn.addEventListener('click', () => goTo(currentIdx + 1));

// 키보드 좌우 화살표
document.addEventListener('keydown', e => {
  if (!IS_DESKTOP()) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  goTo(currentIdx + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    goTo(currentIdx - 1);
});

// 스크롤로 현재 페이지 감지 (dots/nav 동기화)
const snapObs = new IntersectionObserver((entries) => {
  if (!IS_DESKTOP()) return;
  entries.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio >= 0.5) {
      currentIdx = sections.indexOf(e.target);
      syncUI();
      // 카운트업 트리거
      if (e.target.id === 'stats' && !counted) countObs.disconnect();
    }
  });
}, { root: pagesEl, threshold: 0.5 });
sections.forEach(s => snapObs.observe(s));

// nav 링크 클릭 → 해당 섹션으로 이동
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const targetId = a.getAttribute('href').replace('#', '');
    const idx = sectionIds.indexOf(targetId);
    if (IS_DESKTOP() && idx >= 0) {
      e.preventDefault();
      goTo(idx);
    }
  });
});

// 모바일: 일반 세로 스크롤 active 링크
const mobileObs = new IntersectionObserver((entries) => {
  if (IS_DESKTOP()) return;
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => mobileObs.observe(s));

// 초기 상태
syncUI();
