/**
 * MoSPI live E2E reconciliation — Arena egress cause-chain probe (READ-ONLY).
 *
 * Prints, for each target, the HTTP outcome or the FULL `error.cause` chain so
 * the failure layer (DNS / TCP / TLS / proxy / HTTP) is identifiable rather
 * than guessed. No credentials, no Authorization header, no state change.
 *
 * Run: node arena-egress-probe.mjs
 */
const targets = [
  ['CPI (app route, documented)',    'https://api.mospi.gov.in/api/cpi/getCPIIndex?base_year=2012&series=Current&Format=JSON&limit=1'],
  ['CPI (Windows-documented exact)', 'https://api.mospi.gov.in/api/cpi/getCPIIndex?base_year=2012&series=Current&state_code=99&Format=JSON&page=1'],
  ['IIP (app route /api/iip/getIipData)', 'https://api.mospi.gov.in/api/iip/getIipData?base_year=2022-23&frequency=Annually&type=Sectoral&category_code=2&subcategory_code=022011-1210&Format=JSON&limit=1&page=1'],
  ['IIP (Windows-documented exact /api/iip/getIIPMonthly)', 'https://api.mospi.gov.in/api/iip/getIIPMonthly?base_year=2011-12&type=General&Format=JSON&page=1'],
  ['NAS (app route, PUBLIC host)',   'https://api.mospi.gov.in/api/nas/getNASData?base_year=2022-23&series=Current&frequency_code=Annually&indicator_code=1&Format=JSON&limit=1&page=1'],
  ['NAS (Windows-tested, PRIVATE server)', 'http://10.24.89.9:5000/api/nas/getNASData?series=Current&frequency_code=Annually&indicator_code=1&Format=JSON&page=1'],
  ['OpenAPI spec on public host',    'https://api.mospi.gov.in/layout/swagger_user_nas.yaml'],
  ['CONTROL github.com (allowlisted)','https://github.com/robots.txt'],
];

const TIMEOUT_MS = 8000;

function causeChain(e) {
  const out = [];
  let c = e;
  for (let i = 0; i < 6 && c; i += 1) {
    out.push(
      `${c.name || '?'}: ${c.message || String(c)}` +
        (c.code ? ` [code=${c.code}]` : '') +
        (c.errno ? ` [errno=${c.errno}]` : ''),
    );
    c = c.cause;
  }
  return out.join('  <=  ');
}

for (const [label, url] of targets) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const r = await fetch(url, { signal: ac.signal, headers: { Accept: 'application/json' } });
    const text = await r.text();
    console.log(
      `\n[${label}]\n  URL: ${url}\n  outcome: HTTP ${r.status} ${r.headers.get('content-type') || ''} bytes=${text.length} in ${Date.now() - started}ms\n  body head: ${JSON.stringify(text.slice(0, 200))}`,
    );
  } catch (e) {
    console.log(
      `\n[${label}]\n  URL: ${url}\n  outcome: FETCH FAILED after ${Date.now() - started}ms (no HTTP response received)\n  cause chain: ${causeChain(e)}`,
    );
  } finally {
    clearTimeout(timer);
  }
}
