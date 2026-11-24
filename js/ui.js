/* 공통 부품: 아이콘, 코스 선, 지도 그림, 냅바, 알림, 날짜 형식 */
window.WL = window.WL || {};

(function () {
  /* 24px 선 아이콘, 선 굵기 2 */
  const paths = {
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>',
    bookmarkFill: '<path d="M6 4h12v17l-6-4-6 4z" fill="currentColor"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    nav: '<path d="M20 4 4 11l7 2 2 7z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    chevronLeft: '<path d="m15 6-6 6 6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 8.5 4.5 9.5 6-.5.8-1.6 2.3-3.2 3.6M6.3 7.6C4.5 8.9 3.2 10.7 2.5 12c1 1.5 4.5 6 9.5 6 1.5 0 2.8-.4 4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5.5-5 4 3.5 2.5-2 4 3.5"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="m9 21 2.5-6.5L14 17v4M10 9.5 13.5 8l2.5 3.5 3 1M10 9.5l-1.5 4.5M11.5 14.5l1-5"/>',
    layers: '<path d="m12 4 9 5-9 5-9-5z"/><path d="m3 14 9 5 9-5"/>',
    stack: '<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M8 5h8"/>',
    locate: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    logout: '<path d="M9 4H5v16h4M15 8l4 4-4 4M19 12H9"/>',
    language: '<path d="M4 6h9M8.5 4v2M6 6c.5 3 2.5 5.5 5 7M11 6c-.5 3-3 6-6 8"/><path d="m13 20 4-9 4 9M14.5 17h5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20c1.2-3.5 4-5 7.5-5s6.3 1.5 7.5 5"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  };

  function icon(name, size = 24, extra = '') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths[name] || ''}</svg>`;
  }

  /* 코스 위 한 지점(0~1)의 좌표 */
  function pointAt(pts, t) {
    const seg = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      seg.push(d);
      total += d;
    }
    let target = Math.max(0, Math.min(1, t)) * total;
    for (let i = 0; i < seg.length; i++) {
      if (target <= seg[i]) {
        const r = seg[i] ? target / seg[i] : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
      }
      target -= seg[i];
    }
    return pts[pts.length - 1];
  }

  /* 코스 선 SVG.
     opts: color, width, dash, start(속 빈 시작 점), end(채운 끝 점), photos(0~1 위치 배열 → 크림 점),
           thumbs([{src, at}] → 사진 동그라미), pad(여백 %), dayShape(뒤에 깔 회색 하루 동선), range([from,to] 굵게 칠할 구간), animate */
  function course(shapeKey, opts = {}) {
    const pts = Array.isArray(shapeKey) ? shapeKey : WL.data.shapes[shapeKey] || WL.data.shapes.yeonnam;
    const o = Object.assign({ color: 'var(--ink)', width: 3, start: true, end: true, photos: [], thumbs: [], pad: 6, dot: 0 }, opts);
    const pad = o.pad;
    const map = (p) => [pad + (p[0] * (100 - pad * 2)) / 100, pad + (p[1] * (100 - pad * 2)) / 100];
    const mp = pts.map(map);
    const d = mp.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
    const w = o.width;
    const endR = o.dot || w * 1.5;
    let out = '';
    if (o.dayShape) {
      const dp = (WL.data.shapes[o.dayShape] || []).map(map);
      out += `<path d="${dp.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')}" fill="none" stroke="${o.dayColor || 'var(--route-day)'}" stroke-width="${Math.max(1.2, w * 0.45)}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
    }
    /* 선 굵기가 늘어나지 않게 non-scaling-stroke를 쓰므로, 그려지는 애니메이션은 화면 픽셀 길이로 재서 drawCourses()가 돌린다 */
    const anim = o.animate ? ` class="draw" style="opacity:0"` : '';
    const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
    out += `<path d="${d}" fill="none" stroke="${o.color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${dash}${anim}/>`;
    const r = (n) => n.toFixed(2);
    const s = mp[0];
    const e = mp[mp.length - 1];
    /* 점은 viewBox가 늘어나도 원으로 보이도록 SVG 밖 HTML 점으로 그림 */
    const dots = [];
    if (o.start) dots.push({ x: s[0], y: s[1], cls: 'cs-start', size: endR * 2 + 2 });
    o.photos.forEach((t) => {
      const p = map(pointAt(pts, t));
      dots.push({ x: p[0], y: p[1], cls: 'cs-photo', size: Math.max(8, w * 2.4) });
    });
    if (o.end) dots.push({ x: e[0], y: e[1], cls: 'cs-end', size: endR * 2 + 4 });
    const thumbs = o.thumbs.map((th) => {
      const p = map(pointAt(pts, th.at));
      return `<span class="cs-thumb" style="left:${r(p[0])}%;top:${r(p[1])}%"><img src="${th.src}" alt=""></span>`;
    });
    return `<div class="course" style="--c:${o.color};--w:${w}px">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${out}</svg>
      ${dots.map((dt) => `<i class="${dt.cls}" style="left:${r(dt.x)}%;top:${r(dt.y)}%;width:${dt.size}px;height:${dt.size}px"></i>`).join('')}
      ${thumbs.join('')}
    </div>`;
  }

  /* 지도 그림: 땅 + 흰 길 격자 + 공원 + 물. seed로 길 모양이 조금씩 달라진다. */
  function mapBg(seed = 1, opts = {}) {
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let roads = '';
    for (let i = 0; i < 6; i++) {
      const x = 8 + i * 17 + rnd() * 8;
      roads += `<path d="M${x} -5 L${x + (rnd() - 0.5) * 18} 105" stroke="var(--map-road)" stroke-width="${i % 3 === 0 ? 3.2 : 1.6}" fill="none"/>`;
    }
    for (let i = 0; i < 6; i++) {
      const y = 6 + i * 18 + rnd() * 8;
      roads += `<path d="M-5 ${y} L105 ${y + (rnd() - 0.5) * 16}" stroke="var(--map-road)" stroke-width="${i % 2 === 0 ? 2.6 : 1.4}" fill="none"/>`;
    }
    const water = opts.water ? `<path d="M-5 ${opts.water} C 30 ${opts.water - 6}, 60 ${opts.water + 8}, 105 ${opts.water - 2} L105 105 L-5 105 Z" fill="var(--map-water)"/>` : '';
    const park = `<rect x="${10 + rnd() * 50}" y="${10 + rnd() * 50}" width="${16 + rnd() * 14}" height="${10 + rnd() * 10}" rx="2" fill="var(--map-park)"/>`;
    return `<svg class="map-bg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="var(--map-land)"/>${park}${water}${roads}</svg>`;
  }

  /* 냅바: 홈 / 지도 / 탐색, 아이콘만 */
  function navbar(active, light = false) {
    const item = (id, href, ic, label) => `<a href="${href}" class="${active === id ? 'is-active' : ''}" aria-label="${label}">${icon(ic)}</a>`;
    return `<nav class="navbar ${light ? 'is-light' : ''}">${item('home', '#/home', 'home', '홈')}${item('map', '#/map', 'map', '지도')}${item('explore', '#/explore', 'compass', '탐색')}</nav>`;
  }

  let toastTimer;
  function toast(msg, opts = {}) {
    const app = document.getElementById('app');
    app.querySelectorAll('.toast').forEach((t) => t.remove());
    const el = document.createElement('div');
    el.className = 'toast' + (opts.noNav ? ' no-nav' : '');
    if (opts.bottom != null) el.style.bottom = typeof opts.bottom === 'number' ? opts.bottom + 'px' : opts.bottom;
    el.setAttribute('role', 'status');
    el.innerHTML = (opts.icon ? icon(opts.icon, 16) : '') + `<span>${msg}</span>`;
    app.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 260);
    }, opts.duration || 1800);
  }

  /* 날짜 */
  const fmt = {
    stamp: (iso) => { const [y, m, d] = iso.split('-'); return `<span class="stamp-y">${y.slice(2)}</span> ${m} ${d}`; },
    dot: (iso, dow) => `${iso.replace(/-/g, '.')}${dow ? ' · ' + dow : ''}`,
    md: (iso) => { const [, m, d] = iso.split('-'); return `${+m}월 ${+d}일`; },
    mins: (m) => (m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`),
    km: (k) => `${k.toFixed(1)}`,
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const colorVar = { tomato: 'var(--tomato)', cobalt: 'var(--cobalt)', lemon: 'var(--lemon)', mint: 'var(--mint)', ink: 'var(--ink)' };
  const onColor = { tomato: 'var(--ink)', cobalt: 'var(--on-dark)', lemon: 'var(--ink)', mint: 'var(--ink)', ink: 'var(--cream)' };

  function avatar(src, size = 40, name = '') {
    if (!src) return `<span class="avatar is-empty" style="width:${size}px;height:${size}px">${icon('user', Math.round(size * 0.5))}</span>`;
    return `<img class="avatar" src="${src}" alt="${esc(name)}" style="width:${size}px;height:${size}px">`;
  }

  /* 화면 하나에 딤 + 시트/모달을 띄우고 닫는 도우미 */
  function overlay(html, { onClose } = {}) {
    const app = document.getElementById('app');
    const wrap = document.createElement('div');
    wrap.className = 'overlay';
    wrap.innerHTML = `<div class="dim" data-close></div>${html}`;
    app.appendChild(wrap);
    const close = () => {
      wrap.querySelectorAll('.sheet, .modal, .drawer').forEach((n) => n.classList.add('leaving'));
      wrap.querySelector('.dim').style.opacity = '0';
      setTimeout(() => { wrap.remove(); onClose && onClose(); }, 220);
    };
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    return { el: wrap, close };
  }

  /* animate:true 로 그린 코스 선을 화면 길이 기준으로 그린다. #app 에 새로 붙는 선을 알아서 찾는다. */
  function drawCourses(root = document) {
    root.querySelectorAll('.course path.draw:not([data-drawn])').forEach((path) => {
      const svg = path.ownerSVGElement;
      const w = svg.clientWidth, h = svg.clientHeight;
      if (!w || !h) return;
      path.dataset.drawn = '1';
      const nums = (path.getAttribute('d').match(/-?[\d.]+/g) || []).map(Number);
      let len = 0;
      for (let i = 2; i + 1 < nums.length; i += 2) len += Math.hypot((nums[i] - nums[i - 2]) * w / 100, (nums[i + 1] - nums[i - 1]) * h / 100);
      path.style.strokeDasharray = `${len} ${len}`;
      path.style.strokeDashoffset = len;
      path.style.opacity = '';
      path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1100, delay: 120, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
    });
  }
  const startObserver = () => {
    const app = document.getElementById('app');
    if (!app) return;
    new MutationObserver(() => requestAnimationFrame(() => drawCourses(app))).observe(app, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startObserver); else startObserver();

  /* 다이얼 눈금(멈춤쇠) 느낌: 짧은 진동 + 딸깍 소리. 화면마다 detent()로 만들고 나갈 때 destroy() */
  let ac = null;
  let noise = null;
  function wakeAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ac) {
        ac = new AC();
        const n = Math.floor(ac.sampleRate * 0.022);
        noise = ac.createBuffer(1, n, ac.sampleRate);
        const ch = noise.getChannelData(0);
        for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { /* 소리는 덤 */ }
  }
  function clickSound() {
    /* 자동재생 정책: 사용자 동작(wake) 없이 여기서 새로 만들지 않는다 */
    if (!ac || ac.state !== 'running') return;
    try {
      const t = ac.currentTime;
      const src = ac.createBufferSource();
      src.buffer = noise;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 3000 + Math.random() * 500;
      bp.Q.value = 1.4;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.018);
      src.connect(bp).connect(g).connect(ac.destination);
      src.start(t);
      src.stop(t + 0.025);
    } catch (e) { /* 소리는 덤 */ }
  }
  function detent() {
    /* iOS 18+ Safari 는 vibrate 가 없지만, <input switch> 를 label 로 누르면 시스템 햅틱이 난다 */
    let label = null;
    try {
      label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.display = 'none';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
    } catch (e) { label = null; }
    let last = 0;
    return {
      wake: wakeAudio,
      tick() {
        const now = performance.now();
        if (now - last < 25) return;
        last = now;
        /* 한 번도 누르기 전엔 크롬이 진동을 막고 콘솔에 오류를 찍어서 건너뛴다 */
        const active = !navigator.userActivation || navigator.userActivation.hasBeenActive;
        try { if (navigator.vibrate && active) navigator.vibrate(8); } catch (e) { /* 막힌 기기 */ }
        try { if (label) label.click(); } catch (e) { /* 막힌 기기 */ }
        clickSound();
      },
      destroy() { if (label) label.remove(); label = null; },
    };
  }

  WL.ui = { drawCourses, icon, course, pointAt, mapBg, navbar, toast, fmt, esc, colorVar, onColor, avatar, overlay, detent };
})();
