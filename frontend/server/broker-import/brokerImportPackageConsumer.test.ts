/**
 * CAP-02 B-1R dependency-status and (conditional) package-consumer/browser-closure tests.
 *
 * Authority: `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.1 with
 * its §12 dated correction — the B-1R plain repin FAILED consumer verification on 2026-10-23:
 * IPD `main@554ed6ce…` exports only `./portfolio-ui`, while the off-`main` pin lineage
 * (`2e11fa3b…`, `np04-governed-persistence-windows`) exports only `./pit`, `./d114-non-production`
 * and `./persistence`. A repin breaks the AD-02-admitted PIT consumers (`tsc --noEmit` fails on
 * `server/pit/**`), so the pin is deliberately retained until the IPD packaging prerequisite
 * unifies the exports on `main`.
 *
 * This suite therefore:
 *   1. always asserts the CURRENT pin identity (so an accidental repin that would break the PIT
 *      seam fails CI, and a future authorized repin is a visible, deliberate change);
 *   2. activates the full `./portfolio-ui` consumer and browser-closure assertions automatically
 *      once the installed pin carries the export — i.e. exactly when B-1R becomes executable.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PINNED_MAIN_CANDIDATE = '554ed6ceaa7422c95806fd1b6e095a24a8554be2';
const CURRENT_OFF_MAIN_PIN = '2e11fa3b689d1a3674a5e4ba1f1de9a559e20494';

function installedPackageJsonPath(): string {
  return fileURLToPath(new URL('../../node_modules/iips-production-market-data/package.json', import.meta.url));
}

function installedExports(): string[] {
  if (!existsSync(installedPackageJsonPath())) return [];
  const pkg = JSON.parse(readFileSync(installedPackageJsonPath(), 'utf8')) as { exports?: Record<string, unknown> };
  return Object.keys(pkg.exports ?? {});
}

const HAS_PORTFOLIO_UI = installedExports().includes('./portfolio-ui');
const HAS_PIT = installedExports().includes('./pit');

describe('B-1R — dependency pin status (guarded)', () => {
  it('pins exactly one immutable commit (never a floating branch or tag)', () => {
    const packageJson = readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8');
    const match = packageJson.match(/"iips-production-market-data":\s*"([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match?.[1]).toMatch(/^github:ramkivs\/iips-production-market-data#[0-9a-f]{40}$/);
  });

  it('documents the B-1R split-export blocker: the current pin and the CAP-02 export are disjoint', () => {
    // Current, verified state (composition act §12 correction):
    //  - the active pin is the off-main lineage pin that carries the PIT exports;
    //  - IPD main carries ./portfolio-ui but not the PIT exports;
    //  - so the pin stays as-is until the IPD packaging prerequisite lands.
    const packageJson = readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8');
    const pin = packageJson.match(/"iips-production-market-data":\s*"([^"]+)"/)?.[1] ?? '';
    if (pin.endsWith(CURRENT_OFF_MAIN_PIN)) {
      // The AD-02 PIT consumers must keep resolving.
      expect(HAS_PIT).toBe(true);
      expect(HAS_PORTFOLIO_UI).toBe(false);
    } else if (pin.endsWith(PINNED_MAIN_CANDIDATE)) {
      // B-1R executed: the PIT exports must now ALSO be present, or the repin is broken.
      expect(HAS_PORTFOLIO_UI).toBe(true);
      expect(HAS_PIT).toBe(true);
    } else {
      throw new Error(`unexpected iips-production-market-data pin: ${pin}`);
    }
  });

  it('the lockfile resolves the same immutable commit as package.json', () => {
    const packageJson = readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8');
    const pin = packageJson.match(/"iips-production-market-data":\s*"github:ramkivs\/iips-production-market-data#([0-9a-f]{40})"/)?.[1];
    expect(pin).toBeDefined();
    const lock = readFileSync(fileURLToPath(new URL('../../package-lock.json', import.meta.url)), 'utf8');
    expect(lock).toContain(`git+ssh://git@github.com/ramkivs/iips-production-market-data.git#${pin}`);
  });
});

/* ------------------------------------------------------------------ *
 * Conditional section: active exactly when the installed pin carries
 * ./portfolio-ui (i.e. when the B-1R prerequisite is satisfied).
 * ------------------------------------------------------------------ */

const portfolioUiSuite = HAS_PORTFOLIO_UI ? describe : describe.skip;

portfolioUiSuite('B-1R — ./portfolio-ui runtime export surface (the pinned install)', () => {
  // The specifier is built dynamically so Vite does not try to resolve the subpath when the
  // installed pin does not carry it (the B-1R blocked state); resolution happens at runtime,
  // only in the active (non-skipped) state.
  const loadPortfolioUi = (): Promise<Record<string, unknown>> => {
    const specifier = ['iips-production-market-data', 'portfolio-ui'].join('/');
    return import(/* @vite-ignore */ specifier) as Promise<Record<string, unknown>>;
  };

  it('resolves with the expected runtime exports and the honest session default', async () => {
    const pkg = await loadPortfolioUi();
    const keys = Object.keys(pkg);
    expect(keys.length).toBe(22);
    expect(typeof pkg.BrokerImportModal).toBe('function');
    expect(typeof pkg.getGovernedBroadSecurityMaster).toBe('function');
    expect(typeof pkg.SessionPortfolioStorePort).toBe('function');
    expect(typeof pkg.evaluatePortSaveGuard).toBe('function');
    expect(typeof pkg.PortfolioStore).toBe('function');
    // PortfolioWorkspace is deliberately NOT exported (application composition, not the component set).
    expect('PortfolioWorkspace' in pkg).toBe(false);
    // The only shipped port implementation stays honestly session-only.
    const PortCtor = pkg.SessionPortfolioStorePort as new () => { durability: string; durable: boolean };
    const port = new PortCtor();
    expect(port.durability).toBe('SESSION_ONLY');
    expect(port.durable).toBe(false);
  });

  it('DP-2 Option 2F holds: unresolved holdings are refused by the exported save guard', async () => {
    const pkg = (await loadPortfolioUi()) as unknown as {
      evaluatePortSaveGuard: (holdings: Array<Record<string, unknown>>) => { saveable: boolean; refusedHoldings: unknown[] };
    };
    const guard = pkg.evaluatePortSaveGuard([{ symbol: 'X', identityStatus: 'UNRESOLVED', companyId: '' }]);
    expect(guard.saveable).toBe(false);
    expect(guard.refusedHoldings.length).toBe(1);
  });

  it('bundles for the browser with no Node-only or privileged closure hits', async () => {
    const esbuild = await import('esbuild');
    const entry = fileURLToPath(
      new URL('../../node_modules/iips-production-market-data/dist/package/src/ui/portfolio_ui_package.js', import.meta.url),
    );
    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      platform: 'browser',
      format: 'esm',
      outfile: '/tmp/iips-cap02-b1r-bundle-check.js',
      external: ['react', 'react-dom'],
      logLevel: 'silent',
      write: true,
    });
    expect(result.errors).toEqual([]);
    const bundled = readFileSync('/tmp/iips-cap02-b1r-bundle-check.js', 'utf8');
    expect(bundled.length).toBeGreaterThan(100_000);
    const forbidden = [
      'node:net', 'node:sqlite', 'node:fs', 'node:http', 'node:path', 'node:crypto',
      'createConnection', 'DatabaseSync', 'listenIpc', 'persistBrokerImport',
      'WRITE_NOT_AUTHORIZED', 'src/ipc/', 'src/persistence/',
    ];
    const hits = forbidden.filter((needle) => bundled.includes(needle));
    expect(hits, `forbidden closure hits: ${hits.join(', ')}`).toEqual([]);
  });
});
