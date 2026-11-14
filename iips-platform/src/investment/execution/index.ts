/**
 * W11 — compatible issuer-engine execution (public surface).
 *
 * `executePortfolioEngines` walks persisted portfolio → holding → resolved issuer → W10 qualification → engine
 * input → frozen engine execution, and publishes a reproducible record per executed holding. `prepareEngineExecution`
 * is the same decision without execution, for callers that only need the plan or the refusal.
 */
export * from './types';
export { datasetContentDigest, prepareEngineExecution, sha256 } from './inputs';
export { certifiedEngineExecutor, executeIssuerEngine, executePortfolioEngines, type ExecuteIssuerResult } from './execute';
