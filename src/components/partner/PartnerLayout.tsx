// src/components/partner/PartnerLayout.tsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LayoutDashboard, ListPlus, ListChecks, Wallet, User } from 'lucide-react';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { Loader2 } from 'lucide-react';

// Sidebar items from docs [cite: 17. UX & UI Guidelines]
const partnerNavItems = [
  { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
  { name: 'New Leads (Queue)', href: '/partner/leads/new', icon: ListPlus },
  { name: 'My Leads', href: '/partner/leads/my', icon: ListChecks },
  { name: 'My Wallet', href: '/partner/wallet', icon: Wallet },
  { name: 'My Profile', href: '/partner/profile', icon: User },
];

export const PartnerLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { partner, isLoading } = usePartnerStore();

  if (isLoading || !partner) {
    return (
     <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-brand-gray-light">
       <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
     </div>
   );
 }

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
                <p className="text-sm text-gray-500">{partner.business_name}</p>
              </div>
              <nav className="flex flex-col space-y-2 p-2">
                {partnerNavItems.map((item) => (
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
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};