#!/usr/bin/env node
// Scan every emitted browser asset, including source maps and static public files.
// Fixed descriptions are printed instead of matched text, which may contain secrets.
import { readdir, readFile, lstat } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const rules = [
  ['market-data configuration', /IIPS_MARKET_DATA_[A-Z0-9_]*/],
  ['Dhan configuration', /IIPS_DHAN_[A-Z0-9_]*/],
  ['secret reference', /vault:\/\//i],
  ['private key', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
  ['credential-bearing URL', /https?:\/\/[^\s/"'<>:@]+:[^\s/"'<>@]+@/i],
  ['hard-coded credential', /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|transport[_-]?token|password)\s*[:=]\s*["'][^"'\r\n]{8,}["']/i],
  ['hard-coded bearer', /["']Bearer\s+[A-Za-z0-9._~+\/-]{12,}["']/i],
  ['Dhan provider implementation', /\b(?:DhanApiClient|DhanMarketDataSource|DhanMarketDataService|PreAccessNoNetworkTransport|DhanServerHttpsTransport|LocalHostVaultDhanCredentialResolver|DisabledWindowsHostVaultBackend|startMarketDataDaemon|MarketDataTransportClient|createMarketDataHttpServer|resolveDhanProviderConfig)\b/],
  ['server-only Dhan dependency', /(?:api\.dhan\.co|dhan-server|dhan_local_daemon|dhan_server_egress|dhan_local_vault_resolver)/i],
  ['server-only runtime', /(?:node:(?:net|sqlite|fs|http|https|path|crypto)|\b(?:createConnection|DatabaseSync|listenIpc|persistBrokerImport|PitReadService|HistoricalPitIngestionLoader|NON_PRODUCTION_D114)\b|src\/(?:ipc|persistence)\/)/],
];

export async function verifyBrowserBundle(root) {
  const base = resolve(root);
  const files = [];
  async function walk(dir) {
    for (const name of (await readdir(dir)).sort()) {
      const path = join(dir, name);
      const info = await lstat(path);
      if (info.isSymbolicLink()) throw new Error('bundle contains a symbolic link');
      if (info.isDirectory()) await walk(path);
      else if (info.isFile()) files.push(path);
      else throw new Error('bundle contains an unsupported entry');
    }
  }
  await walk(base);
  if (!files.some((f) => /\.(?:m?js)$/i.test(f))) throw new Error('bundle has no JavaScript');
  const hits = [];
  for (const file of files) {
    // Binary files are scanned as bytes decoded as UTF-8 too: do not allow an extension bypass.
    const text = await readFile(file, 'utf8');
    for (const [label, pattern] of rules) {
      if (pattern.test(text)) hits.push({ file: relative(base, file), rule: label });
    }
  }
  return { files: files.length, hits };
}

async function main() {
  if (process.argv.length > 3) throw new Error('usage: node scripts/verify-browser-bundle.mjs [bundle-directory]');
  const result = await verifyBrowserBundle(process.argv[2] ?? 'dist');
  if (result.hits.length) {
    // Filenames are browser output, never the matched content.
    for (const hit of result.hits) console.error(`Browser bundle rejected: ${hit.file} (${hit.rule})`);
    process.exitCode = 1;
  } else console.log(`Browser bundle security gate passed (${result.files} files scanned).`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => { console.error('Browser bundle security gate failed: unreadable or invalid output.'); process.exitCode = 1; });
}
