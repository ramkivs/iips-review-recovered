/** Read-only broker preview. No PortfolioStore, persistence, identity bypass or network.
 * Native broker evidence is not an authoritative security mapping or a save request.
 */
import { BrokerImportIngressOrchestrator } from '../../.cache/broker-import/frontend/src/features/portfolio/import/broker-import-ingress.js';
import { SecurityMaster } from '../../.cache/broker-import/src/identity/security_master.js';

export function previewBrokerHoldings(content: string, fileName: string, asOf: string) {
  if (typeof content !== 'string' || typeof fileName !== 'string' || typeof asOf !== 'string'
      || !Number.isFinite(Date.parse(asOf))) {
    throw new Error('Preview requires CSV text, a filename and a valid observation timestamp.');
  }
  if (new TextEncoder().encode(content).byteLength > 1_048_576 || fileName.length > 256) {
    throw new Error('Preview is limited to 1 MiB of CSV and a 256-character filename.');
  }
  const result = BrokerImportIngressOrchestrator.executeIngress({
    content, fileName, asOf,
    // Deliberately empty: no fixture or synthetic security is an ownership/identity authority.
    securityMaster: new SecurityMaster(),
    failOnUnmappedIdentity: true,
    allowNonProductionBypass: false,
    allowPartialRejection: false,
    executionEnvironment: 'NON_PRODUCTION',
  });
  const parsed = result.parseResult;
  return {
    mode: 'NATIVE_BROKER_PREVIEW' as const,
    persisted: false as const,
    canSave: false as const,
    broker: result.detection.brokerType,
    variant: typeof parsed?.metadata?.dhanVariant === 'string' ? parsed.metadata.dhanVariant : undefined,
    status: result.disposition === 'BLOCKED' ? 'BLOCKED' as const
      : parsed?.success && parsed.holdings.length > 0 ? 'PARSED_UNRESOLVED' as const : 'REJECTED' as const,
    contentDigest: result.provenance.contentDigest,
    asOf,
    warnings: result.warnings,
    errors: result.errors,
    rejections: result.rejections,
    // Project native evidence only: no raw object, fabricated companyId, computed weights or store metadata.
    holdings: (parsed?.holdings ?? []).map(h => ({
      symbol: h.symbol, isin: h.isin, exchange: h.exchange,
      quantity: h.quantity, averagePrice: h.averagePrice, currentPrice: h.currentPrice,
      identityStatus: 'UNRESOLVED' as const,
    })),
  };
}
export type BrokerHoldingsPreview = ReturnType<typeof previewBrokerHoldings>;
