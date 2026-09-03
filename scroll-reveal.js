/**
 * BELLESOGNO — Scroll Reveal
 * Fades + slides elements into view as they enter the viewport, using
 * IntersectionObserver. Elements only reveal once (they don't re-hide if
 * you scroll back up), and reveal in a staggered cascade if several are
 * visible at once (based on DOM order).
 *
 * Usage: add class="reveal" to any element, then call initScrollReveal()
 * once that element actually exists in the DOM (for JS-rendered content
 * like product grids, call this again after the innerHTML is set).
 */
function initScrollReveal(root = document) {
  const targets = root.querySelectorAll('.reveal:not(.reveal-observed)');
  if (targets.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Small stagger based on position so a grid of cards cascades in
        // rather than all popping at once.
        const delay = Math.min(i * 60, 300);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => {
    el.classList.add('reveal-observed');
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => initScrollReveal());
