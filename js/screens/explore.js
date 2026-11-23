/* 탐색 묶음: 탐색 목록, 검색, 남의 로그 상세 */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc, toast } = WL.ui;
  const D = WL.data;

  /* 공통 도우미 — 남의 프로필(user.js)도 WL.ex 로 같이 쓴다 */
  const saved0 = new Set(D.archive);
  const liked = new Set();
  const isSaved = (id) => D.archive.includes(id);
  const saveCount = (p) => p.saves + (isSaved(p.id) ? 1 : 0) - (saved0.has(p.id) ? 1 : 0);
  const likeCount = (p) => p.likes + (liked.has(p.id) ? 1 : 0);

  /* 보관함 목록(WL.data.archive)을 직접 고쳐서 홈 · 보관함 화면과 상태를 맞춘다 */
  function toggleSave(id) {
    const i = D.archive.indexOf(id);
    if (i >= 0) D.archive.splice(i, 1); else D.archive.unshift(id);
    const on = i < 0;
    toast(on ? D.toasts.saved : D.toasts.removedFromArchive);
    return on;
  }

  /* 같은 SVG 두 개를 겹쳐 두고 교차 페이드 (빈 북마크 ↔ 채운 북마크) */
  function bookmarkIcon(size) {
    return `<span class="ex-swap">${icon('bookmark', size, 'class="ex-off"')}${icon('bookmarkFill', size, 'class="ex-on"')}</span>`;
  }

  /* 피드 데이터에는 사진이 2~4장뿐이라 상세에서는 몇 장을 더 붙여 '사진 7'처럼 보이게 한다 */
  const POOL = ['coffee-bench', 'hangang-sunset', 'river-golden', 'ginkgo-yellow', 'park-path', 'old-alley', 'green-path', 'hangang-dusk', 'autumn-park', 'night-alley'].map(D.P);
  function gallery(p) {
    const n = +p.id.slice(2);
    const extraCount = (n * 3) % 5 + 1;
    const out = p.photos.slice();
    for (let k = 0; out.length < p.photos.length + extraCount && k < 40; k++) {
      const src = POOL[(n + k * 3) % POOL.length];
      if (!out.includes(src)) out.push(src);
    }
    return out;
  }

  const author = (p) => D.users[p.author] || { handle: '@' + p.author, name: p.author, avatar: null };
  const heartSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

  function card(p) {
    const u = author(p);
    const on = isSaved(p.id);
    return `<article class="ex-card" data-id="${p.id}">
      <img class="ex-card-img" src="${p.photos[0]}" alt="" loading="lazy">
      <span class="ex-card-shade" aria-hidden="true"></span>
      <span class="ex-card-shape" aria-hidden="true">${WL.ui.course(p.shape, { color: 'var(--on-dark)', width: 2, pad: 8, dot: 2 })}</span>
      <a class="ex-card-link" href="#/post/${p.id}">
        <strong class="ex-card-title">${esc(p.title)}</strong>
        <span class="ex-card-meta">
          <span>${esc(u.handle)}</span><span aria-hidden="true">·</span>
          <span class="ex-time"><b class="ex-doto">${p.minutes}</b>분</span><span aria-hidden="true">·</span>
          <span><b class="n-meta">${p.distance.toFixed(1)}</b>km</span>
        </span>
      </a>
      <span class="ex-card-likes">${heartSvg(14)}<b class="n-meta tnum">${likeCount(p)}</b><span class="sr">좋아요</span></span>
      <button class="ex-card-save" type="button" data-save="${p.id}" aria-pressed="${on}" aria-label="보관함에 담기">${bookmarkIcon(18)}</button>
    </article>`;
  }

  /* 저장 버튼: 목록 어디서든 data-save 로 처리 */
  function bindSave(root) {
    const onClick = (e) => {
      const b = e.target.closest('[data-save]');
      if (!b) return;
      e.preventDefault();
      const on = toggleSave(b.dataset.save);
      root.querySelectorAll(`[data-save="${b.dataset.save}"]`).forEach((x) => x.setAttribute('aria-pressed', on));
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }

  /* ───────── 탐색 ───────── */
  let currentFilter = 'nearby';

  function filtered(id) {
    const list = D.feed.filter((p) => p.tags.includes(id));
    if (id === 'nearby') return list.sort((a, b) => a.distance - b.distance);
    if (id === 'popular') return list.sort((a, b) => b.likes - a.likes);
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function listHtml(id) {
    const list = filtered(id);
    if (!list.length) return `<p class="ex-none t-body c-ink3">아직 이 주제의 로그가 없어요</p>`;
    return list.map(card).join('');
  }

  WL.screens.explore = {
    title: '탐색',
    nav: 'explore',
    render() {
      const chips = D.filters.map((f) => `<button type="button" class="chip${f.id === currentFilter ? ' is-on' : ''}" data-filter="${f.id}" aria-pressed="${f.id === currentFilter}">${esc(f.label)}</button>`).join('');
      return `<div class="ex-top">
          <div class="ex-titlerow">
            <h1 class="t-display ex-title">탐색</h1>
            <a class="icon-btn ex-round" href="#/explore/search" aria-label="검색">${icon('search', 22)}</a>
          </div>
          <div class="chips ex-chips" role="group" aria-label="주제">${chips}</div>
        </div>
        <div class="ex-list pad" aria-live="polite">${listHtml(currentFilter)}</div>
        <div class="nav-space"></div>`;
    },
    mount(root) {
      const top = root.querySelector('.ex-top');
      const list = root.querySelector('.ex-list');
      const onScroll = () => top.classList.toggle('is-stuck', root.scrollTop > 14);
      root.addEventListener('scroll', onScroll, { passive: true });
      const chipRow = root.querySelector('.ex-chips');
      chipRow.addEventListener('click', (e) => {
        const b = e.target.closest('[data-filter]');
        if (!b || b.dataset.filter === currentFilter) return;
        currentFilter = b.dataset.filter;
        root.querySelectorAll('[data-filter]').forEach((c) => {
          const on = c === b;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', on);
        });
        const r = b.getBoundingClientRect(), rr = chipRow.getBoundingClientRect();
        if (r.right > rr.right - 20 || r.left < rr.left + 20) chipRow.scrollBy({ left: r.left - rr.left - 40, behavior: 'smooth' });
        list.innerHTML = listHtml(currentFilter);
        list.classList.remove('ex-swap-in');
        void list.offsetWidth;
        list.classList.add('ex-swap-in');
        if (root.scrollTop > 16) root.scrollTo({ top: 16 });
      });
      const unbind = bindSave(root);
      return () => { root.removeEventListener('scroll', onScroll); unbind(); };
    },
  };

  /* ───────── 검색 ───────── */
  const recents = D.recentSearches.slice();

  function match(q) {
    const s = q.trim().toLowerCase().replace(/^@/, '');
    if (!s) return [];
    return D.feed
      .filter((p) => {
        const u = author(p);
        return [p.title, p.place, u.name, u.handle, p.author].some((t) => String(t).toLowerCase().includes(s));
      })
      .sort((a, b) => a.distance - b.distance);
  }

  function recentHtml() {
    if (!recents.length) return `<p class="ex-recent-none t-label c-ink3">최근 검색어가 없어요</p>`;
    return `<ul class="ex-recent" aria-label="최근 검색어">${recents.map((r) => `<li>
        <button type="button" class="ex-recent-pick" data-q="${esc(r)}">${exIcon('history', 18)}<span>${esc(r)}</span></button>
        <button type="button" class="ex-recent-del" data-del="${esc(r)}" aria-label="${esc(r)} 지우기">${icon('close', 16)}</button>
      </li>`).join('')}</ul>`;
  }

  function emptyHtml(q) {
    return `<div class="ex-empty">
      <svg class="ex-empty-art" viewBox="0 0 180 64" aria-hidden="true">
        <path d="M22 50 L40 43 L58 35 L80 39 L96 41 L110 31 L126 20" fill="none" stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0 9"/>
        <path d="M136 14 L152 9 L170 11" fill="none" stroke="var(--ink-3)" stroke-opacity=".4" stroke-width="3" stroke-linecap="round" stroke-dasharray="0 9"/>
        <circle cx="14" cy="53" r="6" fill="var(--cream)" stroke="var(--ink-3)" stroke-width="2.5"/>
      </svg>
      <p class="t-subhead">‘${esc(q.trim())}’과 맞는 로그가 없어요</p>
      <p class="t-label c-ink3">동네 이름이나 장소로 다시 찾아보세요</p>
      <button type="button" class="pill s line ex-empty-clear" data-clear>검색어 지우기</button>
    </div>`;
  }

  WL.screens.search = {
    title: '검색',
    render(params) {
      const q = params.q || '';
      return `<div class="ex-sbar-row">
          <label class="ex-sbar">
            ${icon('search', 22)}
            <span class="sr">검색어</span>
            <input class="ex-sinput" type="search" enterkeyhint="search" autocomplete="off" placeholder="장소나 로그 이름" value="${esc(q)}">
            <button type="button" class="ex-sclear" data-clear aria-label="검색어 지우기" ${q ? '' : 'hidden'}>${exIcon('xFill', 20)}</button>
          </label>
          <button type="button" class="ex-cancel">취소</button>
        </div>
        <div class="ex-sbody"></div>`;
    },
    mount(root, params) {
      const input = root.querySelector('.ex-sinput');
      const body = root.querySelector('.ex-sbody');
      const clearBtn = root.querySelector('.ex-sclear');
      const draw = () => {
        const q = input.value;
        clearBtn.hidden = !q;
        if (!q.trim()) { body.innerHTML = recentHtml(); return; }
        const res = match(q);
        body.innerHTML = res.length
          ? `<p class="ex-count t-label c-ink3">로그 <b class="n-meta">${res.length}</b>개 · 가까운 순</p><div class="ex-list">${res.map(card).join('')}</div>`
          : emptyHtml(q);
      };
      const remember = (q) => {
        q = q.trim();
        if (!q) return;
        const i = recents.indexOf(q);
        if (i >= 0) recents.splice(i, 1);
        recents.unshift(q);
        recents.length = Math.min(recents.length, 6);
      };
      input.addEventListener('input', draw);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { remember(input.value); input.blur(); } });
      const onClick = (e) => {
        if (e.target.closest('[data-clear]')) { e.preventDefault(); input.value = ''; draw(); input.focus(); return; }
        const pick = e.target.closest('[data-q]');
        if (pick) { input.value = pick.dataset.q; remember(pick.dataset.q); draw(); return; }
        const del = e.target.closest('[data-del]');
        if (del) { recents.splice(recents.indexOf(del.dataset.del), 1); draw(); return; }
        if (e.target.closest('.ex-cancel')) { WL.back('/explore'); return; }
        if (e.target.closest('.ex-card-link')) remember(input.value);
      };
      root.addEventListener('click', onClick);
      const unbind = bindSave(root);
      draw();
      const focusTimer = params.q ? 0 : setTimeout(() => input.focus({ preventScroll: true }), 300);
      return () => { clearTimeout(focusTimer); root.removeEventListener('click', onClick); unbind(); };
    },
  };

  /* ───────── 남의 로그 상세 ───────── */
  const PEEK = 254; /* 처음 화면에서 시트가 보이는 높이 */
  const DOCK = 140; /* 시트가 다 올라왔을 때 위 끝 (사진 머리 아래) */

  WL.screens.post = {
    title: '로그',
    render(params) {
      const p = WL.find.post(params.id);
      if (!p) return WL.screens.notFound.render(params);
      const u = author(p);
      const pics = gallery(p);
      const thumbs = p.photos.slice(0, 3).map((src, i) => ({ src, at: [0.24, 0.56, 0.8][i] }));
      const grid = pics.slice(0, 4).map((src, i) => {
        const more = i === 3 && pics.length > 4 ? `<span class="ex-more">+${pics.length - 4}</span>` : '';
        return `<span class="ex-grid-cell"><img src="${src}" alt="" loading="lazy">${more}</span>`;
      }).join('');
      return `<div class="ex-post" style="--peek:${PEEK}px;--dock:${DOCK}px">
        <div class="ex-post-bg" aria-hidden="true"><img src="${p.photos[0]}" alt=""><span class="ex-post-shade"></span></div>
        <header class="ex-post-intro">
          <a class="ex-post-by" href="#/user/${p.author}">${WL.ui.avatar(u.avatar, 22, u.name)}<span>${esc(u.handle)}</span></a>
          <h1 class="t-display ex-post-title">${esc(p.title)}</h1>
          <p class="t-label ex-post-date">${WL.ui.fmt.dot(p.date, p.dow)}</p>
        </header>
        <section class="ex-sheet" aria-label="로그 내용">
          <button type="button" class="ex-handle" aria-label="시트 올리기"><span class="sheet-handle"></span></button>
          <a class="ex-author" href="#/user/${p.author}">${WL.ui.avatar(u.avatar, 32, u.name)}<b class="t-label-b">${esc(u.handle)}</b><span class="t-caption c-ink2">· 내 위치에서 ${p.distance.toFixed(1)}km</span></a>
          <p class="t-body ex-text">${esc(p.text)}</p>
          <div class="ex-map">
            ${WL.ui.mapBg(+p.id.slice(2) + 3, { water: p.tags.includes('hangang') ? 80 : 0 })}
            <div class="ex-map-course">${WL.ui.course(p.shape, { color: 'var(--cobalt)', width: 4, pad: 12, thumbs })}</div>
            <a class="ex-map-open" href="#/map/view?post=${p.id}">${icon('map', 16)}<span>지도에서 보기</span></a>
          </div>
          <p class="ex-stats"><b class="n-stat">${p.minutes}</b><span>분</span><i>·</i><b class="n-stat">${p.km.toFixed(1)}</b><span>km</span><i>·</i><span>사진</span><b class="n-stat">${pics.length}</b></p>
          <div class="ex-grid">${grid}</div>
          <p class="t-label c-ink3 ex-react">좋아요 <span class="tnum" data-likes>${likeCount(p)}</span><i>·</i>저장 <span class="tnum" data-saves>${saveCount(p)}</span></p>
        </section>
      </div>`;
    },
    mount(root, params) {
      const p = WL.find.post(params.id);
      if (!p) return WL.screens.notFound.mount && WL.screens.notFound.mount(root, params);
      const app = document.getElementById('app');
      const ui = document.createElement('div');
      ui.className = 'ex-post-ui';
      ui.innerHTML = `
        <div class="ex-cap" aria-hidden="true">
          <div class="ex-cap-photo"><img src="${p.photos[0]}" alt=""></div>
          <span class="ex-cap-shade"></span>
          <p class="t-title ex-cap-title">${esc(p.title)}</p>
          <p class="t-label ex-cap-date">${WL.ui.fmt.dot(p.date, p.dow)}</p>
          <span class="ex-cap-lip"><span class="sheet-handle"></span></span>
        </div>
        <button type="button" class="icon-btn ex-round ex-back" aria-label="뒤로">${icon('back', 22)}</button>
        <button type="button" class="icon-btn ex-round ex-topsave" data-save="${p.id}" aria-pressed="${isSaved(p.id)}" aria-label="보관함에 담기">${bookmarkIcon(22)}</button>
        <div class="ex-actions">
          <button type="button" class="ex-like" aria-pressed="${liked.has(p.id)}" aria-label="좋아요">${icon('heart', 22)}<b class="tnum" data-likes>${likeCount(p)}</b></button>
          <button type="button" class="ex-save" data-save="${p.id}" aria-pressed="${isSaved(p.id)}" aria-label="보관함에 담기">${bookmarkIcon(22)}</button>
          <a class="pill cobalt ex-follow" href="#/follow/${p.id}">${icon('nav', 20)}<span>따라 걷기</span></a>
        </div>`;
      app.appendChild(ui);

      const sheet = root.querySelector('.ex-sheet');
      const intro = root.querySelector('.ex-post-intro');
      let raf = 0;
      const update = () => {
        raf = 0;
        const top = sheet.getBoundingClientRect().top - root.getBoundingClientRect().top;
        ui.classList.toggle('is-docked', top <= DOCK + 0.5);
        ui.classList.toggle('is-open', root.scrollTop > 24);
        intro.style.opacity = String(1 - Math.min(1, root.scrollTop / 180));
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
      root.addEventListener('scroll', onScroll, { passive: true });
      update();

      const map = root.querySelector('.ex-map');
      const io = new IntersectionObserver((es) => {
        if (es.some((x) => x.isIntersecting)) { map.classList.add('is-seen'); io.disconnect(); }
      }, { root, threshold: 0.6 });
      io.observe(map);

      const lift = () => root.scrollTo({ top: sheet.offsetTop - DOCK, behavior: 'smooth' });
      sheet.querySelector('.ex-handle').addEventListener('click', lift);

      const sync = () => {
        app.querySelectorAll('[data-likes]').forEach((n) => (n.textContent = likeCount(p)));
        root.querySelectorAll('[data-saves]').forEach((n) => (n.textContent = saveCount(p)));
      };
      ui.addEventListener('click', (e) => {
        if (e.target.closest('.ex-back')) { WL.back('/explore'); return; }
        if (e.target.closest('.ex-cap')) { root.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        const like = e.target.closest('.ex-like');
        if (like) {
          if (liked.has(p.id)) liked.delete(p.id); else liked.add(p.id);
          like.setAttribute('aria-pressed', liked.has(p.id));
          sync();
          return;
        }
        if (e.target.closest('[data-save]')) {
          const on = toggleSave(p.id);
          ui.querySelectorAll('[data-save]').forEach((x) => x.setAttribute('aria-pressed', on));
          sync();
          liftToast();
        }
      });
      return () => {
        root.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
        io.disconnect();
        ui.remove();
      };
    },
  };

  /* 공용 알림은 냅바 위 높이에 뜨므로, 이 화면에서는 아래 행동 줄(84) 12 위로 올린다 */
  function liftToast() {
    const t = document.querySelector('#app .toast');
    if (t) t.style.bottom = '96px';
  }

  /* ui.js에 없는 선 아이콘 몇 개 */
  const extraIcons = {
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 4v4.5H8"/><path d="M12 7.5V12l3 2"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    moon: '<path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"/>',
    footprints: '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6-1.9 0-2.5 1.8-2.5 3.5 0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0z"/><path d="M16 17h4M4 13h4"/>',
    xFill: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m8.5 8.5 7 7m0-7-7 7" stroke="var(--surface)" stroke-width="2.2"/>',
  };
  function exIcon(name, size = 24) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${extraIcons[name] || ''}</svg>`;
  }

  WL.ex = { isSaved, toggleSave, saveCount, likeCount, gallery, bookmarkIcon, card, bindSave, icon: exIcon, liftToast };
})();
