/* 지도 탭: ① 카드(다이얼) · ③ 지도 화면 · ④ 따라 걷는 중.
   WL.mp 는 record.js(로그 남기기)도 같이 쓰는 지도 도우미다. */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc } = WL.ui;
  const P = WL.data.P;

  /* ---------- 선 도우미 (0~100 칸 좌표) ---------- */
  function lens(pts) {
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return L;
  }
  /* 선의 a~b 구간(길이 비율)만 잘라 낸 점들 */
  function seg(pts, a, b) {
    a = Math.max(0, Math.min(1, a));
    b = Math.max(0, Math.min(1, b));
    if (b - a < 0.0005) return [];
    const L = lens(pts);
    const T = L[L.length - 1] || 1;
    const out = [WL.ui.pointAt(pts, a)];
    for (let i = 1; i < pts.length - 1; i++) {
      const f = L[i] / T;
      if (f > a && f < b) out.push(pts[i]);
    }
    out.push(WL.ui.pointAt(pts, b));
    return out;
  }
  const d = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  /* 늘어나는 상자 안 선: 굵기는 화면 px 그대로 */
  function path(pts, o = {}) {
    if (!pts || pts.length < 2) return '';
    const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
    const cls = o.cls ? ` class="${o.cls}"` : '';
    const anim = o.animate ? ' pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"' : '';
    return `<path${cls} d="${d(pts)}" fill="none" stroke="${o.color || 'var(--ink)'}" stroke-width="${o.width || 4}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${o.opacity ? ` opacity="${o.opacity}"` : ''}${dash}${anim}/>`;
  }
  const svg = (inner, cls = '') => `<svg class="mp-svg ${cls}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${inner}</svg>`;
  /* 화면 좌표(px) → 선 위 가장 가까운 지점의 길이 비율 */
  function nearest(pts, w, h, x, y) {
    const L = lens(pts);
    const T = L[L.length - 1] || 1;
    let best = { dist: Infinity, f: 0 };
    for (let i = 1; i < pts.length; i++) {
      const ax = (pts[i - 1][0] / 100) * w, ay = (pts[i - 1][1] / 100) * h;
      const bx = (pts[i][0] / 100) * w, by = (pts[i][1] / 100) * h;
      const vx = bx - ax, vy = by - ay;
      const len2 = vx * vx + vy * vy || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / len2));
      const dist = Math.hypot(ax + vx * t - x, ay + vy * t - y);
      if (dist < best.dist) best = { dist, f: (L[i - 1] + (L[i] - L[i - 1]) * t) / T };
    }
    return best.f;
  }
  /* 선 그리기 애니메이션. ui.course({animate})의 pathLength=1 + non-scaling-stroke 조합은
     크롬에서 점선처럼 끊겨 보여서, 그리는 동안만 px 좌표로 바꿔 실제 길이로 그린다. */
  function drawIn(pathEl, o = {}) {
    if (!pathEl) return;
    const svgEl = pathEl.ownerSVGElement;
    const r = svgEl.getBoundingClientRect();
    if (!r.width || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const orig = { d: pathEl.getAttribute('d'), vb: svgEl.getAttribute('viewBox'), ve: pathEl.getAttribute('vector-effect') };
    const nums = orig.d.match(/-?\d*\.?\d+/g).map(Number);
    let pd = '';
    for (let i = 0; i < nums.length; i += 2) pd += `${i ? 'L' : 'M'}${((nums[i] / 100) * r.width).toFixed(1)} ${((nums[i + 1] / 100) * r.height).toFixed(1)}`;
    ['pathLength', 'stroke-dasharray', 'stroke-dashoffset', 'class'].forEach((a) => pathEl.removeAttribute(a));
    svgEl.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    pathEl.removeAttribute('vector-effect');
    pathEl.setAttribute('d', pd);
    const len = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${len} ${len}`;
    const anim = pathEl.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: o.dur || 1100, delay: o.delay == null ? 120 : o.delay, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'both' });
    anim.onfinish = () => {
      if (!pathEl.isConnected) return;
      anim.cancel();
      pathEl.style.strokeDasharray = '';
      svgEl.setAttribute('viewBox', orig.vb);
      pathEl.setAttribute('d', orig.d);
      if (orig.ve) pathEl.setAttribute('vector-effect', orig.ve);
    };
  }
  const pct = (p) => `left:${p[0].toFixed(2)}%;top:${p[1].toFixed(2)}%`;
  const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m) % 60).padStart(2, '0')}`;
  /* 숫자만 Bricolage 굵게 */
  const numb = (s) => String(s).replace(/(\d+(?:\.\d+)?)/g, '<b class="mp-num">$1</b>');

  /* ---------- 코스 데이터 ---------- */
  function courseOf(ref) {
    const post = WL.find.post(ref);
    if (post) {
      const u = WL.find.user(post.author);
      const n = post.photos.length;
      const base = 17 * 60 + 10;
      return {
        id: post.id, title: post.title, handle: u ? u.handle : '', km: post.km, minutes: post.minutes, shape: post.shape, mine: false,
        href: '#/post/' + post.id,
        photos: post.photos.map((src, i) => { const at = (i + 1) / (n + 1); return { src, at, time: hm(base + post.minutes * at) }; }),
      };
    }
    const log = WL.find.myLog(ref);
    if (log) {
      return {
        id: log.id, title: log.title, handle: WL.data.me.handle, km: log.km, minutes: log.minutes, shape: log.shape, mine: true,
        href: '#/log/' + log.id,
        photos: log.photos.map((p) => ({ src: p.src, at: p.at, time: p.time })),
      };
    }
    return null;
  }

  /* 지도 탭 카드: data.mapCards + 저장한 코스·내 주변 몇 개 더(다이얼 묶음 수를 시안처럼 맞춤) */
  let cards = null;
  function cardList() {
    if (cards) return cards;
    const by = (k) => WL.data.mapCards.filter((c) => c.kind === k);
    const groups = [
      ['저장한 코스', [...by('저장한 코스'), { ref: 'f-03' }, { ref: 'f-06' }, { ref: 'f-11' }]],
      ['내 주변', [...by('내 주변'), { ref: 'f-07' }]],
      ['다시 걷기', by('다시 걷기')],
    ];
    cards = [];
    groups.forEach(([kind, list], g) => list.forEach((c, i) => {
      const course = courseOf(c.ref);
      if (course) cards.push(Object.assign({ kind, group: g, nth: i + 1, count: list.length, note: c.note || '' }, course));
    }));
    return cards;
  }
  const state = { idx: 0 };
  const colorOf = (c) => (c.mine ? 'var(--tomato)' : 'var(--cobalt)');

  /* ---------- 공통 조각 ---------- */
  function toggle(active, dark) {
    const a = (id, href, ic, label) => id === active
      ? `<span class="mp-tg-i is-on" aria-current="page" aria-label="${label}">${icon(ic, 20)}</span>`
      : `<a class="mp-tg-i" href="${href}" aria-label="${label}">${icon(ic, 20)}</a>`;
    return `<nav class="mp-toggle ${dark ? 'is-dark' : ''}" aria-label="보기 전환">${a('cards', '#/map', 'stack', '카드로 보기')}${a('map', '#/map/view', 'map', '지도로 보기')}</nav>`;
  }
  const here = (p) => `<span class="mp-here" style="${pct(p)}"><i></i></span>`;

  /* 코스 선 + 사진 동그라미 (지도 위) */
  function courseOnMap(c, o = {}) {
    const pts = WL.data.shapes[c.shape] || WL.data.shapes.yeonnam;
    const col = colorOf(c);
    const s = pts[0], e = pts[pts.length - 1];
    const thumbs = c.photos.map((p, i) => `<span class="mp-thumb" style="${pct(WL.ui.pointAt(pts, p.at))};--i:${i}"><img src="${p.src}" alt=""></span>`).join('');
    return `<div class="mp-cbox ${o.animate ? 'is-anim' : ''}" style="--c:${col}">
      ${svg(path(pts, { color: col, width: 5, cls: 'mp-draw' }))}
      <i class="mp-dot-s" style="${pct(s)}"></i><i class="mp-dot-e" style="${pct(e)}"></i>${thumbs}
    </div>`;
  }

  /* 오늘 하루 동선(가는 회색) + 내 걸은 구간(굵은 먹색) */
  const DAY = {
    pre: [[7.5, 6.9], [16, 10]],
    walk: [[16, 10], [15, 19.5], [19.5, 27], [13.7, 36.6]],
    post: [[13.7, 36.6], [18.6, 44.6], [21.4, 53.5]],
  };
  function dayLayer(empty) {
    if (empty) return `<div class="mp-layer">${here(DAY.post[2])}</div>`;
    return `<div class="mp-layer">${svg(path(DAY.pre, { color: 'var(--route-day)', width: 3 }) + path(DAY.walk, { color: 'var(--ink)', width: 6 }) + path(DAY.post, { color: 'var(--route-day)', width: 3 }))}${here(DAY.post[2])}</div>`;
  }

  function todayRow(empty) {
    const t = WL.data.today;
    if (empty) {
      return `<div class="mp-today"><div class="grow"><p class="t-subhead">오늘</p><p class="t-label c-ink2 mp-today-sub">아직 걸은 기록이 없어요</p></div></div>`;
    }
    return `<div class="mp-today">
      <div class="grow"><p class="t-subhead">오늘</p><p class="t-caption c-ink2 mp-today-sub">${numb(WL.ui.fmt.mins(t.walkedMinutes))} 걸음 · 사진 ${numb(t.totalPhotos)}</p></div>
      <a class="pill s tomato mp-logbtn" href="#/record/time">오늘의 로그${icon('chevronRight', 18)}</a>
    </div>`;
  }

  function cardHtml(c, i) {
    return `<article class="mp-vcard" data-i="${i}">
      <a class="mp-vcard-top" href="${c.href}">
        <img class="mp-vcard-img" src="${c.photos[0] ? c.photos[0].src : P('park-path')}" alt="">
        <span class="mp-vcard-txt"><b class="t-subhead">${esc(c.title)}</b><span class="t-caption c-ink2">${esc(c.handle)} · ${numb(c.km.toFixed(1))} km</span></span>
      </a>
      <a class="pill m block ${c.mine ? 'tomato' : 'cobalt'}" href="#/follow/${c.id}">${icon('nav', 18)}따라 걷기</a>
    </article>`;
  }

  /* ③ 지도 화면 장면. 시간 고르기(record.js) 뒤 배경으로도 쓴다. */
  function viewScene(o = {}) {
    const list = cardList();
    const c = list[state.idx] || list[0];
    return `<div class="mp-scene">
      ${WL.ui.mapBg(3)}
      ${dayLayer(o.empty)}
      ${o.empty ? '' : `<div class="mp-cwrap">${courseOnMap(c, { animate: o.animate })}</div>`}
      <div class="mp-top">${toggle('map', false)}</div>
      <section class="mp-sheet ${o.lowered ? 'is-low' : ''}" aria-label="오늘과 코스">
        <button class="mp-handle" type="button" aria-label="시트 올리고 내리기"><span></span></button>
        ${todayRow(o.empty)}
        ${o.static ? '' : `<div class="mp-more"><hr class="hr"><div class="mp-vcards">${list.map(cardHtml).join('')}</div></div>`}
        <div class="nav-space"></div>
      </section>
    </div>`;
  }

  /* ========== ① 지도 탭 · 카드(다이얼) ========== */
  const R = 300;
  const STEP = 15 * (Math.PI / 180);
  const STEP_PX = R * Math.sin(STEP);
  /* 놓은 뒤 관성: 속도가 e^(-t/TAU) 로 줄어든다고 보고 멈출 곳을 미리 정한다.
     UIScrollView 기본값(0.998/ms, TAU≈500ms)은 1.3초 안에 끝내기엔 꼬리가 길어 조금 무겁게 */
  const TAU = 325;
  const DECAY = 4;

  function metaLine(c) {
    return `${esc(c.handle)} · ${numb(c.km.toFixed(1))}km · ${numb(c.minutes)}분${c.note ? ' · ' + numb(c.note) : ''}`;
  }
  function bigCourse(c, animate) {
    const pts = WL.data.shapes[c.shape] || WL.data.shapes.yeonnam;
    return WL.ui.course(pts, { color: 'var(--map-ink)', width: 6, dot: 6, pad: 4, photos: c.photos.map((p) => p.at) });
  }

  WL.screens.map = {
    title: '지도',
    dark: true,
    nav: 'map',
    navLight: true,
    render(params) {
      const list = cardList();
      const c = list[state.idx];
      return `<div class="mp-card">
        <header class="mp-head"><h1 class="t-display">지도</h1>${toggle('cards', true)}</header>
        <div class="mp-big" aria-hidden="true"><div class="mp-big-in is-anim">${bigCourse(c, true)}</div></div>
        <div class="mp-ctext" aria-live="polite">
          <p class="t-caption mp-kind"></p>
          <h2 class="t-title mp-ctitle"></h2>
          <p class="t-caption mp-meta"></p>
        </div>
        <div class="mp-dial" tabindex="0" role="listbox" aria-label="코스 고르기 (좌우 화살표)">
          <svg class="mp-arc" aria-hidden="true"><path fill="none"/><g class="mp-ticks"></g></svg>
          ${list.map((x, i) => `<button type="button" class="mp-di" role="option" data-i="${i}" aria-label="${esc(x.title)}"><span class="mp-di-in">${WL.ui.course(WL.data.shapes[x.shape], { color: 'var(--map-ink)', width: 1.5, start: false, end: false, pad: 0 })}</span></button>`).join('')}
        </div>
        <div class="mp-btns">
          <a class="pill tomato" href="#/record/time${params.empty ? '?empty=1' : ''}">오늘의 로그${icon('chevronRight', 20)}</a>
          <a class="pill cobalt mp-follow" href="#/follow/${c.id}">${icon('nav', 20)}이 코스 따라 걷기</a>
        </div>
      </div>`;
    },
    mount(root) {
      const list = cardList();
      const dial = root.querySelector('.mp-dial');
      const items = [...dial.querySelectorAll('.mp-di')];
      const arc = dial.querySelector('.mp-arc path');
      const ticks = dial.querySelector('.mp-ticks');
      const big = root.querySelector('.mp-big-in');
      const follow = root.querySelector('.mp-follow');
      let pos = state.idx;
      let shown = state.idx;
      let textIdx = -1;
      let raf = 0;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const clampIdx = (p) => Math.max(0, Math.min(list.length - 1, Math.round(p)));
      const detent = WL.ui.detent();
      let tickIdx = clampIdx(pos);

      function setText(i) {
        if (i === textIdx) return;
        textIdx = i;
        const c = list[i];
        const box = root.querySelector('.mp-ctext');
        box.querySelector('.mp-kind').innerHTML = `${c.kind} · <b class="mp-num">${c.nth} / ${c.count}</b>`;
        box.querySelector('.mp-ctitle').textContent = c.title;
        box.querySelector('.mp-meta').innerHTML = metaLine(c);
        follow.setAttribute('href', `#/follow/${c.id}`);
        items.forEach((el, k) => el.setAttribute('aria-selected', k === i ? 'true' : 'false'));
      }
      /* 사진 지점은 선이 지나갈 즈음 나타나게 */
      function stagger() {
        const c = list[shown];
        big.querySelectorAll('.cs-photo').forEach((el, k) => {
          const at = c.photos[k] ? c.photos[k].at : 0.5;
          el.style.animationDelay = `${(0.12 + 1.1 * (1 - Math.pow(1 - at, 0.45)) * 0.9).toFixed(2)}s`;
        });
      }
      function drawBig(i, anim = true) {
        if (i === shown) return;
        shown = i;
        state.idx = i;
        big.classList.remove('is-anim');
        big.innerHTML = bigCourse(list[i], anim);
        if (!anim) return;
        void big.offsetWidth;
        big.classList.add('is-anim');
        stagger();
        drawIn(big.querySelector('svg path:last-of-type'));
      }
      /* 스크롤 · 끌기 · 쓸기로 넘길 땐 지나가는 칸마다 그림을 바로 바꾸고, 눌러서 고를 땐 고른 코스를 그려 나가는 애니메이션으로 */
      let quick = true;
      function pick(i) {
        quick = false;
        drawBig(Math.max(0, Math.min(list.length - 1, i)), true);
        animateTo(i);
      }
      stagger();
      drawIn(big.querySelector('svg path:last-of-type'));

      function layout() {
        const W = dial.clientWidth;
        const cx = W / 2;
        const cy = 40 + R;
        items.forEach((el, i) => {
          const off = i - pos;
          const a = Math.abs(off);
          const th = off * STEP;
          const x = cx + R * Math.sin(th);
          const y = cy - R * Math.cos(th);
          const size = a <= 1 ? 64 - 16 * a : Math.max(36, 48 - 12 * (a - 1));
          const op = a <= 1 ? 1 : a <= 2 ? 1 - 0.45 * (a - 1) : Math.max(0, 0.55 - (a - 2) * 1.2);
          el.style.transform = `translate(${(x - 32).toFixed(1)}px, ${(y - 32).toFixed(1)}px) scale(${(size / 64).toFixed(3)})`;
          el.style.opacity = op.toFixed(3);
          el.style.visibility = op <= 0.01 ? 'hidden' : '';
          el.classList.toggle('is-on', a < 0.5);
        });
        const lim = 52 * (Math.PI / 180);
        const a0 = Math.max(-lim, (0 - pos) * STEP);
        const a1 = Math.min(lim, (list.length - 1 - pos) * STEP);
        if (a1 > a0) {
          const p0 = [cx + R * Math.sin(a0), cy - R * Math.cos(a0)];
          const p1 = [cx + R * Math.sin(a1), cy - R * Math.cos(a1)];
          arc.setAttribute('d', `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${R} ${R} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`);
        } else arc.setAttribute('d', '');
        let t = '';
        for (let i = 1; i < list.length; i++) {
          if (list[i].group === list[i - 1].group) continue;
          const th = (i - 0.5 - pos) * STEP;
          if (Math.abs(th) > lim) continue;
          const s = Math.sin(th), co = Math.cos(th);
          t += `<line x1="${(cx + (R - 6) * s).toFixed(1)}" y1="${(cy - (R - 6) * co).toFixed(1)}" x2="${(cx + (R + 6) * s).toFixed(1)}" y2="${(cy - (R + 6) * co).toFixed(1)}"/>`;
        }
        ticks.innerHTML = t;
        const i = clampIdx(pos);
        if (i !== tickIdx) { tickIdx = i; detent.tick(); if (quick) drawBig(i, false); }
        setText(i);
      }

      /* v0(칸/ms)를 주면 놓은 순간 속도를 이어받아 지수 감속으로 멈춘다 → 눈금이 점점 느리게 지나감 */
      function animateTo(target, v0) {
        target = Math.max(0, Math.min(list.length - 1, target));
        cancelAnimationFrame(raf);
        const from = pos;
        const dist = target - from;
        let dur = Math.min(520, 260 + Math.abs(dist) * 90);
        let ease = (x) => 1 - Math.pow(1 - x, 3);
        if (v0 && dist * v0 > 0) {
          const norm = 1 - Math.exp(-DECAY);
          dur = Math.max(280, Math.min(1350, (dist * DECAY) / (norm * v0)));
          ease = (x) => (1 - Math.exp(-DECAY * x)) / norm;
        }
        if (reduce) dur = 1;
        const t0 = performance.now();
        const tick = (now) => {
          const k = Math.min(1, (now - t0) / dur);
          pos = from + (target - from) * ease(k);
          layout();
          if (k < 1) raf = requestAnimationFrame(tick);
          else { pos = target; layout(); drawBig(target, !quick); }
        };
        raf = requestAnimationFrame(tick);
      }

      /* 다이얼 끌기: 원을 따라 돌리고, 놓으면 속도만큼 더 돈 뒤 한 칸에 멈춤 */
      let drag = null;
      dial.addEventListener('pointerdown', (e) => {
        detent.wake();
        cancelAnimationFrame(raf);
        quick = true;
        drag = { x: e.clientX, pos0: pos, moved: 0, v: 0, lx: e.clientX, lt: performance.now(), target: e.target.closest('.mp-di') };
        dial.setPointerCapture(e.pointerId);
      });
      dial.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        drag.moved = Math.max(drag.moved, Math.abs(dx));
        let p = drag.pos0 - dx / STEP_PX;
        const max = list.length - 1;
        if (p < 0) p *= 0.3;
        if (p > max) p = max + (p - max) * 0.3;
        pos = p;
        const now = performance.now();
        const dt = Math.max(1, now - drag.lt);
        drag.v = 0.8 * ((e.clientX - drag.lx) / dt) + 0.2 * drag.v;
        drag.lx = e.clientX;
        drag.lt = now;
        layout();
      });
      const end = () => {
        if (!drag) return;
        detent.wake();
        const g = drag;
        drag = null;
        if (g.moved < 6) {
          if (g.target) pick(+g.target.dataset.i); else animateTo(Math.round(pos));
          return;
        }
        const max = list.length - 1;
        /* 손을 멈췄다 떼면 마지막 move 의 속도가 남아 있으므로 버린다 */
        const v = performance.now() - g.lt > 90 ? 0 : -g.v / STEP_PX;
        if (pos < 0 || pos > max || Math.abs(v) * STEP_PX < 0.2) { animateTo(Math.round(pos)); return; }
        animateTo(Math.round(pos + v * TAU), v);
      };
      dial.addEventListener('pointerup', end);
      dial.addEventListener('pointercancel', end);
      dial.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') detent.wake();
        if (e.key === 'ArrowRight') { e.preventDefault(); pick(Math.round(pos) + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); pick(Math.round(pos) - 1); }
      });

      /* 큰 코스 위에서 옆으로 쓸어도 넘어감 */
      const bigBox = root.querySelector('.mp-big');
      let sw = null;
      bigBox.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY }; });
      bigBox.addEventListener('pointerup', (e) => {
        if (!sw) return;
        detent.wake();
        const dx = e.clientX - sw.x;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - sw.y)) { quick = true; animateTo(Math.round(pos) + (dx < 0 ? 1 : -1)); }
        sw = null;
      });

      /* 트랙패드 가로 스크롤(휠): 화면 어디서든 돌린다. 트랙패드가 관성까지 휠 이벤트로 보내 주므로 눈금이 저절로 점점 느려진다.
         휠은 사용자 동작으로 치지 않아서, 소리는 화면을 한 번 누른 뒤부터 난다 */
      let wheelEnd = 0;
      const onWheel = (e) => {
        const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const d = horiz ? e.deltaX : (e.target.closest('.mp-dial') ? e.deltaY : 0);
        if (!d) return;
        e.preventDefault();
        detent.wake();
        cancelAnimationFrame(raf);
        quick = true;
        const max = list.length - 1;
        pos = Math.max(-0.3, Math.min(max + 0.3, pos + (e.deltaMode === 1 ? d * 16 : d) / STEP_PX));
        layout();
        clearTimeout(wheelEnd);
        wheelEnd = setTimeout(() => animateTo(Math.round(pos)), 120);
      };
      root.addEventListener('wheel', onWheel, { passive: false });
      const onPress = () => detent.wake();
      root.addEventListener('pointerdown', onPress);

      layout();
      const onResize = () => layout();
      window.addEventListener('resize', onResize);
      return () => { cancelAnimationFrame(raf); clearTimeout(wheelEnd); window.removeEventListener('resize', onResize); detent.destroy(); };
    },
  };

  /* ---------- 시트 올리고 내리기 (③ 지도 화면 · ④ 따라 걷기) ---------- */
  function bindSheet(sheet, onChange) {
    const more = sheet.querySelector('.mp-more');
    const handle = sheet.querySelector('.mp-handle');
    let start = null;
    let moved = false;
    const measure = () => sheet.style.setProperty('--drop', `${more ? more.offsetHeight : 0}px`);
    const set = (low) => {
      sheet.classList.toggle('is-low', low);
      handle.setAttribute('aria-expanded', low ? 'false' : 'true');
      if (more) more.inert = low;
      onChange && onChange(low);
    };
    measure();
    set(sheet.classList.contains('is-low'));
    handle.addEventListener('click', () => { if (!moved) set(!sheet.classList.contains('is-low')); });
    handle.addEventListener('pointerdown', (e) => { start = e.clientY; moved = false; handle.setPointerCapture(e.pointerId); });
    handle.addEventListener('pointermove', (e) => { if (start !== null && Math.abs(e.clientY - start) > 8) moved = true; });
    handle.addEventListener('pointerup', (e) => {
      if (start === null) return;
      const dy = e.clientY - start;
      start = null;
      if (moved) set(dy > 0);
      setTimeout(() => (moved = false), 0);
    });
    window.addEventListener('resize', measure);
    return { set, measure, off: () => window.removeEventListener('resize', measure) };
  }

  /* ========== ③ 지도 화면 ========== */
  /* 로그 상세의 '지도에서 보기'(?log= / ?post=)로 들어오면 그 코스를 띄운다. 카드 목록에 없으면 맨 앞에 끼워 넣는다 */
  function focusCard(ref) {
    if (!ref) return false;
    const list = cardList();
    let i = list.findIndex((c) => c.id === ref);
    if (i < 0) {
      const c = courseOf(ref);
      if (!c) return false;
      list.unshift(Object.assign({ kind: c.mine ? '내 로그' : '보는 코스', group: -1, nth: 1, count: 1, note: '' }, c));
      i = 0;
    }
    state.idx = i;
    return true;
  }

  WL.screens.mapView = {
    title: '지도 화면',
    nav: 'map',
    render(params) {
      const focused = !params.empty && focusCard(params.log || params.post);
      const back = focused ? `<button type="button" class="icon-btn is-float mp-vback" aria-label="뒤로">${icon('back', 22)}</button>` : '';
      return `<div class="mp-view">${back}${viewScene({ empty: !!params.empty, lowered: !!params.empty || params.sheet === 'low', animate: true })}</div>`;
    },
    mount(root, params) {
      const vback = root.querySelector('.mp-vback');
      if (vback) vback.addEventListener('click', () => WL.back(params.log ? '/log/' + params.log : '/post/' + params.post));
      const sheet = root.querySelector('.mp-sheet');
      const sh = bindSheet(sheet);
      if (params.empty) return () => sh.off();
      const list = cardList();
      const row = root.querySelector('.mp-vcards');
      const wrap = root.querySelector('.mp-cwrap');
      const cardEls = [...row.querySelectorAll('.mp-vcard')];
      const leftOf = (el) => el.offsetLeft - row.firstElementChild.offsetLeft;
      const mark = () => cardEls.forEach((el, k) => el.classList.toggle('is-cur', k === state.idx));
      row.scrollLeft = leftOf(cardEls[state.idx] || cardEls[0]);
      mark();
      drawIn(wrap.querySelector('.mp-draw'));
      let t = 0;
      const onScroll = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          let best = 0, bd = Infinity;
          cardEls.forEach((el, k) => {
            const dd = Math.abs(leftOf(el) - row.scrollLeft);
            if (dd < bd) { bd = dd; best = k; }
          });
          if (best !== state.idx) {
            state.idx = best;
            wrap.innerHTML = courseOnMap(list[best], { animate: true });
            drawIn(wrap.querySelector('.mp-draw'));
            mark();
          }
        }, 110);
      };
      row.addEventListener('scroll', onScroll, { passive: true });
      return () => { clearTimeout(t); sh.off(); };
    },
  };

  /* ========== ④ 따라 걷는 중 ========== */
  WL.screens.follow = {
    title: '따라 걷는 중',
    nav: 'map',
    render(params) {
      const c = courseOf(params.id) || courseOf('f-01');
      const col = colorOf(c);
      const n = c.photos.length;
      return `<div class="mp-view mp-fol" style="--c:${col}">
        <div class="mp-scene">
          ${WL.ui.mapBg(5)}
          <div class="mp-cwrap mp-fwrap"><div class="mp-cbox">
            ${svg(`<path class="mp-done" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path class="mp-left" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="0 10" vector-effect="non-scaling-stroke"/>`)}
            <i class="mp-dot-s"></i><i class="mp-dot-e"></i>
            ${c.photos.map((p, i) => `<span class="mp-thumb" data-k="${i}"><img src="${p.src}" alt=""></span>`).join('')}
            <span class="mp-here mp-me"><i></i></span>
          </div></div>
          <div class="mp-top">${toggle('map', false)}</div>
          <section class="mp-sheet is-low" aria-label="남은 길">
            <button class="mp-handle" type="button" aria-label="사진 보기 올리고 내리기"><span></span></button>
            <div class="mp-fhead">
              <div class="grow">
                <p class="t-caption c-ink2">${esc(c.title)}</p>
                <p class="mp-left-row"><b class="n-big tnum mp-km">0.0</b><span class="t-subhead"> km 남음 · 약 <b class="mp-num mp-min">0</b> 분</span></p>
              </div>
              <button type="button" class="pill m mp-stop">그만 걷기</button>
            </div>
            <button type="button" class="mp-next t-caption c-ink2"><img class="mp-next-img" src="${c.photos[0].src}" alt=""><span class="mp-next-txt"></span></button>
            <div class="mp-more">
              <hr class="hr">
              <div class="mp-slider" aria-label="코스 사진">
                ${c.photos.map((p, i) => `<figure class="mp-pcard" data-k="${i}"><img src="${p.src}" alt=""><figcaption><span class="d-stamp">${p.time}</span><span class="t-label-b mp-pc-r">${i + 1} / ${n}</span></figcaption></figure>`).join('')}
              </div>
            </div>
            <div class="nav-space"></div>
          </section>
        </div>
      </div>`;
    },
    mount(root, params) {
      const c = courseOf(params.id) || courseOf('f-01');
      const pts = WL.data.shapes[c.shape] || WL.data.shapes.yeonnam;
      const box = root.querySelector('.mp-cbox');
      const done = box.querySelector('.mp-done');
      const left = box.querySelector('.mp-left');
      const me = box.querySelector('.mp-me');
      box.querySelector('.mp-dot-s').setAttribute('style', pct(pts[0]));
      box.querySelector('.mp-dot-e').setAttribute('style', pct(pts[pts.length - 1]));
      const thumbs = [...box.querySelectorAll('.mp-thumb')];
      thumbs.forEach((el, i) => el.setAttribute('style', pct(WL.ui.pointAt(pts, c.photos[i].at))));
      const kmEl = root.querySelector('.mp-km');
      const minEl = root.querySelector('.mp-min');
      const nextTxt = root.querySelector('.mp-next-txt');
      const nextImg = root.querySelector('.mp-next-img');
      const slider = root.querySelector('.mp-slider');
      const pcards = [...slider.querySelectorAll('.mp-pcard')];
      const n = c.photos.length;
      const sheet = root.querySelector('.mp-sheet');
      let sliderTouched = -Infinity;
      let p = 0.42;
      let nextIdx = -1;
      function focusCard(i, smooth) {
        const el = pcards[i];
        if (!el || performance.now() - sliderTouched < 2500) return;
        slider.scrollTo({ left: el.offsetLeft - (slider.clientWidth - el.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
      }
      const sh = bindSheet(sheet, (low) => { if (!low) setTimeout(() => focusCard(nextIdx, false), 30); });

      /* 냅바 지도 아이콘 위 걷는 중 점 */
      const navMap = document.querySelector('#app .navbar a[aria-label="지도"]');
      if (navMap) navMap.insertAdjacentHTML('beforeend', '<span class="mp-navdot" aria-hidden="true"></span>');

      const metersTo = (at) => Math.max(10, Math.round(((at - p) * c.km * 1000) / 10) * 10);
      function draw() {
        done.setAttribute('d', d(seg(pts, 0, p)));
        left.setAttribute('d', p < 0.999 ? d(seg(pts, p, 1)) : '');
        me.setAttribute('style', pct(WL.ui.pointAt(pts, p)));
        const kmLeft = c.km * (1 - p);
        kmEl.textContent = kmLeft.toFixed(1);
        minEl.textContent = Math.max(0, Math.round(c.minutes * (1 - p)));
        const ni = c.photos.findIndex((ph) => ph.at > p + 0.002);
        thumbs.forEach((el, i) => el.classList.toggle('is-past', c.photos[i].at <= p + 0.002));
        pcards.forEach((el, i) => {
          const past = c.photos[i].at <= p + 0.002;
          el.classList.toggle('is-past', past);
          el.querySelector('.mp-pc-r').textContent = past ? `${i + 1} / ${n}` : `${i + 1} / ${n} · ${metersTo(c.photos[i].at)}m 앞`;
        });
        if (ni >= 0) {
          nextTxt.innerHTML = `다음 사진까지 <b class="mp-num">${metersTo(c.photos[ni].at)}</b> m`;
          nextImg.src = c.photos[ni].src;
        } else {
          nextTxt.innerHTML = `도착까지 <b class="mp-num">${Math.max(0, Math.round((kmLeft * 1000) / 10) * 10)}</b> m`;
        }
        const want = ni < 0 ? n - 1 : ni;
        if (want !== nextIdx) {
          nextIdx = want;
          if (!sheet.classList.contains('is-low')) focusCard(nextIdx, true);
        }
      }
      draw();
      slider.addEventListener('pointerdown', () => (sliderTouched = performance.now()));
      slider.addEventListener('wheel', () => (sliderTouched = performance.now()), { passive: true });
      root.querySelector('.mp-next').addEventListener('click', () => sh.set(false));

      /* 걷는 흉내: 남은 길을 22초쯤에 다 걷는다 */
      let raf = 0;
      let last = performance.now();
      let finished = false;
      let goT = 0;
      const speed = 0.58 / 22000;
      const tick = (now) => {
        p = Math.min(1, p + Math.min(64, now - last) * speed);
        last = now;
        draw();
        if (p >= 1 && !finished) {
          finished = true;
          box.classList.add('is-arrived');
          goT = setTimeout(() => { WL.ui.toast(WL.data.toasts.done, { icon: 'check' }); WL.go('/map'); }, 700);
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      root.querySelector('.mp-stop').addEventListener('click', () => WL.go('/map'));
      return () => { cancelAnimationFrame(raf); clearTimeout(goT); sh.off(); };
    },
  };

  WL.mp = { drawIn, lens, seg, path, svg, d, nearest, pct, hm, numb, toggle, here, viewScene, cardList, courseOf, bindSheet, state };
})();
