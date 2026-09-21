const root = document.documentElement;

function openModal(dialog) {
  if (dialog.open) return;
  dialog.showModal();
  root.classList.add('has-modal');
}

// Play the closing animation first, then actually close the dialog.
function closeModal(dialog) {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dialog.close();
    return;
  }

  dialog.classList.add('is-closing');
  dialog.addEventListener('animationend', () => dialog.close(), { once: true });
}

export function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    const dialog = document.getElementById(trigger.dataset.modalOpen);
    if (dialog) trigger.addEventListener('click', () => openModal(dialog));
  });

  document.querySelectorAll('dialog.modal').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      // Clicks on the ::backdrop are reported on the <dialog> itself, since .modal__inner fills it.
      if (event.target === dialog || event.target.closest('[data-modal-close]')) {
        closeModal(dialog);
      }
    });

    // Esc key: animate out instead of closing instantly.
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeModal(dialog);
    });

    // Runs however the dialog ended up closed, so the page can never stay scroll-locked.
    dialog.addEventListener('close', () => {
      dialog.classList.remove('is-closing');
      root.classList.remove('has-modal');
    });
  });
}
