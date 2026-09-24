#!/usr/bin/env node
/**
 * Test Generation: Generates sample pages for ALL 20 sites to ensure zero runtime issues.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateProductPage, generateSolutionPage } from '../generators/site-content-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function main() {
  const sitesRaw = await fs.readFile(path.join(ROOT_DIR, 'sites-matrix', 'sites.json'), 'utf8');
  const pimRaw = await fs.readFile(path.join(ROOT_DIR, 'knowledge-base', '04_product_catalog', 'MASTER_PIM.json'), 'utf8');
  const { sites } = JSON.parse(sitesRaw);
  const { products } = JSON.parse(pimRaw);

  const testOutputDir = path.join(ROOT_DIR, 'dist', 'test-output');
  await fs.mkdir(testOutputDir, { recursive: true });

  console.log(`🚀 Testing batch content generation for all ${sites.length} sites...`);

  for (const site of sites) {
    const prod = products.find(p => p.applicable_sites.includes(site.id)) || products[0];
    const html = generateProductPage(site, prod, 'html');
    const solMd = generateSolutionPage(site, 'markdown');

    await fs.writeFile(path.join(testOutputDir, `${site.id}_product.html`), html, 'utf8');
    await fs.writeFile(path.join(testOutputDir, `${site.id}_solution.md`), solMd, 'utf8');
  }

  console.log(`✅ Successfully generated sample HTML & Markdown for all 20 sites in ${testOutputDir}`);
}

main().catch(console.error);
