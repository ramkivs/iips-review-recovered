/**
 * S6-1 — operator limits policy loaded from the documented path.
 *
 *   ${IIPS_DATA_DIR}/investment/policies/limits-policy.json
 *
 * What is proven: the path is the documented one under the application's data-root precedence; a valid file
 * yields OPERATOR_CONFIG with the file's own policyVersion; an absent file yields the labelled defaults and says
 * it was absent; a malformed, invalid, unsupported-key, empty or non-file policy fails closed and is never
 * replaced by the defaults; and OPERATOR_CONFIG cannot be reported from anything but the file actually read.
 *
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { LimitsPolicyError, SYSTEM_DEFAULT_LIMITS } from '../../../iips-platform/src/investment/disposition/limits';
import { LIMITS_POLICY_VERSION } from '../../../iips-platform/src/investment/disposition/types';
import {
  LIMITS_POLICY_FILE_NAME,
  isLimitsDisclosureConsistent,
  loadOperatorLimitsPolicy,
  resolveLimitsPolicyDir,
  resolveLimitsPolicyPath,
} from './limitsPolicySource';

const AS_OF = '2026-11-22T12:00:00.000Z';

const VALID_POLICY = {
  policyVersion: 'limits-policy/test-2026-11',
  effectiveFrom: '2026-11-01',
  singleNameMaxPct: 8,
  sectorMaxPct: { DEFAULT: 25, Technology: 20 },
};

let root: string;

function writePolicy(contents: string, dataRoot: string = root): string {
  const dir = resolveLimitsPolicyDir(dataRoot, {});
  mkdirSync(dir, { recursive: true });
  const path = join(dir, LIMITS_POLICY_FILE_NAME);
  writeFileSync(path, contents, 'utf8');
  return path;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 's6-1-limits-policy-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('the documented path', () => {
  it('is <dataRoot>/investment/policies/limits-policy.json for an explicit root', () => {
    expect(resolveLimitsPolicyPath(root, {})).toBe(join(resolve(root), 'investment', 'policies', 'limits-policy.json'));
  });

  it('falls back to IIPS_DATA_DIR when no explicit root is given', () => {
    expect(resolveLimitsPolicyPath(undefined, { IIPS_DATA_DIR: root })).toBe(
      join(resolve(root), 'investment', 'policies', 'limits-policy.json'),
    );
  });

  it('falls back to <cwd>/.iips-data when neither is set — the same precedence as identity and dataset', () => {
    expect(resolveLimitsPolicyPath(undefined, {})).toBe(
      join(resolve(process.cwd(), '.iips-data'), 'investment', 'policies', 'limits-policy.json'),
    );
  });

  it('treats a blank IIPS_DATA_DIR as unset rather than as the filesystem root', () => {
    expect(resolveLimitsPolicyPath(undefined, { IIPS_DATA_DIR: '   ' })).toBe(
      join(resolve(process.cwd(), '.iips-data'), 'investment', 'policies', 'limits-policy.json'),
    );
  });
});

describe('a valid operator policy at the documented path', () => {
  it('is loaded, applied, and reported as OPERATOR_CONFIG with the exact configured policyVersion', () => {
    const path = writePolicy(JSON.stringify(VALID_POLICY));
    const loaded = loadOperatorLimitsPolicy({ asOf: AS_OF, dataRoot: root });

    expect(loaded.source).toEqual({ kind: 'OPERATOR_FILE', path });
    expect(loaded.limits.basis).toBe('OPERATOR_CONFIG');
    expect(loaded.limits.policyVersion).toBe('limits-policy/test-2026-11');
    expect(loaded.limits.singleNameMaxPct).toBe(8);
    expect(loaded.limits.sectorMaxPct).toEqual({ DEFAULT: 25, Technology: 20 });
    expect(loaded.limits.effectiveFrom).toBe('2026-11-01T00:00:00.000Z');
    expect(isLimitsDisclosureConsistent(loaded)).toBe(true);
  });

  it('is found through IIPS_DATA_DIR when no explicit root is passed', () => {
    writePolicy(JSON.stringify(VALID_POLICY));
    const loaded = loadOperatorLimitsPolicy({ asOf: AS_OF, env: { IIPS_DATA_DIR: root } });
    expect(loaded.source.kind).toBe('OPERATOR_FILE');
    expect(loaded.limits.basis).toBe('OPERATOR_CONFIG');
    expect(loaded.limits.policyVersion).toBe(VALID_POLICY.policyVersion);
  });

  it('that is not yet in force yields the labelled defaults WITH the file disclosed and a note — not OPERATOR_CONFIG', () => {
    writePolicy(JSON.stringify({ ...VALID_POLICY, effectiveFrom: '2027-01-01' }));
    const loaded = loadOperatorLimitsPolicy({ asOf: AS_OF, dataRoot: root });

    expect(loaded.source.kind).toBe('OPERATOR_FILE');
    expect(loaded.limits.basis).toBe('SYSTEM_DEFAULT');
    expect(loaded.limits.policyVersion).toBe(`${LIMITS_POLICY_VERSION}+system-default`);
    expect(loaded.limits.notes.join(' ')).toMatch(/not yet in force/);
    expect(isLimitsDisclosureConsistent(loaded)).toBe(true);
  });
});

describe('an absent policy', () => {
  it('is handled explicitly: labelled system defaults, source ABSENT, and the path it looked at', () => {
    const loaded = loadOperatorLimitsPolicy({ asOf: AS_OF, dataRoot: root });

    expect(loaded.source).toEqual({ kind: 'ABSENT', path: resolveLimitsPolicyPath(root, {}) });
    expect(loaded.limits.basis).toBe('SYSTEM_DEFAULT');
    expect(loaded.limits.policyVersion).toBe(`${LIMITS_POLICY_VERSION}+system-default`);
    expect(loaded.limits.singleNameMaxPct).toBe(SYSTEM_DEFAULT_LIMITS.singleNameMaxPct);
    expect(loaded.limits.sectorMaxPct).toEqual({ DEFAULT: SYSTEM_DEFAULT_LIMITS.sectorMaxPct });
    expect(loaded.limits.notes.join(' ')).toMatch(/no operator limits policy is configured/);
    expect(isLimitsDisclosureConsistent(loaded)).toBe(true);
  });

  it('never reports OPERATOR_CONFIG — the defaults cannot be misreported as operator configuration', () => {
    const loaded = loadOperatorLimitsPolicy({ asOf: AS_OF, dataRoot: root });
    expect(loaded.limits.basis).not.toBe('OPERATOR_CONFIG');
    expect(loaded.source.kind).toBe('ABSENT');
  });
});

describe('a policy file that exists but is not a valid policy fails closed', () => {
  const cases: readonly [name: string, contents: string, reason: string][] = [
    ['malformed JSON', '{ "policyVersion": "x", ', 'NOT_AN_OBJECT'],
    ['a JSON array', '[1, 2, 3]', 'NOT_AN_OBJECT'],
    ['an empty file', '', 'NOT_AN_OBJECT'],
    ['a whitespace-only file', '  \n\t ', 'NOT_AN_OBJECT'],
    ['an unsupported key', JSON.stringify({ ...VALID_POLICY, sectorMaxPcts: { DEFAULT: 25 } }), 'UNKNOWN_KEY'],
    ['a missing policyVersion', JSON.stringify({ ...VALID_POLICY, policyVersion: undefined }), 'MISSING_POLICY_VERSION'],
    ['a missing effectiveFrom', JSON.stringify({ ...VALID_POLICY, effectiveFrom: undefined }), 'MISSING_EFFECTIVE_FROM'],
    ['an unparseable effectiveFrom', JSON.stringify({ ...VALID_POLICY, effectiveFrom: 'next month' }), 'INVALID_EFFECTIVE_FROM'],
    ['an out-of-range single-name cap', JSON.stringify({ ...VALID_POLICY, singleNameMaxPct: 150 }), 'OUT_OF_RANGE'],
    ['a non-numeric single-name cap', JSON.stringify({ ...VALID_POLICY, singleNameMaxPct: '8' }), 'INVALID_SINGLE_NAME_CAP'],
    ['a sector map that is not an object', JSON.stringify({ ...VALID_POLICY, sectorMaxPct: 25 }), 'INVALID_SECTOR_MAP'],
    ['a sector cap that is not a percentage', JSON.stringify({ ...VALID_POLICY, sectorMaxPct: { DEFAULT: 25, Technology: 0 } }), 'INVALID_SECTOR_CAP'],
  ];

  for (const [name, contents, reason] of cases) {
    it(`${name} → LimitsPolicyError(${reason}); defaults NOT substituted`, () => {
      writePolicy(contents);
      let thrown: unknown = null;
      try {
        loadOperatorLimitsPolicy({ asOf: AS_OF, dataRoot: root });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(LimitsPolicyError);
      expect((thrown as LimitsPolicyError).reason).toBe(reason);
    });
  }

  it('a directory at the policy path is not a policy', () => {
    mkdirSync(resolveLimitsPolicyPath(root, {}), { recursive: true });
    expect(() => loadOperatorLimitsPolicy({ asOf: AS_OF, dataRoot: root })).toThrow(LimitsPolicyError);
  });

  it('an unparseable asOf is refused rather than resolving caps against no instant', () => {
    writePolicy(JSON.stringify(VALID_POLICY));
    expect(() => loadOperatorLimitsPolicy({ asOf: 'not-an-instant', dataRoot: root })).toThrow(LimitsPolicyError);
  });
});

describe('the disclosure invariant', () => {
  it('rejects a result that claims OPERATOR_CONFIG without the file having been read', () => {
    const genuine = (() => {
      writePolicy(JSON.stringify(VALID_POLICY));
      return loadOperatorLimitsPolicy({ asOf: AS_OF, dataRoot: root });
    })();
    const forged = { limits: genuine.limits, source: { kind: 'ABSENT' as const, path: genuine.source.path } };
    expect(isLimitsDisclosureConsistent(genuine)).toBe(true);
    expect(isLimitsDisclosureConsistent(forged)).toBe(false);
  });
});
