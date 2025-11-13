// src/components/partner/ActiveDashboard.tsx
import React, { useState } from 'react';
import { type PartnerProfile } from '../../api/types/api';
import { useToast } from '../../contexts/ToastContext';
import { partnerService } from '../../api/services/partnerService'; // Corrected path
import { Loader2 } from 'lucide-react';
import { usePartnerStore } from '../../stores/usePartnerStore';

// A simple branded toggle
const AvailabilityToggle: React.FC<{
  isAvailable: boolean;
  onToggle: (newAvailability: boolean) => Promise<void>;
}> = ({ isAvailable, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onToggle(!isAvailable);
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
      <h3 className="text-lg font-semibold text-brand-black">
        {isAvailable ? "You are Online" : "You are Offline"}
      </h3>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2
          ${isAvailable ? 'bg-brand-green' : 'bg-gray-300'}`}
      >
        {loading && <Loader2 className="absolute top-1 left-1 w-6 h-6 animate-spin text-white" />}
        <span
          aria-hidden="true"
          className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${isAvailable ? 'translate-x-8' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
};

export const ActiveDashboard: React.FC<{ partner: PartnerProfile }> = ({ partner }) => {
  const toast = useToast();
  const { refetchPartner } = usePartnerStore();
  const [localPartner, setLocalPartner] = useState(partner);

  const handleToggle = async (newAvailability: boolean) => {
    try {
      const response = await partnerService.toggleAvailability({ //
        is_available: newAvailability,
      });
      setLocalPartner(prev => ({...prev!, is_available: response.is_available}));
      toast.success(response.message);
      // Refetch the main profile to ensure stores are in sync
      refetchPartner();
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-gray-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-4xl font-bold text-brand-black">
            Welcome, {localPartner.user.name || localPartner.business_name}
          </h1>
          <AvailabilityToggle 
            isAvailable={localPartner.is_available} 
            onToggle={handleToggle} 
          />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Partner Score</p>
            <p className="text-3xl font-bold text-brand-green">{localPartner.partner_score}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Avg. Rating</p>
            <p className="text-3xl font-bold text-brand-yellow">{localPartner.average_rating}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Leads Completed</p>
            <p className="text-3xl font-bold text-brand-black">{localPartner.total_leads_completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Wallet Balance</p>
            {/* ✅ FIXED: Uses optional chaining and a fallback */}
            <p className="text-3xl font-bold text-brand-black">
              ₹{localPartner.wallet?.balance || '0.00'}
            </p>
          </div>
        </div>

        {/* Available Leads */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-brand-black mb-4">Available Leads Near You</h3>
          <div className="text-center text-gray-500 py-20 border-2 border-dashed rounded-lg">
            <p>(Lead list will be displayed here)</p>
            <p className="text-sm">New leads will appear here automatically.</p>
          </div>
        </div>
      </div>
    </div>
  
  );
};