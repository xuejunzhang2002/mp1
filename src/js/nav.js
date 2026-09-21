import { smoothScrollTo } from './smooth-scroll';

const SHRINK_AFTER = 40; // px scrolled before the navbar collapses

function cssPixels(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
}

/**
 * Sticky navbar behaviour: shrink on scroll, highlight the section being read,
 * smooth-scroll to in-page anchors, and the phone-sized menu toggle.
 */
export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const toggle = nav.querySelector('.nav__toggle');
  const links = Array.from(nav.querySelectorAll('.nav__link'));
  const sections = links.map((link) => document.querySelector(link.hash));

  const setActive = (activeIndex) => {
    links.forEach((link, i) => {
      const isActive = i === activeIndex;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  // The active section is the last one whose top edge has passed under the navbar's bottom edge.
  // At the very bottom of the page the final section may be too short to get there, so force it.
  const update = () => {
    nav.classList.toggle('is-shrunk', window.scrollY > SHRINK_AFTER);

    const navBottom = nav.getBoundingClientRect().bottom;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let activeIndex = 0;
    if (atBottom) {
      activeIndex = sections.length - 1;
    } else {
      sections.forEach((section, i) => {
        if (section && section.getBoundingClientRect().top <= navBottom + 1) activeIndex = i;
      });
    }
    setActive(activeIndex);
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  const setMenuOpen = (open) => {
    nav.classList.toggle('is-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
  };

  if (toggle) {
    toggle.addEventListener('click', () => setMenuOpen(!nav.classList.contains('is-open')));
  }

  // Every same-page link (navbar, hero buttons, skip link) gets the animated scroll.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hash.length < 2) return;

    const target = document.querySelector(link.hash);
    if (!target) return;

    event.preventDefault();
    setMenuOpen(false);

    // Land just below the navbar in its collapsed state, which it will be in once we arrive.
    const top = target.getBoundingClientRect().top + window.scrollY - cssPixels('--nav-h-sm');
    smoothScrollTo(top);
    history.replaceState(null, '', link.hash);

    // Move keyboard focus to the new section without triggering a native jump.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
}
