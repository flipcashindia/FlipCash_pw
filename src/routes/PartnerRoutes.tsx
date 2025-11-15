// src/routes/PartnerRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PartnerLayout from '../layouts/PartnerLayout';
import CategoriesPage from '../pages/partner/catalog/CategoriesPage';
import BrandsPage from '../pages/partner/catalog/BrandsPage';
import ModelsPage from '../pages/partner/catalog/ModelsPage';
import LeadsPage from '../pages/partner/catalog/LeadsPage';
import LeadDetailPage from '../pages/partner/catalog/LeadDetailPage';
import DashboardPage from '../pages/partner/DashboardPage';

const PartnerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/partner" element={<PartnerLayout />}>
        <Route index element={<Navigate to="/partner/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Catalog Flow */}
        <Route path="catalog" element={<CategoriesPage />} />
        <Route path="catalog/categories/:categoryId/brands" element={<BrandsPage />} />
        <Route path="catalog/brands/:brandId/models" element={<ModelsPage />} />
        <Route path="catalog/models/:modelId/leads" element={<LeadsPage />} />
        <Route path="catalog/leads/:leadId" element={<LeadDetailPage />} />
        
        {/* Other routes (to be implemented) */}
        <Route path="my-leads" element={<div>My Leads Page</div>} />
        <Route path="wallet" element={<div>Wallet Page</div>} />
        <Route path="profile" element={<div>Profile Page</div>} />
      </Route>
    </Routes>
  );
};

export default PartnerRoutes;