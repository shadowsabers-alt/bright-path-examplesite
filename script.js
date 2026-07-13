// ==========================================================================
// Bright Path Coaching — Shared Script
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initSmoothScroll();
  initContactForm();
  initHeaderShadowOnScroll();
  initScrollReveal();
  initPageTransitions();
  initSiteLoader();
});

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.classList.toggle('is-active', isOpen);
  });

  // Close menu when a link is tapped (mobile)
  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Smooth scroll for in-page anchors ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ---------- Contact form handling with friendly validation ---------- */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const successMsg = document.querySelector('.form-success');
  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const nameError = form.querySelector('#name-error');
  const emailError = form.querySelector('#email-error');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function clearErrors() {
    [nameError, emailError].forEach(function (el) {
      if (!el) return;
      el.textContent = '';
      el.classList.remove('visible');
    });
    [nameInput, emailInput].forEach(function (el) {
      if (el) el.classList.remove('invalid');
    });
  }

  function showError(input, errorEl, message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    if (input) input.classList.add('invalid');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    if (successMsg) successMsg.classList.remove('visible');

    let valid = true;

    if (!nameInput.value.trim()) {
      showError(nameInput, nameError, 'Please enter your name.');
      valid = false;
    }

    if (!emailInput.value.trim()) {
      showError(emailInput, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      showError(emailInput, emailError, 'Please enter a valid email address (e.g. name@example.com).');
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (successMsg) {
      successMsg.classList.add('visible');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.reset();
  });

  // Clear a field's error as soon as the person starts fixing it
  [nameInput, emailInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      input.classList.remove('invalid');
      const errorEl = input.id === 'name' ? nameError : emailError;
      if (errorEl) errorEl.classList.remove('visible');
    });
  });
}

/* ---------- Fade-in reveal on scroll ---------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(function (el) { observer.observe(el); });
}

/* ---------- Subtle header shadow on scroll ---------- */
function initHeaderShadowOnScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 4px 16px rgba(13, 92, 99, 0.1)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
}

/* ---------- Smooth fade transitions between pages ---------- */
function initPageTransitions() {
  const TRANSITION_MS = 320;

  // Fade the page in once it's ready (covers first load and back/forward nav)
  function revealPage() {
    document.body.classList.remove('page-exit');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('page-loaded');
      });
    });
  }
  revealPage();

  // Browsers restoring a page from bfcache (back/forward) don't refire DOMContentLoaded
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) revealPage();
  });

  const isInternalPage = function (link) {
    if (link.target === '_blank') return false;
    if (link.hasAttribute('download')) return false;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;

    // Only intercept same-origin links (external http(s) links open normally)
    if (link.origin !== window.location.origin) return false;

    return true;
  };

  document.querySelectorAll('a[href]').forEach(function (link) {
    if (!isInternalPage(link)) return;

    link.addEventListener('click', function (e) {
      // Let the browser handle modified clicks (new tab, save-as, etc.) normally
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const destination = link.href;
      e.preventDefault();

      document.body.classList.remove('page-loaded');
      document.body.classList.add('page-exit');

      setTimeout(function () {
        window.location.href = destination;
      }, TRANSITION_MS);
    });
  });
}

/* ---------- Site loader (index.html only) ---------- */
function initSiteLoader() {
  const loader = document.querySelector('#site-loader');
  if (!loader) return;

  const MIN_DISPLAY_MS = 1800;
  const FADE_MS = 800;

  function hideLoader() {
    loader.classList.add('loader-hidden');
    loader.setAttribute('aria-hidden', 'true');
    setTimeout(function () {
      loader.remove();
    }, FADE_MS);
  }

  // Show the loader for a minimum time, but don't make people wait
  // longer than necessary if the page is already fully loaded.
  const start = Date.now();
  window.addEventListener('load', function () {
    const elapsed = Date.now() - start;
    const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0);
    setTimeout(hideLoader, remaining);
  });

  // Fallback in case the load event never fires for some reason
  setTimeout(hideLoader, MIN_DISPLAY_MS + 4000);
}
