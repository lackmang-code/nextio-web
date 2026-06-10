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

// ── 협력제안 게시판 폼 ──
(function () {
  const form   = document.getElementById('boardForm');
  const btn    = document.getElementById('bf-btn');
  const privCh = document.getElementById('bf-priv-chk');
  const subj   = document.getElementById('bf-subject');
  const titleI = document.getElementById('bf-title');
  const done   = document.getElementById('boardDone');
  const again  = document.getElementById('bd-again-btn');
  if (!form) return;

  again.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    form.reset();
    btn.textContent = '게시하기 →';
    btn.disabled = false;
  });

  // ▶ EmailJS 설정값 (emailjs.com 에서 발급)
  const EJS = {
    serviceId:  'service_d3dgl6d',
    templateId: 'template_rlsvr49',
    publicKey:  '-hkY5jZrgHffSGU2d'
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isPriv   = privCh.checked;
    const title    = titleI.value.trim() || '제목 없음';
    subj.value = (isPriv ? '[비공개] ' : '') + '문의: ' + title;

    // 자동답장용 값 미리 저장
    const toEmail = form.querySelector('[name="email"]').value;
    const toName  = form.querySelector('[name="name"]').value || '고객';
    const toMsg   = form.querySelector('[name="message"]').value;

    btn.textContent = '전송 중...';
    btn.disabled = true;

    try {
      const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
      const json = await res.json();
      if (json.success) {
        // 자동답장 (EmailJS) — 실패해도 메인 접수는 이미 완료
        emailjs.send(EJS.serviceId, EJS.templateId, {
          to_email: toEmail,
          to_name:  toName,
          inq_title: title,
          inq_body:  toMsg
        }, EJS.publicKey).catch(() => {});

        form.hidden = true;
        done.hidden = false;
      } else {
        btn.textContent = '오류 — 다시 시도';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = '전송 실패 — 다시 시도';
      btn.disabled = false;
    }
  });
})();

// ── 히어로 섹션 AI 뉴럴 네트워크 캔버스 애니메이션 ──
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');
  const consoleWrap = hero.querySelector('.hero-console-wrap');
  
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let animationId = null;
  let isMobile = window.innerWidth < 769;
  let maxParticles = isMobile ? 25 : 65;
  let connectionDist = 110;
  
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
      
      // 화면 경계 체크
      if (this.x < 0 || this.x > hero.clientWidth) this.vx = -this.vx;
      if (this.y < 0 || this.y > hero.clientHeight) this.vy = -this.vy;

      // 마우스 반발력 (슬쩍 밀어내는 느낌)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 144, 217, 0.75)';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(74, 144, 217, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      
      // 마우스와 파티클 연결
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(74, 144, 217, ${alpha})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
    
    // 마우스 주변에 은은한 블루 그라데이션 글로우 효과
    drawBackgroundGrid();

    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawLines();
    animationId = requestAnimationFrame(animate);
  }

  function drawBackgroundGrid() {
    if (mouse.x !== null && mouse.y !== null) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
      grad.addColorStop(0, 'rgba(74, 144, 217, 0.04)');
      grad.addColorStop(1, 'rgba(74, 144, 217, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 이벤트 리스너 (3D 마우스 틸트 연동)
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    if (consoleWrap && window.innerWidth >= 769) {
      const consoleRect = consoleWrap.getBoundingClientRect();
      const cardX = e.clientX - (consoleRect.left + consoleRect.width / 2);
      const cardY = e.clientY - (consoleRect.top + consoleRect.height / 2);
      
      const maxTilt = 5; // Max tilt angle in degrees for console
      const tiltX = (cardY / (consoleRect.height / 2)) * -maxTilt;
      const tiltY = (cardX / (consoleRect.width / 2)) * maxTilt;
      
      consoleWrap.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
    }
  });
  
  hero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    if (consoleWrap) {
      consoleWrap.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  });

  // ── AI 에이전트 시뮬레이션 동작 엔진 ──
  const consoleTabs = hero.querySelectorAll('.console-tab');
  const tabContents = hero.querySelectorAll('.console-tab-content');
  const logContainer = hero.querySelector('#terminal-logs');
  const btnUnicorn = hero.querySelector('#btn-run-unicorn');
  const btnResearch = hero.querySelector('#btn-run-research');
  const placeholder = hero.querySelector('#result-placeholder');
  const previewUnicorn = hero.querySelector('#preview-unicorn');
  const previewResearch = hero.querySelector('#preview-research');

  const agentNodes = {
    ceo: hero.querySelector('#node-ceo'),
    cfo: hero.querySelector('#node-cfo'),
    pr: hero.querySelector('#node-pr'),
    dev: hero.querySelector('#node-dev'),
    res: hero.querySelector('#node-res')
  };

  const agentLinks = {
    cfo: hero.querySelector('#link-ceo-cfo'),
    pr: hero.querySelector('#link-ceo-pr'),
    dev: hero.querySelector('#link-ceo-dev'),
    res: hero.querySelector('#link-ceo-res')
  };

  function switchTab(tabId) {
    consoleTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    tabContents.forEach(content => content.classList.toggle('active', content.id === `tab-${tabId}`));
  }

  consoleTabs.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  function addLog(text, type = 'system') {
    const p = document.createElement('div');
    p.className = `log-line ${type}`;
    p.textContent = text;
    logContainer.appendChild(p);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function resetSimulation() {
    logContainer.innerHTML = '';
    Object.values(agentNodes).forEach(n => n.classList.remove('active'));
    Object.values(agentLinks).forEach(l => l.classList.remove('active'));
    placeholder.style.display = 'flex';
    previewUnicorn.style.display = 'none';
    previewResearch.style.display = 'none';
  }

  let running = false;

  async function playSimulation(scenario) {
    if (running) return;
    running = true;
    btnUnicorn.disabled = true;
    btnResearch.disabled = true;

    resetSimulation();
    switchTab('terminal');

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    if (scenario === 'unicorn') {
      addLog('> nextio create-unicorn-team --name "My Startup"', 'cmd');
      await sleep(600);
      
      addLog('[system] AI 오케스트레이터 가동...', 'system');
      agentNodes.ceo.classList.add('active');
      await sleep(500);

      addLog('[CEO] 1인 기업 창업 파이프라인 가동. 부서별 에이전트 모집...', 'ceo');
      await sleep(600);

      addLog('[CFO] 재무팀 에이전트 온보딩 완료. 초기 예산 및 수수료 수립 시작.', 'cfo');
      agentNodes.cfo.classList.add('active');
      agentLinks.cfo.classList.add('active');
      await sleep(700);

      addLog('[PR] 홍보 에이전트 기상. 공식 도메인 CNAME 설정 및 마케팅 카피 작성 시작.', 'pr');
      agentNodes.pr.classList.add('active');
      agentLinks.pr.classList.add('active');
      await sleep(700);

      addLog('[DEV] 개발 에이전트 가동. Next.js 템플릿 로드 및 HTML/CSS 구조 설계.', 'dev');
      agentNodes.dev.classList.add('active');
      agentLinks.dev.classList.add('active');
      await sleep(800);

      addLog('[CFO] 호서대 RISE 위탁교육 견적 및 비용 최적화 산출 완료.', 'cfo');
      await sleep(500);
      addLog('[PR] www.nextio.ai.kr 홈페이지의 신규 대표 프로그램 2종 정보 갱신.', 'pr');
      await sleep(500);
      addLog('[DEV] 6개 컴포넌트 마크업 병합 완료. 로컬 서버 테스트 통과.', 'dev');
      await sleep(600);

      addLog('[system] 에이전트 맵 모니터링: 데이터 흐름 교환 및 최적화 중...', 'system');
      await sleep(400);
      switchTab('agents');
      await sleep(2000);

      switchTab('terminal');
      addLog('[DEV] GitHub Pages로 최종 마스터 빌드 푸시 완료.', 'dev');
      await sleep(600);
      addLog('[system] 배포 완료! HTTPS 인증 및 HSTS 보안 활성화.', 'system');
      await sleep(500);
      addLog('[CEO] 전 부서 에이전트 협업 성공. 1인 유니콘 창업 웹사이트 빌드를 성공적으로 마쳤습니다.', 'ceo');
      await sleep(600);
      addLog('➔ 배포 주소: www.my-unicorn-startup.ai', 'success');
      await sleep(500);

      switchTab('result');
      placeholder.style.display = 'none';
      previewUnicorn.style.display = 'flex';

    } else if (scenario === 'research') {
      addLog('> nextio research-paper --topic "OLED Sensor AI Pipeline"', 'cmd');
      await sleep(600);

      addLog('[system] AI 연구 파이프라인 가동...', 'system');
      agentNodes.ceo.classList.add('active');
      await sleep(500);

      addLog('[CEO] 학술 연구 분석 태스크 생성. 관련 부서 배치 시작.', 'ceo');
      await sleep(600);

      addLog('[RES] 학술 연구 에이전트 온보딩. Europe PMC 및 arXiv 데이터베이스 연결.', 'res');
      agentNodes.res.classList.add('active');
      agentLinks.res.classList.add('active');
      await sleep(800);

      addLog('[RES] "OLED Sensor" 키워드 기반 최근 1개월 preprints 12건 발견.', 'res');
      await sleep(600);
      addLog('[RES] 데이터 병렬 속독 및 초안 요약 알고리즘 분석 진행 중...', 'res');
      await sleep(700);

      addLog('[CFO] 연구 개발비 및 성과 지표 가중치 환산 데이터 검토.', 'cfo');
      agentNodes.cfo.classList.add('active');
      agentLinks.cfo.classList.add('active');
      await sleep(600);

      addLog('[DEV] 분석 데이터 시각화. SVG 기반 차트 렌더링 코드 생성 시작.', 'dev');
      agentNodes.dev.classList.add('active');
      agentLinks.dev.classList.add('active');
      await sleep(700);

      addLog('[RES] 학술 논문 국문 번역 및 논문 초안 DOCX 자동 생성 완료.', 'res');
      await sleep(500);
      addLog('[DEV] 2024~2026 연도별 논문 동향 분석 차트 컴파일 완료.', 'dev');
      await sleep(500);

      addLog('[system] 에이전트 맵 모니터링: 학술 데이터 상호 교차 검증 중...', 'system');
      await sleep(400);
      switchTab('agents');
      await sleep(2000);

      switchTab('terminal');
      addLog('[CEO] 학술 연구 자동 요약 및 연도별 분석 파이프라인 완료.', 'ceo');
      await sleep(600);
      addLog('➔ 요약 보고서 빌드 성공: OLED_Sensor_AI_Report_v1.pdf', 'success');
      await sleep(500);

      switchTab('result');
      placeholder.style.display = 'none';
      previewResearch.style.display = 'flex';
    }

    btnUnicorn.disabled = false;
    btnResearch.disabled = false;
    running = false;
  }

  btnUnicorn.addEventListener('click', () => playSimulation('unicorn'));
  btnResearch.addEventListener('click', () => playSimulation('research'));

  window.addEventListener('resize', resize);
  
  // IntersectionObserver로 화면에 보일 때만 렌더링 루프 실행 (배터리/리소스 최적화)
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!animationId) {
          resize();
          animate();
        }
      } else {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    });
  }, { threshold: 0.05 });
  obs.observe(hero);
})();
