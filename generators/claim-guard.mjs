/**
 * ClaimGuard: Naike Compliance & Trademark Audit Utility
 * Validates text against trademark misrepresentation, unsubstantiated greenwashing claims,
 * and compliance inaccuracies before publishing or exporting website content.
 */

export const BANNED_PATTERNS = [
  {
    regex: /\b(affiliated with nike|nike subsidiary|nike partner)\b/i,
    severity: 'CRITICAL',
    message: 'Prohibited claim: Do NOT imply association with Nike, Inc. Must use "Jinjiang Naike Gifts Co., Ltd."'
  },
  {
    regex: /\b100% biodegradable\b/i,
    severity: 'CRITICAL',
    message: 'Potential Greenwashing: "100% Biodegradable" prohibited for composite polymers without industrial composting conditions disclosure (EN 13432 / ASTM D6400).'
  },
  {
    regex: /\bdisney (licensee|trademark owner|brand owner)\b/i,
    severity: 'HIGH',
    message: 'Trademark Misuse: Naike is an audited manufacturing facility (Disney FAMA W128-4829-1), not the trademark licensee.'
  },
  {
    regex: /\b(coca-cola official partner|coke branded supplier)\b/i,
    severity: 'HIGH',
    message: 'Social Audit Misuse: Naike holds Coca-Cola SGP Green Rating factory approval; clarify as social compliance audit qualification.'
  },
  {
    regex: /\b(best in china|no\.?\s*1 tableware factory|world's best lunchbox)\b/i,
    severity: 'MEDIUM',
    message: 'Unsubstantiated Superlative: Avoid "Best in China / No.1" without verifiable third-party rankings.'
  },
  {
    regex: /\bcrocs\b/i,
    severity: 'HIGH',
    message: 'Trademark Risk: Do not use "Crocs" directly as a product category. Use "clog shoes", "hole shoes", or "footwear charms".'
  }
];

export function auditClaimText(text) {
  const issues = [];
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.regex.test(text)) {
      issues.push({
        severity: pattern.severity,
        message: pattern.message,
        matched: text.match(pattern.regex)?.[0]
      });
    }
  }
  return {
    valid: issues.length === 0,
    issue_count: issues.length,
    issues
  };
}

export function sanitizeClaims(text) {
  let cleaned = text;
  // Auto-replace common bad habits
  cleaned = cleaned.replace(/\b100% biodegradable\b/gi, 'Bio-composite (requires industrial composting facilities)');
  cleaned = cleaned.replace(/\bCrocs charms\b/gi, 'Clog shoe charms');
  return cleaned;
}
