/**
 * Phase 1 — Identity Readiness: IRR fail-closed source validation and D114 `securityIdentity` projection.
 *
 * Covers:
 *   1. Fail-closed validation of `eligible-roster.json`, `listing-map.json`, and `corporate-actions.json`
 *      (missing files, non-regular paths, malformed JSON, non-object roots, schema-only placeholders,
 *      missing/mistyped required arrays, empty operational rosters/listing-maps, non-object array entries).
 *   2. Explicit preservation of legitimate empty `corporate-actions.json` (`actions: []`) alongside
 *      populated roster and listing-map sources (including committed single-issuer evidence bundles).
 *   3. Lossless D114 `securityIdentity` validation and projection (`securityId`, `isin`, `series`,
 *      `isinAuthority`), preserving merged W08 series narrowing and `SYMBOL_REUSED_BY_OTHER_SECURITY`
 *      precedence while prohibiting ticker/name inference and silent symbol fallback.
 *   4. Endpoint-level distinction between populated sources, valid empty corporate actions, unavailable/
 *      placeholder sources (HTTP 503), and unresolved vs rejected identity observations.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import {
  loadIdentitySources,
  loadIdentitySourcesFromDir,
  validateCorporateActionTable,
  validateListingMap,
  validateRoster,
} from '../../src/investment/identity/sources';
import {
  classifyObservationOutcome,
  isD114SecurityIdentity,
  projectD114SecurityIdentity,
} from '../../src/investment/identity/d114Projection';
import { identityInputOf, resolveIdentity } from '../../src/investment/identity/resolver';
import { buildFinancialCoverageDisclosure, computeIdentityCoverage } from '../../src/investment/identity/coverage';
import {
  bindCoverageToHttp,
  COVERAGE_ROUTES,
  handleCoverageRequest,
  handlePreviewEvaluationRequest,
} from '../../src/investment/identity/coverageEndpoint';
import { IDENTITY_SCHEMA, type IdentityObservation } from '../../src/investment/identity/types';
import { FIXTURE_AS_OF, identitySourceTexts, loadFixtureSources } from './identityFixture';

const texts = identitySourceTexts();
const fixtureSources = loadFixtureSources();

function withTempDir(run: (dir: string) => Promise<void> | void): Promise<void> | void {
  const dir = mkdtempSync(join(tmpdir(), 'irr-phase1-'));
  const cleanup = () => rmSync(dir, { recursive: true, force: true });
  try {
    const out = run(dir);
    if (out instanceof Promise) {
      return out.finally(cleanup);
    }
    cleanup();
    return undefined;
  } catch (error) {
    cleanup();
    throw error;
  }
}

describe('Phase 1 — fail-closed identity source validation', () => {
  test('rejects non-object JSON roots (null, array, string, number, boolean) with INVALID_ROOT_TYPE', () => {
    const roster = fixtureSources.roster;
    for (const literal of ['null', '[]', '"IIPS_INVESTMENT_IDENTITY_V1"', '42', 'true']) {
      const r1 = validateRoster(literal);
      assert.equal(r1.roster, null);
      assert.ok(r1.issues.some((issue) => issue.code === 'INVALID_ROOT_TYPE'), `roster literal ${literal}`);

      const r2 = validateListingMap(literal, roster);
      assert.equal(r2.listingMap, null);
      assert.ok(r2.issues.some((issue) => issue.code === 'INVALID_ROOT_TYPE'), `listingMap literal ${literal}`);

      const r3 = validateCorporateActionTable(literal, roster);
      assert.equal(r3.table, null);
      assert.ok(r3.issues.some((issue) => issue.code === 'INVALID_ROOT_TYPE'), `corporateActions literal ${literal}`);
    }
  });

  test('rejects schema-only placeholders across all three files in one pass and never treats them as available', () => {
    const schemaOnly = JSON.stringify({ schemaVersion: IDENTITY_SCHEMA });
    const loaded = loadIdentitySources({
      roster: schemaOnly,
      listingMap: schemaOnly,
      corporateActions: schemaOnly,
    });
    assert.equal(loaded.available, false);
    if (loaded.available) return;

    const files = new Set(loaded.issues.map((issue) => issue.file));
    assert.deepEqual(
      [...files].sort(),
      ['corporate-actions.json', 'eligible-roster.json', 'listing-map.json'],
    );
    assert.ok(
      loaded.issues.some(
        (issue) => issue.file === 'eligible-roster.json' && issue.code === 'MISSING_ROSTER_LABEL',
      ),
    );
    assert.ok(
      loaded.issues.some(
        (issue) =>
          issue.file === 'eligible-roster.json' &&
          issue.code === 'MISSING_REQUIRED_ARRAY' &&
          issue.subject === 'issuers',
      ),
    );
    assert.ok(
      loaded.issues.some(
        (issue) =>
          issue.file === 'eligible-roster.json' &&
          issue.code === 'MISSING_REQUIRED_ARRAY' &&
          issue.subject === 'securities',
      ),
    );
    assert.ok(
      loaded.issues.some(
        (issue) =>
          issue.file === 'listing-map.json' &&
          issue.code === 'MISSING_REQUIRED_ARRAY' &&
          issue.subject === 'entries',
      ),
    );
    assert.ok(
      loaded.issues.some(
        (issue) =>
          issue.file === 'corporate-actions.json' &&
          issue.code === 'MISSING_REQUIRED_ARRAY' &&
          issue.subject === 'actions',
      ),
    );
  });

  test('rejects wrongly typed or misnamed top-level arrays instead of coercing them to []', () => {
    const roster = fixtureSources.roster;

    const badRoster = validateRoster(
      JSON.stringify({
        schemaVersion: IDENTITY_SCHEMA,
        rosterLabel: 'synthetic malformed arrays',
        issuers: { issuerId: 'IN:CIN:L72200KA1981PLC013115' },
        securities: 'not-an-array',
      }),
    );
    assert.equal(badRoster.roster, null);
    assert.equal(
      badRoster.issues.filter((issue) => issue.code === 'INVALID_ARRAY_TYPE').length,
      2,
    );

    // Wrong key `listings` instead of `entries` must fail closed, not become entries: [].
    const misnamedListingMap = validateListingMap(
      JSON.stringify({
        schemaVersion: IDENTITY_SCHEMA,
        listings: JSON.parse(texts.listingMap).entries,
      }),
      roster,
    );
    assert.equal(misnamedListingMap.listingMap, null);
    assert.ok(misnamedListingMap.issues.some((issue) => issue.code === 'MISSING_REQUIRED_ARRAY'));

    // Wrong key `corporateActions` instead of `actions` must fail closed, not become actions: [].
    const misnamedActions = validateCorporateActionTable(
      JSON.stringify({
        schemaVersion: IDENTITY_SCHEMA,
        corporateActions: [],
      }),
      roster,
    );
    assert.equal(misnamedActions.table, null);
    assert.ok(misnamedActions.issues.some((issue) => issue.code === 'MISSING_REQUIRED_ARRAY'));
  });

  test('rejects empty operational placeholders in eligible-roster.json and listing-map.json', () => {
    const emptyRoster = validateRoster(
      JSON.stringify({
        schemaVersion: IDENTITY_SCHEMA,
        rosterLabel: 'synthetic empty roster placeholder',
        issuers: [],
        securities: [],
      }),
    );
    assert.equal(emptyRoster.roster, null);
    assert.ok(emptyRoster.issues.some((issue) => issue.code === 'EMPTY_ROSTER_ISSUERS'));
    assert.ok(emptyRoster.issues.some((issue) => issue.code === 'EMPTY_ROSTER_SECURITIES'));

    const emptyListings = validateListingMap(
      JSON.stringify({
        schemaVersion: IDENTITY_SCHEMA,
        entries: [],
      }),
      fixtureSources.roster,
    );
    assert.equal(emptyListings.listingMap, null);
    assert.ok(emptyListings.issues.some((issue) => issue.code === 'EMPTY_LISTING_MAP'));
  });

  test('preserves legitimate empty corporate-actions.json (actions: []) when roster and listing map are populated', () => {
    const loaded = loadIdentitySources({
      roster: texts.roster,
      listingMap: texts.listingMap,
      corporateActions: JSON.stringify({
        schemaVersion: IDENTITY_SCHEMA,
        actions: [],
      }),
    });
    assert.equal(loaded.available, true);
    if (!loaded.available) return;
    assert.equal(loaded.sources.corporateActionTable.actions.length, 0);
    assert.deepEqual(loaded.sources.sourceSummary, {
      issuerCount: fixtureSources.roster.issuers.length,
      securityCount: fixtureSources.roster.securities.length,
      listingCount: fixtureSources.listingMap.entries.length,
      corporateActionCount: 0,
      corporateActionsEmpty: true,
    });

    // Also verify committed single-issuer evidence bundle with `actions: []` continues to load cleanly.
    const infosysIdentityDir = resolve(__dirname, '../../../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity');
    const realSingleIssuer = loadIdentitySourcesFromDir(infosysIdentityDir);
    assert.equal(realSingleIssuer.available, true);
    if (!realSingleIssuer.available) return;
    assert.equal(realSingleIssuer.sources.sourceSummary?.corporateActionsEmpty, true);
    assert.equal(realSingleIssuer.sources.sourceSummary?.issuerCount, 1);
  });

  test('rejects non-object array records, missing successors arrays, invalid ISO dates, and string factors', () => {
    const roster = fixtureSources.roster;

    const nonObjectRoster = validateRoster(
      JSON.stringify({
        schemaVersion: IDENTITY_SCHEMA,
        rosterLabel: 'synthetic non-object records',
        issuers: [null, 'INFY'],
        securities: [[]],
      }),
    );
    assert.equal(nonObjectRoster.roster, null);
    assert.equal(
      nonObjectRoster.issues.filter((issue) => issue.code === 'INVALID_RECORD_TYPE').length,
      3,
    );

    const baseListing = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
    baseListing.entries[0]!.effectiveFrom = '01-06-2020';
    const badDateListing = validateListingMap(JSON.stringify(baseListing), roster);
    assert.equal(badDateListing.listingMap, null);
    assert.ok(badDateListing.issues.some((issue) => issue.code === 'INVALID_DATE'));

    const baseActions = JSON.parse(texts.corporateActions) as { actions: Record<string, unknown>[] };
    delete baseActions.actions[0]!.successors;
    const missingSuccessors = validateCorporateActionTable(JSON.stringify(baseActions), roster);
    assert.equal(missingSuccessors.table, null);
    assert.ok(missingSuccessors.issues.some((issue) => issue.code === 'MISSING_REQUIRED_ARRAY'));

    const stringFactorActions = JSON.parse(texts.corporateActions) as { actions: Record<string, unknown>[] };
    stringFactorActions.actions[0]!.adjustmentFactor = '0.2';
    const badFactor = validateCorporateActionTable(JSON.stringify(stringFactorActions), roster);
    assert.equal(badFactor.table, null);
    assert.ok(badFactor.issues.some((issue) => issue.code === 'INVALID_FACTOR'));
  });

  test('reports each missing or non-regular file accurately without leaking directory paths in subject', () =>
    withTempDir((dir) => {
      writeFileSync(join(dir, 'eligible-roster.json'), texts.roster, 'utf8');
      mkdirSync(join(dir, 'listing-map.json'));

      const result = loadIdentitySourcesFromDir(dir);
      assert.equal(result.available, false);
      if (result.available) return;

      assert.equal(result.issues.length, 2);
      const listingIssue = result.issues.find((issue) => issue.file === 'listing-map.json');
      const actionIssue = result.issues.find((issue) => issue.file === 'corporate-actions.json');
      assert.equal(listingIssue?.code, 'IDENTITY_SOURCE_UNREADABLE');
      assert.equal(actionIssue?.code, 'IDENTITY_SOURCE_MISSING');
      for (const item of result.issues) {
        assert.equal(item.subject.includes(dir), false, 'filesystem dir must not appear in issue.subject');
      }
    }));
});

describe('Phase 1 — lossless D114 securityIdentity projection and W08 preservation', () => {
  test('validates and projects canonical D114 securityIdentity without lossy flattening or fabricated defaults', () => {
    const valid = {
      securityId: 'ISIN:IN0000000029:BE',
      isin: 'IN0000000029',
      series: 'BE',
      isinAuthority: 'NON_AUTHORITATIVE' as const,
    };
    assert.equal(isD114SecurityIdentity(valid), true);

    const projected = projectD114SecurityIdentity({ securityIdentity: valid });
    assert.equal(projected.kind, 'populated');
    assert.equal(projected.isin, 'IN0000000029');
    assert.equal(projected.series, 'BE');
    assert.deepEqual(projected.securityIdentity, valid);
    assert.equal(projected.rejection, null);
  });

  test('preserves W08 series narrowing (EQ vs BE) and undeclared-series refusal via projected D114 securityIdentity', () => {
    const makeObs = (series: string): IdentityObservation => {
      const projected = projectD114SecurityIdentity({
        securityIdentity: {
          securityId: `ISIN:IN0000000029:${series}`,
          isin: 'IN0000000029',
          series,
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      });
      return {
        observationId: `obs-${series}`,
        source: 'HOLDING',
        portfolioId: 'p-1',
        isin: projected.isin,
        symbol: 'BODHI',
        // IPD persisted holdings carry no exchange column; exchange must stay null (never inferred).
        exchange: null,
        series: projected.series,
        cin: null,
        companyIdHint: 'EQ_2002_IN',
        securityIdentity: projected.securityIdentity,
        displayName: 'Bodhi Digital Limited',
        quantity: 25,
        upstreamStatus: 'RESOLVED',
        raw: {},
      };
    };

    const eqRes = resolveIdentity(identityInputOf(makeObs('EQ')), {
      sources: fixtureSources,
      asOf: FIXTURE_AS_OF,
    });
    assert.equal(eqRes.state, 'RESOLVED');
    assert.equal(eqRes.listingId, 'IN:NSE:BODHI:EQ:EQUITY');
    assert.equal(eqRes.resolutionBasis, 'ISIN');

    // Without `exchange`, `series: 'BE'` narrows out `BODHI:EQ` and selects the `BE` listing of IN0000000029.
    const beNoExchangeRes = resolveIdentity(identityInputOf(makeObs('BE')), {
      sources: fixtureSources,
      asOf: FIXTURE_AS_OF,
    });
    assert.equal(beNoExchangeRes.state, 'RESOLVED');
    assert.equal(beNoExchangeRes.listingId, 'IN:NSE:TWINS:BE:EQUITY');
    assert.notEqual(beNoExchangeRes.listingId, eqRes.listingId);
    assert.equal(beNoExchangeRes.resolutionBasis, 'ISIN');

    // When `exchange` is also evidenced alongside `symbol: 'BODHI'`, both `series` and `exchange + symbol` narrow to `BODHI:BE`.
    const beWithExchangeRes = resolveIdentity(
      identityInputOf({ ...makeObs('BE'), exchange: 'NSE' }),
      {
        sources: fixtureSources,
        asOf: FIXTURE_AS_OF,
      },
    );
    assert.equal(beWithExchangeRes.state, 'RESOLVED');
    assert.equal(beWithExchangeRes.listingId, 'IN:NSE:BODHI:BE:EQUITY');

    // A Dhan-style non-exchange `symbol` label with `exchange: null` still resolves by D114 `ISIN + series`.
    const dhanLabelObs = { ...makeObs('EQ'), symbol: 'Bodhi Digital Ltd' };
    const dhanLabelRes = resolveIdentity(identityInputOf(dhanLabelObs), {
      sources: fixtureSources,
      asOf: FIXTURE_AS_OF,
    });
    assert.equal(dhanLabelRes.state, 'RESOLVED');
    assert.equal(dhanLabelRes.listingId, 'IN:NSE:BODHI:EQ:EQUITY');

    const bzRes = resolveIdentity(identityInputOf(makeObs('BZ')), {
      sources: fixtureSources,
      asOf: FIXTURE_AS_OF,
    });
    assert.equal(bzRes.state, 'AMBIGUOUS_LISTING');
    assert.equal(bzRes.failure?.reason, 'MULTIPLE_SECURITIES_SHARE_LISTING');
  });

  test('preserves W08 SYMBOL_REUSED_BY_OTHER_SECURITY precedence when D114 securityIdentity is paired with a foreign symbol+exchange', () => {
    const projected = projectD114SecurityIdentity({
      securityIdentity: {
        securityId: 'ISIN:IN0000000011:EQ',
        isin: 'IN0000000011',
        series: 'EQ',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
    });
    const obs: IdentityObservation = {
      observationId: 'obs-reused',
      source: 'HOLDING',
      portfolioId: 'p-1',
      isin: projected.isin,
      symbol: 'BODHI',
      exchange: 'NSE',
      series: projected.series,
      cin: null,
      companyIdHint: 'EQ_1001_IN',
      securityIdentity: projected.securityIdentity,
      displayName: null,
      quantity: 10,
      upstreamStatus: 'RESOLVED',
      raw: {},
    };
    const res = resolveIdentity(identityInputOf(obs), {
      sources: fixtureSources,
      asOf: FIXTURE_AS_OF,
    });
    assert.equal(res.state, 'AMBIGUOUS');
    assert.equal(res.failure?.reason, 'SYMBOL_REUSED_BY_OTHER_SECURITY');
    assert.equal(classifyObservationOutcome(res.state, res.failure?.reason ?? null), 'UNRESOLVED');
  });

  test('distinguishes unresolved (securityIdentity: null, ticker-only) from rejected (malformed or conflicting securityIdentity)', () => {
    // 1. Explicitly unresolved D114 holding (securityIdentity: null, symbol without exchange):
    //    never inferred from symbol/displayName, classified as UNRESOLVED (not REJECTED).
    const nullProj = projectD114SecurityIdentity({ securityIdentity: null });
    assert.equal(nullProj.kind, 'unresolved_null');
    const unresolvedObs: IdentityObservation = {
      observationId: 'obs-null',
      source: 'HOLDING',
      portfolioId: 'p-1',
      isin: nullProj.isin,
      symbol: 'AARAV',
      exchange: null,
      series: nullProj.series,
      cin: null,
      companyIdHint: 'MANUAL:AARAV',
      securityIdentity: nullProj.securityIdentity,
      displayName: 'Aarav Systems Limited (synthetic)',
      quantity: 5,
      upstreamStatus: 'UNRESOLVED',
      raw: { symbol: 'AARAV', securityIdentity: null },
    };
    const unresolvedRes = resolveIdentity(identityInputOf(unresolvedObs), {
      sources: fixtureSources,
      asOf: FIXTURE_AS_OF,
    });
    assert.equal(unresolvedRes.state, 'UNMATCHED');
    assert.equal(unresolvedRes.failure?.reason, 'NO_IDENTIFIER_PROVIDED');
    assert.equal(
      classifyObservationOutcome(unresolvedRes.state, unresolvedRes.failure?.reason ?? null),
      'UNRESOLVED',
    );

    // 2. Malformed D114 securityIdentity even when symbol + exchange alone would resolve:
    //    rejected fail-closed with SECURITY_IDENTITY_MALFORMED (no symbol fallback).
    const malformedProj = projectD114SecurityIdentity({
      securityIdentity: {
        securityId: 'ISIN:IN0000000011:',
        isin: 'IN0000000011',
        series: '',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
    });
    assert.equal(malformedProj.kind, 'rejected');
    const malformedObs: IdentityObservation = {
      observationId: 'obs-malformed',
      source: 'HOLDING',
      portfolioId: 'p-1',
      isin: malformedProj.isin,
      symbol: 'AARAV',
      exchange: 'NSE',
      series: malformedProj.series,
      cin: null,
      companyIdHint: null,
      securityIdentityRejection: malformedProj.rejection,
      displayName: 'Aarav Systems Limited (synthetic)',
      quantity: 5,
      upstreamStatus: 'RESOLVED',
      raw: {},
    };
    const malformedRes = resolveIdentity(identityInputOf(malformedObs), {
      sources: fixtureSources,
      asOf: FIXTURE_AS_OF,
    });
    assert.equal(malformedRes.state, 'REJECTED_MALFORMED_ISIN');
    assert.equal(malformedRes.failure?.reason, 'SECURITY_IDENTITY_MALFORMED');
    assert.equal(
      classifyObservationOutcome(malformedRes.state, malformedRes.failure?.reason ?? null),
      'REJECTED',
    );

    // 3. Conflicting flat isin vs nested securityIdentity.isin: rejected with ISSUER_KEY_CONFLICT.
    const conflictProj = projectD114SecurityIdentity({
      flatIsin: 'IN0000000029',
      securityIdentity: {
        securityId: 'ISIN:IN0000000011:EQ',
        isin: 'IN0000000011',
        series: 'EQ',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
    });
    assert.equal(conflictProj.kind, 'rejected');
    assert.equal(conflictProj.rejection?.kind, 'CONFLICT');
    const conflictRes = resolveIdentity(
      {
        observationId: 'obs-conflict',
        source: 'HOLDING',
        isin: conflictProj.isin,
        symbol: 'AARAV',
        exchange: 'NSE',
        series: conflictProj.series,
        cin: null,
        companyIdHint: null,
        securityIdentityRejection: conflictProj.rejection,
      },
      { sources: fixtureSources, asOf: FIXTURE_AS_OF },
    );
    assert.equal(conflictRes.state, 'ISSUER_KEY_CONFLICT');
    assert.equal(
      classifyObservationOutcome(conflictRes.state, conflictRes.failure?.reason ?? null),
      'REJECTED',
    );
  });
});

describe('Phase 1 — coverage and preview HTTP endpoints over real loopback server', () => {
  test('returns 503 when schema-only placeholder files exist on disk, and 200 when populated with valid empty corporate-actions.json', () =>
    withTempDir(async (dir) => {
      const schemaOnly = JSON.stringify({ schemaVersion: IDENTITY_SCHEMA });
      writeFileSync(join(dir, 'eligible-roster.json'), schemaOnly, 'utf8');
      writeFileSync(join(dir, 'listing-map.json'), schemaOnly, 'utf8');
      writeFileSync(join(dir, 'corporate-actions.json'), schemaOnly, 'utf8');

      const blocked = await handleCoverageRequest(
        { method: 'GET', url: COVERAGE_ROUTES.json },
        {
          loadSources: () => loadIdentitySourcesFromDir(dir),
          observations: () => [],
          financialCoverage: () => buildFinancialCoverageDisclosure({}),
          today: () => FIXTURE_AS_OF,
        },
      );
      assert.equal(blocked?.status, 503);
      const blockedBody = JSON.parse(String(blocked?.body)) as {
        error: string;
        issues: { file: string; code: string }[];
      };
      assert.equal(blockedBody.error, 'identity-sources-unavailable');
      assert.ok(blockedBody.issues.length >= 4);

      // Now install populated roster + listing-map and genuinely empty corporate-actions (`actions: []`).
      writeFileSync(join(dir, 'eligible-roster.json'), texts.roster, 'utf8');
      writeFileSync(join(dir, 'listing-map.json'), texts.listingMap, 'utf8');
      writeFileSync(
        join(dir, 'corporate-actions.json'),
        JSON.stringify({ schemaVersion: IDENTITY_SCHEMA, actions: [] }),
        'utf8',
      );

      const deps = {
        loadSources: () => loadIdentitySourcesFromDir(dir),
        observations: () => [],
        financialCoverage: () => buildFinancialCoverageDisclosure({}),
        today: () => FIXTURE_AS_OF,
      };
      const server = http.createServer((req, res) => {
        void (async () => {
          if (req.url === COVERAGE_ROUTES.previewEvaluation) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const previewOut = await handlePreviewEvaluationRequest(
              {
                method: req.method ?? 'POST',
                url: req.url,
                body: Buffer.concat(chunks).toString('utf8'),
              },
              deps,
            );
            if (previewOut !== null) {
              res.writeHead(previewOut.status, { ...previewOut.headers });
              res.end(previewOut.body);
              return;
            }
          }
          if (await bindCoverageToHttp(req, res, deps)) return;
          res.writeHead(404).end();
        })();
      });
      await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', () => resolveListen()));
      try {
        const port = (server.address() as AddressInfo).port;
        const coverageRes = await fetch(`http://127.0.0.1:${port}${COVERAGE_ROUTES.json}`);
        assert.equal(coverageRes.status, 200);
        const coverageJson = (await coverageRes.json()) as ReturnType<typeof computeIdentityCoverage>;
        assert.equal(coverageJson.identitySources.corporateActionsEmpty, true);
        assert.equal(coverageJson.identitySources.corporateActionCount, 0);
        assert.ok(coverageJson.identitySources.issuerCount > 0);
        assert.ok(coverageJson.notes.some((note) => /valid and genuinely empty/.test(note)));

        // Verify POST /api/investment/coverage/preview projects nested D114 securityIdentity over HTTP.
        const previewRes = await fetch(`http://127.0.0.1:${port}${COVERAGE_ROUTES.previewEvaluation}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            broker: 'DHAN',
            holdings: [
              {
                symbol: 'BODHI',
                securityIdentity: {
                  securityId: 'ISIN:IN0000000029:BE',
                  isin: 'IN0000000029',
                  series: 'BE',
                  isinAuthority: 'NON_AUTHORITATIVE',
                },
                quantity: 10,
              },
              {
                symbol: 'AARAV',
                securityIdentity: null,
                quantity: 5,
              },
              {
                symbol: 'AARAV',
                exchange: 'NSE',
                securityIdentity: {
                  securityId: 'BAD',
                  isin: 'IN0000000011',
                  series: 'EQ',
                  isinAuthority: 'NON_AUTHORITATIVE',
                },
                quantity: 3,
              },
            ],
          }),
        });
        assert.equal(previewRes.status, 200);
        const previewJson = (await previewRes.json()) as {
          report: ReturnType<typeof computeIdentityCoverage>;
        };
        const [rowBe, rowUnresolved, rowMalformed] = previewJson.report.items;
        assert.equal(rowBe?.state, 'RESOLVED');
        assert.equal(rowBe?.outcomeClass, 'RESOLVED');
        assert.equal(rowBe?.binding.listingId, 'IN:NSE:TWINS:BE:EQUITY');
        assert.equal(rowBe?.raw['securityIdentity.securityId'], 'ISIN:IN0000000029:BE');

        assert.equal(rowUnresolved?.state, 'UNMATCHED');
        assert.equal(rowUnresolved?.outcomeClass, 'UNRESOLVED');
        assert.equal(rowUnresolved?.reason, 'NO_IDENTIFIER_PROVIDED');

        assert.equal(rowMalformed?.state, 'REJECTED_MALFORMED_ISIN');
        assert.equal(rowMalformed?.outcomeClass, 'REJECTED');
        assert.equal(rowMalformed?.reason, 'SECURITY_IDENTITY_MALFORMED');
      } finally {
        await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
      }
    }));
});
