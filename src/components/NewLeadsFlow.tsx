import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Check,
  // ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types (No Change) ---
type LeadFlowView =
  | "list"
  | "preview"
  | "confirm"
  | "success"
  | "detail";

type PartnerTab =
  | "dashboard"
  | "new-leads"
  | "my-leads"
  | "wallet"
  | "account-details"
  | "helpdesk"
  | "dispute"
  | "feedback";

interface NewLeadsFlowProps {
  onSwitchTab: (tab: PartnerTab) => void;
  initialCategoryFilter: string | null;
}
// imgs 
import PhoneImg from "../assets/Category/phone.png";
import LaptopImg from "../assets/Category/Laptop.png";
import WatchImg from "../assets/Category/Watch.png";

// --- Mock Data (No Change) ---
const mockWatchImg = WatchImg;
const mockPhoneImg = PhoneImg;
const mockLaptopImg = LaptopImg;

const mockLeads = [
  {
    id: "fc-lead-1452",
    title: "Apple Watch Series 7",
    category: "Smart Watch",
    pincode: "110074",
    price: 13002,
    image: mockWatchImg,
    summary: "Good",
    age: "2 Years Old",
    pickupArea: "Rohini Sector 8 - 110085",
    pickupSlot: "24 Oct - 2:00 PM - 4:00 PM",
    confirmSlot: "25 Oct - 12:00 PM - 2:00 PM",
    claimFee: 8,
    comment: "more data to be vissible according to device",
    customer: {
      name: "Rakesh Sharma",
      phone: "+91-XXXXXX302",
      fullPhone: "+91 98765 43021",
      address: "House No. 43, Sector 8, Gurgaon, Haryana - 122002",
    },
  },
  {
    id: "fc-lead-1453",
    title: "iPhone 13 Pro",
    category: "Mobile",
    pincode: "122001",
    price: 55000,
    image: mockPhoneImg,
  },
  {
    id: "fc-lead-1454",
    title: "Dell XPS 15",
    category: "Laptop",
    pincode: "110074",
    price: 72000,
    image: mockLaptopImg,
  },
];

const mockFilters = {
  categories: ["Smart Watch", "Laptop", "Mobile", "Tablet"],
  brands: ["Apple", "Samsung", "Dell", "OnePlus"],
  models: ["Watch Series 7", "iPhone 13", "Galaxy S22", "XPS 15"],
};

// --- Filter Modal (No Change) ---
const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { category: string | null }) => void;
  onClear: () => void;
}> = ({ isOpen, onClose, onApply, onClear }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const handleApply = () => {
    onApply({ category: selectedCategory });
    onClose();
  };
  
  const handleClear = () => {
    setSelectedCategory(null);
    onClear();
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
            className="fixed inset-0 z-50 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-white rounded-lg shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Filters</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {mockFilters.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100" onClick={handleClear}>Clear All</button>
              <button className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800" onClick={handleApply}>Apply Filters</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Lead Card (No Change) ---
const LeadCard: React.FC<{
  lead: typeof mockLeads[0];
  onBookNow: (leadId: string) => void;
}> = ({ lead, onBookNow }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-100">
    <div className="flex items-center space-x-4">
      <img
        src={lead.image}
        alt={lead.title}
        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
      />
      <div>
        <h3 className="font-semibold text-lg text-gray-900">{lead.title}</h3>
        <p className="text-sm text-gray-500">
          {lead.category} &gt; {lead.pincode}
        </p>
      </div>
    </div>
    <div className="text-right flex-shrink-0 ml-4">
      <p className="font-bold text-lg text-gray-900">₹{lead.price.toLocaleString("en-IN")}</p>
      <button 
        onClick={() => onBookNow(lead.id)}
        className="mt-1 px-5 py-2 bg-yellow-400 text-black font-semibold rounded-lg text-sm hover:bg-yellow-500 transition-colors"
      >
        Book Now
      </button>
    </div>
  </div>
);

// --- Lead List (No Change) ---
const NewLeadsList: React.FC<{
  onBookNow: (leadId: string) => void;
  initialCategoryFilter: string | null;
}> = ({ onBookNow, initialCategoryFilter }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(initialCategoryFilter);

  useEffect(() => {
    setCategoryFilter(initialCategoryFilter);
  }, [initialCategoryFilter]);

  const filteredLeads = mockLeads.filter(lead => {
    const matchesCategory = categoryFilter ? lead.category === categoryFilter : true;
    const matchesSearch = searchQuery 
      ? lead.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.pincode.includes(searchQuery)
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => setCategoryFilter(filters.category)}
        onClear={() => setCategoryFilter(null)}
      />
      <div className="flex space-x-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search leads by name, category, pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="p-3 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {categoryFilter && (
        <div className="flex justify-between items-center p-3 bg-teal-50 border-teal-200 border rounded-lg">
          <span className="font-medium text-teal-700">
            Showing results for: <strong>{categoryFilter}</strong>
          </span>
          <button 
            onClick={() => setCategoryFilter(null)} 
            className="text-sm font-semibold text-teal-600 hover:text-teal-800"
          >
            Clear
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onBookNow={onBookNow} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <h3 className="text-xl font-semibold">No Leads Found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- [Sub-Component] Lead Preview (FIXED) ---
const LeadPreview: React.FC<{
  lead: typeof mockLeads[0];
  onClaim: () => void;
  onBack: () => void;
}> = ({ lead, onClaim, onBack }) => (
  <div className="bg-white rounded-lg shadow-xl lg:max-w-4xl lg:mx-auto border border-gray-100">
    <header className="p-4 border-b flex justify-between items-center">
      <h2 className="text-lg font-semibold">Lead Preview</h2>
      <button onClick={onBack} className="text-sm font-medium px-4 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
    </header>
    <main className="p-6 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">{lead.title}</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              Est. Price: ₹{lead.price.toLocaleString("en-IN")}
            </p>
          </div>
          <img src={lead.image} alt={lead.title} className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
        </div>
        {/* --- [FIX] --- Added fallbacks with ?? */}
        <DetailSection title="Highlights" items={[
          { label: "Device Category", value: lead.category },
          { label: "Device Summary", value: lead.summary ?? "N/A" },
          { label: "Device Age", value: lead.age ?? "N/A" },
        ]} />
        <p className="text-xs text-gray-500 italic ml-4 -mt-3">comment : {lead.comment ?? "No comment."}</p>
      </div>
      <div className="space-y-5 mt-5 lg:mt-0">
        {/* --- [FIX] --- Added fallbacks with ?? */}
        <DetailSection title="Pickup & Location Info" items={[
          { label: "Pickup Area / City / Pincode", value: lead.pickupArea ?? "N/A" },
          { label: "Pickup Slot / Preferred Time", value: lead.pickupSlot ?? "N/A" },
          { label: "View in Maps", value: "Unlock after claim" },
        ]} />
        {/* --- [FIX] --- Added optional chaining ?. and fallbacks ?? */}
        <DetailSection title="Customer Data" items={[
          { label: "Customer Name", value: "--- Hidden ---" },
          { label: "Phone Number", value: lead.customer?.phone ?? "N/A" },
        ]} />
        <p className="text-sm text-gray-500 pt-2">Customer details and address unlock after claim.</p>
        <p className="font-semibold text-green-600 text-lg">Lead Status : Available to Claim</p>
        <div className="p-3 bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200">
          A claim fee will be deducted from your wallet once you claim this lead.
          If the customer cancels before your visit, the amount will be refunded automatically.
        </div>
        <button 
          onClick={onClaim}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors"
        >
          Claim Lead
        </button>
      </div>
    </main>
  </div>
);

// --- [Sub-Component] Confirm Claim (FIXED) ---
const ConfirmLead: React.FC<{
  lead: typeof mockLeads[0];
  onConfirm: () => void;
  onBack: () => void;
}> = ({ lead, onConfirm, onBack }) => (
  <div className="bg-white rounded-lg shadow-xl lg:max-w-4xl lg:mx-auto border border-gray-100">
    <header className="p-4 border-b flex justify-between items-center">
      <h2 className="text-lg font-semibold">Confirm Claim</h2>
      <button onClick={onBack} className="text-sm font-medium px-4 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
    </header>
    <main className="p-6 lg:grid lg:grid-cols-2 lg:gap-8">
      <div>
        <h3 className="text-2xl font-bold mb-6">Claim Lead</h3>
        {/* --- [FIX] --- Added fallbacks with ?? */}
        <DetailSection items={[
          { label: "Device Category", value: lead.title },
          { label: "Estimated Price", value: `₹${lead.price.toLocaleString("en-IN")}` },
          { label: "Pickup Area", value: lead.pincode },
          { label: "Pickup Slot", value: lead.confirmSlot ?? "N/A" },
          { label: "Claim Fee", value: `${lead.claimFee ?? 0}%` },
        ]} />
      </div>
      <div className="mt-6 lg:mt-0">
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
          <li>You're about to claim this lead. Please review the details before confirming.</li>
          <li>Full customer details unlock instantly - lead moves to My Leads.</li>
          <li>Claiming debits your wallet, reveals contact, and assigns the lead to you.</li>
          <li>Claiming confirms your commitment to visit on time.</li>
        </ul>
      </div>
    </main>
    <footer className="p-4 bg-gray-50 rounded-b-lg flex space-x-3 sticky bottom-0">
      <button 
        onClick={onBack}
        className="w-full py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg text-base hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
      <button 
        onClick={onConfirm}
        className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors"
      >
        Confirm & Claim
      </button>
    </footer>
  </div>
);

// --- [Sub-Component] Claim Success (FIXED) ---
const ConfirmSuccessLead: React.FC<{
  lead: typeof mockLeads[0];
  onViewDetails: () => void;
  onGoToMyLeads: () => void;
}> = ({ lead, onViewDetails, onGoToMyLeads }) => (
  <div className="bg-white rounded-lg shadow-xl lg:max-w-2xl lg:mx-auto border border-gray-100">
    <header className="p-4 border-b flex justify-between items-center">
      <h2 className="text-lg font-semibold">Claim Confirmed</h2>
    </header>
    <main className="p-6 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
        <Check size={48} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold mt-6">Lead Claimed Successfully!</h3>
      <div className="w-full text-left my-6">
        {/* --- [FIX] --- Added fallbacks with ?? */}
        <DetailSection items={[
          { label: "Device Category", value: lead.title },
          { label: "Estimated Price", value: `₹${lead.price.toLocaleString("en-IN")}` },
          { label: "Pickup Area", value: lead.pincode },
          { label: "Pickup Slot", value: lead.confirmSlot ?? "N/A" },
          { label: "Lead ID", value: lead.id },
        ]} />
      </div>
      <p className="text-sm text-gray-600">Full address and contact number are available in My Leads.</p>
    </main>
    <footer className="p-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sticky bottom-0">
      <button 
        onClick={onGoToMyLeads}
        className="w-full py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg text-base hover:bg-gray-100 transition-colors"
      >
        Go to My Leads
      </button>
      <button 
        onClick={onViewDetails}
        className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors"
      >
        View Lead Details
      </button>
    </footer>
  </div>
);

// --- [Sub-Component] Lead Detail (Unlocked) (FIXED) ---
const LeadDetail: React.FC<{
  lead: typeof mockLeads[0];
  onGoToMyLeads: () => void;
  onBack: () => void;
}> = ({ lead, onGoToMyLeads, onBack }) => (
  <div className="bg-white rounded-lg shadow-xl lg:max-w-4xl lg:mx-auto border border-gray-100">
    <header className="p-4 border-b flex justify-between items-center">
      <h2 className="text-lg font-semibold">Lead Preview</h2>
      <button onClick={onBack} className="text-sm font-medium px-4 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
    </header>
    <main className="p-6 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">{lead.title}</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₹{lead.price.toLocaleString("en-IN")}
            </p>
          </div>
          <img src={lead.image} alt={lead.title} className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
        </div>
        {/* --- [FIX] --- Added fallbacks with ?? */}
        <DetailSection title="Highlights" items={[
          { label: "Device Category", value: lead.category },
          { label: "Device Summary", value: lead.summary ?? "N/A" },
          { label: "Device Age", value: lead.age ?? "N/A" },
        ]} />
      </div>
      <div className="space-y-5 mt-5 lg:mt-0">
        {/* --- [FIX] --- Added optional chaining ?. and fallbacks ?? */}
        <DetailSection title="Pickup & Location Info" items={[
          { label: "Pickup Area / City / Pincode", value: lead.customer?.address ?? "N/A" },
          { label: "Pickup Slot / Preferred Time", value: lead.pickupSlot ?? "N/A" },
        ]} />
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-lg font-semibold mb-3">View in Maps</h4>
          <a href="#" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
            <MapPin size={16} />
            <span>Open in Google Maps</span>
          </a>
        </div>
        {/* --- [FIX] --- Added optional chaining ?. and fallbacks ?? */}
        <DetailSection title="Customer Data" items={[
          { label: "Customer Name", value: lead.customer?.name ?? "N/A" },
          { label: "Phone Number", value: lead.customer?.fullPhone ?? "N/A" },
        ]} />
        <p className="text-sm text-gray-500 pt-2">Track your visit, update progress, and complete the deal.</p>
        <p className="font-semibold text-blue-600 text-lg">Lead Status : Claimed</p>
        <button 
          onClick={onGoToMyLeads}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors"
        >
          Go to My Leads
        </button>
      </div>
    </main>
  </div>
);


// --- Helper Component (No Change) ---
const DetailSection: React.FC<{
  title?: string;
  items: { label: string; value: string }[];
}> = ({ title, items }) => (
  <div className="border-t border-gray-200 pt-4">
    {title && <h4 className="text-lg font-semibold mb-3 text-gray-900">{title}</h4>}
    <div className="space-y-2.5">
      {items.map(item => (
        <div key={item.label} className="flex justify-between items-center text-sm">
          <span className="text-gray-500">{item.label}</span>
          <span className="font-medium text-gray-900 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);


// --- [MASTER COMPONENT] (No Change) ---
const NewLeadsFlow: React.FC<NewLeadsFlowProps> = ({ onSwitchTab, initialCategoryFilter }) => {
  const [view, setView] = useState<LeadFlowView>("list");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const selectedLead = mockLeads.find(lead => lead.id === selectedLeadId) || mockLeads[0];

  const handleBookNow = (leadId: string) => {
    setSelectedLeadId(leadId);
    setView("preview");
  };

  const handleGoToMyLeads = () => {
    onSwitchTab("my-leads");
  };

  const handleBackToList = () => {
    setView("list");
  };

  // Render logic based on the current view state
  switch (view) {
    case "list":
      return <NewLeadsList onBookNow={handleBookNow} initialCategoryFilter={initialCategoryFilter} />;
    
    case "preview":
      return <LeadPreview 
        lead={selectedLead}
        onClaim={() => setView("confirm")}
        onBack={handleBackToList}
      />;

    case "confirm":
      return <ConfirmLead 
        lead={selectedLead}
        onConfirm={() => setView("success")}
        onBack={() => setView("preview")}
      />;

    case "success":
      return <ConfirmSuccessLead 
        lead={selectedLead}
        onViewDetails={() => setView("detail")}
        onGoToMyLeads={handleGoToMyLeads}
      />;

    case "detail":
      return <LeadDetail 
        lead={selectedLead}
        onGoToMyLeads={handleGoToMyLeads}
        onBack={() => setView("success")}
      />;

    default:
      return <NewLeadsList onBookNow={handleBookNow} initialCategoryFilter={initialCategoryFilter} />;
  }
};

export default NewLeadsFlow;