/** Personal-use native CSV preview. Files stay in memory; no upload, save or identity claim.
 *
 * Identity is resolved only by the IPD-owned governed security master, and the counters state
 * exactly what was measured: native rows, rows individually assessed, rows resolved, rows saved.
 * A zero is never presented as a resolution result when no per-row outcome was produced.
 */
import { useRef, useState } from 'react';
import { previewBrokerHoldings, type BrokerHoldingsPreview as Preview } from '../../api/brokerHoldingsPreview';

export function BrokerHoldingsPreview() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const sequence = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  function clear() {
    sequence.current++;
    setPreview(null);
    setError('');
    setBusy(false);
    if (input.current) input.current.value = '';
  }

  async function select(file: File | undefined) {
    const current = ++sequence.current;
    setPreview(null);
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
      <p>Files are processed in this browser only, not uploaded or stored. Native rows are evidence,
        not normalized or validated portfolio holdings. Parser price defaults may apply. Canonical identity is
        assigned only where the IPD-owned governed security master resolves the row; nothing is inferred from
        company-name similarity, and an unresolved row stays unresolved.</p>
      <p><strong>Preview only — not saved.</strong> Durable portfolio saving remains unavailable.
        This is separate from the certified reference portfolio and its analytics.</p>
      <label htmlFor="broker-csv">Broker CSV (maximum 1 MiB)</label>{' '}
      <input id="broker-csv" ref={input} type="file" accept=".csv,text/csv"
        onChange={e => { void select(e.target.files?.[0]); }} />{' '}
      <button type="button" onClick={clear}>Clear preview</button>
      <div aria-live="polite">
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
