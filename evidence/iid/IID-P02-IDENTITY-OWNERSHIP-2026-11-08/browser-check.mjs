// Run only against an ISOLATED local instance with the approved F-3 carrier, never against user data.
// BROWSER_MODULE_ROOT points at an external npm prefix containing @sparticuz/chromium@153 and puppeteer-core@25.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
const root = process.env.BROWSER_MODULE_ROOT;
if (!root) throw new Error('Set BROWSER_MODULE_ROOT to the external npm prefix node_modules');
const {default: chromium} = await import(pathToFileURL(join(root, '@sparticuz/chromium/build/index.js')));
const {default: puppeteer} = await import(pathToFileURL(join(root, 'puppeteer-core/lib/puppeteer/puppeteer-core.js')));
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
const page = await browser.newPage();
const base = process.env.IID_BROWSER_BASE ?? 'http://localhost:5173';
const mode = process.argv[2] ?? 'read';
const events = [];
page.on('response', r => { const u = new URL(r.url()); if (u.pathname.startsWith('/api/')) events.push(`${r.request().method()} ${u.pathname} ${r.status()}`); });
try {
  await page.goto(`${base}/watchlists`, {waitUntil:'networkidle0'});
  if (mode === 'create') {
    await page.type('[data-testid="watchlist-new-id"]', 'iid-p02-test');
    await page.type('[data-testid="watchlist-new-name"]', 'IID P02 synthetic watchlist');
    await page.click('[data-testid="watchlist-create"]');
  }
  await page.waitForSelector('[data-testid="watchlist-iid-p02-test"]', {timeout:10000});
  assert.match(await page.$eval('body', e => e.innerText), /IID P02 synthetic watchlist/);
  await page.goto(`${base}/collaboration`, {waitUntil:'networkidle0'});
  if (mode === 'create') {
    await page.type('[data-testid="collab-new-title"]', 'IID P02 synthetic thread');
    await page.type('[data-testid="collab-new-anchor"]', 'Banking');
    await page.click('[data-testid="collab-create"]');
  }
  await page.waitForFunction(() => document.body.innerText.includes('IID P02 synthetic thread'), {timeout:10000});
  console.log(JSON.stringify({mode, browser: await browser.version(), watchlistRendered:true, threadRendered:true, events}));
} finally { await browser.close(); }
