#!/usr/bin/env node
/**
 * WS-A pin-advance evidence generator (IRR-owned, reproducible).
 *
 * Runs the REAL IRR preview (`src/api/brokerHoldingsPreview.ts`) against the REAL 68-row Dhan
 * `DHAN_WEB_UI_SUMMARY_V1` fixture through the newly pinned `iips-broker-import` alias
 * (IPD PR #127 merge commit), retains the result through the REAL durable evidence journal in a
 * throwaway data directory, reads it back, and emits:
 *
 *   03-identity-assessment-68-row.json  every row's individual identity outcome + the aggregate
 *   04-evidence-record.json             the retained record as read back from the durable journal
 *
 * It writes NOTHING inside either repository worktree except these two evidence files, never
 * opens the authoritative operator data directory, never writes holdings and never resolves
 * identity itself: every value emitted is the pinned pipeline's or the governed journal's own.
 *
 * Run from `frontend/`:
 *   NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
 *     npx tsx ../evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/generate-evidence.mts
 */
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { previewBrokerHoldings } from '../../../frontend/src/api/brokerHoldingsPreview';
import {
  BrokerImportEvidenceStore,
  buildBrokerImportEvidence,
} from '../../../frontend/server/broker-import/brokerImportEvidenceStore';

const FRONTEND = path.resolve(import.meta.dirname, '../../../frontend');
const OUT = import.meta.dirname;
const CSV = path.join(FRONTEND, 'server/broker-import/__fixtures__/dhan-web-ui-summary-68.csv');
const FILE_NAME = 'Portfolio(2).csv';
const AT = '2026-11-05T07:50:49.090Z';
const TENANT = 'T-WS-A-PIN-ADVANCE';
const OWNER = 'U-WS-A-EVIDENCE-GENERATOR';
const SLOT = 'P1-BROKER';

const content = fs.readFileSync(CSV, 'utf8');
const profile = JSON.parse(
  fs.readFileSync(path.join(FRONTEND, 'broker-import-package-profile.json'), 'utf8'),
) as { aliasCommit: string; aliasSpecifier: string };

const preview = previewBrokerHoldings(content, FILE_NAME, AT);

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-a-pin-advance-evidence-'));
const store = new BrokerImportEvidenceStore({ dataDir });
const record = buildBrokerImportEvidence({
  tenantId: TENANT, ownerUserId: OWNER, portfolioSlot: SLOT, fileName: FILE_NAME, preview,
});
const retained = store.retain(record);
const readBack = store.read(TENANT, OWNER, retained.recordId);
const second = store.retain(record);
const journalPath = path.join(dataDir, 'journal.ndjson');
const journalLines = fs.readFileSync(journalPath, 'utf8').trim().split('\n');

const assessment = {
  generatedBy: 'evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/generate-evidence.mts',
  generatedFrom: {
    irrRepository: 'ramkivs/iips-review-recovered',
    ipdAliasDependency: 'iips-broker-import',
    ipdAliasCommit: profile.aliasCommit,
    ipdAliasSpecifier: profile.aliasSpecifier,
    ipdMergedPullRequest: 127,
    fixture: path.relative(FRONTEND, CSV),
    fixtureSha256: createHash('sha256').update(content, 'utf8').digest('hex'),
    fileName: FILE_NAME,
    asOf: AT,
    surface: preview.variant ?? null,
  },
  identityAuthority: preview.identityAuthority,
  identitySummary: preview.identitySummary,
  counts: preview.counts,
  status: preview.status,
  perRowIdentityEvidencePublished: preview.perRowIdentityEvidencePublished,
  contentDigest: preview.contentDigest,
  wholeImportRefusal: preview.rejections,
  pipelineErrors: preview.errors,
  pipelineWarnings: preview.warnings,
  notPerformed: preview.notPerformed,
  rows: preview.holdings.map((h, i) => ({
    rowIndex: i + 1,
    symbol: h.symbol,
    isin: h.isin,
    exchange: h.exchange,
    quantity: h.quantity,
    averagePrice: h.averagePrice,
    currentPrice: h.currentPrice,
    identityStatus: h.identityStatus,
    identityBasis: h.identityBasis,
    pipelineIdentityStatus: h.pipelineIdentityStatus,
    identityRefusalCode: h.identityRefusalCode,
    identifierClass: h.identifierClass,
    lookups: h.lookups,
    quarantineRecordCount: h.quarantineIds.length,
    missingEvidence: h.missingEvidence,
  })),
  notes: [
    'Every value above is the pinned IPD pipeline\u2019s own published output. IRR resolves no identity, derives no refusal code and mints no quarantine id.',
    'P04 quarantine record ids are minted per lookup instance by the IPD-owned pipeline (ident-quar-<epochMillis>-<random>) and are therefore process-specific; they are recorded in 04-evidence-record.json for the run that retained the record and are deliberately not repeated here as though they were stable identifiers.',
    'The single whole-import refusal names only the LAST authoritative lookup of the FIRST refused row. It does not replace the per-row vector: all 68 rows carry an individual outcome.',
  ],
};

const evidenceRecord = {
  retainedThrough: 'BrokerImportEvidenceStore -> PF-1 PersistenceService (append-only journal)',
  dataDir: 'OS temporary directory (throwaway); the authoritative operator data directory was never opened',
  retention: {
    firstRetentionDuplicate: retained.duplicate,
    repeatedRetentionDuplicate: second.duplicate,
    repeatedRetentionSameRecordId: second.recordId === retained.recordId,
    readBackDigestMatchesRetained: readBack.recordDigest === retained.record.recordDigest,
    journalLineCount: journalLines.length,
    recordsForScope: store.list(TENANT, OWNER).length,
    foreignOwnerScopeInvisible: store.list(TENANT, 'some-other-owner').length === 0,
  },
  record: readBack,
};

fs.writeFileSync(path.join(OUT, '03-identity-assessment-68-row.json'), `${JSON.stringify(assessment, null, 2)}\n`);
fs.writeFileSync(path.join(OUT, '04-evidence-record.json'), `${JSON.stringify(evidenceRecord, null, 2)}\n`);
fs.rmSync(dataDir, { recursive: true, force: true });

process.stdout.write(
  `evidence written: 03-identity-assessment-68-row.json, 04-evidence-record.json\n`
  + `  counts: ${JSON.stringify(preview.counts)}\n`
  + `  summary: ${JSON.stringify(preview.identitySummary?.refusalCodes)} saveable=${preview.identitySummary?.saveable}\n`
  + `  recordDigest: ${readBack.recordDigest}\n`,
);
