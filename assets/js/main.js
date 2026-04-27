/* ================================================
   CRITERIA — main.js · Animations v2 · GSAP 3
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const progressBar = document.getElementById('progress-bar');
  const header      = document.getElementById('header');
  const menuToggle  = document.getElementById('menu-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const navLinks    = Array.from(document.querySelectorAll('.nav-link'));
  const sections    = Array.from(document.querySelectorAll('main section[id]'));

  // ════════════════════════════════════════════════
  // SCROLL STATE
  // ════════════════════════════════════════════════

  function updateProgressBar() {
    if (!progressBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0
      ? `${Math.min(Math.max((window.scrollY / total) * 100, 0), 100)}%`
      : '0%';
  }

  function updateHeaderState() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  }

  function updateActiveNav() {
    if (!navLinks.length || !sections.length) return;
    const offset = (header?.offsetHeight ?? 0) + 140;
    let currentId = sections[0].id;
    sections.forEach(s => { if (window.scrollY + offset >= s.offsetTop) currentId = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${currentId}`));
  }

  function onScroll() { updateProgressBar(); updateHeaderState(); updateActiveNav(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ════════════════════════════════════════════════
  // SMOOTH SCROLL
  // ════════════════════════════════════════════════

  function scrollTo(target, delay = 0) {
    if (!target) return;
    const offsetY = (header?.offsetHeight ?? 0) + 12;
    const run = () => {
      gsap.killTweensOf(window);
      gsap.to(window, { scrollTo: { y: target, offsetY }, duration: reduceMotion ? 0 : 0.65, ease: 'power2.inOut', overwrite: true });
    };
    delay ? setTimeout(run, delay) : run();
  }

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (link.closest('#mobile-menu')) { closeMobileMenu(); scrollTo(target, 140); }
      else scrollTo(target);
    });
  });

  // ════════════════════════════════════════════════
  // MOBILE MENU
  // ════════════════════════════════════════════════

  function closeMobileMenu() {
    if (!menuToggle || !mobileMenu || mobileMenu.classList.contains('hidden')) return;
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    if (reduceMotion) { mobileMenu.classList.add('hidden'); return; }

    gsap.to(mobileMenu, {
      autoAlpha: 0, y: -10, duration: 0.22, ease: 'power2.in',
      onComplete: () => { mobileMenu.classList.add('hidden'); gsap.set(mobileMenu, { clearProps: 'all' }); }
    });
  }

  function openMobileMenu() {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    mobileMenu.classList.remove('hidden');

    if (reduceMotion) return;
    gsap.fromTo(mobileMenu,
      { autoAlpha: 0, y: -10 },
      { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }
    );
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => menuToggle.classList.contains('open') ? closeMobileMenu() : openMobileMenu());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });
  }

  // ════════════════════════════════════════════════
  // FAQ ACCORDION
  // ════════════════════════════════════════════════

  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(open => {
        open.classList.remove('open');
        open.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (isOpen) return;
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      setTimeout(() => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 24) scrollTo(item);
      }, reduceMotion ? 0 : 140);
    });
  });

  // ════════════════════════════════════════════════
  // ANIMATIONS
  // ════════════════════════════════════════════════

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const isDesktop = window.innerWidth >= 1025;

    // ── Helpers ─────────────────────────────────

    function isAboveFold(el, threshold = 0.92) {
      return !el || el.getBoundingClientRect().top < window.innerHeight * threshold;
    }

    // Single-element reveal — gsap.from sets initial state immediately (no flash)
    function reveal(targets, triggerEl, { start = 'top 84%', duration = 0.82, ease = 'power3.out', ...fromVars } = {}) {
      const el = typeof triggerEl === 'string' ? document.querySelector(triggerEl) : triggerEl;
      if (!el || isAboveFold(el, 0.94)) return;
      gsap.from(targets, {
        scrollTrigger: { trigger: el, start, once: true },
        autoAlpha: 0, duration, ease,
        clearProps: 'transform,opacity,visibility',
        ...fromVars
      });
    }

    // Batch reveal — pre-hides all elements first, then animates on scroll
    // This prevents the flash caused by gsap.from() inside onEnter callbacks
    function batchReveal(selector, initVars = {}, { start = 'top 88%', duration = 0.82, stagger = 0.11, ease = 'power3.out' } = {}) {
      const els = gsap.utils.toArray(selector);
      if (!els.length) return;
      gsap.set(els, { autoAlpha: 0, ...initVars });
      ScrollTrigger.batch(selector, {
        start, once: true,
        onEnter: b => gsap.to(b, {
          autoAlpha: 1, y: 0, x: 0, duration, stagger, ease,
          clearProps: 'transform,opacity,visibility'
        })
      });
    }

    // ── Hero entrance ────────────────────────────

    const heroItems = ['#hero-logo', '#hero-tag', '#hero-h1', '#hero-sub', '#hero-cta', '#hero-microcopy']
      .map(id => document.querySelector(id)).filter(Boolean);
    const heroMedia  = document.querySelector('#hero-media');
    const scrollHint = document.querySelector('#scroll-indicator');
    const allHero    = [...heroItems, heroMedia, scrollHint].filter(Boolean);

    if (allHero.length) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.14 });
      tl.from(heroItems, { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0)
        .from([heroMedia, scrollHint].filter(Boolean), { y: 20, autoAlpha: 0, duration: 0.8 }, '-=0.55')
        .call(() => gsap.set(allHero, { clearProps: 'transform,opacity,visibility' }));
    }

    if (scrollHint) {
      gsap.to(scrollHint, { y: 8, duration: 1.4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.9 });
    }

    // ── Hero mouse parallax (desktop only) ───────

    if (isDesktop && heroMedia) {
      const heroSection = document.querySelector('.section-block--hero');
      if (heroSection) {
        const xTo = gsap.quickTo(heroMedia, 'x', { duration: 1.5, ease: 'power2.out' });
        const yTo = gsap.quickTo(heroMedia, 'y', { duration: 1.5, ease: 'power2.out' });
        heroSection.addEventListener('mousemove', e => {
          const r = heroSection.getBoundingClientRect();
          xTo(((e.clientX - r.left) / r.width  - 0.5) * 20);
          yTo(((e.clientY - r.top)  / r.height - 0.5) * 12);
        });
        heroSection.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
      }
    }

    // ── #para-quien ──────────────────────────────

    {
      const sec = document.querySelector('#para-quien');
      if (sec) {
        reveal(sec.querySelector('.section-header'), sec, { start: 'top 84%' });
        batchReveal('#para-quien .fit-card', { y: 30 }, { start: 'top 88%', stagger: 0.11 });
        reveal(sec.querySelector('.fit-closer'), sec.querySelector('.fit-closer'),
          { start: 'top 90%', y: 20, duration: 0.7 });
      }
    }

    // ── #problema ────────────────────────────────

    {
      const sec = document.querySelector('#problema');
      if (sec) {
        const parts = ['.problem-copy', '.problem-panel'].map(s => sec.querySelector(s)).filter(Boolean);
        if (parts.length) reveal(parts, sec, { start: 'top 82%', y: 34, duration: 0.88, stagger: 0.15 });
        batchReveal('#problema .problem-signal', { x: -16 },
          { start: 'top 88%', duration: 0.7, stagger: 0.09 });
      }
    }

    // ── #servicios ───────────────────────────────

    {
      const sec = document.querySelector('#servicios');
      if (sec) {
        reveal(sec.querySelector('.section-header'), sec, { start: 'top 84%' });
        batchReveal('#servicios .service-card', { y: 34 },
          { start: 'top 88%', duration: 0.82, stagger: 0.12 });
        reveal(sec.querySelector('.services-closer'), sec.querySelector('.services-closer'),
          { start: 'top 90%', y: 20, duration: 0.7 });

        if (finePointer) {
          sec.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', () =>
              gsap.to(card, { y: -6, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }));
            card.addEventListener('mouseleave', () =>
              gsap.to(card, { y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }));
          });
        }
      }
    }

    // ── #como-trabajamos ─────────────────────────

    {
      const sec = document.querySelector('#como-trabajamos');
      if (sec) {
        reveal(sec.querySelector('.section-header'), sec, { start: 'top 84%' });
        batchReveal('#como-trabajamos .process-step', { y: 36 },
          { start: 'top 88%', duration: 0.85, stagger: 0.11 });
        reveal(sec.querySelector('.process-closing'), sec.querySelector('.process-closing'),
          { start: 'top 90%', y: 20, duration: 0.7 });
      }
    }

    // ── #quienes-somos ───────────────────────────

    {
      const sec = document.querySelector('#quienes-somos');
      if (sec) {
        const parts = ['.about-credibility-main', '.about-credibility-principles', '.about-credibility-statement']
          .map(s => sec.querySelector(s)).filter(Boolean);
        if (parts.length) reveal(parts, sec, { start: 'top 82%', y: 32, duration: 0.88, stagger: 0.14 });
        batchReveal('#quienes-somos .about-principle-card', { y: 26 },
          { start: 'top 88%', duration: 0.72, stagger: 0.09 });
      }
    }

    // ── #beneficios ──────────────────────────────

    {
      const sec = document.querySelector('#beneficios');
      if (sec) {
        reveal(sec.querySelector('.section-header'), sec, { start: 'top 84%' });
        batchReveal('#beneficios .benefit-card', { y: 30 },
          { start: 'top 88%', duration: 0.8, stagger: 0.11 });
        reveal(sec.querySelector('.benefits-closer'), sec.querySelector('.benefits-closer'),
          { start: 'top 90%', y: 20, duration: 0.7 });
      }
    }

    // ── #faqs ────────────────────────────────────

    {
      const sec = document.querySelector('#faqs');
      if (sec) {
        reveal(sec.querySelector('.section-header'), sec, { start: 'top 84%', duration: 0.78 });
        batchReveal('#faqs .faq-item', { y: 22 },
          { start: 'top 89%', duration: 0.7, stagger: 0.08 });
      }
    }

    // ── #contacto ────────────────────────────────

    {
      const sec = document.querySelector('#contacto');
      if (sec) {
        const parts = ['.cta-main', '.cta-lower'].map(s => sec.querySelector(s)).filter(Boolean);
        if (parts.length) reveal(parts, sec, { start: 'top 82%', y: 32, duration: 0.88, stagger: 0.16 });
        batchReveal('#contacto .contact-item', { x: -16 },
          { start: 'top 88%', duration: 0.7, stagger: 0.1 });
      }
    }

    // ── Footer ───────────────────────────────────

    batchReveal('footer .footer-col', { y: 24 },
      { start: 'top 92%', duration: 0.7, stagger: 0.11 });

    // ── Magnetic buttons ─────────────────────────

    if (finePointer) {
      document.querySelectorAll('.btn-magnetic').forEach(btn => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power2.out' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power2.out' });
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          xTo(((e.clientX - r.left) / r.width  - 0.5) * 12);
          yTo(((e.clientY - r.top)  / r.height - 0.5) * 12);
        });
        btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
      });
    }
  });

  ScrollTrigger.refresh();
});
