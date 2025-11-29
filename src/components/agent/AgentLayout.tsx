// src/components/agent/AgentLayout.tsx
// Main layout for Agent-facing application with sidebar navigation

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  // MapPin,
  // CheckCircle,
  Bell,
  // ChevronDown,
  ToggleLeft,
  ToggleRight,
  Star,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAgentProfile, useUpdateAvailability } from '../../hooks/useAgentApp';

// FlipCash Colors
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
// };

const AgentLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { data: profile, isLoading: _profileLoading } = useAgentProfile();
  const updateAvailabilityMutation = useUpdateAvailability();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleAvailability = async () => {
    if (profile) {
      try {
        await updateAvailabilityMutation.mutateAsync(!profile.is_available);
      } catch (error) {
        console.error('Failed to update availability:', error);
      }
    }
  };

  const navItems = [
    {
      path: '/agent/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/agent/leads',
      icon: ClipboardList,
      label: 'My Leads',
    },
    {
      path: '/agent/activity',
      icon: Activity,
      label: 'Activity',
    },
    {
      path: '/agent/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  // const getStatusBadge = () => {
  //   if (!profile) return null;
    
  //   if (profile.is_available) {
  //     return (
  //       <span className="px-2 py-1 bg-[#1B8A05]/20 text-[#1B8A05] text-xs font-bold rounded-full">
  //         Available
  //       </span>
  //     );
  //   }
  //   return (
  //     <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
  //       Unavailable
  //     </span>
  //   );
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1C1C1B] text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FEC925] rounded-lg flex items-center justify-center">
              <span className="text-[#1C1C1B] font-bold text-sm">FC</span>
            </div>
            <span className="font-bold">FlipCash Agent</span>
          </div>
          
          <button className="p-2 hover:bg-white/10 rounded-lg transition relative">
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#1C1C1B] z-50 overflow-y-auto"
            >
              <MobileSidebar
                profile={profile}
                navItems={navItems}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
                onToggleAvailability={handleToggleAvailability}
                isTogglingAvailability={updateAvailabilityMutation.isPending}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-[#1C1C1B] overflow-y-auto">
        <DesktopSidebar
          profile={profile}
          navItems={navItems}
          onLogout={handleLogout}
          onToggleAvailability={handleToggleAvailability}
          isTogglingAvailability={updateAvailabilityMutation.isPending}
          isProfileMenuOpen={isProfileMenuOpen}
          setIsProfileMenuOpen={setIsProfileMenuOpen}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Mobile Sidebar Component
interface SidebarProps {
  profile: any;
  navItems: Array<{ path: string; icon: any; label: string }>;
  onLogout: () => void;
  onToggleAvailability: () => void;
  isTogglingAvailability: boolean;
}

const MobileSidebar: React.FC<SidebarProps & { onClose: () => void }> = ({
  profile,
  navItems,
  onClose,
  onLogout,
  onToggleAvailability,
  isTogglingAvailability,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEC925] rounded-xl flex items-center justify-center">
              <span className="text-[#1C1C1B] font-bold">FC</span>
            </div>
            <div>
              <h1 className="text-white font-bold">FlipCash</h1>
              <p className="text-white/60 text-xs">Agent Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      {profile && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#FEC925]/20 rounded-full flex items-center justify-center">
              <span className="text-[#FEC925] font-bold text-lg">
                {profile.user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{profile.user?.name || 'Agent'}</p>
              <p className="text-white/60 text-sm">{profile.user?.phone}</p>
            </div>
          </div>
          
          {/* Availability Toggle */}
          <button
            onClick={onToggleAvailability}
            disabled={isTogglingAvailability}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition ${
              profile.is_available
                ? 'bg-[#1B8A05]/20 text-[#1B8A05]'
                : 'bg-white/10 text-white/60'
            }`}
          >
            <span className="font-semibold">
              {profile.is_available ? 'Available' : 'Unavailable'}
            </span>
            {profile.is_available ? (
              <ToggleRight size={24} />
            ) : (
              <ToggleLeft size={24} />
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive
                        ? 'bg-[#FEC925] text-[#1C1C1B] font-bold'
                        : 'text-white/80 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#FF0000] hover:bg-[#FF0000]/10 rounded-xl transition"
        >
          <LogOut size={20} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

// Desktop Sidebar Component
const DesktopSidebar: React.FC<
  SidebarProps & {
    isProfileMenuOpen: boolean;
    setIsProfileMenuOpen: (open: boolean) => void;
  }
> = ({
  profile,
  navItems,
  onLogout,
  onToggleAvailability,
  isTogglingAvailability,
  // isProfileMenuOpen,
  // setIsProfileMenuOpen,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FEC925] rounded-xl flex items-center justify-center">
            <span className="text-[#1C1C1B] font-bold text-xl">FC</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">FlipCash</h1>
            <p className="text-white/60 text-sm">Agent Portal</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="p-4 border-b border-white/10">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-[#FEC925]/20 rounded-full flex items-center justify-center">
                <span className="text-[#FEC925] font-bold text-xl">
                  {profile.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{profile.user?.name || 'Agent'}</p>
                <p className="text-white/60 text-sm">{profile.employee_code || 'No ID'}</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white/5 p-2 rounded-lg text-center">
                <p className="text-[#FEC925] font-bold">{profile.total_leads_completed || 0}</p>
                <p className="text-white/60 text-xs">Completed</p>
              </div>
              <div className="bg-white/5 p-2 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} className="text-[#FEC925]" fill="#FEC925" />
                  <span className="text-[#FEC925] font-bold">
                    {profile.average_rating ? parseFloat(profile.average_rating).toFixed(1) : '-'}
                  </span>
                </div>
                <p className="text-white/60 text-xs">Rating</p>
              </div>
            </div>

            {/* Availability Toggle */}
            <button
              onClick={onToggleAvailability}
              disabled={isTogglingAvailability}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition ${
                profile.is_available
                  ? 'bg-[#1B8A05]/20 text-[#1B8A05]'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              <span className="font-semibold text-sm">
                {profile.is_available ? 'Available' : 'Unavailable'}
              </span>
              {profile.is_available ? (
                <ToggleRight size={22} />
              ) : (
                <ToggleLeft size={22} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive
                        ? 'bg-[#FEC925] text-[#1C1C1B] font-bold'
                        : 'text-white/80 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-white/40 text-xs text-center mb-3">
          Partner: {profile?.partner_name || '-'}
        </p>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#FF0000] hover:bg-[#FF0000]/10 rounded-xl transition font-semibold"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AgentLayout;