/* ═════════════════════════════════════════════════════════════
   APEX INPUT POLISH — auto-applies the right mobile keyboard,
   autocomplete, autocapitalize, spellcheck, and inputmode hints
   to every input on the page. Idempotent. Re-runs on DOM mutation.
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (window._apexInputPolishLoaded) return;
  window._apexInputPolishLoaded = true;

  // Mapping rules: input id pattern → attributes to apply
  const RULES = [
    // Numeric / decimal — dose, weight, mL, mg
    { match: /(dose|mcg|mg|ml|weight|cycle|break|vial|price|bac|units|step|reta-day|trt-)/i,
      type: 'number',
      attrs: { inputmode: 'decimal', pattern: '[0-9]*[.]?[0-9]*', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false' }
    },
    // Pure integer — week, day, count
    { match: /(week|day|count)/i,
      type: 'number',
      attrs: { inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false' }
    },
    // Email
    { match: /(email)/i,
      type: 'email',
      attrs: { inputmode: 'email', autocomplete: 'email', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false' }
    },
    // Phone
    { match: /(phone|tel)/i,
      type: 'tel',
      attrs: { inputmode: 'tel', autocomplete: 'tel' }
    },
    // First name
    { match: /(fn|firstname|first-name|first_name|profile-fn|aff-fn)/i,
      type: 'text',
      attrs: { autocomplete: 'given-name', autocapitalize: 'words', autocorrect: 'off' }
    },
    // Last name
    { match: /(ln|lastname|last-name|last_name|profile-ln|aff-ln)/i,
      type: 'text',
      attrs: { autocomplete: 'family-name', autocapitalize: 'words', autocorrect: 'off' }
    },
    // City
    { match: /(city)/i,
      type: 'text',
      attrs: { autocomplete: 'address-level2', autocapitalize: 'words' }
    },
    // Date
    { match: /(date)/i,
      type: 'date',
      attrs: { autocomplete: 'off' }
    },
    // Code (referral/coupon)
    { match: /(code|coupon|ref)/i,
      type: 'text',
      attrs: { autocomplete: 'off', autocorrect: 'off', autocapitalize: 'characters', spellcheck: 'false' }
    },
    // Notes / textarea
    { match: /(note|notes|message|comment|description|bug)/i,
      type: 'textarea',
      attrs: { autocapitalize: 'sentences' }
    },
  ];

  function polish(el) {
    if (!el || el.dataset.apexPolished === '1') return;
    if (!/^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
    if (el.type === 'hidden' || el.type === 'file' || el.type === 'checkbox' || el.type === 'radio') return;

    const id = (el.id || el.name || '').toLowerCase();
    if (!id) return;

    // Find the first matching rule
    for (const rule of RULES) {
      if (rule.match.test(id)) {
        // Don't override if already explicitly set
        Object.entries(rule.attrs).forEach(([k, v]) => {
          if (!el.hasAttribute(k)) el.setAttribute(k, v);
        });
        // Type-specific: bump number to numeric inputmode if not set
        if (rule.type === 'number' && el.type === 'number' && !el.hasAttribute('step')) {
          // leave step alone — let the form decide
        }
        break;
      }
    }

    // Universal mobile-friendly defaults
    if (el.type === 'text' && !el.hasAttribute('autocomplete')) {
      el.setAttribute('autocomplete', 'off');
    }
    // Touch action
    if (!el.style.touchAction) el.style.touchAction = 'manipulation';
    // Avoid zoom on focus on iOS for inputs with font-size < 16px
    const computedSize = parseFloat(window.getComputedStyle(el).fontSize);
    if (computedSize < 16) el.style.fontSize = '16px';

    el.dataset.apexPolished = '1';
  }

  function polishAll() {
    document.querySelectorAll('input, textarea').forEach(polish);
  }

  // Initial pass
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', polishAll);
  } else {
    polishAll();
  }

  // Watch for dynamically added inputs (modals)
  new MutationObserver(() => polishAll()).observe(document.body, { childList: true, subtree: true });

  // Auto-scroll input into view on focus (iOS keyboard covers fields)
  document.addEventListener('focusin', (e) => {
    if (!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    setTimeout(() => {
      try {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch(err) {}
    }, 300);
  });

  // Prevent double-tap zoom on form labels
  let lastTouch = 0;
  document.addEventListener('touchstart', (e) => {
    const now = Date.now();
    if (now - lastTouch < 350) {
      const target = e.target;
      if (/^(INPUT|TEXTAREA|SELECT|BUTTON|LABEL|A)$/.test(target.tagName)) {
        e.preventDefault();
      }
    }
    lastTouch = now;
  }, { passive: false });
})();
