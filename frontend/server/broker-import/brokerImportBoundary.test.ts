/**
 * CAP-02 broker-import boundary tests.
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`
 * §4.1 — exact DTO acceptance; canonical/owner/tenant/credential keys rejected before any client
 * invocation; bounded sizes; mandatory revision. The boundary is pure: it performs no I/O, so
 * "before any client invocation" holds by construction and is asserted by the module's
 * import-safety suite.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import {
  BROKER_IMPORT_MAX_HOLDINGS,
  validateBrokerImportSaveDto,
  validatePortfolioIdParam,
  type BrokerObservedHoldingInput,
} from './brokerImportBoundary.js';

const VALID_DIGEST = 'a'.repeat(64);
const VALID_DIGEST_B = 'b'.repeat(64);

function holding(overrides: Partial<BrokerObservedHoldingInput> = {}): Record<string, unknown> {
  return {
    symbol: 'RELIANCE',
    isin: 'INE002A01018',
    exchange: 'NSE',
    quantity: 10,
    averageBuyPrice: 2400.5,
    currentPrice: 2500.25,
    marketValue: 25002.5,
    ...overrides,
  };
}

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    expectedRevision: 3,
    mode: 'MERGE',
    holdings: [holding()],
    contentDigest: VALID_DIGEST,
    broker: 'ZERODHA',
    ...overrides,
  };
}

describe('brokerImportBoundary — exact DTO acceptance', () => {
  it('accepts the exact v1-shaped DTO and preserves only admitted fields', () => {
    const result = validateBrokerImportSaveDto(validBody());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dto.expectedRevision).toBe(3);
    expect(result.dto.mode).toBe('MERGE');
    expect(result.dto.contentDigest).toBe(VALID_DIGEST);
    expect(result.dto.broker).toBe('ZERODHA');
    expect(result.dto.holdings).toHaveLength(1);
    expect(Object.keys(result.dto.holdings[0]).sort()).toEqual(
      ['averageBuyPrice', 'currentPrice', 'exchange', 'isin', 'marketValue', 'quantity', 'symbol'].sort(),
    );
  });

  it('accepts the DTO without optional contentDigest and broker (exact optional-key omission)', () => {
    const result = validateBrokerImportSaveDto({
      expectedRevision: 0,
      mode: 'REPLACE',
      holdings: [holding({ isin: undefined, exchange: undefined, quantity: undefined, averageBuyPrice: undefined, currentPrice: undefined, marketValue: undefined })],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dto.contentDigest).toBeUndefined();
    expect(result.dto.broker).toBeUndefined();
    expect(Object.keys(result.dto.holdings[0])).toEqual(['symbol']);
  });

  it('accepts a holding carrying only the required symbol', () => {
    const result = validateBrokerImportSaveDto({
      expectedRevision: 1,
      mode: 'MERGE',
      holdings: [{ symbol: 'TCS' }],
    });
    expect(result.ok).toBe(true);
  });
});

describe('brokerImportBoundary — mandatory revision (W-5)', () => {
  it('refuses a missing expectedRevision before any I/O', () => {
    const body = validBody();
    delete body.expectedRevision;
    const result = validateBrokerImportSaveDto(body);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.code).toBe('INVALID_REQUEST');
    expect(result.refusal.fieldPath).toBe('body.expectedRevision');
    expect(result.refusal.reason).toBe('expected-revision-mandatory');
  });

  it('refuses a non-integer, negative, fractional or unsafe revision', () => {
    for (const bad of ['2', -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
      const result = validateBrokerImportSaveDto(validBody({ expectedRevision: bad as unknown as number }));
      expect(result.ok, `revision ${String(bad)}`).toBe(false);
      if (!result.ok) expect(result.refusal.fieldPath).toBe('body.expectedRevision');
    }
  });
});

describe('brokerImportBoundary — exact top-level key set', () => {
  it('refuses every key outside the v1 save payload, including the retired G2 bag', () => {
    for (const key of ['options', 'fileName', 'importedAt', 'sourceBroker', 'lineageDigest', 'portfolioName', 'provenanceDigest', 'requestId']) {
      const result = validateBrokerImportSaveDto(validBody({ [key]: 'x' }));
      expect(result.ok, `key ${key}`).toBe(false);
      if (!result.ok) {
        expect(result.refusal.fieldPath).toBe(`body.${key}`);
        expect(result.refusal.reason).toBe('field-outside-v1-save-payload');
      }
    }
  });

  it('refuses mode/holdings omissions and a non-admitted mode', () => {
    const noMode = validBody();
    delete noMode.mode;
    expect(validateBrokerImportSaveDto(noMode).ok).toBe(false);
    const noHoldings = validBody();
    delete noHoldings.holdings;
    expect(validateBrokerImportSaveDto(noHoldings).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ mode: 'UPSERT' })).ok).toBe(false);
  });

  it('refuses empty, non-array and over-limit holdings vectors', () => {
    expect(validateBrokerImportSaveDto(validBody({ holdings: [] })).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ holdings: 'x' })).ok).toBe(false);
    const many = Array.from({ length: BROKER_IMPORT_MAX_HOLDINGS + 1 }, () => holding());
    const result = validateBrokerImportSaveDto(validBody({ holdings: many }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.refusal.reason).toBe('holdings-exceed-bounded-limit');
  });
});

describe('brokerImportBoundary — broker-observed holding allowlist', () => {
  it('refuses canonical identity keys inside holdings (IPD resolves identity, W-6/C7)', () => {
    for (const key of ['companyId', 'runtimeCompanyId', 'identityStatus', 'resolutionDisposition']) {
      const result = validateBrokerImportSaveDto(validBody({ holdings: [holding({ [key]: 'X' } as Partial<BrokerObservedHoldingInput>)] }));
      expect(result.ok, `key ${key}`).toBe(false);
    }
  });

  it('refuses owner/tenant/credential keys nested at any depth', () => {
    const nested = validBody({ holdings: [holding({ isin: undefined } as Partial<BrokerObservedHoldingInput>)] });
    (nested.holdings as Array<Record<string, unknown>>)[0].token = 'nope';
    const result = validateBrokerImportSaveDto(nested);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.refusal.reason).toBe('caller-supplied-authority-or-identity-key-refused');
  });

  it('refuses non-allowlisted broker-observed extras (active, rawIdentifier, weightPercentage)', () => {
    for (const key of ['active', 'rawIdentifier', 'weightPercentage']) {
      const result = validateBrokerImportSaveDto(validBody({ holdings: [holding({ [key]: 1 } as Partial<BrokerObservedHoldingInput>)] }));
      expect(result.ok, `key ${key}`).toBe(false);
      if (!result.ok) expect(result.refusal.reason).toBe('field-outside-broker-observed-allowlist');
    }
  });

  it('refuses a tenantHint inside holdings as an authority key (deep scan), not merely an allowlist extra', () => {
    const result = validateBrokerImportSaveDto(validBody({ holdings: [holding({ tenantHint: 'x' } as Partial<BrokerObservedHoldingInput>)] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.refusal.reason).toBe('caller-supplied-authority-or-identity-key-refused');
  });

  it('refuses bad symbol, isin, exchange and numeric holding values without echoing them', () => {
    expect(validateBrokerImportSaveDto(validBody({ holdings: [{ symbol: '' }] })).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ holdings: [{ symbol: 'x'.repeat(33) }] })).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ holdings: [holding({ isin: 42 } as Partial<BrokerObservedHoldingInput>)] })).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ holdings: [holding({ exchange: 'NYSE' } as Partial<BrokerObservedHoldingInput>)] })).ok).toBe(false);
    const result = validateBrokerImportSaveDto(validBody({ holdings: [holding({ quantity: -5 } as Partial<BrokerObservedHoldingInput>)] }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.refusal.fieldPath).toBe('body.holdings[0].quantity');
      expect(JSON.stringify(result.refusal)).not.toContain('-5');
    }
  });
});

describe('brokerImportBoundary — digest and broker shapes', () => {
  it('accepts only the actual provider digest shape (64-char lowercase hex)', () => {
    expect(validateBrokerImportSaveDto(validBody({ contentDigest: VALID_DIGEST })).ok).toBe(true);
    expect(validateBrokerImportSaveDto(validBody({ contentDigest: VALID_DIGEST_B })).ok).toBe(true);
    for (const bad of ['A'.repeat(64), 'a'.repeat(63), 'a'.repeat(65), 'xyz', 42, 'a'.repeat(63) + 'G']) {
      expect(validateBrokerImportSaveDto(validBody({ contentDigest: bad as unknown as string })).ok, `digest ${String(bad).slice(0, 8)}`).toBe(false);
    }
  });

  it('refuses empty, blank or over-long broker strings', () => {
    expect(validateBrokerImportSaveDto(validBody({ broker: '' })).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ broker: '   ' })).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ broker: 'x'.repeat(33) })).ok).toBe(false);
    expect(validateBrokerImportSaveDto(validBody({ broker: 'GROWW' })).ok).toBe(true);
  });
});

describe('brokerImportBoundary — opaque route portfolioId', () => {
  it('accepts ordinary opaque identifiers and refuses malformed ones', () => {
    expect(validatePortfolioIdParam('DEFAULT_PORTFOLIO')).toBeNull();
    expect(validatePortfolioIdParam('P-1')).toBeNull();
    for (const bad of ['', '   ', 'a/b', 'a\\b', 'x'.repeat(129), 'a\u0000b']) {
      const refusal = validatePortfolioIdParam(bad);
      expect(refusal, `id ${JSON.stringify(bad)}`).not.toBeNull();
      expect(refusal?.fieldPath).toBe('path.portfolioId');
    }
  });
});
