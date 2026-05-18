const IS_DESKTOP = () => window.innerWidth >= 769;

// ── Scroll reveal ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── 햄버거 (모바일) ──
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

// ── 페이지 네비게이션 ──
const pagesEl    = document.getElementById('pages');
const sections   = Array.from(pagesEl.querySelectorAll(':scope > section'));
const prevBtn    = document.getElementById('pgPrev');
const nextBtn    = document.getElementById('pgNext');
const sectionIds = sections.map(s => s.id);

let currentIdx = 0;

function activateReveals(section) {
  section.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

function goTo(idx) {
  currentIdx = Math.max(0, Math.min(idx, sections.length - 1));
  if (IS_DESKTOP()) {
    // 데스크탑: 가로 스크롤
    pagesEl.scrollTo({ left: currentIdx * pagesEl.clientWidth, behavior: 'smooth' });
  } else {
    // 모바일: 세로 스크롤
    sections[currentIdx].scrollIntoView({ behavior: 'smooth' });
  }
  activateReveals(sections[currentIdx]);
  syncUI();
}

function syncUI() {
  prevBtn.disabled = currentIdx === 0;
  nextBtn.disabled = currentIdx === sections.length - 1;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + sectionIds[currentIdx]);
  });
}

prevBtn.addEventListener('click', () => goTo(currentIdx - 1));
nextBtn.addEventListener('click', () => goTo(currentIdx + 1));

// 키보드 좌우 화살표 (데스크탑 전용)
document.addEventListener('keydown', e => {
  if (!IS_DESKTOP()) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentIdx + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(currentIdx - 1);
});

// 데스크탑: 가로 스크롤로 현재 페이지 감지
const snapObs = new IntersectionObserver((entries) => {
  if (!IS_DESKTOP()) return;
  entries.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio >= 0.5) {
      currentIdx = sections.indexOf(e.target);
      syncUI();
      activateReveals(e.target);
    }
  });
}, { root: pagesEl, threshold: 0.5 });
sections.forEach(s => snapObs.observe(s));

// nav 링크 클릭 → 해당 섹션으로 이동
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const idx = sectionIds.indexOf(a.getAttribute('href').replace('#', ''));
    if (idx >= 0) {
      e.preventDefault();
      goTo(idx);
    }
  });
});

// 모바일: 세로 스크롤로 active 링크 동기화
const mobileObs = new IntersectionObserver((entries) => {
  if (IS_DESKTOP()) return;
  entries.forEach(e => {
    if (e.isIntersecting) {
      currentIdx = sections.indexOf(e.target);
      syncUI();
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => mobileObs.observe(s));

syncUI();
