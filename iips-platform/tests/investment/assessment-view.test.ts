/**
 * IID-2 — the evidence view (fixture-backed, read-only).
 *
 * The view is not a user surface (IID-6 owns that). It exists to make the payload inspectable during IID-2,
 * and these tests pin the properties that make it honest: withheld reasons are shown, absences are never
 * rendered as numbers, the sector reference is separate, and nothing is interpolated unescaped.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import { ASSESSMENT_VIEW_CSP, renderAssessmentHtml } from '../../src/investment/assessment/view';
import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import { bankAssessmentInput, techAssessmentInput, thinAssessmentInput } from './assessmentFixtures';

const html = (payload: CompanyAssessmentPayload, narrative: readonly string[] = []) =>
  renderAssessmentHtml(payload, narrative);

describe('the view cannot show what the payload does not contain', () => {
  test('a complete assessment renders its intrinsic range, band and confidence', () => {
    const { payload, narrative } = assessCompany(techAssessmentInput());
    const page = html(payload, narrative);
    const mid = payload.valuation.intrinsic!.perShare.mid.value!.toFixed(2);
    assert.ok(page.includes(mid));
    assert.ok(page.includes(payload.valuation.marginOfSafety!.band!));
    assert.ok(page.includes(payload.confidence.combined.toFixed(4)));
    assert.ok(page.includes('assessment-engine/1.0.0'));
    assert.ok(page.includes('valuation-policy/1.0.0'));
    for (const line of narrative) assert.ok(page.includes(line.slice(0, 40)), `narrative line missing: ${line}`);
  });

  test('a withheld intrinsic shows the missing inputs, not a zero', () => {
    const { payload } = assessCompany(thinAssessmentInput());
    assert.equal(payload.valuation.intrinsic, null);
    const page = html(payload);
    assert.match(page, /not published|withheld|INSUFFICIENT|NOT_REPORTED/i);
    assert.equal(/0\.00 intrinsic/i.test(page), false);
  });

  test('a stale price renders its refusal reason instead of a margin', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const stale = { ...payload, valuation: { ...payload.valuation, marginOfSafety: { ...payload.valuation.marginOfSafety!, refusal: 'PRICE_OUTSIDE_POLICY_WINDOW' as const, band: null, mosVsMid: { ...payload.valuation.marginOfSafety!.mosVsMid, presence: 'MISSING' as const, value: null, reason: 'PRICE_STALE' as const } } } };
    const page = html(stale as CompanyAssessmentPayload);
    assert.ok(page.includes('PRICE_OUTSIDE_POLICY_WINDOW') || page.includes('PRICE_STALE'));
  });

  test('an absent observation renders its reason, never a zero or a dash without explanation', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const page = html(payload);
    assert.ok(page.includes('NOT_REPORTED'), 'restricted cash absence must be visible');
    assert.equal(/<td>0\.00<\/td>\s*<td>restricted/i.test(page), false);
  });

  test('the sector reference block is presented apart from the company fields', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const page = html(payload);
    const marker = page.indexOf('Sector reference — shown separately, never an input');
    assert.ok(marker > 0);
    assert.ok(page.includes('not an identity and not an input'));
    // The block renders after every company section, and no company section mentions it.
    const companySection = page.slice(0, marker);
    assert.equal(companySection.includes(payload.sectorReferenceView.sectorRefId), false);
    assert.equal(companySection.includes('SECTOR_REFERENCE'), false);
    const referenceSection = page.slice(marker);
    assert.ok(referenceSection.includes(payload.sectorReferenceView.sectorRefId));
    assert.ok(referenceSection.includes('SECTOR_REFERENCE'));
  });

  test('a bank page states why the DCF is absent rather than omitting the row', () => {
    const { payload } = assessCompany(bankAssessmentInput());
    const page = html(payload);
    assert.ok(page.includes('DCF_FCFF'));
    assert.match(page, /BANKING|sector/i);
  });

  test('the surface is inert: no script, escaped text, and a no-by-default CSP', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const hostile = {
      ...payload,
      subject: { ...payload.subject, legalName: '<script>alert(1)</script>' },
    } as CompanyAssessmentPayload;
    const page = html(hostile);
    assert.equal(/<script/i.test(page), false);
    assert.ok(page.includes('&lt;script&gt;'));
    assert.equal(ASSESSMENT_VIEW_CSP.startsWith("default-src 'none'"), true);
    assert.match(page, /Decision support only/i);
  });
});
