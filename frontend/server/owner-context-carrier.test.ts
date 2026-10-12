/**
 * F-3 owner-context carrier — canonical bytes, integrity digest and materialisation.
 *
 * Proves the properties the PA mechanism decision depends on:
 *   1. the canonical bytes are exactly as decided (byte length, single trailing LF, no BOM);
 *   2. those bytes hash to the pinned digest — i.e. the integrity binding is self-consistent, so a
 *      repository change to either the grammar or the digest can never silently diverge;
 *   3. the carrier carries the approved F-1/F-2 pair and a governing-record reference;
 *   4. materialisation writes those bytes and nowhere else, and refuses a target inside a Git
 *      working tree so the carrier can never be committed.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

import {
  APPROVED_OWNER_USER_ID,
  APPROVED_TENANT_ID,
  CANONICAL_CARRIER_BYTE_LENGTH,
  CANONICAL_CARRIER_TEXT,
  GOVERNING_RECORD_ID,
  GOVERNING_RECORD_PATH,
  OWNER_CONTEXT_CARRIER_FILENAME,
  OWNER_CONTEXT_CARRIER_SCHEMA_VERSION,
  OWNER_CONTEXT_CARRIER_SHA256,
  OwnerContextCarrierLocationError,
  materialiseOwnerContextCarrier,
} from './owner-context-carrier';

const temporaryDirs: string[] = [];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-owner-context-'));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('F-3 carrier — canonical bytes', () => {
  it('is exactly the decided byte length and a single trailing LF', () => {
    const bytes = Buffer.from(CANONICAL_CARRIER_TEXT, 'utf8');
    expect(bytes.length).toBe(CANONICAL_CARRIER_BYTE_LENGTH);
    expect(CANONICAL_CARRIER_TEXT.endsWith('}\n')).toBe(true);
    expect(CANONICAL_CARRIER_TEXT.endsWith('}\n\n')).toBe(false);
    expect(CANONICAL_CARRIER_TEXT.includes('\r')).toBe(false);
    expect(bytes[0]).not.toBe(0xef); // no UTF-8 BOM
  });

  it('hashes to the pinned integrity digest', () => {
    const digest = createHash('sha256').update(Buffer.from(CANONICAL_CARRIER_TEXT, 'utf8')).digest('hex');
    expect(digest).toBe(OWNER_CONTEXT_CARRIER_SHA256);
    expect(OWNER_CONTEXT_CARRIER_SHA256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('carries the approved F-1/F-2 pair and the governing-record reference', () => {
    const doc = JSON.parse(CANONICAL_CARRIER_TEXT) as Record<string, unknown>;
    expect(Object.keys(doc)).toEqual(['carrierSchemaVersion', 'ownerUserId', 'tenantId', 'governedBy']);
    expect(doc.carrierSchemaVersion).toBe(OWNER_CONTEXT_CARRIER_SCHEMA_VERSION);
    expect(doc.ownerUserId).toBe(APPROVED_OWNER_USER_ID);
    expect(doc.tenantId).toBe(APPROVED_TENANT_ID);
    expect(doc.governedBy).toMatchObject({
      recordId: GOVERNING_RECORD_ID,
      recordPath: GOVERNING_RECORD_PATH,
    });
  });

  it('records the approved literals with their established lengths and no NUL', () => {
    expect(APPROVED_OWNER_USER_ID).toBe('owner-7f3a91c2');
    expect(APPROVED_TENANT_ID).toBe('irr-domain-4b82d6e1');
    expect(Buffer.byteLength(APPROVED_OWNER_USER_ID, 'utf8')).toBe(14);
    expect(Buffer.byteLength(APPROVED_TENANT_ID, 'utf8')).toBe(19);
    expect(APPROVED_OWNER_USER_ID.includes('\u0000')).toBe(false);
    expect(APPROVED_TENANT_ID.includes('\u0000')).toBe(false);
  });
});

describe('F-3 carrier — materialisation and recovery', () => {
  it('writes the canonical bytes and returns the path', () => {
    const dir = tempDir();
    const target = materialiseOwnerContextCarrier(dir);
    expect(target).toBe(path.join(dir, OWNER_CONTEXT_CARRIER_FILENAME));
    expect(fs.readFileSync(target, 'utf8')).toBe(CANONICAL_CARRIER_TEXT);
    expect(createHash('sha256').update(fs.readFileSync(target)).digest('hex')).toBe(
      OWNER_CONTEXT_CARRIER_SHA256,
    );
  });

  it('is idempotent — recovery re-materialises the identical bytes', () => {
    const dir = tempDir();
    const first = materialiseOwnerContextCarrier(dir);
    fs.writeFileSync(first, '{"tampered":true}\n');
    const second = materialiseOwnerContextCarrier(dir);
    expect(second).toBe(first);
    expect(fs.readFileSync(second, 'utf8')).toBe(CANONICAL_CARRIER_TEXT);
    expect(createHash('sha256').update(fs.readFileSync(second)).digest('hex')).toBe(
      OWNER_CONTEXT_CARRIER_SHA256,
    );
  });

  it('refuses a target inside a Git working tree so the carrier can never be committed', () => {
    expect(() => materialiseOwnerContextCarrier(process.cwd())).toThrow(OwnerContextCarrierLocationError);
    expect(() => materialiseOwnerContextCarrier(path.join(process.cwd(), '.iips-data'))).toThrow(
      OwnerContextCarrierLocationError,
    );
  });

  it('creates a missing target directory', () => {
    const dir = path.join(tempDir(), 'nested', 'owner-context');
    const target = materialiseOwnerContextCarrier(dir);
    expect(fs.existsSync(target)).toBe(true);
  });
});
