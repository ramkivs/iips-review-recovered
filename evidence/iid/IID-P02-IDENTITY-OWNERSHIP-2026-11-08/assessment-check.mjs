// Read-only synthetic M1 probe. Run only with the isolated M1 NP-04 database configured in the backend.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
const root = process.env.BROWSER_MODULE_ROOT;
if (!root) throw new Error('Set BROWSER_MODULE_ROOT');
const {default: chromium} = await import(pathToFileURL(join(root, '@sparticuz/chromium/build/index.js')));
const {default: puppeteer} = await import(pathToFileURL(join(root, 'puppeteer-core/lib/puppeteer/puppeteer-core.js')));
const browser = await puppeteer.launch({args:chromium.args, executablePath:await chromium.executablePath(), headless:true});
const page = await browser.newPage();
const base = process.env.IID_BROWSER_BASE ?? 'http://localhost:5173';
const issuer = 'IN:EQISIN:IN0000000201';
try {
  const events = [];
  page.on('response', r => {if (new URL(r.url()).pathname.startsWith('/api/investment/')) events.push(`${r.request().method()} ${new URL(r.url()).pathname} ${r.status()}`);});
  await page.goto(`${base}/investment/company/${encodeURIComponent(issuer)}`, {waitUntil:'networkidle0'});
  const head = await page.evaluate(async id => (await fetch(`/api/investment/company/${encodeURIComponent(id)}`)).json(), issuer);
  assert.equal(head.version.datasetClass, 'SYNTHETIC_REFERENCE');
  assert.equal(head.version.artifactVersion, 2);
  assert.equal(head.versions.length, 2);
  const text = await page.$eval('body', el => el.innerText);
  const revenue = head.assessment.fundamentals.annual[0].values.REVENUE_FROM_OPERATIONS.value;
  assert.ok(text.includes(head.assessment.subject.legalName));
  assert.ok(text.includes(head.version.reportId));
  assert.ok(text.includes(head.assessment.fundamentals.annual[0].periodEnd));
  assert.ok(text.includes(new Intl.NumberFormat('en-IN', {maximumFractionDigits:2}).format(revenue)));
  const methodMid = head.assessment.valuation.methods.find(m => m.output !== null).output.perShareMid.value;
  const sensitivity = head.assessment.valuation.sensitivity[0].points[0].value;
  assert.ok(text.includes(new Intl.NumberFormat('en-IN', {maximumFractionDigits:2}).format(methodMid)));
  assert.ok(text.includes(new Intl.NumberFormat('en-IN', {maximumFractionDigits:2}).format(sensitivity)));
  assert.match(text, /Comparison: v1 → v2/);
  const old = head.versions.find(v => v.artifactVersion === 1);
  await page.$eval('[aria-label="Stored versions"] button:first-child', el => el.click());
  await page.waitForFunction(id => document.body.innerText.includes(`Viewing v1 · reportId ${id}`), {}, old.reportId);
  await page.evaluate(() => [...document.querySelectorAll('[aria-label="Stored versions"] button')].find(el => el.textContent?.trim() === 'v2').click());
  await page.waitForFunction(id => document.body.innerText.includes(`Viewing v2 · reportId ${id}`), {}, head.version.reportId);
  console.log(JSON.stringify({browser:await browser.version(),issuer,head:head.version.reportId,previous:old.reportId,period:head.assessment.fundamentals.annual[0].periodEnd,revenue,methodMid,sensitivity,comparisonRendered:true,returnToCurrent:true,events}));
} finally { await browser.close(); }
