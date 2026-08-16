/**
 * Program v3.0 — Phase 3: Application entry (routing).
 *
 * Routes render the AppShell + a workspace for each feature surface.
 * Presentation-only; no business logic.
 *
 * Phase 13-Hardening (C): route-level code splitting via React.lazy — the initial
 * bundle carries the shell only; each workspace loads on first navigation.
 */
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { NotYetAuthorized } from '../components/shell/ShellStates';
import { LoadingState } from '../components/state/StateComponents';

const ExecutiveDashboard = lazy(() => import('../features/executive/ExecutiveDashboard').then((m) => ({ default: m.ExecutiveDashboard })));
const PortfolioWorkspace = lazy(() => import('../features/portfolio/PortfolioWorkspace').then((m) => ({ default: m.PortfolioWorkspace })));
const CompanyIntelligence = lazy(() => import('../features/company/CompanyIntelligence').then((m) => ({ default: m.CompanyIntelligence })));
const CrossSectorIntelligence = lazy(() => import('../features/cross-sector/CrossSectorIntelligence').then((m) => ({ default: m.CrossSectorIntelligence })));
const DecisionMatrix = lazy(() => import('../features/decision-matrix/DecisionMatrix').then((m) => ({ default: m.DecisionMatrix })));
const EvidenceExplorer = lazy(() => import('../features/evidence/EvidenceExplorer').then((m) => ({ default: m.EvidenceExplorer })));
const ReplayExplorer = lazy(() => import('../features/replay/ReplayExplorer').then((m) => ({ default: m.ReplayExplorer })));
const Administration = lazy(() => import('../features/admin/Administration').then((m) => ({ default: m.Administration })));

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

function FeaturePlaceholder({ surface }: { surface: string }) {
  return <NotYetAuthorized surface={surface} />;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/executive" replace />} />
        <Route path="/executive" element={<Lazy><ExecutiveDashboard /></Lazy>} />
        <Route path="/portfolio" element={<Lazy><PortfolioWorkspace /></Lazy>} />
        <Route path="/portfolio/*" element={<Lazy><PortfolioWorkspace /></Lazy>} />
        <Route path="/research" element={<FeaturePlaceholder surface="Research" />} />
        <Route path="/research/company/:id" element={<Lazy><CompanyIntelligence /></Lazy>} />
        <Route path="/research/sector/:id" element={<FeaturePlaceholder surface="Sector" />} />
        <Route path="/research/cross-sector" element={<Lazy><CrossSectorIntelligence /></Lazy>} />
        <Route path="/intelligence/decision-matrix" element={<Lazy><DecisionMatrix /></Lazy>} />
        <Route path="/intelligence/*" element={<FeaturePlaceholder surface="Intelligence" />} />
        <Route path="/evidence" element={<FeaturePlaceholder surface="Evidence" />} />
        <Route path="/evidence/:id" element={<Lazy><EvidenceExplorer /></Lazy>} />
        <Route path="/evidence/replay/:id" element={<Lazy><ReplayExplorer /></Lazy>} />
        <Route path="/admin/*" element={<Lazy><Administration /></Lazy>} />
        <Route path="*" element={<FeaturePlaceholder surface="Unknown route" />} />
      </Route>
    </Routes>
  );
}
