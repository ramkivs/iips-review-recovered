/**
 * Phase 1 — IRR server-side D114 `securityIdentity` projection, portfolio-context matching,
 * fail-closed source validation, and live loopback HTTP verification.
 *
 * @vitest-environment node
 */
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  FIXTURE_AS_OF,
  identitySourceTexts,
  loadFixtureSources,
} from '../../../iips-platform/tests/investment/identityFixture';
import { loadRuntimeIdentitySources } from '../../../iips-platform/src/investment/identity/runtime';
import { buildFinancialCoverageDisclosure } from '../../../iips-platform/src/investment/identity/coverage';
import { IDENTITY_SCHEMA, type IdentitySources } from '../../../iips-platform/src/investment/identity/types';
import type { G2HoldingView, G2PortfolioView } from '../user-portfolio/userPortfolioContract.js';
import { effectiveHoldingIsin, toHoldingObservation } from './sources';
import { handleHoldingIdentityRequest, resolveHoldingIdentities } from './holding-identity-transport';
import { handleDiscoveryRequest } from './discovery-transport';
import { handleInvestmentCoverageRequest } from './coverage-transport';
import { buildPortfolioContext } from './portfolioContext';
import { assessIidReadiness } from './runtimeReadiness';

const texts = identitySourceTexts();
const fixtureSources: IdentitySources = loadFixtureSources();
const scratchDirs: string[] = [];

function makeScratch(): string {
  const dir = mkdtempSync(join(tmpdir(), 'irr-phase1-server-'));
  scratchDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** Canonical persisted IPD holding shape (`holdingFromRow`: nested `securityIdentity`, no flat `isin`/`exchange`). */
function d114Holding(overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: 'BODHI',
    companyId: 'EQ_2002_IN',
    securityIdentity: {
      securityId: 'ISIN:IN0000000029:BE',
      isin: 'IN0000000029',
      series: 'BE',
      isinAuthority: 'NON_AUTHORITATIVE',
    },
    quantity: 20,
    averageBuyPrice: 500,
    currentPrice: 550,
    marketValue: 11_000,
    weightPercentage: 60,
    active: true,
    sourceBroker: 'DHAN',
    lineageDigest: 'b'.repeat(64),
    identityStatus: 'RESOLVED',
    ...overrides,
  };
}

describe('Phase 1 — lossless D114 projection in toHoldingObservation and resolveHoldingIdentities', () => {
  it('projects IPD nested securityIdentity losslessly without inventing exchange or flattening away series', () => {
    const holding = d114Holding();
    const obs = toHoldingObservation('port-1', holding, 0);

    expect(obs.isin).toBe('IN0000000029');
    expect(obs.series).toBe('BE');
    expect(obs.exchange).toBeNull();
    expect(obs.securityIdentity).toEqual({
      securityId: 'ISIN:IN0000000029:BE',
      isin: 'IN0000000029',
      series: 'BE',
      isinAuthority: 'NON_AUTHORITATIVE',
    });
    expect(obs.securityIdentityRejection).toBeUndefined();
    expect(obs.raw['securityIdentity.securityId']).toBe('ISIN:IN0000000029:BE');
    expect(obs.raw['securityIdentity.series']).toBe('BE');
    expect(obs.raw['securityIdentity.isinAuthority']).toBe('NON_AUTHORITATIVE');

    const [resolved] = resolveHoldingIdentities('port-1', [holding], fixtureSources, FIXTURE_AS_OF);
    expect(resolved).toBeDefined();
    expect(resolved?.state).toBe('RESOLVED');
    expect(resolved?.outcomeClass).toBe('RESOLVED');
    expect(resolved?.issuerId).toBe('IN:CIN:U72200TN2001PLC000005');
    expect(resolved?.securityId).toBe('IN:ISIN:IN0000000029');
    expect(resolved?.listingId).toBe('IN:NSE:TWINS:BE:EQUITY');
    expect(resolved?.isin).toBe('IN0000000029');
    expect(resolved?.series).toBe('BE');
    expect(resolved?.d114SecurityIdentity).toEqual(holding.securityIdentity);
  });

  it('distinguishes EQ vs BE multi-series D114 holdings and refuses undeclared series without symbol inference', () => {
    const eqHolding = d114Holding({
      securityIdentity: {
        securityId: 'ISIN:IN0000000029:EQ',
        isin: 'IN0000000029',
        series: 'EQ',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
    });
    const bzHolding = d114Holding({
      securityIdentity: {
        securityId: 'ISIN:IN0000000029:BZ',
        isin: 'IN0000000029',
        series: 'BZ',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
    });

    const [eqIdentity, bzIdentity] = resolveHoldingIdentities(
      'port-1',
      [eqHolding, bzHolding],
      fixtureSources,
      FIXTURE_AS_OF,
    );
    expect(eqIdentity?.state).toBe('RESOLVED');
    expect(eqIdentity?.listingId).toBe('IN:NSE:BODHI:EQ:EQUITY');

    expect(bzIdentity?.state).toBe('AMBIGUOUS_LISTING');
    expect(bzIdentity?.reason).toBe('MULTIPLE_SECURITIES_SHARE_LISTING');
    expect(bzIdentity?.outcomeClass).toBe('UNRESOLVED');
  });

  it('classifies securityIdentity: null without exchange as UNRESOLVED (never inferred from symbol) and malformed/conflicting securityIdentity as REJECTED', () => {
    const unresolvedNull = d114Holding({
      symbol: 'AARAV',
      companyId: 'MANUAL:AARAV',
      securityIdentity: null,
      identityStatus: 'UNRESOLVED',
    });
    const malformedNested = d114Holding({
      symbol: 'AARAV',
      exchange: 'NSE',
      securityIdentity: {
        securityId: 'ISIN:IN0000000011:EQ',
        isin: 'IN0000000011',
        series: 'EQ',
        isinAuthority: 'AUTHORITATIVE' as 'NON_AUTHORITATIVE',
      },
    });
    const conflictingFlat = d114Holding({
      symbol: 'AARAV',
      isin: 'IN0000000011',
      securityIdentity: {
        securityId: 'ISIN:IN0000000029:EQ',
        isin: 'IN0000000029',
        series: 'EQ',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
    });

    const [resNull, resMalformed, resConflict] = resolveHoldingIdentities(
      'port-1',
      [unresolvedNull, malformedNested, conflictingFlat],
      fixtureSources,
      FIXTURE_AS_OF,
    );

    expect(resNull?.state).toBe('UNMATCHED');
    expect(resNull?.reason).toBe('NO_IDENTIFIER_PROVIDED');
    expect(resNull?.outcomeClass).toBe('UNRESOLVED');
    expect(resNull?.issuerId).toBeNull();

    expect(resMalformed?.state).toBe('REJECTED_MALFORMED_ISIN');
    expect(resMalformed?.reason).toBe('SECURITY_IDENTITY_MALFORMED');
    expect(resMalformed?.outcomeClass).toBe('REJECTED');
    expect(resMalformed?.issuerId).toBeNull();

    expect(resConflict?.state).toBe('ISSUER_KEY_CONFLICT');
    expect(resConflict?.outcomeClass).toBe('REJECTED');
    expect(resConflict?.issuerId).toBeNull();
  });
});

describe('Phase 1 — buildPortfolioContext matches persisted IPD D114 holdings accurately', () => {
  it('matches subjectSecurityId against nested D114 securityIdentity when flat isin is absent, and refuses malformed/null securityIdentity', () => {
    const view: G2PortfolioView = {
      portfolioId: 'port-ctx',
      portfolioName: 'Synthetic D114 Portfolio',
      revision: 1,
      holdings: [
        d114Holding({ weightPercentage: 60, marketValue: 6_000 }),
        d114Holding({
          symbol: 'AARAV',
          companyId: 'EQ_1001_IN',
          securityIdentity: {
            securityId: 'ISIN:IN0000000011:EQ',
            isin: 'IN0000000011',
            series: 'EQ',
            isinAuthority: 'NON_AUTHORITATIVE',
          },
          weightPercentage: 40,
          marketValue: 4_000,
        }),
        d114Holding({
          symbol: 'UNRES',
          companyId: 'MANUAL:UNRES',
          securityIdentity: null,
          identityStatus: 'UNRESOLVED',
          weightPercentage: 0,
          marketValue: 0,
          quantity: 1,
        }),
      ],
      totalMarketValue: 10_000,
      totalHoldingsCount: 3,
      weightSumPercentage: 100,
      lastUpdated: '2026-11-10T00:00:00Z',
      provenanceDigest: 'c'.repeat(64),
      isSaved: true,
      contributions: [],
    };

    expect(effectiveHoldingIsin(view.holdings[0]!)).toBe('IN0000000029');
    expect(effectiveHoldingIsin(view.holdings[2]!)).toBeNull();

    const ctx = buildPortfolioContext({
      view,
      subjectSecurityId: 'IN:ISIN:IN0000000029',
      subjectIssuerId: 'IN:CIN:U72200TN2001PLC000005',
      subjectSector: 'TECHNOLOGY_SERVICES',
      asOf: FIXTURE_AS_OF,
    });
    expect(ctx.facts.weightPct).toBe(60);
    expect(ctx.block.weightPct.value).toBe(60);

    // Malformed nested securityIdentity must never match a subjectSecurityId.
    const badView: G2PortfolioView = {
      ...view,
      holdings: [
        d114Holding({
          securityIdentity: {
            securityId: 'WRONG',
            isin: 'IN0000000029',
            series: 'BE',
            isinAuthority: 'NON_AUTHORITATIVE',
          },
          weightPercentage: 60,
        }),
      ],
    };
    const badCtx = buildPortfolioContext({
      view: badView,
      subjectSecurityId: 'IN:ISIN:IN0000000029',
      subjectIssuerId: 'IN:CIN:U72200TN2001PLC000005',
      subjectSector: 'TECHNOLOGY_SERVICES',
      asOf: FIXTURE_AS_OF,
    });
    expect(badCtx.facts.weightPct).toBeNull();
    expect(badCtx.block.weightPct.value).toBeNull();
  });
});

describe('Phase 1 — fail-closed readiness & live loopback HTTP across empty, placeholder, and valid identity directories', () => {
  it('fails closed on schema-only or empty-roster directories in readiness without leaking filesystem paths', () => {
    const dataRoot = makeScratch();
    const idDir = join(dataRoot, 'investment', 'identity');
    mkdirSync(idDir, { recursive: true });

    const schemaOnly = JSON.stringify({ schemaVersion: IDENTITY_SCHEMA });
    writeFileSync(join(idDir, 'eligible-roster.json'), schemaOnly, 'utf8');
    writeFileSync(join(idDir, 'listing-map.json'), schemaOnly, 'utf8');
    writeFileSync(join(idDir, 'corporate-actions.json'), schemaOnly, 'utf8');

    const readiness = assessIidReadiness({ env: {} as NodeJS.ProcessEnv, dataRoot });
    const identityFinding = readiness.findings.find((item) => item.id === 'identity-files');
    expect(identityFinding?.readable).toBe(false);
    expect(identityFinding?.reason).toContain('IDENTITY_SOURCE_INVALID');
    expect(identityFinding?.reason).toContain('MISSING_REQUIRED_ARRAY');
    expect(identityFinding?.reason).toContain('MISSING_ROSTER_LABEL');
    expect(JSON.stringify(readiness).includes(dataRoot)).toBe(false);
  });

  it('serves live loopback HTTP 503 on empty/placeholder identity dirs and HTTP 200 on populated roster + listing-map with empty corporate-actions.json', async () => {
    const dataRoot = makeScratch();
    const idDir = join(dataRoot, 'investment', 'identity');
    mkdirSync(idDir, { recursive: true });

    const sampleHoldings: readonly G2HoldingView[] = [
      d114Holding(),
      d114Holding({
        symbol: 'AARAV',
        companyId: 'MANUAL:AARAV',
        securityIdentity: null,
        identityStatus: 'UNRESOLVED',
      }),
      d114Holding({
        symbol: 'AARAV',
        exchange: 'NSE',
        securityIdentity: {
          securityId: 'CORRUPT',
          isin: 'IN0000000011',
          series: 'EQ',
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      }),
    ];

    const server = http.createServer((req, res) => {
      void (async () => {
        if (
          await handleDiscoveryRequest(req, res, {
            loadSources: () => loadRuntimeIdentitySources(dataRoot),
            loadInventory: async () => null,
            today: () => FIXTURE_AS_OF,
          })
        ) {
          return;
        }
        if (
          await handleHoldingIdentityRequest(req, res, {
            loadSources: () => loadRuntimeIdentitySources(dataRoot),
            holdings: async () => sampleHoldings,
            today: () => FIXTURE_AS_OF,
          })
        ) {
          return;
        }
        if (
          await handleInvestmentCoverageRequest(req, res, {
            loadSources: () => loadRuntimeIdentitySources(dataRoot),
            holdings: async () => sampleHoldings.map((h, i) => toHoldingObservation('port-live', h, i)),
            watchlist: async () => [],
            financialCoverage: () => buildFinancialCoverageDisclosure({}),
            today: () => FIXTURE_AS_OF,
            dataRoot,
          })
        ) {
          return;
        }
        res.writeHead(404).end();
      })();
    });

    await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', () => resolveListen()));
    try {
      const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

      // 1. Empty directory -> 503 across coverage, discovery, and holding-identity endpoints.
      const covMissing = await fetch(`${baseUrl}/api/investment/coverage`);
      expect(covMissing.status).toBe(503);
      const discMissing = await fetch(`${baseUrl}/api/investment/companies?q=Bodhi`);
      expect(discMissing.status).toBe(503);
      const holdMissing = await fetch(`${baseUrl}/api/investment/portfolio/port-live/identities`);
      expect(holdMissing.status).toBe(503);

      // 2. Empty operational roster/listing-map placeholders -> still 503.
      writeFileSync(
        join(idDir, 'eligible-roster.json'),
        JSON.stringify({
          schemaVersion: IDENTITY_SCHEMA,
          rosterLabel: 'empty placeholder',
          issuers: [],
          securities: [],
        }),
        'utf8',
      );
      writeFileSync(
        join(idDir, 'listing-map.json'),
        JSON.stringify({ schemaVersion: IDENTITY_SCHEMA, entries: [] }),
        'utf8',
      );
      writeFileSync(
        join(idDir, 'corporate-actions.json'),
        JSON.stringify({ schemaVersion: IDENTITY_SCHEMA, actions: [] }),
        'utf8',
      );
      const covEmptyPlaceholder = await fetch(`${baseUrl}/api/investment/coverage`);
      expect(covEmptyPlaceholder.status).toBe(503);
      const holdEmptyPlaceholder = await fetch(`${baseUrl}/api/investment/portfolio/port-live/identities`);
      expect(holdEmptyPlaceholder.status).toBe(503);

      // 3. Populated roster + listing-map + valid empty corporate-actions (`actions: []`) -> 200.
      writeFileSync(join(idDir, 'eligible-roster.json'), texts.roster, 'utf8');
      writeFileSync(join(idDir, 'listing-map.json'), texts.listingMap, 'utf8');

      const covOk = await fetch(`${baseUrl}/api/investment/coverage`);
      expect(covOk.status).toBe(200);
      const covJson = (await covOk.json()) as {
        identitySources: { corporateActionsEmpty: boolean; corporateActionCount: number; issuerCount: number };
        items: Array<{ state: string; outcomeClass: string }>;
      };
      expect(covJson.identitySources.corporateActionsEmpty).toBe(true);
      expect(covJson.identitySources.corporateActionCount).toBe(0);
      expect(covJson.identitySources.issuerCount).toBeGreaterThan(0);
      expect(covJson.items.map((item) => item.outcomeClass)).toEqual(['RESOLVED', 'UNRESOLVED', 'REJECTED']);

      const discOk = await fetch(`${baseUrl}/api/investment/companies?q=Bodhi`);
      expect(discOk.status).toBe(200);
      const discJson = (await discOk.json()) as {
        directory: { corporateActionsEmpty: boolean; corporateActionCount: number };
        matches: { issuerId: string }[];
      };
      expect(discJson.directory.corporateActionsEmpty).toBe(true);
      expect(discJson.matches[0]?.issuerId).toBe('IN:CIN:U72200TN2001PLC000005');

      const holdOk = await fetch(`${baseUrl}/api/investment/portfolio/port-live/identities`);
      expect(holdOk.status).toBe(200);
      const holdJson = (await holdOk.json()) as {
        directory: { corporateActionsEmpty: boolean };
        identities: Array<{
          holdingIndex: number;
          state: string;
          outcomeClass: string;
          listingId: string | null;
          isin: string | null;
          series: string | null;
          d114SecurityIdentity: { securityId: string } | null;
        }>;
      };
      expect(holdJson.directory.corporateActionsEmpty).toBe(true);
      expect(holdJson.identities).toHaveLength(3);

      expect(holdJson.identities[0]).toMatchObject({
        holdingIndex: 0,
        state: 'RESOLVED',
        outcomeClass: 'RESOLVED',
        listingId: 'IN:NSE:TWINS:BE:EQUITY',
        isin: 'IN0000000029',
        series: 'BE',
        d114SecurityIdentity: { securityId: 'ISIN:IN0000000029:BE' },
      });
      expect(holdJson.identities[1]).toMatchObject({
        holdingIndex: 1,
        state: 'UNMATCHED',
        outcomeClass: 'UNRESOLVED',
        listingId: null,
        d114SecurityIdentity: null,
      });
      expect(holdJson.identities[2]).toMatchObject({
        holdingIndex: 2,
        state: 'REJECTED_MALFORMED_ISIN',
        outcomeClass: 'REJECTED',
        listingId: null,
      });
    } finally {
      await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
    }
  });
});
