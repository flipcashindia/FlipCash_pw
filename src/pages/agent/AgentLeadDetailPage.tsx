// src/pages/agent/AgentLeadDetailPage.tsx
// Agent Lead Detail - Full workflow management for a single lead

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Clock,
  IndianRupee,
  User,
  Package,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  MapPinned,
  KeyRound,
  ClipboardCheck,
  BadgeCheck,
  Camera,
  Smartphone,
  Fingerprint,
  Wifi,
  Bluetooth,
  Volume2,
  Mic,
  Zap,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  useAgentAssignment,
  useAcceptAssignment,
  useRejectAssignment,
  useStartJourney,
  useCheckIn,
  useVerifyCode,
  useStartInspection,
  useSubmitInspection,
  useCalculatePrice,
  useCompleteDeal,
  useCurrentLocation,
} from '../../hooks/useAgentApp';
import type { DeviceInspectionData } from '../../api/types/agentApp.types';
import VerificationCodeEntry from '../../components/agent/VerificationCodeEntry';
import DealCompletion from '../../components/agent/DealCompletion';
import DeviceImageCapture from '../../components/agent/DeviceImageCapture';

const AgentLeadDetailPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  
  const { data: assignment, isLoading, error, refetch } = useAgentAssignment(assignmentId || '');
  
  // Mutations
  const acceptMutation = useAcceptAssignment();
  const rejectMutation = useRejectAssignment();
  const startJourneyMutation = useStartJourney();
  const checkInMutation = useCheckIn();
  const verifyCodeMutation = useVerifyCode();
  const startInspectionMutation = useStartInspection();
  const submitInspectionMutation = useSubmitInspection();
  const calculatePriceMutation = useCalculatePrice();
  const completeDealMutation = useCompleteDeal();
  const { getCurrentLocation } = useCurrentLocation();

  // State for modals/forms
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyCodeModal, setShowVerifyCodeModal] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showPriceReview, setShowPriceReview] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  const [rejectReason, setRejectReason] = useState('');
  const [_verificationCode, setVerificationCode] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Inspection data state
  const [inspectionData, setInspectionData] = useState<Partial<DeviceInspectionData>>({
    screen_condition: 'good',
    body_condition: 'good',
    power_on: true,
    touch_working: true,
    display_working: true,
    speakers_working: true,
    microphone_working: true,
    cameras_working: true,
    buttons_working: true,
    charging_port_working: true,
    wifi_working: true,
    bluetooth_working: true,
    sim_slot_working: true,
    fingerprint_working: null,
    face_id_working: null,
    imei_verified: false,
    imei_number: '',
    storage_verified: false,
    actual_storage: '',
    battery_health: null,
    has_box: false,
    has_charger: false,
    has_earphones: false,
    has_bill: false,
    notes: '',
    // Image fields
    front_image: undefined,
    back_image: undefined,
    screen_image: undefined,
    imei_image: undefined,
    defect_images: [],
  });

  // Price calculation state
  const [calculatedPrice, setCalculatedPrice] = useState<{
    original_price: number;
    calculated_price: number;
    deductions: Array<{ reason: string; amount: number }>;
  } | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number>(0);

  // Complete deal state
  // const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');

  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => setActionSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  // Action handlers
  const handleAccept = async () => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      await acceptMutation.mutateAsync(assignmentId);
      setActionSuccess('Lead accepted! You can now start your journey.');
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept lead');
    }
  };

  const handleReject = async () => {
    if (!assignmentId || !rejectReason.trim()) return;
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({ assignmentId, reason: rejectReason });
      setActionSuccess('Lead rejected');
      setShowRejectModal(false);
      navigate('/agent/leads');
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject lead');
    }
  };

  const handleStartJourney = async () => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      await startJourneyMutation.mutateAsync(assignmentId);
      setActionSuccess('Journey started! Drive safely.');
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to start journey');
    }
  };

  const handleCheckIn = async () => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      const position = await getCurrentLocation();
      await checkInMutation.mutateAsync({
        assignmentId,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          notes: '',
        },
      });
      setActionSuccess('Checked in successfully! Now verify with customer code.');
      setShowVerifyCodeModal(true);
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to check in. Make sure location is enabled.');
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!assignmentId || code.length !== 6) return;
    setActionError(null);
    try {
      await verifyCodeMutation.mutateAsync({ assignmentId, code });
      setActionSuccess('Code verified! You can now start inspection.');
      setShowVerifyCodeModal(false);
      setVerificationCode('');
      refetch();
    } catch (err: any) {
      throw new Error(err.message || 'Invalid verification code');
    }
  };

  const handleStartInspection = async () => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      // This changes visit status from 'arrived' to 'in_progress'
      await startInspectionMutation.mutateAsync(assignmentId);
      
      // Now show the inspection form
      setShowInspectionForm(true);
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to start inspection');
    }
  };

  const handleSubmitInspection = async () => {
    if (!assignmentId) return;

    setActionError(null);
    try {
      await submitInspectionMutation.mutateAsync({
        assignmentId,
        data: inspectionData as DeviceInspectionData,
      });
      
      // Calculate price based on inspection
      const priceResult = await calculatePriceMutation.mutateAsync({
        assignmentId,
        data: inspectionData as DeviceInspectionData,
      });
      
      setCalculatedPrice(priceResult);
      setProposedPrice(priceResult.calculated_price);
      setShowInspectionForm(false);
      setShowPriceReview(true);
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit inspection');
    }
  };

  const handleCompleteDeal = async (data: {
    payment_method: 'cash' | 'upi' | 'bank_transfer';
    signature?: string;
    notes?: string;
  }) => {
    if (!assignmentId) return;
    try {
      await completeDealMutation.mutateAsync({
        assignmentId,
        data: {
          final_price: proposedPrice || calculatedPrice?.calculated_price || 0,
          payment_method: data.payment_method,
          customer_signature: data.signature,
          notes: data.notes,
        },
      });
      setShowCompleteModal(false);
      setActionSuccess('Deal completed successfully!');
      setTimeout(() => navigate('/agent/activity'), 2000);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to complete deal');
    }
  };

  const openGoogleMaps = () => {
    if (assignment?.pickup_address) {
      const { latitude, longitude, line1, city, state, postal_code } = assignment.pickup_address;
      if (latitude && longitude) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
      } else {
        const address = encodeURIComponent(`${line1}, ${city}, ${state} ${postal_code}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
      }
    }
  };

  const callCustomer = () => {
    if (assignment?.customer_phone) {
      window.location.href = `tel:${assignment.customer_phone}`;
    }
  };

  // Get workflow stage
  const getWorkflowStage = () => {
    if (!assignment) return 'loading';
    switch (assignment.assignment_status) {
      case 'assigned': return 'pending';
      case 'accepted': return 'accepted';
      case 'en_route': return 'en_route';
      case 'checked_in': return 'checked_in';
      case 'inspecting': return 'inspecting';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'rejected': return 'rejected';
      default: return 'unknown';
    }
  };

  const stage = getWorkflowStage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#FEC925]" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="text-lg font-semibold text-gray-900">Failed to load lead</p>
        <p className="text-gray-500">{(error as Error)?.message || 'Lead not found'}</p>
        <button
          onClick={() => navigate('/agent/leads')}
          className="mt-4 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-semibold"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  // Show inspection form
  if (showInspectionForm) {
    // Simple image upload handler - in production, this would upload to S3/cloud storage
    const handleImageUpload = async (_key: string, file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Return base64 data URL for now
          // In production, upload to backend and return the URL
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    };

    return (
      <InspectionForm
        data={inspectionData}
        onDataChange={setInspectionData}
        onSubmit={handleSubmitInspection}
        onCancel={() => setShowInspectionForm(false)}
        isSubmitting={submitInspectionMutation.isPending || calculatePriceMutation.isPending}
        deviceInfo={{
          brand: assignment.device_brand,
          model: assignment.device_model,
          storage: assignment.device_storage,
        }}
        onImageUpload={handleImageUpload}
      />
    );
  }

  // Show price review
  if (showPriceReview && calculatedPrice) {
    return (
      <PriceReviewScreen
        originalPrice={parseFloat(assignment.estimated_price)}
        calculatedPrice={calculatedPrice}
        proposedPrice={proposedPrice}
        onProposedPriceChange={setProposedPrice}
        onConfirm={() => {
          setShowPriceReview(false);
          setShowCompleteModal(true);
        }}
        onCancel={() => setShowPriceReview(false)}
      />
    );
  }

  // Show complete modal
  if (showCompleteModal) {
    return (
      <DealCompletion
        leadNumber={assignment.lead_number}
        deviceName={`${assignment.device_brand} ${assignment.device_model}`}
        customerName={assignment.customer_name}
        customerPhone={assignment.customer_phone}
        finalPrice={proposedPrice || calculatedPrice?.calculated_price || parseFloat(assignment.estimated_price)}
        onComplete={handleCompleteDeal}
        onCancel={() => setShowCompleteModal(false)}
        isLoading={completeDealMutation.isPending}
        error={completeDealMutation.error?.message || null}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/agent/leads')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1C1C1B]">Lead #{assignment.lead_number}</h1>
          <p className="text-sm text-gray-500">{assignment.device_brand} {assignment.device_model}</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-[#1B8A05]/10 border border-[#1B8A05] rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="text-[#1B8A05]" size={20} />
            <span className="text-[#1B8A05] font-medium">{actionSuccess}</span>
          </motion.div>
        )}
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 font-medium">{actionError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Badge */}
      <StatusBadge status={assignment.assignment_status} priority={assignment.assignment_priority} />

      {/* Device Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#FEC925]/20 rounded-xl flex items-center justify-center">
            <Package className="text-[#FEC925]" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#1C1C1B]">
              {assignment.device_brand} {assignment.device_model}
            </h2>
            <p className="text-gray-500">
              {assignment.device_storage} • {assignment.device_color}
            </p>
            <div className="flex items-center gap-1 mt-1 font-bold text-[#1B8A05]">
              <IndianRupee size={18} />
              <span>{parseFloat(assignment.estimated_price).toLocaleString('en-IN')}</span>
              <span className="text-gray-400 text-sm font-normal ml-1">Est.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
        <h3 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
          <User size={18} className="text-[#FEC925]" />
          Customer Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#1C1C1B]">{assignment.customer_name}</p>
              <p className="text-sm text-gray-500">{assignment.customer_phone}</p>
            </div>
            <button
              onClick={callCustomer}
              className="p-3 bg-[#1B8A05]/10 rounded-full text-[#1B8A05] hover:bg-[#1B8A05]/20 transition"
            >
              <Phone size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
        <h3 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-[#FEC925]" />
          Pickup Location
        </h3>
        {assignment.pickup_address && (
          <div className="space-y-2">
            <p className="text-[#1C1C1B]">{assignment.pickup_address.line1}</p>
            {assignment.pickup_address.line2 && (
              <p className="text-gray-600">{assignment.pickup_address.line2}</p>
            )}
            <p className="text-gray-500">
              {assignment.pickup_address.city}, {assignment.pickup_address.state} - {assignment.pickup_address.postal_code}
            </p>
            <button
              onClick={openGoogleMaps}
              className="mt-3 w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
            >
              <Navigation size={18} />
              Open in Google Maps
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Schedule Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
        <h3 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-[#FEC925]" />
          Scheduled Time
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#1C1C1B]">
            <Calendar size={16} className="text-gray-400" />
            <span>{assignment.preferred_date}</span>
          </div>
          <div className="flex items-center gap-2 text-[#1C1C1B]">
            <Clock size={16} className="text-gray-400" />
            <span>{assignment.preferred_time_slot}</span>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <WorkflowProgress stage={stage} />

      {/* Action Buttons - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-2xl mx-auto">
          {/* Stage: Pending Acceptance */}
          {stage === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={rejectMutation.isPending}
                className="flex-1 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="flex-1 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Accept Lead
                  </>
                )}
              </button>
            </div>
          )}

          {/* Stage: Accepted - Start Journey */}
          {stage === 'accepted' && (
            <button
              onClick={handleStartJourney}
              disabled={startJourneyMutation.isPending}
              className="w-full py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {startJourneyMutation.isPending ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Play size={24} />
                  Start Journey
                </>
              )}
            </button>
          )}

          {/* Stage: En Route - Check In */}
          {stage === 'en_route' && (
            <button
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
              className="w-full py-4 bg-[#1B8A05] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {checkInMutation.isPending ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <MapPinned size={24} />
                  Check In at Location
                </>
              )}
            </button>
          )}

          {/* Stage: Checked In - Verify Code or Start Inspection */}
          {stage === 'checked_in' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerifyCodeModal(true)}
                className="flex-1 py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <KeyRound size={20} />
                Enter Code
              </button>
              <button
                onClick={handleStartInspection}
                disabled={startInspectionMutation.isPending}
                className="flex-1 py-4 bg-[#1B8A05] text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {startInspectionMutation.isPending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <ClipboardCheck size={20} />
                    Start Inspection
                  </>
                )}
              </button>
            </div>
          )}

          {/* Stage: Inspecting */}
          {stage === 'inspecting' && (
            <button
              onClick={() => setShowInspectionForm(true)}
              className="w-full py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <ClipboardCheck size={24} />
              Continue Inspection
            </button>
          )}

          {/* Stage: Completed */}
          {stage === 'completed' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1B8A05]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <BadgeCheck className="text-[#1B8A05]" size={32} />
              </div>
              <p className="text-lg font-bold text-[#1B8A05]">Lead Completed!</p>
              <button
                onClick={() => navigate('/agent/activity')}
                className="mt-4 px-6 py-2 bg-gray-100 rounded-lg font-semibold"
              >
                View Activity
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <Modal onClose={() => setShowRejectModal(false)}>
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1C1C1B] mb-2">Reject Lead</h3>
              <p className="text-gray-500 mb-4">Please provide a reason for rejecting this lead.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-24"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Lead'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Verify Code Modal */}
      <AnimatePresence>
        {showVerifyCodeModal && (
          <Modal onClose={() => setShowVerifyCodeModal(false)}>
            <VerificationCodeEntry
              onVerify={handleVerifyCode}
              onCancel={() => setShowVerifyCodeModal(false)}
              isLoading={verifyCodeMutation.isPending}
              error={verifyCodeMutation.error?.message || null}
              customerName={assignment.customer_name}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// =====================================================
// SUB COMPONENTS
// =====================================================

// Status Badge
const StatusBadge: React.FC<{ status: string; priority: string }> = ({ status, priority }) => {
  const getStatusStyle = () => {
    const styles: Record<string, string> = {
      assigned: 'bg-blue-100 text-blue-700 border-blue-200',
      accepted: 'bg-[#FEC925]/20 text-[#b48f00] border-[#FEC925]',
      en_route: 'bg-purple-100 text-purple-700 border-purple-200',
      checked_in: 'bg-green-100 text-green-700 border-green-200',
      inspecting: 'bg-orange-100 text-orange-700 border-orange-200',
      completed: 'bg-[#1B8A05]/20 text-[#1B8A05] border-[#1B8A05]',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      rejected: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return styles[status] || styles.assigned;
  };

  const getStatusLabel = () => {
    const labels: Record<string, string> = {
      assigned: 'Pending Acceptance',
      accepted: 'Accepted',
      en_route: 'En Route',
      checked_in: 'At Location',
      inspecting: 'Inspecting Device',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`px-4 py-2 rounded-full border-2 font-bold ${getStatusStyle()}`}>
        {getStatusLabel()}
      </span>
      {priority !== 'normal' && (
        <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
          priority === 'urgent' ? 'bg-red-500 text-white' :
          priority === 'high' ? 'bg-orange-500 text-white' :
          'bg-gray-200 text-gray-600'
        }`}>
          {priority}
        </span>
      )}
    </div>
  );
};

// Workflow Progress
const WorkflowProgress: React.FC<{ stage: string }> = ({ stage }) => {
  const stages = ['pending', 'accepted', 'en_route', 'checked_in', 'inspecting', 'completed'];
  const currentIndex = stages.indexOf(stage);

  const stageLabels: Record<string, string> = {
    pending: 'Accept',
    accepted: 'Start',
    en_route: 'Check In',
    checked_in: 'Inspect',
    inspecting: 'Price',
    completed: 'Done',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
      <h3 className="font-bold text-[#1C1C1B] mb-4">Progress</h3>
      <div className="flex justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-[#1B8A05] transition-all duration-500"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
        
        {stages.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          
          return (
            <div key={s} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? 'bg-[#1B8A05] text-white'
                    : isCurrent
                    ? 'bg-[#FEC925] text-[#1C1C1B]'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`text-xs mt-2 ${isCurrent ? 'font-bold text-[#1C1C1B]' : 'text-gray-500'}`}>
                {stageLabels[s]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Modal Component
const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

// Inspection Form
interface InspectionFormProps {
  data: Partial<DeviceInspectionData>;
  onDataChange: (data: Partial<DeviceInspectionData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  deviceInfo: { brand: string; model: string; storage: string };
  onImageUpload?: (key: string, file: File) => Promise<string>;
}

const InspectionForm: React.FC<InspectionFormProps> = ({
  data,
  onDataChange,
  onSubmit,
  onCancel,
  isSubmitting,
  deviceInfo,
  onImageUpload,
}) => {
  const updateField = <K extends keyof DeviceInspectionData>(key: K, value: DeviceInspectionData[K]) => {
    onDataChange({ ...data, [key]: value });
  };

  // Convert DeviceInspectionData image fields to Record format for DeviceImageCapture
  const images: Record<string, string> = {
    ...(data.front_image && { front: data.front_image }),
    ...(data.back_image && { back: data.back_image }),
    ...(data.screen_image && { screen: data.screen_image }),
    ...(data.imei_image && { imei: data.imei_image }),
  };

  const handleImagesChange = (newImages: Record<string, string>) => {
    onDataChange({
      ...data,
      front_image: newImages.front || undefined,
      back_image: newImages.back || undefined,
      screen_image: newImages.screen || undefined,
      imei_image: newImages.imei || undefined,
    });
  };

  // Check if required images are captured (front, back, and imei are required)
  const requiredImagesCaptured = Boolean(images.front && images.back && images.imei);
  
  // Check if form is valid for submission
  const isFormValid = requiredImagesCaptured && 
    data.imei_number && 
    data.imei_number.length >= 15 &&
    data.notes && 
    data.notes.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FEC925] to-[#e5b520] p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition">
            <ArrowLeft size={24} className="text-[#1C1C1B]" />
          </button>
          <span className="text-[#1C1C1B] font-bold">Device Inspection</span>
          <div className="w-10" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone className="text-[#1C1C1B]" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1C1C1B]">{deviceInfo.brand} {deviceInfo.model}</h1>
            <p className="text-[#1C1C1B]/70">{deviceInfo.storage}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Device Photos - REQUIRED */}
        <Section title="Device Photos (Required)">
          <DeviceImageCapture
            images={images}
            onImagesChange={handleImagesChange}
            onUpload={onImageUpload}
          />
          {!requiredImagesCaptured && (
            <p className="text-sm text-[#FF0000] mt-2 flex items-center gap-1">
              <AlertCircle size={14} />
              Please capture Front, Back, and IMEI photos to continue
            </p>
          )}
        </Section>

        {/* Physical Condition */}
        <Section title="Physical Condition">
          <SelectField
            label="Screen Condition"
            value={data.screen_condition || 'good'}
            onChange={(v) => updateField('screen_condition', v as DeviceInspectionData['screen_condition'])}
            options={[
              { value: 'excellent', label: 'Excellent - No scratches' },
              { value: 'good', label: 'Good - Minor scratches' },
              { value: 'fair', label: 'Fair - Visible scratches' },
              { value: 'poor', label: 'Poor - Deep scratches' },
              { value: 'broken', label: 'Broken - Cracked screen' },
            ]}
          />
          <SelectField
            label="Body Condition"
            value={data.body_condition || 'good'}
            onChange={(v) => updateField('body_condition', v as DeviceInspectionData['body_condition'])}
            options={[
              { value: 'excellent', label: 'Excellent - Like new' },
              { value: 'good', label: 'Good - Minor wear' },
              { value: 'fair', label: 'Fair - Visible wear' },
              { value: 'poor', label: 'Poor - Heavy wear' },
              { value: 'damaged', label: 'Damaged - Dents/bends' },
            ]}
          />
        </Section>

        {/* Functional Tests */}
        <Section title="Functional Tests">
          <div className="grid grid-cols-2 gap-3">
            <ToggleField icon={Zap} label="Power On" value={data.power_on ?? true} onChange={(v) => updateField('power_on', v)} />
            <ToggleField icon={Smartphone} label="Touch Working" value={data.touch_working ?? true} onChange={(v) => updateField('touch_working', v)} />
            <ToggleField icon={Eye} label="Display Working" value={data.display_working ?? true} onChange={(v) => updateField('display_working', v)} />
            <ToggleField icon={Volume2} label="Speakers" value={data.speakers_working ?? true} onChange={(v) => updateField('speakers_working', v)} />
            <ToggleField icon={Mic} label="Microphone" value={data.microphone_working ?? true} onChange={(v) => updateField('microphone_working', v)} />
            <ToggleField icon={Camera} label="Cameras" value={data.cameras_working ?? true} onChange={(v) => updateField('cameras_working', v)} />
            <ToggleField icon={Wifi} label="WiFi" value={data.wifi_working ?? true} onChange={(v) => updateField('wifi_working', v)} />
            <ToggleField icon={Bluetooth} label="Bluetooth" value={data.bluetooth_working ?? true} onChange={(v) => updateField('bluetooth_working', v)} />
            <ToggleField icon={Fingerprint} label="Fingerprint" value={data.fingerprint_working ?? true} onChange={(v) => updateField('fingerprint_working', v)} />
            <ToggleField icon={Package} label="Buttons" value={data.buttons_working ?? true} onChange={(v) => updateField('buttons_working', v)} />
          </div>
        </Section>

        {/* Device Verification */}
        <Section title="Device Verification">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">IMEI Number</label>
              <input
                type="text"
                value={data.imei_number || ''}
                onChange={(e) => updateField('imei_number', e.target.value)}
                placeholder="Enter IMEI number"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <ToggleField icon={CheckCircle2} label="IMEI Verified" value={data.imei_verified ?? false} onChange={(v) => updateField('imei_verified', v)} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Storage</label>
              <input
                type="text"
                value={data.actual_storage || ''}
                onChange={(e) => updateField('actual_storage', e.target.value)}
                placeholder="e.g., 128GB"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Battery Health (%)</label>
              <input
                type="number"
                value={data.battery_health || ''}
                onChange={(e) => updateField('battery_health', Number(e.target.value) || null)}
                placeholder="e.g., 85"
                min="0"
                max="100"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
          </div>
        </Section>

        {/* Accessories */}
        <Section title="Accessories Included">
          <div className="grid grid-cols-2 gap-3">
            <ToggleField icon={Package} label="Original Box" value={data.has_box ?? false} onChange={(v) => updateField('has_box', v)} />
            <ToggleField icon={Zap} label="Charger" value={data.has_charger ?? false} onChange={(v) => updateField('has_charger', v)} />
            <ToggleField icon={Volume2} label="Earphones" value={data.has_earphones ?? false} onChange={(v) => updateField('has_earphones', v)} />
            <ToggleField icon={ClipboardCheck} label="Bill/Invoice" value={data.has_bill ?? false} onChange={(v) => updateField('has_bill', v)} />
          </div>
        </Section>

        {/* Notes */}
        <Section title="Additional Notes (Required)">
          <textarea
            value={data.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Describe the device condition, any defects found, customer interaction notes..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-24"
          />
          {(!data.notes || data.notes.trim().length === 0) && (
            <p className="text-sm text-[#FF0000] mt-1">Please add inspection notes</p>
          )}
        </Section>

        {/* Validation Summary */}
        {!isFormValid && (
          <div className="bg-[#FEC925]/10 border border-[#FEC925] rounded-xl p-4">
            <h4 className="font-bold text-[#1C1C1B] mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-[#b48f00]" />
              Complete Required Fields
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {!requiredImagesCaptured && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Capture required photos (Front, Back, IMEI)
                </li>
              )}
              {(!data.imei_number || data.imei_number.length < 15) && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Enter valid IMEI number (15 digits)
                </li>
              )}
              {(!data.notes || data.notes.trim().length === 0) && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Add inspection notes
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !isFormValid}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              isFormValid 
                ? 'bg-[#1B8A05] text-white hover:bg-[#157004]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle2 size={20} />
                Submit Inspection
              </>
            )}
          </button>
          {!isFormValid && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Complete all required fields to submit
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Price Review Screen
interface PriceReviewScreenProps {
  originalPrice: number;
  calculatedPrice: {
    original_price: number;
    calculated_price: number;
    deductions: Array<{ reason: string; amount: number }>;
  };
  proposedPrice: number;
  onProposedPriceChange: (price: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const PriceReviewScreen: React.FC<PriceReviewScreenProps> = ({
  originalPrice,
  calculatedPrice,
  proposedPrice,
  onProposedPriceChange,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-[#1C1C1B] to-[#2d2d2c] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="text-white font-bold">Price Review</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Original Price */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Original Estimate</span>
            <span className="font-bold text-lg flex items-center">
              <IndianRupee size={18} />
              {originalPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Deductions */}
        {calculatedPrice.deductions.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-bold text-[#1C1C1B] mb-3">Deductions</h3>
            <div className="space-y-2">
              {calculatedPrice.deductions.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{d.reason}</span>
                  <span className="text-red-500 font-semibold">-₹{d.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculated Price */}
        <div className="bg-[#1B8A05]/10 rounded-xl p-4 border border-[#1B8A05]">
          <div className="flex justify-between items-center">
            <span className="text-[#1B8A05] font-semibold">Calculated Price</span>
            <span className="font-bold text-2xl text-[#1B8A05] flex items-center">
              <IndianRupee size={22} />
              {calculatedPrice.calculated_price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Adjust Price */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <label className="block font-bold text-[#1C1C1B] mb-2">Offer Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => onProposedPriceChange(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-xl font-bold focus:border-[#FEC925] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-[#1B8A05] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          >
            <BadgeCheck size={24} />
            Proceed to Complete Deal
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="font-bold text-[#1C1C1B] mb-3">{title}</h3>
    {children}
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}> = ({ label, value, onChange, options }) => (
  <div className="mb-3">
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const ToggleField: React.FC<{
  icon: any;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ icon: Icon, label, value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
      value ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-200 bg-white'
    }`}
  >
    <Icon size={18} className={value ? 'text-[#1B8A05]' : 'text-gray-400'} />
    <span className={`text-sm font-semibold ${value ? 'text-[#1B8A05]' : 'text-gray-600'}`}>{label}</span>
    <div className="ml-auto">
      {value ? <CheckCircle2 size={18} className="text-[#1B8A05]" /> : <XCircle size={18} className="text-gray-300" />}
    </div>
  </button>
);

export default AgentLeadDetailPage;