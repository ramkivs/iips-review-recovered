/**
 * Q-1 — NP-04 compatibility probe (throwaway database only).
 *
 * RUN:
 *   cd frontend && npm install
 *   npx tsx ../evidence/iid/Q1-NP04-COMPATIBILITY-PROBE-2026-11-05/probe.ts
 *
 * Or, without a package install, from a checkout of the pinned IPD commit
 * (2e11fa3b689d1a3674a5e4ba1f1de9a559e20494) with `src/persistence/*.ts` copied beside this file
 * and `.js` specifiers retargeted to `.ts`:
 *   node --experimental-transform-types --no-warnings probe.ts
 * That is the form in which the recorded `probe-result.json` was produced.
 *
 * Scope: prove, by execution against the PINNED NP-04 artifact
 *   iips-production-market-data @ 2e11fa3b689d1a3674a5e4ba1f1de9a559e20494
 * (module src/persistence/, compiled copy, `.js` specifiers retargeted to `.ts` for the
 * Node type-transform runtime), whether the IID design's chain-scoping mechanism is supported.
 *
 * ISOLATION: every database is created under a fresh mkdtemp directory. No pre-existing database
 * path is read, written, migrated or recreated.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { validateArtifact, validateArtifactChain } from '../../frontend/server/reports/artifact.ts';

const owner = { tenantId: 'probe-tenant', userId: 'probe-user' };
const results: Record<string, unknown> = {};
const log = (id: string, ok: boolean, detail: unknown) => {
  results[id] = { ok, detail };
};

function freshStore(tag: string) {
  const dir = mkdtempSync(join(tmpdir(), `np04probe-${tag}-`));
  const db = openDatabase({ path: join(dir, 'probe.sqlite') });
  return { store: new GovernedArtifactStore(db), dir, close: () => { db.close(); rmSync(dir, { recursive: true, force: true }); } };
}

const content = (portfolioId: string, reportType: string, params: Record<string, string>, payload: unknown, generatedAt = '2026-11-05T00:00:00.000Z') => ({
  reportType,
  portfolioId,
  scenario: null,
  parameters: params,
  canonicalPayload: JSON.stringify(payload),
  provenance: { engineOutputId: `${reportType}:${portfolioId}` },
  schemaVersion: 1,
  generatedAt,
});

/* ---------------------------------------------------------------- P-1 */
const s1 = freshStore('p1');
try {
  const tokens = [
    'co:IN:ISIN:INE009A01021',                       // company chain (colon-delimited)
    'hd:pf-7f3a/IN:ISIN:INE009A01021',               // holding chain (colon + slash)
    'icr:co:IN:ISIN:INE009A01021',                   // change-report chain
    'co:IN+ISIN+INE009A01021',                       // conservative surrogate-friendly form
    'IN:ISIN:INE002A01018',
  ];
  const accepted: Record<string, unknown> = {};
  for (const token of tokens) {
    try {
      const a = s1.store.createInstance(owner, content(token, 'investment.company-assessment', { companyId: 'x' }, { t: 1 }));
      accepted[token] = { accepted: true, reportId: a.reportId.slice(0, 8), portfolioIdRoundTrip: a.portfolioId === token, reportKey: a.reportKey.slice(0, 12) };
    } catch (e) {
      accepted[token] = { accepted: false, error: (e as Error).name, message: (e as Error).message };
    }
  }
  log('P-1 scope-token acceptance', Object.values(accepted).every((v) => (v as { accepted: boolean }).accepted), accepted);
} finally { s1.close(); }

/* ---------------------------------------------------------------- P-2 */
const s2 = freshStore('p2');
try {
  const c = content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'sha256:aaa' }, { v: 1 });
  const a = s2.store.createInstance(owner, c);
  const b = s2.store.createInstance(owner, c);           // byte-identical content, second call
  log('P-2 duplicate reportKey on createInstance', true, {
    acceptedBoth: true,
    sameReportKey: a.reportKey === b.reportKey,
    distinctReportIds: a.reportId !== b.reportId,
    distinctChains: a.chainId !== b.chainId,
    bothVersion1: a.artifactVersion === 1 && b.artifactVersion === 1,
    note: 'no dedupe/uniqueness constraint on (owner, reportKey); each call mints a new v1 chain',
  });
} finally { s2.close(); }

/* ---------------------------------------------------------------- P-3 */
const s3 = freshStore('p3');
try {
  const root = s3.store.createInstance(owner, content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'v1' }, { v: 1 }));
  const v2 = s3.store.appendVersion(owner, root.reportId, content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'v2' }, { v: 2 }, '2026-11-06T00:00:00.000Z'));
  const v3 = s3.store.appendVersion(owner, v2.reportId, content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'v3' }, { v: 3 }, '2026-11-07T00:00:00.000Z'));

  let staleAppend: unknown;
  try {
    s3.store.appendVersion(owner, root.reportId, content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'stale' }, { v: 9 }));
    staleAppend = { rejected: false };
  } catch (e) { staleAppend = { rejected: true, error: (e as Error).name }; }

  let unknownParent: unknown;
  try {
    s3.store.appendVersion(owner, 'does-not-exist', content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'x' }, { v: 1 }));
    unknownParent = { rejected: false };
  } catch (e) { unknownParent = { rejected: true, error: (e as Error).name }; }

  const chain = s3.store.listSupersededBy(owner, v3.reportId);
  log('P-3 appendVersion behaviour', true, {
    versionSequence: [root.artifactVersion, v2.artifactVersion, v3.artifactVersion],
    chainIdStable: root.chainId === v2.chainId && v2.chainId === v3.chainId,
    supersedesPointAtPrior: v2.supersedesReportId === root.reportId && v3.supersedesReportId === v2.reportId,
    staleAppend,
    unknownParent,
    listSupersededBy: { currentVersion: chain.current.artifactVersion, historyVersions: chain.versions.map((x) => x.artifactVersion) },
    priorRowUnchanged: s3.store.resolveById(owner, root.reportId).canonicalPayload === JSON.stringify({ v: 1 }),
  });
} finally { s3.close(); }

/* ---------------------------------------------------------------- P-4 */
const s4 = freshStore('p4');
try {
  const root = s4.store.createInstance(owner, content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'v1' }, { v: 1 }));
  const v2 = s4.store.appendVersion(owner, root.reportId, content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'v2' }, { v: 2 }, '2026-11-06T00:00:00.000Z'));
  const rows = s4.store.listSupersededBy(owner, v2.reportId);
  // Exactly the normalization the IRR adapter performs (`persistence.ts` toCanonicalArtifact):
  // NP-04 carries tenantId/userId at the top level; the canonical Reports shape nests `ownership`.
  const normalize = (a: ReturnType<typeof s4.store.resolveById>) => ({
    reportKey: a.reportKey, reportId: a.reportId, reportType: a.reportType, portfolioId: a.portfolioId,
    scenario: a.scenario, parameters: a.parameters, schemaVersion: a.schemaVersion,
    artifactVersion: a.artifactVersion, supersedesReportId: a.supersedesReportId,
    generatedAt: a.generatedAt, canonicalPayload: a.canonicalPayload,
    ownership: { tenantId: a.tenantId, userId: a.userId }, provenance: a.provenance,
  });
  const chainInput = [normalize(rows.current), ...rows.versions.map(normalize)];

  let single: unknown; let chainResult: unknown;
  try {
    const validated = validateArtifact(chainInput[0], { expectedOwner: owner });
    single = { accepted: true, reportKey: validated.reportKey.slice(0, 12), version: validated.artifactVersion };
  } catch (e) { single = { accepted: false, error: (e as Error).name, message: (e as Error).message }; }
  try {
    const ordered = validateArtifactChain(chainInput);
    chainResult = { accepted: true, versions: ordered.map((x) => x.artifactVersion) };
  } catch (e) { chainResult = { accepted: false, error: (e as Error).name, message: (e as Error).message }; }

  // Negative control: NP-04 rows must NOT satisfy the Reports validator if ownership is spoofed.
  let ownershipNegative: unknown;
  try {
    validateArtifact(chainInput[0], { expectedOwner: { tenantId: 'other', userId: 'other' } });
    ownershipNegative = { rejected: false };
  } catch (e) { ownershipNegative = { rejected: true, error: (e as Error).name }; }

  log('P-4 IRR artifact-chain validation over NP-04 rows', Boolean((single as { accepted: boolean }).accepted && (chainResult as { accepted: boolean }).accepted), { single, chainResult, ownershipNegative });
} finally { s4.close(); }

/* ---------------------------------------------------------------- P-5 */
const s5 = freshStore('p5');
try {
  const co = 'co:IN:ISIN:INE009A01021';
  const hd = `hd:pf-7f3a/${co}`;
  const icr = `icr:${co}`;
  const r1 = s5.store.createInstance(owner, content(co, 'investment.company-assessment', { d: '1' }, { a: 1 }));
  const r2 = s5.store.createInstance(owner, content(hd, 'investment.holding-disposition', { d: '1' }, { b: 1 }));
  const r3 = s5.store.createInstance(owner, content(icr, 'investment.change-report', { d: '1' }, { c: 1 }));
  // advance only the company chain
  const r1b = s5.store.appendVersion(owner, r1.reportId, content(co, 'investment.company-assessment', { d: '2' }, { a: 2 }, '2026-11-06T00:00:00.000Z'));

  const page = s5.store.queryByOwner(owner, { limit: 50 });
  const perChain = [r1b.reportId, r2.reportId, r3.reportId].map((id) => {
    const v = s5.store.listSupersededBy(owner, id);
    return { chainId: v.current.chainId.slice(0, 8), type: v.current.reportType, headVersion: v.current.artifactVersion, history: v.versions.length };
  });
  log('P-5 independent chains per subject', true, {
    totalArtifacts: page.items.length,
    distinctChainIds: new Set(page.items.map((i) => i.chainId)).size,
    perChain,
    isolation: perChain.map((p) => `${p.type}:v${p.headVersion}`),
  });
} finally { s5.close(); }

/* ---------------------------------------------------------------- P-6 */
const s6 = freshStore('p6');
try {
  const probes: Record<string, unknown> = {};
  const attempt = (id: string, make: () => unknown) => {
    try { make(); probes[id] = { rejected: false }; } catch (e) { probes[id] = { rejected: true, error: (e as Error).name, message: (e as Error).message }; }
  };
  attempt('empty portfolioId', () => s6.store.createInstance(owner, content('', 'investment.company-assessment', {}, { v: 1 })));
  attempt('whitespace portfolioId', () => s6.store.createInstance(owner, content('   ', 'investment.company-assessment', {}, { v: 1 })));
  attempt('empty owner', () => s6.store.createInstance({}, content('co:x', 't', {}, { v: 1 })));
  attempt('missing canonicalPayload', () => s6.store.createInstance(owner, { ...content('co:x', 't', {}, { v: 1 }), canonicalPayload: undefined as unknown as string }));
  attempt('falsy-ish parameter values', () => s6.store.createInstance(owner, content('co:neg', 't', { zero: 0, empty: '', no: false, nil: null } as unknown as Record<string, string>, { v: 0 })));

  // Content identity is store-independent and process-independent.
  const k1 = s6.store.createInstance(owner, content('co:det', 't', { a: '1', b: '2' }, { v: 1 })).reportKey;
  const s6b = freshStore('p6b');
  const k2 = s6b.store.createInstance(owner, content('co:det', 't', { b: '2', a: '1' }, { v: 1 })).reportKey;
  s6b.close();
  log('P-6 validation behaviour + content-identity determinism', true, {
    probes,
    keyDeterministicAcrossStoresAndKeyOrder: k1 === k2,
    note: 'portfolioId is TEXT NOT NULL with no format/emptiness constraint at the store; the IRR adapter supplies non-empty validation',
  });
} finally { s6.close(); }

/* ---------------------------------------------------------------- P-7 */
const s7 = freshStore('p7');
try {
  // Does an appended version with an IDENTICAL reportKey to its parent get accepted?
  const c = content('co:IN:ISIN:INE009A01021', 'investment.company-assessment', { inputDigest: 'same' }, { v: 1 });
  const root = s7.store.createInstance(owner, c);
  let sameKeyAppend: unknown;
  try {
    const v2 = s7.store.appendVersion(owner, root.reportId, { ...c, generatedAt: '2026-11-06T00:00:00.000Z' });
    sameKeyAppend = { accepted: true, sameKeyAsParent: v2.reportKey === root.reportKey, version: v2.artifactVersion };
  } catch (e) { sameKeyAppend = { accepted: false, error: (e as Error).name, message: (e as Error).message }; }
  log('P-7 append with unchanged reportKey', true, {
    sameKeyAppend,
    note: 'NP-04 does not suppress an unchanged-content append; the idempotency no-op in the IID design must therefore be enforced by the composer, not the store',
  });
} finally { s7.close(); }

/* ---------------------------------------------------------------- P-8 */
const s8 = freshStore('p8');
try {
  const co = 'co:IN:ISIN:INE009A01021';
  const root = s8.store.createInstance(owner, content(co, 'investment.company-assessment', { d: '1' }, { a: 1 }));
  // Store-level: does NP-04 itself reject a chain whose subject scope changes?
  let storeAcceptsScopeChange: unknown;
  let drifted: ReturnType<typeof s8.store.appendVersion> | null = null;
  try {
    drifted = s8.store.appendVersion(owner, root.reportId, content('co:IN:ISIN:INE040A01034', 'investment.company-assessment', { d: '2' }, { a: 2 }, '2026-11-06T00:00:00.000Z'));
    storeAcceptsScopeChange = { accepted: true, note: 'NP-04 permits the scope token to change within one chain' };
  } catch (e) { storeAcceptsScopeChange = { accepted: false, error: (e as Error).name }; }

  // IRR-side: validateArtifactChain is the enforcement point.
  let irrChainRejects: unknown;
  if (drifted) {
    const norm = (a: ReturnType<typeof s8.store.resolveById>) => ({
      reportKey: a.reportKey, reportId: a.reportId, reportType: a.reportType, portfolioId: a.portfolioId,
      scenario: a.scenario, parameters: a.parameters, schemaVersion: a.schemaVersion,
      artifactVersion: a.artifactVersion, supersedesReportId: a.supersedesReportId,
      generatedAt: a.generatedAt, canonicalPayload: a.canonicalPayload,
      ownership: { tenantId: a.tenantId, userId: a.userId }, provenance: a.provenance,
    });
    try {
      validateArtifactChain([norm(root), norm(drifted)]);
      irrChainRejects = { rejected: false };
    } catch (e) { irrChainRejects = { rejected: true, error: (e as Error).name, message: (e as Error).message }; }
  }
  log('P-8 scope-drift within a chain', true, { storeAcceptsScopeChange, irrChainRejects });
} finally { s8.close(); }

console.log(JSON.stringify(results, null, 2));
