/**
 * Phase C (`IRR-AC-03` / `D-4.2` / `D-4.4`) — Explicit historical source selector UI tests
 * on `DhanHistorical` (`DHAN_D02_OHLCV` vs `EQUICORE_NSE_EOD`).
 */
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DhanHistorical } from './DhanHistorical';

const NSE_ROW = {
  symbol: 'SYNTH',
  exchange: 'NSE' as const,
  result: {
    status: 'QUALIFIED' as const,
    securityIdentity: {
      securityId: 'ISIN:INE002A01018:EQ' as const,
      isin: 'INE002A01018',
      series: 'EQ',
      isinAuthority: 'NON_AUTHORITATIVE' as const,
    },
    companyId: 'SYNTHETIC:NSE',
    exchange: 'NSE' as const,
    isinAuthority: 'NON_AUTHORITATIVE' as const,
  },
};

const BSE_ROW = {
  symbol: 'SYNTH-BSE',
  exchange: 'BSE' as const,
  result: {
    status: 'QUALIFIED' as const,
    securityIdentity: {
      securityId: 'ISIN:INE002A01019:EQ' as const,
      isin: 'INE002A01019',
      series: 'EQ',
      isinAuthority: 'NON_AUTHORITATIVE' as const,
    },
    companyId: 'SYNTHETIC:BSE',
    exchange: 'BSE' as const,
    isinAuthority: 'NON_AUTHORITATIVE' as const,
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DhanHistorical explicit EQUICORE_NSE_EOD source selection (Phase C)', () => {
  it('renders EQUICORE_NSE_EOD source badge, D-4.4 unadjusted disclosure, and MD-09 completeness badges', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/api/dhan/instruments/search')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              data: { results: [NSE_ROW] },
              provenance: { authority: 'IPD', mode: 'SNAPSHOT', dataVersion: 'ipd-p4-identity-http' },
            }),
        } as Response);
      }
      if (url.includes('/api/equicore/historical')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              data: {
                source: 'EQUICORE_NSE_EOD',
                freshness: 'SNAPSHOT',
                companyId: 'SYNTHETIC:NSE',
                securityId: 'ISIN:INE002A01018:EQ',
                isin: 'INE002A01018',
                series: 'EQ',
                exchange: 'NSE',
                exchangeSegment: 'NSE_EQ',
                frequency: '1D',
                requestedFromDate: '2026-09-01',
                requestedToDate: '2026-09-03',
                total: 1,
                returnedBarCount: 1,
                complete: true,
                observedSymbols: ['SYNTH'],
                bars: [
                  {
                    businessDate: '2026-09-01',
                    candleStart: '2026-09-01T00:00:00.000Z',
                    candleEnd: '2026-09-01T23:59:59.999Z',
                    interval: '1D',
                    series: 'EQ',
                    observedSymbol: 'SYNTH',
                    securityIsin: 'INE002A01018',
                    isinNormalized: 'INE002A01018',
                    isinValidity: 'VALID',
                    flags: [],
                    open: 100,
                    high: 102,
                    low: 99,
                    close: 101.5,
                    last: 101.5,
                    prevClose: 99.5,
                    volume: 5000,
                    tradedValue: 507500,
                    tradesCount: 40,
                    isAdjusted: false,
                  },
                ],
                completeness: {
                  tradingDaysWithArchive: 2,
                  returnedBarCount: 1,
                  securityAbsentOnTradingDaysCount: 1,
                  unexplainedCalendarDates: ['2026-09-03'],
                  notRetrievedCalendarDates: [],
                  officialHolidayDates: [],
                  status: 'exact',
                },
                adjustment: {
                  mode: 'RAW_UNADJUSTED',
                  isAdjusted: false,
                  corporateActionApplied: false,
                  unitsProvenanceNote: 'Unadjusted for corporate actions (RAW_UNADJUSTED).',
                },
                temporal: {
                  temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT',
                  bitemporalKnowledgeAsOf: false,
                  pinnedGeneration: 'PINNED_GENERATION_EOD_SNAPSHOT',
                },
                provenance: {
                  dataset: 'i4-20261008-M2',
                  packageName: 'i4-20261008-M2',
                  baselineManifestSha256: 'e7c7e4c8'.repeat(8),
                  compositeGeneration: null,
                  servingIndexSha256: 'aa'.repeat(32),
                  isinIndexSha256: 'bb'.repeat(32),
                  runId: 'run-m2',
                  specVersion: 'D05/1.0',
                  engineToolSha256: 'cc'.repeat(32),
                  archiveCount: 2462,
                },
                integrity: {
                  responseDigest: '11'.repeat(32),
                  responseDigests: ['11'.repeat(32)],
                  digestVerified: true,
                },
                blended: false,
                fallbackAttempted: false,
              },
            }),
        } as Response);
      }
      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('historical-source-select'), {
      target: { value: 'EQUICORE_NSE_EOD' },
    });
    fireEvent.change(screen.getByTestId('dhan-historical-search-query'), {
      target: { value: 'SYNTH' },
    });
    fireEvent.click(screen.getByTestId('dhan-historical-search-submit'));

    await waitFor(() => screen.getByTestId('dhan-historical-pick'));
    fireEvent.click(screen.getByTestId('dhan-historical-pick'));
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => screen.getByTestId('equicore-historical-result'));

    expect(screen.getByTestId('equicore-historical-source')).toHaveTextContent('EQUICORE_NSE_EOD');
    expect(screen.getByTestId('equicore-historical-unadjusted-disclosure')).toHaveTextContent(
      'Unadjusted for corporate actions',
    );
    expect(screen.getByTestId('equicore-completeness-panel')).toHaveTextContent(
      'Unexplained calendar dates: 1',
    );
    expect(screen.getByTestId('equicore-completeness-panel')).toHaveTextContent(
      'Absent trading days: 1',
    );
    expect(
      fetchMock.mock.calls.some((call) => String(call[0]).includes('/api/dhan/historical')),
    ).toBe(false);
  });

  it('refuses BSE_EQ when EQUICORE_NSE_EOD is selected without falling back to DHAN_D02_OHLCV', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/api/dhan/instruments/search')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              data: { results: [BSE_ROW] },
              provenance: { authority: 'IPD', mode: 'SNAPSHOT', dataVersion: 'ipd-p4-identity-http' },
            }),
        } as Response);
      }
      return Promise.reject(new Error(`Unexpected fallback call to ${url}`));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('historical-source-select'), {
      target: { value: 'EQUICORE_NSE_EOD' },
    });
    fireEvent.change(screen.getByTestId('dhan-historical-search-query'), {
      target: { value: 'SYNTH-BSE' },
    });
    fireEvent.click(screen.getByTestId('dhan-historical-search-submit'));

    await waitFor(() => screen.getByTestId('dhan-historical-pick'));
    fireEvent.click(screen.getByTestId('dhan-historical-pick'));
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => screen.getByTestId('dhan-historical-failure'));
    expect(screen.getByTestId('dhan-historical-failure')).toHaveTextContent('NSE_EQ only');
    expect(
      fetchMock.mock.calls.some((call) => String(call[0]).includes('/api/dhan/historical')),
    ).toBe(false);
  });
});
