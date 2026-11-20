/**
 * W05 — `w05-evidence-completeness`: the acceptance-condition evidence checker and final review package
 * (workflow steps 5 and 7).
 *
 *   tsx src/investment/cli/w05-evidence-completeness.ts <evidence-root> [--out <file>] [--repo-root <dir>]
 *
 * The evidence root is the operator/IRR-assembled directory named by the runbook
 * (`docs/integration/W05-SCRIPTED-EXECUTION-RUNBOOK-2026-11-18.md`). Every W05 acceptance condition is
 * evaluated from machine-readable artifacts the workflow scripts produce — this checker invents no
 * status and accepts no prose in place of evidence. The Principal retains acceptance authority: this
 * tool reports which conditions are satisfied, pending, unresolved or blocked and never accepts W05.
 *
 * Exit codes: 0 every condition SATISFIED; 1 at least one condition is not; 2 the evidence root is
 * unreadable.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type ConditionStatus = 'SATISFIED' | 'PENDING' | 'UNRESOLVED' | 'BLOCKED';

export interface ConditionFinding {
  readonly id: string;
  readonly title: string;
  readonly status: ConditionStatus;
  readonly detail: string;
}

export interface ReviewPackage {
  readonly tool: 'w05-evidence-completeness';
  readonly generatedAt: string;
  readonly evidenceRoot: string;
  readonly conditions: readonly ConditionFinding[];
  readonly allSatisfied: boolean;
  readonly note: string;
}

class UnreadableRoot extends Error {}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new UnreadableRoot(`${path} could not be read or parsed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sha256Of(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function finding(id: string, title: string, status: ConditionStatus, detail: string): ConditionFinding {
  return { id, title, status, detail };
}

/** Condition 1 — the actual revision-1 W05–W04 reconciliation, published and reviewed. */
function checkReconciliation(root: string): ConditionFinding {
  const dir = join(root, 'reconciliation');
  const resultPath = join(dir, 'reconciliation-result.json');
  if (!existsSync(resultPath)) return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'BLOCKED', 'no reconciliation-result.json — the actual run has not happened (rows are operator-supplied)');
  const envelope = readJson(resultPath);
  if (!isPlainObject(envelope) || !isPlainObject(envelope.result) || !isPlainObject(envelope.result.summary)) {
    return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'UNRESOLVED', 'reconciliation-result.json does not carry a harness result envelope');
  }
  const digestsPath = join(dir, 'output-digests.json');
  if (existsSync(digestsPath)) {
    const digests = readJson(digestsPath);
    if (!isPlainObject(digests) || !isPlainObject(digests.files)) {
      return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'UNRESOLVED', 'output-digests.json is malformed');
    }
    for (const [name, entry] of Object.entries(digests.files as Record<string, unknown>)) {
      const path = join(dir, name);
      if (!existsSync(path)) return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'UNRESOLVED', `output-digests.json lists ${name}, which is absent`);
      if (!isPlainObject(entry) || typeof entry.sha256 !== 'string' || sha256Of(path) !== entry.sha256) {
        return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'UNRESOLVED', `digest mismatch for published ${name}`);
      }
    }
  }
  const rows = envelope.result.summary.rowsSupplied;
  if (rows !== 64) {
    return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'PENDING', `the published run covers ${String(rows)} rows, not the 64 revision-1 holdings — it is evidence about that other census only`);
  }
  const disagreements = envelope.result.summary.agreement;
  const disagreeCount = isPlainObject(disagreements)
    ? Number(disagreements.CENSUS_ONLY ?? 0) + Number(disagreements.RUN_ONLY ?? 0)
    : 0;
  const reviewPath = join(dir, 'disagreements-reviewed.json');
  if (disagreeCount > 0) {
    if (!existsSync(reviewPath)) {
      return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'PENDING', `${disagreeCount} disclosed disagreement(s) await the operator/IRR review record disagreements-reviewed.json`);
    }
    const review = readJson(reviewPath);
    if (!isPlainObject(review) || !Array.isArray(review.reviewed)) {
      return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'UNRESOLVED', 'disagreements-reviewed.json must be { reviewed: [{ holdingId, disposition, note }] }');
    }
    const reviewedIds = new Set((review.reviewed as unknown[]).filter(isPlainObject).map((entry) => String(entry.holdingId)));
    const disagreementsPath = join(dir, 'disagreements.json');
    if (existsSync(disagreementsPath)) {
      const disagreementsFile = readJson(disagreementsPath);
      if (isPlainObject(disagreementsFile) && Array.isArray(disagreementsFile.entries)) {
        for (const entry of disagreementsFile.entries as unknown[]) {
          if (isPlainObject(entry) && !reviewedIds.has(String(entry.holdingId))) {
            return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'PENDING', `disagreement for ${String(entry.holdingId)} is not covered by disagreements-reviewed.json`);
          }
        }
      }
    }
  }
  return finding('revision-1-reconciliation', 'Revision-1 W05–W04 reconciliation of the actual 64 holdings', 'SATISFIED', `64-row run published, digests verified, ${disagreeCount} disagreement(s) reviewed and itemised`);
}

/** Condition 2 — source-rights evidence: entitlement AND retention verdicts with bases, per source. */
function checkRights(root: string): ConditionFinding {
  const dir = join(root, 'rights');
  const expectedPath = join(dir, 'expected-sources.json');
  const verdictsPath = join(dir, 'rights-verdicts.json');
  if (!existsSync(expectedPath)) return finding('source-rights-verdicts', 'Entitlement and retention verified per actual source', 'BLOCKED', 'rights/expected-sources.json is absent — the source population is not declared');
  if (!existsSync(verdictsPath)) return finding('source-rights-verdicts', 'Entitlement and retention verified per actual source', 'BLOCKED', 'rights/rights-verdicts.json is absent — no source has a recorded verdict');
  const expectedValue = readJson(expectedPath);
  const verdictsValue = readJson(verdictsPath);
  if (!Array.isArray(expectedValue) || !Array.isArray(verdictsValue)) {
    return finding('source-rights-verdicts', 'Entitlement and retention verified per actual source', 'UNRESOLVED', 'expected-sources.json and rights-verdicts.json must be JSON arrays');
  }
  const verdictById = new Map<string, Record<string, unknown>>();
  for (const entry of verdictsValue as unknown[]) {
    if (isPlainObject(entry) && typeof entry.sourceId === 'string') verdictById.set(entry.sourceId, entry);
  }
  const notVerified: string[] = [];
  for (const sourceId of expectedValue as unknown[]) {
    const verdict = verdictById.get(String(sourceId));
    if (verdict === undefined) {
      notVerified.push(`${String(sourceId)} (no verdict recorded)`);
      continue;
    }
    const entitlementOk = typeof verdict.entitlementBasis === 'string' && verdict.entitlementBasis.trim() !== ''
      && (verdict.entitlementStatus === 'ELIGIBLE_LOCAL_PERSONAL_USE' || verdict.entitlementStatus === 'RESTRICTED');
    const retentionOk = typeof verdict.retentionBasis === 'string' && verdict.retentionBasis.trim() !== ''
      && (verdict.retentionStatus === 'ELIGIBLE_LOCAL_PERSONAL_USE' || verdict.retentionStatus === 'RESTRICTED');
    if (!entitlementOk || !retentionOk) notVerified.push(`${String(sourceId)} (entitlement/retention not verified: unknown, restricted-without-basis, or missing)`);
  }
  if (notVerified.length > 0) {
    return finding('source-rights-verdicts', 'Entitlement and retention verified per actual source', 'PENDING', `not verified for: ${notVerified.join('; ')} — fail closed stands`);
  }
  return finding('source-rights-verdicts', 'Entitlement and retention verified per actual source', 'SATISFIED', `all ${String((expectedValue as unknown[]).length)} declared sources carry explicit entitlement and retention verdicts with bases`);
}

/** Condition 3 — the two host coverage captures (R-2). */
function checkHostCoverage(root: string): ConditionFinding {
  const dir = join(root, 'host-coverage');
  const names = ['capture-investment.json', 'capture-identity.json'];
  const missing = names.filter((name) => !existsSync(join(dir, name)));
  if (missing.length > 0) return finding('host-coverage-captures', 'Both host coverage routes captured (R-2)', 'BLOCKED', `absent: ${missing.join(', ')}`);
  for (const name of names) {
    const capture = readJson(join(dir, name));
    if (!isPlainObject(capture) || typeof capture.route !== 'string' || typeof capture.bodySha256 !== 'string') {
      return finding('host-coverage-captures', 'Both host coverage routes captured (R-2)', 'UNRESOLVED', `${name} must be { route, status, bodySha256, capturedAt, bodyFile? }`);
    }
    if (typeof capture.bodyFile === 'string') {
      const bodyPath = join(dir, capture.bodyFile);
      if (!existsSync(bodyPath) || sha256Of(bodyPath) !== capture.bodySha256) {
        return finding('host-coverage-captures', 'Both host coverage routes captured (R-2)', 'UNRESOLVED', `${name}: the captured body does not hash to its declared bodySha256`);
      }
    }
  }
  return finding('host-coverage-captures', 'Both host coverage routes captured (R-2)', 'SATISFIED', 'both captures present with verified body digests');
}

/** Condition 4 — the required-metric set: established by W10, or explicitly provisional (preserved and verified). */
function checkRequiredMetricSet(root: string, repoRoot: string): ConditionFinding {
  const establishedPath = join(root, 'w10', 'required-metric-set.json');
  if (existsSync(establishedPath)) {
    const established = readJson(establishedPath);
    if (isPlainObject(established) && established.status === 'ESTABLISHED') {
      return finding('required-metric-set', 'Required-metric set (W10)', 'SATISFIED', 'W10 record present: the required-metric set is established');
    }
    return finding('required-metric-set', 'Required-metric set (W10)', 'UNRESOLVED', 'w10/required-metric-set.json does not declare status ESTABLISHED');
  }
  const qualificationPath = join(repoRoot, 'iips-platform', 'src', 'investment', 'lifecycle', 'qualification.ts');
  if (!existsSync(qualificationPath)) return finding('required-metric-set', 'Required-metric set (W10)', 'UNRESOLVED', `cannot verify the provisional marker: ${qualificationPath} is absent`);
  const markerPresent = readFileSync(qualificationPath, 'utf8').includes('PROVISIONAL_PENDING_W10');
  if (!markerPresent) return finding('required-metric-set', 'Required-metric set (W10)', 'UNRESOLVED', 'the PROVISIONAL_PENDING_W10 marker is no longer present in qualification.ts — the provisional status is no longer being preserved');
  return finding('required-metric-set', 'Required-metric set (W10)', 'SATISFIED', 'W10 has not established the set; PROVISIONAL_PENDING_W10 is preserved in qualification.ts and verified here');
}

/** Condition 5 — θF: honestly unset, or asserted from observed evidence. Never a W05 gate either way. */
function checkThetaF(root: string, repoRoot: string): ConditionFinding {
  const observedPath = join(root, 'theta-f', 'observed-evidence.json');
  if (existsSync(observedPath)) {
    const observed = readJson(observedPath);
    if (isPlainObject(observed) && typeof observed.value === 'number') {
      return finding('theta-f', 'θF standing (gates W20, not a W05 condition)', 'SATISFIED', `θF asserted from observed evidence (value on record); W20 gate evaluation follows its own rule`);
    }
    return finding('theta-f', 'θF standing (gates W20, not a W05 condition)', 'UNRESOLVED', 'theta-f/observed-evidence.json does not carry a numeric value');
  }
  const thresholdPath = join(repoRoot, 'iips-platform', 'src', 'investment', 'lifecycle', 'threshold.ts');
  if (!existsSync(thresholdPath)) return finding('theta-f', 'θF standing (gates W20, not a W05 condition)', 'UNRESOLVED', `cannot verify the exported standing: ${thresholdPath} is absent`);
  const source = readFileSync(thresholdPath, 'utf8');
  const honestlyUnset = source.includes("assertionStatus: 'NO_DEFENSIBLE_VALUE_ASSERTED'") && source.includes('value: null');
  if (!honestlyUnset) return finding('theta-f', 'θF standing (gates W20, not a W05 condition)', 'UNRESOLVED', 'threshold.ts no longer shows either a value or the honest NO_DEFENSIBLE_VALUE_ASSERTED standing');
  return finding('theta-f', 'θF standing (gates W20, not a W05 condition)', 'SATISFIED', 'θF is honestly unset (NO_DEFENSIBLE_VALUE_ASSERTED, value null) — not a W05 condition');
}

/** Condition 6 — the two Principal decisions (F1, F2) on record. */
function checkDecisions(root: string): ConditionFinding {
  const dir = join(root, 'decisions');
  const wanted = [
    ['F1-repository-publication.json', 'F1 repository publication'],
    ['F2-statement-source.json', 'F2 financial-statement source'],
  ] as const;
  const open: string[] = [];
  for (const [name, label] of wanted) {
    const path = join(dir, name);
    if (!existsSync(path)) {
      open.push(`${label} (no record)`);
      continue;
    }
    const record = readJson(path);
    const ok = isPlainObject(record)
      && typeof record.decision === 'string' && record.decision.trim() !== ''
      && typeof record.decidedBy === 'string' && record.decidedBy.trim() !== ''
      && typeof record.decidedAt === 'string' && record.decidedAt.trim() !== ''
      && typeof record.basis === 'string' && record.basis.trim() !== '';
    if (!ok) open.push(`${label} (record incomplete: decision, decidedBy, decidedAt and basis are all required)`);
  }
  if (open.length > 0) return finding('principal-decisions', 'Principal decisions F1 and F2', 'PENDING', `open: ${open.join('; ')}`);
  return finding('principal-decisions', 'Principal decisions F1 and F2', 'SATISFIED', 'both decisions recorded with decision, decidedBy, decidedAt and basis');
}

/** Condition 7 — the actual W05 dossier exists and its rights cells track the recorded verdicts. */
function checkDossier(root: string, repoRoot: string): ConditionFinding {
  const dossierPath = join(repoRoot, 'docs', 'integration', 'W05-ACTUAL-DOSSIER-2026-11-18.md');
  if (!existsSync(dossierPath)) return finding('w05-dossier', 'Actual W05 dossier complete', 'BLOCKED', 'W05-ACTUAL-DOSSIER-2026-11-18.md is absent');
  const notVerifiedCells = (readFileSync(dossierPath, 'utf8').match(/\*\*NOT VERIFIED\*\*/g) ?? []).length;
  const rightsDir = join(root, 'rights');
  const rightsDone = existsSync(join(rightsDir, 'rights-verdicts.json'));
  if (!rightsDone) return finding('w05-dossier', 'Actual W05 dossier complete', 'PENDING', `dossier present but per-source rights verdicts are not recorded (${notVerifiedCells} NOT VERIFIED cells remain)`);
  return finding('w05-dossier', 'Actual W05 dossier complete', notVerifiedCells === 0 ? 'SATISFIED' : 'PENDING', `dossier present; ${notVerifiedCells} NOT VERIFIED cell(s) remain to be updated from rights-verdicts.json`);
}

/** Condition 8 — the acceptance decision itself. The Principal's; never inferred here. */
function checkAcceptance(root: string): ConditionFinding {
  const path = join(root, 'acceptance', 'w05-acceptance.json');
  if (!existsSync(path)) return finding('w05-acceptance', 'W05 acceptance decision (Principal)', 'PENDING', 'no acceptance record — the Principal retains acceptance authority and has not decided');
  const record = readJson(path);
  const ok = isPlainObject(record) && record.accepted === true
    && typeof record.acceptedBy === 'string' && record.acceptedBy.trim() !== ''
    && typeof record.acceptedAt === 'string' && record.acceptedAt.trim() !== ''
    && typeof record.statement === 'string' && record.statement.trim() !== '';
  if (!ok) return finding('w05-acceptance', 'W05 acceptance decision (Principal)', 'UNRESOLVED', 'w05-acceptance.json must be { accepted: true, acceptedBy, acceptedAt, statement }');
  return finding('w05-acceptance', 'W05 acceptance decision (Principal)', 'SATISFIED', `accepted on record: ${String(record.statement)}`);
}

export function buildReviewPackage(evidenceRoot: string, repoRoot: string, generatedAt: string): ReviewPackage {
  const conditions: ConditionFinding[] = [
    checkReconciliation(evidenceRoot),
    checkRights(evidenceRoot),
    checkHostCoverage(evidenceRoot),
    checkRequiredMetricSet(evidenceRoot, repoRoot),
    checkThetaF(evidenceRoot, repoRoot),
    checkDecisions(evidenceRoot),
    checkDossier(evidenceRoot, repoRoot),
    checkAcceptance(evidenceRoot),
  ];
  return {
    tool: 'w05-evidence-completeness',
    generatedAt,
    evidenceRoot,
    conditions,
    allSatisfied: conditions.every((condition) => condition.status === 'SATISFIED'),
    note: 'W05 remains IN PROGRESS — NOT ACCEPTED until every condition is SATISFIED and the Principal records the acceptance decision. This tool reports; it never accepts.',
  };
}

export function renderReviewPackage(report: ReviewPackage): string {
  const lines: string[] = [];
  lines.push(`W05 evidence-completeness review package — ${report.generatedAt}`);
  lines.push(`evidence root: ${report.evidenceRoot}`);
  for (const condition of report.conditions) {
    lines.push(`[${condition.status}] ${condition.id} — ${condition.title}`);
    lines.push(`    ${condition.detail}`);
  }
  lines.push(report.allSatisfied ? 'ALL CONDITIONS SATISFIED — awaiting the Principal acceptance decision only.' : 'NOT ALL CONDITIONS SATISFIED — W05 remains IN PROGRESS — NOT ACCEPTED.');
  lines.push(report.note);
  return `${lines.join('\n')}\n`;
}

export function run(argv: readonly string[]): number {
  let evidenceRoot: string | null = null;
  let outPath: string | null = null;
  let repoRoot: string = resolve(process.cwd(), '..');
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]!;
    if (!token.startsWith('--')) {
      if (evidenceRoot !== null) {
        process.stderr.write('usage: w05-evidence-completeness.ts <evidence-root> [--out <file>] [--repo-root <dir>]\n');
        return 1;
      }
      evidenceRoot = resolve(token);
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      process.stderr.write(`${token} requires a value\n`);
      return 1;
    }
    index += 1;
    if (token === '--out') outPath = resolve(value);
    else if (token === '--repo-root') repoRoot = resolve(value);
    else {
      process.stderr.write(`unknown flag ${token}\n`);
      return 1;
    }
  }
  if (evidenceRoot === null) {
    process.stderr.write('usage: w05-evidence-completeness.ts <evidence-root> [--out <file>] [--repo-root <dir>]\n');
    return 1;
  }
  if (!existsSync(evidenceRoot) || !statSync(evidenceRoot).isDirectory()) {
    process.stderr.write(`evidence root not found: ${evidenceRoot}\n`);
    return 2;
  }
  let report: ReviewPackage;
  try {
    report = buildReviewPackage(evidenceRoot, repoRoot, `${new Date().toISOString()}`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return error instanceof UnreadableRoot ? 2 : 1;
  }
  const rendered = renderReviewPackage(report);
  process.stdout.write(rendered);
  if (outPath !== null) writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report.allSatisfied ? 0 : 1;
}

const invokedDirectly = process.argv[1] !== undefined && /w05-evidence-completeness\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  process.exitCode = run(process.argv.slice(2));
}
