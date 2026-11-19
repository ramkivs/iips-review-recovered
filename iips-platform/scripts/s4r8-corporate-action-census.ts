/** S4-R8 read-only census. Run from iips-platform: npx tsx scripts/s4r8-corporate-action-census.ts.
 * No network, source admission or durable dataset write. Digests use the production reader/manifest path. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { run } from '../src/investment/cli/ingest';
import { readDataset } from '../src/investment/ingestion/writer';
import { computeContentDigest } from '../src/investment/fundamentals/manifest';

const root = resolve(__dirname, '../..');
const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
// Pin to the authoritative baseline independently of later commits on the work branch.
const baseline = git('log', '-1', '--first-parent', '--format=%H', '--fixed-strings',
  '--grep=Merge pull request #591 from', 'origin/main');
assert.ok(baseline, 'authoritative S4-R6 merge baseline must exist');
const out = join(root, 'evidence/real-issuer/S4-R8-CORPORATE-ACTIONS-2026-11-17');
mkdirSync(out, { recursive: true });
const files = git('ls-tree', '-r', '--name-only', baseline, 'evidence/real-issuer').split('\n');
const pattern = /corporate.action|\bbonus\b|\bsplit\b|buy.?back|demerger|merger|amalgamat|scheme of arrangement|dividend|redemption|\bQIP\b|allot|rights issue|capital reduction|consolidation of shares|symbol change|name change/i;
const inventory = files.map((path) => {
  // Fail rather than attach an old blob id to changed working-tree evidence on a later replay.
  assert.equal(git('hash-object', path), git('rev-parse', `${baseline}:${path}`), `baseline evidence changed: ${path}`);
  const text = readFileSync(join(root, path), 'utf8');
  const matches = text.split(/\r?\n/).flatMap((line, index) => pattern.test(line)
    ? [{ line: index + 1, text: line.trim().replace(/\s+/g, ' ') }] : []);
  return { path, blob: git('rev-parse', `${baseline}:${path}`), matches };
});
const allFiles = git('ls-tree', '-r', '--name-only', baseline).split('\n');
const actionTables = allFiles.filter((path) => /corporate-?actions\.json$/i.test(path)).map((path) => {
  const json = JSON.parse(readFileSync(join(root, path), 'utf8'));
  const field = Array.isArray(json) ? '(array)' : 'actions' in json ? 'actions' : 'corporateActions' in json ? 'corporateActions' : 'entries';
  const actions = field === '(array)' ? json : json[field];
  assert.ok(Array.isArray(actions), path);
  return { path, field, count: actions.length, classification: path.includes('/fixtures/') ? 'SYNTHETIC_FIXTURE' : 'REPOSITORY_EVIDENCE' };
});
const e = join(root, 'evidence/real-issuer');
const historical = ['REL-1-INFOSYS-2026-11-06', 'WI7-CONSUMER-MARICO-2026-11-07', 'WI8-INDUSTRIALS-KEC-2026-11-07'].map((b) => join(e, b, 'ingest-input'));
const candidate = [historical[0]!, ...['marico', 'kec'].map((issuer) => join(e, 'S4-R3-FILING-REFRESH-2026-11-14/ingest-input', issuer))];
const temp = mkdtempSync(join(tmpdir(), 's4r8-census-'));
const datasets: unknown[] = [];
try {
  for (const [label, inputs] of [['historical_admitted', historical], ['refresh_candidate_NOT_new_O3_authority', candidate]] as const) {
    const target = join(temp, label);
    assert.equal(run([...inputs.flatMap((p) => ['--input', p]), '--dataset-dir', target, '--now', '2026-11-17T00:00:00.000Z']), 0);
    const loaded = readDataset(target);
    const digest = computeContentDigest(loaded.content);
    assert.equal(digest, loaded.manifest.contentDigest);
    assert.equal(loaded.content.corporateActions.length, 0);
    datasets.push({ label, inputs: inputs.map((p) => p.slice(root.length + 1)), contentDigest: digest,
      corporateActions: loaded.content.corporateActions.length, sourceRights: loaded.manifest.sourceRights,
      issuers: loaded.content.issuers.map((i) => ({ issuerId: i.issuerId, legalName: i.legalName })),
      securities: loaded.content.securities.map((s) => ({ securityId: s.securityId, issuerId: s.issuerId })),
      assessmentWindow: { clock: '2026-11-17T00:00:00.000Z', dataAsOf: loaded.manifest.dataAsOf,
        earliestPeriodEnd: loaded.manifest.coverage.earliestPeriodEnd, latestPeriodEnd: loaded.manifest.coverage.latestPeriodEnd } });
  }
} finally { rmSync(temp, { recursive: true, force: true }); }
writeFileSync(join(out, 'census.json'), JSON.stringify({ baseline,
  scope: 'Every tracked file under evidence/real-issuer at baseline, including source extracts, JSON, runs and READMEs; whole-repository corporate-action tables. Keyword hits are discovery, NOT admitted events. Zensar/other search or control evidence is not admitted population. No network or primary PDFs retrieved.',
  pattern: pattern.source, inspectedFiles: inventory.length, inventory, actionTables, datasets }, null, 2) + '\n');
console.log(`Wrote census: ${inventory.length} files; ${actionTables.length} tables.`);
