import React from 'react';
import { LayoutDashboard, ListPlus, ListChecks, Wallet, User, LifeBuoy, AlertTriangle, Star, LogOut } from 'lucide-react';

type PartnerTab = 'dashboard' | 'new-leads' | 'my-leads' | 'wallet' | 'account-details' | 'helpdesk' | 'dispute' | 'feedback';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-leads', name: 'New Leads', icon: ListPlus },
  { id: 'my-leads', name: 'My Leads', icon: ListChecks },
  { id: 'wallet', name: 'My Wallet', icon: Wallet },
  { id: 'account-details', name: 'Account Details', icon: User },
  { id: 'helpdesk', name: 'Helpdesk', icon: LifeBuoy },
  { id: 'dispute', name: 'Raise Dispute', icon: AlertTriangle },
  { id: 'feedback', name: 'Feedback', icon: Star },
] as const;

interface PartnerSidebarProps {
  activeTab: PartnerTab;
  setActiveTab: (tab: PartnerTab) => void;
  onLogout: () => void;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border-r border-gray-200">
      <div className="sticky top-[0px] p-4">
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
          <hr className="my-4" />
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default PartnerSidebar;