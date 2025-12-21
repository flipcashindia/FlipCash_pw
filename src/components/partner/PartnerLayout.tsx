// src/components/partner/PartnerLayout.tsx
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LayoutDashboard, ListPlus, ListChecks, Wallet, User, Navigation } from 'lucide-react';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { Loader2 } from 'lucide-react';
import { agentAppService } from '../../api/services/agentAppService';

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
  
  // Check if partner can work as agent
  const [canWorkAsAgent, setCanWorkAsAgent] = useState(false);
  const [checkingAgent, setCheckingAgent] = useState(true);

  useEffect(() => {
    const checkAgentAccess = async () => {
      try {
        const profile = await agentAppService.getProfile();
        setCanWorkAsAgent(profile.employee_code === 'SELF');
      } catch {
        setCanWorkAsAgent(false);
      } finally {
        setCheckingAgent(false);
      }
    };

    if (partner && !isLoading) {
      checkAgentAccess();
    }
  }, [partner, isLoading]);

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
                
                {/* Agent Mode Link */}
                {canWorkAsAgent && !checkingAgent && (
                  <>
                    <div className="border-t border-gray-200 my-2" />
                    <Link
                      to="/agent/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all
                        bg-gradient-to-r from-[#1B8A05]/10 to-[#1B8A05]/5 text-[#1B8A05] hover:from-[#1B8A05]/20 hover:to-[#1B8A05]/10
                        border-2 border-[#1B8A05]/30"
                    >
                      <Navigation size={20} />
                      <span>Field Agent Mode</span>
                      <span className="ml-auto px-2 py-0.5 bg-[#FEC925] text-[#1C1C1B] text-xs font-bold rounded">
                        NEW
                      </span>
                    </Link>
                  </>
                )}
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