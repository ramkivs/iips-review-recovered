/**
 * NP-06 Reports — owner resolver verification tests.
 *
 * Verifies path configuration, uncached read, integrity digest enforcement, grammar checks,
 * value checks, and fail-closed resolution.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  CANONICAL_REPORTS_CARRIER_TEXT,
  materialiseReportsOwnerCarrier,
} from './reports-owner-carrier';
import {
  REPORTS_OWNER_PATH_ENV,
  evaluateReportsOwnerContext,
  resolveReportsOwnerContext,
  validateReportsCarrierBytes,
} from './reports-owner-resolver';

const temporaryDirs: string[] = [];
const savedPath = process.env[REPORTS_OWNER_PATH_ENV];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reports-resolver-test-'));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  if (savedPath === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = savedPath;
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('NP-06 Reports owner resolver', () => {
  it('returns path-not-configured when environment variable is unset', () => {
    delete process.env[REPORTS_OWNER_PATH_ENV];
    const res = evaluateReportsOwnerContext();
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('path-not-configured');
    expect(resolveReportsOwnerContext()).toBeNull();
  });

  it('resolves the approved owner context from a valid materialised carrier', () => {
    const dir = tempDir();
    const carrierFile = materialiseReportsOwnerCarrier(dir);
    process.env[REPORTS_OWNER_PATH_ENV] = carrierFile;

    const res = evaluateReportsOwnerContext();
    expect(res.ok).toBe(true);
    expect(res.reason).toBe('ok');
    expect(res.context).toEqual({
      tenantId: APPROVED_REPORTS_TENANT_ID,
      ownerUserId: APPROVED_REPORTS_OWNER_USER_ID,
    });
    expect(resolveReportsOwnerContext()).toEqual({
      tenantId: APPROVED_REPORTS_TENANT_ID,
      ownerUserId: APPROVED_REPORTS_OWNER_USER_ID,
    });
  });

  it('fails closed on tampered carrier (integrity mismatch)', () => {
    const dir = tempDir();
    const carrierFile = path.join(dir, 'reports-owner-context.json');
    fs.writeFileSync(carrierFile, CANONICAL_REPORTS_CARRIER_TEXT + ' ');
    process.env[REPORTS_OWNER_PATH_ENV] = carrierFile;

    const res = evaluateReportsOwnerContext();
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('integrity-mismatch');
    expect(resolveReportsOwnerContext()).toBeNull();
  });

  it('fails closed on empty or oversized carrier', () => {
    expect(validateReportsCarrierBytes(Buffer.from('')).reason).toBe('carrier-empty');
    expect(validateReportsCarrierBytes(Buffer.alloc(5000)).reason).toBe('carrier-too-large');
  });

  it('fails closed when carrier is removed (immediate per-request revocation)', () => {
    const dir = tempDir();
    const carrierFile = materialiseReportsOwnerCarrier(dir);
    process.env[REPORTS_OWNER_PATH_ENV] = carrierFile;
    expect(resolveReportsOwnerContext()).not.toBeNull();

    // Remove file
    fs.unlinkSync(carrierFile);
    expect(evaluateReportsOwnerContext().reason).toBe('carrier-unreadable');
    expect(resolveReportsOwnerContext()).toBeNull();
  });
});
