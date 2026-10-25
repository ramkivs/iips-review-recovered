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
 *      `8eec74ae27cda09f3c368b9c299895eae41554db`, and the deliberately distinct DB-C1
 *      broker-import alias `70b24f029842a7e9b7f615e4d9df7376fd4ff817`.
 *   2. Simultaneously expose `./portfolio-ui`, `./pit`, and `./d114-non-production` from the
 *      primary package with built runtime `.js` and declaration `.d.ts` artifacts.
 *   3. Provide all runtime symbols and TypeScript declaration symbols required by IRR's five
 *      direct PIT/D114 importers and CAP-02 `./portfolio-ui` consumer surface (including U7
 *      minimal receipt/outcome types and `WRITE_NOT_AUTHORIZED` / `RESOURCE_UNAVAILABLE`).
 *   4. Preserve the raw TypeScript source files required by `tsconfig.broker-import.json` in the
 *      installed broker-import alias. Modern IPD packages publish only `dist/package`, so the
 *      alias must not be silently advanced without an authorized package/build redesign.
 *   5. Reject any incompatible or floating package pin profile.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, '..', '..');

export const EXPECTED_IPD_PIN_SHA = '8eec74ae27cda09f3c368b9c299895eae41554db';

export const EXPECTED_BROKER_IMPORT_ALIAS_SHA =
  '70b24f029842a7e9b7f615e4d9df7376fd4ff817';

export const REQUIRED_BROKER_IMPORT_SOURCE_FILES = [
  'frontend/src/features/portfolio/import/broker-format-detector.ts',
  'frontend/src/features/portfolio/import/broker-holdings-mapper.ts',
  'frontend/src/features/portfolio/import/broker-import-ingress.ts',
  'frontend/src/features/portfolio/import/types.ts',
  'frontend/src/features/portfolio/import/adapters/csv-parser-helper.ts',
  'frontend/src/features/portfolio/import/adapters/dhan-holdings-adapter.ts',
  'frontend/src/features/portfolio/import/adapters/groww-holdings-adapter.ts',
  'frontend/src/features/portfolio/import/adapters/index.ts',
  'frontend/src/features/portfolio/import/adapters/zerodha-holdings-adapter.ts',
  'src/identity/security_master.ts',
  'src/identity/mapping_store.ts',
  'src/identity/quarantine.ts',
  'src/contracts/provenance.ts',
  'src/contracts/types.ts',
] as const;

export const REQUIRED_SUBPATHS = [
  './portfolio-ui',
  './pit',
  './d114-non-production',
] as const;

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

  it('guards the distinct broker-import alias and its required raw-source build inputs', () => {
    const aliasSpec = irrPkg.dependencies?.['iips-broker-import'] ?? '';
    const aliasLockResolved =
      irrLock.packages?.['node_modules/iips-broker-import']?.resolved ?? '';
    const aliasRoot = resolve(frontendRoot, 'node_modules', 'iips-broker-import');
    const aliasPkg = JSON.parse(readFileSync(resolve(aliasRoot, 'package.json'), 'utf8')) as {
      files?: readonly string[];
    };

    expect(EXPECTED_BROKER_IMPORT_ALIAS_SHA).not.toBe(EXPECTED_IPD_PIN_SHA);
    expect(aliasSpec).toBe(
      `github:ramkivs/iips-production-market-data#${EXPECTED_BROKER_IMPORT_ALIAS_SHA}`,
    );
    expect(aliasLockResolved).toContain(`#${EXPECTED_BROKER_IMPORT_ALIAS_SHA}`);
    // The presently admitted alias is a raw-source compatibility baseline. A modern IPD
    // package restricted to `dist/package` cannot satisfy tsconfig.broker-import.json.
    expect(aliasPkg.files).toBeUndefined();
    for (const relPath of REQUIRED_BROKER_IMPORT_SOURCE_FILES) {
      expect(existsSync(resolve(aliasRoot, relPath)), `missing broker-import source: ${relPath}`).toBe(
        true,
      );
    }
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
