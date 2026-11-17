/**
 * W05 — AUTHORIZATION RECORDS A RIGHTS DECLARATION MAY CITE.
 *
 * WHY THIS EXISTS. The ingestion CLI stamped every dataset it wrote with the same basis: the input directory it
 * read. That statement is true and it does not distinguish. It is the same for a bundle the operator admitted by
 * a recorded decision and for one he did not, so the manifest could not say WHICH decision admitted the data.
 * This module lets a rights declaration name the decision record, and checks the claim before it is written.
 *
 * WHAT A REFERENCE IS. It is a pointer from a dataset's rights declaration to the operator's own recorded
 * decision. It does not add a rights state: the declaration stays `OPERATOR_ASSERTED` and the dataset class stays
 * `OPERATOR_SUPPLIED`. It is not a verification of any third party's terms, it is not an approval, and it is not
 * evidence that anything was installed. Every record listed here says those things about itself.
 *
 * THE RULE. Admission is per exact digest. Both records say so: it is "not inherited by association, by issuer,
 * or by directory", and a restated or re-digested bundle needs a fresh declaration. So a record may be cited for
 * an input bundle only when the bundle's BYTES are the bytes the record admits: its input digest
 * (`computeInputDigest` over the files the run consumed) must be one the record establishes. A record
 * establishes an input digest in one of two ways:
 *
 * - `STATED` — the record states the input digest itself (the record of 2026-11-14, section 3.2);
 * - `LEDGER` — the record names the bundle's own ledger, `digests.json`, by Git blob, and that ledger gives the
 *   SHA-256 of every file the ingestion path reads (the record of 2026-11-13, sections 6.1 and 6.2, written
 *   before input digests existed).
 *
 * Where a record also states the DATASET VERSION that an admitted input, or an admitted set of inputs,
 * produces, the build must reproduce it. A different dataset digest is not the thing that was admitted.
 *
 * Nothing is matched by name, path, issuer or provider text. A bundle the record does not admit is refused, and
 * the run writes nothing.
 *
 * NOTHING IS CHOSEN. A reference lists every input bundle of the dataset that its record admits. A bundle that
 * two cited records admit is listed under both. References are kept in the order of the record list. So the
 * citation of a dataset is a function of its inputs and of WHICH records were named, and of nothing else.
 *
 * WHY THE LIST IS CLOSED. The admitted digests are transcribed here, once, from the records. They are not read
 * from the record's prose at run time, because a record also mentions digests it does not admit (the 2026-11-14
 * record quotes a historical host pin). Each record is pinned by the SHA-256 of its exact bytes, so a record
 * that has been edited is not the record listed here. `tests/investment/authorizationRecords.test.ts` proves the
 * transcription against the committed records and bundles: every stated digest and every restriction label
 * below is in the record's text, every `LEDGER` digest is recomputed from the ledger whose Git blob the record
 * names, and no digest the record states is missing without a stated reason.
 *
 * A new decision record is added by a new entry here, with its own test. That is deliberate: which decision
 * admitted a dataset is not something to infer.
 */
import { createHash } from 'node:crypto';

/** One input bundle a record admits, identified by the digest of its bytes. */
export interface AdmittedInput {
  /** What the record calls it. For people; it decides nothing. */
  readonly label: string;
  /** `computeInputDigest` of the admitted bytes. This, and nothing else, identifies the input. */
  readonly inputDigest: string;
  /** How the record establishes that digest: it states it, or it names the bundle ledger that gives it. */
  readonly establishedBy: 'STATED' | 'LEDGER';
  /**
   * The dataset versions the record states for this input ALONE. Empty when it states none. When it states
   * any, a build from this input alone must produce one of them.
   */
  readonly datasetVersionsAlone: readonly string[];
}

/** One dataset a record admits at an exact digest, with the inputs it is built from. */
export interface AdmittedDataset {
  readonly label: string;
  /** The admitted inputs this dataset is built from. A build from exactly these must produce `datasetVersion`. */
  readonly inputDigests: readonly string[];
  readonly datasetVersion: string;
}

/** One decision record of the operator, as far as a rights declaration may rely on it. */
export interface AuthorizationRecord {
  /** The decision identifier the record carries. Not invented here. */
  readonly decision: string;
  /** The decision date the record states, `YYYY-MM-DD`. */
  readonly decisionDate: string;
  /** Where the record is kept, relative to the repository root, `/`-separated. Never an absolute path. */
  readonly record: string;
  /** SHA-256 of the record's exact bytes. A file whose bytes differ is not this record. */
  readonly recordSha256: string;
  /** The operative words of the decision, quoted from the record. */
  readonly operativeText: string;
  /** The input bundles the record admits. */
  readonly admittedInputs: readonly AdmittedInput[];
  /** The datasets the record admits at an exact digest. */
  readonly admittedDatasets: readonly AdmittedDataset[];
  /** The restrictions of the record, by the labels the record itself uses. Named here, not restated. */
  readonly restrictions: readonly string[];
}

const REL_1_INPUT = 'sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c';
const S4_R3_MARICO_INPUT = 'sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d';
const S4_R3_KEC_INPUT = 'sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a';

/**
 * The decision records this build knows. Order is the order of decision.
 *
 * `O3` of 2026-11-13 admits three bundles. Its section 8.4 says "The digests admitted by this decision are
 * exactly those recorded in §6.2 and §6.3". Section 6.2 is each bundle's ledger, named by Git blob in section
 * 6.1; the input digests below are computed from the file digests those ledgers give. Section 6.3 is the four
 * dataset versions. `O3` of 2026-11-14 states the three input digests of the refreshed candidate (section 3.2,
 * under its heading "Exact admitted identities and digests") and the candidate's dataset version (section 3.1).
 * The Infosys input is in both lists: the second record retains it unchanged and says it remains covered by the
 * first.
 */
export const AUTHORIZATION_RECORDS: readonly AuthorizationRecord[] = Object.freeze([
  Object.freeze({
    decision: 'O3',
    decisionDate: '2026-11-13',
    record: 'docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md',
    recordSha256: '25d8ba88248c138ca41f82874dca10db4e8605cba19c690a7a8a3740b7ee55ca',
    operativeText: 'ADMITTED AS CANDIDATE INPUTS FOR LOCAL PERSONAL USE',
    admittedInputs: Object.freeze([
      Object.freeze({
        label: 'REL-1-INFOSYS-2026-11-06',
        inputDigest: REL_1_INPUT,
        establishedBy: 'LEDGER' as const,
        // `dataset/` and `dataset-v1/`, both listed for this bundle in section 6.3.
        datasetVersionsAlone: Object.freeze([
          'sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e',
          'sha256:9be1a83ef198393b97465e104bef9270287bdc01a400c140a9f70927cdfa96e0',
        ]),
      }),
      Object.freeze({
        label: 'WI7-CONSUMER-MARICO-2026-11-07',
        inputDigest: 'sha256:725e8eadc10b6d113ab069122f4728f2744773e8d62b187044c20a0aa1e2ad24',
        establishedBy: 'LEDGER' as const,
        datasetVersionsAlone: Object.freeze(['sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0']),
      }),
      Object.freeze({
        label: 'WI8-INDUSTRIALS-KEC-2026-11-07',
        inputDigest: 'sha256:6a62f071ae17c8873dc8c3a3706abadafc2c7bc827a72a7833e2ec460abd07c2',
        establishedBy: 'LEDGER' as const,
        datasetVersionsAlone: Object.freeze(['sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab']),
      }),
    ]),
    // The record states a dataset for each bundle alone and none for several together.
    admittedDatasets: Object.freeze([]),
    restrictions: Object.freeze([
      'Single user',
      'Local host only',
      'Personal investment analysis only',
      'No production',
      'No SaaS',
      'No redistribution',
      'No re-licensing',
      'Not transferable',
    ]),
  }),
  Object.freeze({
    decision: 'O3',
    decisionDate: '2026-11-14',
    record: 'docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md',
    recordSha256: 'ab476ecb195b6081296c85f0fe4b34670ee1857b2c6fb8d8bd66d82be2e4daed',
    operativeText: 'O3 — ADMITTED for local personal investment analysis.',
    admittedInputs: Object.freeze([
      Object.freeze({
        label: 'Original Infosys input retained',
        inputDigest: REL_1_INPUT,
        establishedBy: 'STATED' as const,
        datasetVersionsAlone: Object.freeze([]),
      }),
      Object.freeze({
        label: 'Refreshed Marico successor',
        inputDigest: S4_R3_MARICO_INPUT,
        establishedBy: 'STATED' as const,
        datasetVersionsAlone: Object.freeze([]),
      }),
      Object.freeze({
        label: 'Refreshed KEC successor',
        inputDigest: S4_R3_KEC_INPUT,
        establishedBy: 'STATED' as const,
        datasetVersionsAlone: Object.freeze([]),
      }),
    ]),
    admittedDatasets: Object.freeze([
      Object.freeze({
        label: 'S4-R3 candidate dataset',
        inputDigests: Object.freeze([REL_1_INPUT, S4_R3_MARICO_INPUT, S4_R3_KEC_INPUT]),
        datasetVersion: 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b',
      }),
    ]),
    restrictions: Object.freeze([
      'Local personal use only',
      'Single user; local host only.',
      'No commercial or production deployment.',
      'No SaaS, multi-user, hosted or service-bureau use.',
      'No redistribution',
      'No re-licensing or transfer',
    ]),
  }),
]);

/**
 * The reference a rights declaration carries: which record, pinned by its bytes, and which inputs it admits.
 *
 * `instrument`, `independentSourceRightsVerification` and `redistribution` each have ONE permitted value. They
 * are written out because they are what a reader would otherwise have to assume, and they are closed so that a
 * manifest cannot use this member to claim a verification, or a right to redistribute, that no record grants.
 */
export interface AuthorizationReference {
  readonly decision: string;
  readonly decisionDate: string;
  readonly record: string;
  readonly recordSha256: string;
  readonly operativeText: string;
  /** The record is the operator's own declaration. It is not a licence and not a third party's permission. */
  readonly instrument: 'OPERATOR_DECLARATION';
  /** No review of a third party's terms is claimed by the record or by this reference. */
  readonly independentSourceRightsVerification: 'NOT_CLAIMED';
  /** Redistribution of the inputs, of the dataset and of anything computed from it is not authorised. */
  readonly redistribution: 'NOT_AUTHORISED';
  readonly restrictions: readonly string[];
  /**
   * The input digest of EVERY bundle of this dataset that the record admits, in the order the bundles were
   * supplied. Never empty. Digests only: a directory is not an identity and is never written here.
   */
  readonly inputDigests: readonly string[];
}

/** Why a citation was refused. Each code names one way a citation can fail. */
export type AuthorizationRefusalCode =
  /** The named file could not be read. */
  | 'RECORD_UNREADABLE'
  /** The file's bytes are not those of any record this build lists. */
  | 'RECORD_NOT_KNOWN'
  /** The same record was named more than once. */
  | 'RECORD_CITED_TWICE'
  /** An input bundle is admitted by none of the cited records. */
  | 'INPUT_NOT_ADMITTED'
  /** A cited record states the dataset the inputs produce, and this build produced another. */
  | 'DATASET_NOT_STATED'
  /** A cited record admits none of the run's input bundles. */
  | 'RECORD_ADMITS_NO_INPUT'
  /** A reference read from a declaration or manifest is malformed or does not agree with the record list. */
  | 'REFERENCE_INVALID';

export class AuthorizationReferenceError extends Error {
  constructor(
    readonly code: AuthorizationRefusalCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthorizationReferenceError';
  }
}

const SHA256_HEX = /^[0-9a-f]{64}$/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;

/** SHA-256 of a record's exact bytes, lower-case hex. */
export function authorizationRecordSha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/** The listed record with these bytes, or `undefined`. */
export function findAuthorizationRecord(recordSha256: string): AuthorizationRecord | undefined {
  return AUTHORIZATION_RECORDS.find((entry) => entry.recordSha256 === recordSha256);
}

function describeKnownRecords(): string {
  return AUTHORIZATION_RECORDS.map((entry) => `${entry.record} (sha256 ${entry.recordSha256})`).join('; ');
}

/** A record file the operator named on the command line, with the bytes that were read from it. */
export interface CitedRecordFile {
  /** The path as the operator supplied it. Used in messages only; it is never written to a manifest. */
  readonly suppliedPath: string;
  readonly bytes: Uint8Array;
}

/** One input bundle of a run, as far as a citation needs it. */
export interface CitableInput {
  /** The input directory. Used in messages only; it is never written into a reference. */
  readonly inputDir: string;
  readonly inputDigest: string;
  /**
   * The dataset version this bundle alone produces under this build. A function, because it costs a build and
   * is needed only when a cited record states that version.
   */
  readonly datasetVersion: () => string;
}

function referenceOf(record: AuthorizationRecord, inputDigests: readonly string[]): AuthorizationReference {
  return {
    decision: record.decision,
    decisionDate: record.decisionDate,
    record: record.record,
    recordSha256: record.recordSha256,
    operativeText: record.operativeText,
    instrument: 'OPERATOR_DECLARATION',
    independentSourceRightsVerification: 'NOT_CLAIMED',
    redistribution: 'NOT_AUTHORISED',
    restrictions: [...record.restrictions],
    inputDigests: [...inputDigests],
  };
}

function admittedInputOf(record: AuthorizationRecord, inputDigest: string): AdmittedInput | undefined {
  return record.admittedInputs.find((entry) => entry.inputDigest === inputDigest);
}

/**
 * Check a citation and build the references to record. Throws before anything can be written.
 *
 * Every input bundle must be admitted by at least one of the cited records, and every cited record must admit
 * at least one input bundle. Both halves matter: the first stops a record being stretched over data it does not
 * admit, the second stops a manifest naming a record that has nothing to do with it.
 *
 * A reference lists EVERY input bundle of the run that its record admits, in the order the bundles were
 * supplied. Nothing is attributed or chosen: a bundle that two cited records admit is listed under both, because
 * both statements are true. The references come back in the order of the record list. So the result depends on
 * WHICH records were named and on nothing else, not even the order in which they were named.
 *
 * The dataset a whole run produces is checked where it is known, in `authorizationReferenceFindings`.
 */
export function citeAuthorizationRecords(
  cited: readonly CitedRecordFile[],
  inputs: readonly CitableInput[],
): readonly AuthorizationReference[] {
  const named: AuthorizationRecord[] = [];
  for (const file of cited) {
    const sha256 = authorizationRecordSha256(file.bytes);
    const record = findAuthorizationRecord(sha256);
    if (record === undefined) {
      throw new AuthorizationReferenceError(
        'RECORD_NOT_KNOWN',
        `${file.suppliedPath} is not an authorization record this build lists (sha256 ${sha256}). ` +
          `Listed records: ${describeKnownRecords()}. A record whose bytes differ, including line endings ` +
          'changed by a checkout, is not the listed record. Nothing was written.',
      );
    }
    if (named.includes(record)) {
      throw new AuthorizationReferenceError(
        'RECORD_CITED_TWICE',
        `${record.record} was named more than once. Name each record once. Nothing was written.`,
      );
    }
    named.push(record);
  }
  // The order of the record list, whatever the order of naming.
  const records = AUTHORIZATION_RECORDS.filter((record) => named.includes(record));

  const digestsByRecord = new Map<AuthorizationRecord, string[]>(records.map((record) => [record, []]));
  for (const input of inputs) {
    const admitting = records.filter((candidate) => admittedInputOf(candidate, input.inputDigest) !== undefined);
    if (admitting.length === 0) {
      throw new AuthorizationReferenceError(
        'INPUT_NOT_ADMITTED',
        `${input.inputDir} (input digest ${input.inputDigest}) is not an input that ` +
          `${records.map((candidate) => candidate.record).join(' or ')} admits. Admission is per exact digest ` +
          'and is not inherited by name, issuer or directory; a restated or re-digested bundle needs a fresh ' +
          'declaration. Nothing was written. Run without --authorization-record to record only that the ' +
          'operator supplied these files.',
      );
    }
    for (const record of admitting) {
      const admitted = admittedInputOf(record, input.inputDigest)!;
      if (admitted.datasetVersionsAlone.length > 0) {
        const produced = input.datasetVersion();
        if (!admitted.datasetVersionsAlone.includes(produced)) {
          throw new AuthorizationReferenceError(
            'DATASET_NOT_STATED',
            `${input.inputDir} is the input ${record.record} admits as ${admitted.label}, and that record states ` +
              `the dataset it produces alone (${admitted.datasetVersionsAlone.join(' or ')}). Under this build and ` +
              `these options it produces ${produced}. A different dataset digest is not what was admitted. ` +
              'Nothing was written.',
          );
        }
      }
      digestsByRecord.get(record)!.push(input.inputDigest);
    }
  }

  for (const record of records) {
    if (digestsByRecord.get(record)!.length === 0) {
      throw new AuthorizationReferenceError(
        'RECORD_ADMITS_NO_INPUT',
        `${record.record} admits none of the input bundles of this run, so this dataset cannot name it. ` +
          'Nothing was written.',
      );
    }
  }

  return records.map((record) => referenceOf(record, digestsByRecord.get(record)!));
}

/**
 * The basis text of a declaration that cites records. It names each record and its bytes instead of a directory,
 * so it is the same in every checkout.
 */
export function authorizationBasisOf(references: readonly AuthorizationReference[]): string {
  return references
    .map(
      (reference) =>
        `operator’s declaration recorded as decision ${reference.decision} of ${reference.decisionDate} in ` +
        `${reference.record} (sha256 ${reference.recordSha256}), which admits ` +
        `${String(reference.inputDigests.length)} input bundle(s) of this dataset by digest`,
    )
    .join('; ');
}

/**
 * A one-line, reader-facing account of what the cited records are and are not.
 *
 * It repeats the three limits a reader would otherwise have to look up: whose statement this is, that it is not
 * a verification, and that redistribution is not authorised.
 */
export function authorizationReferenceStatement(references: readonly AuthorizationReference[]): string {
  const cited = references
    .map(
      (reference) =>
        `decision ${reference.decision} of ${reference.decisionDate} (${reference.record}, sha256 ` +
        `${reference.recordSha256}), which admits ${String(reference.inputDigests.length)} input bundle(s) of this dataset by digest`,
    )
    .join('; ');
  return (
    `The rights declaration of this dataset cites ${cited}. Each cited record is the operator’s own declaration ` +
    'for local personal use. It is not an independent verification of any third party’s rights, and ' +
    'redistribution is not authorised.'
  );
}

function fail(message: string): never {
  throw new AuthorizationReferenceError('REFERENCE_INVALID', message);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertExactKeys(value: Record<string, unknown>, keys: readonly string[], where: string): void {
  const found = Object.keys(value).sort();
  const wanted = [...keys].sort();
  if (found.length !== wanted.length || found.some((key, index) => key !== wanted[index])) {
    fail(`${where} must carry exactly ${wanted.join(', ')}; found ${found.join(', ')}`);
  }
}

const REFERENCE_KEYS = [
  'decision',
  'decisionDate',
  'record',
  'recordSha256',
  'operativeText',
  'instrument',
  'independentSourceRightsVerification',
  'redistribution',
  'restrictions',
  'inputDigests',
] as const;

/**
 * Validate the references of a declaration, as written or as read. A reference is REFUSED, never repaired.
 *
 * A reference must be exactly what this build writes for a listed record: the record's own identity, operative
 * text and restrictions, the three fixed limits, and input digests that the record admits. That is what stops a
 * hand-edited manifest from citing a record with digests the record does not admit, from dropping a
 * restriction, or from using this member to claim a verification or a right to redistribute.
 *
 * Refusing an unknown record is deliberate. A manifest that names a record this build cannot check is not
 * shown as if it had been checked.
 */
export function assertAuthorizationReferences(value: unknown): readonly AuthorizationReference[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail('authorizationReferences must be a non-empty list; leave the member out when no record is cited');
  }
  const seenRecords = new Set<string>();
  let lastPosition = -1;
  return value.map((entry: unknown, index): AuthorizationReference => {
    const where = `authorizationReferences[${String(index)}]`;
    if (!isPlainObject(entry)) fail(`${where} must be an object`);
    assertExactKeys(entry, REFERENCE_KEYS, where);
    const recordSha256 = entry.recordSha256;
    if (typeof recordSha256 !== 'string' || !SHA256_HEX.test(recordSha256)) {
      fail(`${where}.recordSha256 must be 64 lower-case hex characters`);
    }
    const record = findAuthorizationRecord(recordSha256);
    if (record === undefined) {
      fail(
        `${where} names a record this build does not list (${String(entry.record)}, sha256 ${recordSha256}); ` +
          `listed records: ${describeKnownRecords()}`,
      );
    }
    if (seenRecords.has(record.recordSha256)) fail(`${where}: ${record.record} is cited more than once`);
    seenRecords.add(record.recordSha256);
    // One form only: the order of the record list. The order in which records were named decides nothing.
    const position = AUTHORIZATION_RECORDS.indexOf(record);
    if (position < lastPosition) {
      fail(`${where}: references must be in the order of the record list (the order of decision); ${record.record} is out of order`);
    }
    lastPosition = position;

    const expected = referenceOf(record, []);
    for (const key of ['decision', 'decisionDate', 'record', 'operativeText'] as const) {
      if (entry[key] !== expected[key]) {
        fail(`${where}.${key} must be "${expected[key]}" for ${record.record}; found "${String(entry[key])}"`);
      }
    }
    if (entry.instrument !== 'OPERATOR_DECLARATION') {
      fail(`${where}.instrument must be OPERATOR_DECLARATION: the record is the operator’s own declaration`);
    }
    if (entry.independentSourceRightsVerification !== 'NOT_CLAIMED') {
      fail(`${where}.independentSourceRightsVerification must be NOT_CLAIMED: no record claims such a review`);
    }
    if (entry.redistribution !== 'NOT_AUTHORISED') {
      fail(`${where}.redistribution must be NOT_AUTHORISED: no listed record authorises redistribution`);
    }
    const restrictions = entry.restrictions;
    if (
      !Array.isArray(restrictions) ||
      restrictions.length !== record.restrictions.length ||
      restrictions.some((label: unknown, position) => label !== record.restrictions[position])
    ) {
      fail(`${where}.restrictions must be exactly the restrictions of ${record.record}, in the record’s order`);
    }
    const digestsValue = entry.inputDigests;
    if (!Array.isArray(digestsValue) || digestsValue.length === 0) {
      fail(`${where}.inputDigests must list at least one input bundle the record admits`);
    }
    // Within one reference a bundle is listed once. Two references may list the same bundle: two records can
    // admit it, and each reference lists every bundle its own record admits.
    const seenInputs = new Set<string>();
    const inputDigests = digestsValue.map((digest: unknown, at): string => {
      if (typeof digest !== 'string' || !DIGEST.test(digest)) {
        fail(`${where}.inputDigests[${String(at)}] must be sha256:<64 hex>`);
      }
      if (admittedInputOf(record, digest) === undefined) {
        fail(`${where}: ${record.record} does not admit input digest ${digest}`);
      }
      if (seenInputs.has(digest)) fail(`${where}: input digest ${digest} is listed more than once`);
      seenInputs.add(digest);
      return digest;
    });
    return referenceOf(record, inputDigests);
  });
}

/** The parts of a manifest that the references must agree with. */
export interface AuthorizationReferenceContext {
  readonly datasetVersion: string;
  /** `manifest.inputs`: the per-bundle provenance of a multi-input run, absent for a single-bundle run. */
  readonly inputs?: readonly { readonly inputDigest: string }[];
}

/**
 * Where a manifest's references disagree with the manifest itself. Empty means they agree.
 *
 * - A manifest that records per-bundle provenance: every recorded bundle must be listed by at least one
 *   reference, no reference may list a bundle the manifest does not record, and each reference must list EVERY
 *   recorded bundle its record admits, in the recorded order. A reference is therefore a fact about the record
 *   and the dataset, with nothing left to choose.
 * - A manifest that records none came from a single bundle, so every reference lists that one bundle.
 * - Where a record admits every input of the dataset and states the dataset that exactly those inputs produce,
 *   the manifest's dataset version must be that dataset. That holds whether or not another record is cited as
 *   well. The check is bound to the content, because the reader recomputes the dataset version from the files:
 *   a citation pasted onto another dataset fails it.
 *
 * What cannot be rechecked from a dataset is an input digest: the inputs are not in the dataset. Where no cited
 * record states a dataset for the inputs, the citation is therefore as reliable as the manifest that states it,
 * like the manifest's other audit fields, and no more.
 */
export function authorizationReferenceFindings(
  references: readonly AuthorizationReference[],
  context: AuthorizationReferenceContext,
): readonly string[] {
  const findings: string[] = [];
  const cited = [...new Set(references.flatMap((reference) => [...reference.inputDigests]))];
  const recorded = (context.inputs ?? []).map((entry) => entry.inputDigest);
  if (recorded.length > 0) {
    const missing = recorded.filter((digest) => !cited.includes(digest));
    const extra = cited.filter((digest) => !recorded.includes(digest));
    if (missing.length > 0) {
      findings.push(`recorded input bundle(s) not admitted by any cited record: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      findings.push(`cited record(s) name input bundle(s) this manifest does not record: ${extra.join(', ')}`);
    }
    if (findings.length === 0) {
      for (const reference of references) {
        const record = findAuthorizationRecord(reference.recordSha256);
        if (record === undefined) continue;
        const admitted = recorded.filter((digest) => admittedInputOf(record, digest) !== undefined);
        if (
          admitted.length !== reference.inputDigests.length ||
          admitted.some((digest, at) => digest !== reference.inputDigests[at])
        ) {
          findings.push(
            `${reference.record} admits ${String(admitted.length)} of the input bundle(s) this manifest records and ` +
              `is cited for ${String(reference.inputDigests.length)}; a reference lists every recorded bundle its ` +
              'record admits, in the recorded order',
          );
        }
      }
    }
  } else if (cited.length !== 1) {
    findings.push(
      `the manifest records no per-bundle provenance, so it was built from one bundle, but the cited records name ${String(cited.length)}`,
    );
  }
  if (findings.length > 0) return findings;

  // The dataset the inputs produce, where a record states it. A record's statement applies when the record
  // admits EVERY input of the dataset: the dataset is then built from nothing else. Another record being cited
  // as well does not change that, so naming a second record cannot avoid this check.
  const whole = recorded.length > 0 ? recorded : cited;
  const wholeSet = [...whole].sort().join(' ');
  for (const reference of references) {
    const record = findAuthorizationRecord(reference.recordSha256);
    if (record === undefined || [...reference.inputDigests].sort().join(' ') !== wholeSet) continue;
    const stated: string[] = [];
    if (whole.length === 1) {
      stated.push(...(admittedInputOf(record, whole[0]!)?.datasetVersionsAlone ?? []));
    }
    for (const dataset of record.admittedDatasets) {
      if ([...dataset.inputDigests].sort().join(' ') === wholeSet) stated.push(dataset.datasetVersion);
    }
    if (stated.length > 0 && !stated.includes(context.datasetVersion)) {
      findings.push(
        `${reference.record} states that exactly these inputs produce dataset ${stated.join(' or ')}, and this ` +
          `dataset is ${context.datasetVersion}`,
      );
    }
  }
  return findings;
}

/** Throw when a manifest's references disagree with the manifest. See `authorizationReferenceFindings`. */
export function assertAuthorizationReferencesAgree(
  references: readonly AuthorizationReference[],
  context: AuthorizationReferenceContext,
): void {
  const findings = authorizationReferenceFindings(references, context);
  if (findings.length > 0) {
    fail(`the authorization references do not agree with the manifest that carries them: ${findings.join('; ')}`);
  }
}
