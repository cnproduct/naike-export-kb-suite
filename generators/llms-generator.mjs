#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SITES_PATH = path.join(ROOT_DIR, 'sites-matrix', 'sites.json');

export async function generateLlmsTxt(siteId) {
  const sitesRaw = await fs.readFile(SITES_PATH, 'utf8');
  const sites = JSON.parse(sitesRaw).sites;
  const site = sites.find(s => s.id === siteId) || sites[0];

  const shortTxt = `# ${site.name} (${site.domain})
> OEM/ODM Factory Portal by Jinjiang Naike Gifts Co., Ltd.

## About
- **Specialty**: ${site.positioning}
- **Certifications**: ${site.compliance_requirements.join(', ')}
- **Audits**: Disney FAMA (W128-4829-1), Coca-Cola SGP Green Rating, Sedex 4-Pillar SMETA.
- **Factory**: 20,000+ sqm standard workshops in Jinjiang, Fujian, powered by 1.5 MW rooftop solar array.
- **Primary Action**: ${site.primary_cta}

## Core Offerings
- Direct wholesale manufacturing and low-MOQ private labeling for B2B procurement.
- Certified food contact safety (FDA 21 CFR, LFGB, BPA-free).
- Dedicated 40HQ container load optimization and AQL 1.0 inspections.
`;

  const fullTxt = `${shortTxt}

## Detailed Keywords & Search Intent
- Primary: ${site.keywords.primary}
- Intent Cluster: ${site.keywords.intent_cluster}
- Target Buyers: ${site.target_buyers.join(', ')}

## Commercial Terms
- Standard Sample Turnaround: 2-3 business days
- Production Lead Time: 20-25 days for repeat wholesale runs
- Port of Loading: Xiamen Port, China
- Payment: 30% T/T deposit, 70% against B/L copy
`;

  return { shortTxt, fullTxt };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const siteId = process.argv[2] || 'eazylunch';
  generateLlmsTxt(siteId).then(({ shortTxt }) => {
    console.log(shortTxt);
  });
}
