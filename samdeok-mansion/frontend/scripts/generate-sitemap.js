/**
 * roomConfig 기반 sitemap.xml 생성
 * 빌드 시 실행: npm run build (prebuild에서 실행)
 * 결과: public/sitemap.xml → 배포 시 https://samdeok.kr/sitemap.xml
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONFIG_PATH = join(ROOT, 'src', 'config', 'roomConfig.js');
const OUT_DIR = join(ROOT, 'public');
const OUT_FILE = join(OUT_DIR, 'sitemap.xml');

const SITE_URL = process.env.SITE_URL || process.env.VITE_APP_URL || 'https://samdeok.kr';

function extractSlugsFromRoomConfig() {
  const content = readFileSync(CONFIG_PATH, 'utf-8');
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  const slugs = [];
  let m;
  while ((m = slugRegex.exec(content)) !== null) {
    slugs.push(m[1]);
  }
  return [...new Set(slugs)];
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemapXml(slugs) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: SITE_URL + '/', priority: '1.0', changefreq: 'daily' },
    ...slugs.map((slug) => ({
      loc: `${SITE_URL}/${slug}`,
      priority: '0.9',
      changefreq: 'weekly',
    })),
    { loc: `${SITE_URL}/payment/success`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${SITE_URL}/payment/fail`, priority: '0.3', changefreq: 'monthly' },
  ];

  const urlEntries = urls
    .map(
      (u) => `
  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function main() {
  const slugs = extractSlugsFromRoomConfig();
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  const xml = buildSitemapXml(slugs);
  writeFileSync(OUT_FILE, xml, 'utf-8');
  console.log(`[sitemap] Generated ${OUT_FILE} with ${slugs.length + 3} URLs (base + ${slugs.length} rooms + payment pages)`);
}

main();
