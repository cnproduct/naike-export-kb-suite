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
    message: 'Trademark Misuse: A factory audit is not a trademark licence. Verify the current audit evidence and scope before use.'
  },
  {
    regex: /\b(coca-cola official partner|coke branded supplier)\b/i,
    severity: 'HIGH',
    message: 'Social Audit Misuse: Do not imply a commercial partnership; verify the current audit evidence and scope before use.'
  },
  {
    regex: /\b(best in china|no\.?\s*1 tableware factory|world's best lunchbox)\b/i,
    severity: 'MEDIUM',
    message: 'Unsubstantiated Superlative: Avoid "Best in China / No.1" without verifiable third-party rankings.'
  },
  {
    regex: /\bcrocs(?:\s+shoe)?\s+charms?\b/i,
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

const STATUSES = new Set([
  'verified_fact',
  'public_fact',
  'ai_inference',
  'strategy_recommendation',
  'pending_supplement',
  'deprecated'
]);

export function auditEvidenceRegister(register, today = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  const ids = new Set();
  const claims = Array.isArray(register?.claims) ? register.claims : [];

  if (!claims.length) errors.push('Evidence register must contain at least one claim.');

  for (const claim of claims) {
    if (!/^NK-EVD-\d{4}$/.test(claim.claim_id || '')) errors.push(`Invalid claim_id: ${claim.claim_id || '(missing)'}`);
    if (ids.has(claim.claim_id)) errors.push(`Duplicate claim_id: ${claim.claim_id}`);
    ids.add(claim.claim_id);
    if (!STATUSES.has(claim.status)) errors.push(`Invalid status for ${claim.claim_id}: ${claim.status}`);
    if (!claim.topic || !claim.claim || !claim.owner) errors.push(`${claim.claim_id}: topic, claim, and owner are required.`);
    if (!claim.required_evidence?.length) errors.push(`${claim.claim_id}: required_evidence must not be empty.`);
    if (!Array.isArray(claim.source_refs)) errors.push(`${claim.claim_id}: source_refs must be an array.`);

    if (claim.public_claim_approved) {
      if (claim.status !== 'verified_fact') errors.push(`${claim.claim_id}: approved public claims must be verified_fact.`);
      if (!claim.source_refs?.length) errors.push(`${claim.claim_id}: approved public claims need source_refs.`);
      if (!claim.verified_by || !claim.verified_at) errors.push(`${claim.claim_id}: approved public claims need verifier and date.`);
      if (!claim.valid_until) errors.push(`${claim.claim_id}: approved public claims need a validity date.`);
      if (claim.valid_until && claim.valid_until < today) errors.push(`${claim.claim_id}: evidence expired on ${claim.valid_until}.`);
      for (const source of claim.source_refs || []) {
        if (!source.type || !source.captured_at || !source.evidence_level) {
          errors.push(`${claim.claim_id}: each approved source needs type, captured_at, and evidence_level.`);
        }
      }
    }
  }

  const pending = claims.filter(claim => !claim.public_claim_approved);
  return {
    valid: errors.length === 0,
    publication_ready: errors.length === 0 && pending.length === 0,
    total: claims.length,
    approved: claims.length - pending.length,
    pending: pending.map(({ claim_id, topic, required_evidence }) => ({ claim_id, topic, required_evidence })),
    errors
  };
}
