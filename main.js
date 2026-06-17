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
    pagesEl.scrollTo({ left: currentIdx * pagesEl.clientWidth, behavior: 'smooth' });
  } else {
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

// 창 크기 변경 시 현재 섹션 위치로 가로 스크롤 재보정 (resize 핸들러 부재로 엉뚱한 섹션으로 튕기는 버그 수정)
let resizeRaf = null;
window.addEventListener('resize', () => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = null;
    if (IS_DESKTOP()) pagesEl.scrollLeft = currentIdx * pagesEl.clientWidth;
  });
});

document.addEventListener('keydown', e => {
  if (!IS_DESKTOP()) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentIdx + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(currentIdx - 1);
});

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

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const idx = sectionIds.indexOf(a.getAttribute('href').replace('#', ''));
    if (idx >= 0) {
      e.preventDefault();
      goTo(idx);
    }
  });
});

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

// ── 협력제안 게시판 폼 (Google Forms 백엔드) ──
(function () {
  const form   = document.getElementById('boardForm');
  const btn    = document.getElementById('bf-btn');
  const titleI = document.getElementById('bf-title');
  const done   = document.getElementById('boardDone');
  const again  = document.getElementById('bd-again-btn');
  if (!form) return;

  const GF_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeKenhxndfa-ABL8X9gIDL1VvNdYS6DBNIieSPI5xlI96ZqXw/formResponse';
  const GF = {
    name:    'entry.2005620554',
    email:   'entry.1045781291',
    org:     'entry.1065046570',
    title:   'entry.1166974658',
    message: 'entry.839337160'
  };

  again.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    form.reset();
    btn.textContent = '게시하기 →';
    btn.disabled = false;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = titleI.value.trim() || '제목 없음';

    const body = new URLSearchParams();
    body.append(GF.name,    form.querySelector('[name="name"]').value);
    body.append(GF.email,   form.querySelector('[name="email"]').value);
    body.append(GF.org,     form.querySelector('[name="organization"]').value);
    body.append(GF.title,   title);
    body.append(GF.message, form.querySelector('[name="message"]').value);

    btn.textContent = '전송 중...';
    btn.disabled = true;

    // 히든 iframe으로 구글폼 제출 (fetch no-cors 대체)
    const iframe = document.createElement('iframe');
    iframe.name = 'gf-target';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const gfForm = document.createElement('form');
    gfForm.method = 'POST';
    gfForm.action = GF_URL;
    gfForm.target = 'gf-target';

    const fbzx = Math.floor(Math.random() * 9e18) * -1;
    const fields = [
      [GF.name,    form.querySelector('[name="name"]').value],
      [GF.email,   form.querySelector('[name="email"]').value],
      [GF.org,     form.querySelector('[name="organization"]').value],
      [GF.title,   title],
      [GF.message, form.querySelector('[name="message"]').value],
      ['fvv',              '1'],
      ['pageHistory',      '0'],
      ['fbzx',             String(fbzx)],
      ['partialResponse',  `[null,null,"${fbzx}"]`],
      ['submissionTimestamp', '-1']
    ];
    fields.forEach(([n, v]) => {
      const inp = document.createElement('input');
      inp.type = 'hidden'; inp.name = n; inp.value = v;
      gfForm.appendChild(inp);
    });

    document.body.appendChild(gfForm);
    gfForm.submit();

    setTimeout(() => {
      document.body.removeChild(iframe);
      document.body.removeChild(gfForm);
    }, 3000);

    form.hidden = true;
    done.hidden = false;
  });
})();

// ── 히어로 배경 파티클 캔버스 ──
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');

  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let animationId = null;
  let isMobile = window.innerWidth < 769;
  let maxParticles = isMobile ? 60 : 150;
  const connectionDist = 110;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = hero.clientWidth * dpr;
    canvas.height = hero.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    isMobile = window.innerWidth < 769;
    maxParticles = isMobile ? 25 : 65;
    initParticles();
  }

  class Particle {
    constructor() {
      this.x = Math.random() * hero.clientWidth;
      this.y = Math.random() * hero.clientHeight;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > hero.clientWidth)  this.vx = -this.vx;
      if (this.y < 0 || this.y > hero.clientHeight) this.vy = -this.vy;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }
    }
    draw() {
      const r = this.radius, x = this.x, y = this.y;
      const inner = r * 0.38;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI / 4) - Math.PI / 2;
        const cr = i % 2 === 0 ? r : inner;
        i === 0 ? ctx.moveTo(x + Math.cos(ang)*cr, y + Math.sin(ang)*cr)
                : ctx.lineTo(x + Math.cos(ang)*cr, y + Math.sin(ang)*cr);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / connectionDist) * 0.22})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x, dy = particles[i].y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / mouse.radius) * 0.35})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }
    }
  }

  function drawBackgroundGrid() {
    if (mouse.x !== null && mouse.y !== null) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.04)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
    drawBackgroundGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animationId = requestAnimationFrame(animate);
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!animationId) { resize(); animate(); }
      } else {
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
      }
    });
  }, { threshold: 0.05 });
  obs.observe(hero);
})();

// ── I/O 플로우 캔버스 애니메이션 ──
(function initIOFlow() {
  const stage  = document.querySelector('.io-stage');
  const canvas = document.getElementById('io-flow-canvas');
  if (!canvas || !stage) return;

  const ctx = canvas.getContext('2d');
  let paths = [], dots = [], rafId;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = stage.clientWidth, h = stage.clientHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    buildPaths();
  }

  function buildPaths() {
    paths = []; dots = [];
    const sr = stage.getBoundingClientRect();
    const markEl = stage.querySelector('.io-mark-wrap');
    if (!markEl) return;
    const mr = markEl.getBoundingClientRect();
    const cx = mr.left - sr.left + mr.width  / 2;
    const cy = mr.top  - sr.top  + mr.height / 2;

    stage.querySelectorAll('.io-in .io-chip').forEach(chip => {
      const r = chip.getBoundingClientRect();
      paths.push({ x1: r.right - sr.left, y1: r.top - sr.top + r.height / 2, x2: cx, y2: cy, color: '111,168,255' });
    });
    stage.querySelectorAll('.io-out .io-chip').forEach(chip => {
      const r = chip.getBoundingClientRect();
      paths.push({ x1: cx, y1: cy, x2: r.left - sr.left, y2: r.top - sr.top + r.height / 2, color: '251,191,36' });
    });

    paths.forEach((p, i) => {
      for (let j = 0; j < 2; j++) {
        dots.push({
          pi: i,
          t:  (j * 0.5 + i * 0.13) % 1,
          speed: 0.003 + (i % 3) * 0.0005,
          size:  2.2 + (j % 2) * 0.9
        });
      }
    });
  }

  function bezierPt(p, t) {
    const cp1x = p.x1 + (p.x2 - p.x1) * 0.45, cp1y = p.y1;
    const cp2x = p.x1 + (p.x2 - p.x1) * 0.55, cp2y = p.y2;
    const u = 1 - t;
    return {
      x: u*u*u*p.x1 + 3*u*u*t*cp1x + 3*u*t*t*cp2x + t*t*t*p.x2,
      y: u*u*u*p.y1 + 3*u*u*t*cp1y + 3*u*t*t*cp2y + t*t*t*p.y2
    };
  }

  function draw() {
    const w = stage.clientWidth, h = stage.clientHeight;
    ctx.clearRect(0, 0, w, h);

    paths.forEach(p => {
      const cp1x = p.x1 + (p.x2 - p.x1) * 0.45;
      const cp2x = p.x1 + (p.x2 - p.x1) * 0.55;
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.bezierCurveTo(cp1x, p.y1, cp2x, p.y2, p.x2, p.y2);
      ctx.strokeStyle = `rgba(${p.color},0.1)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    dots.forEach(d => {
      d.t = (d.t + d.speed) % 1;
      const p   = paths[d.pi];
      const pos = bezierPt(p, d.t);
      const alpha = Math.sin(d.t * Math.PI);

      const gr = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, d.size * 3.5);
      gr.addColorStop(0, `rgba(${p.color},${0.9 * alpha})`);
      gr.addColorStop(1, `rgba(${p.color},0)`);
      ctx.beginPath(); ctx.arc(pos.x, pos.y, d.size * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = gr; ctx.fill();

      ctx.beginPath(); ctx.arc(pos.x, pos.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${alpha})`; ctx.fill();
    });

    rafId = requestAnimationFrame(draw);
  }

  // 칩 fade-in 애니메이션 완료 후 경로 측정
  setTimeout(() => { resize(); draw(); }, 900);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    setTimeout(() => { resize(); draw(); }, 150);
  });
})();
