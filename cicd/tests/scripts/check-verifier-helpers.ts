#!/usr/bin/env npx tsx
/**
 * Small unit check for the verifier's pure helpers (no agent, no network).
 * Run: npm run check:verifier   (exits non-zero on the first failed assertion)
 */
import assert from 'node:assert/strict';
import { redactSecrets, unsupportedClaims } from '../src/judge/verifier-judge.js';

let n = 0;
const ok = (label: string) => { n++; process.stdout.write(`  ok ${label}\n`); };

// --- redactSecrets: replace secret-named values, leave the rest intact ---
{
  const r = redactSecrets('{"api_key":"sk-123","name":"venue-1"}');
  assert.ok(!r.includes('sk-123'), 'api_key value is gone');
  assert.ok(r.includes('[redacted]'), 'redaction marker present');
  assert.ok(r.includes('venue-1'), 'non-secret value untouched');
  ok('redactSecrets hides api_key, keeps non-secret fields');
}
{
  // token / password / bearer variants, and a bare (non-string) value
  const r = redactSecrets('{"access_token":"abc","password":"p","count":42}');
  assert.ok(!r.includes('"abc"') && !r.includes('"p"'), 'token + password values gone');
  assert.ok(r.includes('42'), 'numeric non-secret value kept');
  ok('redactSecrets covers token/password variants, keeps numbers');
}

// --- unsupportedClaims: distinctive claims NOT in the live evidence ---
{
  // id 9001 and name "venue-7" are invented (absent from evidence) → flagged
  const claims = unsupportedClaims('Venue venue-7 has id 9001.', 'Real venue is venue-3, id 5500.');
  assert.deepEqual(new Set(claims), new Set(['venue-7', '9001']), 'invented id + name flagged');
  ok('unsupportedClaims flags invented ids/identifiers');
}
{
  // every distinctive claim is present in evidence → nothing flagged
  assert.deepEqual(unsupportedClaims('id 5500 for venue-3', 'venue-3 has id 5500'), [], 'grounded answer passes');
  ok('unsupportedClaims returns [] when grounded');
}
{
  // empty evidence ⇒ nothing to check against (conservative)
  assert.deepEqual(unsupportedClaims('id 5500', ''), [], 'empty evidence ⇒ []');
  // plain prose (no digit/hyphen) is ignored, never a false positive
  assert.deepEqual(unsupportedClaims('The venue is open today', 'unrelated data'), [], 'plain prose ignored');
  ok('unsupportedClaims ignores empty evidence and plain prose');
}

process.stdout.write(`\nverifier helpers: ${n} checks passed\n`);
