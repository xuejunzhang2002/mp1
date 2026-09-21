const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50; // px of horizontal drag needed to change slide

function initCarousel(root) {
  const viewport = root.querySelector('.carousel__viewport');
  const track = root.querySelector('.carousel__track');
  const slides = Array.from(root.querySelectorAll('.carousel__slide'));
  const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let timer = null;
  let paused = false;

  // Positioning is pure CSS: each data-index value has a matching translateX rule in _carousel.scss.
  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    track.dataset.index = String(current);
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
  };

  const schedule = () => {
    clearInterval(timer);
    timer = null;
    if (!reduceMotion && !paused) timer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
  };

  const setPaused = (value) => {
    paused = value;
    schedule();
  };

  // Manual navigation: announce the change to screen readers and restart the autoplay countdown.
  const userGoTo = (index) => {
    viewport.setAttribute('aria-live', 'polite');
    goTo(index);
    schedule();
  };

  root.querySelector('[data-carousel-prev]').addEventListener('click', () => userGoTo(current - 1));
  root.querySelector('[data-carousel-next]').addEventListener('click', () => userGoTo(current + 1));
  dots.forEach((dot) => {
    dot.addEventListener('click', () => userGoTo(Number(dot.dataset.carouselDot)));
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') userGoTo(current - 1);
    if (event.key === 'ArrowRight') userGoTo(current + 1);
  });

  root.addEventListener('mouseenter', () => setPaused(true));
  root.addEventListener('mouseleave', () => setPaused(false));
  root.addEventListener('focusin', () => setPaused(true));
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) setPaused(false);
  });

  let dragStartX = null;
  viewport.addEventListener('pointerdown', (event) => {
    dragStartX = event.clientX;
  });
  viewport.addEventListener('pointerup', (event) => {
    if (dragStartX === null) return;
    const deltaX = event.clientX - dragStartX;
    dragStartX = null;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) userGoTo(current + (deltaX < 0 ? 1 : -1));
  });
  viewport.addEventListener('pointercancel', () => {
    dragStartX = null;
  });

  goTo(0);
  schedule();
}

export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
}
