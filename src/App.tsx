
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { OrganizationProvider, useOrganization } from "@/contexts/OrganizationContext";
import AuthForm from "@/components/auth/AuthForm";
import Index from "./pages/Index";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Reports from "./pages/Reports";
import Management from "./pages/Management";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
          <BottomNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OrganizationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <ProtectedLayout>
                  <Index />
                </ProtectedLayout>
              } />
              <Route path="/students" element={
                <ProtectedLayout>
                  <Students />
                </ProtectedLayout>
              } />
              <Route path="/students/:id" element={
                <ProtectedLayout>
                  <StudentDetail />
                </ProtectedLayout>
              } />
              <Route path="/reports" element={
                <ProtectedLayout>
                  <Reports />
                </ProtectedLayout>
              } />
              <Route path="/management" element={
                <ProtectedLayout>
                  <Management />
                </ProtectedLayout>
              } />
              <Route path="/users" element={
                <ProtectedLayout>
                  <Users />
                </ProtectedLayout>
              } />
              <Route path="/profile" element={
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              } />
              <Route path="/admin" element={
                <ProtectedLayout>
                  <AdminPanel />
                </ProtectedLayout>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </OrganizationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
