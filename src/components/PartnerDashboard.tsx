import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListPlus,
  ListChecks,
  Wallet,
  User,
  LifeBuoy,
  AlertTriangle,
  Star,
  LogOut,
  Menu,
  X,
  Smartphone, // Icon for slider
  Laptop, // Icon for slider
  Watch,  // Icon for slider
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import all our flow and tab components
import NewLeadsFlow from "./NewLeadsFlow";
import MyLeadsFlow from "./MyLeadsFlow";
import MyWalletFlow from "./MyWalletFlow";
import AccountDetails from "./AccountDetails";
import Helpdesk from "./Helpdesk";
import RaiseDispute from "./RaiseDispute";
import Feedback from "./Feedback";

// imgs 
import PhoneImg from "../assets/Category/phone.png";
import LaptopImg from "../assets/Category/Laptop.png";
import WatchImg from "../assets/Category/Watch.png";

// --- Mock Data ---
const mockPartner = {
  name: "Rohan",
  email: "rohan@example.com",
  mobile: "9876543210",
};

// --- Types ---
type PartnerTab =
  | "dashboard"
  | "new-leads"
  | "my-leads"
  | "wallet"
  | "account-details"
  | "helpdesk"
  | "dispute"
  | "feedback";

// --- Menu Items (No Change) ---
const menuItems = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "new-leads", name: "New Leads", icon: ListPlus },
  { id: "my-leads", name: "My Leads", icon: ListChecks },
  { id: "wallet", name: "My Wallet", icon: Wallet },
  { id: "account-details", name: "Account Details", icon: User },
  { id: "helpdesk", name: "Helpdesk", icon: LifeBuoy },
  { id: "dispute", name: "Raise Dispute", icon: AlertTriangle },
  { id: "feedback", name: "Feedback", icon: Star },
] as const;

// --- [NEW] Dashboard Category Slider Data ---
const dashboardCategories = [
  { name: "Mobile", icon: Smartphone, image: PhoneImg },
  { name: "Laptop", icon: Laptop, image: LaptopImg },
  { name: "Smart Watch", icon: Watch, image: WatchImg },
];

// --- [NEW] Dashboard Category Card ---
const DashboardCategoryCard: React.FC<{
  category: typeof dashboardCategories[0];
  onClick: () => void;
}> = ({ category, onClick }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 w-36 scroll-snap-align-start group focus:outline-none"
  >
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg border border-gray-100 h-full transition-all duration-300 hover:shadow-xl hover:border-teal-300">
      <img
        src={category.image}
        alt={category.name}
        className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 text-center">
        {category.name}
      </h3>
    </div>
  </button>
);

// --- [NEW] Dashboard Category Slider ---
const DashboardCategorySlider: React.FC<{
  onCategorySelect: (category: string) => void;
}> = ({ onCategorySelect }) => {
  return (
    <div className="py-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Category Based Leads
      </h3>
      <div className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2">
        {dashboardCategories.map((category) => (
          <DashboardCategoryCard
            key={category.name}
            category={category}
            onClick={() => onCategorySelect(category.name)}
          />
        ))}
      </div>
    </div>
  );
};


// --- Sidebar Component (No Change) ---
const PartnerSidebar: React.FC<{
  activeTab: PartnerTab;
  setActiveTab: (tab: PartnerTab) => void;
  onLogout: () => void;
}> = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border-r border-gray-200">
      <div className="sticky top-[0px] p-4">
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                // --- [LOGIC CHANGE] ---
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-red-50 text-red-600 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-100"
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

// --- Mobile Menu Drawer Component (No Change) ---
const MobileMenuDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeTab: PartnerTab;
  setActiveTab: (tab: PartnerTab) => void;
  onLogout: () => void;
}> = ({ isOpen, onClose, activeTab, setActiveTab, onLogout }) => {
  const handleTabClick = (tab: PartnerTab) => {
    // --- [LOGIC CHANGE] ---
    setActiveTab(tab);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-xl p-6 overflow-y-auto lg:hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Partner Menu</span>
              <button onClick={onClose} aria-label="Close menu">
                <X size={24} className="text-gray-700" />
              </button>
            </div>
            <nav className="flex flex-col space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              <hr className="my-4" />
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Mobile Header for Dashboard (No Change) ---
const MobileDashboardHeader: React.FC<{
  onOpenMenu: () => void;
  title: string;
}> = ({ onOpenMenu, title }) => (
  <header className="sticky top-[0px] z-30 lg:hidden bg-white shadow-sm p-4 flex items-center space-x-4">
    <button onClick={onOpenMenu} aria-label="Open menu">
      <Menu size={24} className="text-gray-800" />
    </button>
    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
  </header>
);

// --- Dashboard Home Content (UPDATED) ---
interface DashboardHomeProps {
  onNavigate: (tab: PartnerTab) => void;
  onCategorySelect: (category: string) => void; // <-- NEW PROP
}
const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, onCategorySelect }) => {
  const newLeadsCount = 2;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hello, {mockPartner.name}!
        </h1>
        <p className="mt-1 text-gray-600">
          Welcome to your dashboard. From here, you can manage your orders,
          wallet, addresses, and account details.
        </p>
      </div>
      
      {/* --- [NEW] RENDER THE CATEGORY SLIDER --- */}
      <DashboardCategorySlider onCategorySelect={onCategorySelect} />

      {/* --- Quick Action Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate("new-leads")}
          className="relative w-full text-left bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <ListPlus size={24} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                New Leads
              </h3>
              <p className="text-gray-500 text-sm">
                Check available leads in your area
              </p>
            </div>
          </div>
          {newLeadsCount > 0 && (
            <div className="absolute top-4 right-4 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {newLeadsCount}
            </div>
          )}
        </button>

        <button
          onClick={() => onNavigate("wallet")}
          className="w-full text-left bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <Wallet size={24} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                My Wallet
              </h3>
              <p className="text-gray-500 text-sm">
                Check your balance and transactions
              </p>
            </div>
          </div>
        </button>
      </div>
      
      {/* --- Other Dashboard Content (No Change) --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Welcome to your Dashboard
        </h2>
        <p className="text-gray-600">
          This is your main dashboard content. Select other tabs to see
          different information.
        </p>
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold">Service Area</h3>
          <p className="text-sm text-gray-500 mb-2">
            Change your active service pincode.
          </p>
          <select className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <option value="110001">110001</option>
            <option value="110002">110002</option>
            <option value="122001">122001</option>
          </select>
        </div>
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold">Recent Leads</h3>
          <p className="text-gray-500">No recent leads found.</p>
        </div>
      </div>
    </div>
  );
};

// --- Main PartnerDashboard Component (Refactored) ---
const PartnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PartnerTab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // --- [NEW STATE] ---
  // This holds the filter when clicking from the dashboard
  const [initialFilter, setInitialFilter] = useState<string | null>(null);

  const handleLogout = () => {
    console.log("Partner logging out...");
    navigate("/");
  };

  // --- [NEW HANDLER] ---
  // For clicking a category on the dashboard
  const handleCategorySelect = (category: string) => {
    setInitialFilter(category); // Set the filter
    setActiveTab("new-leads");  // Switch to the "New Leads" tab
  };
  
  // --- [NEW HANDLER] ---
  // For clicking a tab in the sidebar/drawer. This CLEARS the filter.
  const handleTabClick = (tab: PartnerTab) => {
    setInitialFilter(null); // Clear any initial filter
    setActiveTab(tab);
  };

  // --- Content Renderer (Fully Updated) ---
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome onNavigate={handleTabClick} onCategorySelect={handleCategorySelect} />;
      case "new-leads":
        return <NewLeadsFlow onSwitchTab={handleTabClick} initialCategoryFilter={initialFilter} />;
      case "my-leads":
        return <MyLeadsFlow onSwitchTab={handleTabClick} />;
      case "wallet":
        return <MyWalletFlow />;
      case "account-details":
        return <AccountDetails />;
      case "helpdesk":
        return <Helpdesk />;
      case "dispute":
        return <RaiseDispute />;
      case "feedback":
        return <Feedback />;
      default:
        return <DashboardHome onNavigate={handleTabClick} onCategorySelect={handleCategorySelect} />;
    }
  };

  // Helper to get the current tab's name (No Change)
  const getTabName = () => {
    return menuItems.find((item) => item.id === activeTab)?.name || "Dashboard";
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      {/* Desktop Sidebar */}
      <PartnerSidebar
        activeTab={activeTab}
        setActiveTab={handleTabClick} // <-- Use new handler
        onLogout={handleLogout}
      />
      {/* Mobile Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={handleTabClick} // <-- Use new handler
        onLogout={handleLogout}
      />
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <MobileDashboardHeader
          title={getTabName()}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboard;