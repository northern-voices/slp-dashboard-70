import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { OrganizationProvider } from '@/contexts/OrganizationContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Index from './pages/Index'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
// import SchoolSupportForm from "./pages/student/SchoolSupportForm";
// import SchoolSupport from "./pages/SchoolSupport";
// import CreateSchoolSupportForm from "./pages/CreateSchoolSupportForm";
import MonthlyProgressCheck from './pages/student/MonthlyProgressCheck'
import GenerateGoalSheet from './pages/student/GenerateGoalSheet'
import Screenings from './pages/Screenings'
import Reports from './pages/Reports'
import GenerateReport from './pages/GenerateReport'
import IndividualReports from './pages/IndividualReports'
import ReportDetail from './pages/ReportDetail'
import Management from './pages/Management'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import AcceptInvitation from './pages/auth/AcceptInvitation'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'
import SpeechScreening from './pages/SpeechScreening'
import HearingScreening from './pages/HearingScreening'
import Drafts from './pages/Drafts'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrganizationProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path='/auth/login' element={<Login />} />
              <Route path='/auth/signup' element={<Signup />} />
              <Route path='/auth/forgot-password' element={<ForgotPassword />} />
              <Route path='/auth/reset-password/' element={<ResetPassword />} />
              <Route path='/auth/verify-email' element={<VerifyEmail />} />
              <Route path='/auth/verify-email/:token' element={<VerifyEmail />} />
              <Route path='/auth/verify-email/pending' element={<VerifyEmail />} />
              <Route path='/invite/:token' element={<AcceptInvitation />} />

              {/* Onboarding Route */}
              <Route path='/onboarding' element={<Onboarding />} />

              {/* Protected Routes */}
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students'
                element={
                  <ProtectedRoute>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students/:studentId'
                element={
                  <ProtectedRoute>
                    <StudentDetail />
                  </ProtectedRoute>
                }
              />
              {/* <Route path="/students/:studentId/school-support" element={<SchoolSupportForm />} /> */}
              <Route
                path='/students/:studentId/progress-check'
                element={
                  <ProtectedRoute>
                    <MonthlyProgressCheck />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students/:studentId/goal-sheet'
                element={
                  <ProtectedRoute>
                    <GenerateGoalSheet />
                  </ProtectedRoute>
                }
              />

              {/* Screening Routes */}
              <Route
                path='/screenings'
                element={
                  <ProtectedRoute>
                    <Screenings />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/screening/speech'
                element={
                  <ProtectedRoute>
                    <SpeechScreening />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/screening/speech/:studentId'
                element={
                  <ProtectedRoute>
                    <SpeechScreening />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/screening/hearing'
                element={
                  <ProtectedRoute>
                    <HearingScreening />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/screening/hearing/:studentId'
                element={
                  <ProtectedRoute>
                    <HearingScreening />
                  </ProtectedRoute>
                }
              />

              {/* Drafts Route */}
              <Route
                path='/drafts'
                element={
                  <ProtectedRoute>
                    <Drafts />
                  </ProtectedRoute>
                }
              />

              {/* <Route path="/school-support" element={<SchoolSupport />} />
              <Route path="/school-support/create" element={<CreateSchoolSupportForm />} /> */}
              <Route
                path='/reports'
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/reports/generate'
                element={
                  <ProtectedRoute>
                    <GenerateReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/reports/individual'
                element={
                  <ProtectedRoute>
                    <IndividualReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/reports/:reportId'
                element={
                  <ProtectedRoute>
                    <ReportDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/management'
                element={
                  <ProtectedRoute>
                    <Management />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/notifications'
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrganizationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
