/**
 * CAP-02 B-1R package consumer & pin compatibility guard.
 *
 * Authority:
 *   - `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` §3.1
 *   - `IIPS-V3-CAP02-B1R-IPD-COMPATIBILITY-IMPLEMENTATION-ACT-EFFECTIVE-2026-10-23-01`
 *   - CAP-03 DQ-4 pin reconciliation, tracker §16.119 (2026-10-25)
 *
 * Guards that IRR's IPD dependency pins:
 *   1. Use exact 40-hex immutable commit SHAs on `ramkivs/iips-production-market-data` in both
 *      `package.json` and `package-lock.json`: primary
 *      `279d1eed184f5e23bbabe5c6411085e120ce9e41`, and the deliberately distinct DB-C1
 *      broker-import alias `58fc8fb7f033650f40d61078d70e951f21dd033f` (the merge commit of IPD
 *      PR #131, includes PRs #129/#130; advanced from #128 `07e86a4f2c105651f3097a96cb519f8611945e30`).
 *   2. Simultaneously expose `./portfolio-ui`, `./pit`, and `./d114-non-production` from the
 *      primary package with built runtime `.js` and declaration `.d.ts` artifacts.
 *   3. Provide all runtime symbols and TypeScript declaration symbols required by IRR's five
 *      direct PIT/D114 importers and CAP-02 `./portfolio-ui` consumer surface (including U7
 *      minimal receipt/outcome types and `WRITE_NOT_AUTHORIZED` / `RESOURCE_UNAVAILABLE`).
 *   4. Preserve the broker-import build inputs required by `tsconfig.broker-import.json` in the
 *      installed alias. The admitted alias is now the modern package profile: it publishes ONLY
 *      `dist/package` (built `.js` plus `.d.ts`), which `scripts/materialize-broker-import.mjs`
 *      materializes into `.cache/broker-import`. The former raw-source baseline is explicitly
 *      retired, so the alias can never be silently advanced without this guard being updated.
 *   5. Reject any incompatible or floating package pin profile.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, '..', '..');

/**
 * The authoritative IPD dependency pin, advanced from `279d1eed…` to `59fdfd1…`
 * (IPD PR #140 merge commit) by the isolated Dhan convergence, and then to `ae393aa…`
 * (IPD PR #144 merge commit) by DHAN-P3.
 *
 * `59fdfd1…` is the first commit reachable from IPD `main` that publishes the server-only
 * `./dhan-server` subpath; at `279d1eed…` the subpath and `src/providers/dhan/**` do not
 * exist in the package. `ae393aa…` advances the pin again because `59fdfd1…`'s
 * `MarketDataTransportClient` has no request timeout, no loopback pinning, no production
 * guard and no typed failure outcomes — none of which DHAN-P3's transport boundary may
 * forgo. The `./portfolio-ui`, `./pit`, `./d114-non-production`, `./operator-drop` and
 * `./dhan-server` subpaths all remain published at the new pin, and IRR's consumed
 * `./dhan-server` exports are unchanged, so both advances are purely additive for existing
 * consumers.
 */
export const EXPECTED_IPD_PIN_SHA = 'ae393aafdb35869bd039e1354b988e4232b26f7c';

/**
 * The prior primary pin, retained so a silent rollback cannot go unnoticed.
 *
 * `59fdfd15…` published the `./dhan-server` subpath but its `MarketDataTransportClient` had
 * no request timeout, no loopback pinning, no production guard and no typed failure
 * outcomes. DHAN-P3 needs those guarantees at the transport boundary, so the primary pin
 * advanced to `ae393aa…` (IPD PR #144). The advance is purely additive: every export IRR
 * consumes — including the whole `./dhan-server` surface — survives unchanged.
 */
export const SUPERSEDED_IPD_DHAN_SERVER_PIN_SHA = '59fdfd157632dbdbc220ae03d9d0b8e047d4ef19';

/** The superseded primary pin, retained so a silent rollback cannot go unnoticed. */
export const SUPERSEDED_IPD_PIN_SHA = '279d1eed184f5e23bbabe5c6411085e120ce9e41';

/**
 * The governed broker-import alias consumption profile. It is the single source of truth shared
 * with `scripts/materialize-broker-import.mjs`, so this guard and the build step cannot drift.
 */
export interface BrokerImportPackageProfile {
  readonly profileSchema: string;
  readonly aliasDependency: string;
  readonly aliasRepository: string;
  readonly aliasCommit: string;
  readonly aliasSpecifier: string;
  readonly installedRoot: string;
  readonly publishedRoot: string;
  readonly materializedRoot: string;
  readonly requiredPublishedModules: readonly string[];
  readonly requiredRuntimeEntrypoints: readonly string[];
}

export const BROKER_IMPORT_PACKAGE_PROFILE = JSON.parse(
  readFileSync(resolve(frontendRoot, 'broker-import-package-profile.json'), 'utf8'),
) as BrokerImportPackageProfile;

export const EXPECTED_BROKER_IMPORT_ALIAS_SHA = BROKER_IMPORT_PACKAGE_PROFILE.aliasCommit;

/**
 * The retired raw-source baseline. Its absence from the installed alias is asserted below: the
 * modern package profile publishes only built artifacts, and IRR must never silently fall back to
 * compiling IPD sources it was not given.
 */
export const RETIRED_BROKER_IMPORT_SOURCE_BASELINE_SHA =
  '70b24f029842a7e9b7f615e4d9df7376fd4ff817';

export const REQUIRED_SUBPATHS = [
  './portfolio-ui',
  './pit',
  './d114-non-production',
] as const;

/**
 * The server-only Dhan provider surface, added by the isolated Dhan convergence.
 *
 * Asserted separately from `REQUIRED_SUBPATHS` because it carries an extra `default`
 * condition and a server-side-only scope restriction that the generic subpath check does
 * not model. It must never be imported from browser code.
 */
export const REQUIRED_DHAN_SERVER_SUBPATH = './dhan-server' as const;

export const REQUIRED_PIT_RUNTIME_EXPORTS = [
  'PitReadService',
  'PointInTimeStore',
] as const;

export const REQUIRED_PIT_DECLARATION_SYMBOLS = [
  'PitReadRequest',
  'PitReadResult',
  'PitReadHit',
  'PitReadMiss',
  'PitReadFailureReason',
  'PITQuery',
  'CanonicalEnvelope',
  'DataDomain',
  'DataProvenanceDTO',
] as const;

export const REQUIRED_D114_RUNTIME_EXPORTS = [
  'populateNonProductionD114Pit',
  'createNonProductionD114PitStore',
  'ingestNonProductionD114Archives',
  'NON_PRODUCTION_D114_EQ',
  'NON_PRODUCTION_D114_BL',
  'NON_PRODUCTION_D114_VINTAGE_1',
  'NON_PRODUCTION_D114_VINTAGE_2',
  'NON_PRODUCTION_D114_VINTAGE_3',
] as const;

export const REQUIRED_D114_DECLARATION_SYMBOLS = [
  'NonProductionD114Population',
  'ArchiveIngestionResult',
] as const;

export const REQUIRED_PORTFOLIO_UI_RUNTIME_EXPORTS = [
  'BrokerImportModal',
  'DEFAULT_ALLOW_NON_PRODUCTION_BYPASS',
  'SessionPortfolioStorePort',
  'evaluatePortSaveGuard',
  'findCallerSuppliedIdentityKeys',
  'CALLER_SUPPLIED_IDENTITY_KEYS',
  'describePersistenceStatus',
  'PortfolioStore',
  'getDefaultPortfolioStore',
  'resetDefaultPortfolioStore',
  'getDefaultPortfolioStorePort',
  'resetDefaultPortfolioStorePort',
  'PortfolioBrokerImportController',
  'BrokerImportIngressOrchestrator',
  'mapBrokerOutputToUserHoldings',
  'BrokerFormatDetector',
  'DhanHoldingsAdapter',
  'GrowwHoldingsAdapter',
  'ZerodhaHoldingsAdapter',
  'SecurityMaster',
  'getGovernedBroadSecurityMaster',
  'IdentityAmbiguityError',
] as const;

export const REQUIRED_PORTFOLIO_UI_DECLARATION_SYMBOLS = [
  'PortfolioStorePort',
  'PortfolioCommitReceipt',
  'PortfolioCommitDisposition',
  'PortfolioPortSaveOutcome',
  'PortfolioPortSaveSuccess',
  'PortfolioPortSaveRefusal',
  'PortfolioPortSaveOutcomeUnknown',
  'PortfolioPortRefusalCode',
  'WRITE_NOT_AUTHORIZED',
  'RESOURCE_UNAVAILABLE',
  'UserHoldingInput',
  'BrokerImportModalProps',
] as const;

export const DIRECT_PIT_D114_IMPORTER_FILES = [
  'server/pit/ipdPitReadAdapter.ts',
  'server/pit/nonProductionPitStore.ts',
  'server/pit/nonProductionRuntimePitStore.ts',
  'server/pit/pitD114RuntimeIntegration.test.ts',
  'server/pit/pitRuntimeIntegration.test.ts',
] as const;

export interface PackagePinDescriptor {
  readonly dependencySpec: string;
  readonly lockResolvedUrl: string;
  readonly exportsMap: Record<
    string,
    { readonly types?: string; readonly import?: string; readonly default?: string } | undefined
  >;
  readonly pitRuntimeKeys: readonly string[];
  readonly d114RuntimeKeys: readonly string[];
  readonly portfolioUiRuntimeKeys: readonly string[];
  readonly portfolioUiDeclarationText: string;
}

export interface PackagePinValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export function validateIpdPackagePinDescriptor(descriptor: PackagePinDescriptor): PackagePinValidationResult {
  const errors: string[] = [];

  const specMatch = /^github:ramkivs\/iips-production-market-data#([0-9a-f]{40})$/.exec(descriptor.dependencySpec);
  if (!specMatch) {
    errors.push(`dependencySpec must pin an exact 40-hex commit SHA on ramkivs/iips-production-market-data (received "${descriptor.dependencySpec}")`);
  }

  const lockMatch = /#([0-9a-f]{40})$/.exec(descriptor.lockResolvedUrl);
  if (!lockMatch) {
    errors.push(`lockResolvedUrl must end with an exact 40-hex commit SHA (received "${descriptor.lockResolvedUrl}")`);
  }

  if (specMatch && lockMatch && specMatch[1] !== lockMatch[1]) {
    errors.push(`package.json SHA (${specMatch[1]}) does not match package-lock.json SHA (${lockMatch[1]})`);
  }

  for (const subpath of REQUIRED_SUBPATHS) {
    const entry = descriptor.exportsMap[subpath];
    const runtimeTarget = entry?.import ?? entry?.default;
    if (!entry || typeof runtimeTarget !== 'string' || typeof entry.types !== 'string') {
      errors.push(`missing required export subpath or runtime/types target: ${subpath}`);
    }
  }

  for (const symbol of REQUIRED_PIT_RUNTIME_EXPORTS) {
    if (!descriptor.pitRuntimeKeys.includes(symbol)) {
      errors.push(`missing ./pit runtime export: ${symbol}`);
    }
  }

  for (const symbol of REQUIRED_D114_RUNTIME_EXPORTS) {
    if (!descriptor.d114RuntimeKeys.includes(symbol)) {
      errors.push(`missing ./d114-non-production runtime export: ${symbol}`);
    }
  }

  for (const symbol of REQUIRED_PORTFOLIO_UI_RUNTIME_EXPORTS) {
    if (!descriptor.portfolioUiRuntimeKeys.includes(symbol)) {
      errors.push(`missing ./portfolio-ui runtime export: ${symbol}`);
    }
  }

  if (descriptor.portfolioUiRuntimeKeys.includes('PortfolioWorkspace')) {
    errors.push('./portfolio-ui must not re-export PortfolioWorkspace');
  }

  for (const symbol of REQUIRED_PORTFOLIO_UI_DECLARATION_SYMBOLS) {
    if (!descriptor.portfolioUiDeclarationText.includes(symbol)) {
      errors.push(`missing ./portfolio-ui declaration symbol or refusal code: ${symbol}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

describe('CAP-02 B-1R package consumer & pin compatibility guard', () => {
  const irrPkg = JSON.parse(readFileSync(resolve(frontendRoot, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  const irrLock = JSON.parse(readFileSync(resolve(frontendRoot, 'package-lock.json'), 'utf8')) as {
    packages?: Record<string, { resolved?: string }>;
  };
  const ipdPkgRoot = resolve(frontendRoot, 'node_modules', 'iips-production-market-data');
  const ipdPkg = JSON.parse(readFileSync(resolve(ipdPkgRoot, 'package.json'), 'utf8')) as {
    exports?: Record<string, { types?: string; import?: string; default?: string }>;
  };

  it('pins iips-production-market-data to the exact unified main commit SHA in package.json and package-lock.json', () => {
    const depSpec = irrPkg.dependencies?.['iips-production-market-data'] ?? '';
    const lockResolved = irrLock.packages?.['node_modules/iips-production-market-data']?.resolved ?? '';

    expect(depSpec).toBe(`github:ramkivs/iips-production-market-data#${EXPECTED_IPD_PIN_SHA}`);
    expect(lockResolved).toContain(`#${EXPECTED_IPD_PIN_SHA}`);
  });

  it('preserves every ./dhan-server export IRR consumes across the DHAN-P3 pin advance', () => {
    // The DHAN-P3 advance from `59fdfd1…` to `ae393aa…` was made because the earlier
    // pin's transport client lacked a timeout, loopback pinning, a production guard and
    // typed failure outcomes. Such an advance is only acceptable if it is BACKWARD
    // COMPATIBLE for every export IRR already consumes, so that is asserted here rather
    // than assumed.
    const dhanServerTypes = resolve(
      ipdPkgRoot,
      'dist/package/src/providers/dhan/package.d.ts',
    );
    expect(existsSync(dhanServerTypes), 'missing published ./dhan-server type surface').toBe(true);
    const declarations = readFileSync(dhanServerTypes, 'utf8');

    // The exports the DHAN-P2 and DHAN-P3 server code depends on.
    for (const symbol of [
      'MarketDataTransportClient',
      'MARKET_DATA_ROUTES',
      'MARKET_DATA_TRANSPORT_TOKEN_ENV',
      'DhanMarketDataService',
      'DhanHistoricalAdapter',
      'normalizeDhanHistoricalToCandles',
      'DHAN_SUPPORTED_HISTORICAL_INTERVALS',
    ]) {
      expect(declarations, `missing ./dhan-server export: ${symbol}`).toContain(symbol);
    }
  });

  it('publishes the server-only ./dhan-server provider surface at the advanced pin', () => {
    const depSpec = irrPkg.dependencies?.['iips-production-market-data'] ?? '';
    const dhanServer = ipdPkg.exports?.[REQUIRED_DHAN_SERVER_SUBPATH];

    // The advance is real: it is not the superseded pin re-declared.
    expect(EXPECTED_IPD_PIN_SHA).not.toBe(SUPERSEDED_IPD_PIN_SHA);
    expect(EXPECTED_IPD_PIN_SHA).not.toBe(SUPERSEDED_IPD_DHAN_SERVER_PIN_SHA);
    expect(depSpec).toContain(EXPECTED_IPD_PIN_SHA);

    // The subpath did not exist at the superseded pin, so its presence is the observable
    // evidence that IRR consumes the newly published surface rather than an older one.
    expect(dhanServer, `missing export subpath: ${REQUIRED_DHAN_SERVER_SUBPATH}`).toBeDefined();
    expect(dhanServer?.import).toBe('./dist/package/src/providers/dhan/package.js');
    expect(dhanServer?.types).toBe('./dist/package/src/providers/dhan/package.d.ts');
    expect(dhanServer?.default).toBe('./dist/package/src/providers/dhan/package.js');

    // Server-only contract: the published entrypoint must ship built artifacts, and the
    // raw provider TypeScript sources must NOT be present, so IRR cannot silently compile
    // vendor sources it was not given.
    for (const extension of ['.js', '.d.ts']) {
      const published = resolve(
        ipdPkgRoot,
        'dist/package/src/providers/dhan',
        `package${extension}`,
      );
      expect(existsSync(published), `missing published dhan-server artifact: package${extension}`).toBe(true);
    }
    expect(existsSync(resolve(ipdPkgRoot, 'src/providers/dhan/package.ts'))).toBe(false);
  });

  it('keeps every pre-existing subpath published when the pin advances', () => {
    // The Dhan advance must be additive: advancing the primary pin must not drop a
    // subpath an existing IRR consumer already relies on.
    for (const subpath of REQUIRED_SUBPATHS) {
      expect(ipdPkg.exports?.[subpath], `advanced pin dropped export subpath: ${subpath}`).toBeDefined();
    }
  });

  it('guards the distinct broker-import alias and its required published package build inputs', () => {
    const aliasSpec = irrPkg.dependencies?.['iips-broker-import'] ?? '';
    const aliasLockResolved =
      irrLock.packages?.['node_modules/iips-broker-import']?.resolved ?? '';
    const aliasRoot = resolve(frontendRoot, 'node_modules', 'iips-broker-import');
    const aliasPkg = JSON.parse(readFileSync(resolve(aliasRoot, 'package.json'), 'utf8')) as {
      files?: readonly string[];
    };

    expect(EXPECTED_BROKER_IMPORT_ALIAS_SHA).not.toBe(EXPECTED_IPD_PIN_SHA);
    expect(EXPECTED_BROKER_IMPORT_ALIAS_SHA).not.toBe(RETIRED_BROKER_IMPORT_SOURCE_BASELINE_SHA);
    expect(BROKER_IMPORT_PACKAGE_PROFILE.aliasSpecifier).toBe(
      `github:${BROKER_IMPORT_PACKAGE_PROFILE.aliasRepository}#${EXPECTED_BROKER_IMPORT_ALIAS_SHA}`,
    );
    expect(aliasSpec).toBe(BROKER_IMPORT_PACKAGE_PROFILE.aliasSpecifier);
    expect(irrLock.packages?.['']?.dependencies?.['iips-broker-import']).toBe(
      BROKER_IMPORT_PACKAGE_PROFILE.aliasSpecifier,
    );
    expect(aliasLockResolved).toContain(`#${EXPECTED_BROKER_IMPORT_ALIAS_SHA}`);

    // The admitted alias is the MODERN package profile: it publishes only `dist/package`. The
    // retired raw-source baseline (no `files` field) must not be silently reinstated, and the
    // raw TypeScript sources must not be present, because IRR no longer compiles IPD sources.
    expect(aliasPkg.files).toEqual([BROKER_IMPORT_PACKAGE_PROFILE.publishedRoot]);
    for (const modulePath of BROKER_IMPORT_PACKAGE_PROFILE.requiredPublishedModules) {
      for (const extension of ['.js', '.d.ts']) {
        const published = resolve(
          aliasRoot,
          BROKER_IMPORT_PACKAGE_PROFILE.publishedRoot,
          `${modulePath}${extension}`,
        );
        expect(existsSync(published), `missing published broker-import artifact: ${modulePath}${extension}`).toBe(true);
      }
      const rawSource = resolve(aliasRoot, `${modulePath}.ts`);
      expect(existsSync(rawSource), `raw IPD source must not be consumed: ${modulePath}.ts`).toBe(false);
    }
  });

  it('materializes the pinned alias build output into .cache/broker-import under the governed pin', () => {
    const materializedRoot = resolve(frontendRoot, BROKER_IMPORT_PACKAGE_PROFILE.materializedRoot);
    const manifestPath = resolve(materializedRoot, 'BROKER-IMPORT-MATERIALIZED.json');
    expect(existsSync(manifestPath), 'run `npm run build:broker-import` before the suite').toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      aliasCommit: string;
      aliasSpecifier: string;
      consumedAs: string;
      rawSourcesCompiled: boolean;
      fileCount: number;
      files: readonly { path: string; sha256: string }[];
    };
    expect(manifest.aliasCommit).toBe(EXPECTED_BROKER_IMPORT_ALIAS_SHA);
    expect(manifest.aliasSpecifier).toBe(BROKER_IMPORT_PACKAGE_PROFILE.aliasSpecifier);
    expect(manifest.consumedAs).toBe('published-build-output');
    expect(manifest.rawSourcesCompiled).toBe(false);
    expect(manifest.files.length).toBe(manifest.fileCount);

    // Every entrypoint IRR actually imports must be materialized as runtime JS plus declarations,
    // and the materialized bytes must be the pinned package's own published bytes.
    for (const entrypoint of BROKER_IMPORT_PACKAGE_PROFILE.requiredRuntimeEntrypoints) {
      for (const extension of ['.js', '.d.ts']) {
        const relativePath = `${entrypoint}${extension}`;
        const materialized = resolve(materializedRoot, relativePath);
        expect(existsSync(materialized), `missing materialized artifact: ${relativePath}`).toBe(true);
        const published = resolve(
          frontendRoot,
          BROKER_IMPORT_PACKAGE_PROFILE.installedRoot,
          BROKER_IMPORT_PACKAGE_PROFILE.publishedRoot,
          relativePath,
        );
        expect(readFileSync(materialized).equals(readFileSync(published)), `materialized bytes differ from the pinned package: ${relativePath}`).toBe(true);
      }
    }
  });

  it('publishes per-row broker identity assessment evidence from the pinned alias', async () => {
    // The whole reason for the pin advance: PR #127's per-row identity assessment must be reachable
    // through the alias IRR actually consumes, not only in the IPD repository.
    const assessmentModule = await import(
      '../../.cache/broker-import/frontend/src/features/portfolio/import/broker-identity-assessment.js'
    );
    expect(typeof assessmentModule.assessBrokerRowIdentity).toBe('function');
    expect(typeof assessmentModule.summariseBrokerIdentity).toBe('function');
    expect(typeof assessmentModule.BrokerIdentityResolutionError).toBe('function');

    // No master supplied => NOT_EVALUATED, never an unmapped identity claim.
    const unevaluated = assessmentModule.assessBrokerRowIdentity({
      rowIndex: 1, symbol: 'ANY NAME', asOf: '2026-11-05T00:00:00.000Z',
    });
    expect(unevaluated.status).toBe('NOT_EVALUATED');
    expect(unevaluated.refusalCode).toBe('IDENTITY_NOT_EVALUATED');
    expect(unevaluated.lookups).toEqual([]);

    // An exchange-scoped row must query ONLY its declared exchange namespace.
    const bseScoped = assessmentModule.assessBrokerRowIdentity({
      rowIndex: 2, symbol: 'SOME SYMBOL', exchange: 'BSE', asOf: '2026-11-05T00:00:00.000Z',
      master: new (await import('../../.cache/broker-import/src/identity/security_master.js')).SecurityMaster(),
    });
    expect(bseScoped.identifierClass).toBe('EXCHANGE_SCOPED_SYMBOL');
    expect(bseScoped.lookups.map((l: { identifierType: string }) => l.identifierType)).toEqual(['BSE_SYMBOL']);
    expect(bseScoped.status).toBe('UNRESOLVED');
    expect(bseScoped.refusalCode).toBe('UNMAPPED_IDENTIFIER');

    // An unscoped name queries both namespaces verbatim and records the exact missing evidence.
    const unscoped = assessmentModule.assessBrokerRowIdentity({
      rowIndex: 3, symbol: 'ASK AUTOMOTIVE', asOf: '2026-11-05T00:00:00.000Z',
      master: new (await import('../../.cache/broker-import/src/identity/security_master.js')).SecurityMaster(),
    });
    expect(unscoped.identifierClass).toBe('UNSCOPED_NAME_OR_SYMBOL');
    expect(unscoped.lookups.map((l: { identifierType: string }) => l.identifierType)).toEqual(['NSE_SYMBOL', 'BSE_SYMBOL']);
    expect(unscoped.refusalCode).toBe('NO_AUTHORITATIVE_IDENTIFIER_MATCH');
    expect(typeof unscoped.missingEvidence).toBe('string');

    // The aggregate refuses the whole import while any row is unresolved (P04 / DP-2 Option 2F).
    const summary = assessmentModule.summariseBrokerIdentity([unevaluated, bseScoped, unscoped]);
    expect(summary.saveable).toBe(false);
    expect(summary.resolved).toBe(0);
  });

  it('exposes ./portfolio-ui, ./pit, and ./d114-non-production simultaneously with existing runtime and declaration artifacts', () => {
    const exportsMap = ipdPkg.exports ?? {};
    for (const subpath of REQUIRED_SUBPATHS) {
      const target = exportsMap[subpath];
      expect(target, `missing ${subpath} in package exports`).toBeDefined();
      const runtimeRel = target?.import ?? target?.default;
      expect(typeof runtimeRel).toBe('string');
      expect(typeof target?.types).toBe('string');

      const runtimeFile = resolve(ipdPkgRoot, runtimeRel!);
      const typesFile = resolve(ipdPkgRoot, target!.types!);
      expect(existsSync(runtimeFile), `missing runtime file for ${subpath}: ${runtimeFile}`).toBe(true);
      expect(existsSync(typesFile), `missing types file for ${subpath}: ${typesFile}`).toBe(true);
    }
  });

  it('loads ./pit, ./d114-non-production, and ./portfolio-ui at runtime and verifies all required runtime and declaration symbols', async () => {
    const pitMod = await import('iips-production-market-data/pit');
    const d114Mod = await import('iips-production-market-data/d114-non-production');
    const portfolioUiMod = await import('iips-production-market-data/portfolio-ui');

    for (const key of REQUIRED_PIT_RUNTIME_EXPORTS) {
      expect(typeof (pitMod as Record<string, unknown>)[key], `./pit.${key}`).toBe('function');
    }
    for (const key of REQUIRED_D114_RUNTIME_EXPORTS) {
      expect((d114Mod as Record<string, unknown>)[key], `./d114-non-production.${key}`).toBeDefined();
    }
    for (const key of REQUIRED_PORTFOLIO_UI_RUNTIME_EXPORTS) {
      expect((portfolioUiMod as Record<string, unknown>)[key], `./portfolio-ui.${key}`).toBeDefined();
    }
    expect('PortfolioWorkspace' in portfolioUiMod).toBe(false);

    const pitDecls = [
      readFileSync(resolve(ipdPkgRoot, 'dist/package/src/pit/package.d.ts'), 'utf8'),
      readFileSync(resolve(ipdPkgRoot, 'dist/package/src/pit/pit_read_service.d.ts'), 'utf8'),
      readFileSync(resolve(ipdPkgRoot, 'dist/package/src/pit/pit_store.d.ts'), 'utf8'),
    ].join('\n');
    for (const sym of REQUIRED_PIT_DECLARATION_SYMBOLS) {
      expect(pitDecls).toContain(sym);
    }

    const d114Decls = [
      readFileSync(resolve(ipdPkgRoot, 'dist/package/src/d114/non_production_package.d.ts'), 'utf8'),
      readFileSync(resolve(ipdPkgRoot, 'dist/package/src/d114/non_production_pit_population.d.ts'), 'utf8'),
    ].join('\n');
    for (const sym of REQUIRED_D114_DECLARATION_SYMBOLS) {
      expect(d114Decls).toContain(sym);
    }

    const portfolioUiDecls = [
      readFileSync(resolve(ipdPkgRoot, 'dist/package/src/ui/portfolio_ui_package.d.ts'), 'utf8'),
      readFileSync(resolve(ipdPkgRoot, 'dist/package/frontend/src/features/portfolio/portfolioStorePort.d.ts'), 'utf8'),
      readFileSync(resolve(ipdPkgRoot, 'dist/package/frontend/src/features/portfolio/BrokerImportModal.d.ts'), 'utf8'),
    ].join('\n');

    const validation = validateIpdPackagePinDescriptor({
      dependencySpec: irrPkg.dependencies?.['iips-production-market-data'] ?? '',
      lockResolvedUrl: irrLock.packages?.['node_modules/iips-production-market-data']?.resolved ?? '',
      exportsMap: ipdPkg.exports ?? {},
      pitRuntimeKeys: Object.keys(pitMod),
      d114RuntimeKeys: Object.keys(d114Mod),
      portfolioUiRuntimeKeys: Object.keys(portfolioUiMod),
      portfolioUiDeclarationText: portfolioUiDecls,
    });
    expect(validation).toEqual({ ok: true, errors: [] });
  });

  it('verifies the 5 direct PIT/D114 importers, classifies src/api/pit.test.ts as comment-only/transitive, and confirms direct ./portfolio-ui type import in src/api/brokerImport.ts', () => {
    for (const relPath of DIRECT_PIT_D114_IMPORTER_FILES) {
      const source = readFileSync(resolve(frontendRoot, relPath), 'utf8');
      const importLines = source
        .split('\n')
        .filter((line) => !line.trimStart().startsWith('*') && !line.trimStart().startsWith('//'))
        .filter((line) => line.includes("from 'iips-production-market-data/"));
      expect(importLines.length, `${relPath} must have a direct import from iips-production-market-data/*`).toBeGreaterThan(0);
    }

    const pitClientTestSource = readFileSync(resolve(frontendRoot, 'src/api/pit.test.ts'), 'utf8');
    const nonCommentLinesWithIpd = pitClientTestSource
      .split('\n')
      .filter((line) => {
        const trimmed = line.trimStart();
        return !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*');
      })
      .filter((line) => line.includes('iips-production-market-data'));
    expect(nonCommentLinesWithIpd).toEqual([]);
    expect(pitClientTestSource).toContain("from '../../server/pit/nonProductionPitStore.js'");

    const brokerImportClientSource = readFileSync(resolve(frontendRoot, 'src/api/brokerImport.ts'), 'utf8');
    expect(brokerImportClientSource).toContain("from 'iips-production-market-data/portfolio-ui'");
    expect(brokerImportClientSource).not.toContain('Local structural mirror of IPD `UserHoldingInput`');
  });

  it('rejects incompatible package pin descriptors (floating refs, SHA mismatch, missing subpaths, missing symbols, or missing U7 refusal codes)', () => {
    const validDescriptor: PackagePinDescriptor = {
      dependencySpec: `github:ramkivs/iips-production-market-data#${EXPECTED_IPD_PIN_SHA}`,
      lockResolvedUrl: `git+ssh://git@github.com/ramkivs/iips-production-market-data.git#${EXPECTED_IPD_PIN_SHA}`,
      exportsMap: {
        './portfolio-ui': {
          types: './dist/package/ui/portfolio_ui_package.d.ts',
          default: './dist/package/ui/portfolio_ui_package.js',
        },
        './pit': {
          types: './dist/package/pit/package.d.ts',
          default: './dist/package/pit/package.js',
        },
        './d114-non-production': {
          types: './dist/package/d114/non_production_package.d.ts',
          default: './dist/package/d114/non_production_package.js',
        },
      },
      pitRuntimeKeys: [...REQUIRED_PIT_RUNTIME_EXPORTS],
      d114RuntimeKeys: [...REQUIRED_D114_RUNTIME_EXPORTS],
      portfolioUiRuntimeKeys: [...REQUIRED_PORTFOLIO_UI_RUNTIME_EXPORTS],
      portfolioUiDeclarationText: REQUIRED_PORTFOLIO_UI_DECLARATION_SYMBOLS.join(' '),
    };

    expect(validateIpdPackagePinDescriptor(validDescriptor).ok).toBe(true);

    // 1. Floating ref rejected
    const floating = validateIpdPackagePinDescriptor({
      ...validDescriptor,
      dependencySpec: 'github:ramkivs/iips-production-market-data#main',
    });
    expect(floating.ok).toBe(false);

    // 2. Lockfile SHA mismatch rejected
    const mismatch = validateIpdPackagePinDescriptor({
      ...validDescriptor,
      lockResolvedUrl: 'git+ssh://git@github.com/ramkivs/iips-production-market-data.git#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494',
    });
    expect(mismatch.ok).toBe(false);

    // 3. Legacy 2e11fa3b profile (missing ./portfolio-ui) rejected
    const missingPortfolioUi = validateIpdPackagePinDescriptor({
      ...validDescriptor,
      exportsMap: {
        './pit': validDescriptor.exportsMap['./pit'],
        './d114-non-production': validDescriptor.exportsMap['./d114-non-production'],
      },
    });
    expect(missingPortfolioUi.ok).toBe(false);
    expect(missingPortfolioUi.errors).toContain('missing required export subpath or runtime/types target: ./portfolio-ui');

    // 4. Legacy 24e62c80 profile (missing ./pit and ./d114-non-production) rejected
    const missingPitAndD114 = validateIpdPackagePinDescriptor({
      ...validDescriptor,
      exportsMap: {
        './portfolio-ui': validDescriptor.exportsMap['./portfolio-ui'],
      },
    });
    expect(missingPitAndD114.ok).toBe(false);
    expect(missingPitAndD114.errors).toContain('missing required export subpath or runtime/types target: ./pit');
    expect(missingPitAndD114.errors).toContain('missing required export subpath or runtime/types target: ./d114-non-production');

    // 5. Missing U7 refusal code rejected
    const missingU7Code = validateIpdPackagePinDescriptor({
      ...validDescriptor,
      portfolioUiDeclarationText: REQUIRED_PORTFOLIO_UI_DECLARATION_SYMBOLS
        .filter((s) => s !== 'WRITE_NOT_AUTHORIZED')
        .join(' '),
    });
    expect(missingU7Code.ok).toBe(false);
    expect(missingU7Code.errors).toContain('missing ./portfolio-ui declaration symbol or refusal code: WRITE_NOT_AUTHORIZED');
  });
});


// Pin-specific bytes independently reproduced by a fresh exact-Git installation.
// Package consumption integrity only: not qualification or activation of snapshot writes.
describe('broker-import authoritative publication integrity', () => {
  it('matches all published/materialized bytes, exports and the inventory digest', () => {
    const expected = JSON.parse(readFileSync(resolve(frontendRoot, 'broker-import-publication-manifest.json'), 'utf8'));
    const profile = BROKER_IMPORT_PACKAGE_PROFILE;
    expect(expected.commit).toBe(profile.aliasCommit);
    const installed = resolve(frontendRoot, profile.installedRoot);
    const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
    const packageBytes = readFileSync(resolve(installed, 'package.json'));
    expect(hash(packageBytes)).toBe(expected.packageJsonSha256);
    const manifest = JSON.parse(packageBytes.toString('utf8'));
    expect(manifest.files).toEqual(['dist/package']);
    expect(manifest.exports).toEqual(expected.exports);
    for (const entry of Object.values(manifest.exports) as { types: string; import: string }[]) {
      expect(existsSync(resolve(installed, entry.types))).toBe(true);
      expect(existsSync(resolve(installed, entry.import))).toBe(true);
    }
    const walk = (dir: string, prefix = ''): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      const name = prefix + entry.name;
      return entry.isDirectory() ? walk(resolve(dir, entry.name), name + '/') : [name];
    }).sort();
    expect(walk(resolve(installed, profile.publishedRoot))).toEqual(expected.files.map((f: {path: string}) => f.path));
    expect(expected.files).toHaveLength(expected.fileCount);
    for (const file of expected.files) {
      const published = readFileSync(resolve(installed, profile.publishedRoot, file.path));
      const materialized = readFileSync(resolve(frontendRoot, profile.materializedRoot, file.path));
      expect(published.length).toBe(file.bytes);
      expect(hash(published)).toBe(file.sha256);
      expect(materialized.equals(published)).toBe(true);
    }
    const canonical = expected.files.map((f: {bytes: number; path: string; sha256: string}) => ({bytes: f.bytes, path: f.path, sha256: f.sha256}));
    expect(hash(JSON.stringify(canonical))).toBe(expected.publishedInventorySha256);
  });
});
