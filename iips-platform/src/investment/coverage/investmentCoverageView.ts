/**
 * IID — the INVESTMENT coverage view, rendered on the server.
 *
 * WHY THIS EXISTS (`G-10`)
 *   `/investment/coverage` is the Investment Coverage capability's path. Until 2026-11-17 the only HTML
 *   served there was the *identity* capability's view (`COVERAGE_ROUTES.html`): it answered
 *   `503 Investment identity coverage unavailable` whenever the eligible roster, listing map or
 *   corporate-action table could not be loaded — while the investment JSON route beside it answered
 *   `200` from the dataset, which needs none of those files. A reader with JavaScript disabled, or one
 *   following a bookmark to the transport's own port, was therefore told that *coverage* was unavailable
 *   when the coverage the path promises was available. That is the recorded `G-10` exception: the raw
 *   transport path served the wrong capability's HTML.
 *
 * WHAT IT RENDERS
 *   The same report the JSON route publishes (`/api/investment/coverage/investment`), from the same read
 *   model, with no client state, no fetched numbers and no script. It mirrors the SPA page
 *   (`InvestmentCoveragePage`) field for field: dataset disclosure, counts, sector measurement, issuer
 *   coverage, ingestion issues, the IID-0 financial-coverage disclosure and the notes. Where the identity
 *   sources are absent, that is disclosed here and on each issuer row — exactly as the SPA does — and it
 *   is never a page-level failure, because the investment position does not depend on an identity file.
 *
 * SAFETY
 *   Every interpolated value is HTML-escaped; a hostile `legalName` cannot inject markup. The view loads
 *   nothing: no script, no stylesheet, no font, no image. `default-src 'none'` in the response headers is
 *   therefore honest rather than aspirational.
 */
import type {
  InvestmentCoverageIssuerRow,
  InvestmentCoverageReport,
  InvestmentCoverageState,
} from './investmentCoverage';

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

const STATES: readonly InvestmentCoverageState[] = [
  'COVERED',
  'NO_FINANCIALS',
  'SECTOR_NOT_MEASURED',
  'ISSUED_DATA',
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeValue(value: unknown): string {
  return escapeHtml(value === null || value === undefined ? '' : String(value));
}

function stateClass(state: string): string {
  switch (state) {
    case 'COVERED':
      return 'ok';
    case 'SECTOR_NOT_MEASURED':
    case 'ISSUED_DATA':
      return 'warn';
    case 'NO_FINANCIALS':
      return 'bad';
    default:
      return '';
  }
}

/** Digest values are long; a dataset with no snapshot publishes a short literal (`NONE`) instead. */
function shortDigest(value: string): string {
  return value.length <= 16 ? value : `${value.slice(0, 16)}…`;
}

/** The row-level identity disclosure, in the same three states the SPA page renders. */
function identityDependencyCell(row: InvestmentCoverageIssuerRow): string {
  if (row.identityDependency === null) {
    return `<span class="muted">not evaluated${
      row.identityDependencyDetail === null
        ? ''
        : `<br><span class="muted">${escapeHtml(row.identityDependencyDetail)}</span>`
    }</span>`;
  }
  if (row.identityDependency === 'UNRESOLVED') {
    return `<span class="warn">unresolved${
      row.identityDependencyDetail === null
        ? ''
        : `<br><span class="muted">${escapeHtml(row.identityDependencyDetail)}</span>`
    }</span>`;
  }
  return '<span class="ok">resolved</span>';
}

function datasetRows(report: InvestmentCoverageReport): string {
  const dataset = report.dataset;
  const rows: string[] = [
    `<tr><td>Dataset class</td><td>${escapeHtml(dataset.datasetClass)}</td></tr>`,
  ];
  if (dataset.sourceRights !== undefined && dataset.sourceRights !== null) {
    const rights = dataset.sourceRights;
    rows.push(
      `<tr><td>Source rights</td><td>${escapeHtml(rights.state)}${
        rights.basis === '' ? '' : `<div class="muted">${escapeHtml(rights.basis)}</div>`
      }</td></tr>`,
    );
  }
  rows.push(
    `<tr><td>Dataset version</td><td><code>${escapeHtml(shortDigest(dataset.datasetVersion))}</code></td></tr>`,
    `<tr><td>Content digest</td><td><code>${escapeHtml(shortDigest(dataset.contentDigest))}</code></td></tr>`,
    `<tr><td>Provider</td><td>${escapeHtml(dataset.provider)}</td></tr>`,
    `<tr><td>Licence</td><td>${escapeHtml(dataset.licence)}</td></tr>`,
    `<tr><td>Quality</td><td>${escapeHtml(dataset.quality)}</td></tr>`,
    `<tr><td>Completeness</td><td>${dataset.completenessPct}%</td></tr>`,
    `<tr><td>Data as of / known as of</td><td>${escapeHtml(dataset.dataAsOf ?? 'unknown')} / ${escapeHtml(
      dataset.knownAsOf ?? 'unknown',
    )}</td></tr>`,
    `<tr><td>Imported at</td><td>${escapeHtml(dataset.lastImportAt)}</td></tr>`,
    `<tr><td>Issuers / securities / listings</td><td>${dataset.issuers} / ${dataset.securities} / ${dataset.listings}</td></tr>`,
    `<tr><td>Annual / quarterly periods</td><td>${dataset.annualPeriods} / ${dataset.quarterlyPeriods}</td></tr>`,
    `<tr><td>Prices / operating metrics / corporate actions</td><td>${dataset.prices} / ${dataset.operatingMetricRecords} / ${dataset.corporateActions}</td></tr>`,
    `<tr><td>Earliest / latest period end</td><td>${escapeHtml(dataset.earliestPeriodEnd ?? 'none')} / ${escapeHtml(
      dataset.latestPeriodEnd ?? 'none',
    )}</td></tr>`,
  );
  return rows.join('\n');
}

function sectorRows(report: InvestmentCoverageReport): string {
  return report.sectors
    .map(
      (sector) => `<tr>
<td>${escapeHtml(sector.sector)}</td>
<td>${escapeHtml(sector.stage)}</td>
<td>${sector.issuersConsidered.length}</td>
</tr>`,
    )
    .join('\n');
}

function issuerRows(report: InvestmentCoverageReport): string {
  if (report.issuers.length === 0) {
    const message =
      report.dataset.datasetClass === 'NONE'
        ? 'No investment dataset is installed, so no issuer is covered.'
        : 'The installed dataset declares no issuer, so no issuer is covered.';
    return `<p role="status">${escapeHtml(message)}</p>`;
  }
  const rows = report.issuers
    .map(
      (row) => `<tr>
<td class="state ${stateClass(row.state)}">${escapeHtml(row.state)}${
        row.issueCodes.length === 0 ? '' : `<div class="muted">${escapeHtml(row.issueCodes.join(', '))}</div>`
      }</td>
<td>${escapeHtml(row.legalName)}<div class="muted"><code>${escapeHtml(row.issuerId)}</code></div></td>
<td>${escapeHtml(row.sector)}</td>
<td>${row.annualPeriods} annual / ${row.quarterlyPeriods} quarterly${
        row.latestPeriodEnd === null ? '' : `<div class="muted">latest ${escapeHtml(row.latestPeriodEnd)}</div>`
      }</td>
<td>${row.securities} / ${row.prices} / ${row.operatingMetrics}</td>
<td>${identityDependencyCell(row)}</td>
</tr>`,
    )
    .join('\n');
  return `<table>
<tr><th>State</th><th>Issuer</th><th>Sector</th><th>Periods</th><th>Securities / prices / metrics</th><th>Identity dependency</th></tr>
${rows}
</table>`;
}

/** The full JS-free investment-coverage page. Pure: report in, HTML out. */
export function renderInvestmentCoverageHtml(report: InvestmentCoverageReport): string {
  const counts = STATES.map(
    (state) =>
      `<tr><td class="state ${stateClass(state)}">${escapeHtml(state)}</td><td>${report.counts[state]}</td></tr>`,
  ).join('');

  const outstanding =
    report.outstandingSectors.length === 0
      ? ''
      : ` Outstanding: ${escapeHtml(report.outstandingSectors.join(', '))}.`;

  const offVocabulary =
    report.offVocabularyIssuers.length === 0
      ? ''
      : `<h2>Off-vocabulary sectors</h2>
<p class="muted">These issuers are in the dataset and have financials, but their \`sector\` matches no
canonical sector, so \`measuredSectors\` above understates the dataset and they are counted in no sector.</p>
<table>
<tr><th>Issuer</th><th>Sector as written</th><th>Reason</th><th>Canonical sector</th></tr>
${report.offVocabularyIssuers
  .map(
    (entry) => `<tr><td>${escapeHtml(entry.legalName)}<div class="muted"><code>${escapeHtml(entry.issuerId)}</code></div></td><td>${escapeHtml(
      entry.sectorAsWritten,
    )}</td><td>${escapeHtml(entry.reason)}</td><td>${escapeHtml(entry.canonicalSector ?? '—')}</td></tr>`,
  )
  .join('\n')}
</table>`;

  const issues =
    report.issues.length === 0
      ? ''
      : `<h2>Ingestion issues</h2>
<table>
<tr><th>Code</th><th>Subject</th><th>Detail</th></tr>
${report.issues
  .map(
    (issue) =>
      `<tr><td>${escapeHtml(issue.code)}</td><td>${escapeHtml(issue.subject)}</td><td>${escapeHtml(issue.detail)}</td></tr>`,
  )
  .join('\n')}
</table>`;

  const financial = report.financialCoverage;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Investment coverage — ${escapeHtml(report.asOf)}</title>
<style>${STYLE}</style>
</head>
<body>
<h1>Investment coverage</h1>
<p class="muted">as of ${escapeHtml(report.asOf)} · dataset ${escapeHtml(shortDigest(report.dataset.datasetVersion))}
(${escapeHtml(report.dataset.datasetClass)}) · generated ${escapeHtml(report.generatedAt)}</p>
<p><strong>${escapeHtml(report.statusLine)}</strong></p>
<p class="muted">This is the server-rendered view of the investment-coverage read
(<code>/api/investment/coverage/investment</code>). It needs no script: the same read model the browser
page consumes, rendered on the server. Per-row identity coverage is a different capability and has its
own view at
<a href="/identity-coverage">/identity-coverage</a>.</p>

${
  report.identitySourcesAvailable
    ? ''
    : `<h2>Identity sources are unavailable</h2>
<p class="warn">The eligible roster, listing map or corporate-action table could not be loaded, so no identity
binding could be evaluated for any issuer. This does not change the investment coverage below: it describes
the dataset, and the dataset does not depend on an identity file.${
        report.identitySourceDetail === null
          ? ''
          : ` <span class="muted">${escapeHtml(report.identitySourceDetail)}</span>`
      }</p>`
}

<h2>Dataset</h2>
<table>
${datasetRows(report)}
</table>

<h2>Counts</h2>
<table class="counts">
<tr><th>State</th><th>Issuers</th></tr>
<tr><td class="state">observed</td><td>${report.counts.observed}</td></tr>
${counts}
</table>

<h2>Sector measurement</h2>
<p class="muted">${report.measuredSectors} of ${report.totalSectors} sector(s) measured.${outstanding}</p>
<table>
<tr><th>Sector</th><th>Stage</th><th>Issuers</th></tr>
${sectorRows(report)}
</table>

${offVocabulary}

<h2>Issuer coverage</h2>
${issuerRows(report)}

${issues}

<h2>Financial coverage</h2>
<table>
<tr><td>Sectors measured</td><td>${financial.measuredSectors} of ${financial.totalSectors}</td></tr>
<tr><td>Outstanding sectors</td><td>${escapeHtml(financial.outstandingSectors.join(', ') || 'none')}</td></tr>
<tr><td>Methods usable / withheld</td><td>${financial.usableMethods} / ${financial.withheldMethods}</td></tr>
<tr><td>XBRL tags mapped</td><td>${financial.xbrlMappedTags}</td></tr>
<tr><td>Derivable line items</td><td>${financial.derivationItems}</td></tr>
<tr><td>Dataset</td><td>${escapeHtml(financial.datasetClass)}</td></tr>
</table>
<p class="muted">${escapeHtml(financial.note)}</p>

<h2>Notes</h2>
<ul>${report.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
</body>
</html>
`;
}

/**
 * The investment read genuinely failed.
 *
 * Deliberately never borrows identity wording: a dataset that cannot be read is an
 * investment-coverage failure, and saying otherwise would recreate the `G-10` defect in miniature.
 */
export function renderInvestmentCoverageUnavailableHtml(detail: string, asOf: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Investment coverage unavailable</title>
<style>${STYLE}</style>
</head>
<body>
<h1>Investment coverage is unavailable</h1>
<p>The investment dataset could not be read, so no investment coverage could be computed. Nothing is
estimated and no coverage figure is invented. This is not an identity-source problem: the investment read
does not consult the eligible roster, the listing map or the corporate-action table.</p>
<p class="muted">as of ${escapeHtml(asOf)}</p>
<p class="muted"><code>${escapeHtml(detail)}</code></p>
<p class="muted">Per-row identity coverage is a different capability and has its own view at
<a href="/identity-coverage">/identity-coverage</a>.</p>
</body>
</html>
`;
}
