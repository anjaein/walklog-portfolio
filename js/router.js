/* 해시 라우터. 화면 파일은 WL.screens[이름] = { title, dark?, nav?, navLight?, render(params) → html, mount?(root, params) → cleanup? } 로 등록한다.
   nav: 'home' | 'map' | 'explore' 를 주면 라우터가 스크롤 밖(앱 틀 위)에 냅바를 그린다. 함수로 줘도 된다: nav(params) → 값 또는 null. */
window.WL = window.WL || {};
WL.screens = WL.screens || {};

(function () {
  /* 경로 → 화면 이름. 화면 목록(넓은 화면 왼쪽)도 이 순서로 만든다. */
  const routes = [
    { group: '온보딩', path: '/onboarding/:step', screen: 'onboarding', samples: [['1', '① 로그인'], ['2', '② 이메일 가입'], ['3', '③ 프로필 만들기'], ['4', '④ 위치 권한'], ['5', '⑤ 항상 허용'], ['6', '⑥ 카메라 · 알림 · 신체 활동'], ['7', '⑦ 준비 완료']] },
    { group: '홈', path: '/home', screen: 'home', label: '홈' },
    { group: '홈', path: '/home/new', screen: 'home', label: '홈 · 처음 쓰는 사람', params: { fresh: true } },
    { group: '홈', path: '/mylogs', screen: 'mylogs', label: '내 로그' },
    { group: '홈', path: '/archive', screen: 'archive', label: '보관함' },
    { group: '홈', path: '/log/:id', screen: 'log', samples: [['l-1118', '로그 상세']] },
    { group: '홈', path: '/settings', screen: 'settings', label: '설정' },
    { group: '홈', path: '/settings/profile', screen: 'profileEdit', label: '프로필 편집' },
    { group: '지도', path: '/map', screen: 'map', label: '지도 탭' },
    { group: '지도', path: '/map/view', screen: 'mapView', label: '지도 화면' },
    { group: '지도', path: '/follow/:id', screen: 'follow', samples: [['f-01', '따라 걷는 중']] },
    { group: '로그 남기기', path: '/record/time', screen: 'recordTime', label: '① 시간 고르기' },
    { group: '로그 남기기', path: '/record/course', screen: 'recordCourse', label: '② 코스와 사진 · ③ 글쓰기' },
    { group: '로그 남기기', path: '/record/done', screen: 'recordDone', label: '등록 완료' },
    { group: '탐색', path: '/explore', screen: 'explore', label: '탐색' },
    { group: '탐색', path: '/explore/search', screen: 'search', label: '검색' },
    { group: '탐색', path: '/post/:id', screen: 'post', samples: [['f-03', '남의 로그 상세']] },
    { group: '탐색', path: '/user/:id', screen: 'user', samples: [['mangwon_cat', '남의 프로필'], ['saebyeok', '남의 프로필 · 빈 상태']] },
    { group: '기타', path: '/404', screen: 'notFound', label: '404' },
  ];

  function match(hash) {
    const path = hash.replace(/^#/, '').split('?')[0] || '/home';
    const query = Object.fromEntries(new URLSearchParams(hash.split('?')[1] || ''));
    for (const r of routes) {
      const keys = [];
      const re = new RegExp('^' + r.path.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$');
      const m = path.match(re);
      if (m) {
        const params = Object.assign({}, r.params || {}, query);
        keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { route: r, params, path };
      }
    }
    return { route: routes.find((r) => r.screen === 'notFound'), params: query, path };
  }

  let cleanup = null;

  function render() {
    if (!location.hash) { location.replace('#/home'); return; }
    const { route, params, path } = match(location.hash);
    const app = document.getElementById('app');
    const screen = WL.screens[route.screen];
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    app.querySelectorAll('.overlay, .navbar').forEach((n) => n.remove());
    let root = app.querySelector('.screen');
    const fresh = document.createElement('main');
    fresh.className = 'screen enter';
    fresh.dataset.screen = route.screen;
    if (!screen) {
      fresh.innerHTML = `<div class="pad" style="padding-top:80px"><p class="t-title">${route.screen}</p><p class="t-label c-ink3">아직 만들지 않은 화면이에요.</p></div>`;
    } else {
      fresh.innerHTML = screen.render(params);
      if (screen.dark) fresh.classList.add('is-dark');
    }
    if (root) root.replaceWith(fresh); else app.prepend(fresh);
    fresh.addEventListener('animationend', () => fresh.classList.remove('enter'), { once: true });
    const nav = screen && (typeof screen.nav === 'function' ? screen.nav(params) : screen.nav);
    if (nav) {
      const light = typeof screen.navLight === 'function' ? screen.navLight(params) : screen.navLight;
      app.insertAdjacentHTML('beforeend', WL.ui.navbar(nav, !!light));
    }
    if (screen && screen.mount) cleanup = screen.mount(fresh, params);
    document.title = (screen && screen.title ? screen.title + ' · ' : '') + 'WalkLog';
    markIndex(path);
    const here = location.hash.replace(/^#/, '');
    if (trail[trail.length - 1] !== here) trail.push(here);
  }

  function buildIndex() {
    const box = document.getElementById('screen-index');
    if (!box) return;
    let html = '<h1>WalkLog</h1>';
    let group = '';
    routes.forEach((r) => {
      if (r.group !== group) { group = r.group; html += `<h2>${group}</h2>`; }
      if (r.samples) r.samples.forEach(([v, label]) => (html += `<a href="#${r.path.replace(/:\w+/, v)}">${label}</a>`));
      else html += `<a href="#${r.path}">${r.label}</a>`;
    });
    box.innerHTML = html;
  }

  function markIndex(path) {
    document.querySelectorAll('#screen-index a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + path));
  }

  /* 아티팩트 iframe 안에서는 history.back()이 바깥 페이지까지 되돌릴 수 있어서, 앱 안에서 다닌 길을 따로 쌓는다 */
  const trail = [];
  WL.go = (path) => { location.hash = path; };
  WL.back = (fallback = '/home') => {
    trail.pop();
    const prev = trail.pop();
    WL.go(prev || fallback);
  };
  /* 흐름을 끝내고 새로 시작할 때(예: 등록 완료 → 로그 보기): 지나온 길을 비워서 뒤로 가기가 끝난 흐름으로 돌아가지 않게 한다 */
  WL.reset = (path) => { trail.length = 0; WL.go(path); };
  WL.routes = routes;

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', () => { buildIndex(); render(); });
})();
