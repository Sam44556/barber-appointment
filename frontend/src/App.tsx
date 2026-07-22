import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import AuthGuard from "@/components/layout/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ConnectionTest } from "@/components/ConnectionTest";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Book from "./pages/Book";
import BookingConfirmation from "./pages/BookingConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFoundPage from "./pages/NotFoundPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAppointments from "./pages/admin/Appointments";
import AdminServices from "./pages/admin/Services";
import AdminStaff from "./pages/admin/Staff";
import AdminSchedule from "./pages/admin/Schedule";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";

// Barber Pages
import BarberDashboard from "./pages/barber/Dashboard";

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app startup
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/book" element={<Book />} />
                <Route path="/booking/confirmation/:id" element={<BookingConfirmation />} />
              </Route>
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Admin Routes */}
              <Route element={<AuthGuard allowedRoles={['ADMIN']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/appointments" element={<AdminAppointments />} />
                  <Route path="/admin/services" element={<AdminServices />} />
                  <Route path="/admin/staff" element={<AdminStaff />} />
                  <Route path="/admin/schedule" element={<AdminSchedule />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>
              </Route>
              
              {/* Barber Routes */}
              <Route element={<AuthGuard allowedRoles={['BARBER']} />}>
                <Route path="/barber/dashboard" element={<BarberDashboard />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
        
        {/* Connection Test Component - Remove this after testing */}
        <ConnectionTest />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
