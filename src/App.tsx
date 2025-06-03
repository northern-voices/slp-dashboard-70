
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import SchoolSupportForm from "./pages/student/SchoolSupportForm";
import SchoolSupport from "./pages/SchoolSupport";
import CreateSchoolSupportForm from "./pages/CreateSchoolSupportForm";
import MonthlyProgressCheck from "./pages/student/MonthlyProgressCheck";
import GenerateGoalSheet from "./pages/student/GenerateGoalSheet";
import Reports from "./pages/Reports";
import Management from "./pages/Management";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/invite/:token" element={<AcceptInvitation />} />
            
            {/* Onboarding Route */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:studentId" element={<StudentDetail />} />
            <Route path="/students/:studentId/school-support" element={<SchoolSupportForm />} />
            <Route path="/students/:studentId/progress-check" element={<MonthlyProgressCheck />} />
            <Route path="/students/:studentId/goal-sheet" element={<GenerateGoalSheet />} />
            <Route path="/school-support" element={<SchoolSupport />} />
            <Route path="/school-support/create" element={<CreateSchoolSupportForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/management" element={<Management />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
