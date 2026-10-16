/** Personal-use native CSV preview. Files stay in memory; no upload, save or identity claim. */
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
      <p>Files are processed in this browser only, not uploaded or stored. Native rows are unresolved evidence,
        not normalized or validated portfolio holdings. Parser price defaults may apply. No canonical company identity is assigned.</p>
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
          <p>{preview.holdings.length} native rows. Every row remains UNRESOLVED; parsing does not validate values or authorize saving.</p>
          <p>Read at: {preview.asOf}. Content digest: <code>{preview.contentDigest}</code></p>
          {preview.holdings.length > 0 && <table>
            <caption>Native broker evidence — unresolved, not saved</caption>
            <thead><tr><th>Symbol / name</th><th>ISIN</th><th>Exchange</th><th>Quantity</th><th>Average price</th><th>Current price</th><th>Identity</th></tr></thead>
            <tbody>{preview.holdings.map((h, i) => <tr key={i}>
              <td>{h.symbol}</td><td>{h.isin ?? '—'}</td><td>{h.exchange ?? '—'}</td>
              <td>{h.quantity}</td><td>{h.averagePrice}</td><td>{h.currentPrice ?? '—'}</td><td>{h.identityStatus}</td>
            </tr>)}</tbody>
          </table>}
          {preview.errors.length > 0 && <><h3>Pipeline refusals</h3><ul>{preview.errors.map((v, i) => <li key={i}>{v}</li>)}</ul></>}
          {preview.warnings.length > 0 && <><h3>Warnings</h3><ul>{preview.warnings.map((v, i) => <li key={i}>{v}</li>)}</ul></>}
        </>}
      </div>
    </section>
  );
}
