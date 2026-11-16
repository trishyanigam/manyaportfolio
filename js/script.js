/**
 * ==========================================================================
 * Manya Nigam - Professional Portfolio Scripts
 * Pure Vanilla JavaScript (ES6+)
 * 
 * Features:
 * 1. Mobile navigation toggle & accessible keyboard traps
 * 2. Header elevation and styling on scroll
 * 3. Smooth scrolling with sticky navbar offset calculation
 * 4. Active section scroll-spy (IntersectionObserver)
 * 5. Scroll-triggered reveal animations (IntersectionObserver)
 * 6. Animated achievement numbers counter (easeOutCubic)
 * 7. Interactive email copy to clipboard with toast feedback
 * 8. Back-to-top smooth scrolling
 * 9. prefers-reduced-motion accessibility compliance
 * ==========================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopLinks = document.querySelectorAll('.back-to-top');

  /* -------------------------------------------------------------------------
     1. Responsive Mobile Navigation Toggle & Accessibility
     ------------------------------------------------------------------------- */
  const toggleMobileNav = (forceState = null) => {
    if (!navToggle || !navMenu) return;
    const isCurrentlyOpen = navMenu.classList.contains('nav-open');
    const shouldOpen = forceState !== null ? forceState : !isCurrentlyOpen;

    navMenu.classList.toggle('nav-open', shouldOpen);
    navToggle.setAttribute('aria-expanded', String(shouldOpen));
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });

    // Close on navigation link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileNav(false);
      });
    });

    // Close when clicking outside of the menu
    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('nav-open') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        toggleMobileNav(false);
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('nav-open')) {
        toggleMobileNav(false);
        navToggle.focus();
      }
    });
  }

  /* -------------------------------------------------------------------------
     2. Navbar Styling Changes on Scroll
     ------------------------------------------------------------------------- */
  const handleHeaderElevation = () => {
    if (!header) return;
    const scrollThreshold = 35;
    if (window.scrollY > scrollThreshold) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderElevation, { passive: true });
  handleHeaderElevation(); // Run on initial load

  /* -------------------------------------------------------------------------
     3. Smooth Scrolling with Offset Calculation
     ------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header ? header.getBoundingClientRect().height : 72;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        // Set URL hash without jump
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  /* -------------------------------------------------------------------------
     4. Active Navigation Link Highlighting (Scroll-Spy)
     ------------------------------------------------------------------------- */
  const updateActiveNavLink = () => {
    const scrollPosition = window.scrollY + 100; // Offset for fixed header
    
    // Bottom of page: activate Contact link
    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === '#contact') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      return;
    }

    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  /* -------------------------------------------------------------------------
     5. Scroll-Triggered Reveal Animations
     ------------------------------------------------------------------------- */
  const elementsToReveal = document.querySelectorAll(`
    .section-header,
    .about-summary-card,
    .highlight-card,
    .timeline-card,
    .stat-card,
    .skills-card,
    .education-card,
    .cert-card,
    .contact-info-panel,
    .contact-card-cta
  `);

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    // Add base reveal class
    elementsToReveal.forEach((el, index) => {
      el.classList.add('reveal');
      // Apply staggered delays for siblings inside the same grid
      const delayClass = `reveal-delay-${(index % 4) + 1}`;
      el.classList.add(delayClass);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    elementsToReveal.forEach(el => revealObserver.observe(el));
  } else {
    // If reduced motion is requested or IntersectionObserver is unsupported, reveal immediately
    elementsToReveal.forEach(el => el.classList.add('revealed'));
  }

  /* -------------------------------------------------------------------------
     6. Animated Achievement Counters
     ------------------------------------------------------------------------- */
  const counterElements = document.querySelectorAll('[data-target]');

  // Cubic easing function for smooth deceleration
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  // Format numbers for Indian currency / commas
  const formatCounterNumber = (value, format) => {
    if (format === 'lakh') {
      const inLakhs = (value / 100000).toFixed(1);
      return `${inLakhs}L`;
    } else if (format === 'inr') {
      // Indian numbering system formatting: 2,50,000
      return value.toLocaleString('en-IN');
    } else {
      return value.toLocaleString('en-US');
    }
  };

  const animateCounter = (element) => {
    const targetValue = parseInt(element.getAttribute('data-target'), 10);
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const format = element.getAttribute('data-format') || 'standard';

    if (isNaN(targetValue) || prefersReducedMotion) {
      element.textContent = `${prefix}${formatCounterNumber(targetValue, format)}${suffix}`;
      return;
    }

    const duration = 1800; // milliseconds
    const startTime = performance.now();

    const updateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentVal = Math.floor(easedProgress * targetValue);

      element.textContent = `${prefix}${formatCounterNumber(currentVal, format)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      } else {
        element.textContent = `${prefix}${formatCounterNumber(targetValue, format)}${suffix}`;
      }
    };

    requestAnimationFrame(updateFrame);
  };

  if ('IntersectionObserver' in window && counterElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.35
    });

    counterElements.forEach(counter => counterObserver.observe(counter));
  } else {
    counterElements.forEach(counter => animateCounter(counter));
  }

  /* -------------------------------------------------------------------------
     7. Back-To-Top Button Functionality
     ------------------------------------------------------------------------- */
  backToTopLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* -------------------------------------------------------------------------
     8. Gmail Dispatch & Contact Interactions
     ------------------------------------------------------------------------- */
  // Create toast feedback notification element
  let toastElement = document.querySelector('.copy-feedback-toast');
  if (!toastElement) {
    toastElement = document.createElement('div');
    toastElement.className = 'copy-feedback-toast';
    toastElement.setAttribute('role', 'status');
    toastElement.setAttribute('aria-live', 'polite');
    toastElement.innerHTML = `
      <span aria-hidden="true">&#9989;</span>
      <span class="toast-message">Opening Gmail...</span>
    `;
    document.body.appendChild(toastElement);
  }

  let toastTimeout = null;
  const showToast = (message) => {
    if (!toastElement) return;
    const messageSpan = toastElement.querySelector('.toast-message');
    if (messageSpan) messageSpan.textContent = message;

    toastElement.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastElement.classList.remove('show');
    }, 3200);
  };

  // Primary Send Email button click feedback
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', () => {
      showToast('Redirecting to Gmail (nigammanya2806@gmail.com)...');
    });
  }

  // Enhance all direct Gmail links with click feedback
  const gmailLinks = document.querySelectorAll('a[href*="mail.google.com"]');
  gmailLinks.forEach(link => {
    link.addEventListener('click', () => {
      showToast('Opening Gmail to compose to nigammanya2806@gmail.com...');
    });
  });

  /* -------------------------------------------------------------------------
     9. Interactive Card Hover Glow Tracking
     ------------------------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const cards = document.querySelectorAll('.highlight-card, .timeline-card, .stat-card, .skills-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  /* -------------------------------------------------------------------------
     10. Email Send Box Modal Functionality
     ------------------------------------------------------------------------- */
  const openEmailModalBtn = document.getElementById('openEmailModalBtn');
  const closeEmailModalBtn = document.getElementById('closeEmailModalBtn');
  const cancelEmailModalBtn = document.getElementById('cancelEmailModalBtn');
  const emailModalOverlay = document.getElementById('emailModalOverlay');
  const emailForm = document.getElementById('emailForm');
  const formStatus = document.getElementById('formStatus');
  const senderNameInput = document.getElementById('senderName');

  const openEmailModal = () => {
    if (!emailModalOverlay) return;
    emailModalOverlay.classList.add('modal-active');
    emailModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }
    // Auto-focus the sender name field
    setTimeout(() => {
      if (senderNameInput) senderNameInput.focus();
    }, 150);
  };

  const closeEmailModal = () => {
    if (!emailModalOverlay) return;
    emailModalOverlay.classList.remove('modal-active');
    emailModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (openEmailModalBtn) {
    openEmailModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openEmailModal();
    });
  }

  if (closeEmailModalBtn) {
    closeEmailModalBtn.addEventListener('click', closeEmailModal);
  }

  if (cancelEmailModalBtn) {
    cancelEmailModalBtn.addEventListener('click', closeEmailModal);
  }

  // Close when clicking on backdrop
  if (emailModalOverlay) {
    emailModalOverlay.addEventListener('click', (e) => {
      if (e.target === emailModalOverlay) {
        closeEmailModal();
      }
    });
  }

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && emailModalOverlay && emailModalOverlay.classList.contains('modal-active')) {
      closeEmailModal();
      if (openEmailModalBtn) openEmailModalBtn.focus();
    }
  });

  // Handle Form Submission
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const recipient = 'nigammanya2806@gmail.com';
      const senderName = document.getElementById('senderName')?.value.trim() || 'A Visitor';
      const senderEmail = document.getElementById('senderEmail')?.value.trim() || '';
      const emailSubject = document.getElementById('emailSubject')?.value.trim() || 'Inquiry for Manya Nigam';
      const emailMessage = document.getElementById('emailMessage')?.value.trim() || '';

      const formattedBody = `Hi Manya,\n\n${emailMessage}\n\n---\nSender Details:\nName: ${senderName}\nEmail: ${senderEmail}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(formattedBody)}`;

      if (formStatus) {
        formStatus.className = 'form-status status-success';
        formStatus.textContent = `Redirecting to Gmail for ${recipient}...`;
      }

      // Redirect directly to Gmail compose in a new tab
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');

      // Copy message to clipboard as helpful backup
      if (navigator.clipboard) {
        navigator.clipboard.writeText(formattedBody).catch(() => {});
      }

      // Close modal and show toast confirmation
      setTimeout(() => {
        closeEmailModal();
        emailForm.reset();
        const subjectInput = document.getElementById('emailSubject');
        if (subjectInput) subjectInput.value = 'Opportunity / Inquiry for Manya Nigam';
        showToast(`Redirected to Gmail (${recipient})`);
      }, 1200);
    });
  }

  // Console notice
  console.log('%c Manya Nigam Portfolio %c Initialized successfully ', 'background: #6366f1; color: #fff; font-weight: bold; border-radius: 4px;', 'background: #0f172a; color: #a5b4fc;');
});
