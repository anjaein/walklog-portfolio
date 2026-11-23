/* 로그 남기기: ① 시간 고르기(시트) → ② 코스와 사진 → ③ 글쓰기(같은 화면 스크롤) → 등록 완료.
   지도 도우미는 map.js 의 WL.mp 를 쓴다. */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc } = WL.ui;
  const M = WL.mp;
  const P = WL.data.P;
  const T = WL.data.today;
  const app = () => document.getElementById('app');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 오늘 저녁 걸은 길(걷기 감지 구간). 코스 좌표는 ② 지도 칸(0~100) 기준. */
  const REC = {
    title: '망원 한강 노을',
    start: 18 * 60 + 31,
    end: 19 * 60 + 18,
    km: 3.1,
    track: [[6.5, 72.5], [21.4, 68.3], [29.6, 56.6], [45, 53.5], [53.7, 41], [69.7, 38.4], [78.6, 26.4], [93.3, 21.2]],
    pre: [[-4, 76.5], [6.5, 72.5]],
    post: [[93.3, 21.2], [104, 17]],
    times: [36, 44, 57, 58, 59, 69].map((m) => 18 * 60 + m),
  };
  REC.photos = T.photoList.map((src, i) => ({ id: 'p' + i, src, time: REC.times[i] }));
  /* 사진 고르기: 핀 시각 근처에 찍은 사진(분 차이) + 오늘 찍은 다른 사진 */
  const NEAR = [['alley-street', -8], ['park-path', -3], ['autumn-park', -1], ['ginkgo-street', 2], ['night-alley', 8]];
  const TODAY_MORE = ['ginkgo-yellow', 'hanok-alley', 'old-alley', 'namsan-branches', 'seosulla-sign', 'calico-cat', 'forest-path', 'coffee-bench-2', 'river-sunset'];
  const ADDR = [
    { t: '망원동 413-2', s: '서울 마포구 포은로8길 12', m: 20, f: 0.3 },
    { t: '망원동 413-9', s: '서울 마포구 포은로8길 21', m: 60, f: 0.46 },
    { t: '망원동 413-15', s: '서울 마포구 망원로 34', m: 140, f: 0.64 },
    { t: '망원동 413-40', s: '서울 마포구 월드컵로13길 7', m: 1200, far: true },
  ];

  const frac = (t) => clamp((t - REC.start) / (REC.end - REC.start), 0, 1);
  const timeAt = (f) => REC.start + f * (REC.end - REC.start);
  const kmOf = (d) => (REC.km * Math.max(0, Math.min(d.end, REC.end) - Math.max(d.start, REC.start))) / (REC.end - REC.start);
  const inRange = (d, p) => p.time >= d.start && p.time <= d.end;
  const logPhotos = (d) => d.photos.filter((p) => inRange(d, p));
  const sorted = (d) => d.photos.slice().sort((a, b) => a.time - b.time);

  function lastBlock(hours) {
    if (!hours.length) return [18, 19];
    const e = hours[hours.length - 1];
    let s = e;
    while (hours.includes(s - 1)) s--;
    return [s, e + 1];
  }
  function newDraft(from, to, empty) {
    let start = Math.max(from * 60, REC.start);
    let end = Math.min(to * 60, REC.end);
    if (end - start < 5) { start = from * 60; end = to * 60; }
    return {
      from, to, start, end, empty: !!empty,
      photos: REC.photos.map((p) => Object.assign({}, p)),
      title: REC.title, body: '',
      vis: WL.data.me.defaultVisibility === '나만 보기' ? 'private' : 'public',
      seq: 0,
    };
  }
  function draft() {
    if (!WL.rcDraft) { const [f, t] = lastBlock(T.walkedHours); WL.rcDraft = newDraft(f, t); }
    return WL.rcDraft;
  }

  const steps = (n) => `<span class="rc-steps" aria-label="${n}단계 / 3단계"><span class="n-meta">${n} <span>/ 3</span></span><span class="rc-bars">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'is-on' : ''}"></i>`).join('')}</span></span>`;
  const range = (d) => `<span class="rc-stamp">${M.hm(d.start)} – ${M.hm(d.end)}</span>`;
  const stats = (d, withPhotos) => `<span><b class="mp-num">${d.end - d.start}</b>분 · <b class="mp-num">${kmOf(d).toFixed(1)}</b>km${withPhotos ? ` · 사진 <b class="mp-num">${logPhotos(d).length}</b>` : ''}</span>`;

  /* ---------- ② 지도 그림 ---------- */
  function groups(d) {
    const out = [];
    sorted(d).forEach((p) => {
      const g = out[out.length - 1];
      if (g && p.time - g.time <= 1) g.items.push(p);
      else out.push({ time: p.time, items: [p] });
    });
    return out;
  }
  function mapLayer(d, o = {}) {
    const a = frac(d.start), b = frac(d.end);
    const tr = REC.track;
    const grey = { color: 'var(--route-day)', width: 5 };
    const lines = M.path(REC.pre, grey) + M.path(REC.post, grey) + M.path(M.seg(tr, 0, a), grey) + M.path(M.seg(tr, b, 1), grey) + M.path(M.seg(tr, a, b), { color: 'var(--tomato)', width: 6 });
    const at = (t) => M.pct(WL.ui.pointAt(tr, frac(t)));
    let marks = '';
    if (o.pins) {
      const sel = o.sel || new Set();
      marks = groups(d).map((g) => {
        const ids = g.items.map((p) => p.id);
        const on = ids.some((id) => sel.has(id));
        const out = !g.items.some((p) => inRange(d, p));
        const cls = `${on ? 'is-sel' : sel.size ? 'is-dim' : ''} ${out ? 'is-out' : ''}`;
        return `<button type="button" class="rc-pin ${cls}" data-ids="${ids.join(',')}" style="${at(g.time)}" aria-label="${M.hm(g.time)} 사진 ${ids.length}장"><img src="${g.items[g.items.length - 1].src}" alt="">${ids.length > 1 ? `<span class="rc-badge">${ids.length}</span>` : ''}</button>`;
      }).join('');
    } else {
      marks = d.photos.map((p) => `<i class="rc-dot-p ${inRange(d, p) ? '' : 'is-out'}" style="${at(p.time)}"></i>`).join('');
    }
    return `${M.svg(lines)}<i class="rc-dot-s" style="${M.pct(WL.ui.pointAt(tr, a))}"></i><i class="rc-dot-e" style="${M.pct(WL.ui.pointAt(tr, b))}"></i>${marks}`;
  }
  const DROP = `<svg class="rc-drop" width="28" height="36" viewBox="0 0 28 36" aria-hidden="true"><path d="M14 34.5S2.5 22.4 2.5 13.6a11.5 11.5 0 0 1 23 0C25.5 22.4 14 34.5 14 34.5z" fill="var(--ink)" stroke="var(--surface)" stroke-width="2"/><circle cx="14" cy="13.5" r="4" fill="var(--surface)"/></svg>`;

  /* ---------- 휠 ---------- */
  function makeWheel(el, values, initial, walked, onSettle) {
    const ROW = 42;
    const CENTER = 136;
    const rows = el.querySelector('.rc-rows');
    rows.innerHTML = values.map((v) => `<div class="rc-row"><b>${v}</b><span>시</span>${walked.includes(v) ? '<i aria-hidden="true"></i>' : ''}</div>`).join('');
    const rowEls = [...rows.children];
    let pos = Math.max(0, values.indexOf(initial));
    let target = pos;
    let raf = 0;
    let last = Math.round(pos);
    const max = values.length - 1;
    function layout() {
      rowEls.forEach((r, i) => {
        const off = i - pos;
        const a = Math.abs(off);
        if (a > 3.4) { r.style.visibility = 'hidden'; return; }
        r.style.visibility = '';
        const sc = a < 1 ? 1 - 0.4 * a : 0.6;
        const op = a < 1 ? 1 - 0.5 * a : a < 2 ? 0.5 - 0.2 * (a - 1) : Math.max(0, 0.3 * (1 - (a - 2) / 0.6));
        r.style.transform = `translateY(${(CENTER - ROW / 2 + off * ROW).toFixed(1)}px) scale(${sc.toFixed(3)})`;
        r.style.opacity = op.toFixed(3);
      });
      const i = clamp(Math.round(pos), 0, max);
      el.setAttribute('aria-valuenow', values[i]);
      el.setAttribute('aria-valuetext', `${values[i]}시`);
    }
    function animateTo(i) {
      i = clamp(i, 0, max);
      target = i;
      cancelAnimationFrame(raf);
      const from = pos;
      const dur = reduce() ? 1 : Math.min(420, 200 + Math.abs(i - from) * 40);
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        pos = from + (i - from) * (1 - Math.pow(1 - k, 3));
        layout();
        if (k < 1) raf = requestAnimationFrame(tick);
        else if (i !== last) { last = i; onSettle(values[i]); }
      };
      raf = requestAnimationFrame(tick);
    }
    let drag = null;
    el.addEventListener('pointerdown', (e) => {
      cancelAnimationFrame(raf);
      drag = { y: e.clientY, pos0: pos, moved: 0, v: 0, ly: e.clientY, lt: performance.now() };
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dy = e.clientY - drag.y;
      drag.moved = Math.max(drag.moved, Math.abs(dy));
      let p = drag.pos0 - dy / ROW;
      if (p < 0) p *= 0.3;
      if (p > max) p = max + (p - max) * 0.3;
      pos = p;
      const now = performance.now();
      drag.v = 0.8 * ((e.clientY - drag.ly) / Math.max(1, now - drag.lt)) + 0.2 * drag.v;
      drag.ly = e.clientY;
      drag.lt = now;
      layout();
    });
    const up = (e) => {
      if (!drag) return;
      const g = drag;
      drag = null;
      if (g.moved < 5) {
        const y = e.clientY - el.getBoundingClientRect().top;
        animateTo(Math.round(pos + (y - CENTER) / ROW));
      } else animateTo(Math.round(pos - clamp((g.v * 100) / ROW, -4, 4)));
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    let acc = 0;
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) >= 28) { animateTo(target + Math.sign(acc)); acc = 0; }
    }, { passive: false });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); animateTo(target - 1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); animateTo(target + 1); }
    });
    layout();
    return {
      get: () => values[clamp(Math.round(target), 0, max)],
      set: (v) => animateTo(values.indexOf(v)),
      stop: () => cancelAnimationFrame(raf),
    };
  }

  /* ========== ① 시간 고르기 ========== */
  WL.screens.recordTime = {
    title: '시간 고르기',
    nav: null,
    render(params) {
      const empty = !!params.empty;
      const wheel = (k, label) => `<div class="rc-wheel" data-k="${k}" tabindex="0" role="spinbutton" aria-label="${label} 시각"><span class="rc-wheel-label t-caption">${label}</span><div class="rc-band"></div><div class="rc-rows"></div></div>`;
      return `<div class="rc-time">
        <div aria-hidden="true" inert>${M.viewScene({ empty, lowered: true, static: true })}</div>
        <div class="dim" data-dismiss></div>
        <section class="sheet rc-tsheet" role="dialog" aria-modal="true" aria-labelledby="rc-tt">
          <div class="sheet-handle"></div>
          <div class="rc-thead"><h2 class="t-title" id="rc-tt">언제 걸은 걸 남길까요?</h2>${steps(1)}</div>
          <div class="rc-wheels">${wheel('start', '시작')}${wheel('end', '끝')}</div>
          <div class="rc-info">${icon('info', 20)}<p class="t-label">대략 골라도 괜찮아요. 다음 단계에서 코스를 분 단위로 자세히 다듬을 수 있어요.</p></div>
          <button type="button" class="pill ink block rc-next">다음</button>
        </section>
      </div>`;
    },
    mount(root, params) {
      const empty = !!params.empty;
      const walked = empty ? [] : T.walkedHours;
      const [f0, t0] = empty ? [18, 19] : lastBlock(walked);
      const hours = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
      let sw, ew;
      sw = makeWheel(root.querySelector('[data-k="start"]'), hours(0, 23), f0, walked, (v) => { if (ew && v >= ew.get()) ew.set(v + 1); });
      ew = makeWheel(root.querySelector('[data-k="end"]'), hours(1, 24), t0, walked, (v) => { if (sw && v <= sw.get()) sw.set(v - 1); });
      root.querySelector('[data-dismiss]').addEventListener('click', () => WL.back('/map'));
      root.querySelector('.rc-next').addEventListener('click', () => {
        WL.rcDraft = newDraft(sw.get(), ew.get(), empty);
        WL.go('/record/course');
      });
      return () => { sw.stop(); ew.stop(); };
    },
  };

  /* ========== ② 코스와 사진 · ③ 글쓰기 ========== */
  WL.screens.recordCourse = {
    title: '로그 남기기',
    nav: null,
    render() {
      const d = draft();
      return `<div class="rc-course is-edit">
        <header class="rc-head">
          <button type="button" class="icon-btn rc-back" aria-label="뒤로">${icon('back')}</button>
          <h1 class="t-title">로그 남기기</h1>
          <span class="rc-stepwrap">${steps(2)}</span>
        </header>
        <div class="rc-mapwrap">
          <div class="rc-map">${WL.ui.mapBg(7, { water: 0 })}<div class="rc-mapbox"></div></div>
          <span class="rc-range t-label-b">${d.from}시 – ${d.to}시</span>
          <button type="button" class="pill s line rc-fix">고치기</button>
        </div>
        <section class="rc-sheet">
          <div class="rc-tabs" role="tablist">
            <button type="button" class="rc-tab is-on" role="tab" data-tab="course" aria-selected="true">코스</button>
            <button type="button" class="rc-tab" role="tab" data-tab="photo" aria-selected="false">사진<span class="mp-num rc-pcount"></span></button>
            <span class="rc-sum"></span>
          </div>
          <div class="rc-pane" data-pane="course" role="tabpanel">
            <div class="rc-axis">
              <div class="rc-ax-photos"></div>
              <div class="rc-ax-line"><div class="rc-ax-base"></div><div class="rc-ax-walk"></div><div class="rc-ax-sel"></div></div>
              <button type="button" class="rc-handle" data-h="start" role="slider" aria-label="시작 시각"></button>
              <button type="button" class="rc-handle" data-h="end" role="slider" aria-label="끝 시각"></button>
              <div class="rc-ax-ticks"></div>
              <div class="rc-ax-labels"></div>
            </div>
            <div class="chips rc-chips">
              <button type="button" class="chip" data-chip="rec">추천</button>
              <button type="button" class="chip" data-chip="first">첫 사진</button>
              <button type="button" class="chip" data-chip="last">마지막 사진</button>
            </div>
          </div>
          <div class="rc-pane" data-pane="photo" role="tabpanel" hidden><div class="rc-cards"></div></div>
        </section>
        <section class="rc-write" aria-label="글쓰기"></section>
        <div class="rc-foot"><button type="button" class="pill ink block rc-go">다음</button></div>
      </div>`;
    },
    mount(root) {
      const d = draft();
      const lo = d.from * 60;
      const hi = d.to * 60;
      const span = hi - lo;
      const course = root.querySelector('.rc-course');
      const mapwrap = root.querySelector('.rc-mapwrap');
      const mapbox = root.querySelector('.rc-mapbox');
      const axis = root.querySelector('.rc-axis');
      const cardsEl = root.querySelector('.rc-cards');
      const go = root.querySelector('.rc-go');
      const write = root.querySelector('.rc-write');
      let tab = 'course';
      let mode = 'edit';
      let sel = new Set();
      const timers = [];
      const panels = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));

      /* --- 그리기 --- */
      const xOf = (t) => ((t - lo) / span) * 100;
      function paintMap() {
        mapbox.innerHTML = mapLayer(d, { pins: tab === 'photo' || mode === 'write', sel: mode === 'write' ? new Set() : sel });
      }
      function paintSum() {
        root.querySelector('.rc-sum').innerHTML = `${range(d)}${stats(d)}`;
        root.querySelector('.rc-pcount').textContent = ` ${logPhotos(d).length}`;
        const s = sorted(d);
        const recS = Math.max(lo, REC.start), recE = Math.min(hi, REC.end);
        const first = s.find((p) => p.time >= lo);
        const lastP = s.slice().reverse().find((p) => p.time <= hi);
        const on = {
          rec: d.start === recS && d.end === recE,
          first: !!first && d.start === first.time,
          last: !!lastP && d.end === lastP.time,
        };
        root.querySelectorAll('[data-chip]').forEach((c) => {
          c.classList.toggle('is-on', on[c.dataset.chip]);
          c.setAttribute('aria-pressed', on[c.dataset.chip] ? 'true' : 'false');
        });
      }
      function paintAxisStatic() {
        const step = span <= 180 ? 10 : span <= 480 ? 30 : 60;
        const lab = span <= 360 ? 60 : 180;
        let ticks = '';
        let labels = '';
        for (let t = lo; t <= hi; t += step) {
          ticks += `<i class="${t % 60 === 0 ? 'is-h' : ''}" style="left:${xOf(t)}%"></i>`;
          if (t % lab === 0) labels += `<span class="rc-stamp" style="left:${xOf(t)}%">${M.hm(t)}</span>`;
        }
        axis.querySelector('.rc-ax-ticks').innerHTML = ticks;
        axis.querySelector('.rc-ax-labels').innerHTML = labels;
        const ws = clamp(REC.start, lo, hi), we = clamp(REC.end, lo, hi);
        const walk = axis.querySelector('.rc-ax-walk');
        walk.style.left = `${xOf(ws)}%`;
        walk.style.width = `${Math.max(0, xOf(we) - xOf(ws))}%`;
      }
      function paintAxis() {
        const sel2 = axis.querySelector('.rc-ax-sel');
        sel2.style.left = `${xOf(d.start)}%`;
        sel2.style.width = `${xOf(d.end) - xOf(d.start)}%`;
        axis.querySelectorAll('.rc-handle').forEach((h) => {
          const t = d[h.dataset.h];
          h.style.left = `${xOf(t)}%`;
          h.setAttribute('aria-valuenow', t);
          h.setAttribute('aria-valuetext', M.hm(t));
        });
        const W = axis.clientWidth || 1;
        const cl = [];
        sorted(d).filter((p) => p.time >= lo && p.time <= hi).forEach((p) => {
          const x = (xOf(p.time) / 100) * W;
          const c = cl[cl.length - 1];
          if (c && x - c.x < 16) c.items.push(p);
          else cl.push({ x, items: [p] });
        });
        axis.querySelector('.rc-ax-photos').innerHTML = cl.map((c) => {
          const out = !c.items.some((p) => inRange(d, p));
          const imgs = c.items.slice(0, 2).map((p) => `<img src="${p.src}" alt="">`).join('');
          return `<span class="rc-ax-ph ${out ? 'is-out' : ''}" style="left:${c.x.toFixed(1)}px">${imgs}${c.items.length > 1 ? `<span class="rc-badge">+${c.items.length - 1}</span>` : ''}</span>`;
        }).join('');
      }
      function paintCards() {
        const keep = cardsEl.scrollLeft;
        cardsEl.innerHTML = `<button type="button" class="rc-add">${icon('plus', 22)}추가</button>` + sorted(d).map((p) => `
          <div class="rc-card ${sel.has(p.id) ? 'is-sel' : ''} ${inRange(d, p) ? '' : 'is-out'}" data-id="${p.id}" role="button" tabindex="0" aria-pressed="${sel.has(p.id)}" aria-label="${M.hm(p.time)} 사진">
            <img src="${p.src}" alt=""><span class="rc-ctime rc-stamp">${M.hm(p.time)}</span>
            <button type="button" class="rc-x" data-rm="${p.id}" aria-label="이 사진 빼기"><span>${icon('close', 12, 'stroke-width="3"')}</span></button>
          </div>`).join('');
        cardsEl.scrollLeft = keep;
      }
      function paint() {
        paintMap();
        paintSum();
        if (tab === 'course') paintAxis(); else paintCards();
      }

      /* --- 탭 --- */
      function setTab(t) {
        tab = t;
        root.querySelectorAll('.rc-tab').forEach((b) => {
          const on = b.dataset.tab === t;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        root.querySelectorAll('.rc-pane').forEach((p) => (p.hidden = p.dataset.pane !== t));
        if (t === 'course') sel.clear();
        paint();
      }
      root.querySelectorAll('.rc-tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

      /* --- 시간 축 손잡이 --- */
      function setTime(which, t) {
        if (which === 'start') d.start = clamp(Math.round(t), lo, d.end - 5);
        else d.end = clamp(Math.round(t), d.start + 5, hi);
        paint();
      }
      axis.querySelectorAll('.rc-handle').forEach((h) => {
        let on = false;
        h.addEventListener('pointerdown', (e) => { on = true; h.classList.add('is-drag'); h.setPointerCapture(e.pointerId); e.preventDefault(); });
        h.addEventListener('pointermove', (e) => {
          if (!on) return;
          const r = axis.getBoundingClientRect();
          setTime(h.dataset.h, lo + clamp((e.clientX - r.left) / r.width, 0, 1) * span);
        });
        const up = () => { on = false; h.classList.remove('is-drag'); };
        h.addEventListener('pointerup', up);
        h.addEventListener('pointercancel', up);
        h.addEventListener('keydown', (e) => {
          const k = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[e.key];
          if (!k) return;
          e.preventDefault();
          setTime(h.dataset.h, d[h.dataset.h] + k * (e.shiftKey ? 10 : 1));
        });
      });
      root.querySelectorAll('[data-chip]').forEach((c) => c.addEventListener('click', () => {
        const s = sorted(d);
        if (c.dataset.chip === 'rec') { d.start = Math.max(lo, REC.start); d.end = Math.min(hi, REC.end); }
        if (c.dataset.chip === 'first') { const p = s.find((x) => x.time >= lo); if (p) d.start = clamp(p.time, lo, d.end - 5); }
        if (c.dataset.chip === 'last') { const p = s.slice().reverse().find((x) => x.time <= hi); if (p) d.end = clamp(p.time, d.start + 5, hi); }
        paint();
      }));

      /* --- 사진 카드 --- */
      function select(ids, scroll) {
        const same = ids.length === sel.size && ids.every((id) => sel.has(id));
        sel = same ? new Set() : new Set(ids);
        paint();
        if (scroll && sel.size) {
          const el = cardsEl.querySelector(`[data-id="${ids[0]}"]`);
          if (el) cardsEl.scrollTo({ left: el.offsetLeft - cardsEl.clientWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
        }
      }
      cardsEl.addEventListener('click', (e) => {
        const rm = e.target.closest('[data-rm]');
        if (rm) {
          d.photos = d.photos.filter((p) => p.id !== rm.dataset.rm);
          sel.delete(rm.dataset.rm);
          paint();
          return;
        }
        if (e.target.closest('.rc-add')) { openPlace(); return; }
        const card = e.target.closest('.rc-card');
        if (card) select([card.dataset.id], false);
      });
      cardsEl.addEventListener('keydown', (e) => {
        const card = e.target.closest('.rc-card');
        if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select([card.dataset.id], false); }
      });

      /* --- 핀 끌기: 고른 핀만 코스 선을 따라 미끄러짐 --- */
      let pinDrag = null;
      mapbox.addEventListener('pointerdown', (e) => {
        if (mode !== 'edit' || tab !== 'photo') return;
        const pin = e.target.closest('.rc-pin');
        if (!pin) { if (sel.size) { sel.clear(); paint(); } return; }
        const ids = pin.dataset.ids.split(',');
        if (!pin.classList.contains('is-sel')) { select(ids, true); return; }
        e.preventDefault();
        const start = d.photos.find((p) => p.id === ids[0]);
        pinDrag = { pin, ids, moved: false, time: start.time };
        pin.setPointerCapture(e.pointerId);
        pin.classList.add('is-drag');
        mapbox.insertAdjacentHTML('beforeend', `<i class="rc-ghost" style="${pin.getAttribute('style')}"></i><span class="rc-tip rc-stamp" style="${pin.getAttribute('style')}">${M.hm(start.time)}</span>`);
        pinDrag.tip = mapbox.querySelector('.rc-tip');
      });
      mapbox.addEventListener('pointermove', (e) => {
        if (!pinDrag) return;
        const r = mapbox.getBoundingClientRect();
        let f = M.nearest(REC.track, r.width, r.height, e.clientX - r.left, e.clientY - r.top);
        f = clamp(f, frac(d.start), frac(d.end));
        const t = clamp(Math.round(timeAt(f)), d.start, d.end);
        const style = M.pct(WL.ui.pointAt(REC.track, frac(t)));
        pinDrag.pin.setAttribute('style', style);
        pinDrag.tip.setAttribute('style', style);
        pinDrag.tip.textContent = M.hm(t);
        pinDrag.time = t;
        pinDrag.moved = true;
      });
      const pinUp = () => {
        if (!pinDrag) return;
        const g = pinDrag;
        pinDrag = null;
        if (g.moved) d.photos.forEach((p) => { if (g.ids.includes(p.id)) p.time = g.time; });
        paint();
      };
      mapbox.addEventListener('pointerup', pinUp);
      mapbox.addEventListener('pointercancel', pinUp);

      /* --- ②-a 위치 정하기 · ②-a′ 주소로 찾기 · ②-b 사진 고르기 --- */
      function openPanel(html) {
        const el = document.createElement('div');
        el.className = 'overlay rc-panel';
        el.innerHTML = html;
        app().appendChild(el);
        panels.push(el);
        return el;
      }
      function closePanel(el) {
        el.classList.add('leaving');
        setTimeout(() => el.remove(), 200);
      }
      function openPlace() {
        const appR = app().getBoundingClientRect();
        const mr = mapbox.getBoundingClientRect();
        let f = (frac(d.start) + frac(d.end)) / 2;
        const el = openPanel(`
          <div class="rc-pmap">${WL.ui.mapBg(7, { water: 0 })}
            <div class="rc-pbox" style="position:absolute;left:0;right:0;top:${mr.top - appR.top}px;height:${mr.height}px">${mapLayer(d, { pins: true })}${DROP}<span class="rc-tip rc-stamp"></span></div>
          </div>
          <div class="rc-ptop">
            <button type="button" class="icon-btn rc-pclose" aria-label="닫기">${icon('close')}</button>
            <button type="button" class="rc-search">${icon('search', 22)}주소로 찾기</button>
          </div>
          <div class="rc-pbottom">
            <span class="rc-hint t-label">사진을 찍은 곳을 코스 위에 눌러요</span>
            <button type="button" class="pill ink block rc-put">이 자리에 사진 넣기</button>
          </div>`);
        const box = el.querySelector('.rc-pbox');
        const drop = el.querySelector('.rc-drop');
        const tip = el.querySelector('.rc-tip');
        const place = (nf) => {
          f = clamp(nf, frac(d.start), frac(d.end));
          const style = M.pct(WL.ui.pointAt(REC.track, f));
          drop.setAttribute('style', style);
          tip.setAttribute('style', style);
          tip.textContent = M.hm(Math.round(timeAt(f)));
        };
        place(f);
        const pmap = el.querySelector('.rc-pmap');
        let down = false;
        const at = (e) => {
          const r = box.getBoundingClientRect();
          place(M.nearest(REC.track, r.width, r.height, e.clientX - r.left, e.clientY - r.top));
        };
        pmap.addEventListener('pointerdown', (e) => { down = true; drop.classList.add('is-drag'); pmap.setPointerCapture(e.pointerId); at(e); });
        pmap.addEventListener('pointermove', (e) => { if (down) at(e); });
        const up = () => { down = false; drop.classList.remove('is-drag'); };
        pmap.addEventListener('pointerup', up);
        pmap.addEventListener('pointercancel', up);
        el.querySelector('.rc-pclose').addEventListener('click', () => closePanel(el));
        el.querySelector('.rc-search').addEventListener('click', () => openAddr(el, (nf) => place(frac(d.start) + nf * (frac(d.end) - frac(d.start)))));
        el.querySelector('.rc-put').addEventListener('click', () => openPick(Math.round(timeAt(f)), el));
      }
      function openAddr(host, onPick) {
        host.insertAdjacentHTML('beforeend', `<div class="rc-addr">
          <div class="rc-addr-top">
            <label class="rc-addr-in">${icon('search', 22)}<input type="search" value="망원동 413" aria-label="주소" enterkeyhint="search"></label>
            <button type="button" class="rc-addr-cancel">취소</button>
          </div>
          <p class="t-caption rc-addr-h">코스에서 가까운 순</p>
          <div class="rc-addr-list"></div>
        </div>`);
        const box = host.querySelector('.rc-addr');
        const input = box.querySelector('input');
        const list = box.querySelector('.rc-addr-list');
        const fill = () => {
          const q = input.value.replace(/\s/g, '');
          const rows = ADDR.filter((a) => !q || (a.t + a.s).replace(/\s/g, '').includes(q));
          list.innerHTML = rows.length ? rows.map((a) => `<button type="button" class="rc-addr-row ${a.far ? 'is-far' : ''}" data-i="${ADDR.indexOf(a)}">${icon('pin', 22)}<span class="grow"><b>${esc(a.t)}</b><span class="t-caption">${esc(a.s)}</span></span><span class="rc-far">코스까지 <b class="mp-num">${a.m >= 1000 ? (a.m / 1000).toFixed(1) : a.m}</b>${a.m >= 1000 ? 'km' : 'm'}</span></button>`).join('')
            : '<p class="rc-addr-empty t-label">코스 근처에서 찾지 못했어요. 지도를 눌러 직접 정해요.</p>';
        };
        fill();
        input.addEventListener('input', fill);
        setTimeout(() => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }, 60);
        box.querySelector('.rc-addr-cancel').addEventListener('click', () => box.remove());
        list.addEventListener('click', (e) => {
          const row = e.target.closest('.rc-addr-row');
          if (!row) return;
          const a = ADDR[+row.dataset.i];
          if (a.far) { WL.ui.toast('코스에서 너무 멀어요. 코스 근처 주소를 골라요', { bottom: 96 }); return; }
          onPick(a.f);
          box.remove();
        });
      }
      function openPick(t, placeEl) {
        const used = new Set(d.photos.map((p) => p.src));
        const near = NEAR.map(([n, m]) => ({ src: P(n), time: t + m })).filter((x) => !used.has(x.src));
        const more = TODAY_MORE.map((n) => ({ src: P(n) })).filter((x) => !used.has(x.src));
        const all = [...near, ...more];
        const order = [];
        const tile = (x, i) => `<button type="button" class="rc-tile" data-i="${i}" aria-pressed="false"><img src="${x.src}" alt="" loading="lazy">${x.time ? `<span class="rc-ttime rc-stamp">${M.hm(x.time)}</span>` : ''}<span class="rc-check"></span></button>`;
        const el = openPanel(`<div class="rc-pick">
          <header class="rc-head"><button type="button" class="icon-btn rc-back rc-pback" aria-label="뒤로">${icon('back')}</button><h1 class="t-title">사진 고르기</h1></header>
          ${near.length ? `<p class="rc-pick-h t-label-b">이 시각 즈음 <span class="rc-stamp">${M.hm(t - 10)} – ${M.hm(t + 10)}</span></p><div class="rc-grid">${near.map(tile).join('')}</div>` : ''}
          <p class="rc-pick-h t-label-b">11월 19일 · 오늘</p>
          <div class="rc-grid">${more.map((x, i) => tile(x, i + near.length)).join('')}</div>
        </div>
        <div class="rc-pick-foot"><button type="button" class="pill ink block rc-addn" disabled>사진을 골라요</button></div>`);
        const btn = el.querySelector('.rc-addn');
        const sync = () => {
          el.querySelectorAll('.rc-tile').forEach((b) => {
            const k = order.indexOf(+b.dataset.i);
            b.classList.toggle('is-on', k >= 0);
            b.setAttribute('aria-pressed', k >= 0 ? 'true' : 'false');
            b.querySelector('.rc-check').textContent = k >= 0 ? k + 1 : '';
          });
          btn.disabled = !order.length;
          btn.textContent = order.length ? `${order.length}장 넣기` : '사진을 골라요';
        };
        el.querySelector('.rc-pick').addEventListener('click', (e) => {
          const b = e.target.closest('.rc-tile');
          if (!b) return;
          const i = +b.dataset.i;
          const k = order.indexOf(i);
          if (k >= 0) order.splice(k, 1); else order.push(i);
          sync();
        });
        el.querySelector('.rc-pback').addEventListener('click', () => closePanel(el));
        btn.addEventListener('click', () => {
          const ids = order.map((i) => {
            const id = 'n' + ++d.seq;
            d.photos.push({ id, src: all[i].src, time: t });
            return id;
          });
          closePanel(el);
          closePanel(placeEl);
          sel = new Set(ids);
          setTab('photo');
          sel = new Set(ids);
          paint();
          const first = cardsEl.querySelector(`[data-id="${ids[0]}"]`);
          if (first) cardsEl.scrollTo({ left: first.offsetLeft - 20, behavior: 'smooth' });
          WL.ui.toast(`사진 ${ids.length}장을 넣었어요`, { bottom: 96 });
        });
      }

      /* --- ② → ③ 스크롤 전환 --- */
      function fillWrite() {
        const lp = logPhotos(d).sort((a, b) => a.time - b.time);
        write.innerHTML = `
          <p class="rc-wmeta">${range(d)}${stats(d, true)}</p>
          <div class="rc-mini">${lp.map((p, i) => `<img src="${p.src}" alt="" style="--i:${i}">`).join('')}</div>
          <div class="rc-field"><label class="t-label-b" for="rc-title">제목</label><input id="rc-title" class="rc-input" maxlength="40" value="${esc(d.title)}" autocomplete="off"></div>
          <div class="rc-field"><label class="t-label-b" for="rc-body">설명</label><textarea id="rc-body" class="rc-input" maxlength="500">${esc(d.body)}</textarea></div>
          <div class="rc-field"><p class="t-label-b">공개 범위</p>
            <div class="rc-seg ${d.vis === 'private' ? 'is-private' : ''}" role="group" aria-label="공개 범위">
              <button type="button" data-vis="public" aria-pressed="${d.vis === 'public'}">${icon('globe', 20)}공개</button>
              <button type="button" data-vis="private" aria-pressed="${d.vis === 'private'}">${icon('lock', 20)}나만 보기</button>
            </div>
          </div>`;
        const title = write.querySelector('#rc-title');
        title.addEventListener('input', () => { d.title = title.value; go.disabled = !d.title.trim(); });
        write.querySelector('#rc-body').addEventListener('input', (e) => (d.body = e.target.value));
        write.querySelectorAll('[data-vis]').forEach((b) => b.addEventListener('click', () => {
          d.vis = b.dataset.vis;
          write.querySelector('.rc-seg').classList.toggle('is-private', d.vis === 'private');
          write.querySelectorAll('[data-vis]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.vis === d.vis ? 'true' : 'false'));
        }));
      }
      const previewH = () => Math.round(Math.min(200, Math.max(150, (mapwrap.clientWidth - 40) * 0.442)));
      function toWrite() {
        mode = 'write';
        sel.clear();
        const h0 = mapwrap.offsetHeight;
        const mw = mapbox.offsetWidth, mbh = mapbox.offsetHeight;
        const pw = mapwrap.clientWidth - 40, ph = previewH();
        course.style.setProperty('--mw', `${mw}px`);
        course.style.setProperty('--mbh', `${mbh}px`);
        course.style.setProperty('--ms', Math.min(pw / mw, (ph * 0.86) / (mbh * 0.6)).toFixed(3));
        mapwrap.style.height = `${h0}px`;
        course.classList.remove('is-edit');
        course.classList.add('is-write', 'is-entering');
        root.querySelector('.rc-stepwrap').innerHTML = steps(3);
        fillWrite();
        paintMap();
        go.textContent = '등록';
        go.disabled = !d.title.trim();
        void mapwrap.offsetHeight;
        mapwrap.style.height = `${previewH()}px`;
        root.scrollTo({ top: 0 });
        later(() => course.classList.remove('is-entering'), 900);
      }
      function toEdit() {
        mode = 'edit';
        root.scrollTo({ top: 0 });
        const hPrev = mapwrap.offsetHeight;
        course.classList.remove('is-write', 'is-entering');
        course.classList.add('is-edit');
        course.style.setProperty('--ms', '1');
        later(() => ['--mw', '--mbh', '--ms'].forEach((v) => course.style.removeProperty(v)), 560);
        mapwrap.style.height = '';
        const hT = mapwrap.offsetHeight;
        mapwrap.style.height = `${hPrev}px`;
        void mapwrap.offsetHeight;
        mapwrap.style.height = `${hT}px`;
        later(() => (mapwrap.style.height = ''), 560);
        root.querySelector('.rc-stepwrap').innerHTML = steps(2);
        go.textContent = '다음';
        go.disabled = false;
        paint();
      }
      go.addEventListener('click', () => {
        if (mode === 'edit') toWrite();
        else if (d.title.trim()) WL.go('/record/done');
      });
      mapwrap.addEventListener('click', () => { if (mode === 'write') toEdit(); });
      root.querySelector('.rc-back').addEventListener('click', () => (mode === 'write' ? toEdit() : WL.back('/map')));

      paintAxisStatic();
      paint();
      const onResize = () => { if (tab === 'course') paintAxis(); if (mode === 'write') mapwrap.style.height = `${previewH()}px`; };
      window.addEventListener('resize', onResize);
      return () => {
        timers.forEach(clearTimeout);
        panels.forEach((p) => p.remove());
        window.removeEventListener('resize', onResize);
      };
    },
  };

  /* ========== 등록 완료 ========== */
  WL.screens.recordDone = {
    title: '등록 완료',
    nav: null,
    render() {
      const d = draft();
      return `<div class="rc-done">
        <div class="rc-done-top"><a class="icon-btn" href="#/map" aria-label="닫기">${icon('close')}</a></div>
        <div class="rc-stage"><div class="rc-stage-in"></div></div>
        <div class="rc-result" aria-live="polite">
          <h1 class="t-title">로그를 등록했어요</h1>
          <p class="t-subhead">${esc(d.title || REC.title)}</p>
          <p class="rc-wmeta">${range(d)}${stats(d, true)}</p>
        </div>
        <div class="rc-done-foot"><a class="pill ink block" href="#/log/l-1118">로그 보기</a></div>
      </div>`;
    },
    mount(root) {
      const d = draft();
      const stage = root.querySelector('.rc-stage-in');
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const a = frac(d.start), b = frac(d.end);
      /* ② 지도 칸 비율(402×434)로 펴서 무대 가운데에 맞춤 */
      const unit = M.seg(REC.track, a, b).map((p) => [p[0] * 4.02, p[1] * 4.34]);
      const xs = unit.map((p) => p[0]), ys = unit.map((p) => p[1]);
      const bw = Math.max(1, Math.max(...xs) - Math.min(...xs)), bh = Math.max(1, Math.max(...ys) - Math.min(...ys));
      const pad = 24;
      const s = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh);
      const ox = (W - bw * s) / 2 - Math.min(...xs) * s, oy = (H - bh * s) / 2 - Math.min(...ys) * s;
      const px = (p) => [p[0] * 4.02 * s + ox, p[1] * 4.34 * s + oy];
      const pts = unit.map((p) => [p[0] * s + ox, p[1] * s + oy]);
      const L = M.lens(pts);
      const total = L[L.length - 1] || 1;
      const atLen = (l) => {
        for (let i = 1; i < pts.length; i++) {
          if (l <= L[i]) {
            const r = (l - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
            return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * r, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * r];
          }
        }
        return pts[pts.length - 1];
      };
      /* 핀이 선 위 어디쯤(길이 비율)인지: 점이 그 자리를 지날 때 톡 */
      const lenOf = (q) => {
        let best = { dist: Infinity, l: 0 };
        for (let i = 1; i < pts.length; i++) {
          const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
          const vx = bx - ax, vy = by - ay;
          const t = clamp(((q[0] - ax) * vx + (q[1] - ay) * vy) / (vx * vx + vy * vy || 1), 0, 1);
          const dist = Math.hypot(ax + vx * t - q[0], ay + vy * t - q[1]);
          if (dist < best.dist) best = { dist, l: L[i - 1] + (L[i] - L[i - 1]) * t };
        }
        return best.l / total;
      };
      const dPath = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
      const photos = logPhotos(d).sort((x, y) => x.time - y.time).map((p) => {
        const q = px(WL.ui.pointAt(REC.track, frac(p.time)));
        return { p, q, at: lenOf(q) };
      });
      const e = pts[pts.length - 1];
      const st = pts[0];
      const bits = [];
      const cols = ['var(--tomato)', 'var(--lemon)', 'var(--ink)'];
      for (let i = 0; i < 12; i++) bits.push(`<i class="rc-bit" style="--a:${i * 30 + 8}deg;--r:${50 + (i % 3) * 6}px;background:${cols[i % 3]};animation-delay:${(i % 4) * 12}ms"></i>`);
      for (let i = 0; i < 8; i++) bits.push(`<i class="rc-bit" style="--a:${i * 45 + 30}deg;--r:${26 + (i % 2) * 4}px;height:8px;background:${cols[(i + 1) % 3]};animation-delay:${40 + (i % 3) * 14}ms"></i>`);
      stage.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
          <path d="${dPath}" fill="none" stroke="var(--route-day)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
          <path class="rc-dline" d="${dPath}" fill="none" stroke="var(--tomato)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${total} ${total}" stroke-dashoffset="${total}"/>
        </svg>
        <i class="rc-dstart" style="left:${st[0]}px;top:${st[1]}px"></i>
        ${photos.map((x, i) => `<span class="rc-dpin" data-k="${i}" style="left:${x.q[0].toFixed(1)}px;top:${x.q[1].toFixed(1)}px"><span class="rc-ring"></span><img src="${x.p.src}" alt=""></span>`).join('')}
        <span class="rc-burst" style="left:${e[0]}px;top:${e[1]}px"><span class="rc-bigring"></span>${bits.join('')}</span>
        <i class="rc-dend" style="left:${e[0]}px;top:${e[1]}px"></i>
        <i class="rc-lead" style="left:${st[0]}px;top:${st[1]}px"></i>`;
      const line = stage.querySelector('.rc-dline');
      const lead = stage.querySelector('.rc-lead');
      const pins = [...stage.querySelectorAll('.rc-dpin')];
      const result = root.querySelector('.rc-result');
      const foot = root.querySelector('.rc-done-foot');
      const popped = new Set();
      let raf = 0;
      let tEnd = 0;
      function finish() {
        line.setAttribute('stroke-dashoffset', '0');
        lead.style.opacity = '0';
        pins.forEach((p) => p.classList.add('is-pop'));
        stage.querySelector('.rc-dend').classList.add('is-pop');
        stage.querySelector('.rc-burst').classList.add('is-on');
        tEnd = setTimeout(() => { result.classList.add('is-on'); foot.classList.add('is-on'); }, reduce() ? 0 : 360);
      }
      if (reduce()) { finish(); return () => clearTimeout(tEnd); }
      const t0 = performance.now();
      const ease = (x) => 1 - Math.pow(1 - x, 3);
      const tick = (now) => {
        const k = clamp((now - t0 - 120) / 1100, 0, 1);
        const u = ease(k);
        const l = u * total;
        line.setAttribute('stroke-dashoffset', (total - l).toFixed(2));
        const q = atLen(l);
        lead.style.left = `${q[0]}px`;
        lead.style.top = `${q[1]}px`;
        photos.forEach((x, i) => {
          if (!popped.has(i) && u >= x.at - 0.005) { popped.add(i); pins[i].classList.add('is-pop'); }
        });
        if (k < 1) raf = requestAnimationFrame(tick);
        else finish();
      };
      raf = requestAnimationFrame(tick);
      return () => { cancelAnimationFrame(raf); clearTimeout(tEnd); };
    },
  };
})();
