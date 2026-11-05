/**
 * IID-1 — synthetic identity fixture loader.
 *
 * The fixtures live under `fixtures/identity/` and are deliberately small and synthetic: they validate
 * identity mechanics (every resolution state is reachable) and prove nothing about real-company coverage.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  loadIdentitySources,
  type IdentitySourceTexts,
  type SourceLoadResult,
} from '../../src/investment/identity/sources';
import type { IdentitySources } from '../../src/investment/identity/types';
import type { IdentityObservation } from '../../src/investment/identity/types';

export const IDENTITY_FIXTURES = join(__dirname, 'fixtures', 'identity');
export const FIXTURE_AS_OF = '2026-11-05';

export function identitySourceTexts(): IdentitySourceTexts {
  return {
    roster: readFileSync(join(IDENTITY_FIXTURES, 'eligible-roster.json'), 'utf8'),
    listingMap: readFileSync(join(IDENTITY_FIXTURES, 'listing-map.json'), 'utf8'),
    corporateActions: readFileSync(join(IDENTITY_FIXTURES, 'corporate-actions.json'), 'utf8'),
  };
}

export function loadFixtureSources(): IdentitySources {
  const result: SourceLoadResult = loadIdentitySources(identitySourceTexts());
  if (!result.available) {
    throw new Error(`identity fixture failed to load: ${JSON.stringify(result.issues, null, 2)}`);
  }
  return result.sources;
}

export function loadFixtureSourcesResult(): SourceLoadResult {
  return loadIdentitySources(identitySourceTexts());
}

export function fixtureObservations(): readonly IdentityObservation[] {
  const parsed = JSON.parse(readFileSync(join(IDENTITY_FIXTURES, 'observations.json'), 'utf8')) as {
    asOf: string;
    observations: IdentityObservation[];
  };
  return parsed.observations;
}
