/* ================================================
   CRITERIA — main.js
   GSAP animations + JS interactivity
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Register GSAP plugins ──────────────────────
  gsap.registerPlugin(ScrollTrigger, Flip, ScrollToPlugin, TextPlugin, MotionPathPlugin, Observer);

  // ═══════════════════════════════════════════════
  // 1. SCROLL PROGRESS BAR
  // ═══════════════════════════════════════════════
  const progressBar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrolled / total * 100) + '%';
  });

  // ═══════════════════════════════════════════════
  // 2. NAVBAR — scroll behavior
  // ═══════════════════════════════════════════════
  const header = document.getElementById('header');
  ScrollTrigger.create({
    start: 'top -80',
    onEnter: () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled'),
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: () => {
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
      });
      navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + current) l.classList.add('active');
      });
    }
  });

  // ═══════════════════════════════════════════════
  // 3. MOBILE MENU
  // ═══════════════════════════════════════════════
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('open');
    if (isOpen) {
      mobileMenu.classList.remove('hidden');
      gsap.fromTo(mobileMenu, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(mobileMenu, {
        opacity: 0, y: -12, duration: 0.2, ease: 'power2.in',
        onComplete: () => mobileMenu.classList.add('hidden')
      });
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      menuToggle.classList.remove('open');
      gsap.to(mobileMenu, {
        opacity: 0, y: -12, duration: 0.2,
        onComplete: () => {
          mobileMenu.classList.add('hidden');
          scrollToTarget(target);
        }
      });
    });
  });

  // ═══════════════════════════════════════════════
  // 4. SMOOTH SCROLL for nav links
  // ═══════════════════════════════════════════════
  function scrollToTarget(target, offset = 88) {
    if (!target) return;
    gsap.killTweensOf(window);
    gsap.to(window, {
      scrollTo: { y: target, offsetY: offset },
      duration: 0.45,
      ease: 'power2.out',
      overwrite: true
    });
  }

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (link.closest('#mobile-menu')) return;
      scrollToTarget(target);
    });
  });

  // ═══════════════════════════════════════════════
  // 5. HERO ENTRANCE ANIMATION
  // ═══════════════════════════════════════════════
  const heroTl = gsap.timeline({ delay: 0.2 });
  heroTl
    .from('#hero-logo', { opacity: 0, y: -20, duration: 0.7, ease: 'power2.out' })
    .from('#hero-tag', { opacity: 0, x: -20, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .from('#hero-h1', { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out' }, '-=0.2')
    .from('#hero-sub', { opacity: 0, y: 30, duration: 0.7, ease: 'power2.out' }, '-=0.5')
    .from('#hero-desc', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .from('#hero-cta', { opacity: 0, scale: 0.9, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.3')
    .from('#hero-microcopy', { opacity: 0, duration: 0.5 }, '-=0.2')
    .from('#scroll-indicator', { opacity: 0, y: -15, duration: 0.5 }, '-=0.1');

  // ═══════════════════════════════════════════════
  // 6. GENERIC REVEAL UTILITY
  // ═══════════════════════════════════════════════
  function revealUp(selector, options = {}) {
    const defaults = { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0 };
    const config = { ...defaults, ...options };
    gsap.utils.toArray(selector).forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        y: config.y, opacity: config.opacity,
        duration: config.duration, ease: config.ease,
        stagger: config.stagger
      });
    });
  }

  function revealStagger(parent, childSel, options = {}) {
    const defaults = { y: 40, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12 };
    const config = { ...defaults, ...options };
    gsap.utils.toArray(parent).forEach(p => {
      const children = p.querySelectorAll(childSel);
      gsap.from(children, {
        scrollTrigger: { trigger: p, start: 'top 85%', toggleActions: 'play none none none' },
        y: config.y, opacity: config.opacity,
        duration: config.duration, ease: config.ease,
        stagger: config.stagger
      });
    });
  }

  // ═══════════════════════════════════════════════
  // 7. SECTION EYEBROWS & HEADINGS
  // ═══════════════════════════════════════════════
  revealUp('.eyebrow', { y: 20, duration: 0.6 });
  revealUp('.section-heading', { y: 45, duration: 0.85 });
  revealUp('.section-intro', { y: 30, duration: 0.7 });

  // ═══════════════════════════════════════════════
  // 8. SEGMENTATION SECTION
  // ═══════════════════════════════════════════════
  gsap.utils.toArray('.seg-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 87%' },
      x: i === 0 ? -60 : 60,
      opacity: 0, duration: 0.8, ease: 'power3.out'
    });
  });
  revealStagger('.seg-list', 'li', { stagger: 0.08 });

  // ═══════════════════════════════════════════════
  // 9. PROBLEM SECTION
  // ═══════════════════════════════════════════════
  revealStagger('#problema .problem-list', 'li', { stagger: 0.1, y: 25, duration: 0.5 });

  // ═══════════════════════════════════════════════
  // 10. SERVICE CARDS
  // ═══════════════════════════════════════════════
  gsap.utils.toArray('#servicios .service-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 87%' },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: i * 0.12,
      onComplete: () => gsap.set(card, { clearProps: 'transform' })
    });
  });

  // ═══════════════════════════════════════════════
  // 11. PROCESS STEPS
  // ═══════════════════════════════════════════════
  gsap.utils.toArray('.step-wrap').forEach((step, i) => {
    gsap.from(step, {
      scrollTrigger: { trigger: step, start: 'top 88%' },
      opacity: 0, y: 50,
      duration: 0.7, ease: 'power2.out',
      delay: i * 0.15
    });
  });

  // ═══════════════════════════════════════════════
  // 12. TEAM CARDS
  // ═══════════════════════════════════════════════
  gsap.utils.toArray('.team-profile-card').forEach((card, i) => {
    const total = document.querySelectorAll('.team-profile-card').length;
    gsap.from(card, {
      scrollTrigger: { trigger: '#quienes-somos', start: 'top 80%' },
      y: total === 1 ? 36 : 0,
      opacity: 0, duration: 0.8, ease: 'power3.out',
      delay: i * 0.2
    });
  });

  // ═══════════════════════════════════════════════
  // 13. BENEFIT CARDS
  // ═══════════════════════════════════════════════
  revealStagger('#beneficios .benefits-grid', '.benefit-card', { stagger: 0.12, y: 40, duration: 0.65 });

  // ═══════════════════════════════════════════════
  // 14. CTA SECTION
  // ═══════════════════════════════════════════════
  gsap.from('#contacto .cta-content', {
    scrollTrigger: { trigger: '#contacto', start: 'top 82%' },
    y: 50, opacity: 0, duration: 0.9, ease: 'power3.out'
  });
  revealStagger('#contacto', '.contact-item', { stagger: 0.12, x: -20, y: 0, duration: 0.5 });

  // Pulsing CTA button
  const mainCTA = document.getElementById('main-cta-btn');
  if (mainCTA) {
    gsap.to(mainCTA, {
      boxShadow: '0 0 0 12px rgba(64,151,163,0)',
      repeat: -1, duration: 1.8, ease: 'power2.out',
      keyframes: [
        { boxShadow: '0 0 0 0px rgba(64,151,163,0.4)', duration: 0 },
        { boxShadow: '0 0 0 14px rgba(64,151,163,0)', duration: 1.8 }
      ]
    });
  }

  // ═══════════════════════════════════════════════
  // 15. FOOTER
  // ═══════════════════════════════════════════════
  revealStagger('footer .footer-grid', '.footer-col', { stagger: 0.1, y: 30, duration: 0.6 });

  // ═══════════════════════════════════════════════
  // 16. FAQ ACCORDION
  // ═══════════════════════════════════════════════
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      // Open clicked (if wasn't open)
      if (!isOpen) {
        item.classList.add('open');
        // Scroll into view if needed
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            gsap.to(window, { scrollTo: { y: item, offsetY: 120 }, duration: 0.5, ease: 'power2.out' });
          }
        }, 100);
      }
    });
  });

  // ═══════════════════════════════════════════════
  // 17. BUTTON MAGNETIC HOVER
  // ═══════════════════════════════════════════════
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
      gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });
    });
  });

});

