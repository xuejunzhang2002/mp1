/* Page behaviour: each feature lives in its own module and is started here. */
import { initNav } from './nav';
import { initCarousels } from './carousel';
import { initModals } from './modal';
import { initReveal } from './reveal';

function init() {
  initNav();
  initCarousels();
  initModals();
  initReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
