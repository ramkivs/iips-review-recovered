/**
 * IID-3 — M-1 demonstration data (SYNTHETIC).
 *
 * What this module is, exactly:
 *   - It writes a SYNTHETIC dataset through IID-0's approved local ingestion path (`writeDataset` →
 *     `readDataset`), so the demonstration consumes data the same way an operator snapshot does, with a
 *     real `datasetVersion`, `contentDigest` and manifest integrity check.
 *   - It writes a SYNTHETIC IID-1 identity directory (roster, listing map, corporate-action table) whose
 *     single issuer resolves through the real IID-1 resolver.
 *   - The financial content is the IID-2 synthetic reference company, re-keyed from its fixture issuer to
 *     the identity issuer so that IID-1 → IID-2 → IID-3 address ONE company end to end.
 *
 * What it is NOT: real issuer data. No exchange data is downloaded or scraped, and nothing here validates
 * any real company. Every artefact produced from it is labelled `SYNTHETIC_REFERENCE`. This is limitation
 * L-004/L-009 carried forward, not resolved.
 *
 * DEPENDENCY NOTE. The financial fixtures are imported from `iips-platform/tests/investment`, not
 * duplicated here. That import is deliberate: one copy of the reference numbers is the only way the
 * demonstration and the IID-2 goldens cannot drift apart. It is acceptable because this module is
 * demonstration/evidence code reached only from the IID-3 CLI and tests — it is not product code, and
 * nothing in the request path imports it.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { techDataset } from '../../../../iips-platform/tests/investment/assessmentFixtures';
import { IDENTITY_SCHEMA } from '../../../../iips-platform/src/investment/identity/types';
import type { DatasetContent } from '../../../../iips-platform/src/investment/fundamentals/types';
import { readDataset, writeDataset } from '../../../../iips-platform/src/investment/ingestion/writer';

/** Issuer in the demonstration identity roster (valid `IN:EQISIN:` issuer form). */
export const M1_ISSUER_ID = 'IN:EQISIN:IN0000000201';
/** The issuer's tradable equity security. */
export const M1_SECURITY_ID = 'IN:ISIN:IN0000000201';
export const M1_ISIN = 'IN0000000201';
export const M1_LEGAL_NAME = 'Aarav Systems Limited (synthetic IID-3 demonstration)';
export const M1_SYMBOL = 'AARAVSYN';

/** The fixture issuer the IID-2 reference dataset is written for. */
const FIXTURE_ISSUER = 'IN:ISIN:IN0000000201';

/** Dataset provenance label. Never changed to something that implies real data. */
export const M1_DATASET_PROVIDER = 'iid3-m1-synthetic-reference';
export const M1_ROSTER_LABEL = 'SYNTHETIC IID-3 M-1 demonstration roster (not a real company)';

/** Keys that carry an ISSUER identity and must be re-keyed. */
const ISSUER_KEYS = new Set(['issuerId', 'subjectIssuerId', 'issuerIds']);
/** Keys that carry a SECURITY identity and must be left alone. */
const SECURITY_KEYS = new Set(['securityId', 'subjectSecurityId', 'securityIds']);

/**
 * Re-key every issuer reference in a dataset, and refuse to guess about anything else.
 *
 * The fixture issuer id and the fixture security id are the same string, so a blind string replacement
 * would silently merge issuer and security identity — the exact confusion IID-0's three-level identity
 * model exists to prevent. This walker therefore keys off the FIELD NAME, counts both outcomes, and
 * rejects any occurrence of the string under a field it does not recognise.
 */
export function rekeyDatasetIssuer(dataset: DatasetContent, from: string, to: string): DatasetContent {
  let replaced = 0;
  let kept = 0;
  const unexpected: string[] = [];

  const walk = (value: unknown, path: string): unknown => {
    if (Array.isArray(value)) return value.map((item, index) => walk(item, `${path}[${index}]`));
    if (value !== null && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (typeof child === 'string' && child === from) {
          if (ISSUER_KEYS.has(key)) {
            replaced += 1;
            out[key] = to;
            continue;
          }
          if (SECURITY_KEYS.has(key)) {
            kept += 1;
            out[key] = child;
            continue;
          }
          unexpected.push(`${path}.${key}`);
          out[key] = child;
          continue;
        }
        out[key] = walk(child, `${path}.${key}`);
      }
      return out;
    }
    return value;
  };

  const result = walk(dataset, '$') as DatasetContent;
  if (unexpected.length > 0) {
    throw new Error(
      `rekey refused: issuer identity appears under unrecognised field(s): ${unexpected.join(', ')}`,
    );
  }
  if (replaced === 0) throw new Error('rekey refused: no issuer reference was re-keyed');
  if (kept === 0) throw new Error('rekey refused: no security reference was preserved');
  return result;
}

/** The synthetic demonstration dataset, addressed to the demonstration issuer. */
export function m1Dataset(): DatasetContent {
  return rekeyDatasetIssuer(techDataset(), FIXTURE_ISSUER, M1_ISSUER_ID);
}

/**
 * A deterministic, minimal perturbation of the reference dataset, used to produce version 2.
 *
 * A PRICE is changed, not a statement figure. Statement edits would have to rebuild the closed derivation
 * set for the affected period (`values` → `derived`), and hand-editing one without the other would create
 * a dataset whose derived figures no longer follow from its as-filed facts — a corrupt input, not a changed
 * one. A price observation is an independent input with no derivation attached, so changing it changes the
 * assessment's valuation inputs without manufacturing an internally inconsistent dataset.
 *
 * Exactly one record moves: the latest close for the demonstration security, by +5%. The evidence records
 * which record and by how much.
 */
export const M1_V2_PERTURBATION = Object.freeze({
  kind: 'PRICE' as const,
  securityId: M1_SECURITY_ID,
  factor: 1.05,
  note: 'latest close for the demonstration security raised by 5% to produce version 2',
});

export function m1DatasetV2(): DatasetContent {
  const base = m1Dataset();
  const forSecurity = base.prices.filter((price) => price.securityId === M1_V2_PERTURBATION.securityId);
  if (forSecurity.length === 0) {
    throw new Error(`M-1 v2 perturbation: no price record for ${M1_V2_PERTURBATION.securityId}`);
  }
  const latestAsOf = forSecurity
    .map((price) => price.asOf)
    .sort()
    .reverse()[0]!;
  let changed = 0;
  const prices = base.prices.map((price) => {
    if (price.securityId !== M1_V2_PERTURBATION.securityId || price.asOf !== latestAsOf) return price;
    changed += 1;
    return { ...price, value: Math.round(price.value * M1_V2_PERTURBATION.factor * 100) / 100 };
  });
  if (changed === 0) throw new Error('M-1 v2 perturbation changed nothing');
  return { ...base, prices };
}

/* ---------------------------------------------------------------- identity files */

export const M1_ROSTER = {
  schemaVersion: IDENTITY_SCHEMA,
  rosterLabel: M1_ROSTER_LABEL,
  issuers: [
    {
      issuerId: M1_ISSUER_ID,
      legalName: M1_LEGAL_NAME,
      cin: null,
      equityIsin: M1_ISIN,
      issuerKeyBasis: 'EQUITY_ISIN' as const,
      sector: 'Technology',
      subSegment: 'IT services',
      status: 'ELIGIBLE' as const,
      statusReason: null,
      foreignIssuer: false,
    },
  ],
  securities: [
    {
      securityId: M1_SECURITY_ID,
      issuerId: M1_ISSUER_ID,
      isin: M1_ISIN,
      instrumentType: 'EQUITY',
      status: 'ASSESSABLE' as const,
      statusReason: null,
    },
  ],
};

export const M1_LISTING_MAP = {
  schemaVersion: IDENTITY_SCHEMA,
  entries: [
    {
      listingId: 'IN:NSE:AARAVSYN:EQ:EQUITY',
      securityId: M1_SECURITY_ID,
      issuerId: M1_ISSUER_ID,
      exchange: 'NSE',
      symbol: M1_SYMBOL,
      series: 'EQ',
      instrumentType: 'EQUITY',
      effectiveFrom: '2020-06-01',
      effectiveTo: null,
      sourceRef: 'synthetic IID-3 M-1 demonstration listing',
    },
  ],
};

export const M1_CORPORATE_ACTIONS = { schemaVersion: IDENTITY_SCHEMA, actions: [] };

/** The observation the resolver is asked to resolve: ISIN + exchange symbol of the demo issuer. */
export const M1_OBSERVATION = Object.freeze({
  observationId: 'obs-iid3-m1-1',
  source: 'WATCHLIST' as const,
  isin: M1_ISIN,
  symbol: M1_SYMBOL,
  exchange: 'NSE',
  series: 'EQ',
  cin: null,
  companyIdHint: null,
  displayName: M1_LEGAL_NAME,
  portfolioId: 'iid3-m1-demo',
  quantity: null,
  upstreamStatus: null,
  raw: { isin: M1_ISIN, symbol: M1_SYMBOL, exchange: 'NSE' },
});

/** Write the identity directory. Returns the directory written. */
export function writeM1IdentityDir(dir: string): string {
  mkdirSync(dir, { recursive: true });
  const write = (name: string, value: unknown): void => {
    writeFileSync(join(dir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  };
  write('eligible-roster.json', M1_ROSTER);
  write('listing-map.json', M1_LISTING_MAP);
  write('corporate-actions.json', M1_CORPORATE_ACTIONS);
  return dir;
}

/** Write a dataset through IID-0's writer, then read it back through IID-0's verified reader. */
export function writeM1Dataset(dir: string, content: DatasetContent, now: string): ReturnType<typeof readDataset> {
  writeDataset({
    dir,
    content,
    provider: M1_DATASET_PROVIDER,
    licence: 'synthetic reference data; not redistributable',
    now,
    importRunId: `iid3-m1-${content.periods.length}-periods`,
    // The M1 dataset IS synthetic, and it says so. The rights state is declared rather than
    // inferred from the provider label, so the dataset class that reaches the assessment is
    // `SYNTHETIC_REFERENCE` on the strength of this declaration and not of a string comparison.
    sourceRights: {
      state: 'SYNTHETIC',
      basis: '',
      note: 'the shipped M1 reference dataset; synthetic content, no real-world source',
    },
  });
  return readDataset(dir);
}
