/* 온보딩 v2: ① 로그인 → ② 이메일 → ③ 프로필 → ④ 위치 → ⑤ 항상 허용 → ⑥ 나머지 권한 → ⑦ 준비 완료 */
window.WL = window.WL || {}; WL.screens = WL.screens || {};

(function () {
  const { icon, esc, course } = WL.ui;
  const D = WL.data;
  const P = D.P;

  /* 가입하는 동안만 쓰는 값 (새로고침하면 처음으로) */
  const draft = { color: 'cobalt', name: D.me.name, handle: D.me.handle.replace(/^@/, ''), photo: 0 };
  const PHOTOS = [D.me.avatar, P('ginkgo-yellow'), P('hangang-bench'), P('forest-path')];
  const COLORS = ['tomato', 'cobalt', 'lemon', 'mint', 'ink'];
  const COLOR_NAME = { tomato: '토마토', cobalt: '코발트', lemon: '레몬', mint: '민트', ink: '먹색' };

  const go = (n) => WL.go('/onboarding/' + n);
  const progress = (n) => `<div class="ob-progress" role="progressbar" aria-label="가입 단계" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${n}">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>`;
  const back = (to) => `<div class="ob-topbar"><button type="button" class="ob-back" data-go="${to}" aria-label="뒤로">${icon('chevronLeft', 24)}</button></div>`;
  const head = (eyebrow, title, desc) => `<p class="en-eyebrow ob-eyebrow">${eyebrow}</p><h1 class="t-display ob-title">${title}</h1>${desc ? `<p class="t-body ob-desc">${desc}</p>` : ''}`;

  /* 산책 도장: 원형/사각 이중선 + WALKED + 동네 + 날짜 */
  function stamp({ shape = 'circle', color, area, date, x, y, r = 0, d = 0, pop = false }) {
    return `<span class="ob-stamp ${shape}${pop ? ' pop' : ''}" style="--sc:${color};--r:${r}deg;--d:${d}ms;left:${x};top:${y}" aria-hidden="true"><span class="w">WALKED</span><span class="a">${area}</span><span class="d">${date}</span></span>`;
  }

  const google = `<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>`;

  /* ① 아래에 흩어진 로그 카드 5장 (피그마 791:5051 좌표, 402 폭 기준) */
  const DECK = [
    { title: '연남동 골목 한 바퀴', c: 'var(--lemon)', date: '11 12', area: '연남동', shape: 'yeonnam', photo: 'green-path', x: -68, y: 22, r: -13, stamp: { shape: 'rect', color: 'var(--cobalt)', area: '연남동', date: '11.12', x: '128px', y: '190px', r: 8 } },
    { title: '성미산 둘레길', c: 'var(--mint)', date: '11 02', area: '성산동', shape: 'forest', photo: 'autumn-park', x: 278, y: 26, r: 11 },
    { title: '상수 당인리 골목', c: 'var(--surface)', white: true, date: '10 21', area: '상수동', shape: 'ikseon', photo: 'old-alley', x: -2, y: 218, r: 16, stamp: { color: 'var(--tomato)', area: '상수동', date: '10.21', x: '138px', y: '-14px', r: -12 } },
    { title: '경의선 숲길 산책', c: 'var(--cobalt)', on: 'var(--on-dark)', date: '10 14', area: '연남동', shape: 'gyeongui', photo: 'park-path', x: 220, y: 226, r: -14 },
    { title: '망원 한강 노을', c: 'var(--tomato)', date: '11 18', area: '망원동', shape: 'hangang', photo: 'river-golden', x: 108, y: 80, r: 6, stamp: { color: 'var(--ink)', area: '망원동', date: '11.18', x: '134px', y: '-16px', r: 14 } },
  ];
  function deck() {
    return `<div class="ob-deck" aria-hidden="true">${DECK.map((k, i) => `
      <div class="ob-card${k.white ? ' is-white' : ''}" style="--c:${k.c};--on:${k.on || 'var(--ink)'};--r:${k.r}deg;--d:${180 + i * 90}ms;left:${k.x}px;top:${k.y}px">
        <span class="ob-card-label">${k.title}</span>
        <p class="ob-card-date"><b>'26</b><span class="d-stamp">${k.date}</span><span>· ${k.area}</span></p>
        <span class="ob-card-course">${course(k.shape, { color: 'currentColor', width: 3, start: false, end: false, pad: 2 })}</span>
        <span class="ob-print"><img src="${P(k.photo)}" alt=""></span>
        ${k.stamp ? stamp(k.stamp) : ''}
      </div>`).join('')}</div>`;
  }

  const steps = {
    1: () => `<div class="ob ob-1">
        ${head('WALK · PHOTO · COURSE', '걸은 길이\n코스가 돼요', '걸은 길에 사진을 꽂아\n나만의 산책 코스로 남겨요.')}
        <div class="ob-actions">
          <button type="button" class="pill ink block" data-go="3">${google}<span>Google로 계속하기</span></button>
          <button type="button" class="pill line-ink block" data-go="2">이메일로 계속하기</button>
          <p class="ob-terms">계속하면 <a href="#/onboarding/1" data-terms>이용약관</a>과 <a href="#/onboarding/1" data-terms>개인정보 처리방침</a>에 동의하게 돼요</p>
        </div>
        ${deck()}
      </div>`,

    2: () => `<div class="ob ob-2">
        ${back(1)}
        ${head('EMAIL', '이메일로\n계속하기')}
        <form class="ob-form" novalidate>
          <div class="ob-field">
            <label class="t-label-b" for="ob-email">이메일</label>
            <div class="ob-input" data-email><input id="ob-email" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com" aria-describedby="ob-email-err"></div>
            <p class="ob-err" id="ob-email-err" hidden>이메일 주소를 다시 확인해 주세요</p>
          </div>
          <div class="ob-field">
            <label class="t-label-b" for="ob-pw">비밀번호</label>
            <div class="ob-input"><input id="ob-pw" type="password" autocomplete="new-password" placeholder="8자 이상"><button type="button" class="ob-eye" aria-label="비밀번호 보기" aria-pressed="false">${WL.ex.icon('eye', 22)}</button></div>
          </div>
          <div class="ob-actions" style="padding-top:0"><button type="submit" class="pill ink block is-disabled" aria-disabled="true">다음</button></div>
        </form>
      </div>`,

    3: () => {
      const c = draft.color;
      return `<div class="ob ob-3">
        <div class="ob-head" style="--hc:${WL.ui.colorVar[c]};--hon:${WL.ui.onColor[c]}">
          <svg class="us-pattern" viewBox="0 0 402 300" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 236 L40 226 L64 178 L132 170 L160 120 L232 112 L262 66 L330 56 L352 18 L420 6" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/></svg>
          ${progress(1)}
          <p class="en-eyebrow ob-eyebrow">YOUR PROFILE</p>
          <div class="ob-arch"><img src="${PHOTOS[draft.photo]}" alt="프로필 사진"><button type="button" class="ob-cam" aria-label="프로필 사진 바꾸기">${icon('camera', 20)}</button></div>
          <p class="ob-pname" data-pname>${esc(draft.name)}</p>
          <p class="ob-phandle" data-phandle>@${esc(draft.handle)}</p>
        </div>
        <div class="ob-body">
          <div>
            <p class="t-label-b c-ink2" style="margin:0 0 8px" id="ob-color-label">머리 색</p>
            <div class="ob-colors" role="radiogroup" aria-labelledby="ob-color-label">${COLORS.map((k) => `<button type="button" class="ob-color" role="radio" aria-checked="${k === c}" aria-label="${COLOR_NAME[k]}" data-color="${k}" style="--sw:${WL.ui.colorVar[k]}"><i></i></button>`).join('')}</div>
          </div>
          <div class="ob-field"><label class="t-label-b c-ink2" for="ob-name" style="display:block;margin-bottom:8px">닉네임</label><div class="ob-input"><input id="ob-name" value="${esc(draft.name)}" maxlength="12" autocomplete="nickname"></div></div>
          <div class="ob-field"><label class="t-label-b c-ink2" for="ob-handle" style="display:block;margin-bottom:8px">아이디</label><div class="ob-input"><span class="at">@</span><input id="ob-handle" value="${esc(draft.handle)}" maxlength="20" autocomplete="username" spellcheck="false"></div></div>
        </div>
        <div class="ob-actions"><button type="button" class="pill ink block" data-next>다음</button></div>
      </div>`;
    },

    4: () => `<div class="ob ob-4">
        ${progress(2)}
        ${back(3)}
        <div class="ob-panel" aria-hidden="true">
          <svg class="ob-route" viewBox="0 0 370 360" preserveAspectRatio="none"><path pathLength="1" d="M34 272 C 70 262, 96 226, 128 220 S 176 238, 200 226 S 250 250, 272 214 S 300 110, 312 70" fill="none" stroke="var(--tomato)" stroke-width="4" stroke-linecap="round"/></svg>
          <span class="ob-time" style="left:30px;bottom:66px">17:25</span>
          <span class="ob-time" style="right:42px;top:56px">18:12</span>
          <span class="ob-print big" style="left:16%;top:18%;transform:rotate(-7deg)"><img src="${P('hangang-bench')}" alt=""></span>
          <span class="ob-print big" style="left:44%;top:27%;transform:rotate(6deg)"><img src="${P('ginkgo-street')}" alt=""></span>
          <svg style="position:absolute;left:24px;bottom:82px" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="6" fill="var(--surface)" stroke="var(--tomato)" stroke-width="3"/></svg>
          <svg style="position:absolute;right:46px;top:62px" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="var(--tomato)"/></svg>
        </div>
        ${head('AUTO TRACKING', '걸은 길을\n자동으로 그릴까요?')}
        <div class="ob-chks"><span class="ob-chk">${icon('check', 14)}걷기 시작하면 바로</span><span class="ob-chk">${icon('check', 14)}걸을 때만 기록</span></div>
        <div class="ob-actions"><button type="button" class="pill ink block" data-ask-location>위치 허용하기</button></div>
      </div>`,

    5: () => `<div class="ob ob-5">
        ${progress(3)}
        ${back(4)}
        <div class="ob-panel" aria-hidden="true">
          ${stamp({ color: 'var(--tomato)', area: '망원동', date: '11.18', x: '2%', y: '2%', r: -14, pop: true, d: 100 })}
          ${stamp({ shape: 'rect', color: 'var(--cobalt)', area: '연남동', date: '11.12', x: '74%', y: '4%', r: 6, pop: true, d: 180 })}
          ${stamp({ shape: 'rect', color: 'var(--ink)', area: '상수동', date: '10.21', x: '-6%', y: '56%', r: -10, pop: true, d: 260 })}
          ${stamp({ color: 'var(--tomato)', area: '성산동', date: '11.02', x: '82%', y: '68%', r: 12, pop: true, d: 340 })}
          ${stamp({ color: 'var(--cobalt)', area: '합정동', date: '10.30', x: '20%', y: '80%', r: -6, pop: true, d: 420 })}
          ${stamp({ shape: 'rect', color: 'var(--ink)', area: '망원동', date: '10.26', x: '56%', y: '84%', r: 8, pop: true, d: 500 })}
          <div class="ob-setting"><h3>위치 권한</h3><small>WalkLog</small>
            <span class="ob-radio on"><i></i>항상 허용</span><span class="ob-radio"><i></i>앱 사용 중에만 허용</span><span class="ob-radio"><i></i>매번 확인</span><span class="ob-radio"><i></i>허용 안함</span>
          </div>
        </div>
        ${head('ONE MORE STEP', '항상 허용으로\n바꿔 주세요', '걷기를 감지하면 앱을 열지 않아도\n걸은 길을 기록해요.')}
        <div class="ob-actions"><button type="button" class="pill ink block" data-settings>설정 열기</button><button type="button" class="ob-later" data-go="6">나중에 할게요</button></div>
      </div>`,

    6: () => `<div class="ob ob-6">
        ${progress(4)}
        ${back(5)}
        ${head('ESSENTIALS', '몇 가지만 더\n허용해 주세요', '하나씩 차례로 물어볼게요.')}
        <div class="ob-grid">
          <div class="ob-perm" data-perm="신체 활동"><span class="ob-tile" style="--tc:var(--tomato);--r:-6deg">${WL.ex.icon('footprints', 24)}</span><h3>신체 활동</h3><p>걷기를 감지해요</p><span class="ob-ok">${icon('check', 14)}</span></div>
          <div class="ob-perm" data-perm="사진"><span class="ob-tile photo" aria-hidden="true"><span class="ob-print" style="left:0;top:6px;transform:rotate(-8deg)"><img src="${P('forest-path')}" alt=""></span><span class="ob-print" style="left:24px;top:2px;transform:rotate(6deg)"><img src="${P('night-alley')}" alt=""></span></span><h3>사진</h3><p>사진을 코스에 붙여요</p><span class="ob-ok">${icon('check', 14)}</span></div>
          <div class="ob-perm" data-perm="카메라"><span class="ob-tile" style="--tc:var(--mint);--r:5deg">${icon('camera', 24)}</span><h3>카메라</h3><p>앱에서 바로 찍어요</p><span class="ob-ok">${icon('check', 14)}</span></div>
          <div class="ob-perm" data-perm="알림"><span class="ob-tile" style="--tc:var(--lemon);--r:-4deg">${icon('bell', 24)}</span><h3>알림</h3><p>기록 중임을 알려요</p><span class="ob-ok">${icon('check', 14)}</span></div>
        </div>
        <div class="ob-actions"><button type="button" class="pill ink block" data-allow>허용하기</button><button type="button" class="ob-later" data-go="7">나중에 할게요</button></div>
      </div>`,

    7: () => `<div class="ob ob-7">
        ${progress(5)}
        <div style="height:24px"></div>
        <div class="ob-panel" aria-hidden="true">
          ${stamp({ shape: 'rect', color: 'var(--cobalt)', area: '연남동', date: '11.12', x: '2%', y: '3%', r: -8, pop: true, d: 300 })}
          ${stamp({ color: 'var(--tomato)', area: '망원동', date: '11.18', x: '76%', y: '1%', r: 12, pop: true, d: 420 })}
          ${stamp({ color: 'var(--ink)', area: '상수동', date: '10.21', x: '-4%', y: '70%', r: -12, pop: true, d: 540 })}
          ${stamp({ shape: 'rect', color: 'var(--tomato)', area: '성산동', date: '11.02', x: '74%', y: '72%', r: 8, pop: true, d: 660 })}
          ${stamp({ color: 'var(--cobalt)', area: '합정동', date: '10.30', x: '36%', y: '86%', r: -4, pop: true, d: 780 })}
          <div class="ob-first"><svg viewBox="0 0 90 24"><circle cx="4" cy="16" r="3.5" fill="var(--surface)" stroke="var(--tomato)" stroke-width="2"/><path d="M10 15 L22 13 L34 9 L46 12 L60 8 L74 10 L86 5" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0 6"/></svg><b>첫 코스</b><span>your first walk</span></div>
        </div>
        ${head('YOUR WALK STARTS HERE', '준비됐어요', '이제 걸으면 길이 그려져요.')}
        <div class="ob-actions"><a class="pill ink block" href="#/home">시작하기</a></div>
      </div>`,
  };

  function systemDialog() {
    return `<div class="ob-sys" role="dialog" aria-modal="true" aria-label="위치 권한 요청">
      ${icon('pin', 24)}
      <p>WalkLog에서 이 기기의 위치에 액세스하도록 허용하시겠습니까?</p>
      <div class="ob-sys-maps">
        <span class="ob-sys-map on"><i>${icon('pin', 22)}</i>정확한 위치</span>
        <span class="ob-sys-map"><i></i>대략적인 위치</span>
      </div>
      <button type="button" class="ob-sys-btn" data-ans="while">앱 사용 중에만 허용</button>
      <button type="button" class="ob-sys-btn" data-ans="once">이번만 허용</button>
      <button type="button" class="ob-sys-btn" data-ans="deny">허용 안함</button>
    </div>`;
  }

  WL.screens.onboarding = {
    title: '시작하기',
    render(params) {
      const n = Math.min(7, Math.max(1, parseInt(params.step, 10) || 1));
      return steps[n]();
    },
    mount(root, params) {
      const n = Math.min(7, Math.max(1, parseInt(params.step, 10) || 1));
      const timers = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));

      root.addEventListener('click', (e) => {
        const g = e.target.closest('[data-go]');
        if (g) { go(g.dataset.go); return; }
        if (e.target.closest('[data-terms]')) { e.preventDefault(); WL.ui.toast('약관은 앱에서 볼 수 있어요', { noNav: true }); }
      });

      if (n === 2) {
        const form = root.querySelector('.ob-form');
        const email = root.querySelector('#ob-email');
        const pw = root.querySelector('#ob-pw');
        const box = root.querySelector('[data-email]');
        const err = root.querySelector('#ob-email-err');
        const btn = form.querySelector('[type="submit"]');
        const eye = root.querySelector('.ob-eye');
        let bad = false;
        const ready = () => {
          const ok = email.value.trim() && pw.value.length >= 8 && !bad;
          btn.classList.toggle('is-disabled', !ok);
          btn.setAttribute('aria-disabled', String(!ok));
        };
        email.addEventListener('input', () => {
          if (bad) { bad = false; box.classList.remove('is-error'); err.hidden = true; email.removeAttribute('aria-invalid'); }
          ready();
        });
        pw.addEventListener('input', ready);
        eye.addEventListener('click', () => {
          const show = pw.type === 'password';
          pw.type = show ? 'text' : 'password';
          eye.setAttribute('aria-pressed', String(show));
          eye.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 보기');
        });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (btn.classList.contains('is-disabled')) {
            if (!email.value.trim()) email.focus(); else if (pw.value.length < 8) pw.focus();
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
            bad = true;
            box.classList.add('is-error');
            err.hidden = false;
            email.setAttribute('aria-invalid', 'true');
            pw.value = '';
            ready();
            email.focus();
            return;
          }
          go(3);
        });
        later(() => email.focus({ preventScroll: true }), 300);
      }

      if (n === 3) {
        const headEl = root.querySelector('.ob-head');
        const nameIn = root.querySelector('#ob-name');
        const handleIn = root.querySelector('#ob-handle');
        const next = root.querySelector('[data-next]');
        const check = () => {
          const ok = nameIn.value.trim() && /^[a-z0-9._]{3,}$/i.test(handleIn.value.trim());
          next.classList.toggle('is-disabled', !ok);
          next.setAttribute('aria-disabled', String(!ok));
        };
        root.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => {
          draft.color = b.dataset.color;
          root.querySelectorAll('[data-color]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
          headEl.style.setProperty('--hc', WL.ui.colorVar[draft.color]);
          headEl.style.setProperty('--hon', WL.ui.onColor[draft.color]);
        }));
        nameIn.addEventListener('input', () => { draft.name = nameIn.value; root.querySelector('[data-pname]').textContent = nameIn.value; check(); });
        handleIn.addEventListener('input', () => { draft.handle = handleIn.value.replace(/^@/, ''); root.querySelector('[data-phandle]').textContent = '@' + draft.handle; check(); });
        root.querySelector('.ob-cam').addEventListener('click', () => {
          draft.photo = (draft.photo + 1) % PHOTOS.length;
          root.querySelector('.ob-arch img').src = PHOTOS[draft.photo];
        });
        next.addEventListener('click', () => { if (!next.classList.contains('is-disabled')) go(4); });
      }

      if (n === 4) {
        root.querySelector('[data-ask-location]').addEventListener('click', () => {
          const o = WL.ui.overlay(systemDialog());
          o.el.querySelector('.ob-sys').addEventListener('click', (e) => {
            const a = e.target.closest('[data-ans]');
            if (!a) return;
            o.close();
            /* 거부하면 ⑤ 항상 허용 안내는 건너뛴다 (개발 메모 795:5493) */
            later(() => go(a.dataset.ans === 'deny' ? 6 : 5), 200);
          });
        });
      }

      if (n === 5) {
        root.querySelector('[data-settings]').addEventListener('click', (e) => {
          const b = e.currentTarget;
          b.textContent = '설정에서 돌아오는 중…';
          b.classList.add('is-disabled');
          later(() => go(6), 900);
        });
      }

      if (n === 6) {
        const btn = root.querySelector('[data-allow]');
        btn.addEventListener('click', () => {
          if (btn.classList.contains('is-disabled')) return;
          btn.classList.add('is-disabled');
          const cards = [...root.querySelectorAll('[data-perm]')];
          cards.forEach((c, i) => {
            later(() => { c.classList.add('is-asking'); btn.textContent = `${c.dataset.perm} 권한을 묻는 중…`; }, i * 520);
            later(() => { c.classList.remove('is-asking'); c.classList.add('is-ok'); }, i * 520 + 380);
          });
          later(() => go(7), cards.length * 520 + 300);
        });
      }

      return () => timers.forEach(clearTimeout);
    },
  };
})();
