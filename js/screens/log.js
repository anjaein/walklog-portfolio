/* 내 로그 상세: 사진 위로 시트가 올라오는 화면, 오른쪽 사이드바 메뉴, 확인 창, 사진 보기 */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc, fmt } = WL.ui;
  const SHEET_PEEK = 254;
  const SHEET_TOP = 176;

  const alertIcon = (size = 40) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" fill="currentColor"/><path d="M12 9v4.5M12 17h.01" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  const lockSolid = (size = 40) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="5" y="10.5" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M12 15v2.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;

  /* 가운데 확인 창. 확인을 누르면 onOk */
  function confirmDialog({ iconHtml, tone = 'ink', title, warn, body, ok, onOk }) {
    const o = WL.ui.overlay(`<div class="modal h-dialog" role="alertdialog" aria-modal="true" aria-labelledby="h-dialog-t">
      <span class="h-dialog-icon is-${tone}">${iconHtml}</span>
      <p class="t-title" id="h-dialog-t">${title}</p>
      ${warn ? `<p class="t-body h-dialog-warn">${warn}</p>` : ''}
      ${body ? `<p class="t-body c-ink2">${body}</p>` : ''}
      <div class="h-dialog-btns">
        <button class="h-dialog-btn is-cancel" data-close>취소</button>
        <button class="h-dialog-btn is-${tone}" data-ok>${ok}</button>
      </div>
    </div>`);
    o.el.classList.add('h-dialog-wrap');
    o.el.querySelector('.dim').classList.add('h-dim-40');
    o.el.querySelector('[data-ok]').addEventListener('click', () => { o.close(); onOk && onOk(); });
    setTimeout(() => o.el.querySelector('[data-ok]').focus(), 50);
    return o;
  }
  WL.hx = WL.hx || {};
  WL.hx.confirm = confirmDialog;
  WL.hx.alertIcon = alertIcon;

  function metaLine(log) {
    if (log.visibility === 'private') return `${icon('lock', 16)}<span>나만 보기</span>`;
    return `${icon('globe', 16)}<span>공개</span><i class="h-dot"></i><span>좋아요 <b class="tnum">${log.likes}</b></span><i class="h-dot"></i><span>저장 <b class="tnum">${log.saves}</b></span>`;
  }

  function photoGrid(log) {
    const ph = log.photos;
    const show = ph.slice(0, 4);
    const more = ph.length - 4;
    return show.map((p, i) => `<button class="lg-ph" data-photo="${i}" aria-label="사진 ${i + 1} 크게 보기">
        <img src="${p.src}" alt="" loading="lazy">
        ${i === 3 && more > 0 ? `<span class="lg-ph-more">+${more}</span>` : ''}
      </button>`).join('');
  }

  WL.screens.log = {
    title: '로그',
    render(params) {
      const log = WL.find.myLog(params.id);
      if (!log) {
        return `<div class="h-empty lg-missing">
          <p class="t-subhead">로그를 찾을 수 없어요</p>
          <p class="t-label c-ink3">지웠거나 주소가 바뀌었어요</p>
          <a href="#/mylogs" class="pill s ink h-empty-cta">내 로그로 가기</a>
        </div>`;
      }
      const hero = log.photos[0].src;
      const thumbs = log.photos.length >= 3
        ? [log.photos[1], log.photos[Math.floor(log.photos.length / 2)], log.photos[log.photos.length - 2]].filter((p, i, a) => a.indexOf(p) === i)
        : log.photos;
      const [y, m, d] = log.date.split('-');
      return `<div class="lg">
        <div class="lg-hero" aria-hidden="true">
          <img src="${hero}" alt="">
          <span class="lg-scrim-top"></span>
          <span class="lg-scrim-bottom"></span>
          <div class="lg-hero-title">
            <h1 class="t-display">${esc(log.title)}</h1>
            <p class="t-label">${fmt.dot(log.date, log.dow)}</p>
          </div>
        </div>
        <div class="lg-top">
          <div class="lg-pin" aria-hidden="true">
            <div class="lg-pin-photo"><img src="${hero}" alt=""><span class="lg-scrim-top"></span></div>
            <div class="lg-pin-cap"><i class="sheet-handle"></i></div>
          </div>
          <button class="icon-btn is-float lg-btn lg-back" aria-label="뒤로">${icon('back', 24)}</button>
          <button class="icon-btn is-float lg-btn lg-menu" aria-label="메뉴" aria-haspopup="dialog">${icon('menu', 24)}</button>
          <div class="lg-mini">
            <p class="t-title">${esc(log.title)}</p>
            <p class="t-label">${fmt.dot(log.date, log.dow)}</p>
          </div>
        </div>
        <div class="lg-spacer"></div>
        <section class="lg-sheet" aria-label="${esc(log.title)}, ${+y}년 ${+m}월 ${+d}일">
          <i class="sheet-handle"></i>
          <p class="t-body lg-text">${esc(log.text)}</p>
          <div class="lg-map">
            ${WL.ui.mapBg(log.id.length + +d, { water: log.shape === 'hangang' || log.shape === 'river' ? 78 : 0 })}
            <div class="lg-map-course">${WL.ui.course(log.shape, { color: 'var(--ink)', width: 4, pad: 10, thumbs: thumbs.map((p) => ({ src: p.src, at: p.at })) })}</div>
            <a href="#/map/view?log=${log.id}" class="pill s line lg-map-btn">${icon('map', 16)}지도에서 보기</a>
          </div>
          <p class="lg-stats">
            <span><b class="n-stat tnum">${log.minutes}</b><span class="t-label c-ink3">분</span></span>
            <i class="h-dot"></i><span><b class="n-stat tnum">${log.km.toFixed(1)}</b><span class="t-label c-ink3">km</span></span>
            <i class="h-dot"></i><span><span class="t-label c-ink3">사진</span><b class="n-stat tnum">${log.photos.length}</b></span>
          </p>
          <div class="lg-grid">${photoGrid(log)}</div>
          <p class="lg-meta t-label c-ink3">${metaLine(log)}</p>
        </section>
      </div>`;
    },

    mount(root, params) {
      const log = WL.find.myLog(params.id);
      const veil = document.querySelector('.h-expand');
      if (veil) {
        veil.classList.add('is-done');
        setTimeout(() => veil.remove(), 260);
      }
      if (!log) return;
      WL.hx.flush && WL.hx.flush();

      const spacer = root.querySelector('.lg-spacer');
      const big = root.querySelector('.lg-hero-title');
      const mini = root.querySelector('.lg-mini');
      const pin = root.querySelector('.lg-pin');
      let raf = 0;
      const update = () => {
        raf = 0;
        const travel = Math.max(1, spacer.offsetHeight - SHEET_TOP);
        const s = root.scrollTop;
        const p = Math.min(1, Math.max(0, s / travel));
        big.style.opacity = String(Math.max(0, 1 - p * 1.7));
        big.style.transform = `translateY(${-p * 28}px)`;
        mini.style.opacity = String(Math.max(0, (p - 0.55) / 0.45));
        mini.style.transform = `translateY(${(1 - p) * 10}px)`;
        pin.classList.toggle('is-on', s >= travel - 0.5);
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
      root.addEventListener('scroll', onScroll, { passive: true });
      update();

      root.querySelector('.lg-back').addEventListener('click', () => WL.back('/mylogs'));
      root.querySelector('.lg-menu').addEventListener('click', () => openMenu(root, log));
      root.querySelector('.lg-grid').addEventListener('click', (e) => {
        const b = e.target.closest('[data-photo]');
        if (b) openViewer(log, +b.dataset.photo);
      });
      return () => { if (raf) cancelAnimationFrame(raf); };
    },
  };

  /* 오른쪽 사이드바: 수정 / 공개 범위 / 공유 / 삭제 */
  function openMenu(root, log) {
    const head = (title, back) => `<div class="lg-dr-head${back ? ' is-sub' : ''}">
        ${back ? `<button class="lg-dr-icon" data-main aria-label="뒤로">${icon('back', 22)}</button>` : ''}
        <div class="lg-dr-title">${title}</div>
        <button class="lg-dr-icon" data-close aria-label="닫기">${icon('close', 22)}</button>
      </div>`;
    const mainPage = () => `${head(`<p class="t-subhead">${esc(log.title)}</p><p class="t-caption c-ink3">${fmt.dot(log.date, log.dow)}</p>`)}
      <nav class="lg-dr-list">
        <button class="lg-dr-row" data-act="edit">${icon('edit', 24)}<span>수정</span></button>
        <button class="lg-dr-row" data-act="vis">${icon('globe', 24)}<span>공개 범위</span><em class="t-caption c-ink3">${log.visibility === 'private' ? '나만 보기' : '공개'}</em>${icon('chevronRight', 18)}</button>
        <button class="lg-dr-row" data-act="share">${icon('share', 24)}<span>공유</span></button>
      </nav>
      <button class="lg-dr-row lg-dr-danger" data-act="delete">${icon('trash', 24)}<span>삭제</span></button>`;
    const visPage = () => `${head('<p class="t-subhead">공개 범위</p>', true)}
      <div class="lg-dr-list" role="radiogroup" aria-label="공개 범위">
        <button class="lg-dr-row" role="radio" aria-checked="${log.visibility !== 'private'}" data-vis="public">${icon('globe', 24)}<span>공개</span><i class="lg-radio"></i></button>
        <button class="lg-dr-row" role="radio" aria-checked="${log.visibility === 'private'}" data-vis="private">${icon('lock', 24)}<span>나만 보기</span><i class="lg-radio"></i></button>
      </div>`;

    const o = WL.ui.overlay(`<aside class="drawer lg-drawer" role="dialog" aria-modal="true" aria-label="로그 메뉴"><div class="lg-dr-page">${mainPage()}</div></aside>`);
    const page = o.el.querySelector('.lg-dr-page');
    const show = (html, dir) => {
      page.innerHTML = html;
      page.classList.remove('slide-l', 'slide-r');
      void page.offsetWidth;
      page.classList.add(dir === 'in' ? 'slide-l' : 'slide-r');
    };
    const refreshMeta = () => { root.querySelector('.lg-meta').innerHTML = metaLine(log); };

    o.el.addEventListener('click', (e) => {
      if (e.target.closest('[data-main]')) { show(mainPage(), 'out'); return; }
      const act = e.target.closest('[data-act]');
      if (act) {
        const a = act.dataset.act;
        if (a === 'vis') show(visPage(), 'in');
        if (a === 'edit') { o.close(); setTimeout(() => WL.go('/record/course?edit=' + log.id), 200); }
        if (a === 'share') {
          const url = location.href.split('#')[0] + '#/log/' + log.id;
          if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
          o.close();
          WL.ui.toast(WL.data.toasts.linkCopied, { noNav: true, icon: 'link' });
        }
        if (a === 'delete') {
          confirmDialog({
            iconHtml: alertIcon(40), tone: 'danger', title: '로그를 삭제할까요?', warn: '삭제하면 되돌릴 수 없어요', ok: '삭제',
            onOk: () => {
              const i = WL.data.myLogs.indexOf(log);
              if (i > -1) WL.data.myLogs.splice(i, 1);
              WL.hx.deckIndex = 0;
              o.close();
              WL.hx.later(WL.data.toasts.deleted);
              setTimeout(() => WL.go('/mylogs'), 160);
            },
          });
        }
        return;
      }
      const vis = e.target.closest('[data-vis]');
      if (vis) {
        const want = vis.dataset.vis;
        if (want === log.visibility || (want === 'public' && log.visibility !== 'private')) return;
        const apply = () => {
          log.visibility = want;
          page.querySelectorAll('[data-vis]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.vis === want)));
          refreshMeta();
          setTimeout(() => o.close(), 180);
          WL.ui.toast(want === 'private' ? '나만 보기로 바꿨어요' : WL.data.toasts.madePublic, { noNav: true });
        };
        if (want === 'private') {
          confirmDialog({
            iconHtml: lockSolid(40), tone: 'ink', title: '나만 보기로 바꿀까요?', body: '이 로그를 저장한 사람도<br>더 이상 볼 수 없어요.', ok: '바꾸기',
            onOk: apply,
          });
        } else apply();
      }
    });
  }

  /* 사진 보기: 꽉 찬 사진, 위 진행 막대, 아래 썸네일 줄 */
  function openViewer(log, start) {
    const app = document.getElementById('app');
    const ph = log.photos;
    let i = start;
    const wrap = document.createElement('div');
    wrap.className = 'overlay lg-viewer';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', '사진 보기');
    wrap.innerHTML = `
      <div class="lg-v-track">${ph.map((p, k) => `<img src="${p.src}" alt="${esc(p.note || log.title + ' 사진 ' + (k + 1))}" data-k="${k}">`).join('')}</div>
      <span class="lg-scrim-top"></span><span class="lg-v-scrim-bottom"></span>
      <div class="lg-v-bars">${ph.map(() => '<i></i>').join('')}</div>
      <div class="lg-v-head">
        <p class="t-label-b">${esc(log.title)}<i class="h-dot"></i><span class="d-stamp">${fmt.stamp(log.date)}</span></p>
        <button class="lg-v-close" aria-label="닫기">${icon('close', 22)}</button>
      </div>
      <button class="lg-v-hit is-prev" aria-label="이전 사진"></button>
      <button class="lg-v-hit is-next" aria-label="다음 사진"></button>
      <div class="lg-v-foot">
        <div class="lg-v-info"><span class="d-stat lg-v-time"></span><span class="lg-v-count n-meta tnum"></span></div>
        <div class="lg-v-thumbs">${ph.map((p, k) => `<button data-k="${k}" aria-label="사진 ${k + 1}"><img src="${p.src}" alt=""></button>`).join('')}</div>
      </div>`;
    app.appendChild(wrap);

    const imgs = [...wrap.querySelectorAll('.lg-v-track img')];
    const bars = [...wrap.querySelectorAll('.lg-v-bars i')];
    const ths = [...wrap.querySelectorAll('.lg-v-thumbs button')];
    const go = (k) => {
      i = Math.max(0, Math.min(ph.length - 1, k));
      imgs.forEach((im, n) => {
        im.style.transform = `translateX(${(n - i) * 100}%)`;
        im.classList.toggle('is-on', n === i);
      });
      bars.forEach((b, n) => b.classList.toggle('is-on', n <= i));
      ths.forEach((b, n) => b.classList.toggle('is-on', n === i));
      const row = ths[i].parentElement;
      row.scrollTo({ left: ths[i].offsetLeft - row.clientWidth / 2 + ths[i].offsetWidth / 2, behavior: 'smooth' });
      wrap.querySelector('.lg-v-time').innerHTML = ph[i].time.replace(':', '<span class="lg-v-colon">:</span>');
      wrap.querySelector('.lg-v-count').textContent = `${i + 1} / ${ph.length}`;
    };
    const close = () => {
      wrap.classList.add('is-leaving');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => wrap.remove(), 200);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    document.addEventListener('keydown', onKey);
    wrap.querySelector('.lg-v-close').addEventListener('click', close);
    let swiped = false;
    wrap.querySelector('.is-prev').addEventListener('click', () => { if (!swiped) go(i - 1); });
    wrap.querySelector('.is-next').addEventListener('click', () => { if (!swiped) go(i + 1); });
    wrap.querySelector('.lg-v-thumbs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (b) go(+b.dataset.k);
    });
    let sx = null;
    wrap.addEventListener('pointerdown', (e) => { sx = e.clientX; swiped = false; });
    wrap.addEventListener('pointerup', (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) { swiped = true; go(i + (dx < 0 ? 1 : -1)); }
    });
    imgs.forEach((im) => (im.style.transition = 'none'));
    go(i);
    requestAnimationFrame(() => imgs.forEach((im) => (im.style.transition = '')));
    wrap.querySelector('.lg-v-close').focus();
  }
})();
