/* ================================================
   CRITERIA - main.js
   Unified interaction layer
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const progressBar = document.getElementById('progress-bar');
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  function updateProgressBar() {
    if (!progressBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  }

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 24);
  }

  function updateActiveNavLink() {
    if (!navLinks.length || !sections.length) return;

    const offset = (header?.offsetHeight || 0) + 140;
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (window.scrollY + offset >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  function handleScrollState() {
    updateProgressBar();
    updateHeaderState();
    updateActiveNavLink();
  }

  window.addEventListener('scroll', handleScrollState, { passive: true });
  window.addEventListener('resize', handleScrollState);
  handleScrollState();

  function closeMobileMenu() {
    if (!menuToggle || !mobileMenu || mobileMenu.classList.contains('hidden')) return;

    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    if (prefersReducedMotion) {
      mobileMenu.classList.add('hidden');
      mobileMenu.style.removeProperty('opacity');
      mobileMenu.style.removeProperty('transform');
      return;
    }

    gsap.to(mobileMenu, {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.style.removeProperty('opacity');
        mobileMenu.style.removeProperty('transform');
      }
    });
  }

  function openMobileMenu() {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    mobileMenu.classList.remove('hidden');

    if (prefersReducedMotion) {
      mobileMenu.style.removeProperty('opacity');
      mobileMenu.style.removeProperty('transform');
      return;
    }

    gsap.fromTo(
      mobileMenu,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'transform,opacity' }
    );
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  function scrollToTarget(target) {
    if (!target) return;

    const offset = (header?.offsetHeight || 0) + 12;
    const duration = prefersReducedMotion ? 0 : 0.55;

    gsap.killTweensOf(window);
    gsap.to(window, {
      scrollTo: { y: target, offsetY: offset },
      duration,
      ease: 'power2.out',
      overwrite: true
    });
  }

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      if (link.closest('#mobile-menu')) {
        closeMobileMenu();
        window.setTimeout(() => scrollToTarget(target), prefersReducedMotion ? 0 : 120);
        return;
      }

      scrollToTarget(target);
    });
  });

  if (!prefersReducedMotion) {
    const heroTargets = [
      document.getElementById('hero-logo'),
      document.getElementById('hero-tag'),
      document.getElementById('hero-h1'),
      document.getElementById('hero-sub'),
      document.getElementById('hero-cta'),
      document.getElementById('hero-microcopy'),
      document.getElementById('hero-media'),
      document.getElementById('scroll-indicator')
    ].filter(Boolean);

    if (heroTargets.length) {
      gsap.timeline({ delay: 0.08 })
        .from(heroTargets, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'transform,opacity'
        });
    }
  }

  function startsVisible(element, threshold = 0.92) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * threshold;
  }

  function revealGroup(trigger, targets, options = {}) {
    if (prefersReducedMotion) return;

    const triggerElement = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
    if (!triggerElement || startsVisible(triggerElement, options.initialThreshold || 0.9)) return;

    const elements = Array.isArray(targets)
      ? targets.filter(Boolean)
      : gsap.utils.toArray(targets).filter(Boolean);

    if (!elements.length) return;

    ScrollTrigger.create({
      trigger: triggerElement,
      start: options.start || 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          elements,
          {
            x: options.x || 0,
            y: options.y ?? 28,
            opacity: 0
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: options.duration || 0.72,
            ease: options.ease || 'power3.out',
            stagger: options.stagger || 0.08,
            clearProps: 'transform,opacity'
          }
        );
      }
    });
  }

  revealGroup('#para-quien', ['#para-quien .section-header', '#para-quien .fit-card', '#para-quien .fit-closer'], {
    y: 22,
    stagger: 0.08
  });

  revealGroup('#problema', ['#problema .problem-copy', '#problema .problem-panel'], {
    y: 28,
    stagger: 0.12
  });
  revealGroup('#problema .problem-signals', '#problema .problem-signal', {
    x: -10,
    y: 18,
    duration: 0.58,
    stagger: 0.06,
    initialThreshold: 0.82
  });

  revealGroup('#servicios', ['#servicios .section-header', '#servicios .cards-grid', '#servicios .services-closer'], {
    y: 24,
    stagger: 0.1
  });
  revealGroup('#servicios .cards-grid', '#servicios .service-card', {
    y: 28,
    duration: 0.64,
    stagger: 0.1,
    initialThreshold: 0.82
  });

  revealGroup('#como-trabajamos', ['#como-trabajamos .section-header', '#como-trabajamos .process-grid', '#como-trabajamos .process-closing'], {
    y: 24,
    stagger: 0.1
  });
  revealGroup('#como-trabajamos .process-grid', '#como-trabajamos .process-step', {
    y: 30,
    duration: 0.66,
    stagger: 0.08,
    initialThreshold: 0.82
  });

  revealGroup('#quienes-somos', ['#quienes-somos .about-credibility-main', '#quienes-somos .about-credibility-principles', '#quienes-somos .about-credibility-statement'], {
    y: 26,
    stagger: 0.1
  });
  revealGroup('#quienes-somos .about-credibility-principles', '#quienes-somos .about-principle-card', {
    y: 22,
    duration: 0.56,
    stagger: 0.06,
    initialThreshold: 0.82
  });

  revealGroup('#beneficios', ['#beneficios .section-header', '#beneficios .benefits-grid', '#beneficios .benefits-closer'], {
    y: 22,
    stagger: 0.1
  });
  revealGroup('#beneficios .benefits-grid', '#beneficios .benefit-card', {
    y: 24,
    duration: 0.6,
    stagger: 0.08,
    initialThreshold: 0.82
  });

  revealGroup('#faqs', ['#faqs .section-header', '#faqs .faq-list'], {
    y: 22,
    stagger: 0.1
  });
  revealGroup('#faqs .faq-list', '#faqs .faq-item', {
    y: 18,
    duration: 0.52,
    stagger: 0.05,
    initialThreshold: 0.82
  });

  revealGroup('#contacto', ['#contacto .cta-main', '#contacto .cta-lower'], {
    y: 24,
    stagger: 0.12
  });
  revealGroup('#contacto .cta-contact-grid', '#contacto .contact-item', {
    x: -12,
    y: 0,
    duration: 0.52,
    stagger: 0.06,
    initialThreshold: 0.82
  });

  revealGroup('footer', 'footer .footer-col', {
    y: 20,
    duration: 0.55,
    stagger: 0.08,
    initialThreshold: 0.88
  });

  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        openItem.classList.remove('open');
        const openButton = openItem.querySelector('.faq-question');
        if (openButton) openButton.setAttribute('aria-expanded', 'false');
      });

      if (isOpen) return;

      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');

      window.setTimeout(() => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 24) {
          scrollToTarget(item);
        }
      }, prefersReducedMotion ? 0 : 120);
    });
  });

  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll('.btn-magnetic').forEach((button) => {
      button.addEventListener('mousemove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;

        gsap.to(button, {
          x,
          y,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: true
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: true
        });
      });
    });
  }

  ScrollTrigger.refresh();
});
