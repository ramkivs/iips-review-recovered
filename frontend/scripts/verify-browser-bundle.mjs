#!/usr/bin/env node
// Scan every emitted browser asset, including source maps and static public files.
// Fixed descriptions are printed instead of matched text, which may contain secrets.
import { readdir, readFile, lstat } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const rules = [
  ['market-data configuration', /IIPS_MARKET_DATA_[A-Z0-9_]*/],
  ['Dhan configuration', /IIPS_DHAN_[A-Z0-9_]*/],
  ['EquiCore configuration', /IIPS_EQUICORE_[A-Z0-9_]*/],
  ['secret reference', /vault:\/\//i],
  ['private key', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
  ['credential-bearing URL', /https?:\/\/[^\s/"'<>:@]+:[^\s/"'<>@]+@/i],
  ['hard-coded credential', /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|transport[_-]?token|password)\s*[:=]\s*["'][^"'\r\n]{8,}["']/i],
  ['hard-coded bearer', /["']Bearer\s+[A-Za-z0-9._~+\/-]{12,}["']/i],
  ['Dhan provider implementation', /\b(?:DhanApiClient|DhanMarketDataSource|DhanMarketDataService|PreAccessNoNetworkTransport|DhanServerHttpsTransport|LocalHostVaultDhanCredentialResolver|DisabledWindowsHostVaultBackend|startMarketDataDaemon|MarketDataTransportClient|createMarketDataHttpServer|resolveDhanProviderConfig)\b/],
  ['server-only Dhan dependency', /(?:api\.dhan\.co|dhan-server|dhan_local_daemon|dhan_server_egress|dhan_local_vault_resolver)/i],
  // W-29: the shared quote-consumption boundary and the IPD transport it composes are
  // server-only. Their symbol names appearing in browser output means a server module (or a
  // type-only import that became a value import) reached the client bundle.
  // W-31 extends the server-only set with the watchlist quote consumer (it composes the
  // boundary and must never be in the browser bundle).
  ['server-only quote-consumption boundary', /\b(?:quoteConsumptionBoundary|consumeQuotes?|IpdMarketDataTransportConfig|IpdTransportConfigResolution|IpdFreshnessStatus|readIpdFreshnessStatus|resolveIpdMarketDataTransportConfig|createIpdMarketDataTransportClient|IRR_PROVIDER_QUALIFICATION|watchlists-quotes|enrichWatchlistWithQuotes|watchlistItemToQuoteIdentity|handleWatchlistQuotesRequest)\b/],
  // Phase C (PA-DEC-03 / IRR-AC-01): EquiCore transport, historical consumption boundary, and
  // EquiCore loopback endpoint are strictly server-only.
  ['server-only EquiCore boundary', /(?:\b(?:equicoreTransportConfig|equicoreTransport|historicalConsumptionBoundary|readEquiCoreTransportConfiguration|createEquiCoreTransportClient|verifyEquiCoreResponseDigest|consumeHistoricalSeries|EquiCoreTransportClient|handleEquiCoreHistoricalRequest|handleEquiCoreHealthRequest|handleEquiCoreEodObservationRequest|handleEquiCoreAssociationsRequest|handleEquiCoreCalendarRequest|handleEquiCoreRequest)\b|127\.0\.0\.1:8614|iips-equicore-historical\/v1)/],
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
