/* 설정 · 프로필 편집 */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc } = WL.ui;
  /* 공용 logout 아이콘은 화살표가 안쪽(왼쪽)을 향해서, 피그마처럼 문 밖으로 나가는 모양을 따로 그림 */
  const logoutIcon = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 8l4 4-4 4M19 12H9"/></svg>';
  const COLORS = [['tomato', '토마토'], ['cobalt', '코발트'], ['lemon', '레몬'], ['mint', '민트'], ['ink', '먹색']];

  const row = (label, value, opts = {}) => `<button class="st-row${opts.danger ? ' is-danger' : ''}" ${opts.act ? `data-act="${opts.act}"` : ''}>
      <span class="t-body">${label}</span>
      ${value != null ? `<span class="st-val t-body${opts.num ? ' is-num' : ''}">${value}</span>` : ''}
      ${opts.chevron === false ? '' : icon('chevronRight', 20)}
    </button>`;

  WL.screens.settings = {
    title: '설정',
    render() {
      const me = WL.data.me;
      return `<div class="st">
        <header class="h-listhead">
          <button class="h-back" data-back aria-label="뒤로">${icon('chevronLeft', 28)}</button>
          <h1 class="t-display">설정</h1>
        </header>
        <div class="pad st-body">
          <a href="#/settings/profile" class="st-card st-me">
            ${WL.ui.avatar(me.avatar, 52, me.name)}
            <span class="st-me-text"><span class="t-subhead">${esc(me.name)}</span><span class="t-caption c-ink2">${esc(me.handle)}</span></span>
            ${icon('chevronRight', 20)}
          </a>
          <section class="st-card" aria-label="권한">
            ${row('위치', '항상 허용', { act: 'perm' })}
            ${row('정확한 위치', '켜짐', { act: 'perm' })}
            ${row('사진', '모두 허용', { act: 'perm' })}
            ${row('알림', '켜짐', { act: 'perm' })}
            ${row('신체 활동', '허용', { act: 'perm' })}
          </section>
          <section class="st-card" aria-label="일반">
            ${row('기본 공개 범위', `<span class="st-vis">${esc(me.defaultVisibility)}</span>`, { act: 'vis' })}
            ${row('언어', esc(me.language), { act: 'lang' })}
            ${row('앱 정보·약관', '1.0.3', { act: 'about', num: true })}
          </section>
          <section class="st-card" aria-label="계정">
            ${row('로그아웃', null, { act: 'logout', chevron: false })}
            ${row('계정 삭제', null, { act: 'delete', chevron: false, danger: true })}
          </section>
        </div>
      </div>`;
    },
    mount(root) {
      WL.hx.flush && WL.hx.flush();
      root.querySelector('[data-back]').addEventListener('click', () => WL.back('/home'));
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const act = b.dataset.act;
        if (act === 'perm') WL.ui.toast('권한은 휴대폰 설정에서 바꿀 수 있어요', { noNav: true });
        if (act === 'lang') WL.ui.toast('지금은 한국어만 쓸 수 있어요', { noNav: true });
        if (act === 'about') WL.ui.toast('WalkLog 1.0.3 · 최신 버전이에요', { noNav: true });
        if (act === 'vis') pickVisibility(root);
        if (act === 'logout') {
          WL.hx.confirm({
            iconHtml: logoutIcon, tone: 'ink', title: '로그아웃할까요?',
            body: '다시 로그인하면<br>기록을 그대로 볼 수 있어요.', ok: '로그아웃',
            onOk: () => setTimeout(() => WL.go('/onboarding/1'), 160),
          });
        }
        if (act === 'delete') {
          WL.hx.confirm({
            iconHtml: WL.hx.alertIcon(40), tone: 'danger', title: '계정을 삭제할까요?',
            warn: '삭제하면 되돌릴 수 없어요.', body: '모든 로그와 사진이 함께 지워져요.', ok: '삭제',
            onOk: () => setTimeout(() => WL.go('/onboarding/1'), 160),
          });
        }
      });
    },
  };

  /* 기본 공개 범위: 아래 시트에서 고르기 */
  function pickVisibility(root) {
    const me = WL.data.me;
    const opt = (v, ic) => `<button class="lg-dr-row" role="radio" aria-checked="${me.defaultVisibility === v}" data-v="${v}">${icon(ic, 24)}<span>${v}</span><i class="lg-radio"></i></button>`;
    const o = WL.ui.overlay(`<div class="sheet st-sheet" role="dialog" aria-modal="true" aria-labelledby="st-vis-t">
      <i class="sheet-handle"></i>
      <p class="t-title" id="st-vis-t">기본 공개 범위</p>
      <p class="t-label c-ink3">새로 남기는 로그에 먼저 적용돼요</p>
      <div class="lg-dr-list" role="radiogroup">${opt('공개', 'globe')}${opt('나만 보기', 'lock')}</div>
    </div>`);
    o.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      me.defaultVisibility = b.dataset.v;
      o.el.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      root.querySelector('.st-vis').textContent = me.defaultVisibility;
      setTimeout(o.close, 180);
    });
  }

  /* ── 프로필 편집: 머리 판 색 5개 중 고르기 ─────────────── */

  const AVATARS = ['calico-cat', 'ginkgo-yellow', 'hangang-sunset', 'forest-path', 'old-alley', 'coffee-bench'].map(WL.data.P);

  WL.screens.profileEdit = {
    title: '프로필 편집',
    render() {
      const me = WL.data.me;
      const c = me.headerColor || 'tomato';
      const swatches = COLORS.map(([k, label]) => `<button class="st-swatch" role="radio" aria-checked="${k === c}" aria-label="${label}" data-color="${k}" style="--sw:${WL.ui.colorVar[k]}"><i></i></button>`).join('');
      return `<div class="st-pe" style="--plate:${WL.ui.colorVar[c]};--on:${WL.ui.onColor[c]}">
        <header class="st-plate">
          <div class="st-plate-course" aria-hidden="true">${WL.ui.course('namsan', { color: 'var(--on)', width: 14, start: false, end: false, pad: -6 })}</div>
          <div class="st-plate-bar">
            <button class="icon-btn st-back" aria-label="뒤로">${icon('back', 24)}</button>
            <h1 class="t-title">프로필 편집</h1>
            <button class="pill s st-save" disabled>저장</button>
          </div>
          <div class="st-arch-wrap">
            <span class="st-arch"><img src="${me.avatar}" alt="프로필 사진"></span>
            <button class="st-cam" aria-label="사진 바꾸기">${icon('camera', 20)}</button>
          </div>
          <p class="t-title st-name">${esc(me.name)}</p>
          <p class="t-caption st-handle">${esc(me.handle)}</p>
        </header>
        <div class="pad st-form">
          <p class="t-label-b st-lab" id="st-color-l">머리 색</p>
          <div class="st-swatches" role="radiogroup" aria-labelledby="st-color-l">${swatches}</div>
          <label class="t-label-b st-lab" for="st-nick">닉네임</label>
          <input class="st-input" id="st-nick" value="${esc(me.name)}" maxlength="12" autocomplete="off">
          <label class="t-label-b st-lab" for="st-id">아이디</label>
          <div class="st-input st-input-at"><span>@</span><input id="st-id" value="${esc(me.handle.replace(/^@/, ''))}" maxlength="20" autocomplete="off" spellcheck="false"></div>
          <p class="t-label-b st-lab">동네</p>
          <button class="st-input st-input-row" data-area><span>${esc(me.area)}</span>${icon('chevronRight', 20)}</button>
        </div>
      </div>`;
    },
    mount(root) {
      const me = WL.data.me;
      const box = root.querySelector('.st-pe');
      const save = root.querySelector('.st-save');
      const nick = root.querySelector('#st-nick');
      const hid = root.querySelector('#st-id');
      const draft = { name: me.name, handle: me.handle.replace(/^@/, ''), color: me.headerColor || 'tomato', avatar: me.avatar };

      const dirty = () => draft.name.trim() !== me.name || '@' + draft.handle !== me.handle || draft.color !== me.headerColor || draft.avatar !== me.avatar;
      const sync = () => {
        box.style.setProperty('--plate', WL.ui.colorVar[draft.color]);
        box.style.setProperty('--on', WL.ui.onColor[draft.color]);
        root.querySelector('.st-name').textContent = draft.name.trim() || me.name;
        root.querySelector('.st-handle').textContent = '@' + (draft.handle || me.handle.replace(/^@/, ''));
        root.querySelector('.st-arch img').src = draft.avatar;
        root.querySelectorAll('.st-swatch').forEach((s) => s.setAttribute('aria-checked', String(s.dataset.color === draft.color)));
        save.disabled = !dirty() || !draft.name.trim() || !draft.handle;
      };

      root.querySelector('.st-back').addEventListener('click', () => WL.back('/settings'));
      root.querySelector('.st-swatches').addEventListener('click', (e) => {
        const s = e.target.closest('[data-color]');
        if (!s) return;
        draft.color = s.dataset.color;
        sync();
      });
      nick.addEventListener('input', () => { draft.name = nick.value; sync(); });
      hid.addEventListener('input', () => {
        const clean = hid.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
        if (clean !== hid.value) hid.value = clean;
        draft.handle = clean;
        sync();
      });
      root.querySelector('[data-area]').addEventListener('click', () => WL.ui.toast('동네는 위치로 자동으로 정해져요', { noNav: true }));
      root.querySelector('.st-cam').addEventListener('click', () => {
        const o = WL.ui.overlay(`<div class="sheet st-sheet" role="dialog" aria-modal="true" aria-labelledby="st-ph-t">
          <i class="sheet-handle"></i>
          <p class="t-title" id="st-ph-t">사진 바꾸기</p>
          <div class="st-photos">${AVATARS.map((src) => `<button data-src="${src}" aria-pressed="${src === draft.avatar}"><img src="${src}" alt=""></button>`).join('')}</div>
        </div>`);
        o.el.addEventListener('click', (e) => {
          const b = e.target.closest('[data-src]');
          if (!b) return;
          draft.avatar = b.dataset.src;
          sync();
          setTimeout(o.close, 120);
        });
      });
      save.addEventListener('click', () => {
        if (save.disabled) return;
        me.name = draft.name.trim();
        me.handle = '@' + draft.handle;
        me.headerColor = draft.color;
        me.avatar = draft.avatar;
        WL.hx.later('프로필을 저장했어요');
        WL.go('/home');
      });
      sync();
    },
  };
})();
