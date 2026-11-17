// The cover picture is in the HTML; everything else waits for the screen.
// Each media group gives its videos their poster (data-poster) once the group is
// a screen away, so only the cover loads first.
// A group marked .seq gets .is-in once it is in view: its pictures enter one after another.
const once = (callback, options) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      callback(target);
      observer.unobserve(target);
    });
  }, options);
  return observer;
};

// A silent loop (a video without controls, below) starts loading at the same distance.
const near = once((group) => {
  group.querySelectorAll('video[data-poster]').forEach((video) => {
    video.poster = video.dataset.poster;
    if (!video.controls) video.preload = 'auto';
  });
}, { rootMargin: '100% 0px' });
document.querySelectorAll('[role="group"]').forEach((group) => near.observe(group));

const seen = once((group) => group.classList.add('is-in'), { threshold: 0.2 });
document.querySelectorAll('.seq').forEach((group) => seen.observe(group));

// Videos that move as they come into view (17.11.2026), never with reduced motion. In each row the first
// video plays muted while most of it is in view, until the visitor pauses, unmutes or seeks it. The others
// loop <name>-preview.mp4 silently under a play button that turns them into the full video with sound.
// A loop that fails to load, a refused play() and no JS all leave the video as it is in the HTML.
const steered = new Set();
const shown = new Set();
const watch = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    shown[isIntersecting ? 'add' : 'delete'](target);
    if (isIntersecting) target.play().catch(() => {});
    else target.pause();
  });
}, { threshold: 0.6 });

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const label = document.documentElement.lang.startsWith('de') ? 'Video abspielen' : 'Play video';
  document.querySelectorAll('.media-row').forEach((row) => {
    const [first, ...rest] = row.querySelectorAll('video');
    if (!first) return;
    // A pause while in view is the visitor's (the page pauses only what has left the screen)
    const release = () => { watch.unobserve(first); steered.delete(first); };
    first.addEventListener('pause', () => { if (shown.has(first)) release(); });
    first.addEventListener('volumechange', () => { if (!first.muted) release(); });
    first.addEventListener('seeking', release);
    steered.add(first);
    watch.observe(first);

    rest.forEach((video) => {
      const full = video.src;
      const button = document.createElement('button');
      button.className = 'play';
      button.setAttribute('aria-label', label);
      const restore = (sound) => {
        watch.unobserve(video);
        button.remove();
        Object.assign(video, { loop: false, controls: true, preload: 'none', src: full });
        if (sound) { video.muted = false; video.play().catch(() => {}); video.focus(); }
      };
      video.addEventListener('error', () => restore(false), { once: true });
      button.addEventListener('click', () => restore(true));
      Object.assign(video, { loop: true, controls: false, src: full.replace(/\.mp4$/, '-preview.mp4') });
      video.after(button);
      watch.observe(video);
    });
  });
}

// One video with sound at a time: starting one pauses the others ('play' does not bubble, so listen in capture).
// The cover reel and the silent loops (no controls) do not count, nor does a first video the page started;
// that one gives way only to a video started in its own section
document.addEventListener('play', ({ target }) => {
  if (!target.controls || steered.has(target)) return;
  document.querySelectorAll('.sheet video[controls]').forEach((video) => {
    if (video !== target && (!steered.has(video) || video.closest('section') === target.closest('section'))) video.pause();
  });
}, true);

// The cover reel: where autoplay is refused (iOS Low Power Mode, some in-app browsers) it starts on the
// first touch. With reduced motion no source matches, currentSrc stays empty and the reel stays off.
const reel = document.querySelector('.cover__media video');
if (reel) {
  const start = () => { if (reel.paused && reel.currentSrc) reel.play().catch(() => {}); };
  const kinds = ['pointerup', 'touchend', 'click', 'keydown'];
  const first = () => { start(); kinds.forEach((kind) => document.removeEventListener(kind, first)); };
  start();
  kinds.forEach((kind) => document.addEventListener(kind, first, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') start(); });
}

// The fixed capsule gets .is-aside while any heading is in the band it covers (the top of the screen down
// to just under it); styles.css moves it out of view there, below 60rem only.
// ponytail: the band is measured once at load; recompute on resize if a rotated phone ever needs it
const bar = document.querySelector('.bar');
const under = new Set();
const band = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => under[isIntersecting ? 'add' : 'delete'](target));
  bar.classList.toggle('is-aside', under.size > 0);
}, { rootMargin: `0px 0px ${Math.round(bar.getBoundingClientRect().bottom + 8 - innerHeight)}px 0px` });
document.querySelectorAll('.sheet h2, .sheet h3').forEach((heading) => band.observe(heading));
