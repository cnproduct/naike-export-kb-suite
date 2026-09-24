#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SITES_PATH = path.join(ROOT_DIR, 'sites-matrix', 'sites.json');

export async function generateSitemap(siteId) {
  const sitesRaw = await fs.readFile(SITES_PATH, 'utf8');
  const sites = JSON.parse(sitesRaw).sites;
  const site = sites.find(s => s.id === siteId) || sites[0];

  const today = new Date().toISOString().split('T')[0];
  const pages = [
    '',
    '/about',
    '/products',
    '/solutions',
    '/factory-audit',
    '/certifications',
    '/case-studies',
    '/buying-guides',
    '/faq',
    '/contact'
  ];

  const xmlUrls = pages.map(p => `  <url>
    <loc>https://${site.domain}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${p === '' ? '1.0' : p === '/products' ? '0.9' : '0.8'}</priority>
  </url>`).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://${site.domain}/sitemap.xml
`;

  return { sitemapXml, robotsTxt };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const siteId = process.argv[2] || 'eazylunch';
  generateSitemap(siteId).then(({ sitemapXml, robotsTxt }) => {
    console.log('--- sitemap.xml ---');
    console.log(sitemapXml);
    console.log('--- robots.txt ---');
    console.log(robotsTxt);
  });
}
