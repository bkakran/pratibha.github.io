#!/usr/bin/env node
/**
 * generate-og-images.js
 * ---------------------
 * Generates Open Graph social share images (1200×630) for:
 *   1. The homepage (default OG)
 *   2. Each blog post from posts/index.json
 *
 * Output: images/og/  (og-default.png, og-{slug}.png)
 *
 * Prerequisites:
 *   npm install canvas
 *
 * Usage:
 *   node scripts/generate-og-images.js
 *
 * These images are referenced by the OG meta tags across the site.
 */

const fs   = require('fs');
const path = require('path');

let createCanvas, registerFont;
try {
  ({ createCanvas, registerFont } = require('canvas'));
} catch (e) {
  console.log('⚠️  "canvas" package not installed. Run: npm install canvas');
  console.log('   Alternatively, use og-generator.html in your browser to manually create OG images.');
  process.exit(0);
}

const ROOT    = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'images', 'og');
const W       = 1200;
const H       = 630;

// Parchment & Ink palette
const C = {
  bg:     '#fefdfb',
  bgAlt:  '#f4f2ed',
  black:  '#1c1b18',
  gray1:  '#3d3b36',
  gray2:  '#65635c',
  gray3:  '#97958e',
  gray4:  '#e0ddd6',
  accent: '#5a6e8a',
  accentHover: '#6a7e9a',
  white:  '#ffffff',
};

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

/* ── Drawing helpers ────────────────────────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawOrb(ctx, x, y, radius, color, opacity) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  gradient.addColorStop(0, color + hex);
  gradient.addColorStop(1, color + '00');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for (const word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

/* ── Homepage OG Image ──────────────────────────────────────── */
function generateHomepageOG() {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Ambient orbs
  drawOrb(ctx, W * 0.85, H * 0.1, 300, C.accent, 0.08);
  drawOrb(ctx, W * 0.1, H * 0.85, 250, C.accentHover, 0.06);
  drawOrb(ctx, W * 0.5, H * 0.5, 200, C.accent, 0.03);

  // Subtle grid
  ctx.strokeStyle = C.gray4 + '40';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Left accent bar
  ctx.fillStyle = C.accent;
  ctx.fillRect(0, 0, 6, H);

  const padLeft = 80;
  const padTop  = 100;

  // Badge
  ctx.font = 'bold 14px sans-serif';
  const badge = 'pratibharpk.com';
  const badgeW = ctx.measureText(badge).width + 28;
  roundRect(ctx, padLeft, padTop, badgeW, 30, 15);
  ctx.fillStyle = C.accent + '15';
  ctx.fill();
  ctx.fillStyle = C.accent;
  ctx.fillText(badge, padLeft + 14, padTop + 20);

  // Subtitle
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = C.accent;
  ctx.fillText('STAFF PRODUCT MANAGER', padLeft, padTop + 80);

  // Title
  ctx.font = 'bold 58px sans-serif';
  ctx.fillStyle = C.black;
  const titleLines = wrapText(ctx, 'Pratibha Raju Prem Kumar', padLeft, padTop + 150, W - padLeft - 200, 68);

  // Tagline
  ctx.font = '20px sans-serif';
  ctx.fillStyle = C.gray2;
  const tagY = padTop + 150 + titleLines * 68 + 24;
  wrapText(ctx, 'Driving growth through advertising platforms, IoT innovation, and data-driven strategy.', padLeft, tagY, W - padLeft - 260, 30);

  // Bottom stats
  const statsY = H - 80;
  ctx.fillStyle = C.gray4 + '60';
  ctx.fillRect(padLeft, statsY - 20, W - padLeft - 80, 1);
  const stats = ['12+ Years', '$120M+ Impact', 'IIM Ahmedabad', 'Stanford'];
  ctx.font = 'bold 14px sans-serif';
  stats.forEach((stat, i) => {
    ctx.fillStyle = i === 0 ? C.accent : C.gray3;
    ctx.fillText(stat, padLeft + i * 200, statsY + 10);
  });

  // Initials circle
  const cx = W - 160, cy = H * 0.4;
  ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.fillStyle = C.bgAlt; ctx.fill();
  ctx.strokeStyle = C.gray4; ctx.lineWidth = 2; ctx.stroke();

  ctx.beginPath(); ctx.arc(cx, cy, 86, 0, Math.PI * 2);
  ctx.strokeStyle = C.accent + '30'; ctx.lineWidth = 1.5; ctx.stroke();

  ctx.font = 'bold 52px sans-serif';
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'center';
  ctx.fillText('P', cx, cy + 18);
  ctx.textAlign = 'left';

  return canvas;
}

/* ── Blog Post OG Image ─────────────────────────────────────── */
function generateBlogOG(title, category, excerpt) {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Orbs
  drawOrb(ctx, W * 0.9, H * 0.2, 250, C.accent, 0.06);
  drawOrb(ctx, W * 0.05, H * 0.9, 200, C.accentHover, 0.05);

  // Top accent strip
  const stripGrad = ctx.createLinearGradient(0, 0, W, 0);
  stripGrad.addColorStop(0, C.accent);
  stripGrad.addColorStop(1, C.accentHover);
  ctx.fillStyle = stripGrad;
  ctx.fillRect(0, 0, W, 6);

  const padLeft = 80;

  // Category badge
  ctx.font = 'bold 13px sans-serif';
  const catText = (category || 'Blog').toUpperCase();
  const catW = ctx.measureText(catText).width + 24;
  roundRect(ctx, padLeft, 60, catW, 28, 14);
  ctx.fillStyle = C.accent; ctx.fill();
  ctx.fillStyle = C.white;
  ctx.fillText(catText, padLeft + 12, 79);

  // Title
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = C.black;
  const lines = wrapText(ctx, title, padLeft, 140, W - padLeft - 100, 58);

  // Excerpt
  if (excerpt) {
    ctx.font = '19px sans-serif';
    ctx.fillStyle = C.gray2;
    wrapText(ctx, excerpt, padLeft, 140 + lines * 58 + 20, W - padLeft - 140, 28);
  }

  // Bottom bar
  const bottomY = H - 70;
  ctx.fillStyle = C.gray4 + '60';
  ctx.fillRect(padLeft, bottomY - 16, W - padLeft * 2, 1);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = C.black;
  ctx.fillText('Pratibha Raju Prem Kumar', padLeft, bottomY + 8);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = C.gray3;
  ctx.fillText('pratibharpk.com', padLeft + 280, bottomY + 8);

  ctx.fillStyle = C.accent;
  ctx.textAlign = 'right';
  ctx.fillText('READ ON BLOG  →', W - padLeft - 30, bottomY + 8);
  ctx.textAlign = 'left';

  return canvas;
}

/* ── Main ────────────────────────────────────────────────────── */
function saveCanvas(canvas, filename) {
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`  ✅ ${filename} (${sizeKB} KB)`);
}

async function main() {
  console.log('\n🎨 Generating OG Images...\n');

  // 1. Homepage OG
  saveCanvas(generateHomepageOG(), 'og-default.png');

  // 2. Blog post OGs
  const indexPath = path.join(ROOT, 'posts', 'index.json');
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const posts = index.posts || [];

    for (const post of posts) {
      if (!post.slug) continue;

      // Read markdown to get full frontmatter
      const mdPath = path.join(ROOT, 'posts', `${post.slug}.md`);
      if (!fs.existsSync(mdPath)) continue;

      const mdText = fs.readFileSync(mdPath, 'utf-8');
      const fmMatch = mdText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      let title = post.title || post.slug;
      let category = '';
      let excerpt = '';

      if (fmMatch) {
        const fmLines = fmMatch[1].split('\n');
        for (const line of fmLines) {
          const idx = line.indexOf(':');
          if (idx === -1) continue;
          const key = line.slice(0, idx).trim();
          let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (key === 'title') title = val;
          if (key === 'category') category = val;
          if (key === 'excerpt') excerpt = val;
        }
      }

      saveCanvas(generateBlogOG(title, category, excerpt), `og-${post.slug}.png`);
    }
  }

  console.log(`\n✨ Done! OG images saved to images/og/\n`);
}

main().catch(err => {
  console.error('Error generating OG images:', err);
  process.exit(1);
});
