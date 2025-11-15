import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, AlertTriangle as AlertTriangleIcon, X,
  LayoutDashboard, ListOrdered, Wallet, MapPin, User, 
  MessageSquare, AlertTriangle, Star, LogOut 
} from 'lucide-react';
// Imports for AccountHeader and AccountSideNav are no longer needed

// --- Types ---

// This type is now defined directly in this file
export type MenuTab = 
  'Dashboard' | 'My Orders' | 'My Wallet' | 'Addresses' | 'Account Details' | 
  'Helpdesk' | 'Raise Dispute' | 'Feedback';

// --- Props ---
interface RaiseDisputePageProps {
  onNavClick: (tab: MenuTab) => void;
  onBreadcrumbClick: (path: string) => void;
  onLogout: () => void;
}

// ==================================================================
// --- START INLINED COMPONENT: AccountHeader ---
// ==================================================================
interface Breadcrumb {
  name: string;
  href: string;
}

interface AccountHeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  onBreadcrumbClick: (path: string) => void;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ title, breadcrumbs, onBreadcrumbClick }) => {
  return (
    <div 
      className="py-16 md:py-20" 
      style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
    >
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <div className="flex justify-center items-center text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.name}>
              {index > 0 && <span className="mx-2">»</span>}
              {crumb.href ? (
                <button 
                  onClick={() => onBreadcrumbClick(crumb.href)}
                  className="hover:text-red-600 transition-colors"
                >
                  {crumb.name}
                </button>
              ) : (
                <span>{crumb.name}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
// ==================================================================
// --- END INLINED COMPONENT: AccountHeader ---
// ==================================================================


// ==================================================================
// --- START INLINED COMPONENT: AccountSideNav ---
// ==================================================================
const menuItems: { name: MenuTab, icon: React.ElementType }[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'My Orders', icon: ListOrdered },
  { name: 'My Wallet', icon: Wallet },
  { name: 'Addresses', icon: MapPin },
  { name: 'Account Details', icon: User },
  { name: 'Helpdesk', icon: MessageSquare },
  { name: 'Raise Dispute', icon: AlertTriangle },
  { name: 'Feedback', icon: Star },
];

interface AccountSideNavProps {
  activeTab: MenuTab;
  onTabClick: (tab: MenuTab) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  item: { name: MenuTab | 'Log Out', icon: React.ElementType },
  isActive: boolean,
  onClick: () => void
}> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 text-left text-sm font-semibold 
                transition-all duration-200
                ${isActive
                  ? 'bg-pink-50 text-red-600 border-r-4 border-red-600'
                  : 'text-gray-700 hover:bg-gray-100'
                }
                ${item.name === 'Log Out' ? 'mt-4 text-red-600 hover:bg-red-50' : ''}`}
  >
    <item.icon size={20} />
    <span>{item.name}</span>
  </button>
);

const AccountSideNav: React.FC<AccountSideNavProps> = ({ activeTab, onTabClick, onLogout }) => {
  return (
    <aside className="lg:w-1/4">
      <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <nav className="py-4">
          {menuItems.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={activeTab === item.name}
              onClick={() => onTabClick(item.name)}
            />
          ))}
          <NavItem
            item={{ name: 'Log Out', icon: LogOut }}
            isActive={false}
            onClick={onLogout}
          />
        </nav>
      </div>
    </aside>
  );
};
// ==================================================================
// --- END INLINED COMPONENT: AccountSideNav ---
// ==================================================================


// --- Reusable Form Input ---
const FormInput: React.FC<{
  label: string, 
  id: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ label, id, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
      required
    />
  </div>
);

// --- Reusable Textarea ---
const FormTextarea: React.FC<{
  label: string,
  id: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}> = ({ label, id, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      rows={5}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
      required
    />
  </div>
);

// --- Form Response Alert ---
const FormAlert: React.FC<{
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}> = ({ type, title, message, onClose }) => {
  const Icon = type === 'success' ? CheckCircle : AlertTriangleIcon;
  const colors = type === 'success' 
    ? 'bg-green-50 border-green-300 text-green-800'
    : 'bg-red-50 border-red-300 text-red-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`relative border ${colors} p-4 rounded-lg`}
    >
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        aria-label="Close"
      >
        <X size={18} />
      </button>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon size={20} className="mt-0.5" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};


// --- Main RaiseDisputePage Component ---
const RaiseDisputePage: React.FC<RaiseDisputePageProps> = ({ onNavClick, onBreadcrumbClick, onLogout }) => {
  const [formData, setFormData] = useState({
    orderId: '',
    reason: '',
    message: '',
  });
  const [formResponse, setFormResponse] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Submitting dispute:", formData);
    
    // Show success message
    setFormResponse({
      type: 'success',
      title: 'Dispute Filed Successfully!',
      message: `Your dispute for Order ID #${formData.orderId} has been filed. We will review your case and respond within 48 hours.`
    });
    
    // Clear form
    setFormData({ orderId: '', reason: '', message: '' });
  };

  return (
    <section className="bg-white">
      <AccountHeader 
        title="Raise Dispute"
        breadcrumbs={[
          { name: 'Home', href: 'home' },
          { name: 'Account', href: 'account' },
          { name: 'Raise Dispute', href: '' }
        ]}
        onBreadcrumbClick={onBreadcrumbClick}
      />
      
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <AccountSideNav activeTab="Raise Dispute" onTabClick={onNavClick} onLogout={onLogout} />

          <main className="lg:w-3/Vci/4 w-full">
            <div className="bg-white p-6 md:p-8 border rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                File a Dispute
              </h2>
              <p className="text-gray-600 mb-8">
                If you have an issue with an order that you couldn't resolve, please let us know.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <AnimatePresence>
                  {formResponse && (
                    <FormAlert 
                      {...formResponse} 
                      onClose={() => setFormResponse(null)} 
                    />
                  )}
                </AnimatePresence>

                <FormInput 
                  label="Order ID"
                  id="orderId"
                  value={formData.orderId}
                  onChange={handleChange}
                />
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    Reason for Dispute <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    required
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="item_not_received">Item Not Received</option>
                    <option value="item_not_as_described">Item Not as Described</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="return_issue">Return/Refund Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <FormTextarea 
                  label="Please provide details about your dispute"
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                />

                <div className="pt-6">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    Submit Dispute
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default RaiseDisputePage;

