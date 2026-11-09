/** First-party application routing; product surfaces are mounted directly without a session gate. */
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { ROUTES } from './routes';
import { FeatureNotImplemented } from '../components/shell/ShellStates';
import { ExecutiveDashboard } from '../features/executive/ExecutiveDashboard';
import { PortfolioWorkspace } from '../features/portfolio/PortfolioWorkspace';
import { BrokerHoldingsPreview } from '../features/broker-holdings/BrokerHoldingsPreview';
import { PersonalPortfolio } from '../features/personal-portfolio/PersonalPortfolio';
import { UserPortfolioList } from '../features/user-portfolios/UserPortfolioList';
import { UserPortfolioDetail } from '../features/user-portfolios/UserPortfolioDetail';
import { BrokerImportSurface } from '../features/portfolio-import/BrokerImportSurface';
import { CompanyIntelligence } from '../features/company/CompanyIntelligence';
import { CrossSectorIntelligence } from '../features/cross-sector/CrossSectorIntelligence';
import { MacroResearch } from '../features/research/MacroResearch';
import { IntelligenceOpportunities } from '../features/intelligence/IntelligenceOpportunities';
import { IntelligenceRisks } from '../features/intelligence/IntelligenceRisks';
import { IntelligenceRankings } from '../features/intelligence/IntelligenceRankings';
import { DecisionMatrix } from '../features/decision-matrix/DecisionMatrix';
import { AiAdvisory } from '../features/ai-advisory/AiAdvisory';
import { EvidenceLanding } from '../features/evidence/EvidenceLanding';
import { EvidenceExplorer } from '../features/evidence/EvidenceExplorer';
import { ReplayExplorer } from '../features/replay/ReplayExplorer';
import { EngineRegistry } from '../features/engines/EngineRegistry';
import { Screener } from '../features/screener/Screener';
import { Watchlists } from '../features/watchlists/Watchlists';
import InvestmentLandingPage from '../features/investment/InvestmentLandingPage';
import InvestmentCoveragePage from '../features/investment/InvestmentCoveragePage';
import CompanyAssessmentPage from '../features/investment/CompanyAssessmentPage';
import CandidateAssessmentPage from '../features/investment/CandidateAssessmentPage';
import { Collaboration } from '../features/collaboration/Collaboration';
import { Settings } from '../features/settings/Settings';
import { DhanConnectionStatus } from '../features/dhan/DhanConnectionStatus';
import { DhanQuotes } from '../features/dhan/DhanQuotes';
import { DhanHistorical } from '../features/dhan/DhanHistorical';
import { SectorIntelligence } from '../features/sector/SectorIntelligence';
import { ReportsWorkspace } from '../features/reports/ReportsWorkspace';
import { ReportDetail } from '../features/reports/ReportDetail';

function FeaturePlaceholder({ surface }: { surface: string }) {
  return <FeatureNotImplemented surface={surface} />;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/executive" replace />} />
        <Route path="/executive" element={<ExecutiveDashboard />} />
        <Route path="/portfolio" element={<PortfolioWorkspace />} />
        <Route path="/portfolio/*" element={<PortfolioWorkspace />} />
        <Route path="/broker-holdings" element={<BrokerHoldingsPreview />} />
        <Route path="/user-portfolios" element={<UserPortfolioList />} />
        {/* Local single-user personal path (Program Authority, 2026-11-08): durable manual
            portfolio editor. Distinct from the certified read-only user-portfolios views. */}
        <Route path="/personal-portfolio" element={<PersonalPortfolio />} />
        <Route path="/user-portfolios/import" element={<BrokerImportSurface />} />
        <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
        <Route path="/watchlists" element={<Watchlists />} />
        {/* IID-1 — investment identity coverage (read-only; identity resolution is server-side). */}
        <Route path={ROUTES.identityCoverage} element={<InvestmentCoveragePage />} />
        {/* IID-3 — persisted company assessment (GET-only; the server owns persistence). */}
        <Route path={ROUTES.companyAssessment} element={<CompanyAssessmentPage />} />
        {/* IID WI-1 (P1) — the concrete Investment Intelligence landing surface naming IID-01/02/03. */}
        <Route path={ROUTES.investmentIntelligence} element={<InvestmentLandingPage />} />
        {/* IID-6 — coverage at its authoritative path, and the candidate flow (no portfolio required). */}
        <Route path={ROUTES.investmentCoverage} element={<InvestmentCoveragePage />} />
        <Route path={ROUTES.candidateAssessment} element={<CandidateAssessmentPage />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/settings" element={<Settings />} />
        <Route path={ROUTES.dhanConnectionStatus} element={<DhanConnectionStatus />} />
        <Route path={ROUTES.dhanQuotes} element={<DhanQuotes />} />
        <Route path={ROUTES.dhanHistorical} element={<DhanHistorical />} />
        <Route path="/research" element={<FeaturePlaceholder surface="Research" />} />
        <Route path="/research/company/:id" element={<CompanyIntelligence />} />
        <Route path="/research/sector/:id" element={<SectorIntelligence />} />
        <Route path="/research/cross-sector" element={<CrossSectorIntelligence />} />
        <Route path="/research/macro" element={<MacroResearch />} />
        <Route path="/research/engines" element={<EngineRegistry />} />
        <Route path="/screener" element={<Screener />} />
        <Route path="/intelligence/decision-matrix" element={<DecisionMatrix />} />
        <Route path="/ai-advisory" element={<AiAdvisory />} />
        <Route path="/intelligence/opportunities" element={<IntelligenceOpportunities />} />
        <Route path="/intelligence/risks" element={<IntelligenceRisks />} />
        <Route path="/intelligence/rankings" element={<IntelligenceRankings />} />
        <Route path="/intelligence/*" element={<FeaturePlaceholder surface="Intelligence" />} />
        <Route path="/evidence" element={<EvidenceLanding />} />
        <Route path="/evidence/snapshots" element={<FeaturePlaceholder surface="Evidence Snapshots" />} />
        <Route path="/evidence/replay" element={<FeaturePlaceholder surface="Evidence Replay" />} />
        <Route path="/evidence/replay/:id" element={<ReplayExplorer />} />
        <Route path="/evidence/:id" element={<EvidenceExplorer />} />
        <Route path="/reports" element={<ReportsWorkspace />} />
        <Route path="/reports/:reportId" element={<ReportDetail />} />
        <Route path="*" element={<FeaturePlaceholder surface="Unknown route" />} />
      </Route>
    </Routes>
  );
}
