/**
 * IID P6-A — read-only runtime dependency readiness for IID-01 / IID-02 / IID-03.
 *
 * WHY THIS EXISTS. Every runtime dependency below already has an authoritative resolver, and each
 * transport already fails closed when its dependency is absent. What did not exist is a way to ask
 * "which dependency is missing, who owns it, and what exactly must be done?" without starting a
 * transport and reading 503 bodies one route at a time. `/api/health` answers a static `ok` and says
 * nothing about any of this. This module answers that question by CALLING THE EXISTING RESOLVERS.
 *
 * IT CONSTRUCTS NOTHING. No database handle, no store, no IPC connection, no write, no migration.
 * In particular it deliberately does NOT call `loadAuthoritativeNp04Persistence()`: that resolver opens
 * the configured database with `createDirectory: true, migrate: true`, so calling it from a diagnostic
 * would CREATE and MIGRATE a database as a side effect of asking a question. Readiness is therefore
 * reported as "configured / not configured" plus "file present / absent", and the caller is told that a
 * configured path is not evidence of stored assessment records.
 *
 * IT DOES NOT DECIDE AUTHORITY. Ownership labels describe which side must act; they are not an
 * authorization grant. Nothing here enables a write, admits an operation, or relaxes a fail-closed
 * path. `IIPS_LOCAL_PERSONAL_USE` is reported as an enablement CONDITION, never as authority.
 *
 * IT DOES NOT LEAK. Output carries variable NAMES, bounded reason codes, counts and booleans. It never
 * emits a variable's value, an owner/tenant identifier, a carrier digest, a filesystem path, a payload,
 * or a stack trace. Paths are reduced to a presence/kind fact so the report is safe to paste into a
 * review record.
 *
 * EVIDENCE LEVELS ARE NOT INTERCHANGEABLE. Every finding declares the strongest level actually
 * reached. `static` means source/config inspection; `runtime-file` means the configured file was read
 * and validated in this process. Neither is an HTTP observation, and neither is real-issuer proof.
 */
import { existsSync, statSync } from 'node:fs';
import { isAbsolute } from 'node:path';

import { NP04_DATABASE_PATH_ENV } from '../reports/persistence-port.js';
import { REPORTS_OWNER_PATH_ENV, evaluateReportsOwnerContext } from '../reports-owner-resolver.js';
import { OWNER_CONTEXT_PATH_ENV, evaluateOwnerContext } from '../owner-context-resolver.js';
import {
  BINDING_PRECONDITION_SETTING,
  isOwnerContextEstablished,
  ownerContextFromBinding,
  readBindingPrecondition,
} from '../user-portfolio/ownerContextFromBinding.js';
import { IPC_ENDPOINT_SETTING, IpcClientError, resolveIpcEndpoint } from '../user-portfolio/ipcClient.js';
import {
  IDENTITY_FILE_NAMES,
  loadIdentitySourcesFromDir,
  resolveIdentityDir,
} from '../../../iips-platform/src/investment/identity/sources';

/** Which IID capabilities a dependency gates. */
export type IidCapability = 'IID-01' | 'IID-02' | 'IID-03';

/**
 * The ownership classification the work item requires.
 *
 * `user-host-provisioning-required` is deliberately distinct from `irr-owned-not-configured`: the
 * repository implementation is complete in both cases, but only the operator can place a carrier or
 * choose a database path. An Arena sandbox absence is NOT evidence about the user's Windows host, so
 * nothing here infers a host limitation from this process's environment.
 */
export type DependencyOwnership =
  | 'irr-owned-operational'
  | 'irr-owned-not-configured'
  | 'ipd-owned-operational'
  | 'ipd-owned-unavailable'
  | 'user-host-provisioning-required'
  | 'not-applicable'
  | 'unknown-investigation-required';

/** The strongest evidence level actually reached for one finding. Never inflated. */
export type EvidenceLevel = 'static' | 'automated-test' | 'http-service' | 'configured-runtime' | 'real-issuer-browser';

export interface DependencyFinding {
  readonly id: string;
  readonly purpose: string;
  readonly capabilities: readonly IidCapability[];
  readonly ownership: DependencyOwnership;
  /** Configuration fact: was the setting present and well formed? */
  readonly configured: boolean;
  /** Data fact: was the configured thing actually readable/valid in THIS process? */
  readonly readable: boolean | null;
  readonly reason: string;
  readonly evidence: EvidenceLevel;
  /** The exact next action, and who must perform it. Empty when nothing is outstanding. */
  readonly requiredAction: string;
  readonly actionOwner: 'IRR' | 'IPD' | 'USER_HOST' | 'NONE';
  /** Environment variable NAMES only. Never values. */
  readonly settings: readonly string[];
}

export interface ReadinessReport {
  readonly schemaVersion: 1;
  readonly scope: 'LOCAL_SINGLE_USER_NON_PRODUCTION';
  readonly platform: string;
  readonly nodeVersion: string;
  /** True only when every finding needed by the three capabilities is satisfied. */
  readonly ready: boolean;
  readonly findings: readonly DependencyFinding[];
  /** Counts by ownership, so a reviewer can see the shape without reading every finding. */
  readonly summary: Readonly<Record<DependencyOwnership, number>>;
  readonly disclosures: readonly string[];
}

export interface ReadinessOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly platform?: NodeJS.Platform;
  readonly nodeVersion?: string;
  /** Overrides the data-domain root; otherwise the governed `IIPS_DATA_DIR` resolution is used. */
  readonly dataRoot?: string;
}

const DATA_DIR_SETTING = 'IIPS_DATA_DIR';
const LOCAL_PERSONAL_USE_SETTING = 'IIPS_LOCAL_PERSONAL_USE';

const OWNERSHIP_ORDER: readonly DependencyOwnership[] = [
  'irr-owned-operational',
  'irr-owned-not-configured',
  'ipd-owned-operational',
  'ipd-owned-unavailable',
  'user-host-provisioning-required',
  'not-applicable',
  'unknown-investigation-required',
];

/** A configured setting is never echoed. Only whether it is present and non-blank. */
function settingPresent(env: NodeJS.ProcessEnv, name: string): boolean {
  const raw = env[name];
  return typeof raw === 'string' && raw.trim().length > 0;
}

function isFilePresent(path: string): boolean {
  try {
    return existsSync(path) && statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * D1 — identity files (IID-01/02/03).
 *
 * Uses the platform's own loader, so "valid" means exactly what the resolver means: the three files
 * exist AND pass the governed roster/listing/corporate-action validation. A fixture elsewhere in the
 * repository is not this directory and is never substituted.
 */
function identityFinding(options: ReadinessOptions, env: NodeJS.ProcessEnv): DependencyFinding {
  const dir = resolveIdentityDir(options.dataRoot ?? env[DATA_DIR_SETTING]);
  const base = {
    id: 'identity-files',
    purpose: 'Governed eligible roster, listing map and corporate-action table for issuer/holding identity.',
    capabilities: ['IID-01', 'IID-02', 'IID-03'] as const,
    settings: [DATA_DIR_SETTING],
  };
  const required = [
    IDENTITY_FILE_NAMES.roster,
    IDENTITY_FILE_NAMES.listingMap,
    IDENTITY_FILE_NAMES.corporateActions,
  ];
  const missing = required.filter((name) => !isFilePresent(`${dir}/${name}`));
  if (missing.length > 0) {
    return {
      ...base,
      ownership: 'user-host-provisioning-required',
      configured: settingPresent(env, DATA_DIR_SETTING),
      readable: false,
      reason: `IDENTITY_SOURCE_MISSING (${String(missing.length)} of 3 files absent)`,
      evidence: 'configured-runtime',
      requiredAction:
        'Place the three governed identity JSON files in <IIPS_DATA_DIR>/investment/identity/ from the authoritative issuer source. Do not copy test fixtures and do not author identity data by hand.',
      actionOwner: 'USER_HOST',
    };
  }
  const loaded = loadIdentitySourcesFromDir(dir);
  if (!loaded.available) {
    // Bounded codes only: never the subject, detail or path, which can carry issuer text.
    const codes = [...new Set(loaded.issues.map((issue) => issue.code))].sort();
    return {
      ...base,
      ownership: 'user-host-provisioning-required',
      configured: true,
      readable: false,
      reason: `IDENTITY_SOURCE_INVALID (${codes.join(', ')})`,
      evidence: 'configured-runtime',
      requiredAction:
        'Correct the named identity files against the authoritative source, then re-run this diagnostic. The resolver refuses the whole set; partial identity is never served.',
      actionOwner: 'USER_HOST',
    };
  }
  return {
    ...base,
    ownership: 'irr-owned-operational',
    configured: true,
    readable: true,
    reason: 'IDENTITY_SOURCES_VALID',
    evidence: 'configured-runtime',
    requiredAction: '',
    actionOwner: 'NONE',
  };
}

/**
 * D2 — NP-04 assessment store (IID-01 Stock Intelligence, IID-03 Historical Change Intelligence).
 *
 * Deliberately does NOT open the database. `readable` reports only whether the configured file already
 * exists, and `configured-runtime` is claimed only for that filesystem fact. Whether the chain contains
 * any assessment version is a SEPARATE question that this diagnostic cannot answer without opening a
 * store, so it is reported as unknown and assigned to the operator CLI that already exists.
 */
function np04Finding(env: NodeJS.ProcessEnv): DependencyFinding {
  const base = {
    id: 'np04-assessment-store',
    purpose: 'NP-04 governed persistence holding assessment artifact chains and their version history.',
    capabilities: ['IID-01', 'IID-03'] as const,
    settings: [NP04_DATABASE_PATH_ENV],
  };
  const raw = env[NP04_DATABASE_PATH_ENV];
  if (!settingPresent(env, NP04_DATABASE_PATH_ENV)) {
    return {
      ...base,
      ownership: 'irr-owned-not-configured',
      configured: false,
      readable: null,
      reason: 'DATABASE_PATH_NOT_CONFIGURED',
      evidence: 'static',
      requiredAction:
        `Set ${NP04_DATABASE_PATH_ENV} to an absolute server-owned path outside any Git working tree, distinct from the Gate 3 store and IIPS_DATA_DIR, then restart the transport.`,
      actionOwner: 'USER_HOST',
    };
  }
  if (typeof raw !== 'string' || !isAbsolute(raw)) {
    return {
      ...base,
      ownership: 'irr-owned-not-configured',
      configured: false,
      readable: null,
      reason: 'DATABASE_PATH_NOT_ABSOLUTE',
      evidence: 'static',
      requiredAction: `${NP04_DATABASE_PATH_ENV} must be an absolute path; NP-04 rejects a relative one.`,
      actionOwner: 'USER_HOST',
    };
  }
  const present = isFilePresent(raw);
  return {
    ...base,
    ownership: present ? 'irr-owned-operational' : 'user-host-provisioning-required',
    configured: true,
    readable: present,
    reason: present ? 'DATABASE_FILE_PRESENT_CONTENT_UNVERIFIED' : 'DATABASE_FILE_ABSENT',
    evidence: 'configured-runtime',
    requiredAction: present
      ? 'Confirm stored assessment versions with the existing read-only CLI (show-investment-chain). A present database file does not prove any assessment record exists.'
      : 'Opening this path through NP-04 creates and migrates the database. Authorize that explicitly, then persist assessments with the existing operator CLI; a fresh store contains no assessment.',
    actionOwner: 'USER_HOST',
  };
}

/** D3 — Reports owner carrier: the gate in front of every assessment read. */
function reportsOwnerFinding(env: NodeJS.ProcessEnv): DependencyFinding {
  const resolution = evaluateReportsOwnerContext(env);
  const base = {
    id: 'reports-owner-context',
    purpose: 'Establishes which governed Reports partition serves assessment reads; required before any artifact read.',
    capabilities: ['IID-01', 'IID-03'] as const,
    settings: [REPORTS_OWNER_PATH_ENV],
  };
  if (resolution.ok) {
    return {
      ...base,
      ownership: 'irr-owned-operational',
      configured: true,
      readable: true,
      reason: 'REPORTS_OWNER_CONTEXT_ESTABLISHED',
      evidence: 'configured-runtime',
      requiredAction: '',
      actionOwner: 'NONE',
    };
  }
  return {
    ...base,
    ownership: 'user-host-provisioning-required',
    configured: settingPresent(env, REPORTS_OWNER_PATH_ENV),
    readable: false,
    reason: `REPORTS_OWNER_CONTEXT_UNAVAILABLE (${resolution.reason})`,
    evidence: 'configured-runtime',
    requiredAction:
      `Materialise the byte-exact Reports carrier with the existing materialiser and point ${REPORTS_OWNER_PATH_ENV} at that FILE (not its directory), outside Git. Do not hand-edit the bytes and do not alias another carrier.`,
    actionOwner: 'USER_HOST',
  };
}

/** D4 — the F-3 owner carrier that scopes watchlists and collaboration. */
function ownerContextFinding(env: NodeJS.ProcessEnv): DependencyFinding {
  const resolution = evaluateOwnerContext(env);
  const base = {
    id: 'owner-context-carrier',
    purpose: 'Scopes watchlist and collaboration reads to the local user; a missing carrier must not widen access.',
    capabilities: ['IID-02'] as const,
    settings: [OWNER_CONTEXT_PATH_ENV],
  };
  if (resolution.ok) {
    return {
      ...base,
      ownership: 'irr-owned-operational',
      configured: true,
      readable: true,
      reason: 'OWNER_CONTEXT_ESTABLISHED',
      evidence: 'configured-runtime',
      requiredAction: '',
      actionOwner: 'NONE',
    };
  }
  return {
    ...base,
    ownership: 'user-host-provisioning-required',
    configured: settingPresent(env, OWNER_CONTEXT_PATH_ENV),
    readable: false,
    reason: `OWNER_CONTEXT_UNAVAILABLE (${resolution.reason})`,
    evidence: 'configured-runtime',
    requiredAction:
      `Materialise the canonical F-3 carrier and point ${OWNER_CONTEXT_PATH_ENV} at that FILE outside Git. It is a different file and pair from the Reports carrier; aliasing them fails closed by design.`,
    actionOwner: 'USER_HOST',
  };
}

/**
 * D5 — the IPD-owned binding precondition (IID-02 portfolio/holding context).
 *
 * IRR can only read the declaration. Whether IPD has actually provisioned an active binding is IPD's
 * fact, established per request by IPD's own guards, so a `true` declaration is never reported as an
 * operational IPD binding.
 */
function bindingFinding(env: NodeJS.ProcessEnv): DependencyFinding {
  const precondition = readBindingPrecondition(env);
  const established = isOwnerContextEstablished(ownerContextFromBinding(precondition, env));
  const base = {
    id: 'ipd-binding-precondition',
    purpose: 'Server-owned declaration that IPD has provisioned the active owner binding used by portfolio reads.',
    capabilities: ['IID-02'] as const,
    settings: [BINDING_PRECONDITION_SETTING],
  };
  if (!established) {
    return {
      ...base,
      ownership: 'ipd-owned-unavailable',
      configured: false,
      readable: false,
      reason: 'BINDING_NOT_PROVISIONED',
      evidence: 'static',
      requiredAction:
        `IPD must provision the active binding through its own governed procedure; only then may the operator set ${BINDING_PRECONDITION_SETTING}=true. IRR cannot establish it and must not assert it.`,
      actionOwner: 'IPD',
    };
  }
  return {
    ...base,
    ownership: 'ipd-owned-operational',
    configured: true,
    // A declaration is not a verified binding: readability stays unproven here.
    readable: null,
    reason: 'BINDING_DECLARED_IPD_VERIFIES_PER_REQUEST',
    evidence: 'static',
    requiredAction:
      'Confirm an actual portfolio read through the transport. IPD verifies the binding per request; this declaration alone is not proof of retrieval.',
    actionOwner: 'IPD',
  };
}

/**
 * D6 — the same-host IPC endpoint (IID-02).
 *
 * Resolution is validated with the existing resolver, which is pure. NO connection is attempted: a
 * diagnostic must not open a peer, and a reachable socket still would not prove IPD answers correctly.
 */
function ipcEndpointFinding(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): DependencyFinding {
  const base = {
    id: 'ipc-endpoint',
    purpose: 'Same-host IPC target for read-only portfolio and holding retrieval from IPD.',
    capabilities: ['IID-02'] as const,
    settings: [IPC_ENDPOINT_SETTING],
  };
  try {
    const target = resolveIpcEndpoint(env, platform);
    // On POSIX a socket is a filesystem entry; on Windows a named pipe is not statable this way.
    const present = target.kind === 'unix-socket' ? existsSync(target.path) : null;
    return {
      ...base,
      ownership: present === false ? 'ipd-owned-unavailable' : 'ipd-owned-operational',
      configured: true,
      readable: null,
      reason:
        present === false
          ? 'ENDPOINT_RESOLVED_PEER_ABSENT'
          : `ENDPOINT_RESOLVED (${target.kind}) Peer liveness not probed.`,
      evidence: 'static',
      requiredAction:
        'IPD must be running and listening on this local target. Verify with an actual portfolio read; socket presence is not a successful IPC call.',
      actionOwner: 'IPD',
    };
  } catch (error) {
    const kind = error instanceof IpcClientError ? error.kind : 'ENDPOINT_UNVERIFIABLE';
    return {
      ...base,
      ownership: 'irr-owned-not-configured',
      configured: false,
      readable: null,
      reason: `ENDPOINT_NOT_RESOLVED (${kind})`,
      evidence: 'static',
      requiredAction:
        `Set ${IPC_ENDPOINT_SETTING} to a local IPC target (Windows named pipe under \\\\.\\pipe\\, or an absolute POSIX socket path). A URL or host:port is refused.`,
      actionOwner: 'USER_HOST',
    };
  }
}

/** D7 — local personal-use enablement. A condition, never authority. */
function enablementFinding(env: NodeJS.ProcessEnv): DependencyFinding {
  const enabled = env[LOCAL_PERSONAL_USE_SETTING] === '1';
  return {
    id: 'local-personal-use-enablement',
    purpose: 'Additional local enablement condition for the personal-use write path and the Step 9 operator.',
    capabilities: ['IID-02'],
    settings: [LOCAL_PERSONAL_USE_SETTING],
    ownership: enabled ? 'irr-owned-operational' : 'irr-owned-not-configured',
    configured: enabled,
    readable: null,
    reason: enabled ? 'LOCAL_PERSONAL_USE_DECLARED' : 'LOCAL_PERSONAL_USE_ABSENT',
    evidence: 'static',
    requiredAction: enabled
      ? 'This grants no authority. IPD keeps its own per-request guards and write refusals.'
      : `Set ${LOCAL_PERSONAL_USE_SETTING}=1 in the server process only when operating the local personal application. Read-only IID assessment does not require it.`,
    actionOwner: enabled ? 'NONE' : 'USER_HOST',
  };
}

/** D8 — the IID-0 fundamentals dataset the assessment engine consumes. */
function datasetFinding(options: ReadinessOptions, env: NodeJS.ProcessEnv): DependencyFinding {
  const root = options.dataRoot ?? env[DATA_DIR_SETTING];
  // Mirrors the governed default without importing a second resolver for the same convention.
  const base = {
    id: 'fundamentals-dataset',
    purpose: 'IID-0 fundamentals snapshot the assessment engine reads when minting an assessment version.',
    capabilities: ['IID-01', 'IID-03'] as const,
    settings: [DATA_DIR_SETTING],
  };
  const dir = root === undefined || root.trim().length === 0 ? null : `${root}/investment/dataset`;
  const present = dir !== null && existsSync(dir);
  return {
    ...base,
    ownership: present ? 'irr-owned-operational' : 'user-host-provisioning-required',
    configured: settingPresent(env, DATA_DIR_SETTING),
    readable: present ? null : false,
    reason: present ? 'DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED' : 'DATASET_DIRECTORY_ABSENT',
    evidence: present ? 'configured-runtime' : 'static',
    requiredAction: present
      ? 'Verify the snapshot with the existing dataset reader before minting; a present directory is not a measured dataset.'
      : 'Import an operator dataset into <IIPS_DATA_DIR>/investment/dataset using the existing IID-0 ingestion path. Assessment minting cannot run without it; already-stored assessments still read.',
    actionOwner: 'USER_HOST',
  };
}

/**
 * Assess IID runtime readiness WITHOUT constructing anything.
 *
 * Pure with respect to the process: it reads files and environment, and returns a report. It never
 * writes, never opens a database, never connects to a peer, and never mutates `env`.
 */
export function assessIidReadiness(options: ReadinessOptions = {}): ReadinessReport {
  const env = options.env ?? process.env;
  const platform = options.platform ?? process.platform;
  const findings: readonly DependencyFinding[] = [
    identityFinding(options, env),
    reportsOwnerFinding(env),
    np04Finding(env),
    ownerContextFinding(env),
    bindingFinding(env),
    ipcEndpointFinding(env, platform),
    datasetFinding(options, env),
    enablementFinding(env),
  ];

  const summary = Object.fromEntries(
    OWNERSHIP_ORDER.map((ownership) => [
      ownership,
      findings.filter((finding) => finding.ownership === ownership).length,
    ]),
  ) as Record<DependencyOwnership, number>;

  // Readiness is claimed only for the READ path of the three capabilities. Enablement is excluded:
  // it gates the personal-use write path, not assessment reads.
  const readCritical = findings.filter((finding) => finding.id !== 'local-personal-use-enablement');
  const ready = readCritical.every(
    (finding) => finding.ownership === 'irr-owned-operational' || finding.ownership === 'ipd-owned-operational',
  );

  return {
    schemaVersion: 1,
    scope: 'LOCAL_SINGLE_USER_NON_PRODUCTION',
    platform,
    nodeVersion: options.nodeVersion ?? process.versions.node,
    ready,
    findings,
    summary,
    disclosures: [
      'Read-only assessment: no database was opened, created or migrated; no IPC peer was contacted; nothing was written.',
      'A configured database path is not evidence that assessment records exist. Verify stored versions with the existing show-investment-chain CLI.',
      'A declared IPD binding is not a verified binding; IPD adjudicates ownership per request.',
      'This report describes only the process environment it ran in. An absent setting here is NOT evidence about any other host, including the operator Windows machine.',
      'No HTTP, browser or real-issuer verification is implied by any finding in this report.',
      'Production admission is NOT ADMITTED. This diagnostic neither grants authority nor enables a write.',
    ],
  };
}

/**
 * A compact, paste-safe rendering. Values are never printed — only names, codes and counts.
 */
export function formatIidReadiness(report: ReadinessReport): string {
  const lines: string[] = [
    `IID runtime readiness (read-only) — ${report.scope}`,
    `platform=${report.platform} node=${report.nodeVersion}`,
    '',
  ];
  for (const finding of report.findings) {
    const mark = finding.ownership.endsWith('operational') ? '[ok]  ' : '[todo]';
    lines.push(`${mark} ${finding.id} — ${finding.ownership}`);
    lines.push(`       reason: ${finding.reason}`);
    lines.push(`       gates: ${finding.capabilities.join(', ')} | evidence: ${finding.evidence}`);
    if (finding.settings.length > 0) lines.push(`       settings: ${finding.settings.join(', ')}`);
    if (finding.requiredAction.length > 0) {
      lines.push(`       action (${finding.actionOwner}): ${finding.requiredAction}`);
    }
  }
  lines.push('', `READ-PATH READY: ${report.ready ? 'YES' : 'NO'}`);
  for (const disclosure of report.disclosures) lines.push(`  - ${disclosure}`);
  return lines.join('\n');
}
