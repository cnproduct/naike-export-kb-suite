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
  const site = sites.find(s => s.id === siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);

  const shortTxt = `# ${site.name} (${site.domain})
> B2B sourcing portal planned for ${site.keywords.primary}; commercial and compliance claims remain drafts until the evidence register approves them.

This file is a concise navigation index. Treat product specifications, certifications, prices, lead times, capacity, and customer claims as unverified unless the linked page provides approved evidence.

## Core pages

- [Products](https://${site.domain}/products): Product catalogue and SKU pages.
- [Solutions](https://${site.domain}/solutions): Buyer-specific sourcing and engineering workflows.
- [Evidence centre](https://${site.domain}/certifications): Approved certificates, tests, scope, and validity dates.
- [Buying guides](https://${site.domain}/buying-guides): Material, compliance, packaging, and procurement guides.
- [Contact](https://${site.domain}/contact): Request current evidence, samples, and quotations.

## Optional

- [About](https://${site.domain}/about): Company identity and factory profile.
- [FAQ](https://${site.domain}/faq): Common procurement questions.
`;

  const fullTxt = `${shortTxt}

## Strategy context

- Primary: ${site.keywords.primary}
- Intent Cluster: ${site.keywords.intent_cluster}
- Target Buyers: ${site.target_buyers.join(', ')}
- Target Markets: ${site.target_markets.join(', ')}
- Planned Primary Action: ${site.primary_cta}

## Verification requirements

${site.evidence_required.map(item => `- ${item}`).join('\n')}
`;

  return { shortTxt, fullTxt };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const siteId = process.argv[2] || 'eazylunch';
  generateLlmsTxt(siteId).then(({ shortTxt }) => {
    console.log(shortTxt);
  });
}
