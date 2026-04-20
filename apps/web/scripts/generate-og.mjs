/**
 * One-shot OG image generator.
 *
 * Renders three brand-consistent 1200x630 PNGs into apps/web/public/ using
 * sharp to rasterize inline SVG templates. Re-run after editing copy or colors.
 *
 * Usage (from repo root):
 *   node apps/web/scripts/generate-og.mjs
 */

import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const MOK_BLUE = "#0013FF";
const MOK_GREEN = "#CBFF63";

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wordmark rendered as pure typography — avoids SVG path rasterization
 * artifacts at small scale. Returns an <svg> fragment positioned at (x,y).
 */
function wordmark(x, y, color) {
  return `<text x="${x}" y="${y}" font-family="Arial Black, Helvetica Neue, Arial, sans-serif" font-size="44" font-weight="900" fill="${color}" letter-spacing="2">MOK LABS</text>`;
}

/**
 * @param {object} opts
 * @param {string} opts.bg
 * @param {string} opts.titleColor
 * @param {string} opts.subtitleColor
 * @param {string} opts.logoColor
 * @param {string[]} opts.titleLines
 * @param {string[]} opts.subtitleLines
 * @param {string} [opts.decoration]
 * @param {string} [opts.accentBar]  bottom bar color
 */
function card(opts) {
  const {
    bg,
    titleColor,
    subtitleColor,
    logoColor,
    titleLines,
    subtitleLines,
    decoration = "",
    accentBar,
  } = opts;

  const titleStartY = 290 - (titleLines.length - 1) * 48;

  const titleBlock = titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${titleStartY + i * 96}" font-family="Helvetica Neue, Arial, sans-serif" font-size="84" font-weight="800" fill="${titleColor}" letter-spacing="-2">${escapeXml(line)}</text>`
    )
    .join("\n  ");

  const subtitleBlock = subtitleLines
    .map(
      (line, i) =>
        `<text x="80" y="${490 + i * 40}" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" font-weight="500" fill="${subtitleColor}">${escapeXml(line)}</text>`
    )
    .join("\n  ");

  const bar = accentBar
    ? `<rect x="0" y="610" width="1200" height="20" fill="${accentBar}"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${bg}"/>
  ${decoration}
  ${wordmark(80, 115, logoColor)}
  ${titleBlock}
  ${subtitleBlock}
  ${bar}
</svg>`;
}

async function render(name, svg) {
  const out = join(PUBLIC_DIR, name);
  const png = await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  await writeFile(out, png);
  console.log(`  wrote ${name} (${(png.length / 1024).toFixed(1)} KB)`);
}

console.log("generating OG images…");

// og-home.png — homepage
await render(
  "og-home.png",
  card({
    bg: MOK_BLUE,
    titleColor: "#FFFFFF",
    subtitleColor: MOK_GREEN,
    logoColor: MOK_GREEN,
    titleLines: ["Soluções digitais", "para a educação"],
    subtitleLines: ["Livros digitais · PNLD · LMS · IA aplicada"],
    accentBar: MOK_GREEN,
    // Lime accent grid block on the right, echoing the homepage hero background.
    decoration: `<rect x="820" y="0" width="380" height="630" fill="${MOK_GREEN}" opacity="0.12"/>
      <g stroke="${MOK_GREEN}" stroke-width="1" opacity="0.3">
        <line x1="820" y1="40" x2="1200" y2="40"/>
        <line x1="820" y1="80" x2="1200" y2="80"/>
        <line x1="820" y1="120" x2="1200" y2="120"/>
        <line x1="820" y1="160" x2="1200" y2="160"/>
        <line x1="820" y1="200" x2="1200" y2="200"/>
        <line x1="820" y1="240" x2="1200" y2="240"/>
        <line x1="820" y1="280" x2="1200" y2="280"/>
        <line x1="820" y1="320" x2="1200" y2="320"/>
        <line x1="820" y1="360" x2="1200" y2="360"/>
        <line x1="820" y1="400" x2="1200" y2="400"/>
        <line x1="820" y1="440" x2="1200" y2="440"/>
        <line x1="820" y1="480" x2="1200" y2="480"/>
        <line x1="820" y1="520" x2="1200" y2="520"/>
        <line x1="820" y1="560" x2="1200" y2="560"/>
        <line x1="860" y1="0" x2="860" y2="610"/>
        <line x1="900" y1="0" x2="900" y2="610"/>
        <line x1="940" y1="0" x2="940" y2="610"/>
        <line x1="980" y1="0" x2="980" y2="610"/>
        <line x1="1020" y1="0" x2="1020" y2="610"/>
        <line x1="1060" y1="0" x2="1060" y2="610"/>
        <line x1="1100" y1="0" x2="1100" y2="610"/>
        <line x1="1140" y1="0" x2="1140" y2="610"/>
      </g>`,
  })
);

// og-pnld.png — /pnld
await render(
  "og-pnld.png",
  card({
    bg: MOK_BLUE,
    titleColor: "#FFFFFF",
    subtitleColor: MOK_GREEN,
    logoColor: MOK_GREEN,
    titleLines: ["PNLD digital", "sem complicação"],
    subtitleLines: [
      "Adaptação de livros didáticos em",
      "conformidade com o edital do FNDE",
    ],
    accentBar: MOK_GREEN,
    // Green circle + dashed ring echoing the /pnld hero composition.
    decoration: `<circle cx="1000" cy="260" r="160" fill="${MOK_GREEN}" opacity="0.22"/>
      <circle cx="1000" cy="260" r="130" fill="none" stroke="${MOK_GREEN}" stroke-width="5" stroke-dasharray="12 9" opacity="0.95"/>`,
  })
);

// og-blog-default.png — blog fallback
await render(
  "og-blog-default.png",
  card({
    bg: MOK_GREEN,
    titleColor: MOK_BLUE,
    subtitleColor: MOK_BLUE,
    logoColor: MOK_BLUE,
    titleLines: ["Blog Mok Labs"],
    subtitleLines: [
      "Insights sobre PNLD, educação digital",
      "e tecnologia para editoras",
    ],
    accentBar: MOK_BLUE,
    decoration: `<rect x="0" y="0" width="1200" height="14" fill="${MOK_BLUE}"/>`,
  })
);

console.log("done.");
