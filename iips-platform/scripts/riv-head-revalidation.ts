/**
 * RIV — the representative real issuer, re-validated at the current authoritative head.
 *
 * WHY THIS SCRIPT EXISTS. `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/`, `WI2-…` and `WI3-…` record a real
 * Indian listed non-financial issuer taken through the IID path, and every figure in them was produced at an
 * older head. Since WI-3 the assessment contract moved: the authorised valuation policy (IX, `L-034`), the
 * associates/JV disclosure and review control (VII/IX, `L-036`), the nil-binding grammar (WI-10, `L-035`), the
 * cash-side rule (WI-11, `L-038`), the zero-substitution guard (`L-040`), the source-rights classification and
 * the ISIN-path series bridge (W03/W05/W08). Nobody had re-run the real issuer at the new head, so nobody knew
 * whether the recorded real-issuer validation still held, and a green synthetic suite would not have said.
 *
 * This script therefore re-derives the real issuer's assessment **from the committed primary evidence** — the
 * transcribed filing cells in `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input/periods.csv`, not
 * a re-typed fixture and not the engine's own output — and compares the recomputation with the payload the
 * governed pipeline persisted at head:
 *
 *   1. dataset identity: re-ingesting the committed input must reproduce WI-3's recorded `datasetVersion`;
 *   2. derivations: all 8 closed derivations, recomputed here from the CSV cells, for all three filed periods;
 *   3. capital structure: gross debt, cash and investments, net debt, and which components are `NIL_BY_DISCLOSURE`;
 *   4. valuation: the FCFF base, the two-stage DCF, mid-cycle EBITDA, normalised EPS, the enterprise-to-equity
 *      bridge at every point, the renormalised blend and the intrinsic range;
 *   5. margin of safety and its band, against the one committed BSE close;
 *   6. confidence: the 0.6/0.4 combination, every cap factor and the R-4.3 policy-default penalty;
 *   7. an ATTRIBUTED structural diff against the committed WI-3 payload — a changed path with no attribution
 *      stops the script, so this artifact cannot quietly absorb an unexplained change;
 *   8. the mapping census (line items, XBRL tags, derivations, what the CSV path can and cannot carry);
 *   9. the dataset-class question (`L-041`): what the assessment path and the investment-coverage path each say
 *      about the SAME committed real-issuer manifests.
 *
 *   tsx scripts/riv-head-revalidation.ts <output-dir> --head-payload <payload.json> --head-summary <summary.json>
 *
 * The script REFUSES to publish if the dataset identity moved, if any recomputed figure disagrees with the
 * published one, if a changed payload path carries no attribution, or if the two dataset classifiers agree (they
 * are recorded as disagreeing; a one-sided fix must fail here rather than pass silently).
 *
 * Read-only with respect to history: no earlier bundle is rewritten, no store is opened and no NP-04 artifact is
 * minted. The only files written are inside the output directory.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { assessCompany } from '../src/investment/assessment/engine';
import { VALUATION_POLICY, mosBandFor } from '../src/investment/assessment/policy';
import { buildDatasetContent, type DatasetInputs } from '../src/investment/ingestion/builder';
import { writeDataset } from '../src/investment/ingestion/writer';
import { buildInvestmentCoverageReport } from '../src/investment/coverage/investmentCoverage';
import { classifyDataset } from '../src/investment/fundamentals/datasetClass';
import { LINE_ITEMS, LINE_ITEM_IDS } from '../src/investment/contracts/lineItems';
import { XBRL_TAG_MAP } from '../src/investment/ingestion/xbrl';
import { DERIVATIONS } from '../src/investment/fundamentals/derive';
import type { DatasetManifest } from '../src/investment/fundamentals/manifest';
import type { IssuerRecord, ListingRecord, PriceRecord, SecurityRecord } from '../src/investment/fundamentals/types';
import type { SectorName } from '../src/investment/contracts/operatingMetrics';

const REPO = resolve(__dirname, '../..');
const WI3 = join(REPO, 'evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06');
const ISSUER_ID = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY_ID = 'IN:ISIN:INE009A01021';

/** WI-3's recorded dataset identity. A drift here is a finding, not a nuisance. */
const WI3_DATASET_VERSION = 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847';
/** WI-3's recorded canonical payload digest, as persisted at its own head. */
const WI3_PAYLOAD_DIGEST = '83644bc68e3d68f3f714fb205179eae63c6da2ff9d5cdcf77d0a3d5c573d493d';
/** What WI-3 published, for the diff. Every one of these was recomputed at that head from the same filings. */
const WI3_RECORDED = Object.freeze({
  combined: 0.6736,
  caps: ['STALE_DATA', 'DILUTION_PROXY'] as readonly string[],
  intrinsicLow: 875.3394146903431,
  intrinsicMid: 1088.972274952081,
  intrinsicHigh: 1399.8105188789887,
  mosVsMid: -0.08418738213693565,
  listingId: 'IN:BSE:500209:EQ:EQUITY',
  datasetClass: 'APPROVED_LOCAL_INGESTION',
});
/** What IX published for this issuer's confidence after the authorised penalty. Pinned by `ixAuthorizedPolicy.test.ts`. */
const IX_PUBLISHED = Object.freeze({ before: 0.6736, after: 0.4378, multiplier: 0.65, reduction: 0.35 });

const text = (file: string): string => readFileSync(file, 'utf8');
const json = <T>(file: string): T => JSON.parse(text(file)) as T;

/* -------------------------------------------------------------------------- premises */

const failures: string[] = [];
function require(condition: boolean, premise: string, detail?: unknown): void {
  if (!condition) failures.push(detail === undefined ? premise : `${premise} — ${JSON.stringify(detail)}`);
}
function refuse(): never {
  throw new Error(`RIV head re-validation REFUSED to publish:\n  - ${failures.join('\n  - ')}`);
}
/** Exact equality on published floats: these are the same IEEE-754 computations, so any difference is real. */
function sameNumber(published: number | null, recomputed: number | null, what: string): void {
  require(published === recomputed, `${what}: published ${String(published)} ≠ independently recomputed ${String(recomputed)}`);
}

/* -------------------------------------------------------------------------- arguments */

interface Args {
  readonly outDir: string;
  readonly headPayload: string;
  readonly headSummary: string;
}

function parseArgs(argv: readonly string[]): Args {
  const outDir = argv[0];
  if (outDir === undefined) throw new Error('usage: tsx scripts/riv-head-revalidation.ts <output-dir> --head-payload <p.json> --head-summary <s.json>');
  const at = (flag: string): string => {
    const index = argv.indexOf(flag);
    if (index < 0 || argv[index + 1] === undefined) throw new Error(`missing ${flag}`);
    return argv[index + 1]!;
  };
  return { outDir: resolve(outDir), headPayload: resolve(at('--head-payload')), headSummary: resolve(at('--head-summary')) };
}

/* -------------------------------------------------------------------------- the committed primary evidence */

/**
 * Read the transcribed filing cells DIRECTLY.
 *
 * This is the independence claim: the recomputation below never asks the engine what it derived. It reads the
 * same CSV the ingester read, in crore as filed, and does its own arithmetic. `NIL:` cells are returned as a
 * declaration with the filer's wording, never as a zero and never as an absence.
 */
interface FiledRow {
  readonly fiscalYear: number;
  readonly periodEnd: string;
  readonly filingRef: string;
  readonly filedAt: string;
  readonly scale: string;
  readonly scope: string;
  readonly cells: Readonly<Record<string, string>>;
}

function readFiledRows(csvPath: string): readonly FiledRow[] {
  const lines = text(csvPath).split('\n').filter((line) => line.trim().length > 0);
  const header = lines[0]!.split(',').map((name) => name.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row: Record<string, string> = {};
    header.forEach((name, index) => {
      row[name] = (cells[index] ?? '').trim();
    });
    return {
      fiscalYear: Number(row['fiscal_year']),
      periodEnd: row['period_end']!,
      filingRef: row['filing_ref']!,
      filedAt: row['filed_at']!,
      scale: row['source_scale']!,
      scope: row['statement_scope']!,
      cells: row,
    };
  });
}

/**
 * One as-filed number, in the unit the closed vocabulary says it is in.
 *
 * The CSV is transcribed in crore, but `source_scale` is not a blanket multiplier: the vocabulary gives each
 * line item a `unit`, and a per-share figure or a share count is not a crore amount. Scaling `EPS_DILUTED` by
 * 1e7 would turn ₹63.29 into ₹63.29 crore and every per-share output with it. The ingester scales `INR` items
 * only, and so does this recomputation — from `LINE_ITEMS[item].unit`, not from a list retyped here.
 *
 * A missing cell is `null`. It is never read as zero.
 */
function filed(row: FiledRow, item: string): number | null {
  const raw = row.cells[item];
  if (raw === undefined || raw === '' || raw.startsWith('NIL:')) return null;
  const asTranscribed = Number(raw);
  require(Number.isFinite(asTranscribed), `${item} on ${row.periodEnd} is not a number`, raw);
  const meta = LINE_ITEMS[item as keyof typeof LINE_ITEMS];
  require(meta !== undefined, `${item} is not in the closed line-item vocabulary`);
  if (meta.unit !== 'INR') return asTranscribed;
  require(row.scale === 'CRORE', `${item} on ${row.periodEnd}: unexpected source_scale`, row.scale);
  return asTranscribed * 1e7;
}

/** One declared nil, with the filer's own sentence. */
function declaredNil(row: FiledRow, item: string): string | null {
  const raw = row.cells[item];
  if (raw === undefined || !raw.startsWith('NIL:')) return null;
  return raw.slice('NIL:'.length).trim();
}

/* -------------------------------------------------------------------------- 1. dataset identity */

function rebuildDataset(scratch: string): { readonly datasetVersion: string; readonly issueCount: number } {
  const roster = json<{ issuers: IssuerRecord[]; securities: SecurityRecord[]; listings: ListingRecord[] }>(
    join(WI3, 'ingest-input', 'roster.json'),
  );
  let prices: PriceRecord[] = [];
  try {
    prices = json<{ prices: PriceRecord[] }>(join(WI3, 'ingest-input', 'prices.json')).prices;
  } catch {
    prices = [];
  }
  const inputs: DatasetInputs = {
    datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1',
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: [],
    prices,
    periodCsv: { name: 'periods.csv', text: text(join(WI3, 'ingest-input', 'periods.csv')) },
    operatingMetricsCsv: null,
    xbrlFiles: [],
  };
  const content = buildDatasetContent(inputs);
  const now = '2026-11-06T14:05:00.000Z';
  const written = writeDataset({
    dir: scratch,
    content,
    provider: 'operator-file-input',
    licence: 'operator-supplied; not redistributable',
    now,
    importRunId: `run-${now}`,
  });
  return { datasetVersion: written.manifest.datasetVersion, issueCount: content.issues.length };
}

/* -------------------------------------------------------------------------- 2–6. independent recomputation */

interface Recomputation {
  readonly perPeriod: readonly Record<string, unknown>[];
  readonly derivationCoverage: readonly Record<string, unknown>[];
  readonly capitalStructure: Record<string, unknown>;
  readonly valuation: Record<string, unknown>;
  readonly marginOfSafety: Record<string, unknown>;
  readonly confidence: Record<string, unknown>;
  readonly checks: { readonly total: number; readonly failed: number };
}

const mean = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;
const round4 = (value: number): number => Number(Math.min(1, Math.max(0, value)).toFixed(4));
const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

function recompute(rows: readonly FiledRow[], head: any): Recomputation {
  const checksBefore = failures.length;
  // Newest first in the payload; oldest first is what a CAGR and a three-year mean want.
  const oldestFirst = [...rows].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const newest = oldestFirst[oldestFirst.length - 1]!;
  require(oldestFirst.length === 3, 'expected three filed annual periods', oldestFirst.length);

  /* --- reported vs derived, per period ---------------------------------------------- */
  const perPeriod = oldestFirst.map((row) => {
    const pbt = filed(row, 'PROFIT_BEFORE_TAX');
    const finance = filed(row, 'FINANCE_COSTS');
    const dna = filed(row, 'DEPRECIATION_AND_AMORTISATION');
    const ocf = filed(row, 'OPERATING_CASH_FLOW');
    const capex = filed(row, 'CAPITAL_EXPENDiture'.replace('EXPENDiture', 'EXPENDITURE'));
    const attributable = filed(row, 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS');
    const epsDiluted = filed(row, 'EPS_DILUTED');
    const owners = filed(row, 'EQUITY_ATTRIBUTABLE_TO_OWNERS');
    const published = head.fundamentals.annual.find((period: any) => period.periodEnd === row.periodEnd);
    require(published !== undefined, `head payload carries no annual period for ${row.periodEnd}`);
    const derived = published?.derived ?? {};

    const ebit = pbt !== null && finance !== null ? pbt + finance : null;
    const ebitda = ebit !== null && dna !== null ? ebit + dna : null;
    const fcf = ocf !== null && capex !== null ? ocf - capex : null;
    // EPS is per share, so the count comes out in shares, not in crore-scaled rupees.
    const dilutedShares = attributable !== null && epsDiluted !== null && epsDiluted !== 0 ? attributable / epsDiluted : null;
    const bvps = owners !== null && dilutedShares !== null && dilutedShares > 0 ? owners / dilutedShares : null;

    const expected: [string, number | null, any][] = [
      ['EBIT', ebit, derived['EBIT']],
      ['EBITDA', ebitda, derived['EBITDA']],
      ['FREE_CASH_FLOW', fcf, derived['FREE_CASH_FLOW']],
      ['DILUTED_SHARES', dilutedShares, derived['DILUTED_SHARES']],
      ['BOOK_VALUE_PER_SHARE', bvps, derived['BOOK_VALUE_PER_SHARE']],
    ];
    for (const [item, value, observation] of expected) {
      require(observation !== undefined, `${row.periodEnd}: head payload has no derived ${item}`);
      require(observation?.basis === 'DERIVED', `${row.periodEnd}: derived ${item} is not labelled DERIVED`, observation?.basis);
      sameNumber(observation?.value ?? null, value, `${row.periodEnd} derived ${item}`);
    }
    // Every published cell is checked against the transcribed filing, in all four of its states. This is where
    // "never substitute zero for missing data" is actually tested rather than asserted.
    const cellStates: Record<string, number> = { AS_FILED: 0, NIL_BY_DISCLOSURE: 0, MISSING: 0, unexpected: 0 };
    for (const [item, observation] of Object.entries<any>(published?.values ?? {})) {
      const cell = filed(row, item);
      const nil = declaredNil(row, item);
      if (nil !== null) {
        cellStates.NIL_BY_DISCLOSURE += 1;
        require(
          observation.presence === 'NIL_BY_DISCLOSURE' && observation.basis === 'AS_FILED' &&
            observation.value === null && observation.note === nil &&
            observation.reason === 'DECLARED_NIL_IN_SOURCE' && observation.filingRef === row.filingRef,
          `${row.periodEnd}: ${item} is declared nil in the filing but not published as a declaration with the filer's wording`,
          observation,
        );
      } else if (cell !== null) {
        cellStates.AS_FILED += 1;
        require(observation.presence === 'PRESENT', `${row.periodEnd}: ${item} is filed but published as ${observation.presence}`);
        require(observation.basis === 'AS_FILED', `${row.periodEnd}: reported ${item} is not labelled AS_FILED`, observation.basis);
        require(observation.source?.kind === 'FILING', `${row.periodEnd}: reported ${item} has no FILING source`);
        require(
          observation.filingRef === row.filingRef && observation.source?.ref === row.filingRef,
          `${row.periodEnd}: ${item} cites ${observation.filingRef}, the row says ${row.filingRef}`,
        );
        require(observation.source?.filedAt === row.filedAt, `${row.periodEnd}: ${item} cites filedAt ${observation.source?.filedAt}`);
        sameNumber(observation.value ?? null, cell, `${row.periodEnd} reported ${item}`);
      } else {
        // An empty cell. It must be published as an absence with a reason — never as PRESENT, never as zero.
        cellStates.MISSING += 1;
        require(
          observation.presence === 'MISSING' && observation.value === null && observation.reason === 'NOT_REPORTED',
          `${row.periodEnd}: ${item} is blank in the filing but published as ${observation.presence} / ${String(observation.value)}`,
          observation,
        );
        require(observation.basis === undefined, `${row.periodEnd}: an absent ${item} carries a basis it cannot have`, observation.basis);
      }
      if (observation.presence !== 'PRESENT' && observation.presence !== 'MISSING' && observation.presence !== 'NIL_BY_DISCLOSURE') {
        cellStates.unexpected += 1;
      }
    }
    require(cellStates.unexpected === 0, `${row.periodEnd}: a cell was published in a state this recomputation does not recognise`, cellStates);
    return {
      periodEnd: row.periodEnd,
      filingRef: row.filingRef,
      filedAt: row.filedAt,
      statementScope: row.scope,
      recomputed: { EBIT: ebit, EBITDA: ebitda, FREE_CASH_FLOW: fcf, DILUTED_SHARES: dilutedShares, BOOK_VALUE_PER_SHARE: bvps },
      published: {
        EBIT: derived['EBIT']?.value ?? null,
        EBITDA: derived['EBITDA']?.value ?? null,
        FREE_CASH_FLOW: derived['FREE_CASH_FLOW']?.value ?? null,
        DILUTED_SHARES: derived['DILUTED_SHARES']?.value ?? null,
        BOOK_VALUE_PER_SHARE: derived['BOOK_VALUE_PER_SHARE']?.value ?? null,
      },
    };
  });

  /* --- the closed derivation set, run against the filing cells ----------------------- */
  // Every one of the 8 derivations is executed HERE, on the transcribed cells, with the formula's own `compute`.
  // Three outcomes are possible and all three are recorded: the item was also reported by the filer (so the
  // derivation is a RECONCILIATION of two independent statements of the same figure), the item was only derived,
  // or an input is missing (so nothing may be published, and nothing is).
  const derivationCoverage = DERIVATIONS.map((derivation) => {
    const perPeriodState = oldestFirst.map((row) => {
      const publishedDerived = (head.fundamentals.annual.find((period: any) => period.periodEnd === row.periodEnd)?.derived ?? {})[derivation.id];
      const publishedReported = (head.fundamentals.annual.find((period: any) => period.periodEnd === row.periodEnd)?.values ?? {})[derivation.id];
      // The derivation set is LAYERED: `BOOK_VALUE_PER_SHARE` needs `DILUTED_SHARES`, which is itself derived.
      // So an input is available if the filing carries it, or if another derivation can produce it from what the
      // filing carries. Recording which of the two it was is the calculation trace; guessing is not allowed.
      const resolve = (id: string): number | null => {
        const cell = filed(row, id);
        if (cell !== null) return cell;
        const dependency = DERIVATIONS.find((entry) => entry.id === id);
        if (dependency === undefined) return null;
        return dependency.requires.every((required) => resolve(required) !== null)
          ? dependency.compute((required) => resolve(required) as number)
          : null;
      };
      const inputsAvailable = derivation.requires.every((id) => resolve(id) !== null);
      if (!inputsAvailable) {
        const missingInputs = derivation.requires.filter((id) => resolve(id) === null);
        // An unavailable input must produce an absence, never a zero and never a partial figure.
        require(
          publishedDerived === undefined && (publishedReported === undefined || publishedReported.value === null),
          `${row.periodEnd}: ${derivation.id} was published although its inputs ${missingInputs.join(', ')} are not in the filing`,
          publishedDerived ?? publishedReported,
        );
        return { periodEnd: row.periodEnd, state: 'INPUTS_MISSING', missingInputs, computed: null, published: null };
      }
      const computed = derivation.compute((id) => resolve(id) as number);
      const inputProvenance = derivation.requires.map((id) => ({
        input: id,
        from: filed(row, id) !== null ? 'AS_FILED' : 'DERIVED',
      }));
      const reportedCell = filed(row, derivation.id);
      if (publishedDerived !== undefined) {
        require(publishedDerived.basis === 'DERIVED', `${row.periodEnd}: ${derivation.id} is derived but not labelled DERIVED`);
        require(publishedDerived.source?.ref === `derived:${derivation.id}@in-fin/1.0.0`, `${row.periodEnd}: ${derivation.id} carries no derivation reference`, publishedDerived.source);
        sameNumber(publishedDerived.value ?? null, computed, `${row.periodEnd} derived ${derivation.id}`);
        if (reportedCell !== null) {
          // The filer reported the same figure the derivation produces. That is a reconciliation, and a
          // disagreement here would be a source discrepancy worth more than either number alone.
          sameNumber(reportedCell, computed, `${row.periodEnd} ${derivation.id}: the filed figure vs the derived figure`);
          return { periodEnd: row.periodEnd, state: 'DERIVED_AND_RECONCILED_AGAINST_FILED', computed, published: publishedDerived.value, formula: derivation.note, inputs: inputProvenance };
        }
        return { periodEnd: row.periodEnd, state: 'DERIVED', computed, published: publishedDerived.value, formula: derivation.note, inputs: inputProvenance };
      }
      require(publishedReported !== undefined, `${row.periodEnd}: ${derivation.id} is computable from the filing but is published neither as reported nor as derived`);
      sameNumber(publishedReported.value ?? null, computed, `${row.periodEnd} reported ${derivation.id} vs the derivation`);
      return { periodEnd: row.periodEnd, state: 'REPORTED_AND_RECONCILED_AGAINST_DERIVATION', computed, published: publishedReported.value, formula: derivation.note, inputs: inputProvenance };
    });
    return { id: derivation.id, label: derivation.label, requires: derivation.requires, note: derivation.note, perPeriod: perPeriodState };
  });

  /* --- capital structure at the newest instant -------------------------------------- */
  const nilComponents: string[] = [];
  const nilQuotes: Record<string, string> = {};
  for (const item of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PREFERENCE_CAPITAL']) {
    const quote = declaredNil(newest, item);
    if (quote !== null) {
      nilComponents.push(item);
      nilQuotes[item] = quote;
    }
  }
  const component = (item: string): number => {
    const value = filed(newest, item);
    if (value !== null) return value;
    // A declared nil counts as zero in the aggregate AND stays a declaration in the components. Never an absence.
    require(declaredNil(newest, item) !== null, `capital structure: ${item} is neither filed nor declared nil`);
    return 0;
  };
  const lease = component('LEASE_LIABILITIES');
  const grossDebt = component('LONG_TERM_BORROWINGS') + component('SHORT_TERM_BORROWINGS') + component('CURRENT_MATURITIES_OF_LONG_TERM_DEBT') + lease;
  const cash = component('CASH_AND_CASH_EQUIVALENTS');
  const currentInvestments = component('CURRENT_INVESTMENTS');
  const cashAndInvestments = cash + currentInvestments;
  const netDebt = grossDebt - cashAndInvestments;
  const minority = component('NON_CONTROLLING_INTEREST');
  const cs = head.fundamentals.capitalStructure;
  sameNumber(cs.grossDebt.value, grossDebt, 'grossDebt');
  sameNumber(cs.cashAndInvestments.value, cashAndInvestments, 'cashAndInvestments');
  sameNumber(cs.netDebt.value, netDebt, 'netDebt');
  sameNumber(cs.minorityInterest.value, minority, 'minorityInterest');
  require(cs.leaseTreatment === 'IND_AS_116_CAPITALISED', 'lease treatment moved', cs.leaseTreatment);
  require(
    cs.associatesAndJV.presence === 'NOT_COMPUTABLE' && cs.associatesAndJV.reason === 'NOT_REPORTED',
    'associates/JV is not published as NOT_COMPUTABLE: NOT_REPORTED',
    cs.associatesAndJV,
  );
  require(
    cs.components.restrictedCash.presence === 'NOT_COMPUTABLE' && cs.components.restrictedCash.reason === 'NOT_REPORTED',
    'restricted cash is not published as NOT_COMPUTABLE: NOT_REPORTED (L-006)',
    cs.components.restrictedCash,
  );
  for (const [item, quote] of Object.entries(nilQuotes)) {
    const key = item === 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT' ? 'currentMaturities'
      : item === 'LONG_TERM_BORROWINGS' ? 'longTermBorrowings'
      : item === 'SHORT_TERM_BORROWINGS' ? 'shortTermBorrowings'
      : 'preferenceCapital';
    const published = cs.components[key];
    require(
      published?.presence === 'NIL_BY_DISCLOSURE' && published?.value === null && published?.note === quote,
      `component ${key} does not carry the filer's declaration verbatim`,
      published,
    );
  }
  const shares = cs.dilutedShares.value as number;
  sameNumber(shares, perPeriod[perPeriod.length - 1]!.recomputed.DILUTED_SHARES, 'dilutedShares');
  require(cs.dilutionProxy === true && cs.shareCountBasis === 'REPORTED_EPS', 'the dilution proxy is not disclosed (L-007)', cs);

  /* --- valuation -------------------------------------------------------------------- */
  const policy = VALUATION_POLICY.discountRate;
  const wacc = policy.value;
  const growth: number = VALUATION_POLICY.terminalGrowthDefault;
  const taxRate = policy.taxRate;
  const horizon: number = VALUATION_POLICY.forecastHorizonYears;
  // `context.series.annual` is newest-first, and a three-year mean is a floating-point sum, so the ORDER is
  // part of the arithmetic. These series are built newest-first for the same reason the engine's are.
  const newestFirst = [...rows].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  const ebitSeries = newestFirst.map((row) => (filed(row, 'PROFIT_BEFORE_TAX') as number) + (filed(row, 'FINANCE_COSTS') as number));
  const dna = newestFirst.map((row) => filed(row, 'DEPRECIATION_AND_AMORTISATION') as number);
  const capex = newestFirst.map((row) => filed(row, 'CAPITAL_EXPENDITURE') as number);
  const revenue = oldestFirst.map((row) => filed(row, 'REVENUE_FROM_OPERATIONS') as number);
  const ebit = ebitSeries;
  const baseFcff = mean(ebit.map((value, index) => value * (1 - taxRate) + dna[index]! - capex[index]!));
  // The fade is the revenue CAGR over the available history, clamped to [0, 0.2] — read from the filings, not assumed.
  const fade = clamp((revenue[revenue.length - 1]! / revenue[0]!) ** (1 / (revenue.length - 1)) - 1, 0, 0.2);
  const dcf = (rate: number, terminal: number): number => {
    let total = 0;
    for (let year = 1; year <= horizon; year += 1) {
      const progress = horizon === 1 ? 1 : (year - 1) / (horizon - 1);
      total += (baseFcff * (1 + terminal + (fade - terminal) * (1 - progress))) / (1 + rate) ** year;
    }
    total += (baseFcff * (1 + fade) * (1 + terminal)) / ((rate - terminal) * (1 + rate) ** horizon);
    return total;
  };
  const bridge = (enterpriseValue: number): number => enterpriseValue - netDebt - minority - 0 + 0;
  const ebitda = newestFirst.map((row, index) => ebitSeries[index]! + (filed(row, 'DEPRECIATION_AND_AMORTISATION') as number));
  const midCycleEbitda = mean(ebitda);
  const epsDiluted = newestFirst.map((row) => filed(row, 'EPS_DILUTED') as number);
  const normalisedEps = mean(epsDiluted);

  const methods = head.valuation.methods as any[];
  const byId = new Map(methods.map((method) => [method.methodId as string, method]));
  // The target multiples are POLICY_DEFAULT assumptions and are published in the payload. They are read from
  // there, with their basis asserted: the multiple is a published policy input, the arithmetic below is ours.
  // The multiples are policy values. They are read from the policy, and the payload's published assumption is
  // required to agree — so a policy change cannot pass unnoticed and a payload cannot carry a private multiple.
  const multipleOf = (methodId: string, policyValue: number): number => {
    const assumptions = byId.get(methodId)?.assumptions;
    require(assumptions?.multipleBasis === 'POLICY_DEFAULT', `${methodId} does not publish its multiple as POLICY_DEFAULT`, assumptions);
    sameNumber(assumptions?.targetMultiple ?? null, policyValue, `${methodId} published targetMultiple vs valuation-policy/1.0.0`);
    return policyValue;
  };
  const peMultiple = multipleOf('PE_RELATIVE', VALUATION_POLICY.multiples.PE);
  const ebitdaMultiple = multipleOf('EV_EBITDA', VALUATION_POLICY.multiples.EV_EBITDA);
  sameNumber(byId.get('PE_RELATIVE')?.assumptions?.normalisedEps ?? null, Number(normalisedEps.toFixed(4)), 'published normalisedEps');
  sameNumber(byId.get('EV_EBITDA')?.assumptions?.midCycleEbitda ?? null, Math.round(midCycleEbitda), 'published midCycleEbitda');

  const recomputedMethods: Record<string, Record<string, number>> = {
    DCF_FCFF: {
      low: bridge(dcf(wacc + 0.01, Math.max(0, growth - 0.01))) / shares,
      mid: bridge(dcf(wacc, growth)) / shares,
      high: bridge(dcf(Math.max(0.02, wacc - 0.01), growth + 0.01)) / shares,
    },
    PE_RELATIVE: {
      // A P/E on equity earnings is already per share: it does not cross the enterprise-to-equity bridge.
      low: normalisedEps * peMultiple * 0.8,
      mid: normalisedEps * peMultiple,
      high: normalisedEps * peMultiple * 1.2,
    },
    EV_EBITDA: {
      low: bridge(midCycleEbitda * ebitdaMultiple * 0.8) / shares,
      mid: bridge(midCycleEbitda * ebitdaMultiple) / shares,
      high: bridge(midCycleEbitda * ebitdaMultiple * 1.2) / shares,
    },
  };
  for (const [methodId, points] of Object.entries(recomputedMethods)) {
    const published = byId.get(methodId)?.output;
    require(published !== undefined, `head payload has no output for ${methodId}`);
    sameNumber(published?.perShareLow?.value ?? null, points.low, `${methodId} perShareLow`);
    sameNumber(published?.perShareMid?.value ?? null, points.mid, `${methodId} perShareMid`);
    sameNumber(published?.perShareHigh?.value ?? null, points.high, `${methodId} perShareHigh`);
  }
  // The assumptions the payload publishes must be the policy's, not something else.
  sameNumber(byId.get('DCF_FCFF')?.assumptions?.wacc ?? null, wacc, 'published wacc');
  sameNumber(byId.get('DCF_FCFF')?.assumptions?.taxRate ?? null, taxRate, 'published taxRate');
  sameNumber(byId.get('DCF_FCFF')?.assumptions?.baseFcff ?? null, Math.round(baseFcff), 'published baseFcff');
  require(byId.get('DCF_FCFF')?.assumptions?.horizon === horizon, 'published horizon ≠ policy horizon');
  // EV_REVENUE is withheld for want of a mandatory operating metric; PB_RELATIVE is excluded for Technology.
  const withheld = byId.get('EV_REVENUE');
  require(withheld?.output === null || withheld?.output === undefined, 'EV_REVENUE produced an output it should have withheld');
  require(withheld?.applicable === false, 'EV_REVENUE is published as applicable without its mandatory metrics', withheld?.applicable);
  require(
    typeof withheld?.notApplicableReason === 'string' && withheld.notApplicableReason.startsWith('MANDATORY_METRIC_MISSING'),
    'EV_REVENUE does not name the mandatory metrics it is missing',
    withheld?.notApplicableReason,
  );
  require(byId.get('PB_RELATIVE') === undefined || byId.get('PB_RELATIVE')?.output === null, 'PB_RELATIVE produced an output for Technology');
  const considered = (head.valuation.methodSelection.considered as any[]).map((entry) => [entry.methodId, entry.role]);
  require(
    considered.some(([methodId, role]) => methodId === 'PB_RELATIVE' && role === 'NOT_APPLICABLE'),
    'PB_RELATIVE is not published as NOT_APPLICABLE for Technology',
    considered,
  );

  const weights = new Map((head.valuation.intrinsic.weighting as any[]).map((entry) => [entry.methodId as string, entry.weight as number]));
  const blend = (point: 'low' | 'mid' | 'high'): number =>
    [...weights.entries()].reduce((total, [methodId, weight]) => total + weight * recomputedMethods[methodId]![point]!, 0);
  const intrinsic = head.valuation.intrinsic;
  sameNumber(intrinsic.perShare.low.value, blend('low'), 'intrinsic low');
  sameNumber(intrinsic.perShare.mid.value, blend('mid'), 'intrinsic mid');
  sameNumber(intrinsic.perShare.high.value, blend('high'), 'intrinsic high');
  sameNumber(intrinsic.spreadPct.value, (blend('high') - blend('low')) / blend('mid'), 'intrinsic spreadPct');
  const weightSum = [...weights.values()].reduce((sum, weight) => sum + weight, 0);
  sameNumber(weightSum, 1, 'renormalised blend weights sum');
  // WI-3 published the same three points; the authorised penalty may not re-value the company.
  sameNumber(WI3_RECORDED.intrinsicLow, intrinsic.perShare.low.value, 'intrinsic low vs WI-3');
  sameNumber(WI3_RECORDED.intrinsicMid, intrinsic.perShare.mid.value, 'intrinsic mid vs WI-3');
  sameNumber(WI3_RECORDED.intrinsicHigh, intrinsic.perShare.high.value, 'intrinsic high vs WI-3');

  /* --- margin of safety -------------------------------------------------------------- */
  const mos = head.valuation.marginOfSafety;
  const price = mos.price.value as number;
  sameNumber(price, 1180.65, 'the committed BSE close');
  require(mos.price.source?.kind === 'MARKET_PRICE', 'the price is not published as a MARKET_PRICE observation');
  sameNumber(mos.mosVsMid.value, (blend('mid') - price) / blend('mid'), 'mosVsMid');
  sameNumber(mos.mosVsLow.value, (blend('low') - price) / blend('low'), 'mosVsLow');
  require(mos.band === mosBandFor(mos.mosVsMid.value), 'margin-of-safety band disagrees with mos-policy', mos.band);
  require(mos.refusal === null, 'the margin of safety is refused at head', mos.refusal);
  sameNumber(WI3_RECORDED.mosVsMid, mos.mosVsMid.value, 'mosVsMid vs WI-3');

  /* --- confidence -------------------------------------------------------------------- */
  const confidence = head.confidence;
  const preCap = 0.6 * (confidence.dataConfidence as number) + 0.4 * (confidence.modelConfidence as number);
  const capFactor: Record<string, number> = {
    ADEQUACY_PARTIAL: 0.85,
    ADEQUACY_INSUFFICIENT: 0.6,
    STALE_DATA: 0.9,
    DILUTION_PROXY: 0.98,
    DIVIDEND_SOURCE_CONFLICT: 0.95,
    HIGH_METHOD_DISAGREEMENT: 0.85,
  };
  // Every published cap must be one of two kinds: a multiplicative factor from the table below, or a
  // POLICY_DEFAULT_* entry, which is the R-4.3 additive penalty accounted for separately. An unrecognised cap
  // stops the recomputation rather than being skipped.
  const publishedCaps = confidence.caps as string[];
  for (const cap of publishedCaps) {
    require(
      capFactor[cap] !== undefined || cap.startsWith('POLICY_DEFAULT_'),
      'confidence carries a cap this recomputation does not recognise',
      cap,
    );
  }
  // The two adequacy caps are alternatives; neither is published for this issuer (adequacy is SUFFICIENT).
  const applicable = publishedCaps.filter((cap) => capFactor[cap] !== undefined);
  require(
    applicable.length === publishedCaps.filter((cap) => cap !== 'POLICY_DEFAULT_WACC' && cap !== 'POLICY_DEFAULT_MULTIPLE').length,
    'a non-policy-default cap was not accounted for',
    publishedCaps,
  );
  const afterCaps = applicable.reduce((value, cap) => value * capFactor[cap]!, preCap);
  // R-4.3: additive by distinct assumption category, one aggregate ceiling, no floor.
  const categories = new Map<string, number>();
  for (const entry of confidence.assumptionCaps as any[]) {
    require(entry.applied === true, 'an assumption cap is published but not applied', entry);
    require(entry.basis === 'POLICY_DEFAULT', 'an applied assumption cap is not POLICY_DEFAULT', entry.basis);
    categories.set(entry.category as string, entry.penaltyRate as number);
  }
  const reduction = Math.min(0.35, [...categories.values()].reduce((sum, rate) => sum + rate, 0));
  const combined = round4(afterCaps * (1 - reduction));
  sameNumber(confidence.combined as number, combined, 'confidence.combined');
  sameNumber(reduction, IX_PUBLISHED.reduction, 'R-4.3 aggregate reduction');
  sameNumber(confidence.combined as number, IX_PUBLISHED.after, 'confidence vs the IX published value');
  require(categories.size === 2, 'expected two charged assumption categories', [...categories.keys()]);
  require(
    (confidence.assumptionCaps as any[]).flatMap((entry) => entry.triggers).length === 3,
    'expected three triggers charging two categories',
  );

  return {
    perPeriod,
    derivationCoverage,
    capitalStructure: {
      declaredNilComponents: nilComponents,
      recomputed: { grossDebt, cashAndInvestments, netDebt, minorityInterest: minority, leaseLiabilities: lease, dilutedShares: shares },
      published: {
        grossDebt: cs.grossDebt.value,
        cashAndInvestments: cs.cashAndInvestments.value,
        netDebt: cs.netDebt.value,
        minorityInterest: cs.minorityInterest.value,
        leaseLiabilities: cs.leaseLiabilities.value,
        dilutedShares: cs.dilutedShares.value,
      },
      notComputable: {
        associatesAndJV: cs.associatesAndJV,
        restrictedCash: cs.components.restrictedCash,
      },
      equityBridge: cs.equityBridge,
      associatesJVReview: cs.associatesJVReview,
    },
    valuation: {
      policyInputs: { wacc, terminalGrowth: growth, taxRate, horizon, revenueCagrFade: fade, peMultiple, ebitdaMultiple },
      recomputed: {
        baseFcff,
        baseFcffRounded: Math.round(baseFcff),
        midCycleEbitda,
        normalisedEps,
        methods: recomputedMethods,
        intrinsic: { low: blend('low'), mid: blend('mid'), high: blend('high') },
        weights: Object.fromEntries(weights),
      },
      published: {
        methods: Object.fromEntries(
          [...byId.entries()].map(([methodId, method]) => [
            methodId,
            method.output === null || method.output === undefined
              ? null
              : {
                  low: method.output.perShareLow?.value ?? null,
                  mid: method.output.perShareMid?.value ?? null,
                  high: method.output.perShareHigh?.value ?? null,
                },
          ]),
        ),
        intrinsic: {
          low: intrinsic.perShare.low.value,
          mid: intrinsic.perShare.mid.value,
          high: intrinsic.perShare.high.value,
        },
      },
      unchangedSinceWi3: true,
    },
    marginOfSafety: {
      price,
      priceAsOf: mos.priceAsOf,
      sourceRef: mos.price.source?.ref ?? null,
      recomputed: { mosVsMid: (blend('mid') - price) / blend('mid'), mosVsLow: (blend('low') - price) / blend('low') },
      published: { mosVsMid: mos.mosVsMid.value, mosVsLow: mos.mosVsLow.value, band: mos.band, refusal: mos.refusal },
    },
    confidence: {
      published: {
        dataConfidence: confidence.dataConfidence,
        modelConfidence: confidence.modelConfidence,
        caps: confidence.caps,
        combined: confidence.combined,
      },
      recomputed: {
        preCapCombination: preCap,
        afterCaps: applicable.reduce((value, cap) => value * capFactor[cap]!, preCap),
        categoriesCharged: Object.fromEntries(categories),
        aggregateReduction: reduction,
        multiplier: 1 - reduction,
        combined: combined,
      },
      note:
        'WI-3 published 0.6736 with two caps. The authorised R-4.3 penalty multiplies that by 0.65, giving 0.4378. ' +
        'The correct expression is round4(0.67356576 × 0.65); the STALE_DATA and DILUTION_PROXY factors are already inside 0.67356576.',
    },
    checks: { total: 0, failed: failures.length - checksBefore },
  };
}

/* -------------------------------------------------------------------------- 7. attributed diff */

type Change = { readonly path: string; readonly kind: string; readonly wi3: unknown; readonly head: unknown };

function walk(wi3Value: unknown, headValue: unknown, path: string, out: Change[]): void {
  if (Array.isArray(wi3Value) || Array.isArray(headValue)) {
    const left = Array.isArray(wi3Value) ? wi3Value : [];
    const right = Array.isArray(headValue) ? headValue : [];
    if (left.length !== right.length) out.push({ path, kind: 'LENGTH', wi3: left.length, head: right.length });
    for (let index = 0; index < Math.min(left.length, right.length); index += 1) walk(left[index], right[index], `${path}[${index}]`, out);
    return;
  }
  if (typeof wi3Value === 'object' && wi3Value !== null && typeof headValue === 'object' && headValue !== null) {
    const keys = new Set([...Object.keys(wi3Value), ...Object.keys(headValue)]).keys();
    for (const key of [...keys].sort()) {
      const before = (wi3Value as Record<string, unknown>)[key];
      const after = (headValue as Record<string, unknown>)[key];
      if (before === undefined) out.push({ path: `${path}.${key}`, kind: 'ADDED', wi3: null, head: after });
      else if (after === undefined) out.push({ path: `${path}.${key}`, kind: 'REMOVED', wi3: before, head: null });
      else walk(before, after, `${path}.${key}`, out);
    }
    return;
  }
  if (wi3Value !== headValue) out.push({ path, kind: 'VALUE', wi3: wi3Value, head: headValue });
}

/**
 * The closed attribution table.
 *
 * Every path the head payload moves relative to WI-3 must be explained by a merged change this work item can
 * name. A path with no attribution is an unexplained change in a real issuer's published assessment, and the
 * script refuses rather than publish it.
 */
const ATTRIBUTIONS: readonly { readonly match: RegExp; readonly cause: string; readonly evidence: string }[] = [
  {
    match: /^\$\.artifact\.generatedAt$|^\$\.asOf\.generatedAt$|^\$\.asOf\.stalenessDays$/,
    cause: 'RUN_CLOCK',
    evidence: 'this run used a later --generated-at than WI-3; stalenessDays is measured against it',
  },
  {
    match: /^\$\.subject\.identity\.bindingRef$/,
    cause: 'RUN_CLOCK + IDENTITY_LISTING_NARROWING',
    evidence:
      'the binding hashes observedAt, and a54591e (W08) narrowed the candidate listings by the observed series, symbol and exchange, so the same observation now resolves to IN:NSE:INFY:EQ:EQUITY instead of IN:BSE:500209:EQ:EQUITY',
  },
  {
    match: /^\$\.confidence\.(assumptionCaps|caps|combined|formula)$/,
    cause: 'IX_AUTHORIZED_POLICY (L-034)',
    evidence:
      '7790e48 implemented the owner-authorised R-4.3 penalty: POLICY_DEFAULT_WACC 0.20 and POLICY_DEFAULT_MULTIPLE 0.15, additive by category, one 0.35 ceiling, no floor',
  },
  {
    match: /^\$\.fundamentals\.capitalStructure\.(associatesJVReview|equityBridge)$|^\$\.valuation\.methods\[\d+\]\.output\.perShareMid\.note$/,
    cause: 'ASSOCIATES_JV_DISCLOSURE (L-036)',
    evidence:
      'VII/IX made the POLICY_ZERO substitution and the 180-day review control reader-visible on the figures they touch; WI-9 verified the control in force for this issuer',
  },
  {
    match: /^\$\.limitations(\[\d+\])?$/,
    cause: 'IX_AUTHORIZED_POLICY (L-034) + ASSOCIATES_JV_DISCLOSURE (L-036)',
    evidence:
      'three entries were INSERTED before the closing IID-2 sentence, which moved from index 4 to index 7 and is unchanged: the policy-zero disclosure, the R-4.3 penalty account and the REVIEW_DUE flag',
  },
];

function attributeDiff(wi3: unknown, head: unknown): { readonly changes: readonly Record<string, unknown>[]; readonly unattributed: readonly string[] } {
  const changes: Change[] = [];
  walk(wi3, head, '$', changes);
  const attributed: Record<string, unknown>[] = [];
  const unattributed: string[] = [];
  for (const change of changes) {
    const hit = ATTRIBUTIONS.find((entry) => entry.match.test(change.path));
    if (hit === undefined) {
      unattributed.push(`${change.kind} ${change.path}`);
      continue;
    }
    attributed.push({ ...change, cause: hit.cause, evidence: hit.evidence });
  }
  require(unattributed.length === 0, 'the head payload moved in a way this work item cannot attribute', unattributed);
  return { changes: attributed, unattributed };
}

/* -------------------------------------------------------------------------- 8. mapping census */

function mappingCensus(rows: readonly FiledRow[]): Record<string, unknown> {
  const csvColumns = Object.keys(rows[0]!.cells);
  const identityColumns = [
    'issuer_id', 'period_type', 'fiscal_year', 'period_start', 'period_end', 'statement_scope',
    'taxonomy', 'basis', 'filing_ref', 'filed_at', 'source_scale',
  ];
  const reachable = LINE_ITEM_IDS.filter((id) => csvColumns.includes(id));
  const unreachable = LINE_ITEM_IDS.filter((id) => !csvColumns.includes(id));
  const derived = new Set(DERIVATIONS.map((entry) => entry.id));
  const taggedLineItems = new Set(Object.values(XBRL_TAG_MAP));
  const columnsThatAreNotLineItems = csvColumns.filter(
    (column) => !identityColumns.includes(column) && !(LINE_ITEM_IDS as readonly string[]).includes(column),
  );
  require(columnsThatAreNotLineItems.length === 0, 'the committed CSV carries a column that is not a governed line item', columnsThatAreNotLineItems);

  // What this issuer's own filing actually supplied, and what it did not.
  const newest = [...rows].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0]!;
  const supplied = reachable.filter((id) => filed(newest, id) !== null);
  const declared = reachable.filter((id) => declaredNil(newest, id) !== null);
  const absent = reachable.filter((id) => filed(newest, id) === null && declaredNil(newest, id) === null);

  return {
    countedAtHead: {
      lineItemsInClosedVocabulary: LINE_ITEM_IDS.length,
      xbrlTagsMapped: Object.keys(XBRL_TAG_MAP).length,
      distinctLineItemsWithAnXbrlTag: taggedLineItems.size,
      derivationsInClosedSet: DERIVATIONS.length,
      derivationIds: DERIVATIONS.map((entry) => entry.id),
    },
    csvIngestPath: {
      columns: csvColumns.length,
      lineItemColumns: reachable.length,
      lineItemsNotReachableViaCsv: unreachable.length,
      notReachable: unreachable.map((id) => ({
        lineItem: id,
        statement: LINE_ITEMS[id]!.statement,
        derivable: derived.has(id),
        hasXbrlTag: taggedLineItems.has(id),
      })),
      columnsThatAreNotLineItems,
    },
    xbrlPath: {
      exercisedByThisIssuer: false,
      reason:
        'no Ind AS XBRL instance was ingested for this issuer in any bundle; the tag map is therefore unexercised on real filings and L-002 stands',
      tagsMapped: Object.keys(XBRL_TAG_MAP).length,
      lineItemsWithNoTag: LINE_ITEM_IDS.filter((id) => !taggedLineItems.has(id)).length,
    },
    thisIssuerNewestPeriod: {
      periodEnd: newest.periodEnd,
      filingRef: newest.filingRef,
      lineItemsSuppliedAsFiled: supplied.length,
      lineItemsDeclaredNil: declared.length,
      declaredNil: declared,
      lineItemsAbsentFromTheFilingRow: absent.length,
      absent: absent,
    },
  };
}

/* -------------------------------------------------------------------------- 9. dataset-class divergence (L-041) */

function datasetClassDivergence(): Record<string, unknown> {
  const bundles = [
    'REL-1-INFOSYS-2026-11-06',
    'WI2-PRICE-OBSERVATION-2026-11-06',
    'WI3-BORROWINGS-NIL-2026-11-06',
  ];
  const rows = bundles.map((bundle) => {
    const manifest = json<DatasetManifest>(join(REPO, 'evidence/real-issuer', bundle, 'dataset/manifest.json'));
    // The assessment path: the rights-evidence rule, fail-closed.
    const assessment = classifyDataset(manifest);
    // The coverage path: the report's own function, exercised through the report so nothing is transcribed here.
    const report = buildInvestmentCoverageReport({
      asOf: '2026-11-12',
      generatedAt: '2026-11-12T00:00:00.000Z',
      manifest,
      issuers: [],
      securities: [],
      periods: [],
      prices: [],
      operatingMetrics: [],
      issues: [],
      identitySourcesAvailable: false,
      identitySourceDetail: 'not loaded for this probe',
      issuerIdentityState: null,
    });
    const coverage = report.dataset.datasetClass;
    return {
      bundle,
      issuer: 'Infosys Limited (IN:CIN:L85110KA1981PLC013115)',
      provider: manifest.provider,
      licence: manifest.licence,
      sourceRightsDeclared: manifest.sourceRights !== undefined,
      assessmentPathClass: assessment,
      coveragePathClass: coverage,
      agree: assessment === coverage || (assessment === 'SYNTHETIC_REFERENCE' && coverage === 'SYNTHETIC_FIXTURE'),
    };
  });
  const disagreeing = rows.filter((row) => !row.agree);
  // L-041 is recorded as a disagreement. If one side is fixed without the other, this must fail rather than pass.
  require(
    disagreeing.length === rows.length,
    'L-041: the two dataset classifiers no longer disagree on every committed real-issuer manifest — if one side was corrected, update L-041 deliberately',
    rows.map((row) => `${row.bundle}: ${row.assessmentPathClass} vs ${row.coveragePathClass}`),
  );
  return {
    limitation: 'L-041',
    status: 'OPEN — recorded, not corrected here',
    question: 'does the investment-coverage read model classify a dataset the same way the assessment path does?',
    answer: 'no, on all three committed real-issuer manifests for this issuer',
    assessmentRule: 'fundamentals/datasetClass.ts — the declared rights evidence, fail-closed to UNKNOWN',
    coverageRule: 'coverage/investmentCoverage.ts financialClass() — a substring test on manifest.provider and manifest.licence',
    repudiation:
      'datasetClass.ts documents that exact substring test under "WHAT WAS WRONG" and removes it; investmentCoverage.ts was added later and reintroduces it',
    whyNotCorrectedHere:
      'the coverage report\'s class vocabulary is SYNTHETIC_FIXTURE | OPERATOR_SUPPLIED | NONE, and NONE drives a "no dataset is installed" UI state (InvestmentCoveragePage.tsx datasetAbsent). A fail-closed answer for "manifest present, rights unknown" needs a fourth member, which is a contract decision for the register owner, not a narrow IRR correction inside a validation work item',
    rows,
  };
}

/* -------------------------------------------------------------------------- main */

function main(argv: readonly string[]): number {
  // `main` is exported and a test drives it more than once in a single process. `failures` is a per-run premise
  // accumulator, so it is reset here: without this a second call would inherit the first call's refusals and
  // refuse for reasons that belong to a run that already finished.
  failures.length = 0;
  const args = parseArgs(argv);
  // The rebuild scratch lives in the OS temp dir, NEVER under `outDir`: `outDir` is the evidence bundle, and a
  // re-ingestion scratch dataset is not evidence — it is a means to reproduce the dataset identity. Writing it
  // under the bundle would commit a derived dataset beside the artifacts that describe it.
  const scratch = mkdtempSync(join(tmpdir(), 'riv-rebuild-'));

  const head = json<any>(args.headPayload);
  const summary = json<any>(args.headSummary);
  const wi3Payload = json<any>(join(WI3, 'artifact/assessment-payload-wi3.json'));

  const headPayloadBytes = readFileSync(args.headPayload);
  const headPayloadDigest = createHash('sha256').update(headPayloadBytes).digest('hex');
  const wi3PayloadBytes = readFileSync(join(WI3, 'artifact/assessment-payload-wi3.json'));
  const wi3PayloadDigest = createHash('sha256').update(wi3PayloadBytes).digest('hex');
  require(wi3PayloadDigest === WI3_PAYLOAD_DIGEST, 'the committed WI-3 payload no longer hashes to its recorded digest', {
    recorded: WI3_PAYLOAD_DIGEST,
    recomputed: wi3PayloadDigest,
  });
  require(
    headPayloadDigest === summary.artifact?.payloadDigest,
    'the head payload read back from the store does not hash to the digest the run recorded',
    { recomputed: headPayloadDigest, recorded: summary.artifact?.payloadDigest },
  );

  const rows = readFiledRows(join(WI3, 'ingest-input', 'periods.csv'));
  const rebuilt = rebuildDataset(scratch);
  require(rebuilt.issueCount === 0, 're-ingesting the committed real input produced issues', rebuilt.issueCount);
  require(
    rebuilt.datasetVersion === WI3_DATASET_VERSION,
    're-ingesting the committed real input at head does not reproduce WI-3 dataset identity',
    { recorded: WI3_DATASET_VERSION, recomputed: rebuilt.datasetVersion },
  );
  require(
    head.data?.datasetVersion === WI3_DATASET_VERSION,
    'the head payload was not built from the committed real dataset',
    head.data?.datasetVersion,
  );

  const recomputation = recompute(rows, head);
  const diff = attributeDiff(wi3Payload, head);
  const census = mappingCensus(rows);
  const divergence = datasetClassDivergence();

  // The analysis layer alone, on the committed real input, must agree with the persisted artifact on every
  // substantive figure. The identity members differ by construction: the persisted artifact carries the real
  // binding, and this reproduction carries the recorded one.
  const roster = json<{ issuers: IssuerRecord[]; securities: SecurityRecord[]; listings: ListingRecord[] }>(
    join(WI3, 'ingest-input', 'roster.json'),
  );
  const content = buildDatasetContent({
    datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1',
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: [],
    prices: json<{ prices: PriceRecord[] }>(join(WI3, 'ingest-input', 'prices.json')).prices,
    periodCsv: { name: 'periods.csv', text: text(join(WI3, 'ingest-input', 'periods.csv')) },
    operatingMetricsCsv: null,
    xbrlFiles: [],
  });
  const issuer = roster.issuers[0]!;
  const analysed = assessCompany({
    issuerId: ISSUER_ID,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: SECURITY_ID,
    dataset: content,
    datasetVersion: rebuilt.datasetVersion,
    contentDigest: rebuilt.datasetVersion,
    provider: 'operator-file-input',
    identity: {
      bindingRef: head.subject.identity.bindingRef,
      rosterVersion: head.subject.identity.rosterVersion,
      listingMapVersion: head.subject.identity.listingMapVersion,
      corporateActionTableVersion: head.subject.identity.corporateActionTableVersion,
    },
    generatedAt: head.asOf.generatedAt,
    knownAsOf: head.asOf.knownAsOf,
  });
  require(analysed.violations.length === 0, 'the engine reported invariant violations on the real issuer', analysed.violations);
  const analysisDigest = createHash('sha256').update(JSON.stringify(analysed.payload), 'utf8').digest('hex');
  const storedVsAnalysis: Change[] = [];
  walk(analysed.payload, head, '$', storedVsAnalysis);
  require(
    storedVsAnalysis.length === 0,
    'the persisted artifact and a fresh analysis of the same committed real input disagree',
    storedVsAnalysis.map((change) => `${change.kind} ${change.path}`),
  );

  if (failures.length > 0) refuse();

  const package_ = {
    schemaVersion: 1,
    workItem: 'representative real-issuer validation, re-executed at the current authoritative head',
    generatedBy: 'iips-platform/scripts/riv-head-revalidation.ts',
    issuer: {
      issuerId: ISSUER_ID,
      legalName: issuer.legalName,
      securityId: SECURITY_ID,
      sector: issuer.sector,
      reportingCurrency: 'INR',
      fiscalYearEnd: '03-31',
    },
    primaryEvidence: {
      input: 'evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input/periods.csv',
      inputSha256: createHash('sha256').update(text(join(WI3, 'ingest-input', 'periods.csv')), 'utf8').digest('hex'),
      note: 'transcribed from the issuer\'s own audited consolidated Ind AS filings; the printed pages are committed under WI-3/source and REL-1/ingest-input',
      periods: rows.map((row) => ({
        fiscalYear: row.fiscalYear,
        periodEnd: row.periodEnd,
        statementScope: row.scope,
        filingRef: row.filingRef,
        filedAt: row.filedAt,
        sourceScale: row.scale,
      })),
    },
    reproducibility: {
      datasetVersionRecordedByWi3: WI3_DATASET_VERSION,
      datasetVersionRecomputedAtHead: rebuilt.datasetVersion,
      reproduced: rebuilt.datasetVersion === WI3_DATASET_VERSION,
      ingestionIssues: rebuilt.issueCount,
      headPayloadDigest,
      headPayloadBytes: headPayloadBytes.length,
      wi3PayloadDigest,
      wi3PayloadBytes: wi3PayloadBytes.length,
      analysisLayerDigest: analysisDigest,
      persistedArtifactEqualsFreshAnalysis: storedVsAnalysis.length === 0,
      manifestIsNotByteReproducible: {
        fact: 'the re-ingested manifest carries sourceRights (W05) whose basis embeds the absolute input path, and the manifest is outside manifest.digestScope',
        consequence: 'dataset identity is reproducible across hosts; the manifest file is not, and is not part of the digest',
      },
    },
    recomputation,
    diffVsWi3: {
      baseline: 'evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/artifact/assessment-payload-wi3.json',
      changedPaths: diff.changes.length,
      unattributedPaths: diff.unattributed,
      changes: diff.changes,
      unchangedAndMaterial: [
        'every reported (AS_FILED) cell in all three periods',
        'all five derivations in all three periods',
        'grossDebt, cashAndInvestments, netDebt, minorityInterest, leaseLiabilities, dilutedShares',
        'all three weighted methods at all three points',
        'intrinsic low/mid/high, spreadPct and the renormalised weights',
        'the price, mosVsLow, mosVsMid, the band and the absence of a refusal',
        'adequacy SUFFICIENT, quality MATERIAL_CONCERNS, dataConfidence, modelConfidence',
        'risk evaluation: 3 applicable, 3 evaluated, 3 passed, 0 concerns, disposition PASSED',
        'dividends, moat, assumptions, evidence, completeness and the sector reference view',
      ],
      summaryFieldMoves: [
        { field: 'identity.listingId', wi3: WI3_RECORDED.listingId, head: summary.identity?.listingId, cause: 'IDENTITY_LISTING_NARROWING (a54591e, W08)' },
        { field: 'identity.bindingId', wi3: 'sha256:865fab31da57638feb2c1f5571d2f7ec4acba0ad482a00ad369b2147b37c8247', head: summary.identity?.bindingId, cause: 'RUN_CLOCK + IDENTITY_LISTING_NARROWING' },
        { field: 'dataset.datasetClass', wi3: WI3_RECORDED.datasetClass, head: summary.dataset?.datasetClass, cause: 'DATASET_CLASS_VOCABULARY (a54591e, W03/W05): APPROVED_LOCAL_INGESTION was withdrawn as a name for an approval no review produced' },
        { field: 'assessment.confidence', wi3: WI3_RECORDED.combined, head: summary.assessment?.confidence, cause: 'IX_AUTHORIZED_POLICY (L-034)' },
        { field: 'assessment.limitationCount', wi3: 5, head: summary.assessment?.limitationCount, cause: 'IX_AUTHORIZED_POLICY + ASSOCIATES_JV_DISCLOSURE' },
      ],
    },
    mappingCensus: census,
    datasetClassDivergence: divergence,
    premises: { checked: failures.length === 0, failed: failures.length },
  };

  const written: Record<string, string> = {};
  const emit = (name: string, value: unknown): void => {
    const path = join(args.outDir, name);
    mkdirSync(dirname(path), { recursive: true });
    const body = `${JSON.stringify(value, null, 2)}\n`;
    writeFileSync(path, body, 'utf8');
    written[name] = createHash('sha256').update(body, 'utf8').digest('hex');
  };
  emit('verification/independent-recomputation.json', {
    schemaVersion: 1,
    issuer: package_.issuer,
    primaryEvidence: package_.primaryEvidence,
    reproducibility: package_.reproducibility,
    recomputation: package_.recomputation,
  });
  emit('artifact/payload-diff-vs-wi3.json', { schemaVersion: 1, ...package_.diffVsWi3 });
  emit('verification/mapping-census.json', { schemaVersion: 1, ...package_.mappingCensus });
  emit('verification/dataset-class-divergence.json', { schemaVersion: 1, ...package_.datasetClassDivergence });

  // The builders return loose `Record<string, unknown>` shapes so they stay flexible; the print boundary narrows
  // them once. Every cast below is sound because control only reaches here after `refuse()` did NOT throw — i.e.
  // every premise passed, so these published figures are exactly the validated numbers the recomputation compared
  // against WI-3 and the head payload (an absent intrinsic, for instance, would have failed a `sameNumber` premise).
  const intrinsicPublished = recomputation.valuation.published as { intrinsic: { low: number; mid: number; high: number } };
  const mosPublished = recomputation.marginOfSafety.published as { mosVsMid: number; band: string };
  const confidencePublished = recomputation.confidence.published as { combined: number };
  const censusHead = census.countedAtHead as { xbrlTagsMapped: number };
  const divergenceRows = divergence.rows as readonly unknown[];

  process.stdout.write(`RIV head re-validation — PUBLISHED\n`);
  process.stdout.write(`  dataset identity   ${rebuilt.datasetVersion} (reproduced: ${rebuilt.datasetVersion === WI3_DATASET_VERSION})\n`);
  process.stdout.write(`  head payload       ${headPayloadDigest} (${headPayloadBytes.length} B)\n`);
  process.stdout.write(`  persisted == fresh analysis of the same committed input: ${storedVsAnalysis.length === 0}\n`);
  process.stdout.write(`  intrinsic          ${intrinsicPublished.intrinsic.low.toFixed(2)} / ${intrinsicPublished.intrinsic.mid.toFixed(2)} / ${intrinsicPublished.intrinsic.high.toFixed(2)} (unchanged since WI-3)\n`);
  process.stdout.write(`  margin of safety   ${mosPublished.mosVsMid} vs mid, band ${mosPublished.band}\n`);
  process.stdout.write(`  confidence         ${confidencePublished.combined} (WI-3 ${WI3_RECORDED.combined} × ${IX_PUBLISHED.multiplier})\n`);
  process.stdout.write(`  diff vs WI-3       ${diff.changes.length} changed path(s), ${diff.unattributed.length} unattributed\n`);
  process.stdout.write(`  XBRL tags mapped   ${censusHead.xbrlTagsMapped} (defect A — the L-002 notice now reads this count from XBRL_TAG_MAP; it said 20)\n`);
  process.stdout.write(`  EV basis bridge    defect C — OPEN (L-042): the EV_EBITDA/EV_REVENUE basis names only "− net debt"; the full bridge is published in capitalStructure.equityBridge. Correcting the label moves the substantive digest of every EV-publishing assessment (L-014 C1–C5, AC-L14), so it is recorded, not narrowed here\n`);
  process.stdout.write(`  L-041 (defect B)   ${divergenceRows.length} committed real-issuer manifest(s) classified two different ways — OPEN, a contract decision\n`);
  for (const [name, digest] of Object.entries(written)) process.stdout.write(`  wrote ${name} sha256:${digest}\n`);
  // The rebuild scratch is a means, not evidence; remove it. (On the `refuse()` throw path it leaks into the OS
  // temp dir, which is harmless — it is never inside the repository or the bundle.)
  rmSync(scratch, { recursive: true, force: true });
  return 0;
}

/**
 * Direct-invocation guard.
 *
 * This file defines its own `require(condition, premise, detail)` premise-helper, which SHADOWS Node's `require`.
 * So `require.main` here is a property of that helper (always `undefined`), never Node's entry-module check — the
 * guard can only be the argv comparison. That comparison resolves `process.argv[1]` against this file, so a direct
 * `tsx scripts/riv-head-revalidation.ts …` fires it and an `import { main }` (as the test does) never does. Relying
 * on `require.main === module` would have made the script exit silently and look like a pass; `main` is exported so
 * a test can drive it in-process instead.
 */
const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(__filename);

if (invokedDirectly) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

export { main };
