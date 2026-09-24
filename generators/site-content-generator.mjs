#!/usr/bin/env node
/**
 * Naike Multi-Category Website Content Generator
 * Generates rich, differentiated, SEO-optimized B2B pages across the 20 sites matrix.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { auditClaimText, auditEvidenceRegister } from './claim-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SITES_PATH = path.join(ROOT_DIR, 'sites-matrix', 'sites.json');
const PIM_PATH = path.join(ROOT_DIR, 'knowledge-base', '04_product_catalog', 'MASTER_PIM.json');
const EVIDENCE_PATH = path.join(ROOT_DIR, 'knowledge-base', '01_sources_permissions', 'evidence-register.json');

async function loadData() {
  const sitesRaw = await fs.readFile(SITES_PATH, 'utf8');
  const pimRaw = await fs.readFile(PIM_PATH, 'utf8');
  const evidenceRaw = await fs.readFile(EVIDENCE_PATH, 'utf8');
  return {
    sitesData: JSON.parse(sitesRaw),
    pimData: JSON.parse(pimRaw),
    evidenceData: JSON.parse(evidenceRaw)
  };
}

function markDraft(output, format) {
  if (typeof output === 'object') return { publication_status: 'draft_unverified', ...output };
  const notice = 'DRAFT: commercial, compliance, factory, and product claims require approval in evidence-register.json before public use.';
  if (format === 'html') {
    return output.replace('<body>', `<body>\n  <div style="background:#7f1d1d;color:#fff;padding:0.75rem 1rem;text-align:center;font-weight:700">${notice}</div>`);
  }
  return `> **${notice}**\n\n${output}`;
}

export function generateProductPage(site, product, format = 'markdown') {
  const title = `${product.name} | Wholesale OEM Manufacturer | ${site.domain}`;
  const complianceTargets = product.specifications.food_contact_certifications || product.specifications.compliance_certifications || product.specifications.environmental_certifications || [];
  const metaDesc = `Draft B2B sourcing profile for ${product.name}. Target compliance references: ${complianceTargets.join(', ') || 'pending'}. Product, price and MOQ data require evidence approval before publication.`;
  
  const schemaJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "sku": product.sku_id,
    "description": metaDesc,
    "brand": {
      "@type": "Brand",
      "name": site.name
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Jinjiang Naike Gifts Co., Ltd.",
      "url": `https://${site.domain}`
    },
    "material": product.materials.join(", ")
  };

  if (format === 'json') {
    return { title, metaDesc, product, site, schema: schemaJsonLd };
  }

  if (format === 'html') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="https://${site.domain}/products/${product.sku_id.toLowerCase()}">
  <script type="application/ld+json">
${JSON.stringify(schemaJsonLd, null, 2)}
  </script>
  <style>
    :root { --primary: #10b981; --primary-dark: #059669; --dark: #0f172a; --gray-100: #f1f5f9; --gray-700: #334155; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: var(--gray-700); margin: 0; padding: 0; background: #fafafa; }
    header { background: var(--dark); color: #fff; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #047857; color: #fff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
    main { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; background: #fff; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    h1 { color: var(--dark); font-size: 2rem; margin-top: 0; line-height: 1.25; }
    .sku-badge { display: inline-block; background: var(--gray-100); padding: 0.2rem 0.6rem; border-radius: 4px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1rem; }
    .features-list { padding-left: 1.25rem; margin: 1.5rem 0; }
    .features-list li { margin-bottom: 0.75rem; }
    .spec-table, .pricing-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
    .spec-table th, .spec-table td, .pricing-table th, .pricing-table td { border: 1px solid #e2e8f0; padding: 0.75rem 1rem; text-align: left; }
    .spec-table th, .pricing-table th { background: var(--gray-100); color: var(--dark); font-weight: 600; }
    .cta-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 0.75rem; padding: 1.5rem; margin-top: 2rem; }
    .btn { display: inline-block; background: var(--primary); color: #fff; text-decoration: none; padding: 0.9rem 1.75rem; font-weight: 700; border-radius: 0.5rem; transition: background 0.2s; }
    .btn:hover { background: var(--primary-dark); }
    .audit-bar { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 2rem; text-align: center; margin-top: 3rem; }
  </style>
</head>
<body>
  <header>
    <div><strong>${site.name}</strong> · ${site.domain}</div>
    <span class="badge">Draft · Evidence Pending</span>
  </header>
  <main>
    <div class="product-grid">
      <div class="product-visual">
        <div style="background:#e2e8f0; border-radius:0.75rem; height:400px; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:600;">
          [4K High-Res Render: ${product.name}]
        </div>
        <div style="margin-top:1.5rem; background:#fff; border:1px solid #e2e8f0; padding:1.25rem; border-radius:0.5rem;">
          <h4 style="margin-top:0;">Packaging & Container Loading</h4>
          <p><strong>Inner Packaging:</strong> ${product.packaging.standard_inner}</p>
          <p><strong>Master Carton:</strong> ${product.packaging.master_carton_qty} pcs / carton (${product.packaging.master_carton_dimensions_cm} cm, GW ${product.packaging.gross_weight_kg} kg)</p>
          <p><strong>40HQ Container Capacity:</strong> Approx. ${product.packaging.container_load_40hq.toLocaleString()} units</p>
        </div>
      </div>
      <div class="product-info">
        <div class="sku-badge">SKU: ${product.sku_id}</div>
        <h1>${product.name}</h1>
        <p style="color:#64748b; font-size:1.1rem;">Category: <strong>${product.category}</strong> | Target: <strong>${product.target_age_group}</strong></p>
        
        <h3>Key Engineering Highlights</h3>
        <ul class="features-list">
          ${product.features.map(f => `<li>${f}</li>`).join('\n          ')}
        </ul>

        <h3>Technical Specifications</h3>
        <table class="spec-table">
          <tr><th>Dimensions</th><td>${product.dimensions.length_mm} x ${product.dimensions.width_mm} x ${product.dimensions.height_mm} mm</td></tr>
          <tr><th>Unit Weight & Capacity</th><td>${product.dimensions.weight_g} g | ${product.dimensions.capacity_ml > 0 ? product.dimensions.capacity_ml + ' ml' : 'N/A'}</td></tr>
          <tr><th>Material Blend</th><td>${product.materials.join('; ')}</td></tr>
          <tr><th>Temperature Limits</th><td>${product.specifications.temperature_tolerance}</td></tr>
          <tr><th>Compliance Targets (Unverified)</th><td>${complianceTargets.join(', ') || 'Pending'}</td></tr>
        </table>

        <h3>Tiered Wholesale FOB Pricing (Xiamen Port)</h3>
        <table class="pricing-table">
          <thead>
            <tr><th>Order Volume</th><th>FOB Price (USD)</th><th>Production Lead Time</th></tr>
          </thead>
          <tbody>
            ${Object.entries(product.commercial_terms.tiered_fob_pricing_usd).map(([tier, price]) => `
            <tr>
              <td><strong>${tier.replace('_', ' ').toUpperCase()}</strong></td>
              <td style="color:#047857; font-weight:700;">$${price.toFixed(2)}</td>
              <td>${product.commercial_terms.mass_production_days} Days</td>
            </tr>`).join('')}
          </tbody>
        </table>

        <div class="cta-box">
          <h3 style="margin-top:0; color:#065f46;">Ready for Physical Samples or Custom Tooling?</h3>
          <p>Stock samples ready in ${product.commercial_terms.sample_lead_time_days} business days. Custom logo & Pantone matching available starting from ${product.commercial_terms.moq_custom_color || product.commercial_terms.moq_standard} pcs.</p>
          <a href="/contact?sku=${product.sku_id}" class="btn">${site.primary_cta}</a>
        </div>
      </div>
    </div>
  </main>
  <div class="audit-bar">
    <p><strong>Jinjiang Naike Gifts Co., Ltd. (晋江市耐克礼品玩具有限公司)</strong></p>
    <p style="font-size:0.9rem; color:#64748b;">
      Publication requires approved evidence for company identity, factory capacity, audits, certifications, ESG, commercial terms and product performance.
    </p>
  </div>
</body>
</html>`;
  }

  // Markdown format
  return `---
title: "${title}"
meta_description: "${metaDesc}"
sku: "${product.sku_id}"
site_id: "${site.id}"
domain: "${site.domain}"
primary_keyword: "${site.keywords.primary}"
canonical_url: "https://${site.domain}/products/${product.sku_id.toLowerCase()}"
date: "2026-09-23"
schema_type: "Product"
---

# ${product.name}
> **SKU**: \`${product.sku_id}\` | **Site**: [${site.domain}](https://${site.domain}) | **Category**: ${product.category}

${metaDesc}

---

## 1. Product Specifications & Material Matrix

| Parameter | Draft Specification |
|---|---|
| **SKU ID** | \`${product.sku_id}\` |
| **Material Formulation** | ${product.materials.join('; ')} |
| **Physical Dimensions** | ${product.dimensions.length_mm} mm (L) × ${product.dimensions.width_mm} mm (W) × ${product.dimensions.height_mm} mm (H) |
| **Unit Weight** | ${product.dimensions.weight_g} grams |
| **Capacity** | ${product.dimensions.capacity_ml > 0 ? product.dimensions.capacity_ml + ' ml' : 'Solid / Set'} |
| **Operating Temp** | \`${product.specifications.temperature_tolerance}\` |
| **Target Audience** | ${product.target_age_group} |
| **Available Colors** | ${product.colors_available.join(', ')} |

---

## 2. Core Engineering & Quality Advantages

${product.features.map(f => `- **${f.split(' ')[0]}**: ${f}`).join('\n')}

---

## 3. Tiered Wholesale FOB Pricing & Commercial Terms

> **Port of Loading**: Xiamen Port, Fujian, China (FOB)
> **Payment Terms**: 30% T/T Deposit with order, 70% balance against Bill of Lading (B/L) copy.

| Procurement Volume | FOB Price (USD) | Production Lead Time | Customization Included |
|---|---|---|---|
${Object.entries(product.commercial_terms.tiered_fob_pricing_usd).map(([tier, price]) => `| **${tier.replace('_', ' ').toUpperCase()}** | **$${price.toFixed(2)}** | ${product.commercial_terms.mass_production_days} Business Days | Standard Factory Color + 1-Color Silk Logo |`).join('\n')}

- **Sample Dispatch**: Regular samples shipped within ${product.commercial_terms.sample_lead_time_days} days.
- **Custom Tooling**: New mold turnaround within 15–20 days; 100% mold cost refunded upon reaching 50,000 units cumulative volume.

---

## 4. Packaging, Palletization & Container Economics

- **Inner Packaging**: ${product.packaging.standard_inner}
- **Master Carton Packaging**: ${product.packaging.master_carton_qty} units / carton
- **Carton Size & Gross Weight**: ${product.packaging.master_carton_dimensions_cm} cm | ${product.packaging.gross_weight_kg} kg
- **40HQ Container Load**: **${product.packaging.container_load_40hq.toLocaleString()} units** (Maximized cube efficiency)

---

## 5. Food Contact Safety & Social Audit Credentials

- **Compliance Targets (Unverified)**: ${complianceTargets.join(', ') || 'Pending'}
- **Factory Audit Evidence**: Current report, scope, validity and public-use permission required.
- **ESG Evidence**: Installation record, metered period and documented calculation method required.

---

## 6. Request Prototype Samples or Wholesale Quotation

👉 **Primary Action**: [${site.primary_cta}](https://${site.domain}/contact?sku=${product.sku_id})
`;
}

export function generateSolutionPage(site, format = 'markdown') {
  const title = `${site.unique_value_prop.split(':')[0]} | B2B Engineering Solutions | ${site.domain}`;
  const content = `---
title: "${title}"
site: "${site.domain}"
intent: "${site.keywords.intent_cluster}"
primary_cta: "${site.primary_cta}"
---

# ${site.name}: B2B Custom Engineering & Sourcing Solutions

> **Target Buyers**: ${site.target_buyers.join(', ')}
> **Core Mission**: Solving ${site.positioning}

## 1. Why Traditional Sourcing Fails in This Category
Many overseas buyers encounter critical bottlenecks when importing:
1. **Severe Quality Variance**: Fragile latch breakage, seal degradation after 10 dishwasher cycles, micro-leakage causing consumer chargebacks.
2. **Regulatory & Audit Disqualification**: Inability to pass Disney, Walmart, or European LFGB chemical migration tests resulting in custom detentions.
3. **Rigid MOQ & Long Tooling Latency**: Small and growing brands forced into 10,000-unit minimums with 60-day mold turnaround.

## 2. Naike's Precision Engineering Approach
The proposed sourcing workflow requires the following company evidence before publication:
- **Manufacturing capability**: Signed facility profile, equipment ledger and recent production records.
- **ESG performance**: Installation record, metered reporting period and documented calculation method.
- **Social audits**: Current report, applicable scope, validity and public-use permission.

## 3. Step-by-Step Customization Roadmap
\`\`\`text
Step 1: Rapid 3D Prototyping (48h) 
  → Step 2: CNC Tooling & First Article Inspection (15-20 Days)
  → Step 3: AQL 1.0 Pilot Run & SGS Food Contact Lab Audit
  → Step 4: High-Density Container Loading & Direct Shipping from Xiamen Port
\`\`\`

## 4. Take the Next Step
Contact our engineering team today for technical CAD reviews and wholesale pricing proposals:
👉 **[${site.primary_cta}](https://${site.domain}/contact)**
`;
  return content;
}

export function generateGuidePage(site, format = 'markdown') {
  const title = `The Complete 2026 Procurement Guide: How to Source ${site.keywords.primary} | ${site.domain}`;
  const content = `---
title: "${title}"
site: "${site.domain}"
target_markets: "${site.target_markets.join(', ')}"
keywords: "${site.keywords.primary}"
---

# ${title}

## Executive Summary
This guide breaks down everything procurement directors, Amazon private label brands, and retail buyers need to know when sourcing ${site.keywords.primary} from China in 2026.

## 1. Material Evaluation: Wheat Straw vs. PLA vs. Pure Silicone
- **Wheat Straw Bio-Composite**: 35% agricultural wheat straw fiber + 65% food-grade PP binder. Heat resistant up to 120°C, microwave and dishwasher safe, highly cost-effective ($1.80 - $2.80).
- **Platinum Liquid Silicone (LSR)**: 100% medical-grade, Shore A 40-70 hardness, heat resistant up to 230°C. Ideal for infant suction plates, baby spoons, and high-heat kitchen spatulas.
- **Polylactic Acid (PLA)**: 100% plant-based corn starch. Requires certified industrial composting facilities (EN 13432). Heat ceiling up to 85°C.

## 2. Key Food Safety Regulations to Verify
1. **United States**: FDA 21 CFR 177.1520 (Olefin polymers) & California Prop 65 (Lead/Cadmium limits).
2. **European Union**: EU Framework Regulation (EC) 1935/2004 & EU 10/2011 overall migration limit (OML) of 10 mg/dm².
3. **Germany**: LFGB §30/31 sensory odor and taste transfer testing.

## 3. Factory Social Compliance Audits: What to Demand
Always verify that your supplier holds valid third-party social audits:
- **Disney FAMA**: Request the current authorization letter and confirm facility, scope, validity and public-use permission.
- **Coca-Cola SGP**: Verify Green Rating status.
- **Sedex SMETA**: Inspect 4-pillar labor, safety, environmental, and business ethics reports.

## 4. How to Calculate Container Economics (40HQ)
To minimize ocean freight cost per unit, calculate load quantity from the approved unit dimensions, packing method, carton size, gross weight and container limits. Do not publish a load quantity or freight saving until the SKU calculation is reviewed.

---
*Published by the Engineering Editorial Team at [${site.domain}](https://${site.domain}) · Jinjiang Naike Gifts Co., Ltd.*
`;
  return content;
}

// CLI Runner
async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const siteId = getArg('--site') || 'eazylunch';
  const pageType = getArg('--type') || 'product';
  const skuId = getArg('--sku');
  const format = getArg('--format') || 'markdown';
  const outputPath = getArg('--output');
  const publish = args.includes('--publish');

  const { sitesData, pimData, evidenceData } = await loadData();
  const site = sitesData.sites.find(s => s.id === siteId);
  if (!site) {
    console.error(`Error: Site ID "${siteId}" not found in sites.json`);
    process.exit(1);
  }

  let product = null;
  if (skuId) {
    product = pimData.products.find(p => p.sku_id.toLowerCase() === skuId.toLowerCase());
  } else {
    // Pick first matching product for this site
    product = pimData.products.find(p => p.applicable_sites.includes(siteId)) || pimData.products[0];
  }

  let output = '';
  if (pageType === 'product') {
    output = generateProductPage(site, product, format);
  } else if (pageType === 'solution') {
    output = generateSolutionPage(site, format);
  } else if (pageType === 'guide') {
    output = generateGuidePage(site, format);
  } else {
    console.error(`Unsupported page type: ${pageType}. Choose: product, solution, guide`);
    process.exit(1);
  }

  // Audit claims
  const textToAudit = typeof output === 'string' ? output : JSON.stringify(output);
  const audit = auditClaimText(textToAudit);
  if (!audit.valid) {
    console.warn(`[ClaimGuard Warning] Found ${audit.issue_count} compliance issue(s):`);
    for (const issue of audit.issues) {
      console.warn(` - [${issue.severity}] ${issue.message}`);
    }
  }

  const evidence = auditEvidenceRegister(evidenceData);
  if (publish && !evidence.publication_ready) {
    throw new Error(`Public generation blocked: ${evidence.pending.length} evidence records are not approved.`);
  }
  if (!publish) output = markDraft(output, format);

  if (outputPath) {
    await fs.writeFile(outputPath, typeof output === 'string' ? output : JSON.stringify(output, null, 2), 'utf8');
    console.log(`Successfully generated ${pageType} page for ${site.domain} -> ${outputPath}`);
  } else {
    if (typeof output === 'object') {
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(output);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(`Generation failed: ${err.message}`);
    process.exitCode = 1;
  });
}
