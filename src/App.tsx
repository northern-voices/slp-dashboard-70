import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { OrganizationProvider } from '@/contexts/OrganizationContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicRoute from '@/components/auth/PublicRoute'
import SchoolRouter from '@/components/SchoolRouter'
import Index from './pages/Index'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import SchoolSupportForm from './pages/student/SchoolSupportForm'
import SchoolSupport from './pages/SchoolSupport'
import CreateSchoolSupportForm from './pages/CreateSchoolSupportForm'
import MonthlyProgressCheck from './pages/student/MonthlyProgressCheck'
import GenerateGoalSheet from './pages/student/GenerateGoalSheet'
import Screenings from './pages/Screenings'
import Reports from './pages/Reports'
import ClassWideReports from './pages/ClassWideReports'
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
import Logout from './components/auth/Logout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents refetch on tab focus
      refetchOnMount: true, // Allow refetch on component mount (needed for invalidation to work)
      refetchOnReconnect: false, // Prevents refetch on network reconnect
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache data for 10 minutes
    },
  },
})

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
              <Route
                path='/auth/login'
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path='/auth/signup'
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path='/auth/forgot-password'
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path='/auth/reset-password/'
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />
              <Route
                path='/auth/verify-email'
                element={
                  <PublicRoute>
                    <VerifyEmail />
                  </PublicRoute>
                }
              />
              <Route
                path='/auth/verify-email/:token'
                element={
                  <PublicRoute>
                    <VerifyEmail />
                  </PublicRoute>
                }
              />
              <Route
                path='/auth/verify-email/pending'
                element={
                  <PublicRoute>
                    <VerifyEmail />
                  </PublicRoute>
                }
              />
              <Route
                path='/invite/:token'
                element={
                  <PublicRoute>
                    <AcceptInvitation />
                  </PublicRoute>
                }
              />

              {/* Onboarding Route */}
              <Route path='/onboarding' element={<Onboarding />} />

              {/* Logout Route */}
              <Route path='/logout' element={<Logout />} />

              {/* Redirect Routes - Auto-redirect to current school */}
              <Route
                path='/screenings'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Screenings />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/screening/speech'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <SpeechScreening />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/screening/hearing'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <HearingScreening />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Students />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students/:studentId'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <StudentDetail />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students/:studentId/progress-check'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <MonthlyProgressCheck />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students/:studentId/goal-sheet'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <GenerateGoalSheet />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              {/* Redirect /reports to /speech-screening-reports for consistency */}
              <Route
                path='/reports'
                element={<Navigate to='/speech-screening-reports' replace />}
              />
              <Route
                path='/speech-screening-reports'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Reports />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/speech-screening-reports/class-wide'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <ClassWideReports />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/speech-screening-reports/individual'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <IndividualReports />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/speech-screening-reports/:reportId'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <ReportDetail />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/management'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Management />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Profile />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/notifications'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Notifications />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - All wrapped under school selection */}
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Index />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />

              {/* School-based routes */}
              <Route
                path='/school/:schoolId'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Index />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/students'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Students />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/students/:studentId'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <StudentDetail />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/students/:studentId/progress-check'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <MonthlyProgressCheck />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/students/:studentId/goal-sheet'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <GenerateGoalSheet />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />

              {/* Screening Routes */}
              <Route
                path='/school/:schoolId/screenings'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Screenings />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/screening/speech'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <SpeechScreening />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/screening/speech/:studentId'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <SpeechScreening />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/screening/hearing'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <HearingScreening />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/screening/hearing/:studentId'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <HearingScreening />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />

              {/* Drafts Route */}
              <Route
                path='/school/:schoolId/drafts'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Drafts />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />

              <Route
                path='/school/:schoolId/speech-screening-reports'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Reports />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/speech-screening-reports/class-wide'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <ClassWideReports />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/speech-screening-reports/individual'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <IndividualReports />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/speech-screening-reports/:reportId'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <ReportDetail />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/management'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Management />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/profile'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Profile />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/notifications'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <Notifications />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />

              {/* School Support Routes */}
              <Route
                path='/school-support'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <SchoolSupport />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school-support/create'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <CreateSchoolSupportForm />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/school-support'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <SchoolSupport />
                    </SchoolRouter>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/school/:schoolId/school-support/create'
                element={
                  <ProtectedRoute>
                    <SchoolRouter>
                      <CreateSchoolSupportForm />
                    </SchoolRouter>
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
