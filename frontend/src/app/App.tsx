/**
 * Program v3.0 — Phase 3: Application entry (routing).
 *
 * Routes render the AppShell + a placeholder for each feature surface (not yet authorized).
 * Presentation-only; no business logic. Feature placeholders are static (later phases replace
 * them with real workspaces).
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { NotYetAuthorized } from '../components/shell/ShellStates';
import { ExecutiveDashboard } from '../features/executive/ExecutiveDashboard';
import { PortfolioWorkspace } from '../features/portfolio/PortfolioWorkspace';
import { CompanyIntelligence } from '../features/company/CompanyIntelligence';
import { CrossSectorIntelligence } from '../features/cross-sector/CrossSectorIntelligence';
import { DecisionMatrix } from '../features/decision-matrix/DecisionMatrix';
import { EvidenceLanding } from '../features/evidence/EvidenceLanding';
import { EvidenceExplorer } from '../features/evidence/EvidenceExplorer';
import { ReplayExplorer } from '../features/replay/ReplayExplorer';
import { EngineRegistry } from '../features/engines/EngineRegistry';
import { Administration } from '../features/admin/Administration';
import { Watchlists } from '../features/watchlists/Watchlists';
import { Collaboration } from '../features/collaboration/Collaboration';
import { Settings } from '../features/settings/Settings';

function FeaturePlaceholder({ surface }: { surface: string }) {
  return <NotYetAuthorized surface={surface} />;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/executive" replace />} />
        <Route path="/executive" element={<ExecutiveDashboard />} />
        <Route path="/portfolio" element={<PortfolioWorkspace />} />
        <Route path="/portfolio/*" element={<PortfolioWorkspace />} />
        <Route path="/watchlists" element={<Watchlists />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/research" element={<FeaturePlaceholder surface="Research" />} />
        <Route path="/research/company/:id" element={<CompanyIntelligence />} />
        <Route path="/research/sector/:id" element={<FeaturePlaceholder surface="Sector" />} />
        <Route path="/research/cross-sector" element={<CrossSectorIntelligence />} />
        <Route path="/research/engines" element={<EngineRegistry />} />
        <Route path="/intelligence/decision-matrix" element={<DecisionMatrix />} />
        <Route path="/intelligence/*" element={<FeaturePlaceholder surface="Intelligence" />} />
        <Route path="/evidence" element={<EvidenceLanding />} />
        <Route path="/evidence/snapshots" element={<NotYetAuthorized surface="Evidence Snapshots" />} />
        <Route path="/evidence/replay" element={<NotYetAuthorized surface="Evidence Replay" />} />
        <Route path="/evidence/replay/:id" element={<ReplayExplorer />} />
        <Route path="/evidence/:id" element={<EvidenceExplorer />} />
        <Route path="/admin/*" element={<Administration />} />
        <Route path="*" element={<FeaturePlaceholder surface="Unknown route" />} />
      </Route>
    </Routes>
  );
}
