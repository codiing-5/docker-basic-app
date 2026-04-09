/* ============================================================
   DevOps World — main.js
   Scroll reveal, micro-interactions & smooth UX behaviors
   ============================================================ */

// ---------- Scroll Reveal ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


// ---------- Nav scroll shadow ----------
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)';
  } else {
    nav.style.boxShadow = 'none';
  }
}, { passive: true });


// ---------- Smooth scroll for anchor links ----------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ---------- Button ripple effect ----------
function createRipple(event) {
  const button = event.currentTarget;
  const existing = button.querySelector('.ripple');
  if (existing) existing.remove();

  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  circle.style.cssText = `
    width: ${diameter}px;
    height: ${diameter}px;
    left: ${event.clientX - rect.left - radius}px;
    top: ${event.clientY - rect.top - radius}px;
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    transform: scale(0);
    animation: ripple-anim 0.55s linear;
    pointer-events: none;
  `;
  circle.classList.add('ripple');

  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(circle);

  circle.addEventListener('animationend', () => circle.remove());
}

// Inject ripple keyframes once
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple-anim {
    to { transform: scale(3); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach((btn) => {
  btn.addEventListener('click', createRipple);
});


// ---------- Animated stat counter ----------
function animateCounter(el, target, suffix = '', duration = 1400) {
  const isDecimal = target % 1 !== 0;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = eased * target;

    el.textContent = isDecimal
      ? value.toFixed(1) + suffix
      : Math.round(value) + suffix;

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const raw = el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const target = parseFloat(raw);

      animateCounter(el, target, suffix);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

// Wire up stat numbers — read from data attributes
document.querySelectorAll('.stat-num').forEach((el) => {
  const text = el.textContent.trim();

  // Parse value and suffix from existing text
  const match = text.match(/^([\d.]+)(.*)$/);
  if (!match) return;

  const value  = match[1];
  const suffix = match[2];

  el.dataset.target = value;
  el.dataset.suffix = suffix;
  el.textContent    = '0' + suffix;

  statObserver.observe(el);
});


// ---------- Pipeline step active highlight on scroll ----------
const pipeSteps = document.querySelectorAll('.pipe-step');

const pipeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let delay = 0;
        pipeSteps.forEach((step) => {
          setTimeout(() => {
            step.style.transition = 'background 0.3s, opacity 0.4s, transform 0.4s';
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
          }, delay);
          delay += 120;
        });
        pipeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

// Set initial hidden state for pipeline steps
pipeSteps.forEach((step) => {
  step.style.opacity = '0';
  step.style.transform = 'translateY(12px)';
});

const pipelineEl = document.querySelector('.pipeline');
if (pipelineEl) pipeObserver.observe(pipelineEl);
