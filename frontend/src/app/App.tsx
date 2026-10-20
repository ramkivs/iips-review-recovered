/** First-party application routing; product surfaces are mounted directly without a session gate. */
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { FeatureNotImplemented } from '../components/shell/ShellStates';
import { ExecutiveDashboard } from '../features/executive/ExecutiveDashboard';
import { PortfolioWorkspace } from '../features/portfolio/PortfolioWorkspace';
import { UserPortfolioList } from '../features/user-portfolios/UserPortfolioList';
import { UserPortfolioDetail } from '../features/user-portfolios/UserPortfolioDetail';
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
import { Collaboration } from '../features/collaboration/Collaboration';
import { Settings } from '../features/settings/Settings';
import { SectorIntelligence } from '../features/sector/SectorIntelligence';

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
        <Route path="/user-portfolios" element={<UserPortfolioList />} />
        <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
        <Route path="/watchlists" element={<Watchlists />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/settings" element={<Settings />} />
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
        <Route path="*" element={<FeaturePlaceholder surface="Unknown route" />} />
      </Route>
    </Routes>
  );
}
