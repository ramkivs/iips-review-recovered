#!/usr/bin/env node
// Synthetic lifecycle experiment. Never contacts the production pipe or IPD.
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync } from 'node:fs';

const defaults = { delays: '0,10,25,40,45,55,62,75,100,150,250,500', iterations: '3', timeout: '5000', out: '' };
function options(args) {
  const result = { ...defaults };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    if (!args[i]?.startsWith('--') || !Object.hasOwn(result, key) || args[i + 1] === undefined) throw new Error(`Invalid option: ${args[i]}`);
    result[key] = args[i + 1];
  }
  const integer = (value, min, max) => /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;
  const delays = result.delays.split(',');
  if (!delays.length || delays.some(d => !integer(d, 0, 60000)) || new Set(delays.map(Number)).size !== delays.length) throw new Error('Delays must be unique integers from 0 to 60000 ms');
  if (!integer(result.iterations, 1, 100) || !integer(result.timeout, 1, 120000) || !result.out) throw new Error('Provide --out and valid --iterations (1..100) and --timeout (1..120000)');
  return { delays: delays.map(Number), iterations: Number(result.iterations), timeout: Number(result.timeout), out: path.resolve(result.out) };
}
const errorInfo = e => e ? { message: e.message, code: e.code ?? null, errno: e.errno ?? null, syscall: e.syscall ?? null } : null;
function frame(value) {
  const body = Buffer.from(JSON.stringify(value));
  const prefix = Buffer.alloc(4);
  prefix.writeUInt32BE(body.length);
  return Buffer.concat([prefix, body]);
}
const request = frame({ v: 1, op: 'synthetic-lifecycle-only' });
const response = frame({ v: 1, ok: true, op: 'synthetic-lifecycle-only', result: 'synthetic' });

async function trial(mode, delay, iteration, timeout, endpoint) {
  const events = [];
  const start = process.hrtime.bigint();
  const now = () => Number(process.hrtime.bigint() - start) / 1e6;
  const log = (side, event, detail = {}) => events.push({ ms: Number(now().toFixed(3)), side, event, ...detail });
  let serverSocket, serverTimer, serverDue = 0, endMs = null, terminalMs = null, bytes = Buffer.alloc(0), responseReceived = false, timedOut = false;
  let classification = null, reason = null, writeOutcome = 'not-attempted', serverFrame = false;
  let resolveClient;
  const clientDone = new Promise(resolve => { resolveClient = resolve; });
  const server = net.createServer({ allowHalfOpen: true }, socket => {
    serverSocket = socket;
    log('server', 'connection');
    let input = Buffer.alloc(0);
    socket.on('data', chunk => {
      log('server', 'data', { bytes: chunk.length });
      input = Buffer.concat([input, chunk]);
      if (!serverFrame && input.length >= 4 && input.length >= 4 + input.readUInt32BE(0)) {
        serverFrame = true;
        try { JSON.parse(input.subarray(4, 4 + input.readUInt32BE(0)).toString('utf8')); }
        catch (e) { log('server', 'request-parse-error', { error: errorInfo(e) }); socket.destroy(); return; }
        log('server', 'request-frame', { bytes: input.length, delayMs: delay });
        serverDue = now() + delay;
        serverTimer = setTimeout(() => {
          log('server', 'write-attempt', { destroyed: socket.destroyed, bytes: response.length });
          writeOutcome = 'pending';
          try {
            const accepted = socket.write(response, err => {
              writeOutcome = err ? 'error' : 'flushed';
              log('server', 'write-callback', { error: errorInfo(err) });
              socket.destroy(); // IPD flush-guard releases after write, never end().
              log('server', 'destroy-after-write');
            });
            log('server', 'write-return', { accepted });
          } catch (err) {
            writeOutcome = 'threw';
            log('server', 'write-throw', { error: errorInfo(err) });
            socket.destroy();
          }
        }, delay);
      }
    });
    for (const event of ['end', 'finish', 'close', 'error']) socket.on(event, arg => log('server', event, event === 'error' ? { error: errorInfo(arg) } : event === 'close' ? { hadError: arg } : {}));
  });
  server.maxConnections = 1;
  server.on('drop', () => log('server', 'drop'));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(endpoint, resolve); });
  server.on('error', err => log('server', 'listener-error', { error: errorInfo(err) }));
  const client = net.createConnection({ path: endpoint });
  const settle = (kind, why) => {
    if (classification !== null) return;
    classification = kind; reason = why; terminalMs = now();
    log('client', 'settle', { classification, reason });
    client.destroy();
    resolveClient();
  };
  const timer = setTimeout(() => { timedOut = true; log('client', 'timeout'); settle('OUTCOME_UNKNOWN', 'TIMEOUT'); }, timeout);
  client.on('connect', () => {
    log('client', 'connect');
    client.write(request, err => {
      log('client', 'write-callback', { error: errorInfo(err) });
      if (mode === 'end-after-write' && !err) { endMs = now(); log('client', 'end-called'); client.end(); }
    });
    log('client', 'write-request', { bytes: request.length });
  });
  client.on('data', chunk => {
    log('client', 'data', { bytes: chunk.length });
    bytes = Buffer.concat([bytes, chunk]);
    if (bytes.length >= 4 && bytes.length >= 4 + bytes.readUInt32BE(0)) {
      try {
        const parsed = JSON.parse(bytes.subarray(4, 4 + bytes.readUInt32BE(0)).toString('utf8'));
        if (parsed.v !== 1 || parsed.ok !== true || parsed.op !== 'synthetic-lifecycle-only' || parsed.result !== 'synthetic') throw new Error('unexpected response');
        responseReceived = true;
        settle('SUCCESS', 'COMPLETE_FRAME');
      } catch (err) { log('client', 'response-parse-error', { error: errorInfo(err) }); settle('OUTCOME_UNKNOWN', 'TRANSPORT_FAULT'); }
    }
  });
  client.on('end', () => { log('client', 'end'); settle(bytes.length === 0 ? 'CLASS_P' : 'OUTCOME_UNKNOWN', bytes.length === 0 ? 'ZERO_BYTES' : 'TRANSPORT_FAULT'); });
  client.on('finish', () => log('client', 'finish'));
  client.on('error', err => { log('client', 'error', { error: errorInfo(err) }); settle('OUTCOME_UNKNOWN', 'TRANSPORT_FAULT'); });
  client.on('close', hadError => { log('client', 'close', { hadError }); settle(bytes.length === 0 ? 'CLASS_P' : 'OUTCOME_UNKNOWN', bytes.length === 0 ? 'ZERO_BYTES' : 'TRANSPORT_FAULT'); });
  await clientDone;
  clearTimeout(timer);
  // Let the delayed write run even if the client has already closed; this captures
  // the server's response to the premature disappearance rather than hiding it.
  if (serverFrame && serverTimer) await new Promise(resolve => setTimeout(resolve, Math.max(0, serverDue - now()) + 100));
  if (serverTimer) clearTimeout(serverTimer);
  if (serverSocket) serverSocket.destroy();
  await new Promise(resolve => server.close(resolve));
  await new Promise(resolve => setImmediate(resolve));
  const connectMs = events.find(e => e.side === 'client' && e.event === 'connect')?.ms ?? null;
  // Preserve the monotonic origin and provide the requested connect-relative view.
  for (const event of events) event.msFromConnect = connectMs === null ? null : Number((event.ms - connectMs).toFixed(3));
  return { mode, delayMs: delay, iteration, responseReceived, timedOut, bytesReceived: bytes.length, classification, reason, serverFrame, writeOutcome, connectMs, endMs, terminalMs, events };
}

export function verdict(results, config, platform = process.platform) {
  if (platform !== 'win32') return { verdict: 'INCONCLUSIVE', explanation: 'AF_UNIX mechanics only: native Windows named-pipe evidence is required.' };
  const early = results.filter(r => r.delayMs <= 25);
  const late = results.filter(r => r.delayMs >= 75 && r.delayMs + 200 < config.timeout);
  const eligible = early.length >= 4 && late.length >= 4 && config.iterations >= 2;
  const bOk = [...early, ...late].filter(r => r.mode === 'keep-open').every(r => r.responseReceived);
  const earlyA = early.filter(r => r.mode === 'end-after-write');
  const lateA = late.filter(r => r.mode === 'end-after-write');
  const characteristic = lateA.every(r => r.serverFrame && !r.responseReceived && !r.timedOut && r.endMs !== null && r.terminalMs - r.endMs >= 30 && r.terminalMs - r.endMs <= 200);
  if (eligible && bOk && earlyA.every(r => r.responseReceived) && characteristic) return { verdict: 'CONFIRMED_PATTERN', explanation: 'Synthetic Windows timing pattern supports the hypothesis; it does not directly observe the libuv timer or prove the production failure.' };
  if (eligible && bOk && earlyA.every(r => r.responseReceived) && lateA.every(r => r.responseReceived)) return { verdict: 'REFUTED_PATTERN', explanation: 'This synthetic run did not reproduce the predicted early-end failure; production causes remain unproven.' };
  return { verdict: 'INCONCLUSIVE', explanation: 'Mixed results, inadequate controls or insufficient delay/timeout coverage; inspect the event log and repeat.' };
}

async function main() {
  const config = options(process.argv.slice(2));
  mkdirSync(config.out, { recursive: true });
  const logPath = path.join(config.out, 'events.jsonl');
  const summaryPath = path.join(config.out, 'summary.json');
  const metadata = { type: 'metadata', time: new Date().toISOString(), node: process.version, uv: process.versions.uv, platform: process.platform, arch: process.arch, config, clock: 'ms is monotonic since trial start; msFromConnect is relative to the client connect event', transport: process.platform === 'win32' ? 'native Windows named pipe' : 'AF_UNIX mechanics only, not Windows evidence' };
  writeFileSync(logPath, JSON.stringify(metadata) + '\n');
  console.log(`${metadata.transport}; Node ${metadata.node}; libuv ${metadata.uv}; ${metadata.arch}`);
  console.log('Delay(ms)  Mode             Success/total  CLASS_P  Unknown  Timeout');
  const results = [];
  const temp = process.platform === 'win32' ? null : mkdtempSync(path.join(os.tmpdir(), 'irr-pipe-'));
  try {
    for (const delay of config.delays) for (const mode of ['end-after-write', 'keep-open']) {
      const group = [];
      for (let i = 1; i <= config.iterations; i++) {
        const name = `irr-lifecycle-${process.pid}-${randomUUID()}`;
        const endpoint = process.platform === 'win32' ? `\\\\.\\pipe\\${name}` : path.join(temp, name + '.sock');
        const result = await trial(mode, delay, i, config.timeout, endpoint);
        results.push(result); group.push(result);
        appendFileSync(logPath, JSON.stringify({ type: 'trial', endpoint, ...result }) + '\n');
      }
      const count = fn => group.filter(fn).length;
      console.log(`${String(delay).padEnd(11)}${mode.padEnd(17)}${`${count(r => r.responseReceived)}/${group.length}`.padEnd(15)}${String(count(r => r.classification === 'CLASS_P')).padEnd(9)}${String(count(r => r.classification === 'OUTCOME_UNKNOWN')).padEnd(9)}${count(r => r.timedOut)}`);
    }
  } finally { if (temp) rmSync(temp, { recursive: true, force: true }); }
  const result = verdict(results, config);
  writeFileSync(summaryPath, JSON.stringify({ metadata, ...result, trials: results.map(({ events, ...rest }) => rest) }, null, 2) + '\n');
  console.log(`Verdict: ${result.verdict} - ${result.explanation}`);
  console.log(`Events: ${logPath}\nSummary: ${summaryPath}`);
  return result.verdict === 'CONFIRMED_PATTERN' ? 0 : result.verdict === 'REFUTED_PATTERN' ? 1 : 2;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().then(code => { process.exitCode = code; }).catch(err => { console.error('INCONCLUSIVE: harness error:', err); process.exitCode = 2; });
}
