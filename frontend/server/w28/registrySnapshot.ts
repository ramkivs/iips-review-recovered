/**
 * W-28 — Load and validate the IPD Dhan registry snapshot (immutable manifest).
 *
 * The IPD-owned artifact is `evidence/dhan-p7/qualification-manifest.json` at the
 * immutable commit `371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed` (pipeline `325266d...`),
 * SHA-256 `69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769`.
 * This module reuses the same validation as `scripts/w28_verify_manifest.py` and
 * exposes the qualified registry as a `RegistrySnapshot` for `coverageMeasurement.ts`.
 *
 * It does NOT regenerate W-27, does not call vendors, and does not open an IPD DB.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { RegistrySnapshot } from './coverageMeasurement';

export const W28_EXPECTED_MANIFEST_SHA256 = '69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769';
export const W28_EXPECTED_MANIFEST_COMMIT = '371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed';
export const W28_EXPECTED_PIPELINE_COMMIT = '325266d684f857a377d55b147e7306e02c7a495a';

// Manifest shape (subset validated)
interface ManifestJson {
  manifestCommit?: string;
  pipelineCommit?: string;
  generatedAt?: string;
  counts?: Record<string, number>;
  registry: string[]; // qualified: companyId|exchangeSegment|securityId
  // Optional when available: proposed, p04Universe, providerUniverse
  proposed?: string[];
  p04Universe?: string[];
  providerUniverse?: string[];
}

export interface LoadedRegistrySnapshot extends RegistrySnapshot {
  /** Raw qualified count from manifest */
  readonly qualifiedCount: number;
  /** Manifest counts map */
  readonly counts: Readonly<Record<string, number>>;
  /** When the manifest was generated */
  readonly generatedAt: string | null;
}

export function loadRegistrySnapshotFromFile(path: string): LoadedRegistrySnapshot {
  const bytes = readFileSync(path);
  return loadRegistrySnapshotFromBytes(bytes);
}

export function loadRegistrySnapshotFromBytes(bytes: Buffer | Uint8Array | string): LoadedRegistrySnapshot {
  const raw = typeof bytes === 'string' ? bytes : Buffer.from(bytes).toString('utf8');
  const sha256 = createHash('sha256').update(Buffer.from(raw, 'utf8')).digest('hex');
  if (sha256 !== W28_EXPECTED_MANIFEST_SHA256) {
    throw new Error(
      `Manifest SHA-256 mismatch: expected ${W28_EXPECTED_MANIFEST_SHA256}, got ${sha256}. ` +
        `The manifest must be the exact immutable artifact at ${W28_EXPECTED_MANIFEST_COMMIT}.`,
    );
  }
  const json = JSON.parse(raw) as ManifestJson;

  // Validate pipeline identity
  if (json.pipelineCommit !== W28_EXPECTED_PIPELINE_COMMIT) {
    throw new Error(`Manifest pipelineCommit mismatch: expected ${W28_EXPECTED_PIPELINE_COMMIT}, got ${json.pipelineCommit}`);
  }
  // Manifest commit should match when present
  if (json.manifestCommit && json.manifestCommit !== W28_EXPECTED_MANIFEST_COMMIT) {
    throw new Error(`Manifest manifestCommit mismatch: expected ${W28_EXPECTED_MANIFEST_COMMIT}, got ${json.manifestCommit}`);
  }

  // Validate qualified registry structure: each entry is companyId|exchangeSegment|securityId where securityId = ISIN:isin:series
  const qualifiedRegistry = new Set<string>();
  for (const entry of json.registry ?? []) {
    if (typeof entry !== 'string' || entry.split('|').length !== 3) {
      throw new Error(`Invalid registry entry (expected companyId|exchangeSegment|securityId): ${entry}`);
    }
    const [, exchangeSegment, securityId] = entry.split('|');
    if (!/^NSE_EQ|BSE_EQ|BSE_A|BSE_B$/.test(exchangeSegment)) {
      throw new Error(`Invalid exchangeSegment in registry entry: ${entry}`);
    }
    if (!/^ISIN:[A-Z0-9]{12}:[^:]+$/.test(securityId)) {
      throw new Error(`Invalid securityId in registry entry: ${entry}`);
    }
    qualifiedRegistry.add(entry);
  }

  // Validate counts when present (from W-27 instrument-master counts, not holdings counts)
  const counts = json.counts ?? {};
  const qualifiedFromCounts = counts.qualified;
  if (typeof qualifiedFromCounts === 'number' && qualifiedFromCounts !== qualifiedRegistry.size) {
    throw new Error(`Manifest counts.qualified (${qualifiedFromCounts}) != registry length (${qualifiedRegistry.size})`);
  }
  // Known 371bf3 qualified: 4680 (NSE:EQ 2390/BSE:A 700/BSE:B 1590) — but we validate via set, not hardcoded splits here.
  // The verifier `scripts/w28_verify_manifest.py` checks those breakdowns; we check digest+pipeline+shape+count consistency.

  const proposedRegistry = json.proposed ? new Set(json.proposed as string[]) : undefined;
  const p04Universe = json.p04Universe ? new Set(json.p04Universe as string[]) : undefined;
  const providerUniverse = json.providerUniverse ? new Set(json.providerUniverse as string[]) : undefined;

  return {
    manifestCommit: json.manifestCommit ?? W28_EXPECTED_MANIFEST_COMMIT,
    pipelineCommit: json.pipelineCommit ?? W28_EXPECTED_PIPELINE_COMMIT,
    manifestSha256: sha256,
    qualifiedRegistry,
    proposedRegistry,
    p04Universe,
    providerUniverse,
    registryVersion: `${(json.manifestCommit ?? W28_EXPECTED_MANIFEST_COMMIT).slice(0, 7)}@qualified-${qualifiedRegistry.size}`,
    qualifiedCount: qualifiedRegistry.size,
    counts: counts as Readonly<Record<string, number>>,
    generatedAt: (json as unknown as Record<string, unknown>).generatedAt as string ?? null,
  };
}

/** Build a synthetic registry snapshot for tests (no file). */
export function syntheticRegistrySnapshot(overrides: Partial<LoadedRegistrySnapshot> = {}): LoadedRegistrySnapshot {
  const qualified = new Set<string>(['C-RL|NSE_EQ|ISIN:INE002A01018:EQ']);
  return {
    manifestCommit: W28_EXPECTED_MANIFEST_COMMIT,
    pipelineCommit: W28_EXPECTED_PIPELINE_COMMIT,
    manifestSha256: W28_EXPECTED_MANIFEST_SHA256,
    qualifiedRegistry: qualified,
    qualifiedCount: qualified.size,
    counts: { qualified: qualified.size },
    generatedAt: null,
    registryVersion: 'synthetic@1',
    ...overrides,
  };
}
