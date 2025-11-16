// src/pages/partner/PartnerLeadDetailPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leadsService } from '../../api/services/leadsService';
import { visitService } from '../../api/services/visitsService';
import { Loader2, Phone, MapPin, CheckCircle, ArrowLeft, Wallet, AlertCircle, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { type LeadDetails } from '../../api/types/api';
import { handleApiError } from '../../utils/handleApiError';
import { privateApiClient } from '../../api/client/apiClient';

// --- Claim Confirmation Modal Component ---
const ClaimConfirmationModal: React.FC<{
  lead: LeadDetails;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ lead, onConfirm, onCancel, isLoading }) => {
  const claimFee = 50; // ₹50 claim fee
  const estimatedPrice = parseFloat(lead.estimated_price || '0');
  const totalDeduction = claimFee + estimatedPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1C1C1B] mb-2">Claim Lead</h2>
          <p className="text-gray-600">Review the details before claiming this lead</p>
        </div>

        {/* Device Info */}
        <div className="bg-[#F5F5F5] rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[#1C1C1B] mb-2">{lead.device_model.name}</h3>
          <p className="text-sm text-gray-600">Lead #{lead.lead_number}</p>
        </div>

        {/* Wallet Breakdown */}
        <div className="bg-yellow-50 border-2 border-[#FEC925] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-[#1C1C1B]" />
            <h3 className="font-semibold text-[#1C1C1B]">Wallet Deductions</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Claim Fee (non-refundable)</span>
              <span className="font-semibold text-red-600">-₹{claimFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Amount Blocked (refundable)</span>
              <span className="font-semibold text-[#FEC925]">-₹{estimatedPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Total Deduction</span>
              <span className="font-bold text-[#1C1C1B]">₹{totalDeduction.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>₹50 claim fee is non-refundable</li>
                <li>₹{estimatedPrice.toLocaleString('en-IN')} will be blocked until visit completion</li>
                <li>Customer details will be revealed after claiming</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Claiming...</span>
              </>
            ) : (
              'Confirm & Claim'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export const PartnerLeadDetailPage: React.FC = () => {
  const { id: leadId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showClaimModal, setShowClaimModal] = useState(false);

  if (!leadId) {
    navigate('/partner/leads/my');
    return null;
  }

  // Fetch lead details
  const { data: lead, isLoading, isError, refetch } = useQuery({
    queryKey: ['leadDetails', leadId],
    queryFn: () => leadsService.getLeadDetails(leadId),
  });

  // --- ACTIONS (Mutations) ---
  const claimMutation = useMutation({
    mutationFn: async () => {
      // Call the claim endpoint
      const response = await privateApiClient.post(`/leads/${leadId}/claim/`);
      return response.data;
    },
    onSuccess: (data) => {
      setShowClaimModal(false);
      toast.success(data.message || 'Lead claimed successfully!');
      
      // Refetch lead details
      refetch();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['availableLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['partner-visits'] });
      
      // Navigate to claimed lead detail page if visit was created
      if (data.visit_id || data.visit_number) {
        setTimeout(() => {
          navigate(`/partner/my-leads/${data.visit_number || data.lead_number}`, {
            state: { leadId: leadId }
          });
        }, 1500);
      }
    },
    onError: (error: any) => {
      setShowClaimModal(false);
      toast.error(handleApiError(error));
    }
  });
  
  const startVisitMutation = useMutation({
    mutationFn: (visitId: string) => visitService.startVisit(visitId),
    onSuccess: (data) => {
      toast.success(data.message || 'Journey started!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(handleApiError(error));
    }
  });

  const renderActionCard = () => {
    if (!lead) return null;
    
    // 1. Not claimed yet 
    if (lead.status === 'booked') { 
      return (
        <div className="bg-[#FEC925] bg-opacity-10 p-6 rounded-lg border-2 border-[#FEC925]">
          <h3 className="text-xl font-semibold text-[#1C1C1B] mb-4">Claim this Lead</h3>
          <p className="text-gray-600 mb-4">
            You will be charged a ₹50 claim fee (non-refundable) and ₹{parseFloat(lead.estimated_price || '0').toLocaleString('en-IN')} 
            will be blocked in your wallet. Customer contact details will be revealed after you claim.
          </p>
          <button
            onClick={() => setShowClaimModal(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] rounded-xl font-bold text-lg transition-colors"
          >
            Claim this Lead
          </button>
        </div>
      );
    }
    
    // 2. Claimed, but not started journey (status: scheduled)
    if (lead.status === 'scheduled') {
      const visitId = lead.visit?.id;
      return (
        <div className="bg-[#F5F5F5] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#1C1C1B] mb-4">Next Step: Start Journey</h3>
          <p className="text-gray-600 mb-4">You have claimed this lead. Click below when you're heading to the customer's location.</p>
          <button
            onClick={() => visitId && startVisitMutation.mutate(visitId)}
            disabled={startVisitMutation.isPending || !visitId}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#1B8A05] hover:bg-[#176f04] text-white rounded-xl font-bold text-lg disabled:opacity-50 transition-colors"
          >
            {startVisitMutation.isPending ? <Loader2 className="animate-spin" /> : 'Start Journey'}
          </button>
        </div>
      );
    }

    // 3. Visit in progress
    return <InspectionWorkspace lead={lead} onRefresh={refetch} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#FEC925]" />
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1C1C1B] mb-2">Error loading lead details</h2>
        <p className="text-gray-600 mb-6">Please try again later</p>
        <Link
          to="/partner/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] font-semibold rounded-lg transition-colors"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isClaimed = lead.status !== 'booked';

  return (
    <div className="space-y-6">
      <Link 
        to="/partner/catalog" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1C1C1B] transition-colors"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>
      
      {/* --- Header --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-[#1C1C1B]">{lead.device_model.name}</h2>
            <p className="text-gray-500">{lead.lead_number}</p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <p className="text-sm text-gray-600">Est. Price</p>
            <p className="text-3xl font-bold text-[#1B8A05]">₹{parseFloat(lead.estimated_price || '0').toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm font-semibold text-[#1C1C1B]">Status</p>
            <p className="capitalize text-gray-700">{lead.status_display}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C1C1B]">Preferred Date</p>
            <p className="text-gray-700">{lead.preferred_date} ({lead.preferred_time_slot})</p>
          </div>
        </div>
      </div>

      {/* --- Customer & Device Details --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-[#1C1C1B] mb-4">Customer Details</h3>
          {!isClaimed ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Claim this lead to see customer details</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-lg text-[#1C1C1B]">{lead.user.name}</p>
              <p className="text-gray-600">{lead.user.phone}</p>
              <div className="flex items-start gap-2 mt-2">
                <MapPin size={16} className="text-gray-500 mt-1" />
                <p className="text-gray-600">
                  {lead.pickup_address.address_line1}, {lead.pickup_address.city}, {lead.pickup_address.state} - {lead.pickup_address.pincode}
                </p>
              </div>
              <a 
                href={`tel:${lead.user.phone}`} 
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1B8A05] hover:bg-[#176f04] text-white font-bold rounded-lg transition-colors"
              >
                <Phone size={16} /> Call Customer
              </a>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-[#1C1C1B] mb-4">Device Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Storage:</span>
              <span className="font-semibold text-[#1C1C1B]">{lead.storage}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">RAM:</span>
              <span className="font-semibold text-[#1C1C1B]">{lead.ram}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Color:</span>
              <span className="font-semibold text-[#1C1C1B]">{lead.color}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">IMEI:</span>
              <span className="font-semibold text-[#1C1C1B] font-mono text-xs">{lead.imei_primary}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Main Action Card --- */}
      {renderActionCard()}

      {/* --- Claim Confirmation Modal --- */}
      {showClaimModal && (
        <ClaimConfirmationModal
          lead={lead}
          onConfirm={() => claimMutation.mutate()}
          onCancel={() => setShowClaimModal(false)}
          isLoading={claimMutation.isPending}
        />
      )}
    </div>
  );
};

// --- Sub-Component for Inspection (Keep existing code) ---
const InspectionWorkspace: React.FC<{ lead: LeadDetails, onRefresh: () => void }> = ({ lead, onRefresh }) => {
  const visitId = lead.visit?.id;
  const toast = useToast();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState(lead.estimated_price || '0'); 
  
  const { data: visitData, isLoading: isLoadingVisit } = useQuery({
    queryKey: ['visitDetails', visitId],
    queryFn: () => visitService.getVisit(visitId!),
    enabled: !!visitId,
  });

  const { data: checklist, isLoading: isLoadingChecklist } = useQuery({
    queryKey: ['visitChecklist', visitId],
    queryFn: () => visitService.getChecklist(visitId!),
    enabled: !!visitData && visitData.status === 'in_progress', 
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, status, notes }: { itemId: string, status: string, notes: string }) => 
      privateApiClient.patch(`/visits/${visitId}/checklist/${itemId}/`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitChecklist', visitId] }); 
      toast.success("Checklist updated.");
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });

  const verifyCodeMutation = useMutation({
    mutationFn: () => visitService.verifyCode(visitId!, { code }),
    onSuccess: () => {
      toast.success("Code Verified!");
      onRefresh(); 
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });

  const startInspectionMutation = useMutation({
    mutationFn: () => visitService.startInspection(visitId!),
    onSuccess: () => {
      toast.success("Inspection Started. Checklist loading...");
      onRefresh(); 
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });
  
  const completeInspectionMutation = useMutation({
    mutationFn: () => visitService.completeInspection(visitId!, {
      inspection_notes: notes,
      inspection_photos: [],
      verified_imei: lead.imei_primary || '',
      imei_matches: true,
      device_powers_on: true,
      partner_assessment: {},
      partner_recommended_price: price,
    }),
    onSuccess: () => {
      onRefresh(); 
      toast.success("Inspection Complete! Ready for final offer.");
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });
  
  const makeOfferMutation = useMutation({
    mutationFn: () => leadsService.createOffer({
      lead: lead.id,
      partner_offered_price: price,
      message: notes || "Based on inspection, here is the final offer."
    }),
    onSuccess: () => {
      onRefresh();
      toast.success("Offer Sent to Customer!");
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });

  if (isLoadingVisit) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-12 h-12 animate-spin text-[#FEC925]" />
      </div>
    );
  }

  if (!visitData) {
    return (
      <div className="text-center text-red-600 py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p>Could not load visit details. Refresh and try again.</p>
      </div>
    );
  }

  // 1. Not Verified
  if (!visitData.is_code_verified) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); verifyCodeMutation.mutate(); }} className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-gray-200">
        <h3 className="text-xl font-semibold text-[#1C1C1B]">Verify Customer Code</h3>
        <p className="text-gray-600">Ask the customer for their verification code to start the inspection.</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="w-full p-3 border-2 border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] focus:border-[#FEC925] focus:outline-none"
          placeholder="••••••"
        />
        <button
          type="submit"
          disabled={verifyCodeMutation.isPending || code.length < 4}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] rounded-xl font-bold text-lg disabled:opacity-50 transition-colors"
        >
          {verifyCodeMutation.isPending ? <Loader2 className="animate-spin" /> : 'Verify Code'}
        </button>
      </form>
    );
  }
  
  // 2. Verified, but not inspecting
  if (visitData.is_code_verified && visitData.status === 'arrived') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 text-center border border-gray-200">
         <CheckCircle className="w-16 h-16 text-[#1B8A05] mx-auto mb-4" />
         <h3 className="text-xl font-semibold text-[#1C1C1B]">Code Verified!</h3>
         <p className="text-gray-600 mb-4">You are clear to inspect the device.</p>
         <button
          onClick={() => startInspectionMutation.mutate()}
          disabled={startInspectionMutation.isPending}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] rounded-xl font-bold text-lg disabled:opacity-50 transition-colors"
         >
           {startInspectionMutation.isPending ? <Loader2 className="animate-spin" /> : 'Start Inspection'}
         </button>
      </div>
    );
  }
  
  // 3. Offer is made and pending
  if (lead.status === 'offer_made' || lead.status === 'negotiating' || lead.status === 'accepted') {
    return (
       <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 text-center border-l-4 border-[#1B8A05]">
         <CheckCircle className="w-16 h-16 text-[#1B8A05] mx-auto mb-4" />
         <h3 className="text-xl font-semibold text-[#1C1C1B]">Status: {lead.status_display}</h3>
         <p className="text-gray-600 mb-4">
           Your final price: <strong className="text-[#1C1C1B]">₹{lead.final_price || lead.estimated_price}</strong>
         </p>
         <p className="text-gray-600">Waiting for customer response or further action.</p>
      </div>
    );
  }

  // 4. Inspection is Complete, ready to make offer 
  if (visitData.status === 'completed') {
    return (
      <form onSubmit={(e) => { e.preventDefault(); makeOfferMutation.mutate(); }} className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-gray-200">
        <h3 className="text-xl font-semibold text-[#1C1C1B]">Make Final Offer</h3>
        <p className="text-sm text-gray-600">Review notes and propose your final price to the customer.</p>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FEC925] focus:outline-none"
          min="0"
        />
         <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for your offer (e.g., 'Battery health at 82%')"
          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none"
          rows={4}
        />
        <button
          type="submit"
          disabled={makeOfferMutation.isPending}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#1B8A05] hover:bg-[#176f04] text-white rounded-xl font-bold text-lg disabled:opacity-50 transition-colors"
        >
          {makeOfferMutation.isPending ? <Loader2 className="animate-spin" /> : 'Send Offer to Customer'}
        </button>
      </form>
    );
  }
  
  // 5. Currently Inspecting
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-gray-200">
      <h3 className="text-xl font-semibold text-[#1C1C1B]">Device Inspection Checklist</h3>
      {isLoadingChecklist ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#FEC925]" />
        </div>
      ) : (
        <div className="space-y-3">
          {checklist?.map((item, index) => (
            <div key={index} className="p-3 bg-[#F5F5F5] rounded-lg">
              <p className="font-semibold text-[#1C1C1B]">{item.item_name}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateItemMutation.mutate({ 
                    itemId: item.item_name, 
                    status: 'pass', 
                    notes: 'OK' 
                  })}
                  disabled={updateItemMutation.isPending}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    item.status === 'pass' 
                      ? 'bg-[#1B8A05] text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Pass
                </button>
                <button
                  onClick={() => updateItemMutation.mutate({ 
                    itemId: item.item_name, 
                    status: 'fail', 
                    notes: 'Issue found' 
                  })}
                  disabled={updateItemMutation.isPending}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    item.status === 'fail' 
                      ? 'bg-[#FF0000] text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Fail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border-t pt-4 space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Final inspection notes... (e.g., 'Battery health at 82%')"
          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none"
          rows={4}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Recommended Price"
          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FEC925] focus:outline-none"
          min="0"
        />
        <button
          onClick={() => completeInspectionMutation.mutate()}
          disabled={completeInspectionMutation.isPending || isLoadingChecklist}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] rounded-xl font-bold text-lg disabled:opacity-50 transition-colors"
        >
          {completeInspectionMutation.isPending ? <Loader2 className="animate-spin" /> : 'Complete Inspection'}
        </button>
      </div>
    </div>
  );
};