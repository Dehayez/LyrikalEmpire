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
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.style.pointerEvents = 'none';
      if (callback) callback();
    }, 300); // Match the duration of the opacity transition
  }
};