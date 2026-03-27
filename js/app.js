/* ============================================================
   PRATIBHA RAJU PREM KUMAR — Portfolio JavaScript
   Apple-inspired · Minimal · Clean
   ✨ Enhanced with psychological engagement hooks
   ============================================================ */

'use strict';

/* ── HELPERS ──────────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── THEME ────────────────────────────────────────────────── */
function initTheme() { /* Single theme — no toggle needed */ }
function initPalette() { /* Parchment & Ink — single palette */ }

/* ── READING PROGRESS BAR ────────────────────────────────── */
function initProgress() {
  const bar = $('#reading-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = scrollPercent + '%';
  }, { passive: true });
}

/* ── NAVBAR ───────────────────────────────────────────────── */
function initNavbar() {
  const navbar     = $('#navbar');
  const hamburger  = $('#hamburger');
  const navLinks   = $('#nav-links');
  const links      = $$('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu when tapping outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Highlight active section
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observer.observe(s));
}

/* ── BACK TO TOP ──────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── REVEAL ON SCROLL (enhanced with direction support) ──── */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  $$('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

/* ── ANIMATED STAT COUNTERS (Anchoring / Social Proof) ──── */
function animateCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      observer.unobserve(e.target);

      const el = e.target;
      const original = el.dataset.value || el.textContent;
      // Extract leading symbols like $, numeric part, and suffix like + or %
      const match = original.match(/^([^0-9]*)(\d+)(.*)$/);
      if (!match) return;

      const prefix  = match[1];
      const target  = parseInt(match[2], 10);
      const suffix  = match[3];
      const duration = 1200;
      const start   = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out-expo for satisfying deceleration
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * ease);
        el.textContent = prefix + current + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  $$('.stat-number').forEach(el => {
    el.dataset.value = el.textContent;
    observer.observe(el);
  });
}

/* ── PARALLAX SECTION HEADERS ─────────────────────────────── */
function initParallax() {
  const headers = $$('.section-header');
  if (!headers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    headers.forEach(header => {
      const rect = header.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        const offset = (rect.top - window.innerHeight / 2) * 0.04;
        header.style.transform = `translateY(${offset}px)`;
      }
    });
  }, { passive: true });
}

/* ── TYPING ANIMATION ─────────────────────────────────────── */
function startTyping(roles) {
  const el = $('#hero-roles-text');
  if (!el || !roles || roles.length === 0) return;
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const current = roles[ri];
    if (!deleting) {
      el.textContent = current.slice(0, ++ci);
      if (ci === current.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = current.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(tick, deleting ? 60 : 100);
  }
  tick();
}

/* ── SOCIALS BUILDER ──────────────────────────────────────── */
const SOCIAL_ICONS = {
  github:    { icon: 'fab fa-github',    label: 'GitHub' },
  linkedin:  { icon: 'fab fa-linkedin',  label: 'LinkedIn' },
  twitter:   { icon: 'fab fa-twitter',   label: 'Twitter' },
  x:         { icon: 'fab fa-x-twitter', label: 'X' },
  instagram: { icon: 'fab fa-instagram', label: 'Instagram' },
  youtube:   { icon: 'fab fa-youtube',   label: 'YouTube' },
  medium:    { icon: 'fab fa-medium',    label: 'Medium' },
  email:     { icon: 'fas fa-envelope',  label: 'Email' },
  website:   { icon: 'fas fa-globe',     label: 'Website' },
};

function buildSocials(socials = [], className = '') {
  return socials.map(s => {
    const info = SOCIAL_ICONS[s.platform] || { icon: 'fas fa-link', label: s.platform };
    const isEmail = s.platform === 'email';
    const href = isEmail ? `mailto:${s.url}` : s.url;
    const target = isEmail ? '' : ' target="_blank" rel="noopener"';
    return `<a href="${href}"${target} class="social-icon ${className}" title="${info.label}">
              <i class="${info.icon}"></i>
            </a>`;
  }).join('');
}

/* ── LOAD PROFILE ─────────────────────────────────────────── */
async function loadProfile() {
  const data = await fetch('data/profile.json').then(r => r.json());

  // Page meta
  document.title = `${data.name} — Portfolio`;
  const pageTitle = $('#page-title');
  if (pageTitle) pageTitle.textContent = `${data.name} — Portfolio`;

  // Navbar
  $('#nav-name').textContent = data.shortName || data.name.split(' ')[0];

  // Hero
  $('#hero-bio').textContent   = data.tagline;
  $('#hero-status').textContent = data.status || 'Open to opportunities';

  // Avatar
  const avatarImg = $('#avatar-img');
  const initials  = $('#avatar-initials');
  if (data.avatar) {
    avatarImg.style.display = '';
    avatarImg.src = data.avatar;
    avatarImg.alt = data.name;
  } else {
    avatarImg.style.display    = 'none';
    initials.style.display     = 'flex';
    initials.textContent       = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // Resume download
  const resumeBtn = $('#resume-download');
  if (resumeBtn) {
    if (data.resumePdf) {
      resumeBtn.href = data.resumePdf;
      resumeBtn.style.display = 'inline-flex';
    } else {
      resumeBtn.style.display = 'none';
    }
  }

  // Socials
  $('#hero-socials').innerHTML   = buildSocials(data.socials);
  $('#footer-socials').innerHTML = buildSocials(data.socials);

  // About — long description with paragraph breaks
  const aboutEl = $('#about-long');
  if (aboutEl) aboutEl.textContent = data.about;

  // About prose — directional reveal (slides in from left)
  const aboutProse = $('#about-long-wrap');
  if (aboutProse) aboutProse.classList.add('reveal-left');

  // About sidebar — directional reveal (slides in from right)
  const aboutSidebar = aboutProse?.parentElement?.querySelector('.about-sidebar');
  if (aboutSidebar) aboutSidebar.classList.add('reveal-right');

  // Highlights — staggered cascade (Zeigarnik: each row appearing makes you wait for the next)
  const highlightsList = $('#about-highlights');
  highlightsList.classList.add('reveal-stagger');
  highlightsList.innerHTML = (data.highlights || []).map(h =>
    `<div class="highlight-row reveal">
       <i class="${h.icon}"></i>
       <span>${h.text}</span>
     </div>`
  ).join('');

  // Stats — blocks with counter animation
  $('#about-stats').innerHTML = (data.stats || []).map(s =>
    `<div class="stat-block">
       <div class="stat-number">${s.value}</div>
       <div class="stat-label">${s.label}</div>
     </div>`
  ).join('');

  // Footer
  $('#footer-name').textContent     = data.shortName || data.name.split(' ')[0];
  $('#footer-tagline').textContent  = data.footerTagline || data.tagline;
  $('#footer-copyright').textContent = `\u00A9 ${new Date().getFullYear()} ${data.name}. All rights reserved.`;

  // Contact subtitle
  const contactSub = $('#contact-subtitle');
  if (contactSub) {
    contactSub.textContent = data.contactSubtitle || 'Have a project in mind or just want to say hi? I\u2019d love to hear from you.';
  }

  // Contact form — mailto handler
  const email = (data.socials || []).find(s => s.platform === 'email');
  if (email) {
    const emailLinkEl = $('#contact-email-link');
    if (emailLinkEl) {
      emailLinkEl.innerHTML = `<a href="mailto:${email.url}">${email.url}</a>`;
    }

    const form = $('#contact-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const name    = $('#c-name').value;
        const from    = $('#c-email').value;
        const subject = $('#c-subject').value;
        const body    = $('#c-message').value;
        const mailtoUrl = `mailto:${email.url}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} <${from}>\n\n${body}`)}`;
        const a = document.createElement('a');
        a.href = mailtoUrl;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    }
  }

  // Contact info — staggered rows
  const contactInfo = $('#contact-info');
  contactInfo.classList.add('reveal-stagger');
  contactInfo.innerHTML = (data.contactItems || []).map(c => {
    let href = '';
    let clickable = false;
    let isEmail = false;
    const val = c.value || '';

    if (c.label.toLowerCase() === 'email' || c.icon.includes('envelope')) {
      href = `mailto:${val}`;
      clickable = true;
      isEmail = true;
    } else if (c.label.toLowerCase() === 'linkedin' || c.icon.includes('linkedin')) {
      href = val.startsWith('http') ? val : `https://${val}`;
      clickable = true;
      c._displayText = 'View LinkedIn Profile';
    } else if (val.startsWith('http') || val.includes('.com') || val.includes('.org')) {
      href = val.startsWith('http') ? val : `https://${val}`;
      clickable = true;
    }

    const target = isEmail ? '' : ' target="_blank" rel="noopener"';
    const displayText = c._displayText || val;
    const valueHtml = clickable
      ? `<a href="${href}"${target} class="contact-row-link">${displayText}</a>`
      : val;

    return `<div class="contact-row reveal">
       <div class="contact-row-icon"><i class="${c.icon}"></i></div>
       <div>
         <div class="contact-row-label">${c.label}</div>
         <div class="contact-row-value">${valueHtml}</div>
       </div>
     </div>`;
  }).join('');

  // Beyond Work / Industry Engagement
  const bw = data.beyondWork;
  if (bw && bw.items && bw.items.length > 0) {
    $('#beyond-work-title').textContent    = bw.title    || 'Beyond Work';
    $('#beyond-work-subtitle').textContent = bw.subtitle || '';
    $('#beyond-work-section').style.display = 'block';
    $('#beyond-work-grid').innerHTML = bw.items.map(item =>
      `<a href="${item.url}" target="_blank" rel="noopener" class="beyond-card reveal">
         <div class="beyond-card-top">
           <span class="beyond-emoji">${item.emoji || '\u2696\uFE0F'}</span>
           <span class="beyond-role">${item.role}</span>
         </div>
         <h4 class="beyond-event">${item.event}</h4>
         ${item.location ? `<div class="beyond-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</div>` : ''}
         <p class="beyond-desc">${item.description}</p>
         <span class="beyond-link">View event <i class="fas fa-arrow-right"></i></span>
       </a>`
    ).join('');
    initBeyondCarousel();
  }

  // Typing animation
  startTyping(data.roles);

  initReveal();
  return data;
}

/* ── BEYOND WORK CAROUSEL ────────────────────────────────── */
function initBeyondCarousel() {
  const grid = $('#beyond-work-grid');
  const prev = $('#beyond-prev');
  const next = $('#beyond-next');
  if (!grid || !prev || !next) return;

  const scrollAmount = () => {
    const card = grid.querySelector('.beyond-card');
    return card ? card.offsetWidth + 16 : 320;
  };

  const updateButtons = () => {
    prev.disabled = grid.scrollLeft <= 2;
    next.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
  };

  prev.addEventListener('click', () => {
    grid.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    grid.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });

  grid.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();
  requestAnimationFrame(updateButtons);
}

/* ── LOAD SKILLS ──────────────────────────────────────────── */
async function loadSkills() {
  const { skills } = await fetch('data/resume.json').then(r => r.json());
  const grid = $('#skills-grid');
  grid.classList.add('reveal-stagger');
  grid.innerHTML = (skills || []).map(cat =>
    `<div class="skill-group reveal">
       <h3>${cat.category}</h3>
       <div class="skill-tags">
         ${(cat.items || []).map(s =>
           `<span class="skill-tag">
              ${s.icon ? `<i class="${s.icon}"></i>` : ''}
              ${s.name}
            </span>`
         ).join('')}
       </div>
     </div>`
  ).join('');
}

/* ── LOAD RESUME ──────────────────────────────────────────── */
async function loadResume() {
  const data = await fetch('data/resume.json').then(r => r.json());

  // Experience
  $('#experience-timeline').innerHTML = (data.experience || []).map(item =>
    `<div class="timeline-item reveal">
       <div class="timeline-meta">
         ${item.logo ? `<img class="timeline-logo" src="${item.logo}" alt="${item.company} logo" width="44" height="44" loading="lazy" />` : ''}
         <span class="timeline-date">${item.from} \u2013 ${item.to || 'Present'}</span>
         <span class="timeline-company">${item.company}</span>
         ${item.location ? `<span class="timeline-location">${item.location}</span>` : ''}
       </div>
       <div class="timeline-body">
         <div class="timeline-role">${item.role}</div>
         <p class="timeline-desc">${item.description}</p>
         ${item.tags ? `<div class="timeline-tags">${item.tags.map(t => `<span class="timeline-tag">${t}</span>`).join('')}</div>` : ''}
       </div>
     </div>`
  ).join('');

  // Education
  $('#education-timeline').innerHTML = (data.education || []).map(item =>
    `<div class="timeline-item reveal">
       <div class="timeline-meta">
         ${item.logo ? `<img class="timeline-logo" src="${item.logo}" alt="${item.institution} logo" width="44" height="44" loading="lazy" />` : ''}
         <span class="timeline-date">${item.from} \u2013 ${item.to || 'Present'}</span>
         <span class="timeline-company">${item.institution}</span>
       </div>
       <div class="timeline-body">
         <div class="timeline-role">${item.degree}</div>
         <p class="timeline-desc">${item.description || ''}</p>
         ${item.tags ? `<div class="timeline-tags">${item.tags.map(t => `<span class="timeline-tag">${t}</span>`).join('')}</div>` : ''}
       </div>
     </div>`
  ).join('');

  // Achievements — staggered grid
  const achievementsGrid = $('#achievements-grid');
  achievementsGrid.classList.add('reveal-stagger');
  achievementsGrid.innerHTML = (data.achievements || []).map(a => {
    const inner = `
      <div class="achievement-icon">${a.emoji || '\uD83C\uDFC6'}</div>
      <div>
        <h4>${a.title}</h4>
        <p>${a.description}</p>
        <div class="achievement-footer">
          ${a.year ? `<span class="achievement-year">${a.year}</span>` : ''}
          ${a.url  ? `<span class="achievement-url-badge"><i class="fas fa-external-link-alt"></i> View</span>` : ''}
        </div>
      </div>`;
    return a.url
      ? `<a href="${a.url}" target="_blank" rel="noopener" class="achievement-card achievement-card-link reveal">${inner}</a>`
      : `<div class="achievement-card reveal">${inner}</div>`;
  }).join('');

  // Tabs
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      $(`#tab-${btn.dataset.tab}`).classList.add('active');
      initReveal();
    });
  });
}

/* ── LOAD PROJECTS ────────────────────────────────────────── */
async function loadProjects() {
  const { projects } = await fetch('data/resume.json').then(r => r.json());
  if (!projects || projects.length === 0) return;

  const allTags = [...new Set(projects.flatMap(p => p.tags || []))];

  $('#project-filters').innerHTML =
    `<button class="filter-btn active" data-filter="all">All</button>` +
    allTags.map(t => `<button class="filter-btn" data-filter="${t}">${t}</button>`).join('');

  const grid = $('#projects-grid');
  grid.classList.add('reveal-stagger');
  grid.innerHTML = projects.map(p =>
    `<div class="project-card reveal" data-tags="${(p.tags || []).join(',')}">
       <div class="project-image">
         ${p.image ? `<img src="${p.image}" alt="${p.title}" loading="lazy" />` : p.emoji || '\uD83D\uDE80'}
         ${p.featured ? '<span class="project-featured-badge">\u2B50 Featured</span>' : ''}
       </div>
       <div class="project-body">
         <h3 class="project-title">${p.title}</h3>
         <p class="project-desc">${p.description}</p>
         <div class="project-tags">${(p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
         <div class="project-links">
           ${p.github  ? `<a href="${p.github}"  target="_blank" rel="noopener" class="project-link"><i class="fab fa-github"></i> Code</a>` : ''}
           ${p.demo    ? `<a href="${p.demo}"    target="_blank" rel="noopener" class="project-link"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
           ${p.article ? `<a href="${p.article}" target="_blank" rel="noopener" class="project-link"><i class="fas fa-file-alt"></i> Article</a>` : ''}
         </div>
       </div>
     </div>`
  ).join('');

  // Filter
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      $$('.project-card').forEach(card => {
        const tags = card.dataset.tags.split(',');
        card.classList.toggle('hidden', filter !== 'all' && !tags.includes(filter));
      });
    });
  });
}

/* ── HIDE SCROLL HINT AFTER SCROLLING ─────────────────────── */
function initScrollHintFade() {
  const hint = $('.scroll-hint');
  if (!hint) return;
  let hidden = false;
  window.addEventListener('scroll', () => {
    if (!hidden && window.scrollY > 100) {
      hint.style.opacity = '0';
      hint.style.transition = 'opacity 0.6s ease';
      hidden = true;
    }
  }, { passive: true });
}

/* ── BOOT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initPalette();
  initProgress();
  initNavbar();
  initBackToTop();
  initScrollHintFade();

  // Load all data in parallel
  await Promise.all([
    loadProfile(),
    loadSkills(),
    loadResume(),
    loadProjects(),
  ]);

  initReveal();
  animateCounters();
  initParallax();
});
