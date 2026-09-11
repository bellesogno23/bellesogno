/**
 * BELLESOGNO — Smooth Caret
 * A vanilla-JS recreation of Skiper UI's "Smooth Input" (skiper106): replaces
 * the native blinking text cursor with a custom caret that glides with a
 * springy animation to wherever the cursor actually is. Works for both
 * <input> and <textarea>, single or multi-line — multi-line line-wrapping
 * is handled correctly because we measure against a hidden mirror element
 * (real DOM text flow) rather than guessing character widths ourselves.
 *
 * Usage: initSmoothCaret(document.getElementById('customerName'));
 * Or initAllSmoothCarets('.smooth-caret-target') to wire up several at once.
 */

function initSmoothCaret(el) {
  if (!el || el.dataset.smoothCaretInit) return;
  el.dataset.smoothCaretInit = 'true';

  // The field needs a positioned wrapper so the caret + mirror line up
  // exactly on top of the real input.
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.style.display = 'block';
  el.parentNode.insertBefore(wrap, el);
  wrap.appendChild(el);

  const caret = document.createElement('div');
  caret.className = 'smooth-caret';
  wrap.appendChild(caret);

  const mirror = document.createElement('div');
  mirror.className = 'smooth-caret-mirror';
  wrap.appendChild(mirror);

  // Copy every style that affects text layout, so the mirror wraps text
  // exactly the same way the real field does.
  const styleProps = [
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'boxSizing', 'width'
  ];
  const computed = getComputedStyle(el);
  styleProps.forEach(prop => { mirror.style[prop] = computed[prop]; });
  mirror.style.whiteSpace = el.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre';
  mirror.style.wordWrap = 'break-word';

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function updateCaret() {
    const pos = el.selectionStart || 0;
    const before = el.value.slice(0, pos);
    const after = el.value.slice(pos);
    mirror.innerHTML = escapeHtml(before) + '<span class="caret-marker">|</span>' + (escapeHtml(after) || ' ');

    const marker = mirror.querySelector('.caret-marker');
    const mirrorRect = mirror.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    const top = markerRect.top - mirrorRect.top - (el.scrollTop || 0);
    const left = markerRect.left - mirrorRect.left - (el.scrollLeft || 0);

    caret.style.transform = `translate(${left}px, ${top}px)`;
    caret.style.height = computed.lineHeight !== 'normal' ? computed.lineHeight : '1.2em';

    // Restart the blink timer on every move, so the caret reads as solid
    // while actively typing and only blinks once you pause — matches how
    // a real text cursor behaves in most editors.
    caret.classList.remove('active');
    void caret.offsetWidth; // force reflow so the animation actually restarts
    caret.classList.add('active');
  }

  ['input', 'click', 'keyup', 'select', 'scroll'].forEach(evt => {
    el.addEventListener(evt, updateCaret);
  });
  el.addEventListener('focus', updateCaret);
  el.addEventListener('blur', () => caret.classList.remove('active'));

  el.style.caretColor = 'transparent'; // hide the native cursor — ours replaces it
}

function initAllSmoothCarets(selector) {
  document.querySelectorAll(selector).forEach(initSmoothCaret);
}
