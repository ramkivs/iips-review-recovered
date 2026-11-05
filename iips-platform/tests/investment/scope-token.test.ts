/**
 * IID-3 — AC-3.1: scope tokens are validated IRR-side, before any store call.
 *
 * The store accepts any non-empty string, so these tests are the only thing standing between a typo and
 * a permanently mis-scoped chain. Every rejection reason is exercised, and a valid sibling is always
 * checked alongside so a validator that rejects everything cannot pass.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  REPORT_TYPES,
  SCOPE_TOKEN_MAX_SUBJECT_LENGTH,
  ScopeTokenError,
  assertScopeToken,
  companyScopeToken,
  isRegisteredReportType,
  isScopeToken,
  reportTypeForPrefix,
  validateReportTypeForScope,
  validateScopeToken,
} from '../../src/investment/artifacts/scopeToken';

describe('AC-3.1 — valid forms are accepted', () => {
  test('each closed prefix is accepted with a plausible subject', () => {
    for (const token of [
      'co:IN:CIN:L72200KA1981PLC013115',
      'co:IN:ISIN:IN0000000201',
      'hd:portfolio-a:IN:ISIN:IN0000000201',
      'hc:portfolio-a',
      'icr:portfolio-a/2026-11',
    ]) {
      const result = validateScopeToken(token);
      assert.equal(result.ok, true, `${token} should be valid`);
    }
  });

  test('the accepted result names the prefix and its subject kind', () => {
    const result = validateScopeToken('co:IN:CIN:L72200KA1981PLC013115');
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.prefix, 'co');
    assert.equal(result.subjectKind, 'ISSUER');
    assert.equal(result.subject, 'IN:CIN:L72200KA1981PLC013115');
  });

  test('a company scope token is built from the issuer id verbatim, with no case folding', () => {
    assert.equal(companyScopeToken('IN:CIN:L72200KA1981PLC013115'), 'co:IN:CIN:L72200KA1981PLC013115');
    assert.equal(companyScopeToken('in:isin:IN0000000201'), 'co:in:isin:IN0000000201');
    assert.notEqual(companyScopeToken('IN:ISIN:IN0000000201'), companyScopeToken('in:isin:in0000000201'));
  });
});

describe('AC-3.1 — invalid forms are rejected with a closed reason', () => {
  test('empty, whitespace-only and non-string tokens are rejected and named', () => {
    assert.deepEqual(
      [validateScopeToken(''), validateScopeToken('   '), validateScopeToken('\n\t ')],
      [
        { ok: false, reason: 'EMPTY', detail: 'scope token is empty' },
        { ok: false, reason: 'WHITESPACE_ONLY', detail: 'scope token is whitespace only' },
        { ok: false, reason: 'WHITESPACE_ONLY', detail: 'scope token is whitespace only' },
      ],
    );
    assert.equal((validateScopeToken(undefined) as { reason: string }).reason, 'NOT_A_STRING');
    assert.equal((validateScopeToken(42) as { reason: string }).reason, 'NOT_A_STRING');
  });

  test('malformed shapes are rejected', () => {
    const malformed = [
      'co',
      'co:',
      'CO:IN:ISIN:IN0000000201', // upper-case prefix
      'c:IN:ISIN:IN0000000201', // prefix too short
      'company:IN:ISIN:IN0000000201', // prefix too long
      'co:IN ISIN IN0000000201', // whitespace inside the subject
      ' co:IN:ISIN:IN0000000201', // leading whitespace
      'co:IN:ISIN:IN0000000201 ', // trailing whitespace
      'co:IN:ISIN:IN0000000201#', // character outside the class
    ];
    for (const token of malformed) {
      const result = validateScopeToken(token);
      assert.equal(result.ok, false, `${token} must be rejected`);
      if (result.ok) continue;
      assert.ok(['MALFORMED', 'SUBJECT_TOO_LONG', 'UNRECOGNISED_PREFIX'].includes(result.reason), `${token}: ${result.reason}`);
    }
  });

  test('unrecognised prefixes are rejected as such, not as malformed', () => {
    for (const token of ['zz:subject', 'acct:subject', 'ab:subject']) {
      const result = validateScopeToken(token);
      assert.equal(result.ok, false);
      if (result.ok) continue;
      assert.equal(result.reason, 'UNRECOGNISED_PREFIX', token);
    }
    // A prefix of the wrong LENGTH is a shape defect, and is reported as such rather than as an
    // unrecognised prefix — the two repairs are different.
    const tooLong = validateScopeToken('company:subject');
    assert.equal(tooLong.ok, false);
    if (!tooLong.ok) assert.equal(tooLong.reason, 'MALFORMED');
  });

  test('an over-long subject is rejected by length, not by the character class', () => {
    const token = `co:${'a'.repeat(SCOPE_TOKEN_MAX_SUBJECT_LENGTH + 1)}`;
    const result = validateScopeToken(token);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.reason, 'SUBJECT_TOO_LONG');
    // Exactly at the limit is accepted: the boundary is inclusive.
    assert.equal(isScopeToken(`co:${'a'.repeat(SCOPE_TOKEN_MAX_SUBJECT_LENGTH)}`), true);
  });

  test('the asserting form throws with the same reason it would return', () => {
    assert.throws(() => assertScopeToken('   '), (error: unknown) => {
      assert.ok(error instanceof ScopeTokenError);
      assert.equal((error as ScopeTokenError).reason, 'WHITESPACE_ONLY');
      return true;
    });
  });

  test('an unusable issuer id cannot become a scope token by truncation', () => {
    assert.throws(() => companyScopeToken(''), ScopeTokenError);
    assert.throws(() => companyScopeToken('IN ISIN 1'), ScopeTokenError);
    assert.throws(() => companyScopeToken('x'.repeat(200)), ScopeTokenError);
    assert.throws(() => companyScopeToken(undefined as unknown as string), ScopeTokenError);
  });
});

describe('the report-type registry is closed', () => {
  test('exactly the three documented report types exist', () => {
    assert.deepEqual([...REPORT_TYPES].sort(), [
      'investment.change-report',
      'investment.company-assessment',
      'investment.holding-disposition',
    ]);
    assert.equal(isRegisteredReportType('investment.company-assessment'), true);
    assert.equal(isRegisteredReportType('investment.company-valuation'), false);
    assert.equal(isRegisteredReportType('Portfolio Summary'), false);
  });

  test('a report type is bound to one scope prefix and a mismatch is refused', () => {
    assert.equal(validateReportTypeForScope('investment.company-assessment', 'co:IN:CIN:X').ok, true);
    const mismatch = validateReportTypeForScope('investment.company-assessment', 'hc:portfolio-a');
    assert.equal(mismatch.ok, false);
    if (!mismatch.ok) assert.equal(mismatch.reason, 'REPORT_TYPE_SCOPE_MISMATCH');
    const unknown = validateReportTypeForScope('investment.unknown', 'co:IN:CIN:X');
    assert.equal(unknown.ok, false);
    if (!unknown.ok) assert.equal(unknown.reason, 'UNREGISTERED_REPORT_TYPE');
    assert.equal(reportTypeForPrefix('icr'), 'investment.change-report');
  });
});
