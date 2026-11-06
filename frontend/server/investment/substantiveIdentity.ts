/**
 * IID-5 — substantive identity (the L-014 decision, implemented).
 *
 * TWO IDENTITIES, TWO JOBS. `payloadDigest` is SHA-256 over the COMPLETE stored canonical payload and stays
 * that way: it is the integrity digest, recomputable from the stored bytes alone, and narrowing it would
 * trade a real tamper-detection guarantee for a smaller history. Version identity is a different job, and
 * this module implements it:
 *
 *   substantiveDigest = sha256(canonicalize(substantiveProjection(payload)))
 *
 * The projection deletes a CLOSED, ENUMERATED set of members that are pure functions of the execution clock
 * (decision §3.4), and keeps everything else — including `asOf.staleBeyondPolicy`, which is a policy verdict
 * that changes quality, confidence and the disposition gates, and which therefore must keep minting versions.
 *
 * WHY THERE IS AN EXCLUSION TEST RATHER THAN A LIST OF CONVENIENT FIELDS. A member may be excluded only if
 * (E-1) it is derivable from the execution timestamp and/or members that remain, (E-2) no consumer treats it
 * as semantics, and (E-3) it is enumerated in a versioned grammar. E-2 is what keeps `staleBeyondPolicy` in.
 * The grammar id is recorded with every version written under it, so a later change of the exclusion set is a
 * new grammar rather than a silent reinterpretation of stored history.
 *
 * THE INVENTORY (O-9). Payload evolution is the real risk: a phase that adds a clock-derived member would
 * silently reintroduce the defect. `assertPayloadInventory` therefore pins the member set the grammar
 * understands and fails closed on an unlisted member. `OPEN` nodes are declared deliberately: they are
 * data-keyed maps (period value maps keyed by line-item id) whose member names come from the dataset contract,
 * never from the clock. That residue is stated in the module rather than hidden.
 *
 * NOTHING HERE READS A CLOCK. `generatedAt` is always the caller's, and this module never consults a store.
 */
import { createHash } from 'node:crypto';

import { canonicalizePayload } from '../reports/canonical.js';
import { ReportValidationError } from '../reports/artifact.js';

/** Grammar for `investment.company-assessment` (decision §3.4). */
export const ASSESSMENT_SUBSTANTIVE_GRAMMAR = 'assessment-substantive-identity/1' as const;
/** Grammar for `investment.holding-disposition` (decision §3.4). */
export const DISPOSITION_SUBSTANTIVE_GRAMMAR = 'disposition-substantive-identity/1' as const;

/**
 * Version of the exclusion RULE itself, independent of the per-report grammar string.
 *
 * The rule is E-1/E-2/E-3. A change of the rule — not just of a grammar's member list — is a change of this
 * version, and is recorded alongside the grammar so an auditor can tell "the list changed" from "the policy
 * changed".
 */
export const SUBSTANTIVE_IDENTITY_POLICY = 'substantive-identity-policy/1.0.0' as const;

/** Provenance members every IID-5 version records. Names are fixed here to stop drift. */
export const PROVENANCE_SUBSTANTIVE_DIGEST = 'substantiveDigest' as const;
export const PROVENANCE_SUBSTANTIVE_INPUT_DIGEST = 'substantiveInputDigest' as const;
export const PROVENANCE_SUBSTANTIVE_GRAMMAR = 'substantiveIdentityGrammar' as const;
export const PROVENANCE_SUBSTANTIVE_POLICY = 'substantiveIdentityPolicy' as const;

export type SubstantiveReportType =
  | 'investment.company-assessment'
  | 'investment.holding-disposition';

/**
 * The closed exclusion sets, as member paths.
 *
 * A path is a tuple of member names. `null` as the final element means "delete this member only when it is
 * non-null", which is how `review.nextReviewOn` is specified: a null next-review date is the same fact as an
 * absent one, and deleting it unconditionally would make two spellings of "no review scheduled" equal without
 * saying so.
 */
export type MemberPath = readonly (string | null)[];

export const ASSESSMENT_EXCLUDED_MEMBERS: readonly MemberPath[] = Object.freeze([
  Object.freeze(['artifact', 'generatedAt']),
  Object.freeze(['asOf', 'generatedAt']),
  Object.freeze(['asOf', 'stalenessDays']),
  Object.freeze(['subject', 'identity', 'bindingRef']),
] as const);

export const DISPOSITION_EXCLUDED_MEMBERS: readonly MemberPath[] = Object.freeze([
  Object.freeze(['artifact', 'generatedAt']),
  Object.freeze(['companyAssessmentRef', 'generatedAt']),
  Object.freeze(['review', 'nextReviewOn', null]),
] as const);

/** Grammar id for a report type. An unknown report type is refused, never defaulted. */
export function substantiveGrammarFor(reportType: unknown): string {
  if (reportType === 'investment.company-assessment') return ASSESSMENT_SUBSTANTIVE_GRAMMAR;
  if (reportType === 'investment.holding-disposition') return DISPOSITION_SUBSTANTIVE_GRAMMAR;
  throw new ReportValidationError('report type has no substantive identity grammar', { reportType });
}

export function excludedMembersFor(reportType: unknown): readonly MemberPath[] {
  if (reportType === 'investment.company-assessment') return ASSESSMENT_EXCLUDED_MEMBERS;
  if (reportType === 'investment.holding-disposition') return DISPOSITION_EXCLUDED_MEMBERS;
  throw new ReportValidationError('report type has no substantive identity grammar', { reportType });
}

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Delete one enumerated member from a deep copy of `payload`.
 *
 * Deletion, never nulling: an absent member must not become a member whose value is `null`.
 */
function deleteMember(target: unknown, path: MemberPath): void {
  const conditional = path.length > 0 && path[path.length - 1] === null;
  const segments = (conditional ? path.slice(0, -1) : path) as readonly string[];
  if (segments.length === 0) throw new ReportValidationError('exclusion path is malformed', { path });
  let node: unknown = target;
  for (let index = 0; index < segments.length; index += 1) {
    const key = segments[index]!;
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
    const record = node as Record<string, unknown>;
    if (index === segments.length - 1) {
      // A conditional exclusion applies to the member's VALUE, exactly as the grammar's table states
      // ("`review.nextReviewOn` — when non-null"): a scheduled review date is `f(t_exec, horizon)`, so it is
      // clock-derived metadata and is deleted; a `null` carries no information and is retained as a null.
      //
      // This asymmetry is the decision's, not an optimisation. The alternative — deleting the member in every
      // form — would widen the closed exclusion list beyond §3.4 and change every stored disposition's
      // substantive digest, which is exactly what the register forbids.
      if (conditional && (record[key] === null || record[key] === undefined)) return;
      delete record[key];
      return;
    }
    node = record[key];
  }
}

/**
 * The substantive projection: the canonical payload with the grammar's excluded members deleted.
 *
 * Returns a fresh structure; the caller's payload is never mutated (an identity function that edited its
 * input would be a mutation bug waiting to happen at a call site that reuses the payload).
 */
export function substantiveProjection(reportType: unknown, payload: unknown): unknown {
  const exclusions = excludedMembersFor(reportType);
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ReportValidationError('a substantive projection requires a payload object', {
      reportType,
      received: payload === null ? 'null' : typeof payload,
    });
  }
  const projection = JSON.parse(JSON.stringify(payload ?? null)) as unknown;
  for (const path of exclusions) deleteMember(projection, path);
  return projection;
}

/** Canonical TEXT of the substantive projection. Canonicalized by the existing canonicalizer, reused. */
export function substantiveProjectionText(reportType: unknown, payload: unknown): string {
  return canonicalizePayload(substantiveProjection(reportType, payload));
}

/**
 * The substantive digest of a payload, computed from the payload structure.
 *
 * This is the write-time form: composition has the parsed payload and records the result in provenance.
 */
export function substantiveDigestOfPayload(reportType: unknown, payload: unknown): string {
  return sha256Hex(substantiveProjectionText(reportType, payload));
}

/**
 * The substantive digest of STORED canonical payload text.
 *
 * This is the read-time form, and it is the one O-6 is about: the digest is recomputed from the bytes the
 * store actually holds, never trusted as a recorded field.
 */
export function substantiveDigestOfCanonical(reportType: unknown, canonicalPayload: string): string {
  if (typeof canonicalPayload !== 'string' || canonicalPayload.length === 0) {
    throw new ReportValidationError('canonicalPayload must be a non-empty string', {});
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(canonicalPayload);
  } catch {
    throw new ReportValidationError('canonicalPayload is not valid JSON', {});
  }
  return substantiveDigestOfPayload(reportType, parsed);
}

/* ------------------------------------------------------------------ input identity (O-4 / O-5) -------- */

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ReportValidationError(`${field} must be a non-empty string`, { field });
  }
  return value;
}

function optionalString(value: unknown, field: string): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') throw new ReportValidationError(`${field} must be a string`, { field });
  return value;
}

/**
 * The assessment's substantive identity, as a caller needs it to cite in a disposition (O-5).
 *
 * One function so a call site cannot pair a digest with the wrong grammar or forget the input identity: the three
 * values are always produced together, from the same payload.
 */
export function assessmentSubstantiveIdentity(payload: unknown): {
  readonly substantiveDigest: string;
  readonly substantiveInputDigest: string;
  readonly substantiveIdentityGrammar: string;
  readonly substantiveIdentityPolicy: string;
} {
  return {
    substantiveDigest: substantiveDigestOfPayload('investment.company-assessment', payload),
    substantiveInputDigest: assessmentSubstantiveInputDigest(payload),
    substantiveIdentityGrammar: ASSESSMENT_SUBSTANTIVE_GRAMMAR,
    substantiveIdentityPolicy: SUBSTANTIVE_IDENTITY_POLICY,
  };
}

/**
 * The substantive INPUT members of an assessment.
 *
 * O-4: built from members the payload already retains — dataset identity and content digest, knowledge
 * cutoff, identity-mapping versions, model and policy versions, statement scope, currency, fiscal year end
 * and subject identity. The frozen IID-2 engine is not consulted, re-run or modified, and its `inputDigest`
 * keeps travelling unchanged as engine provenance.
 *
 * Why this exists at all: the engine's `inputDigest` digests `generatedAt` (it is one of the engine's inputs),
 * so a clock-only re-run moves it. An input identity that moves with the clock cannot answer "did the inputs
 * change?" — which is exactly what `INPUT_CHANGED_CONTENT_IDENTICAL` is supposed to mean.
 */
export function assessmentSubstantiveInputMembers(payload: unknown): readonly string[] {
  const p = payload as Record<string, any>;
  const artifact = p?.artifact ?? {};
  const subject = p?.subject ?? {};
  const identity = subject.identity ?? {};
  const data = p?.data ?? {};
  const series = data.series ?? {};
  const asOf = p?.asOf ?? {};
  const assumptions = p?.assumptions ?? {};
  return Object.freeze([
    `issuer:${asString(subject.issuerId, 'subject.issuerId')}`,
    `sector:${optionalString(subject.sector, 'subject.sector')}`,
    `subsegment:${optionalString(subject.sectorSubsegment, 'subject.sectorSubsegment')}`,
    `currency:${optionalString(subject.reportingCurrency, 'subject.reportingCurrency')}`,
    `fye:${optionalString(subject.fiscalYearEnd, 'subject.fiscalYearEnd')}`,
    `roster:${optionalString(identity.rosterVersion, 'subject.identity.rosterVersion')}`,
    `listingMap:${optionalString(identity.listingMapVersion, 'subject.identity.listingMapVersion')}`,
    `corporateActions:${optionalString(identity.corporateActionTableVersion, 'subject.identity.corporateActionTableVersion')}`,
    `dataset:${asString(data.datasetVersion, 'data.datasetVersion')}`,
    `dataContent:${asString(data.contentDigest, 'data.contentDigest')}`,
    `provider:${optionalString(data.provider, 'data.provider')}`,
    `statementScope:${optionalString(series.statementScope, 'data.series.statementScope')}`,
    `statementScopeSubstituted:${String(series.scopeSubstitution === true)}`,
    `dataAsOf:${optionalString(asOf.dataAsOf, 'asOf.dataAsOf')}`,
    `knownAsOf:${optionalString(asOf.knownAsOf, 'asOf.knownAsOf')}`,
    `model:${asString(artifact.modelVersion, 'artifact.modelVersion')}`,
    `policy:${asString(artifact.policyVersion, 'artifact.policyVersion')}`,
    `assumptionPolicy:${optionalString(assumptions.policyVersion, 'assumptions.policyVersion')}`,
    `schema:${String(p?.schemaVersion ?? '')}`,
  ]);
}

/** Digest of the assessment input members. Bare lowercase hex, the same form as `substantiveDigest`. */
export function assessmentSubstantiveInputDigest(payload: unknown): string {
  return sha256Hex(canonicalizePayload({ members: [...assessmentSubstantiveInputMembers(payload)] }));
}

/**
 * The substantive INPUT members of a disposition (O-5).
 *
 * The referenced assessment enters through its SUBSTANTIVE digests, never through the engine's clock-tainted
 * `inputDigest`. That is the whole point: IID-4's disposition input digest moved when the assessment was
 * re-composed at a new clock with an identical dataset, which made an unchanged disposition look like it had
 * new inputs.
 */
export function dispositionSubstantiveInputMembers(input: {
  readonly payload: unknown;
  readonly assessmentSubstantiveDigest: string;
  readonly assessmentSubstantiveInputDigest: string;
  readonly assessmentArtifactVersion: number;
}): readonly string[] {
  const payload = input.payload as Record<string, any>;
  const subject = payload?.subject ?? {};
  const subjectKey =
    subject.kind === 'HELD'
      ? `HELD|${optionalString(subject.positionKey, 'subject.positionKey')}|${optionalString(subject.heldAsOf, 'subject.heldAsOf')}`
      : `CANDIDATE|${optionalString(subject.contextPortfolioId, 'subject.contextPortfolioId') || 'none'}|${optionalString(subject.origin, 'subject.origin')}`;
  const limits = payload?.limits ?? {};
  const context = payload?.portfolioContext ?? null;
  const disposition = payload?.disposition ?? {};
  return Object.freeze([
    subjectKey,
    `issuer:${asString(subject.issuerId, 'subject.issuerId')}`,
    `security:${asString(subject.securityId, 'subject.securityId')}`,
    `assessmentSubstantive:${asString(input.assessmentSubstantiveDigest, 'assessmentSubstantiveDigest')}`,
    `assessmentSubstantiveInput:${asString(input.assessmentSubstantiveInputDigest, 'assessmentSubstantiveInputDigest')}`,
    `assessmentVersion:${String(input.assessmentArtifactVersion)}`,
    `limitsPolicy:${optionalString(limits.policyVersion, 'limits.policyVersion')}`,
    `limitsDigest:${optionalString(limits.digest, 'limits.digest')}`,
    `portfolio:${context === null ? 'no-portfolio' : `portfolio-rev:${String(context.portfolioRevision)}`}`,
    `dispositionPolicy:${optionalString(disposition.policyVersion, 'disposition.policyVersion')}`,
  ]);
}

/** Digest of the disposition input members. Bare lowercase hex. */
export function dispositionSubstantiveInputDigest(input: {
  readonly payload: unknown;
  readonly assessmentSubstantiveDigest: string;
  readonly assessmentSubstantiveInputDigest: string;
  readonly assessmentArtifactVersion: number;
}): string {
  return sha256Hex(canonicalizePayload({ members: [...dispositionSubstantiveInputMembers(input)] }));
}

/* ------------------------------------------------------------------ inventory (O-9) ------------------ */

/**
 * A member inventory node.
 *
 *   object  — a closed member map: an unlisted member is a failure
 *   array   — a list whose items are validated against `items`
 *   scalar  — any JSON scalar (string, number, boolean, null)
 *   open    — a declared-open subtree (data-keyed maps); stated as a residue, never a silent escape hatch
 */
export type InventoryNode =
  | { readonly kind: 'object'; readonly members: Readonly<Record<string, InventoryNode>> }
  | { readonly kind: 'array'; readonly items: InventoryNode }
  | { readonly kind: 'scalar' }
  | { readonly kind: 'open' };

const SCALAR: InventoryNode = Object.freeze({ kind: 'scalar' as const });
const OPEN: InventoryNode = Object.freeze({ kind: 'open' as const });
const object = (members: Readonly<Record<string, InventoryNode>>): InventoryNode =>
  Object.freeze({ kind: 'object' as const, members: Object.freeze(members) });
const array = (items: InventoryNode): InventoryNode => Object.freeze({ kind: 'array' as const, items });

/**
 * Closed inventory of `investment.company-assessment` schemaVersion 1 (engine `assessment-engine/1.0.0`).
 *
 * Every level the engine emits a fixed member set is enumerated. `open` appears only inside period/value maps
 * keyed by line-item id and inside method-result assumption blocks, where member names come from the dataset
 * and method contracts rather than from anything this repository computes per assessment.
 */
export const ASSESSMENT_MEMBER_INVENTORY: InventoryNode = object({
  schemaVersion: SCALAR,
  artifact: object({
    kind: SCALAR,
    subjectScope: SCALAR,
    modelVersion: SCALAR,
    policyVersion: SCALAR,
    generatedAt: SCALAR,
  }),
  subject: object({
    issuerId: SCALAR,
    legalName: SCALAR,
    sector: SCALAR,
    sectorSubsegment: SCALAR,
    reportingCurrency: SCALAR,
    fiscalYearEnd: SCALAR,
    identity: object({
      bindingRef: SCALAR,
      rosterVersion: SCALAR,
      listingMapVersion: SCALAR,
      corporateActionTableVersion: SCALAR,
    }),
  }),
  asOf: object({
    generatedAt: SCALAR,
    dataAsOf: SCALAR,
    knownAsOf: SCALAR,
    stalenessDays: SCALAR,
    staleBeyondPolicy: SCALAR,
  }),
  data: object({
    datasetVersion: SCALAR,
    contentDigest: SCALAR,
    provider: SCALAR,
    series: object({
      statementScope: SCALAR,
      scopeSubstitution: SCALAR,
      annualPeriods: SCALAR,
      quarterlyPeriods: SCALAR,
      excludedForScope: array(SCALAR),
    }),
    restatements: array(
      object({
        periodEnd: SCALAR,
        field: SCALAR,
        asFiled: OPEN,
        restated: OPEN,
      }),
    ),
  }),
  fundamentals: object({
    annual: array(OPEN),
    quarterly: array(OPEN),
    ttm: OPEN,
    trends: OPEN,
    capitalStructure: OPEN,
  }),
  valuation: object({
    methods: array(OPEN),
    methodSelection: OPEN,
    intrinsic: OPEN,
    marginOfSafety: OPEN,
    sensitivity: OPEN,
  }),
  moat: object({ classification: SCALAR, roicWaccSpread: OPEN, evidence: array(OPEN), withheld: OPEN }),
  dividends: OPEN,
  risk: object({
    aggregate: OPEN,
    factors: array(OPEN),
    /**
     * D-3 — the per-dimension outcomes. Enumerated rather than `OPEN`, because this is a fixed member set the
     * engine emits per assessment: a new dimension member is a contract change and must fail closed here first.
     */
    evaluation: object({
      dimensions: array(
        object({
          dimensionId: SCALAR,
          category: SCALAR,
          status: SCALAR,
          measurement: OPEN,
          threshold: SCALAR,
          factorId: SCALAR,
          unavailableInputs: array(SCALAR),
          statement: SCALAR,
        }),
      ),
      counts: object({
        applicable: SCALAR,
        evaluated: SCALAR,
        passed: SCALAR,
        concerns: SCALAR,
        notEvaluable: SCALAR,
        notApplicable: SCALAR,
      }),
      completeness: SCALAR,
      disposition: SCALAR,
      note: SCALAR,
    }),
  }),
  /**
   * `L-034` — the policy-default cap declaration.
   *
   * Enumerated rather than folded into `caps: OPEN`, because the distinction the block exists for is exactly the one
   * `caps` cannot express: `caps` lists the penalties that were applied, and this member names caps that are
   * *required by the design and not applied*, with the reason and the triggering methods. A declaration is a
   * semantic member — a payload that carries it says something a payload without it does not — so it belongs inside
   * substantive identity (E-2) and is pinned here, per AC-L14.10. Adding it is the grammar decision that test asks
   * for; see the register's §17.5 note recording the evolution and the digests it moved.
   */
  confidence: object({
    combined: SCALAR,
    caps: OPEN,
    assumptionCaps: array(
      object({
        cap: SCALAR,
        basis: SCALAR,
        /** `L-034` (authorized 2026-11-06): the distinct assumption category the additive penalty is charged to. */
        category: SCALAR,
        applied: SCALAR,
        /** Retained: no single factor is applied under the additive-category policy. */
        factor: OPEN,
        /** This category's additive contribution, before the aggregate ceiling. */
        penaltyRate: OPEN,
        triggers: array(object({ methodId: SCALAR, assumption: SCALAR })),
        reason: OPEN,
      }),
    ),
    dataConfidence: OPEN,
    modelConfidence: OPEN,
    formula: OPEN,
  }),
  completeness: object({
    adequacy: SCALAR,
    adequacyBasis: OPEN,
    missingFields: OPEN,
    requiredFieldCoveragePct: SCALAR,
    statementCoverage: OPEN,
  }),
  quality: object({ flags: array(OPEN), verdict: SCALAR }),
  assumptions: object({
    discountRate: OPEN,
    terminalGrowth: OPEN,
    forecastHorizonYears: SCALAR,
    methodSpecific: array(OPEN),
    policyVersion: SCALAR,
  }),
  evidence: array(OPEN),
  limitations: array(SCALAR),
  sectorReferenceView: object({
    evidenceClass: SCALAR,
    sectorRefId: SCALAR,
    engineVerdict: SCALAR,
    composite: SCALAR,
    note: SCALAR,
  }),
  disclosure: object({ decisionSupportOnly: SCALAR, noTradeExecution: SCALAR, nonProduction: SCALAR }),
});

/** Closed inventory of `investment.holding-disposition` schemaVersion 1. */
export const DISPOSITION_MEMBER_INVENTORY: InventoryNode = object({
  schemaVersion: SCALAR,
  artifact: object({
    kind: SCALAR,
    subjectScope: SCALAR,
    modelVersion: SCALAR,
    policyVersion: SCALAR,
    generatedAt: SCALAR,
  }),
  subject: OPEN,
  companyAssessmentRef: object({
    reportId: SCALAR,
    reportKey: SCALAR,
    artifactVersion: SCALAR,
    generatedAt: SCALAR,
    modelVersion: SCALAR,
    policyVersion: SCALAR,
    adequacy: SCALAR,
    qualityVerdict: SCALAR,
    moatClassification: SCALAR,
    datasetClass: SCALAR,
    datasetVersion: SCALAR,
    dataAsOf: SCALAR,
    knownAsOf: SCALAR,
    contentDigest: SCALAR,
  }),
  portfolioContext: OPEN,
  disposition: OPEN,
  interpretation: OPEN,
  limits: OPEN,
  rationale: array(OPEN),
  falsifiers: array(OPEN),
  portfolioImplication: OPEN,
  review: OPEN,
  evidence: array(OPEN),
  limitations: array(SCALAR),
  disclosure: object({ decisionSupportOnly: SCALAR, noTradeExecution: SCALAR, nonProduction: SCALAR }),
});

export function memberInventoryFor(reportType: unknown): InventoryNode {
  if (reportType === 'investment.company-assessment') return ASSESSMENT_MEMBER_INVENTORY;
  if (reportType === 'investment.holding-disposition') return DISPOSITION_MEMBER_INVENTORY;
  throw new ReportValidationError('report type has no member inventory', { reportType });
}

function walkInventory(value: unknown, node: InventoryNode, path: string, unknown: string[]): void {
  if (node.kind === 'open') return;
  if (node.kind === 'scalar') {
    const type = typeof value;
    if (value === null || type === 'string' || type === 'number' || type === 'boolean') return;
    unknown.push(`${path} (expected a scalar)`);
    return;
  }
  if (node.kind === 'array') {
    if (!Array.isArray(value)) {
      // A declared array that is absent is not a payload-evolution event; a non-array value is.
      if (value !== null && value !== undefined) unknown.push(`${path} (expected an array)`);
      return;
    }
    value.forEach((item, index) => walkInventory(item, node.items, `${path}[${index}]`, unknown));
    return;
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    unknown.push(`${path} (expected an object)`);
    return;
  }
  for (const [key, member] of Object.entries(value as Record<string, unknown>)) {
    const child = node.members[key];
    if (child === undefined) {
      unknown.push(`${path}.${key}`);
      continue;
    }
    walkInventory(member, child, `${path}.${key}`, unknown);
  }
}

/**
 * O-9: refuse a payload whose member set the grammar does not understand.
 *
 * The failure names every unlisted member, so the fix is "decide the grammar for this member", not "widen a
 * pattern". This is what stops a later phase from adding a clock-derived member that would silently make
 * every re-run a new version again.
 */
export function assertPayloadInventory(reportType: unknown, payload: unknown): void {
  const unknown: string[] = [];
  walkInventory(payload, memberInventoryFor(reportType), '$', unknown);
  if (unknown.length > 0) {
    const members = unknown.sort();
    throw new ReportValidationError(
      `payload contains members the substantive-identity grammar does not understand: ${members.slice(0, 5).join(', ')}${members.length > 5 ? ` (+${members.length - 5} more)` : ''}`,
      { reportType, members },
    );
  }
}

/** Structural self-check used by tests: an empty inventory entry is a mistake, not a policy. */
export function inventoryMemberCount(node: InventoryNode = ASSESSMENT_MEMBER_INVENTORY): number {
  if (node.kind === 'object') {
    return Object.values(node.members).reduce((total, child) => total + inventoryMemberCount(child), 0);
  }
  if (node.kind === 'array') return inventoryMemberCount(node.items);
  return 1;
}
