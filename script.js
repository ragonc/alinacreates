// Fills each media slot with the file named in data-src, if that file exists.
// Until then the slot keeps showing its placeholder label.
// Cover tiles are decorative copies: their videos play muted and looped, without
// controls, and stay on the first frame when the visitor prefers reduced motion.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-src]').forEach((slot) => {
  const src = slot.dataset.src;
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  const isTile = slot.classList.contains('tile');
  const media = document.createElement(isVideo ? 'video' : 'img');

  if (isVideo) {
    media.playsInline = true;
    media.preload = 'metadata';
    if (isTile) {
      media.muted = true;
      media.loop = true;
      media.autoplay = !still;
    } else {
      media.controls = true;
    }
  } else {
    media.alt = slot.dataset.alt || '';
  }

  media.addEventListener(isVideo ? 'loadedmetadata' : 'load', () => {
    slot.replaceChildren(media);
    slot.classList.add('is-filled');
    if (media.autoplay) media.play().catch(() => {});
  });
  // #t=0.1 makes a tile show its first frame as the poster until it plays
  media.src = isTile && isVideo ? `${src}#t=0.1` : src;
});
