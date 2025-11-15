// src/pages/partner/PartnerLeadDetailPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leadsService } from '../../api/services/leadsService';
import { visitsService } from '../../api/services/visitsService';
import { Loader2, Phone, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { type LeadDetails } from '../../api/types/api';
import { handleApiError } from '../../utils/handleApiError';

// --- Main Page Component ---
export const PartnerLeadDetailPage: React.FC = () => {
  const { id: leadId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  if (!leadId) {
    navigate('/partner/leads/my');
    return null;
  }

  // Fetch lead details
  const { data: lead, isLoading, isError, refetch } = useQuery({
    queryKey: ['leadDetails', leadId],
    queryFn: () => leadsService.getLeadDetails(leadId), //
  });

  // --- ACTIONS (Mutations) ---
  const claimMutation = useMutation({
    mutationFn: () => leadsService.claimLead(leadId), //
    onSuccess: (data) => {
      refetch(); // Refetch lead details
      queryClient.invalidateQueries({ queryKey: ['availableLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      toast.success(data.message || 'Lead Claimed!');
    },
    onError: (error: any) => {
      toast.error(handleApiError(error)); //
    }
  });
  
  const checkInMutation = useMutation({
    mutationFn: () => visitsService.checkIn(leadId), //
    onSuccess: (data) => {
      toast.success(data.message || 'Check-in successful!');
      refetch(); // Refetch the lead, which will now have visit data
    },
    onError: (error: any) => {
      toast.error(handleApiError(error));
    }
  });

  const renderActionCard = () => {
    if (!lead) return null;
    
    // Using standard string literals for status matching Django/API types
    // 1. Not claimed yet 
    if (lead.status === 'booked') { 
      return (
        <div className="bg-brand-yellow/10 p-6 rounded-lg border-2 border-brand-yellow">
          <h3 className="text-xl font-semibold text-brand-black mb-4">Claim this Lead</h3>
          <p className="text-gray-600 mb-4">You will be charged a claim fee. Customer contact details will be revealed after you claim.</p>
          <button
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-bold text-lg disabled:opacity-50"
          >
            {claimMutation.isPending ? <Loader2 className="animate-spin" /> : 'Confirm & Claim'}
          </button>
        </div>
      );
    }
    
    // 2. Claimed, but not checked in (status: partner_assigned or en_route)
    if (lead.status === 'partner_assigned' || lead.status === 'en_route') { 
      return (
        <div className="bg-brand-gray-light/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-brand-black mb-4">Next Step: Check In</h3>
          <p className="text-gray-600 mb-4">You have claimed this lead. Once you are at the customer's location, check in to proceed.</p>
          <button
            onClick={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-green text-white rounded-xl font-bold text-lg disabled:opacity-50"
          >
            {checkInMutation.isPending ? <Loader2 className="animate-spin" /> : 'Check In at Location'}
          </button>
        </div>
      );
    }

    // 3. Visit in progress (checked_in, inspecting, offer_made, negotiating)
    return <InspectionWorkspace lead={lead} onRefresh={refetch} />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-yellow" /></div>;
  }
  if (isError || !lead) {
    return <div className="text-center text-brand-red">Error loading lead details.</div>;
  }

  const isClaimed = lead.status !== 'booked';

  return (
    <div className="space-y-6">
      <Link to="/partner/leads/my" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-black">
        <ArrowLeft size={16} /> Back to My Leads
      </Link>
      
      {/* --- Header --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-brand-black">{lead.device_model.name}</h2>
            <p className="text-gray-500">{lead.lead_number}</p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <p className="text-sm text-gray-600">Est. Price</p>
            <p className="text-3xl font-bold text-brand-green">₹{lead.estimated_price}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm font-semibold text-brand-black">Status</p>
            <p className="capitalize">{lead.status_display}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-black">Preferred Date</p>
            <p>{lead.preferred_date} ({lead.preferred_time_slot})</p>
          </div>
        </div>
      </div>

      {/* --- Customer & Device Details --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-brand-black mb-4">Customer Details</h3>
          {!isClaimed ? (
            <p className="text-gray-500">Claim this lead to see customer details.</p>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-lg">{lead.user.name}</p>
              <p className="text-gray-600">{lead.user.phone}</p>
              <div className="flex items-start gap-2 mt-2">
                <MapPin size={16} className="text-gray-500 mt-1" />
                <p className="text-gray-600">
                  {lead.pickup_address.address_line1}, {lead.pickup_address.city}, {lead.pickup_address.state} - {lead.pickup_address.pincode}
                </p>
              </div>
              <a href={`tel:${lead.user.phone}`} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green/90 transition">
                <Phone size={16} /> Call Customer
              </a>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-brand-black mb-4">Device Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Storage:</strong> {lead.storage}</p>
            <p><strong>RAM:</strong> {lead.ram}</p>
            <p><strong>Color:</strong> {lead.color}</p>
            <p><strong>IMEI:</strong> {lead.imei_primary}</p>
          </div>
        </div>
      </div>
      
      {/* --- Main Action Card --- */}
      {renderActionCard()}
    </div>
  );
};

// --- Sub-Component for Inspection ---
const InspectionWorkspace: React.FC<{ lead: LeadDetails, onRefresh: () => void }> = ({ lead, onRefresh }) => {
  const visitId = lead.visit?.id;
  const toast = useToast();
//   const queryClient = useQueryClient(); // Added queryClient for invalidation
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  // Initialize price state with the estimated price
  const [price, setPrice] = useState(lead.estimated_price || '0'); 
  
  const { data: visitData, isLoading: isLoadingVisit } = useQuery({
    queryKey: ['visitDetails', visitId],
    queryFn: () => visitsService.getVisitDetails(visitId!), //
    enabled: !!visitId,
  });

  const { data: checklist, isLoading: isLoadingChecklist } = useQuery({
    queryKey: ['visitChecklist', visitId],
    queryFn: () => visitsService.getChecklist(visitId!), //
    enabled: !!visitData && visitData.status === 'inspecting', 
  });

  // --- MUTATIONS ---
  
  // FIX: Added the missing updateItemMutation
  const updateItemMutation = useMutation({
//     mutationFn: ({ itemId, payload }: {  itemId: string, payload: VisitChecklistUpdatePayload }) => 
//       visitsService.updateChecklistItem(visitId!, itemId, payload),
//     onSuccess: () => {
//       // Invalidate the checklist query to force a refetch and update the UI
//       queryClient.invalidateQueries({ queryKey: ['visitChecklist', visitId] }); 
//       toast.success("Checklist updated.");
//     },
//     onError: (error: any) => toast.error(handleApiError(error)),
  
  });


  const verifyCodeMutation = useMutation({
    mutationFn: () => visitsService.verifyVisitCode(visitId!, code), //
    onSuccess: () => {
      toast.success("Code Verified!");
      onRefresh(); 
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });

  const startInspectionMutation = useMutation({
    mutationFn: () => visitsService.startInspection(visitId!), //
    onSuccess: () => {
      toast.success("Inspection Started. Checklist loading...");
      onRefresh(); 
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });
  
  const completeInspectionMutation = useMutation({
    mutationFn: () => visitsService.completeInspection(visitId!, { //
      inspection_notes: notes,
      partner_recommended_price: price, // Ensure price is a string
    }),
    onSuccess: () => {
      // Refresh lead details (status will change to inspection_completed)
      onRefresh(); 
      toast.success("Inspection Complete! Ready for final offer.");
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });
  
  const makeOfferMutation = useMutation({
    mutationFn: () => leadsService.createOffer({ //
      lead: lead.id,
      partner_offered_price: price, // Ensure price is a string
      message: notes || "Based on inspection, here is the final offer."
    }),
    onSuccess: () => {
      onRefresh();
      toast.success("Offer Sent to Customer!");
    },
    onError: (error: any) => toast.error(handleApiError(error)),
  });

  if (isLoadingVisit) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-yellow" /></div>;
  }
  if (!visitData) {
    return <div className="text-center text-brand-red">Could not load visit details. Refresh and try again.</div>;
  }

  // --- Visit State Machine ---
  
  // 1. Not Verified
  if (!visitData.is_code_verified) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); verifyCodeMutation.mutate(); }} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-brand-black">Verify Customer Code</h3>
        <p className="text-gray-600">Ask the customer for their 4-digit verification code to start the inspection.</p>
        <input
          type="tel"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          maxLength={4}
          className="w-full p-3 border-2 border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em]"
          placeholder="••••"
        />
        <button
          type="submit"
          disabled={verifyCodeMutation.isPending || code.length < 4}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-bold text-lg disabled:opacity-50 transition"
        >
          {verifyCodeMutation.isPending ? <Loader2 className="animate-spin" /> : 'Verify Code'}
        </button>
      </form>
    );
  }
  
  // 2. Verified, but not inspecting (and not finished/offered)
  if (visitData.is_code_verified && visitData.status === 'arrived') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 text-center">
         <CheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4" />
         <h3 className="text-xl font-semibold text-brand-black">Code Verified!</h3>
         <p className="text-gray-600 mb-4">You are clear to inspect the device.</p>
         <button
          onClick={() => startInspectionMutation.mutate()}
          disabled={startInspectionMutation.isPending}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-bold text-lg disabled:opacity-50 transition"
         >
           {startInspectionMutation.isPending ? <Loader2 className="animate-spin" /> : 'Start Inspection'}
         </button>
      </div>
    );
  }
  
  // 3. Offer is made and pending (Redirect to read-only status)
  if (lead.status === 'offer_made' || lead.status === 'negotiating' || lead.status === 'accepted') {
    return (
       <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 text-center border-l-4 border-brand-green">
         <CheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4" />
         <h3 className="text-xl font-semibold text-brand-black">Status: {lead.status_display}</h3>
         <p className="text-gray-600 mb-4">Your final price: <strong className="text-brand-black">₹{lead.final_price || lead.estimated_price}</strong></p>
         <p className="text-gray-600">Waiting for customer response or further action.</p>
      </div>
    );
  }

  // 4. Inspection is Complete, ready to make offer 
  if (visitData.status === 'inspection_completed') {
    return (
      <form onSubmit={(e) => { e.preventDefault(); makeOfferMutation.mutate(); }} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-brand-black">Make Final Offer</h3>
        <p className="text-sm text-gray-600">Review notes and propose your final price to the customer.</p>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-xl"
          min="0"
        />
         <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for your offer (e.g., 'Battery health at 82%')"
          className="w-full p-3 border-2 border-gray-200 rounded-xl"
        />
        <button
          type="submit"
          disabled={makeOfferMutation.isPending}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-green text-white rounded-xl font-bold text-lg disabled:opacity-50 transition"
        >
          {makeOfferMutation.isPending ? <Loader2 className="animate-spin" /> : 'Send Offer to Customer'}
        </button>
      </form>
    );
  }
  
  // 5. Currently Inspecting (visitData.status === 'inspecting')
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
      <h3 className="text-xl font-semibold text-brand-black">Device Inspection Checklist</h3>
      {isLoadingChecklist ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {checklist?.map(item => (
            <div key={item.id} className="p-3 bg-brand-gray-light/50 rounded-lg">
              <p className="font-semibold">{item.question}</p>
              <div className="flex gap-2 mt-2">
                <button
                  // FIX: Call the defined updateItemMutation
//                   onClick={() => updateItemMutation.mutate({ itemId: item.id, payload: { status: 'pass', notes: 'OK' }})}
                  disabled={updateItemMutation.isPending}
                  className={`px-3 py-1 rounded-full text-sm ${item.status === 'pass' ? 'bg-brand-green text-white' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                >Pass</button>
                <button
                  // FIX: Call the defined updateItemMutation
//                   onClick={() => updateItemMutation.mutate({ itemId: item.id, payload: { status: 'fail', notes: 'Issue found' }})}
                  disabled={updateItemMutation.isPending}
                  className={`px-3 py-1 rounded-full text-sm ${item.status === 'fail' ? 'bg-brand-red text-white' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                >Fail</button>
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
          className="w-full p-3 border-2 border-gray-200 rounded-xl"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Recommended Price"
          className="w-full p-3 border-2 border-gray-200 rounded-xl"
          min="0"
        />
        <button
          onClick={() => completeInspectionMutation.mutate()}
          disabled={completeInspectionMutation.isPending || isLoadingChecklist}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-bold text-lg disabled:opacity-50 transition"
        >
          {completeInspectionMutation.isPending ? <Loader2 className="animate-spin" /> : 'Complete Inspection'}
        </button>
      </div>
    </div>
  );
};