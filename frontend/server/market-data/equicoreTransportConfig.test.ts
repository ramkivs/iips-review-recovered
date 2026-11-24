/**
 * Phase C (PA-DEC-03 / IRR-AC-01) — EquiCore transport configuration boundary tests.
 */
import { describe, expect, it } from 'vitest';
import {
  EQUICORE_BASE_URL_ENV,
  EQUICORE_DEFAULT_TIMEOUT_MS,
  EQUICORE_TIMEOUT_MS_ENV,
  EQUICORE_TRANSPORT_TOKEN_ENV,
  readEquiCoreTransportConfiguration,
} from './equicoreTransportConfig';

const TOKEN = 'synthetic-equicore-loopback-token-01';

describe('EquiCore server transport configuration', () => {
  it('pins the expected env var names', () => {
    expect(EQUICORE_BASE_URL_ENV).toBe('IIPS_EQUICORE_BASE_URL');
    expect(EQUICORE_TRANSPORT_TOKEN_ENV).toBe('IIPS_EQUICORE_TRANSPORT_TOKEN');
    expect(EQUICORE_TIMEOUT_MS_ENV).toBe('IIPS_EQUICORE_TIMEOUT_MS');
  });

  it('fails closed when URL or token is missing, empty, or contains whitespace/control chars without leaking token', () => {
    expect(readEquiCoreTransportConfiguration({})).toMatchObject({
      ok: false,
      code: 'NOT_CONFIGURED',
      requiredSettings: ['IIPS_EQUICORE_BASE_URL', 'IIPS_EQUICORE_TRANSPORT_TOKEN'],
    });
    expect(
      readEquiCoreTransportConfiguration({
        [EQUICORE_BASE_URL_ENV]: 'http://127.0.0.1:8614',
      }),
    ).toMatchObject({ ok: false, code: 'NOT_CONFIGURED' });

    const badTokenRes = readEquiCoreTransportConfiguration({
      [EQUICORE_BASE_URL_ENV]: 'http://127.0.0.1:8614',
      [EQUICORE_TRANSPORT_TOKEN_ENV]: ` ${TOKEN}\n`,
    });
    expect(badTokenRes).toMatchObject({ ok: false, code: 'NOT_CONFIGURED' });
    if (!badTokenRes.ok) {
      expect(badTokenRes.message).not.toContain(TOKEN);
    }
  });

  it('rejects non-http, non-loopback hosts, embedded credentials, paths, queries, and fragments', () => {
    const cases = [
      ['not-a-url', 'MALFORMED_BASE_URL'],
      ['https://127.0.0.1:8614', 'MALFORMED_BASE_URL'],
      ['http://user:pass@127.0.0.1:8614', 'MALFORMED_BASE_URL'],
      ['http://127.0.0.1:8614/v1', 'MALFORMED_BASE_URL'],
      ['http://127.0.0.1:8614/?x=1', 'MALFORMED_BASE_URL'],
      ['http://127.0.0.1:8614/#frag', 'MALFORMED_BASE_URL'],
      ['http://0.0.0.0:8614', 'NON_LOOPBACK_BASE_URL'],
      ['http://192.168.1.50:8614', 'NON_LOOPBACK_BASE_URL'],
      ['http://equicore.example.test:8614', 'NON_LOOPBACK_BASE_URL'],
    ] as const;

    for (const [url, expectedCode] of cases) {
      const res = readEquiCoreTransportConfiguration({
        [EQUICORE_BASE_URL_ENV]: url,
        [EQUICORE_TRANSPORT_TOKEN_ENV]: TOKEN,
      });
      expect(res).toMatchObject({ ok: false, code: expectedCode });
    }
  });

  it('accepts loopback http:// origins and validates optional timeout bounds', () => {
    for (const [raw, expectedOrigin] of [
      ['http://127.0.0.1:8614/', 'http://127.0.0.1:8614'],
      ['http://localhost:8614', 'http://localhost:8614'],
      ['http://[::1]:8614///', 'http://[::1]:8614'],
    ] as const) {
      expect(
        readEquiCoreTransportConfiguration({
          [EQUICORE_BASE_URL_ENV]: raw,
          [EQUICORE_TRANSPORT_TOKEN_ENV]: TOKEN,
        }),
      ).toEqual({
        ok: true,
        config: {
          baseUrl: expectedOrigin,
          token: TOKEN,
          timeoutMs: EQUICORE_DEFAULT_TIMEOUT_MS,
        },
      });
    }

    expect(
      readEquiCoreTransportConfiguration({
        [EQUICORE_BASE_URL_ENV]: 'http://127.0.0.1:8614',
        [EQUICORE_TRANSPORT_TOKEN_ENV]: TOKEN,
        [EQUICORE_TIMEOUT_MS_ENV]: '2500',
      }),
    ).toMatchObject({ ok: true, config: { timeoutMs: 2500 } });

    expect(
      readEquiCoreTransportConfiguration({
        [EQUICORE_BASE_URL_ENV]: 'http://127.0.0.1:8614',
        [EQUICORE_TRANSPORT_TOKEN_ENV]: TOKEN,
        [EQUICORE_TIMEOUT_MS_ENV]: '50',
      }),
    ).toMatchObject({ ok: false, code: 'NOT_CONFIGURED' });
  });
});
