// src/components/partner/PartnerLeadDetailPage.tsx
// Complete Partner Lead Detail with Chat, Disputes & ASSIGN AGENT functionality
// Follows backend API structure exactly - uses correct field names (line1, line2, postal_code)

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, AlertTriangle, X, Wallet, MapPin, User, CheckCircle,
  Tag, MessageSquare, Activity, Phone, Clock, Navigation, Eye, EyeOff,
  Smartphone, DollarSign, Send, Play,  ChevronRight,
  UserPlus, Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import PartnerLeadChat from '../../components/leads/PartnerLeadChat';
import PartnerRaiseDisputeModal from '../../components/dispute/PartnerRaiseDisputeModal';
import PartnerLeadDisputesSection from '../../components/leads/PartnerLeadDisputesSection';
import LeadStatusHistory from '../../components/leads/LeadStatusHistory';
import { useAuthStore } from '../../stores/authStore';

// Import Agent Assignment Modal
import AssignAgentModal from '../../components/partner/agents/AssignAgentModal';
// import LeadTransactionsView from '../../pages/partner/LeadTransactionsView';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// FlipCash Color Theme
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
//   greyLight: '#F5F5F5'
// };

// ============ Interfaces ============
interface LeadUser {
  id: string;
  phone: string;
  name: string;
  email: string;
}

interface DeviceModel {
  id: string;
  name: string;
  brand_name?: string;
}

interface PickupAddress {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
}

interface AssignedPartner {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
}

interface AssignedAgent {
  id: string;
  name: string;
  phone: string;
  employee_id?: string;
  status: string;
}

interface LeadOffer {
  id: string;
  lead: string;
  lead_number: string;
  partner: string;
  partner_name: string;
  system_calculated_price: string;
  partner_offered_price: string;
  price_deviation_percentage: string;
  partner_notes: string;
  inspection_findings: string;
  inspection_photos: string[];
  status: string;
  status_display: string;
  customer_response: string;
  is_expired: boolean;
  created_at: string;
  expires_at: string;
  responded_at: string | null;
}

interface LeadDetail {
  id: string;
  lead_number: string;
  user: LeadUser;
  device_model: DeviceModel | null;
  brand_name: string;
  storage: string;
  ram: string;
  color: string;
  imei_primary: string;
  condition_responses: Record<string, any>;
  device_photos: { url: string; description: string }[];
  estimated_price: string;
  quoted_price: string | null;
  final_price: string | null;
  status: string;
  status_display: string;
  assigned_partner: AssignedPartner | null;
  assigned_agent?: AssignedAgent | null;
  pickup_address: PickupAddress;
  preferred_date: string;
  preferred_time_slot: string;
  customer_notes: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
  offers_count: number;
  unread_messages_count: number;
}

interface VisitDetails {
  id: string;
  visit_number: string;
  verification_code: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

interface WalletInfo {
  current_balance: string;
  blocked_amount: string;
  available_balance: string;
}

// ============ Status Colors ============
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'booked': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'partner_assigned': { bg: 'bg-[#FEC925]/20', text: 'text-[#b48f00]', border: 'border-[#FEC925]' },
  'en_route': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'checked_in': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'inspecting': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'offer_made': { bg: 'bg-[#FEC925]/30', text: 'text-[#b48f00]', border: 'border-[#FEC925]' },
  'negotiating': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'accepted': { bg: 'bg-[#1B8A05]/20', text: 'text-[#1B8A05]', border: 'border-[#1B8A05]' },
  'payment_processing': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  'completed': { bg: 'bg-[#1B8A05]/30', text: 'text-[#1B8A05]', border: 'border-[#1B8A05]' },
  'cancelled': { bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', border: 'border-[#FF0000]' },
  'disputed': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'expired': { bg: 'bg-gray-200', text: 'text-gray-600', border: 'border-gray-300' }
};

// ============ Lead Status Constants ============
const LeadStatus = {
  BOOKED: 'booked',
  PARTNER_ASSIGNED: 'partner_assigned',
  EN_ROUTE: 'en_route',
  CHECKED_IN: 'checked_in',
  INSPECTING: 'inspecting',
  OFFER_MADE: 'offer_made',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  PAYMENT_PROCESSING: 'payment_processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  EXPIRED: 'expired'
};

// ============ Main Component ============
export const PartnerLeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();

  // State
  const [leadDetails, setLeadDetails] = useState<LeadDetail | null>(null);
  const [visitDetails, setVisitDetails] = useState<VisitDetails | null>(null);
  const [offers, setOffers] = useState<LeadOffer[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  
  // Claim modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  
  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  
  // Make offer state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [inspectionFindings, setInspectionFindings] = useState('');

  // Assign Agent modal state
  const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false);

  // ============ Load Data ============
  useEffect(() => {
    if (!leadId) {
      setError("No lead ID provided");
      setLoading(false);
      return;
    }
    loadLeadDetails(leadId);
  }, [leadId]);

  const loadLeadDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error("Authentication required");

      // Try main leads endpoint first (works for claimed leads)
      let res = await fetch(`${API_BASE_URL}/leads/leads/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // If main endpoint fails, try partner leads endpoint (for unclaimed leads)
      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_BASE_URL}/leads/partner/leads/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      

      if (!res.ok) {
        if (res.status === 404) throw new Error("Lead not found");
        if (res.status === 403) throw new Error("You don't have access to this lead");
        throw new Error("Failed to load lead details");
      }

      const data: LeadDetail = await res.json();
      console.log('Partner Lead Details:', data);
      setLeadDetails(data);
      
      // Load related data
      loadOffers(id);
      loadWalletInfo();
      
      // Load visit if assigned
      if (data.status !== LeadStatus.BOOKED) {
        loadVisitDetails(id);
      }
      
    } catch (err: any) {
      console.error('Failed to load lead:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async (id: string) => {
    try {
      setLoadingOffers(true);
      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/leads/offers/?lead=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setOffers(data.results || data || []);
      }
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const loadVisitDetails = async (leadId: string) => {
    try {
      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/visits/visits/?lead=${leadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const visits = data.results || data || [];
        if (visits.length > 0) {
          setVisitDetails(visits[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load visit:', err);
    }
  };

  const loadWalletInfo = async () => {
    try {
      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/finance/partner/wallet/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setWalletInfo(data);
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    }
  };

  // ============ Actions ============
  const handleClaimLead = async () => {
    if (!leadDetails) return;
    
    try {
      setClaimLoading(true);
      setError(null);
      
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/leads/partner/leads/${leadDetails.id}/claim/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || 'Failed to claim lead');
      }

      const data = await res.json();
      console.log('✅ Lead claimed:', data);
      
      // Store verification code
      if (data.verification_code) {
        setVisitDetails(prev => prev ? { ...prev, verification_code: data.verification_code } : {
          id: data.visit_id,
          visit_number: data.visit_number,
          verification_code: data.verification_code,
          status: 'assigned',
          check_in_time: null,
          check_out_time: null
        });
      }
      
      // Update wallet
      if (data.wallet_info) {
        setWalletInfo(data.wallet_info);
      }
      
      setIsClaimModalOpen(false);
      loadLeadDetails(leadDetails.id);
      
    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message);
    } finally {
      setClaimLoading(false);
    }
  };





  // const handleStartVisit = async () => {
  //   if (!leadDetails || !visitDetails) return;
    
  //   try {
  //     setActionLoading(true);
  //     setError(null);
      
  //     const token = useAuthStore.getState().accessToken;
  //     if (!token) throw new Error('Authentication required');

  //     const res = await fetch(`${API_BASE_URL}/visits/visits/${visitDetails.id}/start_journey/`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (!res.ok) {
  //       const err = await res.json().catch(() => ({}));
  //       throw new Error(err.detail || err.error || 'Failed to start journey');
  //     }

  //     loadLeadDetails(leadDetails.id);
      
  //   } catch (err: any) {
  //     console.error('Start journey error:', err);
  //     setError(err.message);
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };





  const handleCheckIn = async () => {
    if (!leadDetails || !visitDetails) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/visits/visits/${visitDetails.id}/check_in/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || 'Failed to check in');
      }

      loadLeadDetails(leadDetails.id);
      
    } catch (err: any) {
      console.error('Check in error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartInspection = async () => {
    if (!leadDetails || !visitDetails) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/visits/visits/${visitDetails.id}/start_inspection/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || 'Failed to start inspection');
      }

      loadLeadDetails(leadDetails.id);
      
    } catch (err: any) {
      console.error('Start inspection error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!leadDetails || !offerPrice) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('Authentication required');

      const payload = {
        lead: leadDetails.id,
        partner_offered_price: parseFloat(offerPrice),
        partner_notes: offerNotes.trim(),
        inspection_findings: inspectionFindings.trim()
      };

      const res = await fetch(`${API_BASE_URL}/leads/offers/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || 'Failed to make offer');
      }

      setIsOfferModalOpen(false);
      setOfferPrice('');
      setOfferNotes('');
      setInspectionFindings('');
      
      loadLeadDetails(leadDetails.id);
      loadOffers(leadDetails.id);
      
    } catch (err: any) {
      console.error('Make offer error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ============ Helper Functions ============ accept
  const formatCurrency = (value: string | number | null): string => {
    if (!value) return '₹0';
    return `₹${parseFloat(value.toString()).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceName = (lead: LeadDetail): string => {
    if (lead.device_model?.name) {
      return `${lead.brand_name} ${lead.device_model.name}`;
    }
    return lead.brand_name || 'Unknown Device';
  };

  const formatAddress = (address: PickupAddress | null): string => {
    if (!address) return 'Address not available';
    const parts = [address.line1];
    if (address.line2) parts.push(address.line2);
    if (address.landmark) parts.push(`Near ${address.landmark}`);
    parts.push(`${address.city}, ${address.state} - ${address.postal_code}`);
    return parts.join(', ');
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || STATUS_COLORS['booked'];
  };

  const isLeadClaimed = leadDetails?.status !== LeadStatus.BOOKED;
  
  // Check if lead can have agent assigned
  const canAssignAgent = isLeadClaimed && 
    !leadDetails?.assigned_agent &&
    !['completed', 'cancelled', 'expired'].includes(leadDetails?.status || '');

  // ============ Loading State ============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5F5] via-white to-[#F0F7F6]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="animate-spin text-[#FEC925] mx-auto mb-4" size={64} />
          <p className="text-[#1C1C1B] text-xl font-semibold">Loading Lead Details...</p>
        </motion.div>
      </div>
    );
  }

  // ============ Error State ============
  if (!leadDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5F5] via-white to-[#F0F7F6] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <AlertTriangle className="text-[#FF0000] mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-[#1C1C1B] mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Lead not found'}</p>
          <button
            onClick={() => navigate('/partner/leads/all')}
            className="px-6 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold hover:bg-[#e5b520]"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(leadDetails.status);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-white to-[#F0F7F6] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button 
            onClick={() => navigate('/partner/leads/all')} 
            className="flex items-center gap-2 text-[#1C1C1B] hover:text-[#FEC925] transition font-semibold"
          >
            <ArrowLeft size={24} />
            Back to Leads
          </button>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-[#FF0000]" size={24} />
                <p className="font-semibold text-[#1C1C1B]">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-[#FF0000]">
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ Header Section ============ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-[#1C1C1B]">
                    Lead #{leadDetails.lead_number}
                  </h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors.bg} ${statusColors.text}`}>
                    {leadDetails.status_display}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">
                  {getDeviceName(leadDetails)} • {leadDetails.storage} • {leadDetails.color}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {formatDate(leadDetails.created_at)}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Claim Button - Only for unclaimed leads */}
                {leadDetails.status === LeadStatus.BOOKED && (
                  <button 
                    onClick={() => setIsClaimModalOpen(true)}
                    className="px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle size={20} />
                    Claim This Lead
                  </button>
                )}

                {/* Assign Agent Button */}
                {canAssignAgent && (
                  <button 
                    onClick={() => setIsAssignAgentModalOpen(true)}
                    className="px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center gap-2 shadow-lg"
                  >
                    <UserPlus size={20} />
                    Assign Agent
                  </button>
                )}

                {/* Start Journey Button */}
                {/* {leadDetails.status === LeadStatus.PARTNER_ASSIGNED && !leadDetails.assigned_agent && (
                  <button 
                    onClick={handleStartVisit}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold hover:bg-[#e5b520] transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                    Start Journey
                  </button>
                )} */}

                {/* Check In Button */}
                {leadDetails.status === LeadStatus.EN_ROUTE && (
                  <button 
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
                    Check In
                  </button>
                )}

                {/* Start Inspection Button */}
                {leadDetails.status === LeadStatus.CHECKED_IN && (
                  <button 
                    onClick={handleStartInspection}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold hover:bg-[#e5b520] transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Eye size={20} />}
                    Start Inspection
                  </button>
                )}

                {/* Make Offer Button */}
                {leadDetails.status === LeadStatus.INSPECTING && (
                  <button 
                    onClick={() => setIsOfferModalOpen(true)}
                    className="px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center gap-2"
                  >
                    <DollarSign size={20} />
                    Make Offer
                  </button>
                )}

                {/* Report Issue Button */}
                {isLeadClaimed && !['cancelled', 'completed'].includes(leadDetails.status) && (
                  <button 
                    onClick={() => setIsDisputeModalOpen(true)}
                    className="px-4 py-2 bg-[#FF0000]/10 text-[#FF0000] rounded-lg font-bold hover:bg-[#FF0000] hover:text-white transition flex items-center gap-2"
                  >
                    <AlertTriangle size={16} />
                    Report Issue
                  </button>
                )}
              </div>
            </div>

            {/* Assigned Agent Info Display */}
            {leadDetails.assigned_agent && (
              <div className="mt-6 p-4 bg-[#1B8A05]/10 border-2 border-[#1B8A05] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1B8A05]/20 rounded-full flex items-center justify-center">
                      <Users className="text-[#1B8A05]" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Assigned Agent</p>
                      <p className="text-lg font-bold text-[#1C1C1B]">{leadDetails.assigned_agent.name}</p>
                      <p className="text-sm text-gray-600">{leadDetails.assigned_agent.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      leadDetails.assigned_agent.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {leadDetails.assigned_agent.status}
                    </span>
                    {leadDetails.assigned_agent.employee_id && (
                      <p className="text-xs text-gray-500 mt-1">ID: {leadDetails.assigned_agent.employee_id}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Code Display */}
            {visitDetails?.verification_code && isLeadClaimed && (
              <div className="mt-6 p-4 bg-[#FEC925]/10 border-2 border-[#FEC925] rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Customer Verification Code</p>
                    <p className="text-3xl font-bold tracking-widest text-[#1C1C1B]">
                      {visitDetails.verification_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ask customer for this code to verify pickup</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ============ Wallet Info Banner ============ */}
        {walletInfo && isLeadClaimed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-[#1C1C1B] to-[#333] p-6 rounded-2xl mb-8 text-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="text-[#FEC925]" size={28} />
                <div>
                  <p className="text-sm text-gray-300">Your Wallet Balance</p>
                  <p className="text-2xl font-bold text-[#FEC925]">{formatCurrency(walletInfo.current_balance)}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-400">Blocked</p>
                  <p className="font-bold text-[#FF0000]">{formatCurrency(walletInfo.blocked_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Available</p>
                  <p className="font-bold text-[#1B8A05]">{formatCurrency(walletInfo.available_balance)}</p>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}

        {/* ============ Offers Section ============ */}
        {(loadingOffers || offers.length > 0 || [LeadStatus.OFFER_MADE, LeadStatus.NEGOTIATING].includes(leadDetails.status as any)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-[#FEC925]/20 to-[#1B8A05]/20 p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#FEC925] rounded-full flex items-center justify-center">
                  <DollarSign className="text-[#1C1C1B]" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1C1C1B]">Your Offers</h3>
                  <p className="text-gray-600">Track customer responses</p>
                </div>
              </div>

              {loadingOffers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-[#FEC925]" size={32} />
                </div>
              ) : offers.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center">
                  <Clock className="text-gray-300 mx-auto mb-3" size={48} />
                  <p className="text-gray-600 font-semibold">No offers made yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete device inspection to make an offer
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer, index) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-[#1C1C1B]">Your Offer</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              offer.status === 'pending' ? 'bg-[#FEC925]/20 text-[#b48f00]' :
                              offer.status === 'accepted' ? 'bg-[#1B8A05]/20 text-[#1B8A05]' :
                              offer.status === 'rejected' ? 'bg-[#FF0000]/10 text-[#FF0000]' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {offer.status_display}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">System Price</p>
                              <p className="text-xl font-bold text-gray-800">{formatCurrency(offer.system_calculated_price)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Your Offer</p>
                              <p className="text-xl font-bold text-[#FEC925]">{formatCurrency(offer.partner_offered_price)}</p>
                            </div>
                          </div>

                          {offer.partner_notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Your Notes:</p>
                              <p className="text-sm text-gray-600 italic">"{offer.partner_notes}"</p>
                            </div>
                          )}

                          {offer.customer_response && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Customer Response:</p>
                              <p className="text-sm text-gray-600">"{offer.customer_response}"</p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500">
                            Offered: {formatDate(offer.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ============ Main Grid ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ============ Left Column ============ */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Customer Details - Only visible after claim */}
            {isLeadClaimed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#1B8A05]/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <User className="text-[#1B8A05]" size={24} />
                    <h3 className="text-2xl font-bold text-[#1C1C1B]">Customer Details</h3>
                  </div>
                  <button
                    onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    {showCustomerDetails ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {showCustomerDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-600">Name</span>
                      <span className="font-bold text-[#1C1C1B]">{leadDetails.user.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-600">Phone</span>
                      <a 
                        href={`tel:${leadDetails.user.phone}`}
                        className="font-bold text-[#1B8A05] hover:underline flex items-center gap-2"
                      >
                        <Phone size={16} />
                        {leadDetails.user.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="font-semibold text-gray-600">Email</span>
                      <span className="font-bold text-[#1C1C1B]">{leadDetails.user.email || 'Not provided'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <EyeOff className="text-gray-300 mx-auto mb-2" size={32} />
                    <p className="text-gray-500">Click the eye icon to reveal customer details</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Device Details */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
              <div className="flex items-center gap-3 mb-6">
                <Smartphone className="text-[#FEC925]" size={24} />
                <h3 className="text-2xl font-bold text-[#1C1C1B]">Device Details</h3>
              </div>
              <div className="space-y-3">
                <DetailRow label="Device" value={getDeviceName(leadDetails)} />
                <DetailRow label="Storage" value={leadDetails.storage} />
                <DetailRow label="RAM" value={leadDetails.ram} />
                <DetailRow label="Color" value={leadDetails.color} />
                <DetailRow label="IMEI" value={leadDetails.imei_primary || 'Not provided'} />
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-[#FEC925]" size={24} />
                <h3 className="text-2xl font-bold text-[#1C1C1B]">Price Details</h3>
              </div>
              <div className="space-y-3">
                <DetailRow label="Estimated Price" value={formatCurrency(leadDetails.estimated_price)} highlight />
                <DetailRow label="Quoted Price" value={leadDetails.quoted_price ? formatCurrency(leadDetails.quoted_price) : 'Pending'} />
                <DetailRow label="Final Price" value={leadDetails.final_price ? formatCurrency(leadDetails.final_price) : 'Pending'} />
              </div>
            </div>

            {/* Pickup Details */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-[#FEC925]" size={24} />
                <h3 className="text-2xl font-bold text-[#1C1C1B]">Pickup Details</h3>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-lg">{leadDetails.pickup_address?.line1 || 'Address line 1'}</p>
                {leadDetails.pickup_address?.line2 && (
                  <p className="text-gray-700">{leadDetails.pickup_address.line2}</p>
                )}
                {leadDetails.pickup_address?.landmark && (
                  <p className="text-sm text-gray-600">Landmark: {leadDetails.pickup_address.landmark}</p>
                )}
                <p className="font-semibold">
                  {leadDetails.pickup_address?.city}, {leadDetails.pickup_address?.state} - {leadDetails.pickup_address?.postal_code}
                </p>
                <div className="border-t pt-4 mt-4 space-y-3">
                  <DetailRow 
                    label="Preferred Date" 
                    value={new Date(leadDetails.preferred_date).toLocaleDateString('en-IN', { 
                      weekday: 'long', day: 'numeric', month: 'long' 
                    })} 
                  />
                  <DetailRow label="Time Slot" value={leadDetails.preferred_time_slot} />
                </div>
                {leadDetails.customer_notes && (
                  <div className="bg-[#F0F7F6] p-3 rounded-lg border border-[#1B8A05]/20 mt-4">
                    <p className="font-semibold text-gray-800">Customer Notes:</p>
                    <p className="text-gray-700 italic">"{leadDetails.customer_notes}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Condition Report */}
            {Object.keys(leadDetails.condition_responses).length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="text-[#FEC925]" size={24} />
                  <h3 className="text-2xl font-bold text-[#1C1C1B]">Condition Report</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(leadDetails.condition_responses).map(([key, value]) => (
                    <DetailRow 
                      key={key} 
                      label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                      value={Array.isArray(value) ? value.join(', ') : String(value)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Device Photos */}
            {leadDetails.device_photos?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
                <div className="flex items-center gap-3 mb-6">
                  <Tag className="text-[#FEC925]" size={24} />
                  <h3 className="text-2xl font-bold text-[#1C1C1B]">Device Photos</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {leadDetails.device_photos.map((photo, idx) => (
                    <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="group">
                      <img 
                        src={photo.url} 
                        alt={photo.description || `Device ${idx + 1}`} 
                        className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#FEC925] transition"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disputes */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-[#FEC925]" size={24} />
                <h3 className="text-2xl font-bold text-[#1C1C1B]">Disputes & Issues</h3>
              </div>
              <PartnerLeadDisputesSection leadId={leadDetails.id} />
            </div>
          </div>

          {/* ============ Right Column ============ */}
          <div className="space-y-8">
            
            {/* Chat - Only after claim */}
            {isLeadClaimed && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="text-[#FEC925]" size={24} />
                  <h3 className="text-2xl font-bold text-[#1C1C1B]">Live Chat</h3>
                </div>
                <PartnerLeadChat 
                  leadId={leadDetails.id}
                  leadClaimed={isLeadClaimed}
                  customerName={leadDetails.user.name}
                />
              </div>
            )}

            {/* Status History */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-[#FEC925]" size={24} />
                <h3 className="text-2xl font-bold text-[#1C1C1B]">Lead History</h3>
              </div>
              <LeadStatusHistory leadId={leadDetails.id} />
            </div>

            {/* Quick Actions */}
            {isLeadClaimed && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FEC925]/20">
                <div className="flex items-center gap-3 mb-6">
                  <Play className="text-[#FEC925]" size={24} />
                  <h3 className="text-2xl font-bold text-[#1C1C1B]">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <a 
                    href={`tel:${leadDetails.user.phone}`}
                    className="flex items-center justify-between p-4 bg-[#1B8A05]/10 rounded-xl hover:bg-[#1B8A05]/20 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="text-[#1B8A05]" size={20} />
                      <span className="font-semibold text-[#1C1C1B]">Call Customer</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </a>
                  
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(leadDetails.pickup_address))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-[#FEC925]/10 rounded-xl hover:bg-[#FEC925]/20 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Navigation className="text-[#FEC925]" size={20} />
                      <span className="font-semibold text-[#1C1C1B]">Navigate to Address</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </a>

                  {/* Assign Agent Quick Action */}
                  {canAssignAgent && (
                    <button
                      onClick={() => setIsAssignAgentModalOpen(true)}
                      className="w-full flex items-center justify-between p-4 bg-[#1B8A05]/10 rounded-xl hover:bg-[#1B8A05]/20 transition"
                    >
                      <div className="flex items-center gap-3">
                        <UserPlus className="text-[#1B8A05]" size={20} />
                        <span className="font-semibold text-[#1C1C1B]">Assign to Agent</span>
                      </div>
                      <ChevronRight className="text-gray-400" size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ Modals ============ */}
      
      {/* Claim Confirmation Modal */}
      <AnimatePresence>
        {isClaimModalOpen && leadDetails && walletInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="p-6 border-b-2 border-[#FEC925]/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#1C1C1B]">Confirm Claim</h3>
                  <button 
                    onClick={() => setIsClaimModalOpen(false)}
                    disabled={claimLoading}
                    className="text-gray-400 hover:text-[#FF0000] transition"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-[#FEC925]/10 p-4 rounded-xl border-2 border-[#FEC925]">
                  <h4 className="font-bold text-[#1C1C1B] mb-3">Wallet Deduction</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Claim Fee (Non-refundable)</span>
                      <span className="font-bold">₹50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blocked Amount (Refundable)</span>
                      <span className="font-bold">{formatCurrency(leadDetails.estimated_price)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                      <span className="font-bold text-[#1C1C1B]">Total</span>
                      <span className="font-bold text-[#1C1C1B]">
                        {formatCurrency(50 + parseFloat(leadDetails.estimated_price))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-bold text-[#1C1C1B] mb-2">Your Wallet</h4>
                  <p className="text-2xl font-bold text-[#1B8A05]">{formatCurrency(walletInfo.available_balance)}</p>
                  <p className="text-xs text-gray-500">Available Balance</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">⚠️ Important</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ₹50 claim fee is non-refundable</li>
                    <li>• Blocked amount will be released upon completion</li>
                    <li>• You'll receive a verification code after claiming</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t-2 border-gray-200 flex gap-3">
                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  disabled={claimLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaimLead}
                  disabled={claimLoading || parseFloat(walletInfo.available_balance) < (50 + parseFloat(leadDetails.estimated_price))}
                  className="flex-1 px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {claimLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Claim
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead Transactions View */}
      {/* <LeadTransactionsView 
        leadId={leadId}
        // leadNumber="LEAD-001"  // Optional
      /> */}

      {/* Make Offer Modal */}
      <AnimatePresence>
        {isOfferModalOpen && leadDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="p-6 border-b-2 border-[#FEC925]/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#1C1C1B]">Make Offer</h3>
                  <button 
                    onClick={() => setIsOfferModalOpen(false)}
                    disabled={actionLoading}
                    className="text-gray-400 hover:text-[#FF0000] transition"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Estimated Price</p>
                  <p className="text-2xl font-bold text-[#1C1C1B]">{formatCurrency(leadDetails.estimated_price)}</p>
                </div>

                <div>
                  <label className="block font-bold text-[#1C1C1B] mb-2">Your Offer Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="Enter your offer"
                      disabled={actionLoading}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none font-bold text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1C1C1B] mb-2">Inspection Findings</label>
                  <textarea
                    value={inspectionFindings}
                    onChange={(e) => setInspectionFindings(e.target.value)}
                    placeholder="Describe device condition, any issues found..."
                    disabled={actionLoading}
                    rows={3}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1C1C1B] mb-2">Notes for Customer (Optional)</label>
                  <textarea
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    disabled={actionLoading}
                    rows={2}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t-2 border-gray-200 flex gap-3">
                <button
                  onClick={() => setIsOfferModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMakeOffer}
                  disabled={actionLoading || !offerPrice}
                  className="flex-1 px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Send size={20} />
                      Send Offer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Agent Modal */}
      {leadDetails && (
        <AssignAgentModal
          isOpen={isAssignAgentModalOpen}
          onClose={() => setIsAssignAgentModalOpen(false)}
          leadId={leadDetails.id}
          leadNumber={leadDetails.lead_number}
          deviceName={getDeviceName(leadDetails)}
          onSuccess={() => {
            setIsAssignAgentModalOpen(false);
            loadLeadDetails(leadDetails.id);
          }}
        />
      )}

      {/* Dispute Modal */}
      {leadDetails && (
        <PartnerRaiseDisputeModal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          leadId={leadDetails.id}
          leadNumber={leadDetails.lead_number}
          onSuccess={() => {
            loadLeadDetails(leadDetails.id);
            setIsDisputeModalOpen(false);
          }}
        />
      )}
    </section>
  );
};

// ============ Helper Components ============
interface DetailRowProps {
  label: string;
  value: string | number | null;
  highlight?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="font-semibold text-gray-600">{label}:</span>
    <span className={`font-bold text-right ${highlight ? 'text-[#1B8A05] text-lg' : 'text-[#1C1C1B]'}`}>
      {value || 'N/A'}
    </span>
  </div>
);

export default PartnerLeadDetailPage;