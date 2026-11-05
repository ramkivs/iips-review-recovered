/** Personal-use preview plus AMEND-02 parsed-evidence retention. Raw files stay in memory.
 *
 * Identity is resolved only by the IPD-owned governed security master, and the counters state
 * exactly what was measured: native rows, rows individually assessed, rows resolved, rows saved.
 * A zero is never presented as a resolution result when no per-row outcome was produced.
 */
import { useRef, useState } from 'react';
import { freezeEvidenceSubmission, type EvidenceSubmission } from '../../api/brokerEvidenceSubmission';
import { retainAndVerifyEvidence, type RetentionResult } from '../../api/brokerEvidenceRetention';
import { previewBrokerHoldings, type BrokerHoldingsPreview as Preview } from '../../api/brokerHoldingsPreview';

export function BrokerHoldingsPreview() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [snapshot, setSnapshot] = useState<EvidenceSubmission | null>(null);
  const [retention, setRetention] = useState<RetentionResult>({ state: 'NOT_RETAINED' });
  const retaining = retention.state === 'SUBMITTING' || retention.state === 'VERIFYING';

  async function retain(dto: EvidenceSubmission, current: number, lookup = false) {
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', dto, lookup, fetch, state => {
      if (current === sequence.current) setRetention({ state });
    });
    if (current === sequence.current) setRetention(result);
  }
  const [busy, setBusy] = useState(false);
  const sequence = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  function clear() {
    sequence.current++;
    setPreview(null);
    setSnapshot(null);
    setRetention({ state: 'NOT_RETAINED' });
    setError('');
    setBusy(false);
    if (input.current) input.current.value = '';
  }

  async function select(file: File | undefined) {
    const current = ++sequence.current;
    setPreview(null);
    setSnapshot(null);
    setRetention({ state: 'NOT_RETAINED' });
    setError('');
    setBusy(false);
    if (!file) return;
    if (file.size > 1_048_576) { setError('Select a CSV no larger than 1 MiB.'); return; }
    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Select a CSV export. XLSX is not supported.'); return; }
    setBusy(true);
    try {
      const content = await file.text();
      // A clear or newer selection must not restore a stale personal-financial-data preview.
      if (current !== sequence.current) return;
      const result = previewBrokerHoldings(content, file.name, new Date().toISOString());
      setPreview(result);
      if (result.status.startsWith('PARSED_') && result.holdings.length) {
        try {
          const dto = freezeEvidenceSubmission(file.name, result);
          setSnapshot(dto);
          await retain(dto, current);
        } catch {
          if (current === sequence.current) setRetention({ state: 'NOT_RETAINED' });
        }
      }
    } catch {
      if (current === sequence.current) setError('Unable to preview this CSV. Check the export format and size.');
    } finally {
      if (current === sequence.current) setBusy(false);
    }
  }

  return (
    <section aria-label="Broker Holdings preview">
      <h2>Broker Holdings</h2>
      <p>Dhan (Detailed and Web UI), Zerodha and Groww CSV preview. No broker login or live API connection.</p>
      <p>Files are parsed in this browser and their raw bytes are not uploaded. Native rows are evidence,
        not normalized or validated portfolio holdings. Parser price defaults may apply. Canonical identity is
        assigned only where the IPD-owned governed security master resolves the row; nothing is inferred from
        company-name similarity, and an unresolved row stays unresolved.</p>
      <p><strong>Preview only — not saved.</strong> Durable portfolio saving remains unavailable.
        This is separate from the certified reference portfolio and its analytics.</p>
      {/*
        * Retention disclosure reconciled per IIPS-V3-CAP02-U1-AMEND-01 §8.4(18), rendering the PA's
        * Decision 6 of 2026-11-05. Clause 18(1) named the contradiction this block removes: the copy
        * above once said files are "not uploaded or stored" while parsed evidence IS retained. Both
        * statements are now true and consistent — the raw file bytes are not retained, the parsed
        * equivalent is. This is a DISCLOSURE obligation, not a request-time consent gate: the route
        * reads no identity from a request (§8.2(10)), so no consent token, header or checkbox is
        * accepted or required here, and none may be added without a further act.
        */}
      <section aria-label="Evidence retention">
        <h3>What this application retains</h3>
        <ul>
          <li>After submission and verified retrieval, parsed broker-import evidence <strong>is retained locally</strong> in this application's own
            data directory on this machine, so that a retained unresolved import survives a process restart. Check the per-import retention status below; a preview alone is not retained evidence. Retention is
            <strong> indefinite</strong> and ends only when the application owner
            <strong> explicitly deletes</strong> it. There is <strong>no automatic deletion or purge</strong>,
            no expiry and no compaction, and the <strong>50 MB</strong> figure reported with your stored
            evidence is a <strong>warning</strong> and review point only — crossing it deletes nothing,
            blocks nothing and is not a quota.</li>
          <li>The <strong>raw CSV bytes are not retained</strong>. The retained equivalent is the
            <strong> parsed row inventory</strong>, the content and record <strong>digest</strong> values,
            the per-row identity evidence and the pipeline's refusal details.</li>
          <li>Retained evidence is served <strong>only within the single personal owner scope</strong> of
            this application, is <strong>never transmitted to any third party</strong>, and
            <strong> no route enumerates</strong> evidence records — one record is retrievable only by its
            own import identifier, and there is no list endpoint.</li>
          <li>Retention of evidence is <strong>not a save</strong>, not a validation, not an authorization
            and not durability of holdings: <code>savedRows</code> stays 0 and
            <code>WRITE_NOT_AUTHORIZED</code> is unchanged.</li>
        </ul>
      </section>
      <label htmlFor="broker-csv">Broker CSV (maximum 1 MiB)</label>{' '}
      <input id="broker-csv" ref={input} type="file" accept=".csv,text/csv"
        onChange={e => { void select(e.target.files?.[0]); }} />{' '}
      <button type="button" onClick={clear}>Clear preview</button>
      <p>Evidence is a browser pipeline snapshot, not server-authenticated identity. Raw content digests cannot be rechecked without the raw file. Single-writer operation is required; no cross-process lock, explicit fsync or power-loss guarantee is provided.</p>
      <div aria-live="polite">
        {preview && <p role="status">{({
          NOT_RETAINED: 'Evidence not retained.', SUBMITTING: 'Submitting parsed evidence…', VERIFYING: 'Verifying evidence through A-9…',
          VERIFIED: 'Evidence retained and retrievable. Holdings not saved.',
          UNCONFIRMED: 'Evidence retention unconfirmed. Check retained evidence or explicitly retry the original snapshot.',
          ACKNOWLEDGED_UNVERIFIED: 'Retention acknowledged; retrieval not verified.',
          CONFLICT: 'Evidence conflict: the original record was preserved. This snapshot was not accepted.',
        })[retention.state]}{retention.importId && <> Import ID: <code>{retention.importId}</code></>}</p>}
        {snapshot && !retaining && retention.state !== 'VERIFIED' && <>
          <button type="button" onClick={() => { void retain(snapshot, sequence.current, true); }}>Check retained evidence</button>{' '}
          <button type="button" onClick={() => { void retain(snapshot, sequence.current); }}>Retry original evidence snapshot</button>
        </>}
        {busy && <p>Reading CSV…</p>}
        {error && <p role="alert">{error}</p>}
        {preview && <>
          <h3>{preview.broker} — {preview.status}</h3>
          {preview.variant && <p>Format: {preview.variant}</p>}
          <p>{preview.counts.nativeRows} native rows · {preview.counts.identityAssessedRows} individually assessed ·
            {' '}{preview.counts.identityResolvedRows} resolved · {preview.counts.savedRows} saved.</p>
          <p>{preview.counts.identityUnresolvedRows} unresolved ·
            {' '}{preview.perRowIdentityEvidencePublished
              ? 'every row carries its own identity outcome'
              : 'the pipeline published no per-row outcome, so rows are marked file-level'} ·
            {preview.identitySummary && !preview.identitySummary.saveable
              ? ' the whole import stays refused (P04) while any row is unresolved.'
              : ' the pipeline reports the import as saveable only when every assessed row resolved.'}</p>
          {preview.identitySummary && Object.keys(preview.identitySummary.refusalCodes).length > 0 && (
            <p>Refusal codes: {Object.entries(preview.identitySummary.refusalCodes)
              .map(([code, n]) => `${code} × ${n}`).join(', ')}.</p>
          )}
          <p>Identity authority: {preview.identityAuthority.source} ({preview.identityAuthority.entities} entities).
            Parsing does not validate values, authorize a save or persist anything.</p>
          <p>Read at: {preview.asOf}. Content digest: <code>{preview.contentDigest}</code></p>
          {preview.holdings.length > 0 && <table>
            <caption>Native broker evidence — unresolved, not saved</caption>
            <thead><tr><th>Symbol / name</th><th>ISIN</th><th>Exchange</th><th>Quantity</th><th>Average price</th><th>Current price</th><th>Identity</th><th>Identity evidence</th></tr></thead>
            <tbody>{preview.holdings.map((h, i) => <tr key={i}>
              <td>{h.symbol}</td><td>{h.isin ?? '—'}</td><td>{h.exchange ?? '—'}</td>
              <td>{h.quantity}</td><td>{h.averagePrice}</td><td>{h.currentPrice ?? '—'}</td><td>{h.identityStatus}</td>
              <td>{h.identityRefusalCode ?? h.identityBasis}
                {h.lookups.length > 0 && <> · {h.lookups
                  .map((l) => `${l.identifierType}:${l.outcome}`).join(' · ')}</>}
                {h.quarantineIds.length > 0 && <> · P04 × {h.quarantineIds.length}</>}</td>
            </tr>)}</tbody>
          </table>}
          {preview.errors.length > 0 && <><h3>Pipeline refusals</h3>
            <p>The whole-import refusal below names one row only. It does not replace the per-row
              identity evidence in the table: every row above was individually assessed.</p>
            <ul>{preview.errors.map((v, i) => <li key={i}>{v}</li>)}</ul></>}
          {preview.warnings.length > 0 && <><h3>Warnings</h3><ul>{preview.warnings.map((v, i) => <li key={i}>{v}</li>)}</ul></>}
        </>}
      </div>
    </section>
  );
}
