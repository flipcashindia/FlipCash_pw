import React, { useState } from "react";
import {
  MapPin,
  Check,
  Upload,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

// --- Types ---
type MyLeadFlowView =
  | "list"
  | "info"
  | "navigate"
  | "verifyCondition"
  | "showEstimate"
  | "makeOffer"
  | "offerSuccess"
  | "dealSuccess";

type PartnerTab = "dashboard" | "new-leads" | "my-leads" | "wallet" | "account-details" | "helpdesk" | "dispute" | "feedback";

interface MyLeadsFlowProps {
  onSwitchTab: (tab: PartnerTab) => void;
}

// --- Mock Data ---
const mockWatchImg = "https://placehold.co/150x150/F3F4F6/334155?text=Watch&font=sans";

const mockMyLeads = [
  {
    id: "fc-lead-1452",
    title: "Apple Watch Series 7",
    category: "Smart Watch",
    price: 13002,
    image: mockWatchImg,
    summary: "Good",
    age: "2 Years Old",
    pickupArea: "Rohini Sector 8 - 110085",
    pickupSlot: "24 Oct - 2:00 PM - 4:00 PM",
    systemPrice: 15000,
    deviationLimit: 7,
    comment: "more data to be vissible according to device",
    customer: {
      name: "Rakesh Sharma",
      phone: "+91 98765 43021",
      address: "House No. 43, Sector 56, Gurgaon, Haryana - 122002",
    },
    status: "In Progress",
    statusLabel: "Start Visit",
  },
  // Add more mock leads here
];

// --- [Helper] Main Card Layout ---
const FlowCard: React.FC<{
  title: string;
  leadId: string;
  onBack: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, leadId, onBack, children, footer }) => (
  <div className="bg-white rounded-lg shadow-xl lg:max-w-4xl lg:mx-auto border border-gray-100">
    <header className="p-4 border-b flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">ID: {leadId}</p>
      </div>
      <button onClick={onBack} className="text-sm font-medium px-4 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
    </header>
    
    <main className="p-6">
      {children}
    </main>
    
    {footer && (
      <footer className="p-4 bg-gray-50 rounded-b-lg sticky bottom-0 border-t">
        {footer}
      </footer>
    )}
  </div>
);

// --- [Helper] Detail Row ---
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 text-right">{value}</span>
  </div>
);

// --- [Helper] Detail Section ---
const DetailSection: React.FC<{
  title?: string;
  items: { label: string; value: string }[];
}> = ({ title, items }) => (
  <div className="border-t border-gray-200 pt-4">
    {title && <h4 className="text-lg font-semibold mb-3 text-gray-900">{title}</h4>}
    <div className="space-y-2.5">
      {items.map(item => (
        <DetailRow key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  </div>
);

// --- [Helper] Chip Component ---
const Chip: React.FC<{
  label: string;
  groupName: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}> = ({ label, groupName, isSelected, onSelect }) => (
  <label
    className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
      isSelected
        ? 'bg-gray-800 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    <input
      type="radio"
      name={groupName}
      value={label}
      checked={isSelected}
      onChange={() => onSelect(label)}
      className="hidden"
    />
    {label}
  </label>
);

// --- [Helper] File Upload Box ---
const FileUploadBox: React.FC<{ label: string; isUploaded: boolean }> = ({ label, isUploaded }) => (
  <div className={`relative flex flex-col items-center justify-center p-4 h-24 border-2 border-dashed rounded-lg ${isUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
    {isUploaded ? (
      <>
        <CheckCircle2 size={24} className="text-green-600" />
        <span className="text-sm font-medium text-green-700 mt-1">{label} Uploaded</span>
      </>
    ) : (
      <>
        <Upload size={24} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600 mt-1">Add {label}</span>
        <span className="text-xs text-gray-400">Optional</span>
      </>
    )}
    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
  </div>
);


// --- [View 1] My Leads List ---
const MyLeadsList: React.FC<{
  onStartVisit: (leadId: string) => void;
}> = ({ onStartVisit }) => {
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "All">("Active");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Leads</h1>
          <p className="text-gray-500">Assigned & history</p>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
        {(["Active", "Completed", "All"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full py-2 rounded-md font-semibold text-sm transition-colors ${
              activeTab === tab 
                ? 'bg-yellow-400 text-black' 
                : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {mockMyLeads.map((lead) => (
          <div key={lead.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{lead.title}</h3>
                <p className="text-sm text-gray-500">ID: {lead.id}</p>
                <p className="font-bold text-lg text-green-600 mt-1">₹{lead.price.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mb-2">
                  {lead.status}
                </span>
                <button 
                  onClick={() => onStartVisit(lead.id)}
                  className="w-full px-5 py-2 bg-yellow-400 text-black font-semibold rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                >
                  {lead.statusLabel}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- [View 2] Lead Info ---
const LeadInfoView: React.FC<{
  lead: typeof mockMyLeads[0];
  onBack: () => void;
  onNext: () => void;
}> = ({ lead, onBack, onNext }) => (
  <FlowCard 
    title="Lead Info" 
    leadId={lead.id} 
    onBack={onBack}
    footer={
      <button onClick={onNext} className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors">
        Start Navigation
      </button>
    }
  >
    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      {/* Left Col */}
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
        <DetailSection title="Highlights" items={[
          { label: "Device Category", value: lead.category },
          { label: "Device Summary", value: lead.summary },
          { label: "Device Age", value: lead.age },
        ]} />
        <p className="text-xs text-gray-500 italic ml-4 -mt-3">comment : {lead.comment}</p>
      </div>

      {/* Right Col */}
      <div className="space-y-5 mt-5 lg:mt-0">
        <DetailSection title="Pickup & Location Info" items={[
          { label: "Pickup Area / City / Pincode", value: lead.customer.address },
          { label: "Pickup Slot / Preferred Time", value: lead.pickupSlot },
        ]} />
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-lg font-semibold mb-3">View in Maps</h4>
          <a href="#" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
            <MapPin size={16} />
            <span>Open in Google Maps</span>
          </a>
        </div>
        <DetailSection title="Customer Data" items={[
          { label: "Customer Name", value: lead.customer.name },
          { label: "Phone Number", value: lead.customer.phone },
        ]} />
        <p className="text-sm text-gray-500 pt-2">Track your visit, update progress, and complete the deal.</p>
        <p className="font-semibold text-green-600 text-lg">Lead Status : Start Visit</p>
      </div>
    </div>
  </FlowCard>
);

// --- [View 3] Navigation & Verification ---
const NavigationAndVerificationView: React.FC<{
  lead: typeof mockMyLeads[0];
  onBack: () => void;
  onNext: () => void;
}> = ({ lead, onBack, onNext }) => {
  return (
    <FlowCard
      title="Navigation & Verification"
      leadId={lead.id}
      onBack={onBack}
      footer={
        <button onClick={onNext} className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors">
          Verify Device
        </button>
      }
    >
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Left Col */}
        <div className="space-y-5">
          <DetailSection title="Customer Data" items={[
            { label: "Customer Name", value: lead.customer.name },
            { label: "Phone Number", value: lead.customer.phone },
          ]} />
          <DetailSection title="Pickup & Location Info" items={[
            { label: "Pickup Area", value: lead.customer.address },
            { label: "Pickup Slot / Preferred Time", value: lead.pickupSlot },
          ]} />
          <a href="#" className="inline-flex items-center space-x-2 text-sm text-white bg-yellow-500 px-4 py-2 rounded-lg hover:bg-yellow-600">
            <MapPin size={16} />
            <span>Open in Google Maps</span>
          </a>
        </div>
        
        {/* Right Col */}
        <div className="space-y-5 mt-5 lg:mt-0 lg:border-l lg:pl-8">
          <h4 className="text-lg font-semibold text-gray-900">Verify Visit with Customer OTP</h4>
          <p className="text-sm text-gray-600">Ask the customer to open their Flipcash app. Enter the 4-digit OTP displayed on their screen to confirm your visit.</p>
          
          <div className="flex justify-center space-x-3 pt-2">
            <input type="tel" maxLength={1} className="w-14 h-14 text-3xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <input type="tel" maxLength={1} className="w-14 h-14 text-3xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <input type="tel" maxLength={1} className="w-14 h-14 text-3xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <input type="tel" maxLength={1} className="w-14 h-14 text-3xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>

          <button onClick={onNext} className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors">
            Verify OTP & Continue
          </button>
          <button className="w-full py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg text-base hover:bg-gray-100 transition-colors">
            Call Customer
          </button>
          <p className="font-semibold text-green-600 text-lg text-center">Lead Status : Verify by OTP at Location</p>
        </div>
      </div>
    </FlowCard>
  );
};

// --- [View 4] Device Condition Verification ---
const DeviceConditionVerificationView: React.FC<{
  lead: typeof mockMyLeads[0];
  onBack: () => void;
  onNext: () => void;
}> = ({ lead, onBack, onNext }) => {
  // Simple state for demo
  const [condition, setCondition] = useState({
    age: "", body: "", screen: "", battery: "", functional: "", accessories: ""
  });

  return (
    <FlowCard
      title="Device Condition Verification"
      leadId={lead.id}
      onBack={onBack}
      footer={
        <button onClick={onNext} className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors">
          Get Estimate
        </button>
      }
    >
      {/* This form is too complex for 2-col, will stack */}
      <div className="space-y-6">
        <div>
          <h4 className="text-base font-semibold mb-2">Age</h4>
          <div className="flex flex-wrap gap-2">
            <Chip label="< 3m" groupName="age" isSelected={condition.age === "< 3m"} onSelect={v => setCondition({...condition, age: v})} />
            <Chip label="3-6 m" groupName="age" isSelected={condition.age === "3-6 m"} onSelect={v => setCondition({...condition, age: v})} />
            <Chip label="6-12m" groupName="age" isSelected={condition.age === "6-12m"} onSelect={v => setCondition({...condition, age: v})} />
            <Chip label="> 1y" groupName="age" isSelected={condition.age === "> 1y"} onSelect={v => setCondition({...condition, age: v})} />
            <Chip label="> 2y" groupName="age" isSelected={condition.age === "> 2y"} onSelect={v => setCondition({...condition, age: v})} />
          </div>
        </div>
        
        <div>
          <h4 className="text-base font-semibold mb-2">Body Condition</h4>
          <div className="flex flex-wrap gap-2">
            <Chip label="Flawless" groupName="body" isSelected={condition.body === "Flawless"} onSelect={v => setCondition({...condition, body: v})} />
            <Chip label="Minor Scratches" groupName="body" isSelected={condition.body === "Minor Scratches"} onSelect={v => setCondition({...condition, body: v})} />
            <Chip label="Major Dents" groupName="body" isSelected={condition.body === "Major Dents"} onSelect={v => setCondition({...condition, body: v})} />
            <Chip label="Broken" groupName="body" isSelected={condition.body === "Broken"} onSelect={v => setCondition({...condition, body: v})} />
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-2">Screen Condition</h4>
          <div className="flex flex-wrap gap-2">
            <Chip label="Intact" groupName="screen" isSelected={condition.screen === "Intact"} onSelect={v => setCondition({...condition, screen: v})} />
            <Chip label="Minor" groupName="screen" isSelected={condition.screen === "Minor"} onSelect={v => setCondition({...condition, screen: v})} />
            <Chip label="Cracked" groupName="screen" isSelected={condition.screen === "Cracked"} onSelect={v => setCondition({...condition, screen: v})} />
            <Chip label="Not Working" groupName="screen" isSelected={condition.screen === "Not Working"} onSelect={v => setCondition({...condition, screen: v})} />
          </div>
        </div>

        {/* ... Add other chip groups for Battery, Functional Issues, Accessories ... */}
        
        <div>
          <h4 className="text-base font-semibold mb-2">Photos <span className="text-gray-400 font-normal">(optional)</span></h4>
          <div className="grid grid-cols-2 gap-4">
            <FileUploadBox label="Front" isUploaded={false} />
            <FileUploadBox label="Back" isUploaded={false} />
            <FileUploadBox label="Side" isUploaded={false} />
            <FileUploadBox label="IMEI" isUploaded={false} />
          </div>
        </div>
        
        <div>
          <label className="text-base font-semibold" htmlFor="imei">IMEI / Serial</label>
          <input id="imei" type="text" placeholder="e.g. 3567..." className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>
        
        <div>
          <label className="text-base font-semibold" htmlFor="notes">Additional Note / Remarks</label>
          <textarea id="notes" rows={3} placeholder="Any observation or issue found..." className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>

      </div>
    </FlowCard>
  );
};

// --- [View 5] Verification Complete / Show Estimate ---
const VerificationCompleteView: React.FC<{
  lead: typeof mockMyLeads[0];
  onBack: () => void;
  onAccept: () => void;
  onCounter: () => void;
}> = ({ lead, onBack, onAccept, onCounter }) => (
  <FlowCard
    title="Verification Complete"
    leadId={lead.id}
    onBack={onBack}
  >
    <div className="flex flex-col items-center text-center max-w-sm mx-auto">
      <h3 className="text-2xl font-bold mb-4">Device Verified</h3>
      
      <div className="w-full p-4 bg-yellow-400 rounded-lg text-center">
        <span className="text-sm font-semibold text-black">System Calculated Price:</span>
        <p className="text-4xl font-bold text-black">₹{lead.systemPrice.toLocaleString("en-IN")}</p>
      </div>

      <div className="w-full space-y-3 mt-6">
        <button onClick={onAccept} className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors">
          Accept System Price
        </button>
        <button onClick={onCounter} className="w-full py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg text-base hover:bg-gray-100 transition-colors">
          Make Counter Offer
        </button>
      </div>
    </div>
  </FlowCard>
);

// --- [View 6] Make Counter Offer ---
const MakeOfferView: React.FC<{
  lead: typeof mockMyLeads[0];
  onBack: () => void;
  onSubmit: () => void;
}> = ({ lead, onBack, onSubmit }) => {
  const [offer, setOffer] = useState("");
  
  // Basic deviation logic
  const deviation = offer ? ((parseInt(offer) - lead.systemPrice) / lead.systemPrice) * 100 : 0;
  const isOverLimit = deviation < -lead.deviationLimit;

  return (
    <FlowCard
      title="Make Offer"
      leadId={lead.id}
      onBack={onBack}
      footer={
        <button onClick={onSubmit} className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors">
          Submit Offer
        </button>
      }
    >
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Left Col */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Device Verified</h3>
          <div className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">System Price</span>
              <p className="text-2xl font-bold">₹{lead.systemPrice.toLocaleString("en-IN")}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Deviation Limit</span>
              <p className="text-lg font-bold text-green-600">{lead.deviationLimit}%</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium" htmlFor="offer">Your Offer Amount</label>
            <input id="offer" type="number" value={offer} onChange={e => setOffer(e.target.value)} placeholder="8000" className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Deviation</label>
            <div className={`w-full mt-1 p-3 border rounded-lg text-lg ${deviation > 0 ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}`}>
              {deviation.toFixed(2)}%
            </div>
            {isOverLimit && <p className="text-sm text-red-600 mt-1">▲ Deviation &gt; {lead.deviationLimit}% requires approval</p>}
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-4 mt-6 lg:mt-0">
          <h4 className="text-lg font-semibold">Reasons for Adjustment</h4>
          <textarea rows={3} placeholder="Please Enter Your Custom Reasons" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 focus:bg-yellow-100 focus:border-yellow-400">Screen has minor scratches</button>
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 focus:bg-yellow-100 focus:border-yellow-400">Battery health below 85%</button>
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 focus:bg-yellow-100 focus:border-yellow-400">Body has dents</button>
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 focus:bg-yellow-100 focus:border-yellow-400">Missing accessories</button>
          </div>
        </div>
      </div>
    </FlowCard>
  );
};

// --- [View 7] Success View ---
const SuccessView: React.FC<{
  title: string;
  message: string;
  onBack: () => void;
}> = ({ title, message, onBack }) => (
  <FlowCard title={title} leadId="" onBack={onBack}>
    <div className="flex flex-col items-center text-center max-w-sm mx-auto py-12">
      <CheckCircle2 size={64} className="text-green-500" />
      <h3 className="text-2xl font-bold mt-6">{message}</h3>
      <p className="text-gray-600 mt-2">The lead has been updated. You can track its status in your "My Leads" list.</p>
      <button onClick={onBack} className="w-full mt-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors">
        Back to My Leads
      </button>
    </div>
  </FlowCard>
);


// --- [MASTER COMPONENT] ---
const MyLeadsFlow: React.FC<MyLeadsFlowProps> = ({ onSwitchTab }) => {
  const [view, setView] = useState<MyLeadFlowView>("list");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const selectedLead = mockMyLeads.find(lead => lead.id === selectedLeadId) || mockMyLeads[0];

  const handleStartVisit = (leadId: string) => {
    setSelectedLeadId(leadId);
    setView("info");
  };
  
  const handleGoToMyLeads = () => {
    setView("list");
    // We are already in the "My Leads" tab, so just reset the view
    // onSwitchTab("my-leads"); 
  };

  // Render logic based on the current view state
  switch (view) {
    case "list":
      return <MyLeadsList onStartVisit={handleStartVisit} />;
    
    case "info":
      return <LeadInfoView 
        lead={selectedLead}
        onBack={handleGoToMyLeads}
        onNext={() => setView("navigate")}
      />;

    case "navigate":
      return <NavigationAndVerificationView 
        lead={selectedLead}
        onBack={() => setView("info")}
        onNext={() => setView("verifyCondition")}
      />;
      
    case "verifyCondition":
      return <DeviceConditionVerificationView 
        lead={selectedLead}
        onBack={() => setView("navigate")}
        onNext={() => setView("showEstimate")}
      />;
      
    case "showEstimate":
      return <VerificationCompleteView 
        lead={selectedLead}
        onBack={() => setView("verifyCondition")}
        onAccept={() => setView("dealSuccess")}
        onCounter={() => setView("makeOffer")}
      />;
      
    case "makeOffer":
      return <MakeOfferView 
        lead={selectedLead}
        onBack={() => setView("showEstimate")}
        onSubmit={() => setView("offerSuccess")}
      />;
      
    case "offerSuccess":
      return <SuccessView
        title="Offer Submitted"
        message="Your counter-offer has been submitted!"
        onBack={handleGoToMyLeads}
      />;

    case "dealSuccess":
      return <SuccessView
        title="Deal Complete"
        message="System Price Accepted!"
        onBack={handleGoToMyLeads}
      />;

    default:
      return <MyLeadsList onStartVisit={handleStartVisit} />;
  }
};

export default MyLeadsFlow;