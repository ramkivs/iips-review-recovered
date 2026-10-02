/**
 * Program v3.0 — NP-06 Reports: canonicalization + content-identity verification.
 *
 * TWO KINDS OF ASSERTION LIVE HERE.
 *
 * 1. NP-06 §5.2 rule coverage, exercised through this module.
 *
 * 2. CROSS-REPOSITORY EQUIVALENCE. NP-04 implements §5.2 for the persistence boundary and this
 *    module implements it for the Reports validation boundary (§5.3 makes recomputing `reportKey`
 *    a Reports obligation). A second implementation of one contract is a divergence hazard, so
 *    equivalence is PROVEN, not asserted: every expected value below was produced by EXECUTING the
 *    authoritative NP-04 implementation
 *      `iips-production-market-data@bd5229d01955feb0757bb1aa33252f9dc49dd68f:src/persistence/reportKey.ts`
 *    under the lockfile-pinned toolchain, and is pinned here as a golden vector. Any divergence in
 *    canonical bytes or derived key fails this suite.
 *
 * CONSOLIDATION STATUS (Requirement D — examined against the PUBLISHED dependency, and resolved):
 * this module cannot be reduced to a re-export today. The published `./persistence` boundary exports
 * the governed store, `openDatabase` and the error hierarchy only — no canonicalization — its
 * `exports` map declares exactly three subpaths with no wildcard, deep-importing the shipped
 * `reportKey.js` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`, and no source or declaration maps are
 * published. Reduction would therefore require NP-04 itself to publish the symbol, which is outside
 * this work's authority. The vectors below are consequently the proof that keeps the two
 * implementations equivalent, and it is a proof against the shipped artifact: the published
 * `dist/package/persistence/reportKey.js` of the pinned commit reproduces every one of them
 * byte-for-byte, with identical derived keys. See the consolidation determination in canonical.ts.
 */
import { describe, it, expect } from 'vitest';
import { canonicalizeReportKey, deriveReportKey, canonicalizePayload, CanonicalizationError } from './canonical';

/** Golden vectors: (input, canonical text, sha256 key) produced by the authoritative NP-04 module. */
const GOLDEN: ReadonlyArray<{
  name: string;
  input: Parameters<typeof canonicalizeReportKey>[0];
  canonical: string | null;
  key: string;
}> = [
  {
    name: 'minimal — absent scenario and parameters become explicit null',
    input: { reportType: 'Executive', portfolioId: 'P-1' },
    canonical: '{"reportType":"Executive","portfolioId":"P-1","scenario":null,"parameters":null}',
    key: 'bad5d938cffeac66b77c44d6ec5be82817b491515279c65de8686c48fa9883ce',
  },
  {
    name: 'explicit null scenario and parameters match absent',
    input: { reportType: 'Executive', portfolioId: 'P-1', scenario: null, parameters: null },
    canonical: '{"reportType":"Executive","portfolioId":"P-1","scenario":null,"parameters":null}',
    key: 'bad5d938cffeac66b77c44d6ec5be82817b491515279c65de8686c48fa9883ce',
  },
  {
    name: 'explicit scenario',
    input: { reportType: 'Portfolio Summary', portfolioId: 'P-2', scenario: 'Base' },
    canonical: '{"reportType":"Portfolio Summary","portfolioId":"P-2","scenario":"Base","parameters":null}',
    key: 'da57b0c5a48a5f1f1c1ca8dc9b9abaf817cb69be0742cce17f4f570bade5ff8e',
  },
  {
    name: 'all four primitive parameter types',
    input: { reportType: 'Executive', portfolioId: 'P-3', scenario: 'S', parameters: { s: 'x', n: 1, b: true, z: null } },
    canonical: '{"reportType":"Executive","portfolioId":"P-3","scenario":"S","parameters":{"b":true,"n":1,"s":"x","z":null}}',
    key: '9ca1adcf7b6a4cfbc4406a1e2b6502c655378071a3c36e8b31d3ef876e52af36',
  },
  {
    name: 'parameter order permutation A',
    input: { reportType: 'Executive', portfolioId: 'P-4', parameters: { beta: 2, alpha: 1, gamma: 3 } },
    canonical: '{"reportType":"Executive","portfolioId":"P-4","scenario":null,"parameters":{"alpha":1,"beta":2,"gamma":3}}',
    key: '1c2903c80b10912c6cc073226d16d44eb7a8020150324a72007c9559cbb43406',
  },
  {
    name: 'parameter order permutation B (same key as A)',
    input: { reportType: 'Executive', portfolioId: 'P-4', parameters: { gamma: 3, beta: 2, alpha: 1 } },
    canonical: '{"reportType":"Executive","portfolioId":"P-4","scenario":null,"parameters":{"alpha":1,"beta":2,"gamma":3}}',
    key: '1c2903c80b10912c6cc073226d16d44eb7a8020150324a72007c9559cbb43406',
  },
  {
    name: 'empty parameter object canonicalizes as null',
    input: { reportType: 'Executive', portfolioId: 'P-5', parameters: {} },
    canonical: '{"reportType":"Executive","portfolioId":"P-5","scenario":null,"parameters":null}',
    key: 'f976cf8374376c0d38727b58aa072cc38e200b91e7293abeac4d55d092c2596e',
  },
  {
    name: 'astral vs BMP parameter names ordered by code point',
    input: { reportType: 'Executive', portfolioId: 'P-6', parameters: { '\u{10000}': 'astral', '\uE000': 'bmp', '\uFFFD': 'replacement' } },
    canonical: null, // asserted structurally below (contains astral characters)
    key: '3f6fdedea058f63984829457437fc86ef48fe5ec7e6b1ea276e5099021a28616',
  },
  {
    name: 'case is not folded — upper',
    input: { reportType: 'EXECUTIVE', portfolioId: 'P-7' },
    canonical: '{"reportType":"EXECUTIVE","portfolioId":"P-7","scenario":null,"parameters":null}',
    key: 'bf7259376ef86e04cbb826671498049d941abac3933913683791178f502bf015',
  },
  {
    name: 'case is not folded — lower (differs from upper)',
    input: { reportType: 'executive', portfolioId: 'P-7' },
    canonical: '{"reportType":"executive","portfolioId":"P-7","scenario":null,"parameters":null}',
    key: 'a913142d3e2fd4c1834999153f9e46ad399de59d6388d77a099d28e0a87dc78b',
  },
  {
    name: 'Unicode NFC composed is preserved as given',
    input: { reportType: 'Caf\u00e9', portfolioId: 'P-8' },
    canonical: null,
    key: 'be05c715056334c37fd10d4c70ac655c1badac620f2e46829485116e6cfa7b3f',
  },
  {
    name: 'Unicode NFD decomposed is NOT normalized (differs from NFC)',
    input: { reportType: 'Cafe\u0301', portfolioId: 'P-8' },
    canonical: null,
    key: '2dbbec119962c947dcb9bbaeb2e371b08df08ca71378d690604ba21ab69587a3',
  },
  {
    name: 'numbers use shortest round-trip form',
    input: { reportType: 'Executive', portfolioId: 'P-9', parameters: { a: 0.1, b: 1e21, c: -0, d: 1e-7 } },
    canonical: '{"reportType":"Executive","portfolioId":"P-9","scenario":null,"parameters":{"a":0.1,"b":1e+21,"c":0,"d":1e-7}}',
    key: '698f30f2d60371be74702d2c9dee7e50ac4a49da6a4fe0c177c95c49feeec28f',
  },
  {
    name: 'string escaping per JSON',
    input: { reportType: 'Executive', portfolioId: 'P-10', parameters: { q: 'say "hi"', bs: 'a\\b', nl: 'a\nb', tab: 'a\tb' } },
    canonical: null,
    key: '84ec96094a6579edcfa22297d0949272b17aa74748518518ae4f28f165a336c4',
  },
];

describe('NP-06 §5.2 canonical reportKey — golden vectors from the authoritative NP-04 implementation', () => {
  it.each(GOLDEN)('$name', ({ input, canonical, key }) => {
    expect(deriveReportKey(input)).toBe(key);
    if (canonical !== null) expect(canonicalizeReportKey(input)).toBe(canonical);
  });

  it('is byte-stable: repeated derivation is identical', () => {
    const input = { reportType: 'Executive', portfolioId: 'P-1', parameters: { a: 1, b: 'x' } };
    const first = canonicalizeReportKey(input);
    for (let i = 0; i < 50; i += 1) expect(canonicalizeReportKey(input)).toBe(first);
    expect(deriveReportKey(input)).toBe(deriveReportKey(input));
  });

  it('orders parameter names by true code point, not UTF-16 code unit', () => {
    // U+E000 (BMP) vs U+FFFD (BMP) vs U+10000 (astral). UTF-16 code-unit order would place the
    // astral character FIRST (lead surrogate 0xD800 < 0xE000); code-point order places it LAST.
    const c = canonicalizeReportKey({
      reportType: 'Executive',
      portfolioId: 'P-6',
      parameters: { '\u{10000}': 'astral', '\uE000': 'bmp', '\uFFFD': 'replacement' },
    });
    const iBmp = c.indexOf('\uE000');
    const iReplacement = c.indexOf('\uFFFD');
    const iAstral = c.indexOf('\u{10000}');
    expect(iBmp).toBeGreaterThan(-1);
    expect(iBmp).toBeLessThan(iReplacement);
    expect(iReplacement).toBeLessThan(iAstral);
  });

  it('distinguishes NFC from NFD — no Unicode normalization is applied', () => {
    expect(deriveReportKey({ reportType: 'Caf\u00e9', portfolioId: 'P-8' })).not.toBe(
      deriveReportKey({ reportType: 'Cafe\u0301', portfolioId: 'P-8' }),
    );
  });

  it('uses exactly four canonical members and no others', () => {
    const c = canonicalizeReportKey({
      reportType: 'Executive',
      portfolioId: 'P-1',
      scenario: 'S',
      parameters: { a: 1 },
    });
    expect(Object.keys(JSON.parse(c))).toEqual(['reportType', 'portfolioId', 'scenario', 'parameters']);
    // reportId can never enter content identity: it is not an accepted member.
    const withId = canonicalizeReportKey({
      reportType: 'Executive',
      portfolioId: 'P-1',
      scenario: 'S',
      parameters: { a: 1 },
      reportId: 'ignored',
    } as never);
    expect(withId).toBe(c);
  });

  it('produces lowercase hex SHA-256', () => {
    const key = deriveReportKey({ reportType: 'Executive', portfolioId: 'P-1' });
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('NP-06 §5.2 — fail-closed rejection (reject, never coerce)', () => {
  const REJECTED: ReadonlyArray<[string, unknown]> = [
    ['nested object parameter (must be rejected, not flattened)', { reportType: 'E', portfolioId: 'Q-1', parameters: { a: { b: 1 } } }],
    ['array parameter', { reportType: 'E', portfolioId: 'Q-2', parameters: { a: [1, 2] } }],
    ['NaN parameter', { reportType: 'E', portfolioId: 'Q-3', parameters: { a: NaN } }],
    ['Infinity parameter', { reportType: 'E', portfolioId: 'Q-4', parameters: { a: Infinity } }],
    ['-Infinity parameter', { reportType: 'E', portfolioId: 'Q-4b', parameters: { a: -Infinity } }],
    ['empty reportType', { reportType: '', portfolioId: 'Q-5' }],
    ['empty portfolioId', { reportType: 'E', portfolioId: '' }],
    ['non-string reportType', { reportType: 42, portfolioId: 'Q-7' }],
    ['empty scenario string', { reportType: 'E', portfolioId: 'Q-8', scenario: '' }],
    ['empty parameter name', { reportType: 'E', portfolioId: 'Q-9', parameters: { '': 1 } }],
    ['undefined parameter value', { reportType: 'E', portfolioId: 'Q-10', parameters: { a: undefined } }],
    ['parameters as array', { reportType: 'E', portfolioId: 'Q-11', parameters: [1, 2] }],
    ['null input', null],
  ];

  it.each(REJECTED)('rejects: %s', (_name, input) => {
    expect(() => canonicalizeReportKey(input as never)).toThrow(CanonicalizationError);
  });
});

describe('canonical structured payload (NP-06 §5.3 re-canonicalization)', () => {
  it('sorts object members by code point at every level', () => {
    expect(canonicalizePayload({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('preserves array order while canonicalizing elements', () => {
    expect(canonicalizePayload([{ z: 1, a: 2 }, 'x'])).toBe('[{"a":2,"z":1},"x"]');
  });

  it('is byte-stable regardless of construction order', () => {
    const a = { ranking: [{ b: 1, a: 2 }], meta: { y: null, x: true } };
    const b = { meta: { x: true, y: null }, ranking: [{ a: 2, b: 1 }] };
    expect(canonicalizePayload(a)).toBe(canonicalizePayload(b));
  });

  it('uses the same shortest round-trip number form as reportKey canonicalization', () => {
    expect(canonicalizePayload({ a: 0.1, b: 1e21, c: -0, d: 1e-7 })).toBe('{"a":0.1,"b":1e+21,"c":0,"d":1e-7}');
  });

  it('escapes strings per JSON', () => {
    expect(canonicalizePayload({ s: 'a"b\\c\nd' })).toBe('{"s":"a\\"b\\\\c\\nd"}');
  });

  const REJECTED: ReadonlyArray<[string, unknown]> = [
    ['undefined', { a: undefined }],
    ['function', { a: () => 1 }],
    ['bigint', { a: 1n }],
    ['non-finite number', { a: Infinity }],
    ['Date instance (non-plain object)', { a: new Date(0) }],
    ['Map instance', { a: new Map() }],
    ['class instance', { a: new (class X { y = 1 })() }],
  ];

  it.each(REJECTED)('rejects non-canonicalizable value: %s', (_name, value) => {
    expect(() => canonicalizePayload(value)).toThrow(CanonicalizationError);
  });

  it('rejects a cyclic structure rather than hanging or truncating', () => {
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;
    expect(() => canonicalizePayload(cyclic)).toThrow(/cyclic/);
  });

  it('does not mutate its input', () => {
    const input = { b: 1, a: { d: 2, c: 3 } };
    const snapshot = JSON.stringify(input);
    canonicalizePayload(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});
