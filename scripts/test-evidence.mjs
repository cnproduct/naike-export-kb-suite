#!/usr/bin/env node
import assert from 'node:assert/strict';
import { auditEvidenceRegister } from '../generators/claim-guard.mjs';

const pending = {
  claims: [{
    claim_id: 'NK-EVD-0001',
    topic: 'company_identity',
    claim: 'Draft company identity',
    status: 'pending_supplement',
    public_claim_approved: false,
    source_refs: [],
    required_evidence: ['Business licence'],
    owner: 'management'
  }]
};
assert.equal(auditEvidenceRegister(pending).publication_ready, false);

const approved = {
  claims: [{
    claim_id: 'NK-EVD-0001',
    status: 'verified_fact',
    public_claim_approved: true,
    topic: 'company_identity',
    claim: 'Verified company identity',
    source_refs: [{ type: 'signed_record', captured_at: '2026-09-23', evidence_level: 'S' }],
    required_evidence: ['Business licence'],
    owner: 'management',
    verified_by: 'authorized reviewer',
    verified_at: '2026-09-23',
    valid_until: '2099-12-31'
  }]
};
assert.equal(auditEvidenceRegister(approved).publication_ready, true);

approved.claims[0].valid_until = '2020-01-01';
assert.match(auditEvidenceRegister(approved, '2026-09-23').errors.join(' '), /expired/);

console.log('✅ Evidence gate self-check passed');
