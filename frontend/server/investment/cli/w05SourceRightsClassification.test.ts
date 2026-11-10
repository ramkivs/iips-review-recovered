/**
 * W05 — SOURCE RIGHTS: the dataset class the operator CLI publishes, and what it is derived from.
 *
 * WHAT THIS FILE GUARDS.
 *
 * W05 asks for source/rights evidence, and the governing rule is explicit: a source is not
 * permitted merely because it exists locally, and no approval may be inferred from a provider
 * string. The class is READER-VISIBLE — it is written into the assessment and disposition
 * provenance and rendered beside the dataset version — so a reader was being told a dataset was
 * "approved" on the strength of a substring test over a free-text label the same operator wrote.
 *
 * THE GAP THIS FILE WAS WRITTEN FOR. The CLI classified a dataset as:
 *
 * ```ts
 * manifest.provider.includes('synthetic') || manifest.provider.includes('fixture')
 *   ? 'SYNTHETIC_REFERENCE'
 *   : 'APPROVED_LOCAL_INGESTION';
 * ```
 *
 * The class is now derived from the dataset's DECLARED RIGHTS EVIDENCE and from nothing else, and
 * `UNKNOWN` — not permission — is the default.
 *
 * These tests drive the REAL CLI over a REAL dataset directory, because the classification is the
 * CLI's to make. They would fail against the pre-fix classifier.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli, type CliSummary } from './generate-investment-artifacts';
import { M1_ISSUER_ID } from '../demo/m1Data';
import { M1_NOW, prepareM1Environment } from '../demo/m1Pipeline';

const env = prepareM1Environment();
afterAll(() => env.cleanup());

/**
 * Copy the M1 dataset and rewrite ONLY the manifest's rights declaration.
 *
 * Everything else — the content files, their digests, the provider, the licence — is untouched, so
 * the dataset still verifies and still assesses. The rights declaration is what varies.
 */
function datasetWithRights(
  rights: { readonly state: string; readonly basis: string; readonly note: string } | undefined,
): string {
  const root = mkdtempSync(join(tmpdir(), 'w05-rights-'));
  const dir = join(root, 'dataset');
  const source = env.datasetV1Dir;
  mkdirSync(dir, { recursive: true });

  for (const fileName of ['issuers.json', 'securities.json', 'listings.json', 'periods.json', 'prices.json', 'corporateActions.json', 'operatingMetrics.json', 'issues.json', 'manifest.json']) {
    writeFileSync(join(dir, fileName), readFileSync(join(source, fileName), 'utf8'), 'utf8');
  }

  const manifest = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8')) as Record<string, unknown>;
  if (rights === undefined) {
    delete manifest.sourceRights;
  } else {
    manifest.sourceRights = rights;
  }
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return dir;
}

async function classify(datasetDir: string): Promise<CliSummary> {
  const { exitCode, summary } = await runCli([
    '--issuer',
    M1_ISSUER_ID,
    '--data-dir',
    datasetDir,
    '--identity-dir',
    env.identityDir,
    '--db',
    env.dbPath,
    '--owner-carrier',
    env.carrierPath,
    '--generated-at',
    M1_NOW,
    '--dry-run',
  ]);
  expect(exitCode).toBe(0);
  return summary;
}

describe('W05 — the dataset class follows the declared rights evidence', () => {
  it('a dataset that declares SYNTHETIC rights is classified SYNTHETIC_REFERENCE', async () => {
    const summary = await classify(datasetWithRights({ state: 'SYNTHETIC', basis: '', note: 'a fixture' }));

    expect(summary.dataset?.datasetClass).toBe('SYNTHETIC_REFERENCE');
  });

  it('a dataset that declares OPERATOR_ASSERTED rights is classified OPERATOR_SUPPLIED', async () => {
    const summary = await classify(
      datasetWithRights({ state: 'OPERATOR_ASSERTED', basis: 'operator attestation', note: '' }),
    );

    expect(summary.dataset?.datasetClass).toBe('OPERATOR_SUPPLIED');
  });

  it('a dataset with NO rights declaration is classified UNKNOWN, not approved', async () => {
    // THE CENTRAL CASE. The pre-fix classifier promoted any dataset whose provider label did not
    // contain "synthetic"/"fixture" to an approval-claiming class. An undeclared dataset now
    // classifies as UNKNOWN: the data may be real and permitted, but nothing supplied says so.
    const summary = await classify(datasetWithRights(undefined));

    expect(summary.dataset?.datasetClass).toBe('UNKNOWN');
  });

  it('an UNKNOWN class does not restate L-004/L-009 as operator-supplied real data', async () => {
    // The limitation wording must not claim more than the evidence supports.
    const summary = await classify(datasetWithRights(undefined));

    const l004 = summary.limitations.find((entry) => entry.startsWith('L-004'))!;
    const l009 = summary.limitations.find((entry) => entry.startsWith('L-009'))!;

    expect(l004).toContain('rights evidence was not supplied');
    expect(l009).toContain('rights status');
    // The old wording asserted the data was operator-supplied real data; it must not appear.
    expect(l004).not.toContain('OPERATOR_SUPPLIED');
    expect(l009).not.toContain('OPERATOR_SUPPLIED');
  });

  it('the provider label cannot promote a dataset out of UNKNOWN', async () => {
    // The defect's signature: the provider string is what the old classifier read. The M1 provider
    // label does not contain "synthetic" or "fixture" in the way the old test looked for, and yet
    // with no rights declaration the class is UNKNOWN.
    const summary = await classify(datasetWithRights(undefined));

    expect(summary.dataset?.provider).toBeTruthy();
    expect(summary.dataset?.datasetClass).toBe('UNKNOWN');
  });
});
