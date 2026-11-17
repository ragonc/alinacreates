// Fills each media slot with the file named in data-src, if that file exists;
// until then the slot keeps showing its placeholder label.
// Cinema trial: videos play muted and looped only while they are on screen;
// with reduced motion they stay on their first frame (section videos get controls).
// A slot may name a wide file (data-src-wide) for landscape screens.
// Blocks marked .reveal fade in once as they come into view.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const landscape = matchMedia('(min-aspect-ratio: 1/1)').matches;

const playWhenSeen = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) target.play().catch(() => {});
    else target.pause();
  });
}, { threshold: 0.2 });

document.querySelectorAll('[data-src]').forEach((slot) => {
  const src = (landscape && slot.dataset.srcWide) || slot.dataset.src;
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  const media = document.createElement(isVideo ? 'video' : 'img');

  if (isVideo) {
    media.playsInline = true;
    media.muted = true;
    media.loop = true;
    media.preload = 'metadata';
    media.controls = still && !slot.classList.contains('tile');
  } else {
    media.alt = slot.dataset.alt || '';
    media.decoding = 'async';
  }

  media.addEventListener(isVideo ? 'loadeddata' : 'load', () => {
    slot.replaceChildren(media);
    slot.classList.add('is-filled');
    if (isVideo && !still) playWhenSeen.observe(media);
  }, { once: true });
  // #t=0.1 shows the first frame until the video plays
  media.src = isVideo ? `${src}#t=0.1` : src;
});

const reveal = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    target.classList.add('is-in');
    reveal.unobserve(target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));
