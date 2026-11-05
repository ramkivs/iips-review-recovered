/**
 * IID-1 — the minimal coverage view.
 *
 * Server-rendered HTML from the same report the JSON endpoint returns: no client state, no script, no
 * fetched numbers. An unresolved row shows its state, its reason and its raw observation — and shows no
 * company metric of any kind, because there is no identity to attach one to.
 */
import type { CoverageItem, IdentityCoverageReport } from './coverage';
import { RESOLUTION_STATES } from './types';
import type { SourceIssue } from './sources';

const STYLE = `
:root { color-scheme: light dark; }
body { font: 14px/1.5 system-ui, -apple-system, Segoe UI, sans-serif; margin: 2rem; max-width: 1100px; }
h1 { font-size: 1.4rem; margin-bottom: .25rem; }
h2 { font-size: 1.05rem; margin-top: 2rem; }
table { border-collapse: collapse; width: 100%; margin-top: .5rem; }
th, td { text-align: left; padding: .35rem .5rem; border-bottom: 1px solid rgba(128,128,128,.35); vertical-align: top; }
code, pre { font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
pre { white-space: pre-wrap; word-break: break-word; margin: .25rem 0 0; opacity: .85; }
.muted { opacity: .75; }
.state { font-weight: 600; }
.ok { color: #14713b; }
.warn { color: #9a5b00; }
.bad { color: #a12622; }
.counts td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
`.trim();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stateClass(state: string): string {
  if (state === 'RESOLVED') return 'ok';
  if (state === 'OUT_OF_SCOPE_SECURITY' || state === 'INELIGIBLE') return 'warn';
  return 'bad';
}

function rawRow(item: CoverageItem): string {
  const entries = Object.entries(item.raw);
  if (entries.length === 0) return '<span class="muted">no raw fields</span>';
  return `<pre>${escapeHtml(entries.map(([key, value]) => `${key}=${String(value)}`).join('\n'))}</pre>`;
}

function identityCell(item: CoverageItem): string {
  if (item.state === 'RESOLVED') {
    return [
      `<code>${escapeHtml(item.resolution.issuerId ?? '')}</code>`,
      `<code>${escapeHtml(item.resolution.securityId ?? '')}</code>`,
      `<code>${escapeHtml(item.resolution.listingId ?? '')}</code>`,
    ].join('<br>');
  }
  if (item.resolution.issuerId !== null) {
    // Identity known but not assessable: state the identity, still show no metrics.
    return `<code>${escapeHtml(item.resolution.issuerId)}</code><br><span class="muted">identity known, not assessed</span>`;
  }
  return '<span class="muted">no identity</span>';
}

export function renderCoverageHtml(report: IdentityCoverageReport): string {
  const countRows = RESOLUTION_STATES.map(
    (state) => `<tr><td class="state ${stateClass(state)}">${escapeHtml(state)}</td><td>${report.counts[state]}</td></tr>`,
  ).join('');

  const sourceRows = (Object.keys(report.bySource) as (keyof typeof report.bySource)[])
    .map(
      (source) =>
        `<tr><td>${escapeHtml(source)}</td><td>${report.bySource[source].observed}</td><td>${report.bySource[source].resolved}</td><td>${report.bySource[source].unresolved}</td><td>${report.bySource[source].assessable}</td></tr>`,
    )
    .join('');

  const itemRows = report.items
    .map(
      (item) => `<tr>
        <td><span class="state ${stateClass(item.state)}">${escapeHtml(item.state)}</span>${
          item.reason === null ? '' : `<br><span class="muted">${escapeHtml(item.reason)}</span>`
        }</td>
        <td>${escapeHtml(item.source)}${item.portfolioId === null ? '' : ` <span class="muted">(${escapeHtml(item.portfolioId)})</span>`}</td>
        <td>${identityCell(item)}</td>
        <td>${item.reasonText === null ? '' : escapeHtml(item.reasonText)}${item.detail === null ? '' : `<br><span class="muted">${escapeHtml(item.detail)}</span>`}${
          item.candidates.length === 0
            ? ''
            : `<br><span class="muted">candidates: ${escapeHtml(item.candidates.join(', '))}</span>`
        }${rawRow(item)}</td>
      </tr>`,
    )
    .join('');

  const successorRows = report.successorReconciliations
    .map(
      (reconciliation) => `<tr>
        <td>${escapeHtml(reconciliation.actionId)}</td>
        <td>${escapeHtml(reconciliation.type)}</td>
        <td>${escapeHtml(reconciliation.effectiveDate)}</td>
        <td>${reconciliation.slices
          .map((slice) =>
            slice.mapped
              ? `${escapeHtml(slice.issuerId ?? '')} @ ${slice.ratio}`
              : `<span class="warn">UNMAPPED slice @ ${slice.ratio}${slice.reason === null ? '' : ` (${escapeHtml(slice.reason)})`}</span>`,
          )
          .join('<br>')}</td>
        <td>${reconciliation.measuredWeight}</td>
        <td>${reconciliation.unmeasuredWeight}</td>
        <td>${reconciliation.reconciles ? 'yes' : 'NO'}</td>
      </tr>`,
    )
    .join('');

  const financial = report.financialCoverage;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Investment identity coverage — ${escapeHtml(report.asOf)}</title>
<style>${STYLE}</style>
</head>
<body>
<h1>Investment identity coverage</h1>
<p class="muted">as of ${escapeHtml(report.asOf)} · generated ${escapeHtml(report.generatedAt)} · roster
<code>${escapeHtml(report.identitySources.rosterVersion.slice(0, 23))}…</code> (${escapeHtml(report.identitySources.rosterLabel)},
${escapeHtml(report.identitySources.rosterDataClass)})</p>
<p><strong>${escapeHtml(report.statusLine)}</strong></p>

<h2>Counts by resolution state</h2>
<table class="counts">
<tr><th>State</th><th>Rows</th></tr>
<tr><td class="state">observed</td><td>${report.counts.observed}</td></tr>
<tr><td class="state ok">assessable</td><td>${report.counts.assessable}</td></tr>
${countRows}
</table>

<h2>By source</h2>
<table>
<tr><th>Source</th><th>Observed</th><th>Resolved</th><th>Unresolved</th><th>Assessable</th></tr>
${sourceRows}
</table>

<h2>Every observed row</h2>
<table>
<tr><th>State</th><th>Source</th><th>Identity</th><th>Reason / raw observation</th></tr>
${itemRows}
</table>

${
  successorRows === ''
    ? ''
    : `<h2>Corporate-action successor reconciliation</h2>
<table>
<tr><th>Action</th><th>Type</th><th>Effective</th><th>Slices</th><th>Measured weight</th><th>Unmeasured weight</th><th>Reconciles</th></tr>
${successorRows}
</table>`
}

<h2>Financial coverage is not identity coverage</h2>
<table>
<tr><td>Sectors measured</td><td>${financial.measuredSectors} of ${financial.totalSectors}</td></tr>
<tr><td>Outstanding sectors</td><td>${escapeHtml(financial.outstandingSectors.join(', ') || 'none')}</td></tr>
<tr><td>Methods usable / withheld</td><td>${financial.usableMethods} / ${financial.withheldMethods}</td></tr>
<tr><td>XBRL tags mapped</td><td>${financial.xbrlMappedTags}</td></tr>
<tr><td>Derivable line items</td><td>${financial.derivationItems}</td></tr>
<tr><td>Unmapped tags seen</td><td>${escapeHtml(financial.unmappedTagsObserved.join(', ') || 'none recorded in this run')}</td></tr>
<tr><td>Dataset class</td><td>${escapeHtml(financial.datasetClass)}</td></tr>
</table>
<p class="muted">${escapeHtml(financial.note)}</p>

<h2>Notes</h2>
<ul>${report.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
<p class="muted">No company metric is shown for a row without an identity, and none for a row whose identity is
not assessable. This view reports identity only.</p>
</body>
</html>
`;
}

export function renderUnavailableHtml(issues: readonly SourceIssue[], asOf: string): string {
  const rows = issues
    .map(
      (issue) =>
        `<tr><td><code>${escapeHtml(issue.file)}</code></td><td>${escapeHtml(issue.code)}</td><td>${escapeHtml(issue.subject)}</td><td>${escapeHtml(issue.detail)}</td></tr>`,
    )
    .join('');
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Investment identity coverage unavailable</title><style>${STYLE}</style></head>
<body>
<h1>Identity coverage is unavailable</h1>
<p>The eligible roster, listing map or corporate-action table could not be loaded, so no identity can be
established and no row is classified. This is a fail-closed state: nothing is guessed, and no substitute
roster is used.</p>
<p class="muted">as of ${escapeHtml(asOf)}</p>
<table>
<tr><th>File</th><th>Code</th><th>Subject</th><th>Detail</th></tr>
${rows}
</table>
</body>
</html>
`;
}
