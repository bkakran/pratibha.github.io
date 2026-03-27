/* ============================================================
   BLOG — Listing & Article Renderer
   Parchment & Ink Theme
   Content: Loaded from posts/index.json + posts/{slug}.md
   CMS: Decap CMS (admin/index.html)
   ✨ SEO-enhanced with dynamic meta tags & structured data
   ============================================================ */

'use strict';

const SITE_URL = 'https://pratibharpk.com';
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── SHARED: Navbar, Progress, Back-to-top ───────────────── */
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

function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');

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

  $$('.nav-link').forEach(link => {
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
}

function initBackToTop() {
  const btn = $('#back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── REVEAL ON SCROLL ────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach(el => observer.observe(el));
}

/* ── HELPERS ──────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function readingTime(text) {
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200)) + ' min read';
}

function getPostUrl(slug) {
  return `blog-post.html?slug=${slug}`;
}

function getFullPostUrl(slug) {
  return `${SITE_URL}/blog-post.html?slug=${slug}`;
}

/* ── DYNAMIC SEO INJECTION ───────────────────────────────── */
function updateMetaTag(selector, content) {
  const el = $(selector);
  if (el) el.setAttribute('content', content);
}

function injectBlogPostSEO(post) {
  const fullUrl = getFullPostUrl(post.slug);

  // Update page title
  document.title = `${post.title} — Pratibha Raju Prem Kumar`;

  // Meta description
  updateMetaTag('#meta-description', post.excerpt);

  // Canonical URL
  const canonical = $('#canonical-link');
  if (canonical) canonical.setAttribute('href', fullUrl);

  // Open Graph
  updateMetaTag('#og-url', fullUrl);
  updateMetaTag('#og-title', post.title);
  updateMetaTag('#og-description', post.excerpt);
  // Prefer generated OG image, then coverImage, then default
  const ogImage = post.coverImage || `${SITE_URL}/images/og/og-${post.slug}.png`;
  updateMetaTag('#og-image', ogImage);
  if (post.date) updateMetaTag('#og-published', post.date);

  // Twitter Card
  updateMetaTag('#tw-title', post.title);
  updateMetaTag('#tw-description', post.excerpt);

  // Breadcrumb update
  const breadcrumbCurrent = $('#breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = post.title;

  // Inject JSON-LD BlogPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author || "Pratibha Raju Prem Kumar",
      "url": SITE_URL
    },
    "url": fullUrl,
    "mainEntityOfPage": { "@type": "WebPage", "@id": fullUrl },
    "datePublished": post.date,
    "dateModified": post.date,
    "publisher": {
      "@type": "Person",
      "name": "Pratibha Raju Prem Kumar"
    },
    "keywords": (post.tags || []).join(', '),
    "articleSection": post.category || "Product Management",
    "wordCount": post.content ? post.content.split(/\s+/).length : 0
  };

  if (post.coverImage) jsonLd.image = post.coverImage;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);

  // Inject Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": SITE_URL + "/blog.html" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": fullUrl }
    ]
  };

  const breadcrumbScript = document.createElement('script');
  breadcrumbScript.type = 'application/ld+json';
  breadcrumbScript.textContent = JSON.stringify(breadcrumbJsonLd);
  document.head.appendChild(breadcrumbScript);
}

/* ── MARKDOWN → HTML (lightweight) ───────────────────────── */
function simpleMarkdown(md = '') {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---+$/gm, '<hr>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>')
    .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^(?!<[hupblicer])(?!$)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

/* ── FRONTMATTER PARSER ──────────────────────────────────── */
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    let key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (val.startsWith('[') && val.endsWith(']')) {
      try { val = JSON.parse(val); } catch (_) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
    }
    if (val === 'true')  val = true;
    if (val === 'false') val = false;
    meta[key] = val;
  });
  return { meta, body: match[2] };
}

/* ── FETCH A SINGLE POST ─────────────────────────────────── */
async function fetchPost(slug) {
  const res = await fetch(`posts/${slug}.md`);
  if (!res.ok) throw new Error(`Post not found: ${slug}`);
  const text = await res.text();
  const { meta, body } = parseFrontmatter(text);
  const tags = Array.isArray(meta.tags)
    ? meta.tags
    : (meta.tags ? meta.tags.split(',').map(t => t.trim()) : []);
  return {
    slug,
    title:      meta.title      || slug,
    date:       meta.date       || '',
    author:     meta.author     || '',
    emoji:      meta.emoji      || '📝',
    category:   meta.category   || '',
    coverImage: meta.coverImage || '',
    featured:   meta.featured === true || meta.featured === 'true',
    tags,
    excerpt:    meta.excerpt    || '',
    content:    body,
  };
}

/* ── SOCIAL ICONS (for footer) ───────────────────────────── */
const SOCIAL_ICONS = {
  github:    { icon: 'fab fa-github',    label: 'GitHub' },
  linkedin:  { icon: 'fab fa-linkedin',  label: 'LinkedIn' },
  twitter:   { icon: 'fab fa-twitter',   label: 'Twitter' },
  email:     { icon: 'fas fa-envelope',  label: 'Email' },
};

function buildSocials(socials = []) {
  return socials.map(s => {
    const info = SOCIAL_ICONS[s.platform] || { icon: 'fas fa-link', label: s.platform };
    const isEmail = s.platform === 'email';
    const href = isEmail ? `mailto:${s.url}` : s.url;
    const target = isEmail ? '' : ' target="_blank" rel="noopener"';
    return `<a href="${href}"${target} class="social-icon" title="${info.label}" aria-label="${info.label}"><i class="${info.icon}" aria-hidden="true"></i></a>`;
  }).join('');
}

/* ── LOAD FOOTER DATA ────────────────────────────────────── */
async function loadFooter() {
  try {
    const data = await fetch('data/profile.json').then(r => r.json());
    const footerName    = $('#footer-name');
    const footerTagline = $('#footer-tagline');
    const footerSocials = $('#footer-socials');
    const footerCopy    = $('#footer-copyright');

    if (footerName)    footerName.textContent    = data.shortName || data.name.split(' ')[0];
    if (footerTagline) footerTagline.textContent = data.footerTagline || data.tagline;
    if (footerSocials) footerSocials.innerHTML   = buildSocials(data.socials);
    if (footerCopy)    footerCopy.textContent    = `\u00A9 ${new Date().getFullYear()} ${data.name}. All rights reserved.`;
  } catch (e) {
    console.warn('Could not load profile for footer:', e);
  }
}

/* ── BLOG CARD HTML ──────────────────────────────────────── */
function blogCardHTML(post) {
  const rt = post.content ? readingTime(post.content) : (post.readTime || '');
  return `
    <a href="${getPostUrl(post.slug)}" class="blog-card reveal" data-category="${post.category}" data-tags="${(post.tags || []).join(',')}" role="listitem">
      <div class="blog-card-image">
        ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" loading="lazy" />` : (post.emoji || '📝')}
      </div>
      <div class="blog-card-body">
        <span class="blog-card-category">${post.category}</span>
        <h3 class="blog-card-title">${post.title}</h3>
        <p class="blog-card-excerpt">${post.excerpt}</p>
        <div class="blog-card-meta">
          <span><i class="fas fa-calendar-alt" aria-hidden="true"></i> <time datetime="${post.date}">${formatDate(post.date)}</time></span>
          ${rt ? `<span><i class="fas fa-clock" aria-hidden="true"></i> ${rt}</span>` : ''}
        </div>
      </div>
    </a>`;
}

/* ── BLOG LISTING PAGE ───────────────────────────────────── */
let allPosts = [];
let featuredPost = null;

async function loadBlogListing() {
  const gridEl     = $('#blog-grid');
  const featuredEl = $('#blog-featured');
  const filtersEl  = $('#blog-filters');
  if (!gridEl) return; // not on listing page

  // Load manifest from posts/index.json
  const index = await fetch('posts/index.json').then(r => r.json());
  const slugs = (index.posts || []).map(p => p.slug).filter(Boolean);

  // Fetch all markdown posts in parallel
  const settled = await Promise.allSettled(slugs.map(fetchPost));
  allPosts = settled
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (allPosts.length === 0) return;

  // Featured post (first featured article)
  featuredPost = allPosts.find(b => b.featured);
  const remaining = allPosts.filter(b => b !== featuredPost);

  if (featuredPost && featuredEl) {
    const rt = readingTime(featuredPost.content);
    featuredEl.innerHTML = `
      <a href="${getPostUrl(featuredPost.slug)}" class="blog-featured-card reveal">
        <div class="blog-featured-image">
          ${featuredPost.coverImage ? `<img src="${featuredPost.coverImage}" alt="${featuredPost.title}" loading="lazy" />` : (featuredPost.emoji || '📝')}
          <span class="blog-featured-badge"><i class="fas fa-star" aria-hidden="true"></i> Featured</span>
        </div>
        <div class="blog-featured-body">
          <span class="blog-featured-category">${featuredPost.category}</span>
          <h2 class="blog-featured-title">${featuredPost.title}</h2>
          <p class="blog-featured-excerpt">${featuredPost.excerpt}</p>
          <div class="blog-featured-meta">
            <span><i class="fas fa-calendar-alt" aria-hidden="true"></i> <time datetime="${featuredPost.date}">${formatDate(featuredPost.date)}</time></span>
            <span><i class="fas fa-clock" aria-hidden="true"></i> ${rt}</span>
          </div>
          <span class="blog-featured-link">Read article <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
        </div>
      </a>`;
  }

  // Grid of remaining posts
  gridEl.innerHTML = remaining.map(post => blogCardHTML(post)).join('');

  // Filters
  const allCategories = [...new Set(allPosts.map(b => b.category).filter(Boolean))];
  if (filtersEl && allCategories.length > 1) {
    filtersEl.innerHTML =
      `<button class="blog-filter-btn active" data-filter="all">All</button>` +
      allCategories.map(c => `<button class="blog-filter-btn" data-filter="${c}">${c}</button>`).join('');

    $$('.blog-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.blog-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        // Clear search when switching filters
        const searchInput = $('#blog-search-input');
        if (searchInput) { searchInput.value = ''; toggleClearBtn(''); updateSearchStatus(''); }

        // Filter featured
        if (featuredPost && featuredEl) {
          featuredEl.style.display = (filter === 'all' || featuredPost.category === filter) ? '' : 'none';
        }

        // Filter grid
        $$('.blog-card', gridEl).forEach(card => {
          const cat = card.dataset.category;
          card.classList.toggle('hidden', filter !== 'all' && cat !== filter);
        });
      });
    });
  }

  // Initialize search
  initBlogSearch();

  initReveal();
}

/* ── BLOG SEARCH ─────────────────────────────────────────── */
function initBlogSearch() {
  const input    = $('#blog-search-input');
  const clearBtn = $('#blog-search-clear');
  if (!input) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim();
      toggleClearBtn(query);
      filterBySearch(query);
    }, 200);
  });

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      toggleClearBtn('');
      filterBySearch('');
    });
  }

  // ESC key to clear
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      toggleClearBtn('');
      filterBySearch('');
      input.blur();
    }
  });
}

function toggleClearBtn(query) {
  const clearBtn = $('#blog-search-clear');
  if (clearBtn) clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
}

function updateSearchStatus(msg) {
  const status = $('#blog-search-status');
  if (status) status.textContent = msg;
}

function filterBySearch(query) {
  const gridEl     = $('#blog-grid');
  const featuredEl = $('#blog-featured');
  const filtersEl  = $('#blog-filters');

  if (!query) {
    // Reset: show everything, respect active filter
    const activeFilter = $('.blog-filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';

    if (featuredPost && featuredEl) {
      featuredEl.style.display = (filter === 'all' || featuredPost.category === filter) ? '' : 'none';
    }

    $$('.blog-card', gridEl).forEach(card => {
      const cat = card.dataset.category;
      card.classList.toggle('hidden', filter !== 'all' && cat !== filter);
    });

    // Show filters
    if (filtersEl) filtersEl.style.display = '';
    updateSearchStatus('');
    return;
  }

  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  // Match function: all search words must appear in at least one field
  function matchPost(post) {
    const searchable = [
      post.title,
      post.excerpt,
      post.category,
      (post.tags || []).join(' '),
      post.author || ''
    ].join(' ').toLowerCase();

    return words.every(word => searchable.includes(word));
  }

  // Hide filters during search
  if (filtersEl) filtersEl.style.display = 'none';

  let matchCount = 0;

  // Filter featured
  if (featuredPost && featuredEl) {
    const matches = matchPost(featuredPost);
    featuredEl.style.display = matches ? '' : 'none';
    if (matches) matchCount++;
  }

  // Filter grid cards
  const remaining = allPosts.filter(p => p !== featuredPost);
  $$('.blog-card', gridEl).forEach((card, i) => {
    const post = remaining[i];
    if (!post) return;
    const matches = matchPost(post);
    card.classList.toggle('hidden', !matches);
    if (matches) matchCount++;
  });

  // Update status
  if (matchCount === 0) {
    updateSearchStatus(`No articles found for "${query}". Try different keywords.`);
  } else {
    updateSearchStatus(`${matchCount} article${matchCount !== 1 ? 's' : ''} found`);
  }
}

/* ── BLOG ARTICLE PAGE ───────────────────────────────────── */
async function loadBlogArticle() {
  const articleBody = $('#article-body');
  if (!articleBody) return; // not on article page

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    articleBody.innerHTML = '<p>Post not found. <a href="blog.html">Back to Blog</a></p>';
    return;
  }

  let post;
  try {
    post = await fetchPost(slug);
  } catch (e) {
    articleBody.innerHTML = '<p>Post not found. <a href="blog.html">Back to Blog</a></p>';
    return;
  }

  // Inject dynamic SEO (OG, Twitter, JSON-LD, canonical, breadcrumbs)
  injectBlogPostSEO(post);

  // Header
  const metaEl     = $('#article-meta');
  const titleEl    = $('#article-title');
  const subtitleEl = $('#article-subtitle');
  const infoEl     = $('#article-info');
  const rt         = readingTime(post.content);

  if (metaEl)     metaEl.innerHTML      = `<span class="article-category">${post.category}</span>`;
  if (titleEl)    titleEl.textContent    = post.title;
  if (subtitleEl) subtitleEl.textContent = post.excerpt || '';
  if (infoEl)     infoEl.innerHTML       = `
    <span><i class="fas fa-calendar-alt" aria-hidden="true"></i> <time datetime="${post.date}">${formatDate(post.date)}</time></span>
    <span><i class="fas fa-clock" aria-hidden="true"></i> ${rt}</span>
    <span><i class="fas fa-user" aria-hidden="true"></i> ${post.author || 'Pratibha Raju Prem Kumar'}</span>`;

  // Body content — convert markdown to HTML
  articleBody.innerHTML = simpleMarkdown(post.content);

  // Tags
  const tagsEl = $('#article-tags');
  if (tagsEl && post.tags && post.tags.length) {
    tagsEl.innerHTML = post.tags.map(t => `<span class="article-tag">${t}</span>`).join('');
  }

  // More posts
  const moreSection = $('#more-posts-section');
  const moreGrid    = $('#more-posts-grid');
  if (moreSection && moreGrid) {
    try {
      const index = await fetch('posts/index.json').then(r => r.json());
      const otherSlugs = (index.posts || [])
        .map(p => p.slug)
        .filter(s => s && s !== slug)
        .slice(0, 3);

      if (otherSlugs.length > 0) {
        const settled = await Promise.allSettled(otherSlugs.map(fetchPost));
        const others = settled.filter(r => r.status === 'fulfilled').map(r => r.value);
        if (others.length > 0) {
          moreSection.style.display = '';
          moreGrid.innerHTML = others.map(p => blogCardHTML(p)).join('');
        }
      }
    } catch (e) {
      console.warn('Could not load more posts:', e);
    }
  }

  initReveal();
}

/* ── BOOT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initProgress();
  initNavbar();
  initBackToTop();
  loadFooter();

  // Detect which page we're on
  const isBlogListing = !!$('#blog-filters');
  const isArticle     = !!$('#article-body');

  if (isBlogListing)  await loadBlogListing();
  if (isArticle)      await loadBlogArticle();

  initReveal();
});
