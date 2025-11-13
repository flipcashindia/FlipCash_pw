// src/components/partner/PartnerProfileLayout.tsx
import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { FileText, Banknote, MapPin, Shield, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { usePartnerStore } from '../../stores/usePartnerStore';

const profileNavItems = [
  // { name: 'My Profile', href: '/partner/profile/details', icon: User }, // For API 1.2
  { name: 'Identity (KYC)', href: '/partner/profile/kyc', icon: Shield }, //
  { name: 'Documents (PAN)', href: '/partner/profile/documents', icon: FileText }, //
  { name: 'Bank Accounts', href: '/partner/profile/bank', icon: Banknote }, //
  { name: 'Service Areas', href: '/partner/profile/areas', icon: MapPin }, //
];

export const PartnerProfileLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { partner } = usePartnerStore();

  return (
    <div className="min-h-[calc(100vh-160px)] bg-brand-gray-light">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          
          
          {/* --- Sidebar --- */}
          <aside className="md:col-span-3 mb-8 md:mb-0">
            <div className="sticky top-24 bg-white p-4 rounded-xl shadow-lg">
              
              <div className="text-center p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-brand-black">
                  {user?.name || 'Partner'}
                </h3>
                <p className="text-sm text-gray-500">{partner?.business_name}</p>
              </div>
              <div className="flex justify-between items-center m-3 mb-6 pb-4 border-b">
                <Link
                  to="/partner/dashboard" // Assuming this is your dashboard route
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200"
                >
                  <ArrowLeft size={18} />
                  Back to Dashboard
                </Link>
              </div>
              <nav className="flex flex-col space-y-2 p-2">
                {profileNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all
                      ${isActive 
                        ? 'bg-brand-yellow/20 text-brand-black' 
                        : 'text-gray-700 hover:bg-brand-gray-light'
                      }
                    `}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* --- Main Content Area --- */}
          <main className="md:col-span-9">
            {/* All nested routes (KycPage, BankPage, etc.) will render here */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};