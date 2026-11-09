/**
 * WS-A — durable broker-import evidence retention (unit).
 *
 * Proves the IRR-owned retention leg: the complete parsed 68-row evidence, the content digest,
 * the source metadata and read timestamp, the per-row identity basis, the pipeline refusal, and
 * the explicit non-performed validation/authorization/persistence decisions are retained durably
 * and re-verified on every read; duplicates do not append; tampering fails closed; a storage
 * failure is never reported as retention.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { previewBrokerHoldings } from '../../src/api/brokerHoldingsPreview';
import {
  BROKER_IMPORT_EVIDENCE_SCHEMA,
  BrokerImportEvidenceError,
  BrokerImportEvidenceStore,
  buildBrokerImportEvidence,
  computeEvidenceRecordDigest,
} from './brokerImportEvidenceStore';

const AT = '2026-11-05T07:50:49.090Z';
const TENANT = 'tenant-ws-a';
const OWNER = 'owner-ws-a';
const CSV = fs.readFileSync(
  path.join(process.cwd(), 'server', 'broker-import', '__fixtures__', 'dhan-web-ui-summary-68.csv'),
  'utf8',
);

function scope() {
  return { tenantId: TENANT, ownerUserId: OWNER, portfolioSlot: 'P1-BROKER', fileName: 'Portfolio(2).csv' };
}

function record() {
  return buildBrokerImportEvidence({ ...scope(), preview: previewBrokerHoldings(CSV, 'Portfolio(2).csv', AT) });
}

describe('WS-A broker-import evidence retention', () => {
  let dataDir: string;

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-a-evidence-'));
  });

  afterEach(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  it('retains the complete 68-row inventory, digest, metadata and refusal', () => {
    const store = new BrokerImportEvidenceStore({ dataDir });
    const built = record();
    const retained = store.retain(built);

    expect(retained.duplicate).toBe(false);
    const read = store.read(TENANT, OWNER, retained.recordId);
    expect(read.schema).toBe(BROKER_IMPORT_EVIDENCE_SCHEMA);
    expect(read.rows).toHaveLength(68);
    expect(read.rows.map((r) => r.rowIndex)).toEqual(Array.from({ length: 68 }, (_, i) => i + 1));
    expect(read.rows[0].symbol).toBe('AGI GREENPAC');
    expect(read.rows[0].isin).toBeNull();
    expect(read.rows[0].exchange).toBeNull();
    expect(read.rows[67].symbol).toBe('WEBSOL ENERGY SYSTEM');
    expect(read.contentDigest).toBe(built.contentDigest);
    expect(read.readAt).toBe(AT);
    expect(read.fileName).toBe('Portfolio(2).csv');
    expect(read.variant).toBe('DHAN_WEB_UI_SUMMARY_V1');
    expect(read.status).toBe('PARSED_UNRESOLVED');
    expect(read.pipelineRefusals).toHaveLength(1);
    expect(read.pipelineRefusals[0].reason).toBe('UNMAPPED_IDENTITY');
    expect(read.pipelineRefusals[0].details).toMatch(/UNMAPPED_IDENTIFIER/);
    // Pin advance to IPD PR #127 (7bcae35): the pipeline now assesses EVERY native row before the
    // single whole-import P04 refusal, so the retained counts record real per-row outcomes.
    // Dependency alignment to IPD PR #145 (709fd13), retained at PR #146 (d5e20c15): the governed
    // D05 master is IPD's authenticated universe (2,390 records), which resolves AGI GREENPAC, GHCL
    // and KROSS; the retained counts carry IPD's per-row outcomes verbatim. PR #146 changes no
    // published byte of the ./portfolio-ui closure, so these expectations are unchanged.
    expect(read.counts).toEqual({
      nativeRows: 68,
      identityAssessedRows: 68,
      identityResolvedRows: 3,
      identityUnresolvedRows: 65,
      savedRows: 0,
    });
    // P04 quarantine evidence for the unresolved identities is retained per row.
    // Under IPD's authenticated universe (IPD PR #145) AGI GREENPAC, GHCL and KROSS resolve
    // natively; every other row still carries its two P04 quarantine records.
    expect(read.rows[0].identityStatus).toBe('RESOLVED');
    expect(read.rows[0].identityBasis).toBe('PIPELINE_RESOLVED');
    expect(read.rows[0].identityRefusalCode).toBeNull();
    expect(read.rows[0].quarantineIds).toEqual([]);
    const unresolved = read.rows.filter((r) => r.identityStatus !== 'RESOLVED');
    expect(unresolved).toHaveLength(65);
    expect(unresolved.every((r) => r.identityStatus === 'UNRESOLVED')).toBe(true);
    expect(unresolved.every((r) => r.identityBasis === 'PIPELINE_ASSESSED_UNRESOLVED')).toBe(true);
    expect(unresolved.every((r) => r.identityRefusalCode === 'NO_AUTHORITATIVE_IDENTIFIER_MATCH')).toBe(true);
    expect(unresolved.every((r) => r.quarantineIds.length === 2)).toBe(true);
    expect(unresolved.every((r) => r.quarantineIds.every((id) => typeof id === 'string' && id.length > 0))).toBe(true);
    expect(new Set(read.rows.flatMap((r) => r.quarantineIds)).size).toBe(130);
    expect(read.limitations.some((l) => /Per-row refusal codes and P04 quarantine ids/.test(l))).toBe(true);
    expect(read.validation.performed).toBe(false);
    expect(read.saveAuthorization.authorized).toBe(false);
    expect(read.persistence.performed).toBe(false);
    expect(read.reconciliation).toEqual({
      importedRows: 68,
      savedRows: 0,
      difference: 68,
      disposition: 'NO_HOLDINGS_SAVED',
    });
    const { recordDigest, ...rest } = read;
    expect(recordDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(computeEvidenceRecordDigest(rest)).toBe(recordDigest);
  });

  it('is idempotent: the same import retains one record and never duplicates', () => {
    const store = new BrokerImportEvidenceStore({ dataDir });
    const first = store.retain(record());
    const second = store.retain(record());
    expect(second.duplicate).toBe(true);
    expect(second.recordId).toBe(first.recordId);
    expect(store.list(TENANT, OWNER)).toHaveLength(1);
    const journal = fs.readFileSync(path.join(dataDir, 'journal.ndjson'), 'utf8').trim().split('\n');
    expect(journal).toHaveLength(2); // version header + one create line
  });

  it('keeps owners isolated and never exposes another owner\'s evidence', () => {
    const store = new BrokerImportEvidenceStore({ dataDir });
    const retained = store.retain(record());
    expect(() => store.read(TENANT, 'another-owner', retained.recordId)).toThrow(BrokerImportEvidenceError);
    expect(store.list(TENANT, 'another-owner')).toEqual([]);
  });

  it('fails closed on a tampered journal record', () => {
    const store = new BrokerImportEvidenceStore({ dataDir });
    const retained = store.retain(record());
    const journalPath = path.join(dataDir, 'journal.ndjson');
    const lines = fs.readFileSync(journalPath, 'utf8').trim().split('\n');
    const tampered = lines[1].replace('"nativeRows":68', '"nativeRows":67');
    expect(tampered).not.toBe(lines[1]);
    fs.writeFileSync(journalPath, `${[lines[0], tampered].join('\n')}\n`);
    // A fresh store replays the journal: the tampered evidence must fail closed on read.
    const reopened = new BrokerImportEvidenceStore({ dataDir });
    expect(() => reopened.read(TENANT, OWNER, retained.recordId)).toThrow(/does not match its digest|does not match the recorded native row count/);
  });

  it('rejects an incomplete row inventory before it can be retained', () => {
    const store = new BrokerImportEvidenceStore({ dataDir });
    const built = record();
    const broken = { ...built, rows: built.rows.slice(0, 67) };
    expect(() => store.retain(broken)).toThrow(/does not match the recorded native row count/);
    expect(store.list(TENANT, OWNER)).toHaveLength(0);
  });

  it('fails closed when the journal cannot be written, and reports no retention', () => {
    const filePath = path.join(dataDir, 'not-a-directory');
    fs.writeFileSync(filePath, 'x');
    const store = new BrokerImportEvidenceStore({ dataDir: path.join(filePath, 'store') });
    expect(() => store.retain(record())).toThrow();
  });

  it('survives a store restart in this process', () => {
    const first = new BrokerImportEvidenceStore({ dataDir });
    const retained = first.retain(record());
    const reopened = new BrokerImportEvidenceStore({ dataDir });
    const recovered = reopened.read(TENANT, OWNER, retained.recordId);
    expect(recovered.recordDigest).toBe(retained.record.recordDigest);
    expect(recovered.rows).toHaveLength(68);
  });
});
