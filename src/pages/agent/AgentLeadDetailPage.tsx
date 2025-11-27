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
  // Clock,
  IndianRupee,
  User,
  Package,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  // Play,
  MapPinned,
  KeyRound,
  ClipboardCheck,
  // Calculator,
  BadgeCheck,
  Camera,
  // MessageSquare,
  // ChevronRight,
  // ChevronDown,
  // Star,
  Smartphone,
  // Battery,
  // HardDrive,
  Fingerprint,
  Wifi,
  Bluetooth,
  Volume2,
  Mic,
  Zap,
  Eye,
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
  // useCancelAssignment,
  useCurrentLocation,
} from '../../hooks/useAgentApp';
import type { DeviceInspectionData } from '../../api/types/agentApp.types';

// FlipCash Colors
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
// };

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
  // const cancelMutation = useCancelAssignment();
  const { getCurrentLocation } = useCurrentLocation();

  // State for modals/forms
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyCodeModal, setShowVerifyCodeModal] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showPriceReview, setShowPriceReview] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [_showCancelModal, _setShowCancelModal] = useState(false);
  
  const [rejectReason, setRejectReason] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  // const [cancelReason, _setCancelReason] = useState('');
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
  });

  // Price calculation state
  const [calculatedPrice, setCalculatedPrice] = useState<{
    original_price: number;
    calculated_price: number;
    deductions: Array<{ reason: string; amount: number }>;
  } | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number>(0);

  // Complete deal state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');

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

  const handleVerifyCode = async () => {
    if (!assignmentId || verificationCode.length !== 6) return;
    setActionError(null);
    try {
      await verifyCodeMutation.mutateAsync({ assignmentId, code: verificationCode });
      setActionSuccess('Code verified! You can now start inspection.');
      setShowVerifyCodeModal(false);
      setVerificationCode('');
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Invalid verification code');
    }
  };

  const handleStartInspection = async () => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      await startInspectionMutation.mutateAsync(assignmentId);
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

  const handleConfirmPrice = async () => {
    if (!assignmentId) return;
    setShowPriceReview(false);
    setShowCompleteModal(true);
  };

  const handleCompleteDeal = async () => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      await completeDealMutation.mutateAsync({
        assignmentId,
        data: {
          final_price: proposedPrice,
          payment_method: paymentMethod,
        },
      });
      setActionSuccess('Deal completed successfully!');
      setShowCompleteModal(false);
      navigate('/agent/leads?status=completed');
    } catch (err: any) {
      setActionError(err.message || 'Failed to complete deal');
    }
  };

  // const handleCancel = async () => {
  //   if (!assignmentId || !cancelReason.trim()) return;
  //   setActionError(null);
  //   try {
  //     await cancelMutation.mutateAsync({ assignmentId, reason: cancelReason });
  //     navigate('/agent/leads');
  //   } catch (err: any) {
  //     setActionError(err.message || 'Failed to cancel');
  //   }
  // };


  // Get current step
  const getCurrentStep = () => {
    if (!assignment) return 0;
    const steps: Record<string, number> = {
      assigned: 1,
      accepted: 2,
      en_route: 3,
      checked_in: 4,
      inspecting: 5,
      completed: 6,
    };
    return steps[assignment.assignment_status] || 0;
  };

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
        <XCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="text-lg font-semibold text-gray-900">Failed to load lead details</p>
        <p className="text-gray-500 mb-4">{(error as Error)?.message || 'Lead not found'}</p>
        <button
          onClick={() => navigate('/agent/leads')}
          className="px-4 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/agent/leads')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1C1C1B]">Lead #{assignment.lead_number}</h1>
          <p className="text-sm text-gray-500">
            {assignment.device_brand} {assignment.device_model}
          </p>
        </div>
        <StatusBadge status={assignment.assignment_status} />
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm font-medium">{actionError}</p>
          </motion.div>
        )}
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1B8A05]/10 border-2 border-[#1B8A05] rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="text-[#1B8A05] flex-shrink-0" size={20} />
            <p className="text-[#1B8A05] text-sm font-medium">{actionSuccess}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Steps */}
      <ProgressSteps currentStep={currentStep} />

      {/* Device Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1C1C1B] to-[#2d2d2c] p-4 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
              <Smartphone className="text-[#FEC925]" size={32} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">
                {assignment.device_brand} {assignment.device_model}
              </p>
              <p className="text-white/70 text-sm">
                {assignment.device_storage} • {assignment.device_color}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estimated Price</p>
              <div className="flex items-center gap-1 text-2xl font-bold text-[#1B8A05]">
                <IndianRupee size={20} />
                {parseFloat(assignment.estimated_price).toLocaleString('en-IN')}
              </div>
            </div>
            {assignment.final_price && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Final Price</p>
                <div className="flex items-center gap-1 text-2xl font-bold text-[#FEC925]">
                  <IndianRupee size={20} />
                  {parseFloat(assignment.final_price).toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer & Location Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Customer */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FEC925]/20 rounded-full flex items-center justify-center">
            <User className="text-[#FEC925]" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#1C1C1B]">{assignment.customer_name}</p>
            <a
              href={`tel:${assignment.customer_phone}`}
              className="text-sm text-[#FEC925] flex items-center gap-1"
            >
              <Phone size={14} />
              {assignment.customer_phone}
            </a>
          </div>
          <a
            href={`tel:${assignment.customer_phone}`}
            className="p-3 bg-[#1B8A05] text-white rounded-full hover:bg-[#156d04] transition"
          >
            <Phone size={20} />
          </a>
        </div>

        {/* Address */}
        {assignment.pickup_address && (
          <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#1C1C1B]">Pickup Address</p>
              <p className="text-sm text-gray-600">
                {assignment.pickup_address.line1}
                {assignment.pickup_address.line2 && `, ${assignment.pickup_address.line2}`}
              </p>
              <p className="text-sm text-gray-600">
                {assignment.pickup_address.city}, {assignment.pickup_address.state} -{' '}
                {assignment.pickup_address.postal_code}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${assignment.pickup_address.latitude},${assignment.pickup_address.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              <Navigation size={20} />
            </a>
          </div>
        )}

        {/* Schedule */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Calendar className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="font-semibold text-[#1C1C1B]">Scheduled Visit</p>
            <p className="text-sm text-gray-600">
              {assignment.preferred_date} • {assignment.preferred_time_slot}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons based on status */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        {assignment.assignment_status === 'assigned' && (
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={rejectMutation.isPending}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              className="flex-1 px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center justify-center gap-2 disabled:opacity-50"
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

        {assignment.assignment_status === 'accepted' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleStartJourney}
              disabled={startJourneyMutation.isPending}
              className="w-full px-4 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold hover:bg-[#e5b520] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {startJourneyMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Navigation size={20} />
                  Start Journey
                </>
              )}
            </button>
          </div>
        )}

        {assignment.assignment_status === 'en_route' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
              className="w-full px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {checkInMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <MapPinned size={20} />
                  Check In at Location
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Make sure you're at the customer's location before checking in
            </p>
          </div>
        )}

        {assignment.assignment_status === 'checked_in' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleStartInspection}
              disabled={startInspectionMutation.isPending}
              className="w-full px-4 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold hover:bg-[#e5b520] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {startInspectionMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <ClipboardCheck size={20} />
                  Start Device Inspection
                </>
              )}
            </button>
          </div>
        )}

        {assignment.assignment_status === 'inspecting' && !showInspectionForm && !showPriceReview && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowInspectionForm(true)}
              className="w-full px-4 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold hover:bg-[#e5b520] transition flex items-center justify-center gap-2"
            >
              <ClipboardCheck size={20} />
              Continue Inspection
            </button>
          </div>
        )}

        {assignment.assignment_status === 'completed' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-[#1B8A05]">
              <CheckCircle2 size={24} />
              <span className="font-bold text-lg">Deal Completed</span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#1C1C1B] mb-4">Reject Lead</h3>
          <p className="text-gray-600 mb-4">Please provide a reason for rejecting this lead:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-24"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              className="flex-1 px-4 py-3 bg-[#FF0000] text-white rounded-xl font-bold disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Lead'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Verify Code Modal */}
      <Modal isOpen={showVerifyCodeModal} onClose={() => setShowVerifyCodeModal(false)}>
        <div className="p-6">
          <div className="w-16 h-16 bg-[#FEC925]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-[#FEC925]" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#1C1C1B] text-center mb-2">
            Enter Verification Code
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Ask the customer for their 6-digit verification code
          </p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full text-center text-3xl font-mono tracking-[0.5em] p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
          />
          <button
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || verifyCodeMutation.isPending}
            className="w-full mt-4 px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold disabled:opacity-50"
          >
            {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </Modal>

      {/* Inspection Form Modal */}
      <Modal 
        isOpen={showInspectionForm} 
        onClose={() => setShowInspectionForm(false)}
        fullScreen
      >
        <InspectionForm
          data={inspectionData}
          onChange={setInspectionData}
          onSubmit={handleSubmitInspection}
          onCancel={() => setShowInspectionForm(false)}
          isSubmitting={submitInspectionMutation.isPending}
          deviceInfo={{
            brand: assignment.device_brand,
            model: assignment.device_model,
            storage: assignment.device_storage,
          }}
        />
      </Modal>

      {/* Price Review Modal */}
      <Modal isOpen={showPriceReview} onClose={() => setShowPriceReview(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#1C1C1B] mb-4 text-center">
            Price Review
          </h3>
          
          {calculatedPrice && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Original Estimate</span>
                  <span className="font-semibold">₹{calculatedPrice.original_price.toLocaleString()}</span>
                </div>
                
                {calculatedPrice.deductions.length > 0 && (
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    {calculatedPrice.deductions.map((d, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-red-600">- {d.reason}</span>
                        <span className="text-red-600">-₹{d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold">Calculated Price</span>
                  <span className="text-xl font-bold text-[#1B8A05]">
                    ₹{calculatedPrice.calculated_price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Final Offer Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none text-xl font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmPrice}
                className="w-full px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold"
              >
                Confirm Price & Complete Deal
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Complete Deal Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)}>
        <div className="p-6">
          <div className="w-16 h-16 bg-[#1B8A05]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BadgeCheck className="text-[#1B8A05]" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#1C1C1B] text-center mb-2">
            Complete Deal
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Final Amount: <span className="font-bold text-[#1B8A05]">₹{proposedPrice.toLocaleString()}</span>
          </p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'upi', 'bank_transfer'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border-2 text-center font-semibold transition ${
                    paymentMethod === method
                      ? 'border-[#FEC925] bg-[#FEC925]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method === 'cash' && 'Cash'}
                  {method === 'upi' && 'UPI'}
                  {method === 'bank_transfer' && 'Bank'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCompleteDeal}
            disabled={completeDealMutation.isPending}
            className="w-full px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {completeDealMutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle2 size={20} />
                Complete Deal
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// Progress Steps Component
const ProgressSteps: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Accept' },
    { num: 2, label: 'Journey' },
    { num: 3, label: 'Check-in' },
    { num: 4, label: 'Inspect' },
    { num: 5, label: 'Complete' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.num} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep >= step.num
                    ? 'bg-[#1B8A05] text-white'
                    : currentStep === step.num - 1
                    ? 'bg-[#FEC925] text-[#1C1C1B]'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.num ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <span className="text-sm font-bold">{step.num}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded ${
                    currentStep > step.num ? 'bg-[#1B8A05]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    assigned: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
    accepted: { bg: 'bg-[#FEC925]/20', text: 'text-[#b48f00]', label: 'Accepted' },
    en_route: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'En Route' },
    checked_in: { bg: 'bg-green-100', text: 'text-green-700', label: 'At Location' },
    inspecting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Inspecting' },
    completed: { bg: 'bg-[#1B8A05]/20', text: 'text-[#1B8A05]', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  };

  const { bg, text, label } = config[status] || config.assigned;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
};

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fullScreen?: boolean;
}> = ({ isOpen, onClose, children, fullScreen }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative bg-white rounded-2xl shadow-xl z-10 ${
            fullScreen
              ? 'w-full h-full max-w-none rounded-none'
              : 'max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'
          }`}
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Inspection Form Component
const InspectionForm: React.FC<{
  data: Partial<DeviceInspectionData>;
  onChange: (data: Partial<DeviceInspectionData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  deviceInfo: { brand: string; model: string; storage: string };
}> = ({ data, onChange, onSubmit, onCancel, isSubmitting, deviceInfo }) => {
  const updateField = (field: keyof DeviceInspectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#1C1C1B] text-white p-4 flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="font-bold">Device Inspection</h2>
          <p className="text-sm text-white/70">
            {deviceInfo.brand} {deviceInfo.model}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Physical Condition */}
        <Section title="Physical Condition">
          <SelectField
            label="Screen Condition"
            value={data.screen_condition || 'good'}
            onChange={(v) => updateField('screen_condition', v)}
            options={[
              { value: 'excellent', label: 'Excellent - No scratches' },
              { value: 'good', label: 'Good - Minor scratches' },
              { value: 'fair', label: 'Fair - Visible scratches' },
              { value: 'poor', label: 'Poor - Deep scratches/cracks' },
              { value: 'broken', label: 'Broken - Not functional' },
            ]}
          />
          <SelectField
            label="Body Condition"
            value={data.body_condition || 'good'}
            onChange={(v) => updateField('body_condition', v)}
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
            <ToggleField
              icon={Zap}
              label="Power On"
              value={data.power_on ?? true}
              onChange={(v) => updateField('power_on', v)}
            />
            <ToggleField
              icon={Smartphone}
              label="Touch Working"
              value={data.touch_working ?? true}
              onChange={(v) => updateField('touch_working', v)}
            />
            <ToggleField
              icon={Eye}
              label="Display Working"
              value={data.display_working ?? true}
              onChange={(v) => updateField('display_working', v)}
            />
            <ToggleField
              icon={Volume2}
              label="Speakers"
              value={data.speakers_working ?? true}
              onChange={(v) => updateField('speakers_working', v)}
            />
            <ToggleField
              icon={Mic}
              label="Microphone"
              value={data.microphone_working ?? true}
              onChange={(v) => updateField('microphone_working', v)}
            />
            <ToggleField
              icon={Camera}
              label="Cameras"
              value={data.cameras_working ?? true}
              onChange={(v) => updateField('cameras_working', v)}
            />
            <ToggleField
              icon={Wifi}
              label="WiFi"
              value={data.wifi_working ?? true}
              onChange={(v) => updateField('wifi_working', v)}
            />
            <ToggleField
              icon={Bluetooth}
              label="Bluetooth"
              value={data.bluetooth_working ?? true}
              onChange={(v) => updateField('bluetooth_working', v)}
            />
            <ToggleField
              icon={Fingerprint}
              label="Fingerprint"
              value={data.fingerprint_working ?? true}
              onChange={(v) => updateField('fingerprint_working', v)}
            />
            <ToggleField
              icon={Package}
              label="Buttons"
              value={data.buttons_working ?? true}
              onChange={(v) => updateField('buttons_working', v)}
            />
          </div>
        </Section>

        {/* Device Verification */}
        <Section title="Device Verification">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IMEI Number
              </label>
              <input
                type="text"
                value={data.imei_number || ''}
                onChange={(e) => updateField('imei_number', e.target.value)}
                placeholder="Enter IMEI number"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <ToggleField
              icon={CheckCircle2}
              label="IMEI Verified"
              value={data.imei_verified ?? false}
              onChange={(v) => updateField('imei_verified', v)}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Actual Storage
              </label>
              <input
                type="text"
                value={data.actual_storage || ''}
                onChange={(e) => updateField('actual_storage', e.target.value)}
                placeholder="e.g., 128GB"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Battery Health (%)
              </label>
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
            <ToggleField
              icon={Package}
              label="Original Box"
              value={data.has_box ?? false}
              onChange={(v) => updateField('has_box', v)}
            />
            <ToggleField
              icon={Zap}
              label="Charger"
              value={data.has_charger ?? false}
              onChange={(v) => updateField('has_charger', v)}
            />
            <ToggleField
              icon={Volume2}
              label="Earphones"
              value={data.has_earphones ?? false}
              onChange={(v) => updateField('has_earphones', v)}
            />
            <ToggleField
              icon={ClipboardCheck}
              label="Bill/Invoice"
              value={data.has_bill ?? false}
              onChange={(v) => updateField('has_bill', v)}
            />
          </div>
        </Section>

        {/* Notes */}
        <Section title="Additional Notes">
          <textarea
            value={data.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Any additional observations..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-24"
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
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
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
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
      value
        ? 'border-[#1B8A05] bg-[#1B8A05]/10'
        : 'border-gray-200 bg-white'
    }`}
  >
    <Icon size={18} className={value ? 'text-[#1B8A05]' : 'text-gray-400'} />
    <span className={`text-sm font-semibold ${value ? 'text-[#1B8A05]' : 'text-gray-600'}`}>
      {label}
    </span>
    <div className="ml-auto">
      {value ? (
        <CheckCircle2 size={18} className="text-[#1B8A05]" />
      ) : (
        <XCircle size={18} className="text-gray-300" />
      )}
    </div>
  </button>
);

export default AgentLeadDetailPage;
