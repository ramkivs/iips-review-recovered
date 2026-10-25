/**
 * NP-06 Reports — owner carrier verification tests.
 *
 * Verifies canonical bytes, SHA-256 integrity binding, materialisation safety, and location guards.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  CANONICAL_REPORTS_CARRIER_BYTE_LENGTH,
  CANONICAL_REPORTS_CARRIER_TEXT,
  GOVERNING_RECORD_DATE,
  GOVERNING_RECORD_ID,
  GOVERNING_RECORD_PATH,
  REPORTS_OWNER_CARRIER_FILENAME,
  REPORTS_OWNER_CARRIER_SCHEMA_VERSION,
  REPORTS_OWNER_CARRIER_SHA256,
  ReportsOwnerCarrierLocationError,
  materialiseReportsOwnerCarrier,
} from './reports-owner-carrier';

describe('NP-06 Reports owner carrier integrity', () => {
  it('hashes exactly to the pinned SHA-256 digest', () => {
    const digest = createHash('sha256')
      .update(Buffer.from(CANONICAL_REPORTS_CARRIER_TEXT, 'utf8'))
      .digest('hex');
    expect(digest).toBe(REPORTS_OWNER_CARRIER_SHA256);
  });

  it('matches the exact canonical byte length', () => {
    const bytes = Buffer.byteLength(CANONICAL_REPORTS_CARRIER_TEXT, 'utf8');
    expect(bytes).toBe(CANONICAL_REPORTS_CARRIER_BYTE_LENGTH);
  });

  it('parses as valid JSON carrying approved values and exact keys', () => {
    const parsed = JSON.parse(CANONICAL_REPORTS_CARRIER_TEXT) as Record<string, unknown>;
    expect(parsed.carrierSchemaVersion).toBe(REPORTS_OWNER_CARRIER_SCHEMA_VERSION);
    expect(parsed.ownerUserId).toBe(APPROVED_REPORTS_OWNER_USER_ID);
    expect(parsed.tenantId).toBe(APPROVED_REPORTS_TENANT_ID);
    expect(parsed.governedBy).toEqual({
      recordId: GOVERNING_RECORD_ID,
      recordPath: GOVERNING_RECORD_PATH,
      decisionDate: '2026-10-25',
    });
  });

  it('materialises outside a git working tree and fails inside one', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reports-carrier-test-'));
    try {
      const writtenPath = materialiseReportsOwnerCarrier(tmp);
      expect(fs.existsSync(writtenPath)).toBe(true);
      expect(fs.readFileSync(writtenPath, 'utf8')).toBe(CANONICAL_REPORTS_CARRIER_TEXT);

      // Attempting to materialise inside current repo should throw LocationError
      expect(() => materialiseReportsOwnerCarrier(__dirname)).toThrow(
        ReportsOwnerCarrierLocationError,
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
