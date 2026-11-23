/* 남의 프로필: A 사진 머리 + B 로그 주머니 */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc, avatar, course, fmt } = WL.ui;
  const D = WL.data;

  /* 머리 색마다 주머니 4색을 순서대로 반복한다 (피그마 733:4450, '주머니 4색 반복') */
  const POCKETS = {
    tomato: ['var(--pocket-apricot)', 'var(--lemon)', 'var(--pocket-pink)', 'var(--pocket-mint)'],
    cobalt: ['var(--pocket-sky)', 'var(--pocket-mint)', 'var(--pocket-lemon)', 'var(--pocket-pink)'],
    lemon: ['var(--pocket-apricot)', 'var(--pocket-lime)', 'var(--pocket-sky)', 'var(--pocket-pink)'],
    mint: ['var(--pocket-lime)', 'var(--pocket-water)', 'var(--pocket-lemon)', 'var(--pocket-apricot)'],
    ink: ['var(--lemon)', 'var(--mint)', 'var(--pocket-sky)', 'var(--pocket-pink)'],
  };

  /* 프로필 데이터에 없는 값(주로 걷는 때, 따라 걸은 사람 수)은 여기서 가정한다 */
  const EXTRA = {
    mangwon_cat: { when: '저녁 산책', followers: 28 },
    hyejin: { when: '주말 오후', followers: 41 },
    seongsu_slow: { when: '오후 산책', followers: 17 },
    nightwalker: { when: '밤 산책', followers: 23 },
    jongno_dan: { when: '낮 산책', followers: 12 },
  };
  const FACES = ['calico-cat', 'ginkgo-yellow', 'coffee-bench', 'night-alley', 'seosulla-sign', 'hangang-bench'].map(D.P);

  /* 머리 판 뒤에 옅게 깔리는 큰 코스 선 (on 색 12%) */
  const pattern = `<svg class="us-pattern" viewBox="0 0 402 488" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 312 L44 300 L66 238 L132 230 L160 168 L236 160 L262 104 L330 92 L356 46 L420 32" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/></svg>`;

  function savers(n) {
    return `<span class="us-stack">${[0, 1, 2].map((i) => avatar(FACES[(n + i * 2) % FACES.length], 24)).join('')}</span>`;
  }

  function pocket(p, color) {
    const pics = WL.ex.gallery(p);
    const four = [0, 1, 2, 3].map((i) => pics[i % pics.length]);
    const n = +p.id.slice(2);
    return `<li class="us-item">
      <div class="us-pocket" style="--pk:${color}">
        ${four.map((src) => `<span class="us-photo"><img src="${src}" alt="" loading="lazy"></span>`).join('')}
        <span class="us-front"><span class="us-front-course">${course(p.shape, { color: 'var(--ink)', width: 3, pad: 4 })}</span></span>
        <a class="us-pocket-link" href="#/post/${p.id}" aria-label="${esc(p.title)} 보기"></a>
        <button type="button" class="us-save" data-save="${p.id}" aria-pressed="${WL.ex.isSaved(p.id)}" aria-label="보관함에 담기">${WL.ex.bookmarkIcon(20)}</button>
      </div>
      <div class="us-text">
        <a class="t-title" href="#/post/${p.id}">${esc(p.title)}</a>
        <p class="us-meta" style="margin:0"><span class="d-stamp" style="letter-spacing:.04em">${fmt.stamp(p.date)}</span><i class="sep" aria-hidden="true"></i><span>사진<b>${pics.length}</b></span></p>
        <p class="us-savers" style="margin:0">${savers(n)}<span>저장<b class="tnum" data-saves="${p.id}">${WL.ex.saveCount(p)}</b></span></p>
      </div>
    </li>`;
  }

  WL.screens.user = {
    title: '프로필',
    render(params) {
      const u = WL.find.user(params.id);
      if (!u || u.id === D.me.id) return WL.screens.notFound.render(params);
      const posts = WL.find.postsBy(u.id).sort((a, b) => (a.date < b.date ? 1 : -1));
      const empty = !posts.length;
      const hc = u.headerColor || 'cobalt';
      const bg = WL.ui.colorVar[hc];
      const on = WL.ui.onColor[hc];
      const ex = EXTRA[u.id] || { when: '', followers: 0 };
      const since = u.joined ? u.joined.replace(/^(\d+년 \d+월)$/, '$1부터') : '';
      const chips = [
        u.area && `<span class="us-chip">${icon('pin', 14)}${esc(u.area)}</span>`,
        !empty && ex.when && `<span class="us-chip">${WL.ex.icon('moon', 14)}${esc(ex.when)}</span>`,
        since && `<span class="us-chip">${WL.ex.icon('calendar', 14)}${esc(since)}</span>`,
      ].filter(Boolean).join('');
      const photo = u.avatar
        ? `<img class="us-arch" src="${u.avatar}" alt="${esc(u.name)} 프로필 사진">`
        : `<span class="us-arch is-empty" role="img" aria-label="${esc(u.name)} 프로필 사진 없음">${esc(u.name.slice(0, 1))}</span>`;
      const stickers = empty ? '' : `
        <span class="us-print" aria-hidden="true"><img src="${posts[0].photos[0]}" alt=""></span>
        <span class="us-sticker" aria-hidden="true" style="--us-sticker:${hc === 'lemon' ? 'var(--surface)' : 'var(--lemon)'}">${course(posts[0].shape, { color: 'var(--ink)', width: 2, pad: 4 })}</span>`;
      const together = empty ? '' : `
        <div class="us-together">
          <div><span class="us-stack">${[0, 1, 2].map((i) => avatar(FACES[i + 2], 32)).join('')}<span class="us-plus n-meta">+${ex.followers}</span></span><span class="t-caption c-ink2">따라 걸은 사람</span></div>
          <hr>
          <div><span class="us-courses">${posts.slice(0, 3).map((p) => `<span class="us-dot">${course(p.shape, { color: 'var(--cobalt)', width: 2, pad: 4, start: false, dot: 2 })}</span>`).join('')}${posts.length > 3 ? `<span class="us-plus n-meta">+${posts.length - 3}</span>` : ''}</span><span class="t-caption c-ink2">자주 걷는 길</span></div>
        </div>`;
      const set = POCKETS[hc] || POCKETS.cobalt;
      return `<div class="us" data-color="${hc}">
        <header class="us-head" style="--us-bg:${bg};--us-on:${on}">
          ${pattern}
          <div class="us-arch-wrap">${photo}${stickers}</div>
          <h1 class="t-display us-name">${esc(u.name)}</h1>
          <p class="t-label us-handle">${esc(u.handle)}</p>
          <div class="us-chips">${chips}</div>
          ${together}
        </header>
        ${empty
          ? `<p class="t-body c-ink3 us-none">아직 공개한 로그가 없어요</p>`
          : `<ul class="us-list" style="list-style:none;margin:0">${posts.map((p, i) => pocket(p, set[i % set.length])).join('')}</ul>`}
      </div>`;
    },
    mount(root, params) {
      const u = WL.find.user(params.id);
      if (!u || u.id === D.me.id) return WL.screens.notFound.mount && WL.screens.notFound.mount(root, params);
      const app = document.getElementById('app');
      const ui = document.createElement('div');
      ui.className = 'us-ui';
      ui.innerHTML = `<div class="us-bar">
          <button type="button" class="icon-btn ex-round us-back" aria-label="뒤로">${icon('back', 22)}</button>
          <div class="us-who" aria-hidden="true">${avatar(u.avatar, 40, u.name)}<div><p class="t-subhead">${esc(u.name)}</p><p class="t-caption c-ink3">${esc(u.handle)}</p></div></div>
          <button type="button" class="icon-btn ex-round us-more" aria-label="더보기" style="margin-left:auto">${icon('more', 22)}</button>
        </div>`;
      app.appendChild(ui);

      const head = root.querySelector('.us-head');
      const onScroll = () => ui.classList.toggle('is-collapsed', root.scrollTop > head.offsetHeight - 80);
      root.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      ui.addEventListener('click', (e) => {
        if (e.target.closest('.us-back')) WL.back('/explore');
        if (e.target.closest('.us-more')) {
          const o = WL.ui.overlay(`<div class="sheet" role="dialog" aria-label="${esc(u.name)} 메뉴">
            <div class="sheet-handle"></div>
            <button type="button" class="us-menu-item" data-act="link">${icon('link', 22)}프로필 링크 복사</button>
            <button type="button" class="us-menu-item" data-close>${icon('close', 22)}닫기</button>
          </div>`);
          o.el.querySelector('[data-act="link"]').addEventListener('click', () => { o.close(); WL.ui.toast(D.toasts.linkCopied, { noNav: true }); });
        }
      });

      /* 주머니 저장 버튼 */
      const onClick = (e) => {
        const b = e.target.closest('[data-save]');
        if (!b) return;
        e.preventDefault();
        const id = b.dataset.save;
        const on = WL.ex.toggleSave(id);
        b.setAttribute('aria-pressed', on);
        const t = document.querySelector('#app .toast');
        if (t) t.classList.add('no-nav');
        const n = root.querySelector(`[data-saves="${id}"]`);
        if (n) n.textContent = WL.ex.saveCount(WL.find.post(id));
      };
      root.addEventListener('click', onClick);
      return () => { root.removeEventListener('scroll', onScroll); root.removeEventListener('click', onClick); ui.remove(); };
    },
  };
})();
