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
