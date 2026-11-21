/**
 * W05 STEP 4 — capture-validator route-contract derivation (the 2026-11-21 correction).
 *
 * The Windows host runs the behavioural suite (tools/windows/W05-SCRIPTS.Tests.ps1, Pester).
 * This suite derives each route's report markers from the ENDPOINT TYPES THEMSELVES and pins
 * the capture script to them:
 *   /api/investment/coverage/investment -> InvestmentCoverageReport (coverage/investmentCoverage.ts)
 *   /api/investment/coverage           -> IdentityCoverageReport   (identity/coverage.ts)
 * so the pinned incident — the identity report shape (identitySources + items) applied to BOTH
 * routes, misclassifying a valid investment report as unknown-json-shape — cannot recur
 * silently. It also pins the capture artifact schema (bodies, statuses, timestamps, hashes keep
 * their fields) and the status gate: a report shape is recognised only on HTTP 200, so a 503
 * body is never a successful report capture.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..', '..');

function source(path: string): string {
  return readFileSync(join(REPO_ROOT, path), 'utf8');
}

/**
 * The top-level `readonly <field>:` names of one exported interface. Nested blocks (e.g.
 * `dataset: { ... }`) are flattened first so nested fields never count as report fields.
 */
function interfaceTopLevelFields(src: string, interfaceName: string): string[] {
  const decl = src.indexOf(`export interface ${interfaceName} {`);
  assert.ok(decl !== -1, `interface ${interfaceName} must exist`);
  let depth = 0;
  let end = src.length;
  for (let i = src.indexOf('{', decl); i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  let flat = src.slice(decl, end);
  let previous = '';
  while (previous !== flat) {
    previous = flat;
    flat = flat.replace(/\{[^{}]*\}/g, '{}');
  }
  const fields: string[] = [];
  const pattern = /readonly\s+(\w+)\s*:/g;
  let match = pattern.exec(flat);
  while (match !== null) {
    fields.push(match[1]);
    match = pattern.exec(flat);
  }
  return fields;
}

const investmentSrc = source('iips-platform/src/investment/coverage/investmentCoverage.ts');
const identitySrc = source('iips-platform/src/investment/identity/coverage.ts');
const captureSrc = source('tools/windows/W05-STEP4-CAPTURE-HOST-COVERAGE.ps1');
const helpersSrc = source('tools/windows/W05-SCRIPT-HELPERS.psm1');

/** The structural markers the capture script requires per route. */
const INVESTMENT_MARKERS = ['reportVersion', 'dataset', 'issuers', 'identitySourcesAvailable'];
const IDENTITY_MARKERS = ['identitySources', 'items'];

describe('W05 STEP4 capture validator — each route is validated against its own report contract', () => {
  test('the investment markers are fields of InvestmentCoverageReport (derived from the endpoint type)', () => {
    const fields = interfaceTopLevelFields(investmentSrc, 'InvestmentCoverageReport');
    for (const marker of INVESTMENT_MARKERS) {
      assert.ok(fields.includes(marker), `InvestmentCoverageReport must declare ${marker}`);
    }
  });

  test('the identity markers are fields of IdentityCoverageReport (derived from the endpoint type)', () => {
    const fields = interfaceTopLevelFields(identitySrc, 'IdentityCoverageReport');
    for (const marker of IDENTITY_MARKERS) {
      assert.ok(fields.includes(marker), `IdentityCoverageReport must declare ${marker}`);
    }
  });

  test('route-contract separation: neither marker set can match the other route report', () => {
    const identityFields = interfaceTopLevelFields(identitySrc, 'IdentityCoverageReport');
    const investmentFields = interfaceTopLevelFields(investmentSrc, 'InvestmentCoverageReport');
    for (const marker of ['dataset', 'issuers', 'identitySourcesAvailable']) {
      assert.ok(!identityFields.includes(marker), `IdentityCoverageReport must NOT declare ${marker}`);
    }
    for (const marker of IDENTITY_MARKERS) {
      assert.ok(!investmentFields.includes(marker), `InvestmentCoverageReport must NOT declare ${marker}`);
    }
  });

  test('the capture script route table carries both routes with their own ReportKeys', () => {
    assert.match(captureSrc, /Path\s*=\s*'\/api\/investment\/coverage\/investment\?asOf='/);
    assert.match(captureSrc, /Path\s*=\s*'\/api\/investment\/coverage\?asOf='/);
    for (const marker of [...INVESTMENT_MARKERS, ...IDENTITY_MARKERS]) {
      assert.ok(captureSrc.includes(`'${marker}'`), `capture script must name marker ${marker}`);
    }
    assert.match(
      captureSrc,
      /Get-W05ResponseShape -BodyPath \$bodyPath -ReportKeys \$route\.ReportKeys -Status \$http\.Status/,
      'classification must run through the shared helper with the route contract',
    );
  });

  test('a report shape is recognised only on HTTP 200 (503 is never a successful report capture)', () => {
    const start = helpersSrc.indexOf('function Get-W05ResponseShape');
    assert.ok(start !== -1, 'Get-W05ResponseShape must exist');
    const classifier = helpersSrc.slice(start);
    assert.match(classifier, /\$isReport = \$false/);
    assert.match(classifier, /if \(\$reportMatched\) \{\s*if \(\$Status -eq 200\) \{ \$isReport = \$true \}\s*\}/);
    assert.match(classifier, /if \(\$isReport\) \{ \$shape = 'report' \}/);
  });

  test('the capture artifact schema is preserved (bodies, statuses, timestamps, hashes)', () => {
    for (const field of ['route', 'requestUri', 'status', 'bodyFile', 'bodySha256', 'shape', 'capturedAt', 'errorText']) {
      assert.match(captureSrc, new RegExp(`\\b${field}\\b\\s*=`), `capture record must keep field ${field}`);
    }
    for (const shape of ['report', 'documented-error-payload', 'not-json', 'unknown-json-shape', 'unreadable']) {
      const present = captureSrc.includes(`'${shape}'`) || helpersSrc.includes(`'${shape}'`);
      assert.ok(present, `shape ${shape} must stay in the vocabulary`);
    }
  });
});
