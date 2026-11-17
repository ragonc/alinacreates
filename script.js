// Fills each media slot with the file named in data-src, if that file exists.
// Until then the slot keeps showing its placeholder label.
document.querySelectorAll('[data-src]').forEach((slot) => {
  const src = slot.dataset.src;
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  const media = document.createElement(isVideo ? 'video' : 'img');

  if (isVideo) {
    media.controls = true;
    media.playsInline = true;
    media.preload = 'metadata';
  } else {
    media.alt = slot.dataset.alt || '';
  }

  media.addEventListener(isVideo ? 'loadedmetadata' : 'load', () => {
    slot.replaceChildren(media);
    slot.classList.add('is-filled');
  });
  media.src = src;
});
