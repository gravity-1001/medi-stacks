import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { StacksProvider } from '@/contexts/StacksContext'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import Onboarding from '@/pages/Onboarding'
import PatientOnboarding from '@/pages/onboarding/PatientOnboarding'
import PatientDashboard from '@/pages/PatientDashboard'
import DoctorDashboard from '@/pages/DoctorDashboard'
import ResearcherDashboard from '@/pages/ResearcherDashboard'
import RoleHome from '@/pages/RoleHome'
import RequireRoles from '@/components/RequireRoles'
import AdminRoles from '@/pages/AdminRoles'
import AdminPanel from '@/pages/AdminPanel'
import Records from '@/pages/Records'
import AccessRequests from '@/pages/AccessRequests'
import Research from '@/pages/Research'
import Emergency from '@/pages/Emergency'
import Settings from '@/pages/Settings'
import ConsentPolicies from '@/pages/ConsentPolicies'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'

function App() {
  return (
    <StacksProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/patient" element={<PatientOnboarding />} />
            <Route path="/onboarding/doctor" element={<DoctorDashboard />} />
            <Route path="/onboarding/researcher" element={<ResearcherDashboard />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<RoleHome />} />
              <Route path="patient" element={<PatientDashboard />} />
              <Route path="doctor" element={<DoctorDashboard />} />
              <Route path="researcher" element={<ResearcherDashboard />} />
              <Route path="records" element={<Records />} />
              <Route path="access-requests" element={<AccessRequests />} />
              <Route path="research" element={<Research />} />
              <Route path="emergency" element={<Emergency />} />
              <Route element={<RequireRoles allowed={["admin"]} />}>
                <Route path="admin-roles" element={<AdminRoles />} />
                <Route path="admin-panel" element={<AdminPanel />} />
              </Route>
              <Route path="consent-policies" element={<ConsentPolicies />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </StacksProvider>
  )
}

export default App
