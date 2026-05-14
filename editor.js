/* ===================== EDITOR OVERLAY =====================
 * URL에 ?edit=1 이 있을 때만 활성화.
 * - 요소 클릭 → 선택
 * - 우측 패널에서 폰트/색상/위치/정렬/사이즈 등 슬라이더로 변경
 * - 텍스트 더블클릭 → 인라인 편집
 * - 이미지/박스: Alt+드래그 = 위치 이동, 우하단 핸들 = 크기 조절
 * - Ctrl+S = 저장(LocalStorage), Ctrl+E = 토글
 * - "내보내기" 버튼 → 모든 변경사항을 CSS 텍스트로 출력
 * =========================================================== */
(function(){
  if (!new URLSearchParams(location.search).has('edit')) return;

  const STORAGE_KEY = 'nextio-editor-overrides-v1';
  const TEXT_KEY    = 'nextio-editor-texts-v1';

  /* ---------- 저장된 override 불러와서 즉시 적용 ---------- */
  let overrides = {};
  let textOverrides = {};
  try { overrides = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(_){}
  try { textOverrides = JSON.parse(localStorage.getItem(TEXT_KEY) || '{}'); } catch(_){}

  function selectorFor(el) {
    // 안정적인 셀렉터 생성: id > data-ed-id > 경로
    if (el.id && document.querySelectorAll('#'+CSS.escape(el.id)).length === 1) return '#'+el.id;
    if (el.dataset.edId) return '[data-ed-id="'+el.dataset.edId+'"]';
    // 자동 부여
    const id = 'ed-' + Math.random().toString(36).slice(2, 8);
    el.dataset.edId = id;
    return '[data-ed-id="'+id+'"]';
  }
  function applyOverride(sel, props) {
    document.querySelectorAll(sel).forEach(el => {
      Object.entries(props).forEach(([k, v]) => {
        if (v === '' || v == null) el.style.removeProperty(k);
        else el.style.setProperty(k, v, 'important');
      });
    });
  }
  function applyAllOverrides() {
    Object.entries(overrides).forEach(([sel, props]) => applyOverride(sel, props));
  }
  function applyAllTexts() {
    Object.entries(textOverrides).forEach(([sel, html]) => {
      document.querySelectorAll(sel).forEach(el => { el.innerHTML = html; });
    });
  }

  /* ---------- 편집 모드 토글 ---------- */
  let active = false;
  let selected = null;
  let editingText = null;

  /* ---------- UI 생성 ---------- */
  function buildUI() {
    const bar = document.createElement('div');
    bar.id = 'edBar';
    bar.innerHTML = `
      <b>✏️ EDITOR</b>
      <span class="ed-sel">요소를 클릭하세요</span>
      <button id="edUndo" title="선택 요소 변경 초기화">↺ 선택 초기화</button>
      <button id="edExportCss" class="primary">CSS 내보내기</button>
      <button id="edExportHtml">텍스트 내보내기</button>
      <button id="edResetAll" class="danger">전체 초기화</button>
      <button id="edOff">편집 끄기</button>
    `;
    document.body.appendChild(bar);

    const panel = document.createElement('div');
    panel.id = 'edPanel';
    panel.className = 'empty';
    document.body.appendChild(panel);

    const hint = document.createElement('div');
    hint.id = 'edHint';
    hint.textContent = 'PC 가로 페이지: ← → 키로 이동 · 텍스트 더블클릭 = 편집 · Alt+드래그 = 이동 · ESC = 선택해제';
    document.body.appendChild(hint);

    document.getElementById('edOff').addEventListener('click', () => {
      const u = new URL(location);
      u.searchParams.delete('edit');
      location.href = u.toString();
    });
    document.getElementById('edExportCss').addEventListener('click', exportCSS);
    document.getElementById('edExportHtml').addEventListener('click', exportTexts);
    document.getElementById('edResetAll').addEventListener('click', resetAll);
    document.getElementById('edUndo').addEventListener('click', undoSelected);
  }

  function setSelected(el) {
    if (selected) selected.classList.remove('ed-selected');
    if (editingText && editingText !== el) {
      editingText.contentEditable = 'false';
      saveText(editingText);
      editingText = null;
    }
    selected = el;
    if (!el) {
      document.querySelector('#edBar .ed-sel').textContent = '요소를 클릭하세요';
      document.getElementById('edPanel').className = 'empty';
      return;
    }
    el.classList.add('ed-selected');
    const sel = selectorFor(el);
    document.querySelector('#edBar .ed-sel').textContent = sel + '   <' + el.tagName.toLowerCase() + '>';
    buildPanel(el, sel);
  }

  /* ---------- 속성 패널 구성 ---------- */
  function rowRange(label, val, min, max, step, unit, onChange) {
    const row = document.createElement('div'); row.className = 'ed-row';
    row.innerHTML = `<label>${label}</label>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${val}">
      <span class="ed-val">${val}${unit}</span>`;
    const r = row.querySelector('input');
    const v = row.querySelector('.ed-val');
    r.addEventListener('input', () => {
      v.textContent = r.value + unit;
      onChange(r.value + unit);
    });
    return row;
  }
  function rowSelect(label, val, options, onChange) {
    const row = document.createElement('div'); row.className = 'ed-row';
    const opts = options.map(o => `<option value="${o.v}" ${o.v===val?'selected':''}>${o.l}</option>`).join('');
    row.innerHTML = `<label>${label}</label><select>${opts}</select>`;
    row.querySelector('select').addEventListener('change', e => onChange(e.target.value));
    return row;
  }
  function rowColor(label, val, onChange) {
    const row = document.createElement('div'); row.className = 'ed-row';
    row.innerHTML = `<label>${label}</label>
      <input type="color" value="${val}">
      <input type="text" value="${val}">`;
    const cp = row.querySelectorAll('input')[0];
    const tx = row.querySelectorAll('input')[1];
    cp.addEventListener('input', () => { tx.value = cp.value; onChange(cp.value); });
    tx.addEventListener('change', () => { cp.value = tx.value; onChange(tx.value); });
    return row;
  }
  function rowBtnGroup(label, val, options, onChange) {
    const row = document.createElement('div'); row.className = 'ed-row';
    const grp = document.createElement('div'); grp.className = 'ed-btn-group';
    options.forEach(o => {
      const b = document.createElement('button');
      b.textContent = o.l; b.dataset.v = o.v;
      if (o.v === val) b.classList.add('on');
      b.addEventListener('click', () => {
        grp.querySelectorAll('button').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        onChange(o.v);
      });
      grp.appendChild(b);
    });
    row.innerHTML = `<label>${label}</label>`;
    row.appendChild(grp);
    return row;
  }

  function rgbToHex(rgb) {
    if (!rgb) return '#000000';
    if (rgb.startsWith('#')) return rgb;
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3) return '#000000';
    return '#' + m.slice(0,3).map(n => ('0'+parseInt(n).toString(16)).slice(-2)).join('');
  }

  function set(prop, val, el = selected) {
    if (!el) return;
    const sel = selectorFor(el);
    if (!overrides[sel]) overrides[sel] = {};
    overrides[sel][prop] = val;
    el.style.setProperty(prop, val, 'important');
    save();
  }

  function buildPanel(el, sel) {
    const panel = document.getElementById('edPanel');
    panel.className = '';
    const cs = getComputedStyle(el);
    const isImage = el.tagName === 'IMG';
    const fs = parseFloat(cs.fontSize) || 16;
    const fw = parseInt(cs.fontWeight) || 400;
    const lh = parseFloat(cs.lineHeight) || fs * 1.4;
    const ls = parseFloat(cs.letterSpacing) || 0;
    const color = rgbToHex(cs.color);

    // Parse transform translate
    let tx = 0, ty = 0;
    const tm = cs.transform && cs.transform !== 'none' ? cs.transform.match(/matrix\(([^)]+)\)/) : null;
    if (tm) {
      const parts = tm[1].split(',').map(s => parseFloat(s.trim()));
      tx = parts[4] || 0; ty = parts[5] || 0;
    }

    panel.innerHTML = `<h4>선택된 요소</h4><div class="ed-tag">${sel}<br>&lt;${el.tagName.toLowerCase()}&gt;</div>`;

    // ---------- 텍스트 그룹 ----------
    if (!isImage) {
      const g = document.createElement('div'); g.className = 'ed-group';
      g.innerHTML = '<div class="ed-group-title">텍스트 / 폰트</div>';
      g.appendChild(rowRange('크기(px)', fs.toFixed(0), 8, 200, 1, 'px', v => set('font-size', v)));
      g.appendChild(rowSelect('굵기', fw, [
        {v:'200',l:'200 가늘게'},{v:'300',l:'300'},{v:'400',l:'400 보통'},
        {v:'600',l:'600 진하게'},{v:'700',l:'700 굵게'},{v:'800',l:'800'},{v:'900',l:'900 매우굵게'}
      ], v => set('font-weight', v)));
      g.appendChild(rowRange('행간', (lh/fs).toFixed(2), 0.9, 2.5, 0.05, '', v => set('line-height', v)));
      g.appendChild(rowRange('자간(px)', ls.toFixed(1), -5, 10, 0.1, 'px', v => set('letter-spacing', v)));
      g.appendChild(rowColor('색상', color, v => set('color', v)));
      g.appendChild(rowBtnGroup('정렬', cs.textAlign, [
        {v:'left',l:'좌'},{v:'center',l:'중앙'},{v:'right',l:'우'},{v:'justify',l:'양쪽'}
      ], v => set('text-align', v)));
      panel.appendChild(g);

      const txtBtn = document.createElement('button');
      txtBtn.style.cssText = 'width:100%;margin-bottom:10px;padding:8px;background:#2BCE6B;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:600;font-size:12px;';
      txtBtn.textContent = '📝 텍스트 편집 시작 (Enter로 종료)';
      txtBtn.onclick = () => startTextEdit(el);
      panel.appendChild(txtBtn);
    }

    // ---------- 위치 그룹 ----------
    const gp = document.createElement('div'); gp.className = 'ed-group';
    gp.innerHTML = '<div class="ed-group-title">위치 (transform translate)</div>';
    gp.appendChild(rowRange('가로 X', tx, -400, 400, 1, 'px', v => {
      const cur = overrides[selectorFor(el)] || {};
      const yPart = cur['transform']?.match(/translateY\((-?\d+(\.\d+)?px)\)/)?.[1] || ty + 'px';
      set('transform', `translateX(${v}) translateY(${yPart})`);
    }));
    gp.appendChild(rowRange('세로 Y', ty, -400, 400, 1, 'px', v => {
      const cur = overrides[selectorFor(el)] || {};
      const xPart = cur['transform']?.match(/translateX\((-?\d+(\.\d+)?px)\)/)?.[1] || tx + 'px';
      set('transform', `translateX(${xPart}) translateY(${v})`);
    }));
    panel.appendChild(gp);

    // ---------- 박스 그룹 ----------
    const gb = document.createElement('div'); gb.className = 'ed-group';
    gb.innerHTML = '<div class="ed-group-title">여백 / 크기</div>';
    gb.appendChild(rowRange('위 여백', parseFloat(cs.marginTop)||0, -100, 200, 1, 'px', v => set('margin-top', v)));
    gb.appendChild(rowRange('아래 여백', parseFloat(cs.marginBottom)||0, -100, 200, 1, 'px', v => set('margin-bottom', v)));
    gb.appendChild(rowRange('안쪽 위', parseFloat(cs.paddingTop)||0, 0, 200, 1, 'px', v => set('padding-top', v)));
    gb.appendChild(rowRange('안쪽 아래', parseFloat(cs.paddingBottom)||0, 0, 200, 1, 'px', v => set('padding-bottom', v)));
    gb.appendChild(rowRange('안쪽 좌', parseFloat(cs.paddingLeft)||0, 0, 200, 1, 'px', v => set('padding-left', v)));
    gb.appendChild(rowRange('안쪽 우', parseFloat(cs.paddingRight)||0, 0, 200, 1, 'px', v => set('padding-right', v)));
    // 너비/높이: 모든 요소에서 조정 가능 (auto면 현재 측정값 시작점)
    const wNow = el.getBoundingClientRect().width;
    const hNow = el.getBoundingClientRect().height;
    gb.appendChild(rowRange('너비', wNow.toFixed(0), 20, 1600, 1, 'px', v => set('width', v)));
    gb.appendChild(rowRange('최대너비', wNow.toFixed(0), 100, 2000, 10, 'px', v => set('max-width', v)));
    gb.appendChild(rowRange('높이', hNow.toFixed(0), 20, 1200, 1, 'px', v => set('height', v)));
    panel.appendChild(gb);

    // ---------- 배경/투명도 ----------
    const gv = document.createElement('div'); gv.className = 'ed-group';
    gv.innerHTML = '<div class="ed-group-title">기타</div>';
    gv.appendChild(rowRange('투명도', parseFloat(cs.opacity)||1, 0, 1, 0.05, '', v => set('opacity', v)));
    gv.appendChild(rowColor('배경색', rgbToHex(cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : cs.backgroundColor), v => set('background-color', v)));
    panel.appendChild(gv);
  }

  /* ---------- 인라인 텍스트 편집 ---------- */
  function startTextEdit(el) {
    if (editingText) { editingText.contentEditable = 'false'; saveText(editingText); }
    editingText = el;
    el.contentEditable = 'true';
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const s = window.getSelection();
    s.removeAllRanges(); s.addRange(range);
  }
  function saveText(el) {
    const sel = selectorFor(el);
    textOverrides[sel] = el.innerHTML;
    localStorage.setItem(TEXT_KEY, JSON.stringify(textOverrides));
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); }

  /* ---------- 클릭/키보드 이벤트 ---------- */
  document.addEventListener('click', e => {
    if (!active) return;
    // 편집 UI 자체 클릭은 무시
    if (e.target.closest('#edBar, #edPanel, #edHint, #edModal')) return;
    e.preventDefault(); e.stopPropagation();
    const el = e.target;
    if (el === selected) return;
    setSelected(el);
  }, true);

  document.addEventListener('dblclick', e => {
    if (!active) return;
    if (e.target.closest('#edBar, #edPanel, #edHint, #edModal')) return;
    e.preventDefault(); e.stopPropagation();
    setSelected(e.target);
    if (e.target.tagName !== 'IMG') startTextEdit(e.target);
  }, true);

  document.addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Escape') {
      if (editingText) { editingText.contentEditable = 'false'; saveText(editingText); editingText = null; }
      setSelected(null);
    }
    if (e.key === 'Enter' && editingText && !e.shiftKey) {
      e.preventDefault();
      editingText.contentEditable = 'false'; saveText(editingText); editingText = null;
    }
    // ArrowLeft/Right 처리는 main.js의 goTo가 담당 (중복 방지). 단, 편집 텍스트 중일 때만 차단.
    if (editingText && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.stopPropagation();
    }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); save(); flash('저장됨'); }
  });

  /* ---------- Alt+드래그로 위치 이동 ---------- */
  let dragState = null;
  document.addEventListener('mousedown', e => {
    if (!active || !e.altKey || !selected) return;
    if (e.target.closest('#edBar, #edPanel, #edHint')) return;
    e.preventDefault();
    const cs = getComputedStyle(selected);
    let tx = 0, ty = 0;
    const m = cs.transform && cs.transform !== 'none' ? cs.transform.match(/matrix\(([^)]+)\)/) : null;
    if (m) { const p = m[1].split(',').map(s => parseFloat(s)); tx = p[4]||0; ty = p[5]||0; }
    dragState = { sx: e.clientX, sy: e.clientY, tx, ty };
  });
  document.addEventListener('mousemove', e => {
    if (!dragState) return;
    const dx = e.clientX - dragState.sx;
    const dy = e.clientY - dragState.sy;
    set('transform', `translateX(${dragState.tx+dx}px) translateY(${dragState.ty+dy}px)`);
    // Panel slider 업데이트 (시각만)
    const inputs = document.querySelectorAll('#edPanel input[type="range"]');
    if (inputs.length >= 2) {
      // 4th & 5th rows are transform — find by label match
      document.querySelectorAll('#edPanel .ed-row').forEach(row => {
        const lab = row.querySelector('label')?.textContent;
        if (lab === '가로 X') {
          const r = row.querySelector('input'); r.value = dragState.tx + dx;
          row.querySelector('.ed-val').textContent = (dragState.tx + dx).toFixed(0) + 'px';
        }
        if (lab === '세로 Y') {
          const r = row.querySelector('input'); r.value = dragState.ty + dy;
          row.querySelector('.ed-val').textContent = (dragState.ty + dy).toFixed(0) + 'px';
        }
      });
    }
  });
  document.addEventListener('mouseup', () => { dragState = null; });

  /* ---------- Toast 알림 ---------- */
  function flash(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:100001;background:#2BCE6B;color:#fff;padding:10px 20px;border-radius:6px;font-family:-apple-system,sans-serif;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.3);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1500);
  }

  /* ---------- Export ---------- */
  function exportCSS() {
    let css = '/* ===== NextIO Editor Export (' + new Date().toLocaleString() + ') ===== */\n\n';
    for (const [sel, props] of Object.entries(overrides)) {
      const lines = Object.entries(props).filter(([_,v]) => v).map(([k,v]) => `  ${k}: ${v} !important;`).join('\n');
      if (lines) css += `${sel} {\n${lines}\n}\n\n`;
    }
    showModal('CSS 코드 (이걸 복사해서 알려주세요)', css);
  }
  function exportTexts() {
    let out = '/* ===== 텍스트 변경 내역 ===== */\n\n';
    for (const [sel, html] of Object.entries(textOverrides)) {
      out += sel + '\n→ ' + html.replace(/\s+/g, ' ').trim() + '\n\n';
    }
    showModal('변경된 텍스트 (이걸 복사해서 알려주세요)', out);
  }
  function showModal(title, content) {
    const old = document.getElementById('edModal');
    if (old) old.remove();
    const m = document.createElement('div');
    m.id = 'edModal';
    m.innerHTML = `
      <div class="ed-modal-box">
        <div class="ed-modal-head">
          <h3>${title}</h3>
          <button id="edModalX">×</button>
        </div>
        <textarea spellcheck="false">${content.replace(/</g,'&lt;')}</textarea>
        <div class="ed-modal-foot">
          <button id="edModalCopy" class="primary">📋 클립보드 복사</button>
          <button id="edModalClose">닫기</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    document.getElementById('edModalX').onclick = () => m.remove();
    document.getElementById('edModalClose').onclick = () => m.remove();
    document.getElementById('edModalCopy').onclick = () => {
      const ta = m.querySelector('textarea');
      ta.select();
      navigator.clipboard.writeText(ta.value).then(() => flash('복사됨'));
    };
  }

  function resetAll() {
    if (!confirm('모든 변경사항을 초기화합니다. 계속할까요?')) return;
    overrides = {}; textOverrides = {};
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TEXT_KEY);
    location.reload();
  }
  function undoSelected() {
    if (!selected) return;
    const sel = selectorFor(selected);
    delete overrides[sel];
    delete textOverrides[sel];
    selected.removeAttribute('style');
    save();
    localStorage.setItem(TEXT_KEY, JSON.stringify(textOverrides));
    flash('선택 요소 초기화 — 새로고침해야 텍스트 복원');
  }

  /* ---------- 활성화 ---------- */
  function activate() {
    active = true;
    document.body.classList.add('ed-active');
    // 편집 모드에서는 fade-in 애니메이션 없이 모든 reveal을 즉시 visible (시프트/투명 제거)
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    // 모든 텍스트/이미지 요소에 editable 마커
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,strong,em,a,li,td,th,div,img,button,svg').forEach(el => {
      if (el.closest('#edBar,#edPanel,#edHint,#edModal,#navbar')) return;
      el.dataset.edEditable = '1';
    });
    buildUI();
    applyAllTexts();
    applyAllOverrides();
  }

  // DOM 준비 후 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  } else {
    activate();
  }
})();
