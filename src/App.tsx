// // src/App.tsx
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ToastProvider } from './contexts/ToastContext';
// import { useAuthStore } from './stores/authStore';
// import { Loader2 } from 'lucide-react';

// // --- Layouts & Routes ---
// import HeaderRibbon from './components/layout/HeaderRibbon';
// import MainNavbar from './components/layout/MainNavbar';
// import Footer from './components/layout/Footer';
// import { ProtectedRoute } from './components/auth/ProtectedRoute';
// import { PartnerRoute } from './components/auth/PartnerRoute';
// import { PartnerLayout } from './components/partner/PartnerLayout'; 
// import { PartnerProfileLayout } from './components/partner/PartnerProfileLayout';

// // --- Pages ---
// import HomePage from './pages/HomePage';
// import MyAccountPage from './pages/MyAccountPage';
// import PartnerSignUpPage from './components/partner/PartnerSignUp';
// import PartnerDashboardPage from './components/partner/PartnerDashboard';
// import NotFoundPage from './pages/NotFoundPage';

// // --- NEWLY CREATED PAGES ---
// import { PartnerLeadDetailPage } from './components/partner/PartnerLeadDetailPage';
// import { PartnerWalletPage } from './components/partner/PartnerWalletPage';
// import { PartnerKycPage } from './components/partner/profile/PartnerKycPage';
// import { PartnerDocumentsPage } from './components/partner/profile/PartnerDocumentsPage';
// import { PartnerBankPage } from './components/partner/profile/PartnerBankPage';
// import { PartnerAreaPage } from './components/partner/profile/PartnerAreaPage';
// // (other page imports)
// import BlogPage from './pages/BlogPage';
// import BlogDetailPage from './pages/BlogDetailPage';
// import FAQPage from './pages/FAQPage';
// import AboutPage from './pages/AboutPage';
// import ContactPage from './pages/ContactUsPage';
// import CareerPage from './pages/CareerPage';
// import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
// import TermsPage from './pages/TermsAndConditionsPage';
// import RefundPolicyPage from './pages/RefundPolicyPage';
// import CookiesPolicyPage from './pages/CookiesPolicyPage';
// import { PartnerLeadsPage } from './components/partner/PartnerLeadPage';
// import { PartnerProfilePage } from './components/partner/profile/PartneProfilePage';
// import Leads from './pages/Leads';
// import { ErrorBoundary } from './components/common/ErrorBoundary';

// const queryClient = new QueryClient();

// const AppRoutes: React.FC = () => {
//   const { initAuth, isLoading } = useAuthStore();
//   useEffect(() => { initAuth(); }, [initAuth]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-brand-gray-light">
//         <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* --- Public Routes --- */}
//       <Route path="/" element={<HomePage />} />
//       <Route path="/partner-signup" element={<PartnerSignUpPage />} />
//       <Route path="/blog" element={<BlogPage />} />
//       <Route path="/blog/:id" element={<BlogDetailPage />} />
//       <Route path="/faq" element={<FAQPage />} />
//       <Route path="/about" element={<AboutPage />} />
//       <Route path="/contact" element={<ContactPage />} />
//       <Route path="/career" element={<CareerPage />} />
//       <Route path="/privacy" element={<PrivacyPolicyPage />} />
//       <Route path="/terms" element={<TermsPage />} />
//       <Route path="/refund-policy" element={<RefundPolicyPage />} />
//       <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
//       <Route path="/terms-of-use" element={<TermsPage />} />
      
//       {/* Changed from PartnerRoute to a regular route */}
//       <Route path="/partner/leads" element={
//         <ErrorBoundary>
//           <Leads />
//         </ErrorBoundary>
//       } />
      
//       {/* --- Consumer Protected Route --- */}
//       <Route
//         path="/my-account"
//         element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>}
//       />

//       {/* --- NEW PARTNER LAYOUT ROUTES --- */}
//       <Route 
//         path="/partner"
//         element={<PartnerRoute><PartnerLayout /></PartnerRoute>}
//       >
//         <Route index element={<Navigate to="dashboard" replace />} />
//         <Route path="dashboard" element={<PartnerDashboardPage />} />
        
//         {/* Fixes 404: /partner/leads now renders this */}
//         <Route path="leads/:tab" element={<PartnerLeadsPage />} /> 
        
//         <Route path="lead/:id" element={<PartnerLeadDetailPage />} />
//         <Route path="wallet" element={<PartnerWalletPage />} />
//       </Route>
      
//       {/* --- Nested Partner Profile Routes --- */}
//       <Route 
//         path="/partner/profile" 
//         element={<PartnerRoute><PartnerProfileLayout /></PartnerRoute>}
//       >
//         <Route index element={<Navigate to="details" replace />} />
//         <Route path="details" element={<PartnerProfilePage />} />
//         <Route path="kyc" element={<PartnerKycPage />} />
//         <Route path="documents" element={<PartnerDocumentsPage />} />
//         <Route path="bank" element={<PartnerBankPage />} />
//         <Route path="areas" element={<PartnerAreaPage />} />
//       </Route>
      
//       <Route path="*" element={<NotFoundPage />} />
//     </Routes>
//   );
// };

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ToastProvider>
//         <Router>
//           <div className="flex flex-col min-h-screen">
//             <HeaderRibbon />
//             <MainNavbar />
//             <AppRoutes />
//             <Footer />
//           </div>
//         </Router>
//       </ToastProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;








// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './contexts/ToastContext';
import { useAuthStore } from './stores/authStore';
import { Loader2 } from 'lucide-react';

// --- Layouts & Routes ---
import HeaderRibbon from './components/layout/HeaderRibbon';
import MainNavbar from './components/layout/MainNavbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PartnerRoute } from './components/auth/PartnerRoute';
import { PartnerLayout } from './components/partner/PartnerLayout'; 
import { PartnerProfileLayout } from './components/partner/PartnerProfileLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// --- Public Pages ---
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactUsPage';
import CareerPage from './pages/CareerPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsAndConditionsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import NotFoundPage from './pages/NotFoundPage';

// --- Consumer Pages ---
import MyAccountPage from './pages/MyAccountPage';

// --- Partner Pages ---
import PartnerSignUpPage from './components/partner/PartnerSignUp';
import PartnerDashboardPage from './components/partner/PartnerDashboard'; // OLD DASHBOARD
import { PartnerLeadsPage } from './components/partner/PartnerLeadPage';
import { PartnerLeadDetailPage } from './components/partner/PartnerLeadDetailPage';
import { PartnerWalletPage } from './components/partner/PartnerWalletPage';

// --- Partner Profile Pages ---
import { PartnerProfilePage } from './components/partner/profile/PartneProfilePage';
import { PartnerKycPage } from './components/partner/profile/PartnerKycPage';
import { PartnerDocumentsPage } from './components/partner/profile/PartnerDocumentsPage';
import { PartnerBankPage } from './components/partner/profile/PartnerBankPage';
import { PartnerAreaPage } from './components/partner/profile/PartnerAreaPage';

// --- NEW: Catalog Pages & New Dashboard ---
import DashboardPage from './pages/partner/DashboardPage'; // NEW DASHBOARD
import CategoriesPage from './pages/partner/catalog/CategoriesPage';
import BrandsPage from './pages/partner/catalog/BrandsPage';
import ModelsPage from './pages/partner/catalog/ModelsPage';
import LeadsPage from './pages/partner/catalog/LeadsPage';
import LeadDetailPage from './pages/partner/catalog/LeadDetailPage';

// QueryClient with catalog caching settings
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
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/career" element={<CareerPage />} />
      
      {/* Legal Pages */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/terms-of-use" element={<TermsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/cookies-policy" element={<CookiesPolicyPage />} />

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
        <Route path="dashboard" element={<PartnerDashboardPage />} /> {/* OLD */}
        <Route path="dashboard-new" element={<DashboardPage />} /> {/* NEW */}
        
        {/* My Leads */}
        <Route path="leads/:tab" element={<PartnerLeadsPage />} /> 
        <Route path="lead/:id" element={<PartnerLeadDetailPage />} />
        
        {/* Wallet */}
        <Route path="wallet" element={<PartnerWalletPage />} />
        
        {/* Catalog - Browse New Leads */}
        <Route path="catalog" element={<CategoriesPage />} />
        <Route path="catalog/categories/:categoryId/brands" element={<BrandsPage />} />
        <Route path="catalog/brands/:brandId/models" element={<ModelsPage />} />
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
            <HeaderRibbon />
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