import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ProgrammeDashboard from './pages/dashboards/ProgrammeDashboard';
import SectorDashboard from './pages/dashboards/SectorDashboard';
import EntityDashboard from './pages/dashboards/EntityDashboard';
import Programmes from './pages/Programmes';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Indicators from './pages/Indicators';
import DataCollection from './pages/DataCollection';
import SubmissionDetail from './pages/SubmissionDetail';
import Benchmarking from './pages/Benchmarking';
import Training from './pages/Training';
import GisMap from './pages/GisMap';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import Forecasting from './pages/Forecasting';
import MisticoForecasting from './pages/forecasting/MisticoForecasting';
import RiskRegister from './pages/RiskRegister';
import HealthOverview from './pages/HealthOverview';
import Governance from './pages/Governance';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import PlaceholderPage from './pages/PlaceholderPage';
import CommercialImports from './pages/commercial/CommercialImports';
import CommercialReview from './pages/commercial/CommercialReview';
import ConsignmentList from './pages/commercial/ConsignmentList';
import ShipmentDetail from './pages/commercial/ShipmentDetail';
import CommercialTrends from './pages/commercial/CommercialTrends';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard/programme" element={<ProgrammeDashboard />} />
            <Route path="/dashboard/sector" element={<SectorDashboard />} />
            <Route path="/dashboard/entity" element={<EntityDashboard />} />
            <Route path="/programmes" element={<Programmes />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/indicators" element={<Indicators />} />
            <Route path="/data-collection" element={<DataCollection />} />
            <Route path="/data-collection/:id" element={<SubmissionDetail />} />
            <Route path="/benchmarking" element={<Benchmarking />} />
            <Route path="/training" element={<Training />} />
            <Route path="/gis-map" element={<GisMap />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/forecasting/mistico" element={<MisticoForecasting />} />
            <Route path="/risk-register" element={<RiskRegister />} />
            <Route path="/health" element={<HealthOverview />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/users" element={<Users />} />
            <Route path="/commercial/imports" element={<CommercialImports />} />
            <Route path="/commercial/imports/:id" element={<CommercialReview />} />
            <Route path="/commercial/consignments" element={<ConsignmentList />} />
            <Route path="/commercial/shipments/:id" element={<ShipmentDetail />} />
            <Route path="/commercial/trends" element={<CommercialTrends />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="Platform configuration and preferences" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
