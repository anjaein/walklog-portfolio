(function () {
  const HOLD_MS = 900;
  const FADE_MS = 280;

  window.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('splash');
    if (!el) return;
    if (document.documentElement.classList.contains('splash-seen')) { el.remove(); return; }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const meta = document.querySelector('meta[name="theme-color"]');
    const themeColor = meta && meta.content;
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || themeColor;
    const restoreTheme = () => { if (meta) meta.content = themeColor; };
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      restoreTheme();
      if (reduce) { el.remove(); return; }
      el.classList.add('is-leaving');
      // transitionend는 탭이 백그라운드면 안 올 수 있어서 타이머로 지운다
      setTimeout(() => el.remove(), FADE_MS + 40);
    };
    const timer = setTimeout(hide, HOLD_MS);
    el.addEventListener('click', hide);
  });
})();
