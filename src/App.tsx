import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Market from "./pages/Market";
import Apply from "./pages/Apply";
import Disbursement from "./pages/Disbursement";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Applications from "./pages/admin/Applications";
import Payments from "./pages/admin/Payments";
import Disbursements from "./pages/admin/Disbursements";
import Distributors from "./pages/admin/Distributors";
import Analytics from "./pages/admin/Analytics";
import RiskCompliance from "./pages/admin/RiskCompliance";
import UserManagement from "./pages/admin/UserManagement";
import Settings from "./pages/admin/Settings";
import Customers from "./pages/admin/Customers";
import DocumentVerification from "./pages/admin/DocumentVerification";
import Founders from "./pages/admin/Founders";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import VisitorTracker from "./components/VisitorTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/market" element={<Market />} />
            <Route path="/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
            <Route path="/disbursement" element={<ProtectedRoute><Disbursement /></ProtectedRoute>} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="applications" element={<Applications />} />
              <Route path="documents" element={<DocumentVerification />} />
              <Route path="disbursements" element={<Disbursements />} />
              <Route path="payments" element={<Payments />} />
              <Route path="distributors" element={<Distributors />} />
              <Route path="customers" element={<Customers />} />
              <Route path="founders" element={<Founders />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="risk" element={<RiskCompliance />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAInstallPrompt />
          <VisitorTracker />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
