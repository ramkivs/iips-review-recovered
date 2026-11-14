/**
 * @vitest-environment node
 *
 * D114 lossless projection — the WIRE segment the other Phase 1 D114 tests do not execute.
 *
 * `phase1D114IdentityProjection.test.ts` hands `toHoldingObservation` an already-typed `G2HoldingView`,
 * and its loopback HTTP test injects the holdings provider. Neither carries a nested `securityIdentity`
 * through the REAL read path IRR uses for a persisted IPD holding:
 *
 *   IPD `portfolio.get` response frame
 *     -> `callIpc` (framing + OC-6 inbound disclosure scan)
 *     -> `IpcUserPortfolioPort.getPortfolio` (`toG2View`)
 *     -> `createPortfolioHoldingsProvider`
 *     -> `toHoldingObservation` (`projectD114SecurityIdentity`)
 *     -> `identityInputOf`  (the resolver input)
 *     -> `resolveIdentity`
 *
 * The rows below use exactly the key set IPD's `PortfolioStore.holdingFromRow` emits for a persisted
 * holding: no flat `isin`, no `exchange`, a nested `securityIdentity` that is either the stored D114 object
 * or `null`. Everything is synthetic fixture data; nothing here describes an actual holding.
 */
import net from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { FIXTURE_AS_OF, loadFixtureSources } from '../../../iips-platform/tests/investment/identityFixture';
import { identityInputOf } from '../../../iips-platform/src/investment/identity/resolver';
import type { IdentityInput } from '../../../iips-platform/src/investment/identity/types';
import { IPC_LENGTH_PREFIX_BYTES, IPC_PROTOCOL_VERSION } from '../user-portfolio/ipcClient.js';
import { IpcUserPortfolioPort } from '../user-portfolio/ipcPortAdapter.js';
import { BINDING_PRECONDITION_SETTING } from '../user-portfolio/ownerContextFromBinding.js';
import { resolveHoldingIdentities } from './holding-identity-transport';
import { createPortfolioHoldingsProvider, toHoldingObservation } from './sources';

const PORTFOLIO_ID = 'p-d114';

/** The measured, non-identity columns of a persisted holding row. */
const MEASURES = {
  quantity: 10,
  averageBuyPrice: 100,
  currentPrice: 110,
  marketValue: 1100,
  weightPercentage: 25,
  active: true,
  sourceBroker: 'synthetic-broker',
  lineageDigest: 'c'.repeat(64),
} as const;

/** Persisted IPD holdings exactly as `holdingFromRow` projects them onto the `portfolio.get` result. */
const WIRE_HOLDINGS = [
  {
    // Stored D114 identity, canonical upper case.
    symbol: 'BODHI',
    companyId: 'EQ_BODHI_IN',
    ...MEASURES,
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    securityIdentity: {
      securityId: 'ISIN:IN0000000029:EQ',
      isin: 'IN0000000029',
      series: 'EQ',
      isinAuthority: 'NON_AUTHORITATIVE',
    },
  },
  {
    // Stored NULL: explicitly unresolved at IPD import. Not malformed, and nothing may be inferred for it.
    symbol: 'AARAV',
    companyId: 'EQ_AARAV_IN',
    ...MEASURES,
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    securityIdentity: null,
  },
  {
    // IPD's D114 grammar is case-preserving (`/^[A-Za-z0-9]{12}$/`, any trimmed series), so a lower-case
    // stored identity is valid upstream. The stored object must survive verbatim.
    symbol: 'BODHI',
    companyId: 'EQ_BODHI_IN',
    ...MEASURES,
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    securityIdentity: {
      securityId: 'ISIN:in0000000029:eq',
      isin: 'in0000000029',
      series: 'eq',
      isinAuthority: 'NON_AUTHORITATIVE',
    },
  },
  {
    // A stored series the listing map does not carry for this security. It must reach the resolver as
    // stored and be reported, never replaced by the security's ordinary `EQ` listing.
    symbol: 'BODHI',
    companyId: 'EQ_BODHI_IN',
    ...MEASURES,
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    securityIdentity: {
      securityId: 'ISIN:IN0000000029:A',
      isin: 'IN0000000029',
      series: 'A',
      isinAuthority: 'NON_AUTHORITATIVE',
    },
  },
] as const;

function wireView(): Record<string, unknown> {
  return {
    portfolioId: PORTFOLIO_ID,
    portfolioName: 'D114 wire path',
    revision: 1,
    holdingsCount: WIRE_HOLDINGS.length,
    totalMarketValue: 4400,
    lastUpdated: '2026-11-13T00:00:00.000Z',
    weightSumPercentage: 100,
    provenanceDigest: 'stored-provenance-digest',
    isSaved: true,
    holdings: WIRE_HOLDINGS,
    contributions: [],
  };
}

interface Peer {
  readonly path: string;
  readonly operations: string[];
  close(): Promise<void>;
}

const peers: Peer[] = [];

afterEach(async () => {
  for (const peer of peers.splice(0)) await peer.close();
});

/** Minimal contract-v1 peer: one request per connection, one length-prefixed success frame back. */
function startPeer(result: unknown): Promise<Peer> {
  return new Promise((resolveStart, rejectStart) => {
    const dir = mkdtempSync(join(tmpdir(), 'irr-d114-wire-'));
    const path = join(dir, 'ipd-peer.sock');
    const operations: string[] = [];
    const live: net.Socket[] = [];
    const server = net.createServer({ allowHalfOpen: true }, (socket) => {
      live.push(socket);
      const chunks: Buffer[] = [];
      socket.on('data', (chunk: Buffer) => chunks.push(chunk));
      socket.on('error', () => undefined);
      socket.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const declared = buffer.readUInt32BE(0);
        const request = JSON.parse(
          buffer.subarray(IPC_LENGTH_PREFIX_BYTES, IPC_LENGTH_PREFIX_BYTES + declared).toString('utf8'),
        ) as { op: string };
        operations.push(request.op);
        const body = Buffer.from(JSON.stringify({ v: IPC_PROTOCOL_VERSION, ok: true, op: request.op, result }), 'utf8');
        const frame = Buffer.alloc(IPC_LENGTH_PREFIX_BYTES + body.byteLength);
        frame.writeUInt32BE(body.byteLength, 0);
        body.copy(frame, IPC_LENGTH_PREFIX_BYTES);
        socket.write(frame);
        socket.end();
      });
    });
    server.once('error', (error: Error) => rejectStart(error));
    server.listen({ path }, () => {
      const peer: Peer = {
        path,
        operations,
        close: () =>
          new Promise<void>((resolveClose) => {
            for (const socket of live) socket.destroy();
            server.close(() => {
              rmSync(dir, { recursive: true, force: true });
              resolveClose();
            });
          }),
      };
      peers.push(peer);
      resolveStart(peer);
    });
  });
}

async function readHoldingsOverTheWire() {
  const peer = await startPeer(wireView());
  const provider = createPortfolioHoldingsProvider({
    env: { [BINDING_PRECONDITION_SETTING]: 'true' },
    portFactory: () =>
      new IpcUserPortfolioPort({
        precondition: { bindingProvisioned: true },
        target: { kind: 'unix-socket', path: peer.path, source: 'absolute-path' },
      }),
  });
  const holdings = await provider(PORTFOLIO_ID);
  return { peer, holdings };
}

describe('D114 — persisted IPD holding over the real IPC read path into the resolver input', () => {
  it('delivers every persisted identifier unchanged through framing, the inbound scan and the G2 view', async () => {
    const { peer, holdings } = await readHoldingsOverTheWire();

    expect(peer.operations).toEqual(['portfolio.get']);
    // Byte-for-byte: same keys, same order, same values, `null` still `null`. Nothing added, nothing dropped.
    expect(JSON.stringify(holdings)).toBe(JSON.stringify(WIRE_HOLDINGS));
    for (const holding of holdings) {
      // IPD persists neither a flat ISIN nor an exchange; the read path must not manufacture either.
      expect(Object.prototype.hasOwnProperty.call(holding, 'isin')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(holding, 'exchange')).toBe(false);
    }
  });

  it('projects each persisted identifier onto exactly one resolver-input field and substitutes none', async () => {
    const { holdings } = await readHoldingsOverTheWire();
    const observations = holdings.map((holding, index) => toHoldingObservation(PORTFOLIO_ID, holding, index));
    const inputs = observations.map((observation) => identityInputOf(observation));

    const expected: IdentityInput[] = [
      {
        observationId: 'holding:p-d114:0001',
        source: 'HOLDING',
        isin: 'IN0000000029',
        symbol: 'BODHI',
        exchange: null,
        series: 'EQ',
        cin: null,
        companyIdHint: 'EQ_BODHI_IN',
      },
      {
        observationId: 'holding:p-d114:0002',
        source: 'HOLDING',
        isin: null,
        symbol: 'AARAV',
        exchange: null,
        series: null,
        cin: null,
        companyIdHint: 'EQ_AARAV_IN',
      },
      {
        observationId: 'holding:p-d114:0003',
        source: 'HOLDING',
        // Case-folded for matching only; the stored spelling is asserted on the observation below.
        isin: 'IN0000000029',
        symbol: 'BODHI',
        exchange: null,
        series: 'EQ',
        cin: null,
        companyIdHint: 'EQ_BODHI_IN',
      },
      {
        observationId: 'holding:p-d114:0004',
        source: 'HOLDING',
        isin: 'IN0000000029',
        symbol: 'BODHI',
        exchange: null,
        // The stored series, not the `EQ` series this security is actually listed in.
        series: 'A',
        cin: null,
        companyIdHint: 'EQ_BODHI_IN',
      },
    ];
    // Strict: an extra key (for example a rejection marker) or a missing key fails the comparison.
    expect(inputs).toStrictEqual(expected);
    // The portfolio the rows were read from stays on the observation; it is not a resolver input.
    expect(observations.map((observation) => observation.portfolioId)).toEqual(Array(4).fill(PORTFOLIO_ID));

    // The stored D114 object rides beside the resolver input, verbatim, including its stored spelling.
    expect(observations.map((observation) => observation.securityIdentity)).toStrictEqual(
      WIRE_HOLDINGS.map((holding) => holding.securityIdentity),
    );
    expect(observations.map((observation) => observation.securityIdentityRejection)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(observations[2]?.raw['securityIdentity.securityId']).toBe('ISIN:in0000000029:eq');
    expect(observations[2]?.raw['securityIdentity.isin']).toBe('in0000000029');
    expect(observations[2]?.raw['securityIdentity.series']).toBe('eq');
    expect(observations[1]?.raw.securityIdentity).toBeNull();
    expect(observations.map((observation) => observation.raw.symbol)).toEqual(['BODHI', 'AARAV', 'BODHI', 'BODHI']);
    expect(observations.map((observation) => observation.raw.companyId)).toEqual([
      'EQ_BODHI_IN',
      'EQ_AARAV_IN',
      'EQ_BODHI_IN',
      'EQ_BODHI_IN',
    ]);
  });

  it('resolves from the stored ISIN and series only, and never from the symbol of an unresolved row', async () => {
    const { holdings } = await readHoldingsOverTheWire();
    const identities = resolveHoldingIdentities(PORTFOLIO_ID, holdings, loadFixtureSources(), FIXTURE_AS_OF);

    expect(identities).toHaveLength(4);
    expect(identities[0]).toMatchObject({
      state: 'RESOLVED',
      outcomeClass: 'RESOLVED',
      resolutionBasis: 'ISIN',
      issuerId: 'IN:CIN:U72200TN2001PLC000005',
      securityId: 'IN:ISIN:IN0000000029',
      listingId: 'IN:NSE:BODHI:EQ:EQUITY',
      isin: 'IN0000000029',
      series: 'EQ',
      d114SecurityIdentity: WIRE_HOLDINGS[0].securityIdentity,
    });
    // `AARAV` is an active NSE symbol in the fixture listing map. A stored NULL identity must not be
    // completed from it: there is no ISIN and no exchange, so there is no identity.
    expect(identities[1]).toMatchObject({
      state: 'UNMATCHED',
      reason: 'NO_IDENTIFIER_PROVIDED',
      outcomeClass: 'UNRESOLVED',
      issuerId: null,
      securityId: null,
      listingId: null,
      isin: null,
      series: null,
      d114SecurityIdentity: null,
    });
    // Same security and listing as row 1; the stored lower-case object is still reported as stored.
    expect(identities[2]).toMatchObject({
      state: 'RESOLVED',
      issuerId: 'IN:CIN:U72200TN2001PLC000005',
      securityId: 'IN:ISIN:IN0000000029',
      listingId: 'IN:NSE:BODHI:EQ:EQUITY',
      d114SecurityIdentity: WIRE_HOLDINGS[2].securityIdentity,
    });
    // The stored series is honoured as a discriminator: no issuer link is minted through another series.
    expect(identities[3]).toMatchObject({
      state: 'AMBIGUOUS_LISTING',
      reason: 'MULTIPLE_SECURITIES_SHARE_LISTING',
      outcomeClass: 'UNRESOLVED',
      issuerId: null,
      listingId: null,
      series: 'A',
      d114SecurityIdentity: WIRE_HOLDINGS[3].securityIdentity,
    });
  });
});
