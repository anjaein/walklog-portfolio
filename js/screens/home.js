/* 홈 · 내 로그 · 보관함 */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc, fmt } = WL.ui;

  /* 화면 이동 뒤에 띄울 알림. 라우터가 이동할 때 알림을 지우기 때문에 다음 화면 mount에서 띄운다. */
  WL.hx = WL.hx || {};
  WL.hx.later = (msg, opts) => { WL.hx.pending = { msg, opts: opts || {} }; };
  WL.hx.flush = () => {
    const p = WL.hx.pending;
    if (!p) return;
    WL.hx.pending = null;
    setTimeout(() => WL.ui.toast(p.msg, p.opts), 120);
  };

  /* '47분 걸음' — 숫자만 Bricolage 굵게 */
  WL.hx.walked = (m) => {
    const n = (v) => `<b class="h-num">${v}</b>`;
    const t = m >= 60 ? `${n(Math.floor(m / 60))}시간 ${n(m % 60)}분` : `${n(m)}분`;
    return `${t} 걸음`;
  };
  WL.hx.stamp = (iso) => `<span class="d-stamp">${fmt.stamp(iso)}</span>`;

  const cover = (log) => log.photos[0].src;

  /* ── 홈 ───────────────────────────────────────── */

  function profileRow(me) {
    return `<header class="h-profile pad">
      <a href="#/settings/profile" class="h-profile-me" aria-label="프로필 편집">
        ${WL.ui.avatar(me.avatar, 48, me.name)}
        <span class="h-profile-text"><span class="t-subhead">${esc(me.name)}</span><span class="t-caption c-ink2">${esc(me.handle)}</span></span>
      </a>
      <a href="#/settings" class="icon-btn is-line" aria-label="설정">${icon('gear', 22)}</a>
    </header>`;
  }

  /* 오늘 하루 동선 중 이번 로그를 시작하기 전까지 */
  function dayBefore(t) {
    const day = WL.data.shapes[t.dayShape] || [];
    const first = (WL.data.shapes[t.shape] || [])[0];
    const k = first ? day.findIndex((p) => p[0] === first[0] && p[1] === first[1]) : -1;
    return k > 0 ? day.slice(0, k + 1) : day.slice(0, 2);
  }

  function todayWidget(fresh) {
    const t = WL.data.today;
    if (fresh) {
      return `<a href="#/record/time" class="widget h-today is-fresh" aria-label="오늘 로그 남기기">
        <span class="h-chip">오늘</span>
        <p class="t-title h-today-title">${esc(WL.data.me.area || '오늘')}</p>
        <div class="h-today-meta">
          <span class="h-today-min"><span class="d-big">0</span><span class="t-label">분</span></span>
          <span class="h-today-pic">${icon('camera', 16)}<span class="d-stamp">0</span></span>
        </div>
        <span class="h-today-origin" aria-hidden="true"></span>
      </a>`;
    }
    return `<a href="#/record/time" class="widget h-today" aria-label="걷는 중, ${esc(t.place)}, ${t.minutes}분째, 사진 ${t.photos}장">
      <span class="h-chip"><i class="h-rec"></i>걷는 중</span>
      <p class="t-title h-today-title">${esc(t.place)}</p>
      <div class="h-today-meta">
        <span class="h-today-min"><span class="d-big tnum">${t.minutes}</span><span class="t-label">분째</span></span>
        <span class="h-today-pic">${icon('camera', 16)}<span class="d-stamp">${t.photos}</span></span>
      </div>
      <div class="h-today-course">
        <div class="h-today-day">${WL.ui.course(dayBefore(t), { color: 'var(--ink)', width: 1.8, start: false, end: false, pad: 4 })}</div>
        ${WL.ui.course(t.shape, { color: 'var(--ink)', width: 4, pad: 4 })}
      </div>
    </a>`;
  }

  function myLogWidget(fresh) {
    const logs = WL.data.myLogs;
    const picks = fresh ? [null, null, null] : [logs[4], logs[2], logs[0]].filter(Boolean).map((l) => l.photos[0].src);
    const prints = picks.map((src, i) => `<span class="h-print p${i}">${src ? `<img src="${src}" alt="">` : '<i></i>'}</span>`).join('');
    return `<a href="#/mylogs${fresh ? '?empty=1' : ''}" class="widget h-mini h-mini-logs${fresh ? ' is-fresh' : ''}">
      <p class="t-subhead">내 로그</p>
      <p class="h-mini-count"><span class="d-stat tnum">${fresh ? 0 : logs.length}</span><span class="t-caption">개 기록</span></p>
      <span class="h-prints" aria-hidden="true">${prints}</span>
    </a>`;
  }

  function archiveWidget(fresh) {
    const n = fresh ? 0 : WL.data.archive.length;
    const cards = [0, 1, 2].map((i) => `<span class="h-postcard c${i}">${i === 2 && !fresh ? '<i class="h-stamp-mark"></i>' : ''}</span>`).join('');
    return `<a href="#/archive${fresh ? '?empty=1' : ''}" class="widget h-mini h-mini-archive${fresh ? ' is-fresh' : ''}">
      <p class="t-subhead">보관함</p>
      <p class="h-mini-count"><span class="d-stat tnum">${n}</span><span class="t-caption">개 저장함</span></p>
      <span class="h-postcards" aria-hidden="true">${cards}</span>
    </a>`;
  }

  function deckCard(log, slot) {
    return `<article class="h-card" data-slot="${slot}" data-id="${log.id}">
      <img class="photo" src="${cover(log)}" alt="" draggable="false">
      <span class="h-card-shade"></span>
      <span class="h-card-label t-label-b">${esc(log.title)}</span>
      <div class="h-card-info">
        <p class="t-title h-card-title">${esc(log.title)}</p>
        <p class="h-card-meta t-caption">${WL.hx.stamp(log.date)}<span>${WL.hx.walked(log.minutes)}</span></p>
      </div>
    </article>`;
  }

  function dotsHtml(n, i) {
    if (n < 2) return '';
    const max = 5;
    const start = Math.max(0, Math.min(i - 2, n - max));
    const end = Math.min(n, start + max);
    let out = '';
    for (let j = start; j < end; j++) {
      const k = j - start;
      let size = 6;
      if (j !== i) {
        if (k === max - 1 && end < n) size = 3;
        else if (k === max - 2 && end < n) size = 4;
        else if (k === 0 && start > 0) size = 3;
        else if (k === 1 && start > 0) size = 4;
      }
      out += `<i class="${j === i ? 'is-on' : ''}" style="width:${size}px;height:${size}px"></i>`;
    }
    return out;
  }

  function deckHtml(fresh) {
    if (fresh) {
      return `<section class="h-deck is-fresh" aria-label="내 로그 카드">
        <div class="h-deck-stage">
          <div class="h-card" data-slot="2"></div>
          <div class="h-card" data-slot="1"></div>
          <div class="h-card is-empty" data-slot="0"><i></i></div>
        </div>
      </section>`;
    }
    return `<section class="h-deck" aria-label="내 로그 카드, 옆으로 넘겨요" tabindex="0">
      <div class="h-deck-stage"></div>
      <div class="h-dots" aria-hidden="true"></div>
    </section>`;
  }

  WL.screens.home = {
    title: '홈',
    nav: 'home',
    render(params) {
      const fresh = !!params.fresh;
      return `<div class="h-home">
        ${profileRow(WL.data.me)}
        <div class="pad h-widgets">
          ${todayWidget(fresh)}
          <div class="h-mini-row">${myLogWidget(fresh)}${archiveWidget(fresh)}</div>
        </div>
        <div class="pad">${deckHtml(fresh)}</div>
        <div class="nav-space"></div>
      </div>`;
    },
    mount(root, params) {
      WL.hx.flush();
      if (params.fresh || !WL.data.myLogs.length) return;
      return mountDeck(root.querySelector('.h-deck'));
    },
  };

  /* 카드 더미: 앞 카드를 옆으로 밀면 다음 카드가 앞으로 온다. 누르면 로그 상세로 펼쳐진다. */
  function mountDeck(deck) {
    const stage = deck.querySelector('.h-deck-stage');
    const dots = deck.querySelector('.h-dots');
    const logs = WL.data.myLogs;
    let index = WL.hx.deckIndex && WL.hx.deckIndex < logs.length ? WL.hx.deckIndex : 0;
    let busy = false;
    const at = (k) => logs[(index + k) % logs.length];

    function paint() {
      const n = Math.min(3, logs.length);
      let html = '';
      for (let s = n - 1; s >= 0; s--) html += deckCard(at(s), s);
      stage.innerHTML = html;
      dots.innerHTML = dotsHtml(logs.length, index);
    }
    paint();

    function advance(dir) {
      if (busy || logs.length < 2) return;
      busy = true;
      const front = stage.querySelector('[data-slot="0"]');
      front.classList.add('is-leaving');
      front.style.transform = `translateX(${dir * 130}%) rotate(${dir * 14}deg)`;
      front.style.opacity = '0';
      stage.querySelectorAll('.h-card:not(.is-leaving)').forEach((c) => (c.dataset.slot = String(+c.dataset.slot - 1)));
      index = (index + 1) % logs.length;
      WL.hx.deckIndex = index;
      if (logs.length > 2) {
        stage.insertAdjacentHTML('afterbegin', deckCard(at(2), 3));
        const incoming = stage.firstElementChild;
        requestAnimationFrame(() => requestAnimationFrame(() => (incoming.dataset.slot = '2')));
      }
      dots.innerHTML = dotsHtml(logs.length, index);
      setTimeout(() => { front.remove(); busy = false; }, 340);
    }

    let drag = null;
    function onDown(e) {
      const card = e.target.closest('.h-card[data-slot="0"]');
      if (!card || busy) return;
      drag = { card, x: e.clientX, y: e.clientY, dx: 0, t: performance.now(), moved: false, id: e.pointerId };
      card.setPointerCapture(e.pointerId);
      card.classList.add('is-dragging');
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(drag.dx) > 6 && Math.abs(drag.dx) > Math.abs(dy)) drag.moved = true;
      if (drag.moved) drag.card.style.transform = `translateX(${drag.dx}px) rotate(${drag.dx / 22}deg)`;
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const { card, dx, moved, t } = drag;
      drag = null;
      card.classList.remove('is-dragging');
      const v = Math.abs(dx) / Math.max(1, performance.now() - t);
      if (moved && (Math.abs(dx) > 90 || v > 0.6)) { advance(Math.sign(dx) || 1); return; }
      card.style.transform = '';
      if (!moved) expand(card);
    }
    function onCancel() {
      if (!drag) return;
      drag.card.classList.remove('is-dragging');
      drag.card.style.transform = '';
      drag = null;
    }
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); advance(e.key === 'ArrowRight' ? -1 : 1); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expand(stage.querySelector('[data-slot="0"]')); }
    }
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onCancel);
    deck.addEventListener('keydown', onKey);
  }

  /* 카드가 화면 가득 커지며 로그 상세로 넘어간다. 상세 화면 mount가 덮개를 걷는다. */
  function expand(card) {
    if (!card) return;
    const id = card.dataset.id;
    const app = document.getElementById('app');
    const a = app.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    const wrap = document.createElement('div');
    wrap.className = 'h-expand';
    wrap.innerHTML = `<i class="h-expand-dim"></i><div class="h-expand-card"><img src="${card.querySelector('img').src}" alt=""></div>`;
    const box = wrap.querySelector('.h-expand-card');
    Object.assign(box.style, { left: r.left - a.left + 'px', top: r.top - a.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    app.appendChild(wrap);
    card.style.visibility = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.classList.add('is-open');
      Object.assign(box.style, { left: '0px', top: '0px', width: a.width + 'px', height: a.height + 'px' });
    }));
    setTimeout(() => WL.go('/log/' + id), 380);
    setTimeout(() => wrap.remove(), 2000);
  }

  /* ── 내 로그 · 보관함 공통 머리 ─────────────────────── */

  function listHead(title, count) {
    return `<div class="h-minibar" aria-hidden="true">
        <button class="h-back" data-back tabindex="-1">${icon('chevronLeft', 24)}</button>
        <span class="t-subhead">${title}</span><span class="h-count-s tnum">${count || ''}</span>
      </div>
      <header class="h-listhead">
        <button class="h-back" data-back aria-label="뒤로">${icon('chevronLeft', 28)}</button>
        <h1 class="t-display">${title}</h1><span class="h-count tnum">${count || ''}</span>
      </header>`;
  }

  function mountListHead(root) {
    const bar = root.querySelector('.h-minibar');
    const onScroll = () => bar.classList.toggle('is-on', root.scrollTop > 56);
    root.addEventListener('scroll', onScroll, { passive: true });
    root.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => WL.back('/home')));
  }

  function courseMark(shape) {
    return `<span class="h-lc-course" aria-hidden="true">${WL.ui.course(shape, { color: 'var(--on-dark)', width: 2, pad: 8 })}</span>`;
  }

  function emptyArt(kind) {
    const frames = kind === 'archive'
      ? '<span class="h-empty-frame f2"></span><span class="h-empty-frame f1"></span>'
      : '<span class="h-empty-frame f1"></span>';
    return `<div class="h-empty-art" aria-hidden="true">
      <svg viewBox="0 0 120 50" class="h-empty-line"><path d="M8 42 C 26 30, 40 30, 52 36 S 84 40, 100 26" fill="none" stroke="var(--ink-3)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.5 7"/></svg>
      <i class="h-empty-start"></i>
      ${frames}
    </div>`;
  }

  /* ── 내 로그 ───────────────────────────────────── */

  WL.screens.mylogs = {
    title: '내 로그',
    nav: 'home',
    render(params) {
      const logs = params.empty ? [] : WL.data.myLogs;
      if (!logs.length) {
        return `${listHead('내 로그', 0)}
          <div class="h-empty">
            ${emptyArt('logs')}
            <p class="t-subhead">아직 남긴 로그가 없어요</p>
            <p class="t-label c-ink3">걸은 길을 로그로 남기면 여기에 쌓여요</p>
            <a href="#/record/time" class="pill s tomato h-empty-cta">오늘의 로그 ${icon('chevronRight', 16)}</a>
          </div>`;
      }
      const cards = logs.map((l, i) => `<a href="#/log/${l.id}" class="h-lc" style="--i:${Math.min(i, 4)}" aria-label="${esc(l.title)}${l.visibility === 'private' ? ', 나만 보기' : ''}">
          <img class="photo" src="${cover(l)}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}">
          <span class="h-lc-scrim"></span>
          ${courseMark(l.shape)}
          ${l.visibility === 'private' ? `<span class="h-lc-lock" title="나만 보기">${icon('lock', 16)}</span>` : ''}
          <span class="h-lc-info">
            <span class="t-title h-lc-title">${esc(l.title)}</span>
            <span class="h-card-meta t-caption">${WL.hx.stamp(l.date)}<span>${WL.hx.walked(l.minutes)}</span></span>
          </span>
        </a>`).join('');
      return `${listHead('내 로그', logs.length)}<div class="pad h-list">${cards}</div><div class="nav-space"></div>`;
    },
    mount(root) {
      mountListHead(root);
      WL.hx.flush();
    },
  };

  /* ── 보관함 (남의 로그, 코발트) ────────────────────── */

  function archiveCard(p, i) {
    const u = WL.find.user(p.author) || {};
    return `<div class="h-lc h-ac" style="--i:${Math.min(i, 4)}" data-id="${p.id}">
      <a href="#/post/${p.id}" class="h-ac-link" aria-label="${esc(p.title)}, ${esc(u.name || '')}">
        <img class="photo" src="${p.photos[0]}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}">
        <span class="h-lc-scrim"></span>
        ${courseMark(p.shape)}
        <span class="h-lc-info">
          <span class="t-title h-lc-title">${esc(p.title)}</span>
          <span class="h-ac-meta t-caption">${WL.ui.avatar(u.avatar, 18, u.name)}<span>${esc(u.handle || '')}</span><span class="h-dot"></span><span>${WL.hx.walked(p.minutes)}</span></span>
        </span>
      </a>
      <button class="h-ac-save" aria-label="보관함에서 빼기" aria-pressed="true">${icon('bookmarkFill', 18)}</button>
    </div>`;
  }

  function archiveEmpty() {
    return `<div class="h-empty">
      ${emptyArt('archive')}
      <p class="t-subhead">저장한 코스가 없어요</p>
      <p class="t-label c-ink3">탐색에서 마음에 드는 코스를 저장해 보세요</p>
    </div>`;
  }

  WL.screens.archive = {
    title: '보관함',
    nav: 'home',
    render(params) {
      const posts = params.empty ? [] : WL.data.archive.map(WL.find.post).filter(Boolean);
      if (!posts.length) return `${listHead('보관함', 0)}${archiveEmpty()}`;
      return `${listHead('보관함', posts.length)}<div class="pad h-list">${posts.map(archiveCard).join('')}</div><div class="nav-space"></div>`;
    },
    mount(root) {
      mountListHead(root);
      WL.hx.flush();
      root.addEventListener('click', (e) => {
        const btn = e.target.closest('.h-ac-save');
        if (!btn) return;
        const card = btn.closest('.h-ac');
        if (card.classList.contains('is-removing')) return;
        const at = WL.data.archive.indexOf(card.dataset.id);
        if (at > -1) WL.data.archive.splice(at, 1);
        card.style.height = card.offsetHeight + 'px';
        card.classList.add('is-removing');
        requestAnimationFrame(() => { card.style.height = '0px'; });
        WL.ui.toast(WL.data.toasts.removedFromArchive);
        setTimeout(() => {
          card.remove();
          const left = WL.data.archive.length;
          root.querySelectorAll('.h-count, .h-count-s').forEach((c) => (c.textContent = left || ''));
          if (!left) {
            root.querySelector('.h-list').remove();
            const sp = root.querySelector('.nav-space');
            if (sp) sp.remove();
            root.insertAdjacentHTML('beforeend', archiveEmpty());
          }
        }, 300);
      });
    },
  };
})();
