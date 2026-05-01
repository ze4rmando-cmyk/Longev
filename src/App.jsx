import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientForm from './pages/PatientForm';
import PatientDetail from './pages/PatientDetail';
import TestSelection from './pages/TestSelection';
import TestApplication from './pages/TestApplication';
import Reports from './pages/Reports';
import Assessments from './pages/Assessments';
import MedicalRecord from './pages/MedicalRecord';
import CustomReport from './pages/CustomReport';
import DrugInfo from './pages/DrugInfo';
import CarePlan from './pages/CarePlan';
import Appointments from './pages/Appointments';
import FamilyReport from './pages/FamilyReport';
import Vitals from './pages/Vitals';
import PatientTimeline from './pages/PatientTimeline';
import TeamChat from './pages/TeamChat';
import PatientPortal from './pages/PatientPortal';
import PortalManager from './pages/PortalManager';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/portal" element={<PatientPortal />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/new" element={<PatientForm />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/tests/select" element={<TestSelection />} />
        <Route path="/tests/apply" element={<TestApplication />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/vitals" element={<Vitals />} />
        <Route path="/vitals" element={<Vitals />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/custom" element={<CustomReport />} />
        <Route path="/patients/:id/record" element={<MedicalRecord />} />
        <Route path="/drugs" element={<DrugInfo />} />
        <Route path="/patients/:id/care-plan" element={<CarePlan />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/reports/family" element={<FamilyReport />} />
        <Route path="/patients/:id/timeline" element={<PatientTimeline />} />
        <Route path="/team-chat" element={<TeamChat />} />
        <Route path="/portal-manager" element={<PortalManager />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App