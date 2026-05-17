import { OfflineSyncProvider } from '@/components/OfflineSyncProvider'
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
import DashboardLayout from '@/components/layout/DashboardLayout'
import Index from './pages/Index'
import Students from './pages/Students'
import StudentProfile from './pages/StudentProfile'
import SchoolSupportForm from './pages/student/SchoolSupportForm'
import SchoolSupport from './pages/SchoolSupport'
import CreateSchoolSupportForm from './pages/CreateSchoolSupportForm'
import MonthlyProgressCheck from './pages/student/MonthlyProgressCheck'
import GenerateGoalSheet from './pages/student/GenerateGoalSheet'
import Screenings from './pages/Screenings'
import Reports from './pages/Reports'
import SchoolWideReports from './pages/SchoolWideReports'
import SchoolWideHearingReports from './pages/SchoolWideHearingReports'
import SpeechReports from './pages/SpeechReports'
import HearingReports from './pages/HearingReports'
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
import Rescreening from './pages/Rescreening'
import HearingScreening from './pages/HearingScreening'
import HearingScreenings from './pages/HearingScreenings'
import EditScreening from './pages/EditScreening'
import EditHearingScreening from './pages/EditHearingScreening'
import Drafts from './pages/Drafts'
import Logout from './components/auth/Logout'
import MonthlyMeetings from './pages/monthly-meetings/MonthlyMeetings'
import CreateMonthlyMeeting from './pages/monthly-meetings/CreateMonthlyMeeting'
import EditMonthlyMeeting from './pages/monthly-meetings/EditMonthlyMeeting'
import Caseload from './pages/Caseload'
import GoalSheets from './pages/GoalSheets'
import SchoolWideGoalSheets from './pages/SchoolWideGoalSheets'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
          <OfflineSyncProvider>
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

                {/* Redirect /reports to /speech-screening-reports */}
                <Route
                  path='/reports'
                  element={<Navigate to='/speech-screening-reports' replace />}
                />

                {/* Protected Routes - All share the DashboardLayout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                  <Route
                    path='/'
                    element={
                      <SchoolRouter>
                        <Index />
                      </SchoolRouter>
                    }
                  />

                  {/* School-based routes */}
                  <Route
                    path='/school/:schoolId'
                    element={
                      <SchoolRouter>
                        <Index />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/students'
                    element={
                      <SchoolRouter>
                        <Students />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/students/:studentId'
                    element={
                      <SchoolRouter>
                        <StudentProfile />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/students/:studentId/progress-check'
                    element={
                      <SchoolRouter>
                        <MonthlyProgressCheck />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/students/:studentId/goal-sheet'
                    element={
                      <SchoolRouter>
                        <GenerateGoalSheet />
                      </SchoolRouter>
                    }
                  />

                  {/* Screening Routes */}
                  <Route
                    path='/screenings'
                    element={
                      <SchoolRouter>
                        <Screenings />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/screening/speech'
                    element={
                      <SchoolRouter>
                        <SpeechScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/screening/rescreening'
                    element={
                      <SchoolRouter>
                        <Rescreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/screening/rescreening/:studentId'
                    element={
                      <SchoolRouter>
                        <Rescreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/screenings/hearing'
                    element={
                      <SchoolRouter>
                        <HearingScreenings />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/screening/hearing'
                    element={
                      <SchoolRouter>
                        <HearingScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/edit-screening/:screeningId'
                    element={
                      <SchoolRouter>
                        <EditScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/edit-hearing-screening/:screeningId'
                    element={
                      <SchoolRouter>
                        <EditHearingScreening />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/school/:schoolId/screenings'
                    element={
                      <SchoolRouter>
                        <Screenings />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/screening/speech'
                    element={
                      <SchoolRouter>
                        <SpeechScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/screening/speech/:studentId'
                    element={
                      <SchoolRouter>
                        <SpeechScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/screening/rescreening'
                    element={
                      <SchoolRouter>
                        <Rescreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/screening/rescreening/:studentId'
                    element={
                      <SchoolRouter>
                        <Rescreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/screenings/hearing'
                    element={
                      <SchoolRouter>
                        <HearingScreenings />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/screening/hearing'
                    element={
                      <SchoolRouter>
                        <HearingScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/screening/hearing/:studentId'
                    element={
                      <SchoolRouter>
                        <HearingScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/edit-screening/:screeningId'
                    element={
                      <SchoolRouter>
                        <EditScreening />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/edit-hearing-screening/:screeningId'
                    element={
                      <SchoolRouter>
                        <EditHearingScreening />
                      </SchoolRouter>
                    }
                  />

                  {/* Students */}
                  <Route
                    path='/students'
                    element={
                      <SchoolRouter>
                        <Students />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/students/:studentId'
                    element={
                      <SchoolRouter>
                        <StudentProfile />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/students/:studentId/progress-check'
                    element={
                      <SchoolRouter>
                        <MonthlyProgressCheck />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/students/:studentId/goal-sheet'
                    element={
                      <SchoolRouter>
                        <GenerateGoalSheet />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/caseload'
                    element={
                      <SchoolRouter>
                        <Caseload />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/school/:schoolId/caseload'
                    element={
                      <SchoolRouter>
                        <Caseload />
                      </SchoolRouter>
                    }
                  />

                  {/* Reports */}
                  <Route
                    path='/speech-screening-reports'
                    element={
                      <SchoolRouter>
                        <Reports />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/speech-screening-reports/school-wide-speech'
                    element={
                      <SchoolRouter>
                        <SchoolWideReports />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/speech-screening-reports/school-wide-hearing'
                    element={
                      <SchoolRouter>
                        <SchoolWideHearingReports />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/speech-screening-reports/speech'
                    element={
                      <SchoolRouter>
                        <SpeechReports />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/speech-screening-reports/hearing'
                    element={
                      <SchoolRouter>
                        <HearingReports />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/school/:schoolId/speech-screening-reports'
                    element={
                      <SchoolRouter>
                        <Reports />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/speech-screening-reports/school-wide-speech'
                    element={
                      <SchoolRouter>
                        <SchoolWideReports />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/speech-screening-reports/goal-sheets'
                    element={
                      <SchoolRouter>
                        <GoalSheets />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/speech-screening-reports/goal-sheets'
                    element={
                      <SchoolRouter>
                        <GoalSheets />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/speech-screening-reports/school-wide-goal-sheets'
                    element={
                      <SchoolRouter>
                        <SchoolWideGoalSheets />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/speech-screening-reports/school-wide-goal-sheets'
                    element={
                      <SchoolRouter>
                        <SchoolWideGoalSheets />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/school/:schoolId/speech-screening-reports/school-wide-hearing'
                    element={
                      <SchoolRouter>
                        <SchoolWideHearingReports />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/speech-screening-reports/speech'
                    element={
                      <SchoolRouter>
                        <SpeechReports />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/speech-screening-reports/hearing'
                    element={
                      <SchoolRouter>
                        <HearingReports />
                      </SchoolRouter>
                    }
                  />

                  {/* Monthly Meetings */}
                  <Route
                    path='/monthly-meetings'
                    element={
                      <SchoolRouter>
                        <MonthlyMeetings />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/monthly-meetings/create'
                    element={
                      <SchoolRouter>
                        <CreateMonthlyMeeting />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/monthly-meetings/edit/:meetingId'
                    element={
                      <SchoolRouter>
                        <EditMonthlyMeeting />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/school/:schoolId/monthly-meetings'
                    element={
                      <SchoolRouter>
                        <MonthlyMeetings />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/monthly-meetings/create'
                    element={
                      <SchoolRouter>
                        <CreateMonthlyMeeting />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/monthly-meetings/edit/:meetingId'
                    element={
                      <SchoolRouter>
                        <EditMonthlyMeeting />
                      </SchoolRouter>
                    }
                  />

                  {/* Drafts */}
                  <Route
                    path='/school/:schoolId/drafts'
                    element={
                      <SchoolRouter>
                        <Drafts />
                      </SchoolRouter>
                    }
                  />

                  {/* School Support */}
                  <Route
                    path='/school-support'
                    element={
                      <SchoolRouter>
                        <SchoolSupport />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school-support/create'
                    element={
                      <SchoolRouter>
                        <CreateSchoolSupportForm />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/school-support'
                    element={
                      <SchoolRouter>
                        <SchoolSupport />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/school-support/create'
                    element={
                      <SchoolRouter>
                        <CreateSchoolSupportForm />
                      </SchoolRouter>
                    }
                  />

                  {/* Management, Profile, Notifications */}
                  <Route
                    path='/management'
                    element={
                      <SchoolRouter>
                        <Management />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/profile'
                    element={
                      <SchoolRouter>
                        <Profile />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/notifications'
                    element={
                      <SchoolRouter>
                        <Notifications />
                      </SchoolRouter>
                    }
                  />

                  <Route
                    path='/school/:schoolId/management'
                    element={
                      <SchoolRouter>
                        <Management />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/profile'
                    element={
                      <SchoolRouter>
                        <Profile />
                      </SchoolRouter>
                    }
                  />
                  <Route
                    path='/school/:schoolId/notifications'
                    element={
                      <SchoolRouter>
                        <Notifications />
                      </SchoolRouter>
                    }
                  />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path='*' element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </OfflineSyncProvider>
        </OrganizationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
