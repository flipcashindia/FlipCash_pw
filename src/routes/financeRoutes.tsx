// // src/routes/financeRoutes.tsx
// // Add these routes to your main router configuration

// import { type RouteObject } from 'react-router-dom';

// // Partner Pages
// import PartnerWalletPage from '../pages/partner/PartnerWalletPage';
// import PartnerAddMoneyPage from '../pages/partner/PartnerAddMoneyPage';
// import PartnerPaymentCallbackPage from '../pages/partner/PartnerPaymentCallbackPage';
// import PartnerPaymentHistoryPage from '../pages/partner/PartnerPaymentHistoryPage';


// // =============================================================================
// // PARTNER ROUTES (Partner Portal - partner.flipcash.in)
// // =============================================================================
// export const partnerFinanceRoutes: RouteObject[] = [
//   {
//     path: '/wallet',
//     element: <PartnerWalletPage />,
//   },
//   {
//     path: '/wallet/add-money',
//     element: <PartnerAddMoneyPage />,
//   },
//   {
//     path: '/wallet/payment-success',
//     element: <PartnerPaymentCallbackPage />,
//   },
//   {
//     path: '/wallet/payments',
//     element: <PartnerPaymentHistoryPage />,
//   },
// ];

// =============================================================================
// USAGE EXAMPLE
// =============================================================================
/*
// In your main App.tsx or router configuration:

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { consumerFinanceRoutes, partnerFinanceRoutes, adminFinanceRoutes } from './routes/financeRoutes';

// For Consumer App (flipcash.in)
const consumerRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // ... other routes
      ...consumerFinanceRoutes,
    ],
  },
]);

// For Partner App (partner.flipcash.in)
const partnerRouter = createBrowserRouter([
  {
    path: '/',
    element: <PartnerLayout />,
    children: [
      // ... other routes
      ...partnerFinanceRoutes,
    ],
  },
]);

// For Admin App (flipcadmin.flipcash.in)
const adminRouter = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      // ... other routes
      ...adminFinanceRoutes,
    ],
  },
]);

function App() {
  return <RouterProvider router={consumerRouter} />;
}
*/



// import React from 'react';
import { Route } from 'react-router-dom';

// Partner Finance Pages
import PartnerWalletPage from '../pages/partner/PartnerWalletPage';
import PartnerAddMoneyPage from '../pages/partner/PartnerAddMoneyPage';
import PartnerPaymentCallbackPage from '../pages/partner/PartnerPaymentCallbackPage';
import PartnerPaymentHistoryPage from '../pages/partner/PartnerPaymentHistoryPage';

// =============================================================================
// PARTNER FINANCE ROUTES (To be spread inside partner Route children)
// =============================================================================
// Usage: Inside your /partner route, add: {partnerFinanceRoutes}

export const partnerFinanceRoutes = (
  <>
    {/* Wallet Main Page */}
    <Route path="wallet" element={<PartnerWalletPage />} />
    
    {/* Add Money / Top-up */}
    <Route path="wallet/add-money" element={<PartnerAddMoneyPage />} />
    
    {/* Payment Success Callback */}
    <Route path="wallet/payment-success" element={<PartnerPaymentCallbackPage />} />
    
    {/* Payment History */}
    <Route path="wallet/payments" element={<PartnerPaymentHistoryPage />} />
  </>
);
