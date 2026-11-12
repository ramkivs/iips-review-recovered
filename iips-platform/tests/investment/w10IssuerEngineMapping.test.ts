/**
 * W10 — issuer-to-engine mapping contract suite.
 *
 * Guards the inventory itself: every declared input of the 13 certified engines is mapped exactly once,
 * every mapping record is complete, and every mapping status is honoured by the resolver. It also pins
 * the published matrix to the registry, so the document cannot drift from the code that applies it.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { CERTIFIED_ENGINES } from '../../src/integration/EngineRegistry';
import { LINE_ITEMS } from '../../src/investment/contracts/lineItems';
import { OPERATING_METRICS, type MetricId } from '../../src/investment/contracts/operatingMetrics';
import {
  DERIVATIONS,
  MATRIX_BEGIN,
  MATRIX_END,
  TRACKED_ENGINE_PROFILES,
  allFieldMappings,
  mappingTotals,
  renderMappingMatrixMarkdown,
} from '../../src/investment/qualification';
import { qualifyIssuerToEngines } from '../../src/investment/qualification';
import { BANK, AS_OF, bankDataset, fieldOf, FY26 } from './w10Fixtures';

const ROOT = resolve(__dirname, '..', '..', '..');
const DOC = join(ROOT, 'docs', 'integration', 'W10-ISSUER-TO-ENGINE-MAPPING-2026-11-12.md');

const MAPPINGS = allFieldMappings();

/** Extract the declared property names of an `export interface …Input { … }` block. */
function declaredFields(path: string): string[] {
  const source = readFileSync(join(ROOT, path), 'utf8');
  const block = /export interface\s+\w+Input\s*\{([\s\S]*?)\n\}/.exec(source);
  assert.ok(block !== null, `no *Input interface found in ${path}`);
  const fields: string[] = [];
  for (const line of block[1]!.split('\n')) {
    if (/\[key:\s*string\]/.test(line)) continue;
    const match = /^\s*(?:readonly\s+)?(?:'([A-Z]{2}-\d{3})'|([A-Za-z][A-Za-z0-9]*))\??\s*:/.exec(line);
    if (match === null) continue;
    const name = match[1] ?? match[2];
    if (name === undefined || name === 'readonly') continue;
    fields.push(name);
  }
  return fields;
}

describe('W10 mapping — registry completeness against the frozen engines', () => {
  test('all thirteen certified engines are represented exactly once', () => {
    assert.equal(TRACKED_ENGINE_PROFILES.length, 13);
    assert.equal(CERTIFIED_ENGINES.length, 13);
    const tracked = TRACKED_ENGINE_PROFILES.map((profile) => profile.engineId).sort();
    const certified = CERTIFIED_ENGINES.map((entry) => entry.engineId).sort();
    assert.deepEqual(tracked, certified, 'the qualification registry must cover the certified registry exactly');
  });

  test('engine identity, sector family and calibration version mirror the certified registry', () => {
    for (const profile of TRACKED_ENGINE_PROFILES) {
      const certified = CERTIFIED_ENGINES.find((entry) => entry.engineId === profile.engineId);
      assert.ok(certified !== undefined, `${profile.engineId} is not certified`);
      assert.equal(profile.certifiedSectorFamily, certified.sectorFamily);
      assert.equal(profile.engineId.startsWith('sector.'), true);
      assert.equal(profile.ies, certified.ies);
      assert.equal(profile.engineVersion, certified.engineVersion);
      assert.equal(profile.calibrationVersion, certified.calibrationProfile);
    }
  });

  test('every declared interface field is mapped exactly once, with no invented extras', () => {
    for (const profile of TRACKED_ENGINE_PROFILES) {
      const declared = declaredFields(profile.declaredIn).sort();
      const mapped = profile.fields.map((field) => field.field).sort();
      assert.deepEqual(mapped, declared, `${profile.engineId}: registry and frozen interface differ`);
      assert.equal(new Set(mapped).size, mapped.length, `${profile.engineId}: duplicate field mapping`);
    }
  });

  test('index signatures are declared as such and never expand the mapped field list', () => {
    for (const profile of TRACKED_ENGINE_PROFILES) {
      const source = readFileSync(join(ROOT, profile.declaredIn), 'utf8');
      const hasIndex = /\[key:\s*string\]:\s*unknown/.test(source);
      assert.equal(profile.hasIndexSignature, hasIndex, `${profile.engineId}: index-signature flag mismatch`);
      assert.equal(profile.fields.some((field) => field.field === '[key: string]'), false);
    }
  });

  test('every mapping publishes the complete attribute set, with no empty value', () => {
    const requiredKeys = [
      'engineId',
      'field',
      'label',
      'declaredType',
      'requirement',
      'status',
      'meaning',
      'evidenceSource',
      'transformation',
      'period',
      'basis',
      'scope',
      'missingSemantics',
      'zeroSemantics',
      'invalidSemantics',
      'freshness',
      'freshnessKind',
      'dataQuality',
      'confidence',
      'calibrationImplication',
    ] as const;
    for (const mapping of MAPPINGS) {
      for (const key of requiredKeys) {
        const value = mapping[key];
        assert.equal(typeof value, 'string', `${mapping.engineId}/${mapping.field}: ${key} must be a string`);
        assert.notEqual((value as string).trim(), '', `${mapping.engineId}/${mapping.field}: ${key} is empty`);
      }
      assert.ok(['MAPPED', 'DERIVED', 'UNMAPPED', 'CONFLICT'].includes(mapping.status));
      assert.ok(['REQUIRED', 'CONDITIONAL', 'DECISION_FLAG', 'DECLARED_UNUSED'].includes(mapping.requirement));
      assert.notEqual(mapping.units.engineUnit.trim(), '', `${mapping.engineId}/${mapping.field}: units missing`);
      assert.notEqual(mapping.units.scale.trim(), '', `${mapping.engineId}/${mapping.field}: scale missing`);
    }
  });

  test('MAPPED fields name a canonical operating metric whose unit the engine expects', () => {
    for (const mapping of MAPPINGS.filter((candidate) => candidate.status === 'MAPPED' && candidate.source.kind === 'OPERATING_METRIC')) {
      const source = mapping.source as { kind: 'OPERATING_METRIC'; metricId: MetricId };
      const meta = OPERATING_METRICS[source.metricId];
      assert.ok(meta !== undefined, `${mapping.engineId}/${mapping.field}: unknown metric ${source.metricId}`);
      assert.equal(mapping.units.engineUnit, meta.unit, `${mapping.engineId}/${mapping.field}: engine unit != canonical unit`);
      assert.equal(mapping.units.sourceUnit?.split(';')[0]?.trim(), meta.unit);
    }
  });

  test('MAPPED selectors are the only enum mappings, and DERIVED fields name a closed derivation', () => {
    for (const mapping of MAPPINGS) {
      if (mapping.status === 'MAPPED' && mapping.source.kind !== 'OPERATING_METRIC') {
        assert.equal(mapping.source.kind, 'ISSUER_SUBSECTOR', `${mapping.engineId}/${mapping.field}: unexpected mapped source`);
        assert.equal(mapping.units.engineUnit, 'ENUM');
      }
      if (mapping.status === 'DERIVED') {
        assert.equal(mapping.source.kind, 'DERIVATION', `${mapping.engineId}/${mapping.field}: DERIVED without a derivation`);
        const id = (mapping.source as { kind: 'DERIVATION'; derivationId: keyof typeof DERIVATIONS }).derivationId;
        assert.ok(DERIVATIONS[id] !== undefined, `${mapping.engineId}/${mapping.field}: unknown derivation ${id}`);
        for (const item of DERIVATIONS[id].requires) {
          assert.ok(LINE_ITEMS[item] !== undefined, `${id} requires unknown line item ${item}`);
        }
      }
      if (mapping.status === 'UNMAPPED') {
        assert.equal(mapping.transformation.startsWith('none'), true, `${mapping.engineId}/${mapping.field}: an unmapped field must not declare a transformation`);
      }
      if (mapping.status === 'CONFLICT') {
        assert.match(mapping.calibrationImplication, /conflict|invert|double|band|scale|direction|USD|quintile|quarter|quartile|margin/i);
      }
    }
  });

  test('decision flags and unread declarations are never required', () => {
    for (const mapping of MAPPINGS.filter((candidate) => candidate.requirement === 'DECISION_FLAG' || candidate.requirement === 'DECLARED_UNUSED')) {
      assert.notEqual(mapping.requirement, 'REQUIRED');
      assert.ok(['UNMAPPED', 'MAPPED', 'DERIVED', 'CONFLICT'].includes(mapping.status));
    }
    assert.ok(MAPPINGS.some((mapping) => mapping.requirement === 'DECISION_FLAG'));
    assert.ok(MAPPINGS.some((mapping) => mapping.requirement === 'DECLARED_UNUSED'));
  });

  test('each engine declares required inputs, and engines blocked in the registry are named', () => {
    for (const profile of TRACKED_ENGINE_PROFILES) {
      assert.ok(profile.fields.some((field) => field.requirement === 'REQUIRED'), `${profile.engineId} has no required inputs`);
    }
    const totals = mappingTotals();
    assert.equal(totals.engines, 13);
    assert.equal(totals.fields, MAPPINGS.length);
    assert.equal(totals.enginesWithNoStructuralBlocker, 1, 'only Banking has no structural blocker (with its declared closing-balance ratio gate)');
  });

  test('the published matrix is generated from this registry, byte for byte', () => {
    const document = readFileSync(DOC, 'utf8');
    const begin = document.indexOf(MATRIX_BEGIN);
    const end = document.indexOf(MATRIX_END);
    assert.notEqual(begin, -1, 'the document is missing the matrix start marker');
    assert.notEqual(end, -1, 'the document is missing the matrix end marker');
    const committed = document.slice(begin + MATRIX_BEGIN.length, end).trim();
    const generated = renderMappingMatrixMarkdown().trim();
    assert.equal(committed, generated, 'docs/integration/W10-ISSUER-TO-ENGINE-MAPPING-2026-11-12.md is stale; regenerate it from the registry');
  });
});

describe('W10 mapping — status semantics are enforced by the resolver, not just declared', () => {
  test('a CONFLICT field never yields a value even when its canonical metric is present', () => {
    const content = bankDataset({
      metrics: [
        ...bankDataset().operatingMetrics,
        // AU_CAPACITY_UTILISATION is present, but AU-002 is a calibration conflict on Auto.
      ],
    });
    const report = qualifyIssuerToEngines({
      content: { ...content, issuers: [{ ...content.issuers[0]!, sector: 'Auto' }] },
      issuerId: BANK,
      asOf: AS_OF,
      engineIds: ['sector.auto'],
      policy: { allowClosingBalanceRatioDerivations: true },
    });
    const au002 = fieldOf(report, 'sector.auto', 'AU-002');
    assert.equal(au002.status, 'CONFLICT');
    assert.equal(au002.outcome, 'CONFLICT');
    assert.equal(au002.value, null);
    assert.deepEqual(au002.codes, ['FIELD_SEMANTIC_CONFLICT']);
  });

  test('an UNMAPPED required field refuses with FIELD_SOURCE_UNSUPPORTED and null value', () => {
    const report = qualifyIssuerToEngines({
      content: bankDataset(),
      issuerId: BANK,
      asOf: AS_OF,
      engineIds: ['sector.auto'],
      policy: { allowClosingBalanceRatioDerivations: true },
    });
    // Auto engine is not applicable to a Banking issuer; use the field record only through an Auto issuer instead.
    const autoContent = bankDataset();
    const autoReport = qualifyIssuerToEngines({
      content: { ...autoContent, issuers: [{ ...autoContent.issuers[0]!, sector: 'Auto' }] },
      issuerId: BANK,
      asOf: AS_OF,
      engineIds: ['sector.auto'],
    });
    const au001 = fieldOf(autoReport, 'sector.auto', 'AU-001');
    assert.equal(au001.status, 'UNMAPPED');
    assert.equal(au001.outcome, 'UNSUPPORTED');
    assert.equal(au001.value, null);
    assert.deepEqual(au001.codes, ['FIELD_SOURCE_UNSUPPORTED']);
    assert.equal(report.engines[0]!.state, 'NOT_APPLICABLE');
  });

  test('a DECISION_FLAG is recorded as a limitation and never blocks readiness', () => {
    const report = qualifyIssuerToEngines({
      content: bankDataset(),
      issuerId: BANK,
      asOf: AS_OF,
      engineIds: ['sector.banking'],
      policy: { allowClosingBalanceRatioDerivations: true },
    });
    const governance = fieldOf(report, 'sector.banking', 'governanceFlag');
    assert.equal(governance.requirement, 'DECISION_FLAG');
    assert.equal(governance.outcome, 'OPTIONAL_ABSENT');
    assert.deepEqual(governance.codes, ['FIELD_DECISION_FLAG_UNSUPPORTED']);
    assert.equal(report.engines[0]!.state, 'QUALIFIED');
    assert.ok(report.limitations.some((line) => /never read as evidence that no adverse event occurred/.test(line)));
  });

  test('a DECLARED_UNUSED field is published but not evaluated', () => {
    const report = qualifyIssuerToEngines({
      content: bankDataset(),
      issuerId: BANK,
      asOf: AS_OF,
      engineIds: ['sector.banking'],
    });
    const unusedField = TRACKED_ENGINE_PROFILES.find((profile) => profile.engineId === 'sector.banking')!.fields.find((field) => field.requirement === 'DECLARED_UNUSED');
    // Banking has no unread declaration; Capital Markets does. Use that engine on a Capital Markets issuer.
    assert.equal(unusedField, undefined);
    const cmReport = qualifyIssuerToEngines({
      content: { ...bankDataset(), issuers: [{ ...bankDataset().issuers[0]!, sector: 'Capital Markets' }] },
      issuerId: BANK,
      asOf: AS_OF,
      engineIds: ['sector.capital-markets'],
    });
    const cm003 = fieldOf(cmReport, 'sector.capital-markets', 'CM-003');
    assert.equal(cm003.requirement, 'DECLARED_UNUSED');
    assert.equal(cm003.outcome, 'NOT_EVALUATED');
    assert.deepEqual(cm003.codes, []);
  });

  test('mapping digest is stable and changes only with the registry', () => {
    const first = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.banking'] });
    const second = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.banking'] });
    const third = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.auto'] });
    assert.match(first.mappingDigest, /^[0-9a-f]{64}$/);
    assert.equal(first.mappingDigest, second.mappingDigest);
    assert.equal(first.mappingDigest, third.mappingDigest, 'the digest pins the registry, not the filtered evaluation set');
  });
});

describe('W10 mapping — declared consumptions stay tied to the frozen calibration', () => {
  test('the pinned period is the latest annual consolidated period, not a substituted one', () => {
    const report = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.banking'] });
    assert.equal(report.periodEnd, FY26.periodEnd);
    assert.equal(report.statementScope, 'CONSOLIDATED');
  });
});
