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

const near = once((group) => {
  group.querySelectorAll('video[data-poster]').forEach((video) => { video.poster = video.dataset.poster; });
}, { rootMargin: '100% 0px' });
document.querySelectorAll('[role="group"]').forEach((group) => near.observe(group));

const seen = once((group) => group.classList.add('is-in'), { threshold: 0.2 });
document.querySelectorAll('.seq').forEach((group) => seen.observe(group));

// One video at a time: starting one pauses the others ('play' does not bubble, so listen in capture).
// The cover reel is not one of them: it keeps looping behind the page
document.addEventListener('play', ({ target }) => {
  document.querySelectorAll('.sheet video').forEach((video) => { if (video !== target) video.pause(); });
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
