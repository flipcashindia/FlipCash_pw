// src/App.tsx
// Updated with Agent App Routes for Field Agents

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './contexts/ToastContext';
import { useAuthStore } from './stores/authStore';
import { Loader2 } from 'lucide-react';

// --- Layouts & Routes ---
import MainNavbar from './components/layout/MainNavbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PartnerRoute } from './components/auth/PartnerRoute';
import { AgentRoute } from './routes/AgentRoute'; // NEW: Agent Route Guard
import { PartnerLayout } from './components/partner/PartnerLayout'; 
import { PartnerProfileLayout } from './components/partner/PartnerProfileLayout';
import AgentLayout from './components/agent/AgentLayout'; // NEW: Agent Layout
import { ErrorBoundary } from './components/common/ErrorBoundary';

// --- Public Pages ---
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ContactUsPage from './pages/ContactUsPage copy';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQPage';
import TermsOfUse from './pages/TermsOfUse';
import CookiePolicy from './pages/CookiePolicy';
import Career from './pages/CareerPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutUs from './pages/AboutSection';

// --- Consumer Pages ---
import MyAccountPage from './pages/MyAccountPage';

// --- Partner Pages ---
import PartnerSignUpPage from './components/partner/PartnerSignUp';
import PartnerDashboardPage from './components/partner/PartnerDashboard';
import { PartnerLeadsPage } from './components/partner/PartnerLeadPage';
import { PartnerLeadDetailPage } from './components/partner/PartnerLeadDetailPage';

// --- Partner Profile Pages ---
import { PartnerProfilePage } from './components/partner/profile/PartneProfilePage';
import { PartnerKycPage } from './components/partner/profile/PartnerKycPage';
import { PartnerDocumentsPage } from './components/partner/profile/PartnerDocumentsPage';
import { PartnerBankPage } from './components/partner/profile/PartnerBankPage';
import { PartnerAreaPage } from './components/partner/profile/PartnerAreaPage';

// --- Catalog Pages & Partner Dashboard ---
// import DashboardPage from './pages/partner/DashboardPage';
import CategoriesPage from './pages/partner/catalog/CategoriesPage';
import BrandsPage from './pages/partner/catalog/BrandsPage';
import ModelsPage from './pages/partner/catalog/ModelsPage';
import LeadsPage from './pages/partner/catalog/LeadsPage';
import LeadDetailPage from './pages/partner/catalog/LeadDetailPage';

// --- Route Configurations ---
import { partnerFinanceRoutes } from './routes/financeRoutes';
import { agentAppRoutes } from './routes/agentAppRoutes'; // NEW: Agent App Routes

// --- Partner: Agent Management Page ---
import AgentsPage from './pages/partner/AgentsPage';


// QueryClient with caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const AppRoutes: React.FC = () => {
  const { initAuth, isLoading } = useAuthStore();
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-brand-gray-light">
        <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ============================= */}
      {/* PUBLIC ROUTES */}
      {/* ============================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/partner-signup" element={<PartnerSignUpPage />} />
      
      {/* Blog */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<BlogDetailPage />} />
      
      {/* Help & Info Pages */}
      <Route path="/faq" element={<FAQ />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/career" element={<Career />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      
      {/* ============================= */}
      {/* CONSUMER PROTECTED ROUTES */}
      {/* ============================= */}
      <Route
        path="/my-account"
        element={
          <ProtectedRoute>
            <MyAccountPage />
          </ProtectedRoute>
        }
      />

      {/* ============================= */}
      {/* PARTNER PROTECTED ROUTES */}
      {/* For users with role='partner' */}
      {/* ============================= */}
      <Route 
        path="/partner"
        element={
          <PartnerRoute>
            <PartnerLayout />
          </PartnerRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Dashboards */}
        <Route path="dashboard" element={<PartnerDashboardPage />} />
        {/* <Route path="dashboard" element={<DashboardPage />} /> */}
        <Route 
          path="agent-mode" 
          element={<Navigate to="/agent/dashboard" replace />} 
        />
        
        {/* My Leads */}
        <Route path="leads/:tab" element={<PartnerLeadsPage />} /> 
        <Route path="lead/:leadId" element={<PartnerLeadDetailPage />} />
        
        {/* Finance Routes (Wallet, Transactions, etc.) */}
        {partnerFinanceRoutes}
        
        {/* Agent Management - For Partners to manage their agents */}
        <Route path="agents" element={<AgentsPage />} />

        {/* Catalog - Browse New Leads */}
        <Route path="catalog" element={<CategoriesPage />} />
        <Route path="catalog/categories/:categoryId/brands" element={<BrandsPage />} />
        <Route path="catalog/categories/:categoryId/brands/:brandId/models" element={<ModelsPage />} />
        <Route path="catalog/models/:modelId/leads" element={<LeadsPage />} />
        <Route path="catalog/leads/:leadId" element={<LeadDetailPage />} />
      </Route>
      
      {/* Partner Profile - Nested Routes */}
      <Route 
        path="/partner/profile" 
        element={
          <PartnerRoute>
            <PartnerProfileLayout />
          </PartnerRoute>
        }
      >
        <Route index element={<Navigate to="details" replace />} />
        <Route path="details" element={<PartnerProfilePage />} />
        <Route path="kyc" element={<PartnerKycPage />} />
        <Route path="documents" element={<PartnerDocumentsPage />} />
        <Route path="bank" element={<PartnerBankPage />} />
        <Route path="areas" element={<PartnerAreaPage />} />
      </Route>

      {/* ============================= */}
      {/* AGENT APP ROUTES */}
      {/* For users with role='agent' */}
      {/* ============================= */}
      <Route 
        path="/agent"
        element={
          <AgentRoute>
            <AgentLayout />
          </AgentRoute>
        }
      >
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Agent App Routes:
            - /agent/dashboard - Agent Dashboard with stats
            - /agent/leads - List of assigned leads
            - /agent/lead/:assignmentId - Lead workflow (accept, journey, check-in, verify, inspect, complete)
            - /agent/activity - Activity history and completed leads
            - /agent/profile - Agent profile and availability
        */}
        {agentAppRoutes}
      </Route>

      {/* ============================= */}
      {/* 404 NOT FOUND */}
      {/* ============================= */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <MainNavbar />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;