export const slideIn = (element) => {
  if (element) {
    element.style.transition = 'none';
    element.style.transform = 'translateY(100%)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.transition = 'transform 0.3s ease-in-out';
        element.style.transform = 'translateY(0)';
      });
    });
  }
};

export const slideOut = (element, overlay, callback) => {
  if (element) {
    element.style.transition = 'transform 0.3s ease-in-out';
    element.style.transform = 'translateY(100%)';
  }

  if (overlay) {
    overlay.classList.remove('visible');
  }

  // Wait for transition to complete before cleanup
  setTimeout(() => {
    if (overlay) {
      overlay.style.pointerEvents = 'none'; // optional safeguard
    }
    if (callback) callback();
  }, 300); // match CSS transition duration
};