/**
 * CV-51 real-Chromium loopback qualification B-1..B-6 (one-pass, 2026-10-25).
 * Drives the REAL stack: Vite dev (127.0.0.1:5173) -> executive transport (127.0.0.1:8787)
 * with server-owned carrier + NP-04 SQLite under an ephemeral /tmp dir outside any Git tree.
 * Browser-issued POST assertions cover browser traffic only; seeding uses Node fetch to the
 * governed backend write path (qualification setup, never the browser UI).
 */
import { chromium } from 'playwright-core';
import SparticuzChromium from '@sparticuz/chromium';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';

const FRONTEND = '/home/user/iips-review-recovered/frontend';
const EVIDENCE = '/tmp/iips-cv51-evidence';
fs.mkdirSync(EVIDENCE, { recursive: true });

const runtimeDir = fs.mkdtempSync('/tmp/iips-cv51-qual-');
const carrierPath = `${runtimeDir}/reports-owner-context.json`;
const dbPath = `${runtimeDir}/reports.db`;

const CARRIER_TEXT = [
  '{',
  '  "carrierSchemaVersion": 1,',
  '  "ownerUserId": "owner-irr-reports-personal",',
  '  "tenantId": "irr-reports-personal",',
  '  "governedBy": {',
  '    "recordId": "IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01",',
  '    "recordPath": "docs/integration/IIPS_v3.0_REPORTS_NP06_R1_OWNERSHIP_DECLARATION_PA_DECISION_ACT_2026-10-25.md",',
  '    "decisionDate": "2026-10-25"',
  '  }',
  '}',
  '',
].join('\n');
const carrierSha = crypto.createHash('sha256').update(CARRIER_TEXT, 'utf8').digest('hex');

const results = { runtimeDir, carrierSha256: carrierSha, carrierBytes: Buffer.byteLength(CARRIER_TEXT), phases: {}, failures: [] };
function check(phase, name, ok, detail = '') {
  results.phases[phase] ??= {};
  results.phases[phase][name] = { ok: Boolean(ok), detail: String(detail) };
  if (!ok) results.failures.push(`${phase}:${name}:${detail}`);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${phase} ${name} ${detail}`);
}

async function waitFor(url, timeoutMs = 60000) {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.status > 0) return res.status;
    } catch { /* retry */ }
    if (Date.now() - start > timeoutMs) throw new Error(`timeout waiting for ${url}`);
    await new Promise((r) => setTimeout(r, 300));
  }
}

function startStack(env, label) {
  const baseEnv = { ...process.env, NODE_EXTRA_CA_CERTS: '/etc/ssl/certs/ca-certificates.crt', ...env };
  const server = spawn(`${FRONTEND}/node_modules/.bin/tsx`, ['server/executive-transport.ts'], {
    cwd: FRONTEND, env: baseEnv, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
  });
  const vite = spawn(`${FRONTEND}/node_modules/.bin/vite`, ['--port', '5173'], {
    cwd: FRONTEND, env: baseEnv, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
  });
  const logs = { server: '', vite: '' };
  server.stdout.on('data', (d) => { logs.server += d; });
  server.stderr.on('data', (d) => { logs.server += d; });
  vite.stdout.on('data', (d) => { logs.vite += d; });
  vite.stderr.on('data', (d) => { logs.vite += d; });
  results[`logs_${label}`] = logs;
  return { server, vite, logs };
}

async function stopStack(stack) {
  for (const child of [stack.vite, stack.server]) {
    try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch { /* dead */ } }
  }
  await new Promise((r) => setTimeout(r, 800));
  for (const child of [stack.vite, stack.server]) {
    try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch { /* dead */ } }
  }
  await new Promise((r) => setTimeout(r, 600));
}

async function bootStack(env, label) {
  const stack = startStack(env, label);
  await waitFor('http://127.0.0.1:8787/api/reports/context');
  await waitFor('http://127.0.0.1:5173/reports');
  return stack;
}

const exe = await SparticuzChromium.executablePath();
let browser = null;
async function launchBrowser() {
  browser = await chromium.launch({
    executablePath: exe,
    headless: true,
    args: [...SparticuzChromium.args, '--no-sandbox', '--disable-dev-shm-usage'],
  });
  return browser;
}

async function newObservedPage(viewport = { width: 1280, height: 800 }) {
  if (!browser || !browser.isConnected()) await launchBrowser();
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const observed = { requests: [], consoleErrors: [], pageErrors: [], responses: [] };
  page.on('request', (req) => {
    observed.requests.push({
      method: req.method(),
      url: req.url(),
      headers: req.headers(),
      resourceType: req.resourceType(),
    });
  });
  page.on('response', (res) => {
    if (res.url().includes('/api/reports')) observed.responses.push({ status: res.status(), url: res.url() });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') observed.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => observed.pageErrors.push(String(err)));
  return { context, page, observed };
}

const bodyText = async (page) => page.evaluate(() => document.body.innerText);
function assertCleanDom(phase, text, observed) {
  check(phase, 'no partition literals in DOM', !text.includes('irr-reports-personal') && !text.includes('owner-irr-reports-personal'));
  check(phase, 'no runtime paths in DOM', !text.includes(runtimeDir) && !text.includes('/tmp/iips-cv51'));
  check(phase, 'no SQL/SQLite leak in DOM', !/SQLITE|SQL\b/i.test(text));
  // Expected fail-closed API responses (503/404) surface in Chromium as
  // "Failed to load resource" network logs; those are the governed outcome under
  // test, not unexpected errors. Any other console error fails the phase.
  const unexpected = observed.consoleErrors.filter((m) => !m.startsWith('Failed to load resource'));
  observed.expectedResourceLogs = observed.consoleErrors.length - unexpected.length;
  check(phase, 'no unexpected console errors', unexpected.length === 0, unexpected.join(' | ').slice(0, 300));
  check(phase, 'no page errors', observed.pageErrors.length === 0, observed.pageErrors.join(' | ').slice(0, 300));
}

// ---------------------------------------------------------------- B-1: missing carrier
{
  if (fs.existsSync(carrierPath)) fs.rmSync(carrierPath);
  if (fs.existsSync(dbPath)) fs.rmSync(dbPath);
  const stack = await bootStack({ IIPS_REPORTS_OWNER_PATH: carrierPath, IIPS_NP04_DATABASE_PATH: dbPath }, 'b1');
  const { context, page, observed } = await newObservedPage();
  await page.goto('http://127.0.0.1:5173/reports', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('reports-unavailable-owner').waitFor({ timeout: 20000 });
  const text = await bodyText(page);
  check('B-1', 'missing carrier shows sanitized 503 state', text.includes('Reports owner context unavailable'));
  check('B-1', 'retry control present', await page.getByTestId('reports-retry').isVisible());
  assertCleanDom('B-1', text, observed);
  await page.screenshot({ path: `${EVIDENCE}/B-1-carrier-absent-503.png`, fullPage: true });
  const contextStatus = observed.responses.find((r) => r.url.includes('/api/reports/context'))?.status;
  check('B-1', 'context endpoint answered 503', contextStatus === 503, `status=${contextStatus}`);

  // Recovery after retry: materialise the governed carrier in place (resolver is uncached).
  fs.writeFileSync(carrierPath, CARRIER_TEXT, 'utf8');
  await page.getByTestId('reports-retry').click();
  await page.getByTestId('reports-empty').waitFor({ timeout: 20000 });
  const recovered = await bodyText(page);
  check('B-1', 'recovers after Retry once carrier established', recovered.includes('No governed reports have been persisted yet'));
  assertCleanDom('B-1-recovery', recovered, observed);
  await page.screenshot({ path: `${EVIDENCE}/B-1-recovered-after-retry.png`, fullPage: true });
  await context.close();
  await browser.close().catch(() => {});
  browser = null;
  await stopStack(stack);
}

// ---------------------------------------------------------------- B-2: carrier valid, DB absent
{
  const env = { IIPS_REPORTS_OWNER_PATH: carrierPath };
  delete env.IIPS_NP04_DATABASE_PATH;
  const stack = await bootStack(env, 'b2');
  const { context, page, observed } = await newObservedPage();
  await page.goto('http://127.0.0.1:5173/reports', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('reports-unavailable-persistence').waitFor({ timeout: 20000 });
  const text = await bodyText(page);
  check('B-2', 'DB-absent shows sanitized persistence 503', text.includes('Reports persistence store unavailable'));
  check('B-2', 'retry control present', await page.getByTestId('reports-retry').isVisible());
  const direct = await page.evaluate(async () => {
    const ctx = await fetch('/api/reports/context');
    const art = await fetch('/api/reports/artifacts');
    return { context: ctx.status, artifacts: art.status };
  });
  check('B-2', 'context 200 does not mask artifacts 503', direct.context === 200 && direct.artifacts === 503, JSON.stringify(direct));
  assertCleanDom('B-2', text, observed);
  await page.screenshot({ path: `${EVIDENCE}/B-2-persistence-absent-503.png`, fullPage: true });
  await context.close();
  await browser.close().catch(() => {});
  browser = null;
  await stopStack(stack);
}

// ---------------------------------------------------------------- B-3: configured empty store
{
  if (fs.existsSync(dbPath)) fs.rmSync(dbPath);
  const stack = await bootStack({ IIPS_REPORTS_OWNER_PATH: carrierPath, IIPS_NP04_DATABASE_PATH: dbPath }, 'b3');
  const { context, page, observed } = await newObservedPage();
  // Sidebar navigation path (also used by B-6 keyboard in the populated phase).
  await page.goto('http://127.0.0.1:5173/executive', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Reports' }).click();
  await page.getByTestId('reports-empty').waitFor({ timeout: 20000 });
  const text = await bodyText(page);
  check('B-3', 'empty store shows governed empty state', text.includes('No governed reports have been persisted yet'));
  const artifacts = observed.responses.filter((r) => r.url.includes('/api/reports/artifacts'));
  check('B-3', 'artifacts endpoint answered 200', artifacts.some((r) => r.status === 200), JSON.stringify(artifacts));
  assertCleanDom('B-3', text, observed);
  await page.screenshot({ path: `${EVIDENCE}/B-3-empty-store.png`, fullPage: true });
  await context.close();
  await browser.close().catch(() => {});
  browser = null;
  await stopStack(stack);
}

// ---------------------------------------------------------------- Seed v1 -> v2 (backend write path, outside browser)
let v1Id = null;
let v2Id = null;
{
  const stack = await bootStack({ IIPS_REPORTS_OWNER_PATH: carrierPath, IIPS_NP04_DATABASE_PATH: dbPath }, 'seed');
  const create = await fetch('http://127.0.0.1:8787/api/reports/artifacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engineOutput: {
        reportId: 'report-portfolio-summary-P-100',
        reportType: 'Portfolio Summary',
        portfolioId: 'P-100',
        payload: {
          scenario: 'Balanced',
          concentration: 42.5,
          diversificationScore: null,
          diversificationBand: 'Moderate',
          avgConviction: 61,
          sectorExposure: { Banking: 60, Energy: 40 },
          ranking: [{ sector: 'Banking', score: 88 }],
        },
      },
      generatedAt: '2026-10-25T00:00:00.000Z',
      parameters: { horizon: '12m' },
    }),
  });
  const created = await create.json();
  check('SEED', 'v1 created via governed backend write path', create.status === 201, `status=${create.status}`);
  v1Id = created?.data?.reportId ?? null;
  const append = await fetch(`http://127.0.0.1:8787/api/reports/artifacts/${v1Id}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engineOutput: {
        reportId: 'report-portfolio-summary-P-100',
        reportType: 'Portfolio Summary',
        portfolioId: 'P-100',
        payload: {
          scenario: 'Balanced',
          concentration: 43.5,
          diversificationScore: null,
          diversificationBand: 'Moderate',
          avgConviction: 62,
          sectorExposure: { Banking: 58, Energy: 42 },
          ranking: [{ sector: 'Banking', score: 89 }],
        },
      },
      generatedAt: '2026-10-25T01:00:00.000Z',
      parameters: { horizon: '12m' },
    }),
  });
  const appended = await append.json();
  check('SEED', 'v2 appended via governed backend write path', append.status === 201, `status=${append.status}`);
  v2Id = appended?.data?.reportId ?? null;
  results.seed = { v1Id, v2Id, v1Version: created?.data?.artifactVersion, v2Version: appended?.data?.artifactVersion, v2Supersedes: appended?.data?.supersedesReportId };
  await stopStack(stack);
}

// ------------------------------------------------------- B-4/B-5/B-6: populated chain
{
  const stack = await bootStack({ IIPS_REPORTS_OWNER_PATH: carrierPath, IIPS_NP04_DATABASE_PATH: dbPath }, 'b4');
  const { context, page, observed } = await newObservedPage({ width: 1280, height: 800 });

  // B-4 populated head list
  await page.goto('http://127.0.0.1:5173/reports', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('reports-head-table').waitFor({ timeout: 20000 });
  let text = await bodyText(page);
  check('B-4', 'head list shows current head v2', text.includes('CURRENT HEAD') && text.includes('v2'));
  const headHref = await page.getByTestId(`report-link-${v2Id}`).getAttribute('href');
  check('B-4', 'head row links to v2 detail', headHref === `/reports/${v2Id}`, String(headHref));
  check('B-4', 'superseded v1 is not listed as a head', !(await page.getByTestId(`report-link-${v1Id}`).count()));
  assertCleanDom('B-4-list', text, observed);
  await page.screenshot({ path: `${EVIDENCE}/B-4-head-list.png`, fullPage: true });

  // All four disclosure levels in order on v2
  await page.getByTestId(`report-link-${v2Id}`).click();
  await page.getByTestId('report-section-summary').waitFor({ timeout: 20000 });
  const order = await page.evaluate(() => {
    const ids = ['report-section-summary', 'report-section-detail', 'report-section-provenance', 'report-section-reference'];
    const els = ids.map((id) => document.querySelector(`[data-testid="${id}"]`));
    return els.map((el, i) => (i === 0 ? true : Boolean(els[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)));
  });
  check('B-4', 'four disclosure levels in exact DOM order', order.every(Boolean), JSON.stringify(order));
  text = await bodyText(page);
  for (const [name, needle] of [
    ['summary has report type', 'Report — Portfolio Summary'],
    ['summary CURRENT HEAD', 'CURRENT HEAD'],
    ['detail renders recorded 43.5', '43.5'],
    ['detail null renders unavailable', 'unavailable'],
    ['provenance engine output id', 'report-portfolio-summary-P-100'],
    ['provenance records lineage v1', v1Id],
    ['reference shows durable route', `/reports/${v2Id}`],
    ['reference honest non-claim copy', 'does not re-execute'],
  ]) check('B-4', name, text.includes(needle), needle.slice(0, 60));
  assertCleanDom('B-4-detail-v2', text, observed);
  await page.screenshot({ path: `${EVIDENCE}/B-4-detail-v2-four-levels.png`, fullPage: true });

  // Supersession navigation: v2 -> v1 (SUPERSEDED) -> current head
  const v1Link = page.getByRole('link', { name: /View v1/ }).first();
  await v1Link.click();
  await page.getByTestId('report-superseded-banner').waitFor({ timeout: 20000 });
  text = await bodyText(page);
  check('B-4', 'v1 shows SUPERSEDED posture', text.includes('SUPERSEDED'));
  check('B-4', 'v1 detail renders its recorded payload', text.includes('42.5'));
  await page.screenshot({ path: `${EVIDENCE}/B-4-detail-v1-superseded.png`, fullPage: true });
  await page.getByRole('link', { name: /View current head \(v2\)/ }).click();
  await page.waitForFunction(
    (id) => window.location.pathname === `/reports/${id}`,
    v2Id,
    { timeout: 20000 },
  );
  await page.getByTestId('report-section-summary').waitFor({ timeout: 20000 });
  text = await bodyText(page);
  check('B-4', 'navigation returns to current head v2', text.includes('CURRENT HEAD') && !text.includes('This version has been superseded'));
  assertCleanDom('B-4-back-to-head', text, observed);

  // Browser network discipline across B-4
  const apiRequests = observed.requests.filter((r) => r.url.includes('/api/reports'));
  const allBrowser = observed.requests;
  check('B-4', 'zero POST calls from the browser', allBrowser.every((r) => r.method !== 'POST'), `${allBrowser.filter((r) => r.method === 'POST').length} POST`);
  check('B-4', 'zero Authorization headers from the browser', allBrowser.every((r) => !('authorization' in r.headers)));
  check('B-4', 'zero cookies sent by the browser', allBrowser.every((r) => !('cookie' in r.headers)));
  const prohibited = /tenantId|userId|ownerUserId|authenticatedUser|principal|companyId|runtimeCompanyId|reportKey|supersedesReportId|schemaVersion/;
  check('B-4', 'zero prohibited query fields from the browser', apiRequests.every((r) => !prohibited.test(new URL(r.url).search)));
  check('B-4', 'browser issued only GET for reports api', apiRequests.every((r) => r.method === 'GET'), `${apiRequests.length} api requests`);
  results.b4RequestSample = apiRequests.slice(0, 20).map((r) => `${r.method} ${r.url}`);

  // B-5 unknown id
  await page.goto('http://127.0.0.1:5173/reports/99999999-9999-4999-8999-999999999999', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('reports-not-found').waitFor({ timeout: 20000 });
  text = await bodyText(page);
  check('B-5', 'unknown id shows indistinguishable 404 state', text.includes('Report not found'));
  check('B-5', '404 state links back to /reports', (await page.locator('a[href="/reports"]').first().getAttribute('href')) === '/reports');
  assertCleanDom('B-5', text, observed);
  await page.screenshot({ path: `${EVIDENCE}/B-5-unknown-report-404.png`, fullPage: true });

  // B-6 keyboard traversal (on populated detail)
  await page.goto(`http://127.0.0.1:5173/reports/${v2Id}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('report-section-summary').waitFor({ timeout: 20000 });
  const traversal = [];
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return { tag: el.tagName, href: el.getAttribute('href'), testid: el.getAttribute('data-testid'), text: (el.textContent || '').trim().slice(0, 40) };
    });
    if (focused) traversal.push(focused);
    if (focused?.href === `/reports/${v1Id}`) break;
  }
  results.b6Traversal = traversal;
  check('B-6', 'keyboard Tab reaches a version link', traversal.some((t) => t.href === `/reports/${v1Id}`), JSON.stringify(traversal.slice(-4)));
  // Activate the focused version link with Enter
  await page.keyboard.press('Enter');
  await page.getByTestId('report-superseded-banner').waitFor({ timeout: 20000 });
  check('B-6', 'keyboard Enter navigates to superseded v1', (await bodyText(page)).includes('SUPERSEDED'));

  // B-6 responsive overflow at 1280 / 640 / 320 (list + detail)
  for (const width of [1280, 640, 320]) {
    await page.setViewportSize({ width, height: 800 });
    for (const [label, url] of [['list', '/reports'], ['detail', `/reports/${v2Id}`]]) {
      await page.goto(`http://127.0.0.1:5173${url}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflowOutsideWrappers = [];
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          const inWrapper = el.closest('[style*="overflow-x: auto"], [style*="overflowX"]') !== null;
          if (!inWrapper && (rect.right > window.innerWidth + 1 || rect.left < -1)) {
            overflowOutsideWrappers.push(`${el.tagName}.${el.getAttribute('data-testid') ?? ''}:${Math.round(rect.right)}>${window.innerWidth}`);
            if (overflowOutsideWrappers.length >= 5) break;
          }
        }
        return { scrollWidth: doc.scrollWidth, innerWidth: window.innerWidth, overflowOutsideWrappers };
      });
      results.phases['B-6'] ??= {};
      check('B-6', `no page horizontal overflow ${label} @${width}px`, metrics.scrollWidth <= metrics.innerWidth, JSON.stringify(metrics));
      check('B-6', `no overflow outside table wrappers ${label} @${width}px`, metrics.overflowOutsideWrappers.length === 0, metrics.overflowOutsideWrappers.join(';').slice(0, 200));
      await page.screenshot({ path: `${EVIDENCE}/B-6-${label}-${width}px.png`, fullPage: true });
    }
  }
  assertCleanDom('B-6', await bodyText(page), observed);
  await context.close();
  await browser.close().catch(() => {});
  browser = null;
  await stopStack(stack);
}

await browser?.close().catch(() => {});

// Cleanup runtime artifacts (outside any Git worktree)
fs.rmSync(runtimeDir, { recursive: true, force: true });
results.runtimeCleaned = !fs.existsSync(runtimeDir);
results.finishedAt = new Date().toISOString();
fs.writeFileSync(`${EVIDENCE}/browser-results.json`, JSON.stringify(results, null, 2));
console.log(`FAILURES: ${results.failures.length}`);
for (const f of results.failures) console.log(` - ${f}`);
process.exit(results.failures.length === 0 ? 0 : 1);
