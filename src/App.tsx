import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLayout } from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Estimator from "./pages/Estimator";
import Estimates from "./pages/Estimates";
import EstimateDetail from "./pages/EstimateDetail";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
// Public pages
import Features from "./pages/Features";
import PublicPricing from "./pages/PublicPricing";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Integrations from "./pages/Integrations";
import ApiPage from "./pages/ApiPage";
import Documentation from "./pages/Documentation";
import HelpCenter from "./pages/HelpCenter";
import Community from "./pages/Community";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public marketing pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/plans" element={<PublicPricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/security" element={<Security />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/api" element={<ApiPage />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/community" element={<Community />} />
              
              {/* Auth pages */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/estimator" element={<Estimator />} />
                <Route path="/estimates" element={<Estimates />} />
                <Route path="/estimates/:id" element={<EstimateDetail />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
