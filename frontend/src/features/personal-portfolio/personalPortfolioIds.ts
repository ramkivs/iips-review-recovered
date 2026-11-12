/**
 * Personal-portfolio identifiers.
 *
 * A personal portfolio is created with an explicit, caller-PROPOSED identifier because
 * the provider's personal create path falls back to its own default id when none is
 * supplied — which is precisely what made a single hard-coded portfolio the only
 * possible outcome. Proposing a fresh identifier per portfolio is what lets several
 * independent manual portfolios coexist.
 *
 * The proposal is a proposal only. The server admits its shape and the provider accepts
 * or refuses it; an identifier that already exists or has been removed is refused
 * upstream and is never reused here.
 *
 * IDENTIFIER SPACE
 *   Personal portfolios own the `PERSONAL-` prefix. Portfolios created by other
 *   channels — broker import in particular (`DHAN_PORTFOLIO` and its siblings) — do not
 *   carry it, so they are never listed, selected, edited or deleted by this surface.
 *   The prefix is therefore what keeps the two populations separate without this page
 *   having to open and interpret portfolios it does not own.
 */

/** Prefix that marks an identifier as owned by the personal manual-entry surface. */
export const PERSONAL_PORTFOLIO_ID_PREFIX = 'PERSONAL-';

/**
 * The identifier this surface previously hard-coded. It is deliberately never created
 * and never reused: it was removed, and the provider refuses to re-create a removed
 * identifier. It is named here only so the exclusion can be stated and tested.
 */
export const RETIRED_DEFAULT_PORTFOLIO_ID = 'DEFAULT_PORTFOLIO';

/**
 * The shape the provider admits for a personal-use identifier:
 * `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` — 1–64 characters, starting alphanumeric.
 */
const PERSONAL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

/** True when `id` is a well-formed identifier this surface is allowed to propose. */
export function isAdmissiblePersonalPortfolioId(id: string): boolean {
  return PERSONAL_ID_PATTERN.test(id);
}

/**
 * True when `id` belongs to the personal manual-entry population.
 *
 * Used to separate personal portfolios from every other portfolio on the same binding,
 * including broker-import portfolios, which this surface must leave untouched.
 */
export function isPersonalPortfolioId(id: string): boolean {
  return id.startsWith(PERSONAL_PORTFOLIO_ID_PREFIX) && isAdmissiblePersonalPortfolioId(id);
}

function randomHex(byteLength: number): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(byteLength);
    webCrypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // No Web Crypto (older JSDOM): still unpredictable enough for an opaque, non-security
  // identifier. The authoritative uniqueness check is the provider's own refusal.
  let out = '';
  for (let i = 0; i < byteLength * 2; i += 1) out += Math.floor(Math.random() * 16).toString(16);
  return out;
}

/**
 * Proposes a fresh personal identifier: `PERSONAL-` followed by 32 hex characters
 * grouped like a UUID (45 characters, inside the provider's 64-character bound).
 *
 * Freshness is what makes creation after a delete work while tombstone protection still
 * holds: a removed identifier stays refused forever, and a new portfolio simply proposes
 * an identifier that has never existed.
 */
export function newPersonalPortfolioId(): string {
  const hex = randomHex(16);
  return `${PERSONAL_PORTFOLIO_ID_PREFIX}${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
