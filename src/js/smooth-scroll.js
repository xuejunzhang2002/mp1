const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let frameId = null;

function cancelScroll() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}

// Any manual scrolling input stops an in-flight animation so we never fight the user.
['wheel', 'touchstart', 'keydown'].forEach((type) => {
  window.addEventListener(type, cancelScroll, { passive: true });
});

/**
 * Animate the window's scroll position to `targetY` with an ease-in-out curve.
 * Longer distances take a little longer, within sensible bounds.
 */
export function smoothScrollTo(targetY) {
  cancelScroll();

  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxY));
  const startY = window.scrollY;
  const distance = endY - startY;
  if (distance === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, endY);
    return;
  }

  const duration = Math.min(1100, Math.max(450, Math.abs(distance) * 0.45));
  let startTime = null;

  const step = (now) => {
    if (startTime === null) startTime = now;
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    frameId = progress < 1 ? requestAnimationFrame(step) : null;
  };

  frameId = requestAnimationFrame(step);
}
