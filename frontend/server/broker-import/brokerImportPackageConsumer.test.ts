/**
 * CAP-02 B-1R dependency-status and (conditional) package-consumer/browser-closure tests.
 *
 * Authority: `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.1 with
 * its §12 dated correction and §13 dated re-verification addendum — the B-1R plain repin FAILED
 * consumer verification on 2026-10-23 and was re-attempted and re-reverted the same day against
 * the then-current IPD `main@24e62c80…`: IPD `main` exports only `./portfolio-ui`, while the
 * off-`main` pin lineage (`2e11fa3b…`, `np04-governed-persistence-windows`, verified NOT an
 * ancestor of `main`) exports only `./pit`, `./d114-non-production` and `./persistence`. The PIT
 * read-service and D114 non-production population modules do not exist in the IPD `main` source
 * tree at all, so a repin breaks the six AD-02-admitted PIT consumers (`tsc --noEmit` fails with
 * `TS2307` on `server/pit/**`; the PIT suites fail to collect). The pin is therefore deliberately
 * retained until the IPD packaging prerequisite — main-admission of those modules plus
 * `./pit`/`./d114-non-production` exports with build output and declarations — lands on `main`.
 *
 * This suite therefore:
 *   1. always asserts the pin is one immutable commit and that the lockfile agrees;
 *   2. documents the blocked state while the retained pin is installed, and treats ANY other
 *      immutable pin as a B-1R attempt that must carry all three consumer exports
 *      (`./portfolio-ui`, `./pit`, `./d114-non-production`) — an accidental repin to a
 *      portfolio-ui-only (or otherwise incompatible) package fails CI here with an explicit
 *      message, without hardcoding a future `main` SHA that would itself go stale;
 *   3. proves the six consumers' required `./pit`/`./d114-non-production` runtime symbols resolve
 *      against the installed pin whenever those exports are present (active today, at the
 *      retained pin; must stay active and green after any authorized repin);
 *   4. activates the full `./portfolio-ui` consumer and browser-closure assertions automatically
 *      once the installed pin carries the export — i.e. exactly when B-1R becomes executable.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CURRENT_OFF_MAIN_PIN = '2e11fa3b689d1a3674a5e4ba1f1de9a559e20494';

/** Every package export an IRR consumer requires. A B-1R candidate must carry ALL of them. */
const REQUIRED_CONSUMER_EXPORTS = ['./portfolio-ui', './pit', './d114-non-production'] as const;

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
const HAS_D114 = installedExports().includes('./d114-non-production');

describe('B-1R — dependency pin status (guarded)', () => {
  it('pins exactly one immutable commit (never a floating branch or tag)', () => {
    const packageJson = readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8');
    const match = packageJson.match(/"iips-production-market-data":\s*"([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match?.[1]).toMatch(/^github:ramkivs\/iips-production-market-data#[0-9a-f]{40}$/);
  });

  it('documents the B-1R split-export blocker, or proves a repin carries every consumer export', () => {
    const packageJson = readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8');
    const pin = packageJson.match(/"iips-production-market-data":\s*"([^"]+)"/)?.[1] ?? '';
    if (pin.endsWith(CURRENT_OFF_MAIN_PIN)) {
      // Blocked state (composition act §12/§13), verified 2026-10-23 against IPD
      // `main@24e62c80…`: the retained off-main pin carries the PIT exports only; IPD `main`
      // carries `./portfolio-ui` only, so the pin stays as-is until the IPD packaging
      // prerequisite lands. The AD-02 PIT consumers must keep resolving.
      expect(HAS_PIT).toBe(true);
      expect(HAS_D114).toBe(true);
      expect(HAS_PORTFOLIO_UI).toBe(false);
    } else {
      // Any other immutable pin is a B-1R attempt. It is compatible ONLY if the installed
      // package carries every consumer export; a portfolio-ui-only repin (e.g. to current IPD
      // `main`) breaks the six AD-02 PIT consumers and must fail here, loudly and by name.
      const installed = installedExports();
      const missing = REQUIRED_CONSUMER_EXPORTS.filter((name) => !installed.includes(name));
      if (missing.length > 0) {
        throw new Error(
          `incompatible B-1R repin: pin ${pin} does not export ${missing.join(', ')} ` +
            `(installed exports: ${installed.join(', ') || 'none'}). ` +
            'Do not remove PIT consumers or weaken this guard to make it pass — the IPD packaging ' +
            'prerequisite (composition act §12/§13) must land on IPD main first.',
        );
      }
      expect(HAS_PORTFOLIO_UI).toBe(true);
      expect(HAS_PIT).toBe(true);
      expect(HAS_D114).toBe(true);
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
 * The six AD-02 PIT consumers' runtime symbols. Active whenever the
 * installed pin carries the PIT exports (true at the retained pin;
 * must remain true after any authorized B-1R repin).
 * ------------------------------------------------------------------ */

const pitSuite = HAS_PIT && HAS_D114 ? describe : describe.skip;

pitSuite('B-1R — ./pit and ./d114-non-production consumer symbols (the pinned install)', () => {
  // Specifiers are built dynamically so Vite does not try to resolve the subpaths statically;
  // resolution happens at runtime, only in the active (non-skipped) state.
  const loadPit = (): Promise<Record<string, unknown>> => {
    const specifier = ['iips-production-market-data', 'pit'].join('/');
    return import(/* @vite-ignore */ specifier) as Promise<Record<string, unknown>>;
  };

  const loadD114 = (): Promise<Record<string, unknown>> => {
    const specifier = ['iips-production-market-data', 'd114-non-production'].join('/');
    return import(/* @vite-ignore */ specifier) as Promise<Record<string, unknown>>;
  };

  it('resolves every runtime symbol the ./pit consumers import', async () => {
    // frontend/server/pit/{ipdPitReadAdapter,nonProductionPitStore,
    // nonProductionRuntimePitStore,pitRuntimeIntegration.test,pitD114RuntimeIntegration.test}.ts
    const pit = await loadPit();
    expect(typeof pit.PitReadService).toBe('function');
    expect(typeof pit.PointInTimeStore).toBe('function');
  });

  it('resolves every runtime symbol the ./d114-non-production consumers import', async () => {
    // frontend/server/pit/{nonProductionRuntimePitStore,pitD114RuntimeIntegration.test}.ts
    const d114 = await loadD114();
    expect(typeof d114.populateNonProductionD114Pit).toBe('function');
    expect(typeof d114.createNonProductionD114PitStore).toBe('function');
    expect(typeof d114.ingestNonProductionD114Archives).toBe('function');
    expect(typeof d114.NON_PRODUCTION_D114_EQ).toBe('string');
    expect(typeof d114.NON_PRODUCTION_D114_BL).toBe('string');
    expect(typeof d114.NON_PRODUCTION_D114_VINTAGE_1).toBe('string');
    expect(typeof d114.NON_PRODUCTION_D114_VINTAGE_2).toBe('string');
    expect(typeof d114.NON_PRODUCTION_D114_VINTAGE_3).toBe('string');
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
