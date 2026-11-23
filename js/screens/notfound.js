/* 404: 크림 바탕, 먹색 고리 코스(664:3065)의 구간과 점이 제각각 떨어져 화면 밖으로 사라진다 */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  /* 피그마 761:4718 '코스' 362×359 안의 꼭짓점. 0 = 출발(채운 점), 9 = 끝(속 빈 큰 점) */
  const PTS = [[52.01, 320.52], [20.14, 191.37], [64.21, 67.29], [162.53, 10], [268.29, 33.73], [341.85, 148.65], [334.73, 296.46], [248.64, 344.25], [150.32, 339.51], [88.96, 349]];
  const W = 362, H = 359;

  const rnd = (a, b) => a + Math.random() * (b - a);

  WL.screens.notFound = {
    title: '찾을 수 없어요',
    render() {
      return `<div class="nf">
        <div class="nf-stage">
          <div class="nf-box" role="button" tabindex="0" aria-label="코스 다시 보기">
            <div class="nf-pieces" aria-hidden="true"></div>
            <div class="nf-text"><p class="nf-404">404</p><p class="nf-sub">NOT FOUND</p></div>
          </div>
        </div>
        <div class="nf-actions"><a class="pill ink block" href="#/home">홈으로 가기</a></div>
      </div>`;
    },
    mount(root) {
      const box = root.querySelector('.nf-box');
      const layer = root.querySelector('.nf-pieces');
      if (!box || !layer) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let raf = 0, timers = [], pieces = [], done = false;

      function build() {
        const s = box.clientWidth / W;
        layer.innerHTML = '';
        pieces = [];
        for (let i = 0; i < PTS.length - 1; i++) {
          const [x1, y1] = PTS[i], [x2, y2] = PTS[i + 1];
          const len = Math.hypot(x2 - x1, y2 - y1) * s;
          const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          const el = document.createElement('i');
          el.className = 'nf-piece nf-seg';
          el.style.width = len + 'px';
          const base = { x: ((x1 + x2) / 2) * s - len / 2, y: ((y1 + y2) / 2) * s - 3, rot: ang };
          pieces.push({ el, base, kind: 'seg' });
          layer.appendChild(el);
        }
        PTS.forEach(([x, y], i) => {
          const size = i === 0 ? 14 : i === PTS.length - 1 ? 16 : 10;
          const el = document.createElement('i');
          el.className = 'nf-piece nf-dot' + (i === 0 ? ' start' : '');
          el.style.width = el.style.height = size + 'px';
          pieces.push({ el, base: { x: x * s - size / 2, y: y * s - size / 2, rot: 0 }, kind: 'dot' });
          layer.appendChild(el);
        });
        pieces.forEach((p) => place(p));
      }

      function place(p, dx = 0, dy = 0, dr = 0) {
        const b = p.base;
        p.el.style.transform = `translate(${b.x + dx}px, ${b.y + dy}px) rotate(${b.rot + dr}deg)`;
      }

      function play() {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        timers = [];
        done = false;
        build();
        if (reduce) { layer.innerHTML = ''; done = true; return; }
        const floor = root.clientHeight - box.getBoundingClientRect().top + root.getBoundingClientRect().top + 40;
        /* 피그마 움직임 메모: 선 0.35~1.9초, 점 0.5~2.3초에 순서 없이 시작, 직전 0.18초 흔들림,
           가속 1800~3400 px/s², 선만 −220~+220°/s 회전, 옆으로 ±40px 밀림 */
        pieces.forEach((p) => {
          p.t0 = p.kind === 'seg' ? rnd(0.35, 1.9) : rnd(0.5, 2.3);
          p.g = rnd(1800, 3400);
          p.vr = p.kind === 'seg' ? rnd(-220, 220) : 0;
          p.drift = rnd(-40, 40);
          p.gone = false;
        });
        const start = performance.now();
        const tick = (now) => {
          const t = (now - start) / 1000;
          let alive = 0;
          pieces.forEach((p) => {
            if (p.gone) return;
            alive++;
            const wob = p.t0 - 0.18;
            if (t < wob) return;
            if (t < p.t0) {
              const k = Math.sin((t - wob) * 70);
              place(p, k * 1.5, 0, p.kind === 'seg' ? k * 3 : 0);
              return;
            }
            const f = t - p.t0;
            const dy = 0.5 * p.g * f * f;
            const dx = p.drift * Math.min(1, f / 0.9);
            place(p, dx, dy, p.vr * f);
            if (p.base.y + dy > floor + 40) { p.gone = true; p.el.remove(); }
          });
          if (alive) raf = requestAnimationFrame(tick);
          else done = true;
        };
        raf = requestAnimationFrame(tick);
      }

      /* 다 떨어진 뒤 고리를 누르면 다시 그려서 한 번 더 */
      const replay = () => {
        if (!done && pieces.some((p) => !p.gone)) return;
        layer.classList.remove('is-in');
        void layer.offsetWidth;
        layer.classList.add('is-in');
        cancelAnimationFrame(raf);
        build();
        timers.push(setTimeout(play, 500));
      };
      box.addEventListener('click', replay);
      box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); replay(); } });

      play();
      return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
    },
  };
})();
