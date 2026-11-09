/**
 * IID P6-A — runtime readiness diagnostic.
 *
 * What is proven here:
 *   • every dependency is classified, and the classification comes from the EXISTING resolvers;
 *   • the diagnostic is genuinely read-only — it creates no database, no directory and no file;
 *   • a configured database path is never reported as proof of stored assessment records;
 *   • a declared IPD binding is never reported as a verified binding;
 *   • no setting VALUE, owner pair, digest or filesystem path appears in the output;
 *   • an absent setting is reported as outstanding for THIS process, never as a host limitation.
 *
 * Synthetic fixtures and temporary directories only. No real issuer, no HTTP, no browser.
 *
 * @vitest-environment node
 */
import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { assessIidReadiness, formatIidReadiness, type DependencyFinding } from './runtimeReadiness';
import { runReadinessCli } from './cli/iid-readiness';

const created: string[] = [];

function scratch(): string {
  const dir = mkdtempSync(join(tmpdir(), 'iid-p6a-'));
  created.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of created.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** An explicitly empty environment: nothing is inherited from the test process. */
function envOf(values: Record<string, string> = {}): NodeJS.ProcessEnv {
  return { ...values } as NodeJS.ProcessEnv;
}

function findingOf(report: ReturnType<typeof assessIidReadiness>, id: string): DependencyFinding {
  const found = report.findings.find((finding) => finding.id === id);
  if (found === undefined) throw new Error(`no finding ${id}`);
  return found;
}

/** Install the governed SYNTHETIC identity fixture into a scratch data domain. */
function withIdentityFiles(root: string): void {
  const dir = join(root, 'investment', 'identity');
  mkdirSync(dir, { recursive: true });
  const base = join(process.cwd(), '..', 'iips-platform', 'tests', 'investment', 'fixtures', 'identity');
  for (const name of ['eligible-roster.json', 'listing-map.json', 'corporate-actions.json']) {
    writeFileSync(join(dir, name), readFileSync(join(base, name)));
  }
}

describe('P6-A — classification of an unconfigured process', () => {
  it('reports the read path as not ready when nothing is configured', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    expect(report.ready).toBe(false);
    expect(report.scope).toBe('LOCAL_SINGLE_USER_NON_PRODUCTION');
    expect(report.schemaVersion).toBe(1);
  });

  it('classifies all eight dependencies and covers the three capabilities', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    expect(report.findings).toHaveLength(8);
    const gates = new Set(report.findings.flatMap((finding) => finding.capabilities));
    expect([...gates].sort()).toEqual(['IID-01', 'IID-02', 'IID-03']);
  });

  it('assigns the IPD binding to IPD, not to IRR or the user host', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    const binding = findingOf(report, 'ipd-binding-precondition');
    expect(binding.ownership).toBe('ipd-owned-unavailable');
    expect(binding.actionOwner).toBe('IPD');
    expect(binding.configured).toBe(false);
  });

  it('separates repository-not-configured from user-host-provisioning', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    expect(findingOf(report, 'np04-assessment-store').ownership).toBe('irr-owned-not-configured');
    expect(findingOf(report, 'identity-files').ownership).toBe('user-host-provisioning-required');
    expect(findingOf(report, 'reports-owner-context').ownership).toBe('user-host-provisioning-required');
  });

  it('states an exact required action and an accountable owner for every outstanding dependency', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    for (const finding of report.findings) {
      if (finding.ownership.endsWith('operational')) continue;
      expect(finding.requiredAction.length).toBeGreaterThan(0);
      expect(finding.actionOwner).not.toBe('NONE');
    }
  });

  it('never claims a host limitation from this process environment', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    expect(report.disclosures.join(' ')).toMatch(/NOT evidence about any other host/);
    // No finding may assert the seven-way "not applicable" or "unknown" without cause.
    expect(report.summary['not-applicable']).toBe(0);
  });
});

describe('P6-A — the diagnostic constructs nothing', () => {
  it('does not create a database when a path is configured but absent', () => {
    const dir = scratch();
    const absent = join(dir, 'nested', 'assessment.sqlite');
    const report = assessIidReadiness({
      env: envOf({ IIPS_NP04_DATABASE_PATH: absent }),
      dataRoot: dir,
    });
    const np04 = findingOf(report, 'np04-assessment-store');
    expect(np04.configured).toBe(true);
    expect(np04.readable).toBe(false);
    expect(np04.reason).toBe('DATABASE_FILE_ABSENT');
    // The critical safety property: asking the question created neither the file nor its directory.
    expect(existsSync(absent)).toBe(false);
    expect(existsSync(join(dir, 'nested'))).toBe(false);
  });

  it('does not create the data domain when it is absent', () => {
    const parent = scratch();
    const root = join(parent, 'does-not-exist');
    assessIidReadiness({ env: envOf(), dataRoot: root });
    expect(existsSync(root)).toBe(false);
  });

  it('does not mutate the environment it was given', () => {
    const env = envOf({ IIPS_LOCAL_PERSONAL_USE: '1' });
    const before = { ...env };
    assessIidReadiness({ env, dataRoot: scratch() });
    expect(env).toEqual(before);
  });
});

describe('P6-A — configured does not mean populated or verified', () => {
  it('reports a present database file as content-unverified, never as stored assessments', () => {
    const dir = scratch();
    const db = join(dir, 'assessment.sqlite');
    writeFileSync(db, 'not-a-real-database');
    const report = assessIidReadiness({ env: envOf({ IIPS_NP04_DATABASE_PATH: db }), dataRoot: dir });
    const np04 = findingOf(report, 'np04-assessment-store');
    expect(np04.configured).toBe(true);
    expect(np04.readable).toBe(true);
    expect(np04.reason).toBe('DATABASE_FILE_PRESENT_CONTENT_UNVERIFIED');
    expect(np04.requiredAction).toMatch(/does not prove any assessment record exists/);
    // Even with the file present, an action remains outstanding.
    expect(np04.actionOwner).toBe('USER_HOST');
  });

  it('refuses a relative database path, matching NP-04', () => {
    const report = assessIidReadiness({
      env: envOf({ IIPS_NP04_DATABASE_PATH: 'relative/assessment.sqlite' }),
      dataRoot: scratch(),
    });
    const np04 = findingOf(report, 'np04-assessment-store');
    expect(np04.configured).toBe(false);
    expect(np04.reason).toBe('DATABASE_PATH_NOT_ABSOLUTE');
  });

  it('treats a declared IPD binding as a declaration, not a verified retrieval', () => {
    const report = assessIidReadiness({
      env: envOf({ IIPS_G3_IPC_BINDING_PROVISIONED: 'true' }),
      dataRoot: scratch(),
    });
    const binding = findingOf(report, 'ipd-binding-precondition');
    expect(binding.configured).toBe(true);
    expect(binding.readable).toBeNull();
    expect(binding.reason).toBe('BINDING_DECLARED_IPD_VERIFIES_PER_REQUEST');
    expect(binding.actionOwner).toBe('IPD');
  });

  it.each(['false', '0', 'no', '', 'maybe'])('does not accept %s as an affirmative binding', (value) => {
    const report = assessIidReadiness({
      env: envOf({ IIPS_G3_IPC_BINDING_PROVISIONED: value }),
      dataRoot: scratch(),
    });
    expect(findingOf(report, 'ipd-binding-precondition').configured).toBe(false);
  });

  it('reports local personal use as a condition that grants no authority', () => {
    const report = assessIidReadiness({ env: envOf({ IIPS_LOCAL_PERSONAL_USE: '1' }), dataRoot: scratch() });
    const enablement = findingOf(report, 'local-personal-use-enablement');
    expect(enablement.configured).toBe(true);
    expect(enablement.requiredAction).toMatch(/grants no authority/);
  });

  it('excludes write-path enablement from READ readiness', () => {
    const dir = scratch();
    withIdentityFiles(dir);
    const report = assessIidReadiness({ env: envOf(), dataRoot: dir });
    // Identity is operational, enablement is not, and enablement must not be the reason readiness
    // is withheld — the other read dependencies are.
    expect(findingOf(report, 'identity-files').ownership).toBe('irr-owned-operational');
    expect(findingOf(report, 'local-personal-use-enablement').configured).toBe(false);
    expect(report.ready).toBe(false);
  });
});

describe('P6-A — identity files are validated by the governed loader', () => {
  it('accepts the governed fixture set and marks identity operational', () => {
    const dir = scratch();
    withIdentityFiles(dir);
    const report = assessIidReadiness({ env: envOf(), dataRoot: dir });
    const identity = findingOf(report, 'identity-files');
    expect(identity.ownership).toBe('irr-owned-operational');
    expect(identity.readable).toBe(true);
    expect(identity.reason).toBe('IDENTITY_SOURCES_VALID');
    expect(identity.evidence).toBe('configured-runtime');
  });

  it('reports a partial set as missing rather than serving partial identity', () => {
    const dir = scratch();
    const identityDir = join(dir, 'investment', 'identity');
    mkdirSync(identityDir, { recursive: true });
    writeFileSync(join(identityDir, 'eligible-roster.json'), '{}');
    const identity = findingOf(assessIidReadiness({ env: envOf(), dataRoot: dir }), 'identity-files');
    expect(identity.readable).toBe(false);
    expect(identity.reason).toMatch(/IDENTITY_SOURCE_MISSING \(2 of 3/);
  });

  it('reports malformed identity files as invalid, with bounded codes only', () => {
    const dir = scratch();
    const identityDir = join(dir, 'investment', 'identity');
    mkdirSync(identityDir, { recursive: true });
    for (const name of ['eligible-roster.json', 'listing-map.json', 'corporate-actions.json']) {
      writeFileSync(join(identityDir, name), '{ not json');
    }
    const identity = findingOf(assessIidReadiness({ env: envOf(), dataRoot: dir }), 'identity-files');
    expect(identity.readable).toBe(false);
    expect(identity.reason).toMatch(/IDENTITY_SOURCE_INVALID/);
    expect(identity.reason).toMatch(/INVALID_JSON/);
    // The parser's raw message can contain file content; it must not be echoed.
    expect(identity.reason).not.toMatch(/not json/);
  });
});

describe('P6-A — no secret, value or path disclosure', () => {
  it('never echoes a configured value, owner pair or path in JSON or text', () => {
    const dir = scratch();
    withIdentityFiles(dir);
    const secretPath = join(dir, 'private-carrier.json');
    writeFileSync(secretPath, '{"ownerUserId":"owner-secret","tenantId":"tenant-secret"}');
    const report = assessIidReadiness({
      env: envOf({
        IIPS_DATA_DIR: dir,
        IIPS_NP04_DATABASE_PATH: join(dir, 'assessment.sqlite'),
        IIPS_REPORTS_OWNER_PATH: secretPath,
        IIPS_OWNER_CONTEXT_PATH: secretPath,
        IIPS_G2_IPC_ENDPOINT: join(dir, 'private.sock'),
      }),
      dataRoot: dir,
    });
    for (const rendered of [JSON.stringify(report), formatIidReadiness(report)]) {
      expect(rendered).not.toContain(dir);
      expect(rendered).not.toContain('owner-secret');
      expect(rendered).not.toContain('tenant-secret');
      expect(rendered).not.toContain('private-carrier.json');
      expect(rendered).not.toContain('private.sock');
      // Variable NAMES are expected and useful; values are not.
      expect(rendered).toContain('IIPS_NP04_DATABASE_PATH');
    }
  });

  it('reports a carrier integrity failure without disclosing the expected digest', () => {
    const dir = scratch();
    const carrier = join(dir, 'carrier.json');
    writeFileSync(carrier, '{"schemaVersion":1,"ownerUserId":"x","tenantId":"y"}');
    const report = assessIidReadiness({
      env: envOf({ IIPS_REPORTS_OWNER_PATH: carrier }),
      dataRoot: dir,
    });
    const findings = findingOf(report, 'reports-owner-context');
    expect(findings.readable).toBe(false);
    expect(findings.reason).toMatch(/REPORTS_OWNER_CONTEXT_UNAVAILABLE/);
    expect(JSON.stringify(report)).not.toMatch(/[a-f0-9]{64}/);
  });
});

describe('P6-A — evidence levels are not inflated', () => {
  it('never claims HTTP, browser or real-issuer evidence', () => {
    const dir = scratch();
    withIdentityFiles(dir);
    const report = assessIidReadiness({ env: envOf(), dataRoot: dir });
    for (const finding of report.findings) {
      expect(['static', 'configured-runtime']).toContain(finding.evidence);
    }
    expect(report.disclosures.join(' ')).toMatch(/No HTTP, browser or real-issuer verification/);
  });

  it('uses static evidence when only configuration was inspected', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    expect(findingOf(report, 'np04-assessment-store').evidence).toBe('static');
    expect(findingOf(report, 'ipc-endpoint').evidence).toBe('static');
  });

  it('discloses that it opened no database and contacted no peer', () => {
    const report = assessIidReadiness({ env: envOf(), dataRoot: scratch() });
    expect(report.disclosures[0]).toMatch(/no database was opened, created or migrated/);
    expect(report.disclosures[0]).toMatch(/no IPC peer was contacted/);
  });
});

describe('P6-A — CLI contract', () => {
  it('defaults to exit 0 because it is a report, not an operation', () => {
    const result = runReadinessCli(['--json']);
    expect(result.exitCode).toBe(0);
    expect(result.usageError).toBeNull();
    expect(JSON.parse(result.text).schemaVersion).toBe(1);
  });

  it('renders human-readable text by default', () => {
    const result = runReadinessCli([]);
    expect(result.text).toContain('IID runtime readiness');
    expect(result.text).toContain('READ-PATH READY:');
  });

  it('rejects an unknown argument with exit 2 and a usage line', () => {
    const result = runReadinessCli(['--wat']);
    expect(result.exitCode).toBe(2);
    expect(result.usageError).toMatch(/usage:/);
    expect(result.report).toBeNull();
  });

  it('rejects --data-dir with no value', () => {
    const result = runReadinessCli(['--data-dir']);
    expect(result.exitCode).toBe(2);
    expect(result.usageError).toMatch(/requires a value/);
  });

  it('honours --data-dir without creating it', () => {
    const parent = scratch();
    const root = join(parent, 'absent-root');
    const result = runReadinessCli(['--json', '--data-dir', root]);
    expect(result.exitCode).toBe(0);
    expect(existsSync(root)).toBe(false);
  });

  it('returns exit 1 under --strict when a read dependency is outstanding', () => {
    const parent = scratch();
    const result = runReadinessCli(['--strict', '--data-dir', join(parent, 'absent')]);
    expect(result.exitCode).toBe(1);
    expect(result.report?.ready).toBe(false);
  });
});
