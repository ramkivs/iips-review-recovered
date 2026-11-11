/** Personal-use preview plus AMEND-02 parsed-evidence retention. Raw files stay in memory.
 *
 * Identity is resolved only by the IPD-owned governed security master, and the counters state
 * exactly what was measured: native rows, rows individually assessed, rows resolved, rows saved.
 * A zero is never presented as a resolution result when no per-row outcome was produced.
 *
 * PRESENTATION
 *   This component is the shared workspace behind two routes:
 *     `/broker-holdings`              — standalone, preview-only (no commit control exists)
 *     `/user-portfolios/import`       — embedded, with the guarded Stage 4 commit surface
 *   Both render through the shared broker-workspace primitives in
 *   `components/broker/BrokerWorkspace`, so the two routes read as one application. The
 *   presentation layer adds no behaviour: every figure below is one the pipeline or the
 *   transport already produced, and no price, weight or identity is computed here.
 */
import { useMemo, useRef, useState } from 'react';
import { freezeEvidenceSubmission, type EvidenceSubmission } from '../../api/brokerEvidenceSubmission';
import { retainAndVerifyEvidence, type RetentionResult } from '../../api/brokerEvidenceRetention';
import { previewBrokerHoldings, type BrokerHoldingsPreview as Preview, type BrokerPreviewRow } from '../../api/brokerHoldingsPreview';
import { prepareBrokerImport, type PreparedBrokerImport } from '../../api/brokerImportStage4';
import type { BrokerImportSuccess } from 'iips-production-market-data/portfolio-ui';
import {
  BrokerChip,
  BrokerDisclosure,
  BrokerFormatItem,
  BrokerFormatList,
  BrokerFacts,
  BrokerFact,
  BrokerNotice,
  BrokerPageHeader,
  BrokerPanel,
  BrokerSpinner,
  BrokerSummary,
  BrokerSummaryItem,
  type ChipTone,
} from '../../components/broker/BrokerWorkspace';
import { EmptyState } from '../../components/state/StateComponents';
import { formatInr, shortDigest } from '../user-portfolios/UserPortfolioStates';
import { BrokerImportCommit } from './BrokerImportCommit';

/** Retention states as the operator must read them: label, tone and glyph. */
const RETENTION_PRESENTATION: Record<
  string,
  { readonly label: string; readonly tone: ChipTone; readonly glyph: string }
> = {
  NOT_RETAINED: { label: 'NOT RETAINED', tone: 'neutral', glyph: '·' },
  SUBMITTING: { label: 'SUBMITTING', tone: 'informational', glyph: '↻' },
  VERIFYING: { label: 'VERIFYING', tone: 'informational', glyph: '↻' },
  VERIFIED: { label: 'VERIFIED', tone: 'positive', glyph: '✓' },
  UNCONFIRMED: { label: 'UNCONFIRMED', tone: 'warning', glyph: '▲' },
  ACKNOWLEDGED_UNVERIFIED: { label: 'ACKNOWLEDGED', tone: 'warning', glyph: '▲' },
  CONFLICT: { label: 'CONFLICT', tone: 'warning', glyph: '▲' },
  TAMPERED: { label: 'TAMPERED', tone: 'critical', glyph: '!' },
  REFUSED: { label: 'REFUSED', tone: 'critical', glyph: '✕' },
  UNAVAILABLE: { label: 'UNAVAILABLE', tone: 'critical', glyph: '✕' },
};

/** The preview status word carries the operational meaning; the tone only reinforces it. */
const STATUS_TONE: Record<string, ChipTone> = {
  PARSED_IDENTITIES_RESOLVED: 'positive',
  PARSED_UNRESOLVED: 'warning',
  REJECTED: 'critical',
  BLOCKED: 'critical',
};

type SortKey = 'row' | 'symbol' | 'quantity' | 'averagePrice' | 'currentPrice' | 'identityStatus';
type SortDirection = 'asc' | 'desc';

/** Compares two rows for one column. Missing values sort last in both directions. */
function compareRows(a: BrokerPreviewRow, b: BrokerPreviewRow, key: SortKey): number {
  switch (key) {
    case 'symbol':
      return a.symbol.localeCompare(b.symbol);
    case 'quantity':
      return a.quantity - b.quantity;
    case 'averagePrice':
      return a.averagePrice - b.averagePrice;
    case 'currentPrice':
      return (a.currentPrice ?? Number.NaN) - (b.currentPrice ?? Number.NaN);
    case 'identityStatus':
      return a.identityStatus.localeCompare(b.identityStatus) || a.symbol.localeCompare(b.symbol);
    case 'row':
    default:
      return 0;
  }
}

/** A missing figure is rendered as an em dash, never as 0 and never as an invented value. */
function figure(value: number | null | undefined, format: (v: number) => string): string {
  return value === null || value === undefined || !Number.isFinite(value) ? '—' : format(value);
}

const formatQuantity = (value: number): string =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(value);

/** The standalone Broker Holdings route stays preview-only; the Broker Import host opts in. */
export function BrokerHoldingsPreview({ allowCommit = false }: { readonly allowCommit?: boolean } = {}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [snapshot, setSnapshot] = useState<EvidenceSubmission | null>(null);
  const [retention, setRetention] = useState<RetentionResult>({ state: 'NOT_RETAINED' });
  const [prepared, setPrepared] = useState<PreparedBrokerImport | null>(null);
  const [committed, setCommitted] = useState<BrokerImportSuccess | null>(null);
  const [committing, setCommitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState('');
  const [identityFilter, setIdentityFilter] = useState<'ALL' | 'RESOLVED' | 'UNRESOLVED'>('ALL');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'row', direction: 'asc' });
  // Retain the first acknowledged/verified record digest separately from transient UI states.
  const originalRecordDigest = useRef<string | undefined>(undefined);
  const retaining = retention.state === 'SUBMITTING' || retention.state === 'VERIFYING';
  const [busy, setBusy] = useState(false);
  const sequence = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  async function retain(dto: EvidenceSubmission, current: number, lookup = false) {
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', dto, lookup, fetch, state => {
      if (current === sequence.current) setRetention({ state });
    }, originalRecordDigest.current);
    if (current === sequence.current) {
      if (!originalRecordDigest.current && result.recordDigest) originalRecordDigest.current = result.recordDigest;
      // A later check that returns no digest (a lost or unusable response) must not erase the
      // digest the operator already saw acknowledged: it stays visible next to a state that
      // plainly says retrieval is not verified. It is never labelled "verified" that way, and
      // it is never injected into a state that asserts absence or non-retention, where showing
      // a digest would contradict the state itself.
      const keepsAcknowledgedDigest = result.recordDigest === undefined && originalRecordDigest.current !== undefined
        && (result.state === 'UNCONFIRMED' || result.state === 'UNAVAILABLE' || result.state === 'ACKNOWLEDGED_UNVERIFIED');
      setRetention(keepsAcknowledgedDigest ? { ...result, recordDigest: originalRecordDigest.current } : result);
    }
  }

  function clear() {
    sequence.current++;
    setPreview(null);
    setSnapshot(null);
    setPrepared(null);
    setCommitted(null);
    originalRecordDigest.current = undefined;
    setRetention({ state: 'NOT_RETAINED' });
    setError('');
    setBusy(false);
    setQuery('');
    setIdentityFilter('ALL');
    setSort({ key: 'row', direction: 'asc' });
    if (input.current) input.current.value = '';
  }

  async function select(file: File | undefined) {
    const current = ++sequence.current;
    setPreview(null);
    setSnapshot(null);
    setPrepared(null);
    setCommitted(null);
    originalRecordDigest.current = undefined;
    setRetention({ state: 'NOT_RETAINED' });
    setError('');
    setBusy(false);
    setQuery('');
    setIdentityFilter('ALL');
    setSort({ key: 'row', direction: 'asc' });
    if (!file) return;
    if (file.size > 1_048_576) { setError('Select a CSV no larger than 1 MiB.'); return; }
    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Select a CSV export. XLSX is not supported.'); return; }
    setBusy(true);
    try {
      const content = await file.text();
      // A clear or newer selection must not restore a stale personal-financial-data preview.
      if (current !== sequence.current) return;
      let commitPayload: PreparedBrokerImport | null = null;
      const result = previewBrokerHoldings(content, file.name, new Date().toISOString(), ingress => {
        if (allowCommit) commitPayload = prepareBrokerImport(ingress);
      });
      setPreview(result);
      setPrepared(commitPayload);
      if (result.status.startsWith('PARSED_') && result.holdings.length) {
        try {
          const dto = freezeEvidenceSubmission(file.name, result);
          setSnapshot(dto);
          await retain(dto, current);
        } catch {
          if (current === sequence.current) setRetention({ state: 'UNCONFIRMED', reason: 'SNAPSHOT_UNAVAILABLE' });
        }
      }
    } catch {
      if (current === sequence.current) setError('Unable to preview this CSV. Check the export format and size.');
    } finally {
      if (current === sequence.current) setBusy(false);
    }
  }

  /** Client-side view over rows the pipeline already produced. No value is recomputed. */
  const visibleRows = useMemo(() => {
    if (preview === null) return [];
    const needle = query.trim().toLowerCase();
    const filtered = preview.holdings.filter(row => {
      if (identityFilter !== 'ALL' && row.identityStatus !== identityFilter) return false;
      if (needle.length === 0) return true;
      return row.symbol.toLowerCase().includes(needle)
        || (row.isin ?? '').toLowerCase().includes(needle)
        || (row.exchange ?? '').toLowerCase().includes(needle);
    });
    if (sort.key === 'row') {
      return sort.direction === 'asc' ? filtered : [...filtered].reverse();
    }
    const sorted = [...filtered].sort((a, b) => compareRows(a, b, sort.key));
    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }, [preview, query, identityFilter, sort]);

  const sortButton = (key: SortKey, label: string) => {
    const active = sort.key === key;
    const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
    return (
      <th scope="col" aria-sort={ariaSort as 'ascending' | 'descending' | 'none'}>
        <button
          type="button"
          className="bw-sort"
          aria-sort={ariaSort as 'ascending' | 'descending' | 'none'}
          onClick={() => setSort(current =>
            current.key === key
              ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
              : { key, direction: key === 'symbol' || key === 'identityStatus' ? 'asc' : 'desc' })}
        >
          <span>{label}</span>
          <span className="bw-sort__mark" aria-hidden="true">{active ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
        </button>
      </th>
    );
  };

  const retentionChip = RETENTION_PRESENTATION[retention.state] ?? RETENTION_PRESENTATION.NOT_RETAINED;

  /* Every clause in the panel below is an operational statement the owner must see. */
  const retentionPanel = (
    <section aria-label="Evidence retention">
      {/*
        * Retention disclosure reconciled per IIPS-V3-CAP02-U1-AMEND-01 §8.4(18), rendering the
        * PA's Decision 6 of 2026-11-05. Clause 18(1) named the contradiction this block removes:
        * the copy once said files are "not uploaded or stored" while parsed evidence IS retained.
        * Both statements are now true and consistent — the raw file bytes are not retained, the
        * parsed equivalent is. This is a DISCLOSURE obligation, not a request-time consent gate:
        * the route reads no identity from a request (§8.2(10)), so no consent token, header or
        * checkbox is accepted or required here, and none may be added without a further act.
        *
        * This stays a JSX comment, as it was before the restyle. The §8.4(18) copy guard in
        * `brokerImportEvidenceRoute.test.ts` strips JSX comments before asserting on rendered
        * copy, because this explanation necessarily quotes the superseded wording; a plain JS
        * block comment would not be stripped and would trip the guard on a quoted phrase.
        *
        * The restyle changed only the container: this remains a top-level panel rather than a
        * collapsed detail, because an obligation the PA requires the owner to see is not
        * optional reading.
        */}
      <BrokerPanel
        eyebrow="Before you import"
        title="What this application retains"
        hint="Read once. These statements describe what is kept, for how long, and what retention never implies."
        secondary
        tight
      >
        <ul className="bw-retention-list">
          <li>After submission and verified retrieval, parsed broker-import evidence <strong>is retained locally</strong> in this application&apos;s own
            data directory on this machine, so that a retained unresolved import survives a process restart. Check the per-import retention status below; a preview alone is not retained evidence. Retention is
            <strong> indefinite</strong> and ends only when the application owner
            <strong> explicitly deletes</strong> it. There is <strong>no automatic deletion or purge</strong>,
            no expiry and no compaction, and the <strong>50 MB</strong> figure reported with your stored
            evidence is a <strong>warning</strong> and review point only — crossing it deletes nothing,
            blocks nothing and is not a quota.</li>
          <li>The <strong>raw CSV bytes are not retained</strong>. The retained equivalent is the
            <strong> parsed row inventory</strong>, the content and record <strong>digest</strong> values,
            the per-row identity evidence and the pipeline&apos;s refusal details.</li>
          <li>Retained evidence is served <strong>only within the single personal owner scope</strong> of
            this application, is <strong>never transmitted to any third party</strong>, and
            <strong> no route enumerates</strong> evidence records — one record is retrievable only by its
            own import identifier, and there is no list endpoint.</li>
          <li>Retention of evidence is <strong>not a save</strong>, not a validation, not an authorization
            and not durability of holdings: the preview snapshot&apos;s <code>savedRows</code> is 0 at capture time.
            Retaining evidence never commits a holding, and a retained record never implies that a portfolio write was
            authorized or performed. A later successful commit is reported separately from this immutable snapshot.</li>
        </ul>
      </BrokerPanel>
    </section>
  );

  /* ---------------------------------------------------------------- *
   * Upload
   * ---------------------------------------------------------------- */
  const uploadPanel = (
    <BrokerPanel
      eyebrow="Step 1 of 3"
      title="Select broker statement"
      hint="Dhan (Detailed and Web UI), Zerodha and Groww CSV preview. No broker login or live API connection."
    >
      <div
        className={dragging ? 'bw-drop bw-drop--over' : 'bw-drop'}
        onDragOver={event => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          void select(event.dataTransfer.files?.[0]);
        }}
      >
        <div className="bw-drop__row">
          <div className="bw-field bw-drop__file">
            <label className="bw-label" htmlFor="broker-csv">Broker CSV (maximum 1 MiB)</label>
            <input id="broker-csv" className="bw-control" ref={input} type="file" accept=".csv,text/csv"
              disabled={committing || busy}
              onChange={e => { void select(e.target.files?.[0]); }} />
          </div>
          <button type="button" className="bw-btn" onClick={clear} disabled={committing}>Clear preview</button>
        </div>
        <p className="bw-drop__note">
          The file is parsed in this browser. Its raw bytes are not uploaded — only the parsed row
          inventory, digests and per-row identity evidence can be retained, as described above.
        </p>
        {busy ? <BrokerSpinner label="Reading CSV…" /> : null}
      </div>
      {error ? <BrokerNotice tone="critical" alert title="This file was not previewed">{error}</BrokerNotice> : null}
      {/*
        * Open by default. This is an operational warning about integrity and durability,
        * not background detail: it was unconditionally visible before this restyle and it
        * stays visible. Only genuinely supplementary material belongs in a collapsed
        * disclosure.
        */}
      <BrokerDisclosure summary="Storage and integrity limits" open>
        <p>Evidence is a browser pipeline snapshot, not server-authenticated identity. Raw content digests cannot be rechecked without the raw file. Single-writer operation is required; no cross-process lock, explicit fsync or power-loss guarantee is provided.</p>
      </BrokerDisclosure>
      {allowCommit ? (
        <BrokerNotice tone="informational" glyph="◆">
          <p>Parsed evidence is retained in the <code>DEFAULT_PORTFOLIO</code> evidence slot; the portfolio commit destination selected below is separate. Evidence retention alone is not proof of a commit.</p>
        </BrokerNotice>
      ) : null}
    </BrokerPanel>
  );

  /* ---------------------------------------------------------------- *
   * Parsed result
   * ---------------------------------------------------------------- */
  const resultPanel = preview !== null && (
    <BrokerPanel
      eyebrow="Step 2 of 3"
      title={`${preview.broker} — ${preview.status}`}
      aside={<BrokerChip label={preview.status} tone={STATUS_TONE[preview.status] ?? 'neutral'} glyph="◉" />}
      hint={
        allowCommit
          ? <>Preview is not a save. Review the parsed evidence below; a separate explicit commit can send a fully qualified import to IPD&apos;s independently guarded portfolio store. This is separate from the certified reference portfolio.</>
          : <>This screen parses a CSV in the browser and retains the parsed evidence. It has no save path at all.</>
      }
    >
      <BrokerSummary>
        <BrokerSummaryItem label="Native rows" value={preview.counts.nativeRows} sub="parsed from the export" />
        <BrokerSummaryItem label="Assessed" value={preview.counts.identityAssessedRows} sub="individual outcomes" />
        <BrokerSummaryItem label="Resolved" value={preview.counts.identityResolvedRows} sub="canonical identity" />
        <BrokerSummaryItem
          label="Saved"
          value={committed ? `${committed.holdingsPersisted}` : `${preview.counts.savedRows}`}
          sub={committed ? 'reported by the last acknowledged portfolio receipt' : 'at preview capture'}
        />
        <BrokerSummaryItem label="Unresolved" value={preview.counts.identityUnresolvedRows} sub="assessed, not resolved" />
      </BrokerSummary>

      <p className="bw-counts-line">{preview.counts.nativeRows} native rows · {preview.counts.identityAssessedRows} individually assessed ·
        {' '}{preview.counts.identityResolvedRows} resolved · {committed
          ? `${committed.holdingsPersisted} holdings reported by the last acknowledged portfolio receipt`
          : `${preview.counts.savedRows} saved`}.</p>

      <BrokerFacts>
        <BrokerFact label="Format">{preview.variant ?? 'not reported'}</BrokerFact>
        <BrokerFact label="Identity authority">{preview.identityAuthority.source} ({preview.identityAuthority.entities} entities)</BrokerFact>
        <BrokerFact label="Read at">{preview.asOf}</BrokerFact>
        <BrokerFact label="Content digest"><span className="bw-mono">{preview.contentDigest}</span></BrokerFact>
      </BrokerFacts>

      {preview.identitySummary ? (
        <BrokerNotice
          tone={preview.identitySummary.saveable ? 'positive' : 'warning'}
          title={preview.identitySummary.saveable
            ? 'Every assessed row resolved'
            : 'The whole import stays refused (P04) while any row is unresolved'}
        >
          <p>{preview.counts.identityUnresolvedRows} unresolved ·{' '}
            {preview.perRowIdentityEvidencePublished
              ? 'every row carries its own identity outcome'
              : 'the pipeline published no per-row outcome, so rows are marked file-level'} ·{' '}
            {preview.identitySummary.saveable
              ? 'the pipeline reports the import as saveable only when every assessed row resolved.'
              : 'the pipeline reports the import as saveable only when every assessed row resolved.'}</p>
          {Object.keys(preview.identitySummary.refusalCodes).length > 0 ? (
            <p>Refusal codes: {Object.entries(preview.identitySummary.refusalCodes)
              .map(([code, n]) => `${code} × ${n}`).join(', ')}.</p>
          ) : null}
        </BrokerNotice>
      ) : (
        <p className="bw-counts-line">{preview.counts.identityUnresolvedRows} unresolved ·{' '}
          {preview.perRowIdentityEvidencePublished
            ? 'every row carries its own identity outcome'
            : 'the pipeline published no per-row outcome, so rows are marked file-level'}.</p>
      )}

      <p className="bw-muted">Files are parsed in this browser and their raw bytes are not uploaded. Native rows are evidence,
        not normalized or validated portfolio holdings. Parser price defaults may apply. Canonical identity is
        assigned only where the IPD-owned governed security master resolves the row; nothing is inferred from
        company-name similarity, and an unresolved row stays unresolved. Parsing does not validate values,
        authorize a save or persist anything.</p>
    </BrokerPanel>
  );

  /* ---------------------------------------------------------------- *
   * Holdings table
   * ---------------------------------------------------------------- */
  const tablePanel = preview !== null && preview.holdings.length > 0 && (
    <BrokerPanel
      eyebrow="Parsed holdings"
      title="Native broker evidence"
      hint="The preview snapshot, not a portfolio read. No market value or weight is published by the preview pipeline, so neither is shown."
      tight
    >
      <div className="bw-toolbar">
        <div className="bw-field bw-toolbar__search">
          <label className="bw-label" htmlFor="broker-holdings-search">Search symbol, ISIN or exchange</label>
          <input id="broker-holdings-search" className="bw-control" type="search" value={query}
            placeholder="RELIANCE, INE002A01018, NSE"
            onChange={event => setQuery(event.target.value)} />
        </div>
        <div className="bw-field bw-toolbar__filter">
          <label className="bw-label" htmlFor="broker-holdings-identity">Identity</label>
          <select id="broker-holdings-identity" className="bw-control" value={identityFilter}
            onChange={event => setIdentityFilter(event.target.value as 'ALL' | 'RESOLVED' | 'UNRESOLVED')}>
            <option value="ALL">All rows</option>
            <option value="RESOLVED">Resolved only</option>
            <option value="UNRESOLVED">Unresolved only</option>
          </select>
        </div>
        <p className="bw-toolbar__count">
          Showing {visibleRows.length} of {preview.holdings.length} parsed rows. Sorting and filtering
          reorder what you already parsed — they never re-resolve an identity.
        </p>
      </div>

      <div className="bw-table-wrap">
        <table className="bw-table">
          <caption>Native broker evidence — the preview snapshot, not a portfolio read</caption>
          <thead>
            <tr>
              {sortButton('symbol', 'Symbol / name')}
              <th scope="col">ISIN</th>
              <th scope="col">Exchange</th>
              {sortButton('quantity', 'Quantity')}
              {sortButton('averagePrice', 'Average price')}
              {sortButton('currentPrice', 'Current price')}
              {sortButton('identityStatus', 'Identity')}
              <th scope="col">Identity evidence</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((h, i) => (
              <tr key={`${h.symbol}-${i}`}>
                <td>
                  <span className="bw-cell-primary">
                    <span className="bw-cell-primary__main">{h.symbol}</span>
                    <span className="bw-cell-primary__sub">{h.identifierClass ?? 'identifier class not reported'}</span>
                  </span>
                </td>
                <td className="bw-mono">{h.isin ?? '—'}</td>
                <td>{h.exchange ?? '—'}</td>
                <td className="bw-num">{formatQuantity(h.quantity)}</td>
                <td className="bw-num">{figure(h.averagePrice, formatInr)}</td>
                <td className="bw-num">{figure(h.currentPrice, formatInr)}</td>
                <td>
                  <span className="bw-cell-primary">
                    <span className="bw-cell-primary__main">{h.identityStatus}</span>
                    <span className="bw-cell-primary__sub">{h.identityBasis.replace(/_/g, ' ').toLowerCase()}</span>
                  </span>
                </td>
                <td>
                  <span className="bw-cell-primary">
                    <span>{h.identityRefusalCode ?? h.identityBasis}
                      {h.lookups.length > 0 && <> · {h.lookups
                        .map((l) => `${l.identifierType}:${l.outcome}`).join(' · ')}</>}
                      {h.quarantineIds.length > 0 && <> · P04 × {h.quarantineIds.length}</>}</span>
                    {h.missingEvidence !== null ? (
                      <span className="bw-cell-primary__sub">{h.missingEvidence}</span>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleRows.length === 0 ? (
        <EmptyState label="No parsed row matches the current search and identity filter." />
      ) : null}
    </BrokerPanel>
  );

  /* ---------------------------------------------------------------- *
   * Retention status and actions
   * ---------------------------------------------------------------- */
  const retentionStatusPanel = (
    <BrokerPanel
      eyebrow="Step 3 of 3"
      title="Retained evidence"
      hint="Retention of parsed evidence is automatic after a successful parse. It is not a portfolio save."
      tight
      aside={preview !== null ? <BrokerChip label={retentionChip.label} tone={retentionChip.tone} glyph={retentionChip.glyph} /> : null}
    >
      <div aria-live="polite">
        {preview !== null ? (
          <div className="bw-retention">
            <p role="status" className="bw-retention__status">{({
              NOT_RETAINED: 'Evidence not retained.', SUBMITTING: 'Submitting parsed evidence…', VERIFYING: 'Verifying evidence through A-9…',
              VERIFIED: committed ? 'Evidence retained and retrievable. Portfolio commitment is reported separately below.' : 'Evidence retained and retrievable. Holdings not saved.',
              UNCONFIRMED: 'Evidence retention unconfirmed. Check retained evidence or explicitly retry the original snapshot.',
              ACKNOWLEDGED_UNVERIFIED: 'Retention acknowledged; retrieval not verified.',
              CONFLICT: 'Evidence conflict: the original record was preserved. This snapshot was not accepted.',
              TAMPERED: 'The retained record failed its own integrity check and was not served. It is not reported as absent and must not be edited or replaced in place.',
              REFUSED: 'The evidence request was refused by the application. It did not retain a new record.',
              UNAVAILABLE: 'Evidence storage was unavailable. The retention outcome is unknown: nothing is claimed retained or absent.',
            })[retention.state]}{retention.importId && <> Import ID: <code>{retention.importId}</code></>}
              {retention.recordDigest && <> {retention.state === 'VERIFIED' ? 'Verified record digest' : 'Acknowledged record digest'}: <code>{retention.recordDigest}</code></>}
              {retention.duplicate === true && retention.state === 'VERIFIED' && <> Duplicate retry: the original record and digest were preserved.</>}
              {retention.duplicate === true && retention.state !== 'VERIFIED' && <> Duplicate was acknowledged, but retrieval is not verified.</>}
              {retention.reason === 'TRANSPORT_FAILURE' && <> Transport failure: the request did not receive a usable response; evidence is not reported absent or retrieved.</>}
              {retention.reason === 'OWNER_CONTEXT_UNAVAILABLE' && <> Owner context unavailable: the evidence request was refused; no conclusion about previously retained evidence can be drawn.</>}
              {retention.reason === 'SERVER_FAILURE' && <> The evidence server reported a failure; retrieval is not confirmed.</>}
              {retention.reason === 'DIGEST_MISMATCH' && <> Evidence integrity or snapshot digest mismatch; retrieval was not verified.</>}
              {retention.reason === 'SNAPSHOT_UNAVAILABLE' && <> Original snapshot or its identifier is unavailable; no replacement was submitted.</>}
            </p>
            {/*
              * The action row is rendered whenever a snapshot exists and no retention attempt is
              * in flight. It is NOT hidden once retention reaches VERIFIED: a verified snapshot
              * still has a reachable "Check retained evidence" action, and every distinct
              * non-verified state (not retained, tampered, refused, unavailable, conflict,
              * acknowledged-but-unverified) keeps the explicit retry available. Hiding the row
              * on VERIFIED previously left the operator with a terminal label and no action,
              * which is how a retention attempt became indistinguishable from a dead end.
              */}
            {snapshot && !retaining ? (
              <div className="bw-actions">
                <button type="button" className="bw-btn" onClick={() => { void retain(snapshot, sequence.current, true); }}>Check retained evidence</button>{' '}
                {(allowCommit || retention.state !== 'VERIFIED') && <button type="button" className="bw-btn" onClick={() => { void retain(snapshot, sequence.current); }}>Retry original evidence snapshot</button>}
              </div>
            ) : null}
            {retaining ? <BrokerSpinner label={retention.state === 'VERIFYING' ? 'Verifying retained evidence…' : 'Submitting parsed evidence…'} /> : null}
            {allowCommit && !snapshot ? (
              <p>Original evidence snapshot unavailable: retry is unavailable until a CSV has been selected in this session. Selecting a CSV creates a new snapshot, not a retry of an old one.</p>
            ) : null}
            {!allowCommit && !snapshot && preview !== null ? (
              <p className="bw-muted">No snapshot was retained for this selection, so there is nothing to re-check. Selecting a CSV creates a new snapshot, not a retry of an old one.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </BrokerPanel>
  );

  const refusalsPanel = preview !== null && preview.errors.length > 0 && (
    <BrokerNotice tone="critical" title="Pipeline refusals">
      <p>The whole-import refusal below names one row only. It does not replace the per-row
        identity evidence in the table: every row above was individually assessed.</p>
      <ul>{preview.errors.map((v, i) => <li key={i}>{v}</li>)}</ul>
    </BrokerNotice>
  );

  const warningsPanel = preview !== null && preview.warnings.length > 0 && (
    <BrokerNotice tone="warning" title="Warnings">
      <ul>{preview.warnings.map((v, i) => <li key={i}>{v}</li>)}</ul>
    </BrokerNotice>
  );

  const emptyPanel = preview === null && !busy && !error ? (
    <BrokerPanel title="No statement loaded" hint="Select a broker CSV to parse it in this browser.">
      <EmptyState label="No broker statement has been parsed yet. Parsed rows and their identity evidence appear here." />
    </BrokerPanel>
  ) : null;

  const formatsPanel = (
    <BrokerPanel
      eyebrow="Reference"
      title="Supported broker formats"
      hint="Detected from the file header. A format the detector does not recognise is rejected rather than guessed."
      secondary
      tight
    >
      <BrokerFormatList>
        <BrokerFormatItem name="Dhan" variant="DHAN_DETAILED_HOLDINGS_V1"
          detail="Trading Symbol, ISIN, Exchange, Total Qty, Average Buy Price. Carries the identifiers the governed master resolves directly." />
        <BrokerFormatItem name="Dhan" variant="DHAN_WEB_UI_SUMMARY_V1"
          detail="Name, Quantity, Avg Price, Last Traded. Supplies no ISIN and no exchange, so only an exact governed key or alias can resolve." />
        <BrokerFormatItem name="Zerodha" variant="ZERODHA_HOLDINGS_V1" detail="Standard Zerodha holdings export." />
        <BrokerFormatItem name="Groww" variant="GROWW_HOLDINGS_V1" detail="Standard Groww holdings export." />
      </BrokerFormatList>
    </BrokerPanel>
  );

  const body = (
    <>
      {allowCommit ? null : (
        <BrokerPageHeader
          eyebrow="Import evidence"
          title="Broker Holdings"
          lede="Parse a broker statement in this browser and inspect the native rows, their governed identity outcomes and the retained evidence. This screen has no save path: committing holdings happens on the Broker Import screen, through the same pipeline and the same whole-import identity gate."
          meta={[
            <BrokerChip key="mode" label="PREVIEW ONLY — NOT SAVED" tone="informational" glyph="◇" />,
            <BrokerChip key="master" label="IPD GOVERNED P04 SECURITY MASTER" tone="neutral" glyph="◆" />,
          ]}
        />
      )}

      {/*
        * Preview-only disclosure. It is rendered before any file is selected, because the
        * boundary it describes applies to the screen, not to a particular statement: this
        * surface has no save path, and the commit-capable surface is a separate route that
        * runs the same pipeline and the same governed whole-import identity gate.
        */}
      {allowCommit ? null : (
        <BrokerNotice tone="informational" title="Preview only — not saved">
          <p>Nothing on this screen is written to the portfolio store. This screen parses a CSV
            in the browser and retains the parsed evidence; it has no save path at all. The
            separate{' '}
            {/* A plain anchor keeps this component mountable outside a router, which its own
                tests do. */}
            <a href="/user-portfolios/import">Broker Import</a>{' '}screen is the one that can
            commit holdings, and it commits only through the governed whole-import identity gate
            — which is applied on the store side, never here. This is separate from the certified
            reference portfolio and its analytics.</p>
        </BrokerNotice>
      )}

      {formatsPanel}
      {uploadPanel}
      {emptyPanel}
      {resultPanel}
      {tablePanel}
      {refusalsPanel}
      {warningsPanel}
      {retentionStatusPanel}
      {allowCommit && preview ? (
        <BrokerImportCommit key={`${preview.contentDigest}-${preview.asOf}`}
          prepared={prepared} onSuccess={setCommitted} onBusyChange={setCommitting} />
      ) : null}
      {retentionPanel}
    </>
  );

  return allowCommit ? (
    <section aria-label="Broker Holdings preview">{body}</section>
  ) : (
    <section aria-label="Broker Holdings preview" className="bw-page">
      {body}
      <BrokerPanel title="Source and lineage" secondary tight>
        <BrokerFacts>
          <BrokerFact label="Content digest">
            {preview === null ? 'No statement parsed in this session.' : <span className="bw-mono">{shortDigest(preview.contentDigest)}</span>}
          </BrokerFact>
          <BrokerFact label="Identity authority">IPD-owned governed D05 security master — resolution is never performed by this application.</BrokerFact>
          <BrokerFact label="Lineage">Every row above carries the broker&apos;s own identifier and the pipeline&apos;s own lookup evidence, in the order attempted.</BrokerFact>
        </BrokerFacts>
      </BrokerPanel>
    </section>
  );
}
