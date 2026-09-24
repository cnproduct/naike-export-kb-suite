#!/usr/bin/env node
/**
 * Naike Export KB Suite - MCP Server
 * Exposes tools for autonomous AI agents to query Naike KB facts and generate website content.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';
import { auditClaimText } from '../generators/claim-guard.mjs';
import { generateProductPage, generateSolutionPage, generateGuidePage } from '../generators/site-content-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const SITES_PATH = path.join(ROOT_DIR, 'sites-matrix', 'sites.json');
const PIM_PATH = path.join(ROOT_DIR, 'knowledge-base', '04_product_catalog', 'MASTER_PIM.json');

async function getSites() {
  const raw = await fs.readFile(SITES_PATH, 'utf8');
  return JSON.parse(raw).sites;
}

async function getPim() {
  const raw = await fs.readFile(PIM_PATH, 'utf8');
  return JSON.parse(raw).products;
}

const TOOLS = [
  {
    name: "list_sites",
    description: "List all 20 Naike independent export sites with group, priority, domain, and primary keyword.",
    inputSchema: {
      type: "object",
      properties: {
        group: { type: "string", description: "Filter by group: A, B, C, D, or ALL" },
        priority: { type: "string", description: "Filter by priority: P0, P1, P2, P3, or ALL" }
      }
    }
  },
  {
    name: "get_site_details",
    description: "Retrieve complete strategic profile, ICP, keywords, differentiators, and compliance evidence for a specific site.",
    inputSchema: {
      type: "object",
      properties: {
        site_id: { type: "string", description: "The site ID, e.g. 'eazylunch', 'siliconebabyfeedingset', 'econaike'" }
      },
      required: ["site_id"]
    }
  },
  {
    name: "generate_site_page",
    description: "Rapidly generate an SEO-optimized B2B website page (Product, Solution, or Sourcing Guide) for any of the 20 sites.",
    inputSchema: {
      type: "object",
      properties: {
        site_id: { type: "string", description: "Target site ID, e.g. 'outdoortablewarefactory'" },
        page_type: { type: "string", enum: ["product", "solution", "guide"], description: "Type of page to generate" },
        sku_id: { type: "string", description: "Optional specific SKU ID, e.g. 'NK-OUT-CAMP-01'" },
        format: { type: "string", enum: ["markdown", "html", "json"], default: "markdown" }
      },
      required: ["site_id", "page_type"]
    }
  },
  {
    name: "audit_claim",
    description: "Audit marketing text using ClaimGuard to prevent greenwashing (e.g. 100% biodegradable without industrial cert) and trademark misuse.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text content to audit" }
      },
      required: ["text"]
    }
  }
];

async function handleToolCall(name, args) {
  const sites = await getSites();
  const products = await getPim();

  if (name === "list_sites") {
    let result = sites;
    if (args.group && args.group !== "ALL") {
      result = result.filter(s => s.group === args.group);
    }
    if (args.priority && args.priority !== "ALL") {
      result = result.filter(s => s.priority === args.priority);
    }
    return {
      total: result.length,
      sites: result.map(s => ({
        id: s.id,
        domain: s.domain,
        group: s.group,
        priority: s.priority,
        name: s.name,
        primary_keyword: s.keywords.primary,
        primary_cta: s.primary_cta
      }))
    };
  }

  if (name === "get_site_details") {
    const site = sites.find(s => s.id === args.site_id || s.domain === args.site_id);
    if (!site) throw new Error(`Site not found: ${args.site_id}`);
    return site;
  }

  if (name === "generate_site_page") {
    const site = sites.find(s => s.id === args.site_id || s.domain === args.site_id);
    if (!site) throw new Error(`Site not found: ${args.site_id}`);
    
    let product = null;
    if (args.sku_id) {
      product = products.find(p => p.sku_id.toLowerCase() === args.sku_id.toLowerCase());
    } else {
      product = products.find(p => p.applicable_sites.includes(site.id)) || products[0];
    }

    let content = "";
    if (args.page_type === "product") {
      content = generateProductPage(site, product, args.format || "markdown");
    } else if (args.page_type === "solution") {
      content = generateSolutionPage(site, args.format || "markdown");
    } else if (args.page_type === "guide") {
      content = generateGuidePage(site, args.format || "markdown");
    }

    const audit = auditClaimText(typeof content === "string" ? content : JSON.stringify(content));
    return {
      site_id: site.id,
      domain: site.domain,
      page_type: args.page_type,
      format: args.format || "markdown",
      claim_guard_passed: audit.valid,
      compliance_notes: audit.issues,
      content
    };
  }

  if (name === "audit_claim") {
    return auditClaimText(args.text);
  }

  throw new Error(`Unknown tool: ${name}`);
}

// JSON-RPC stdio protocol loop for MCP
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req.method === 'tools/list') {
      console.log(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: { tools: TOOLS } }));
    } else if (req.method === 'tools/call') {
      const result = await handleToolCall(req.params.name, req.params.arguments || {});
      console.log(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } }));
    } else {
      console.log(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: {} }));
    }
  } catch (err) {
    console.error('MCP Error:', err);
  }
});

if (process.argv.includes('--test')) {
  console.log('Testing MCP Server tool call: list_sites');
  handleToolCall('list_sites', { group: 'A' }).then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  });
}
