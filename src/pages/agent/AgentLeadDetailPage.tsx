// src/pages/agent/AgentLeadDetailPage.tsx
// Agent Lead Detail - COMPLETE FULL VERSION WITH KYC WORKFLOW
// Includes: System pricing, customer acceptance, KYC verification, payment processing

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
  CreditCard,
  Wallet,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Shield,
  FileText,
  // Upload,
  Edit3,
  Home,
  // MapPin as MapPinIcon,
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
  useCustomerAcceptance,    // EXISTING
  useKYCVerification,       // NEW
  usePaymentProcess,        // NEW
  // useCompleteDeal,
  useCurrentLocation,
} from '../../hooks/useAgentApp';
import type { 
  DeviceInspectionData,
  KYCVerificationData,    // NEW
  PaymentData,            // NEW
  CustomerAddress,        // NEW
} from '../../api/types/agentApp.types';
import VerificationCodeEntry from '../../components/agent/VerificationCodeEntry';
import DeviceImageCapture from '../../components/agent/DeviceImageCapture';

const AgentLeadDetailPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  
  const { data: assignment, isLoading, error, refetch } = useAgentAssignment(assignmentId || '');
  
  // Mutations - UPDATED with new hooks
  const acceptMutation = useAcceptAssignment();
  const rejectMutation = useRejectAssignment();
  const startJourneyMutation = useStartJourney();
  const checkInMutation = useCheckIn();
  const verifyCodeMutation = useVerifyCode();
  const startInspectionMutation = useStartInspection();
  const submitInspectionMutation = useSubmitInspection();
  const customerAcceptanceMutation = useCustomerAcceptance();
  const kycVerificationMutation = useKYCVerification();      // NEW
  const paymentProcessMutation = usePaymentProcess();        // NEW
  // const completeDealMutation = useCompleteDeal();
  const { getCurrentLocation } = useCurrentLocation();

  // State for modals/forms - UPDATED
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyCodeModal, setShowVerifyCodeModal] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showCustomerAcceptance, setShowCustomerAcceptance] = useState(false);
  const [showKYCForm, setShowKYCForm] = useState(false);           // NEW
  const [showPaymentScreen, setShowPaymentScreen] = useState(false); // NEW
  
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
    front_image: undefined,
    back_image: undefined,
    screen_image: undefined,
    imei_image: undefined,
    defect_images: [],
  });

  // System calculated final price state
  const [systemCalculatedPrice, setSystemCalculatedPrice] = useState<{
    final_price: number;
    original_estimate: number;
    deductions: Array<{ reason: string; amount: number }>;
    is_final: boolean;
  } | null>(null);

  // Customer response state
  const [customerResponse, setCustomerResponse] = useState<'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customerSignature, setCustomerSignature] = useState<string>('');

  // NEW: KYC verification state
  const [kycData, setKycData] = useState<Partial<KYCVerificationData>>({
    customer_full_name: '',
    customer_father_name: '',
    customer_date_of_birth: '',
    customer_id_proof_type: 'aadhaar',
    customer_id_number: '',
    customer_address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    id_proof_photo: '',
    customer_signature: '',
    customer_selfie: '',
    agent_declaration: false,
    verification_notes: ''
  });

  // NEW: Captured images state for KYC
  const [capturedImages, setCapturedImages] = useState({
    id_proof: null as string | null,
    signature: null as string | null,
    selfie: null as string | null
  });

  // NEW: Payment processing state  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'partner_wallet' | null>(null);
  const [_cashConfirmation, setCashConfirmation] = useState({
    amount_given: 0,
    receipt_signature: null as string | null,
    payment_notes: ''
  });
  const [completionNotes, setCompletionNotes] = useState('');

  // Update KYC data when assignment loads
  useEffect(() => {
    if (assignment?.customer_name && !kycData.customer_full_name) {
      setKycData(prev => ({
        ...prev,
        customer_full_name: assignment.customer_name
      }));
    }
  }, [assignment?.customer_name, kycData.customer_full_name]);

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

  // Action handlers (existing)
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
      await startInspectionMutation.mutateAsync(assignmentId);
      setShowInspectionForm(true);
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to start inspection');
    }
  };

  // Inspection submission with system final price
  // Inspection submission with system final price
  const handleSubmitInspection = async () => {
    if (!assignmentId) return;

    setActionError(null);
    try {
      const rawData = transformInspectionData(inspectionData);

      // FIX: Create a clean object where undefined photos are filtered out
      const backendInspectionData = {
        ...rawData,
        inspection_photos: (rawData.inspection_photos || []).filter((p): p is string => !!p)
      };
      
      const inspectionResult = await submitInspectionMutation.mutateAsync({
        assignmentId,
        data: backendInspectionData,
      });
      
      if (inspectionResult.system_final_price) {
        setSystemCalculatedPrice({
          final_price: inspectionResult.system_final_price,
          original_estimate: inspectionResult.original_estimate || 0,
          deductions: inspectionResult.deductions ? 
            Object.entries(inspectionResult.deductions).map(([reason, amount]) => ({ reason, amount })) : [],
          is_final: inspectionResult.is_final || true
        });
      }
      
      setShowInspectionForm(false);
      setShowCustomerAcceptance(true);
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit inspection');
    }
  };

  // Handle customer acceptance/rejection
  const handleCustomerAcceptance = async () => {
    if (!assignmentId || !customerResponse) return;

    setActionError(null);
    try {
      const requestData: any = {
        customer_response: customerResponse
      };

      if (customerResponse === 'accept') {
        if (customerSignature) {
          requestData.customer_signature = customerSignature;
        }
      } else {
        requestData.rejection_reason = rejectionReason || 'Customer rejected the price';
      }

      await customerAcceptanceMutation.mutateAsync({
        assignmentId,
        data: requestData
      });

      if (customerResponse === 'accept') {
        setActionSuccess('Customer accepted! Now complete KYC verification.');
        setShowCustomerAcceptance(false);
        setShowKYCForm(true);  // NEW: Show KYC form instead of payment
      } else {
        setActionSuccess('Customer rejected the price. Visit will be cancelled.');
        setShowCustomerAcceptance(false);
        setTimeout(() => navigate('/agent/leads'), 2000);
      }

      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to process customer response');
    }
  };

  // NEW: KYC verification handler
  const handleKYCSubmission = async (data: KYCVerificationData) => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      await kycVerificationMutation.mutateAsync({
        assignmentId,
        data
      });

      setActionSuccess('KYC verification completed! Now process payment.');
      setShowKYCForm(false);
      setShowPaymentScreen(true);
      
      // Set default cash amount
      setCashConfirmation(prev => ({
        ...prev,
        amount_given: systemCalculatedPrice?.final_price || 0
      }));
      
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to complete KYC verification');
    }
  };

  // NEW: Payment processing handler
  const handlePaymentCompletion = async (data: PaymentData) => {
    if (!assignmentId) return;
    setActionError(null);
    try {
      await paymentProcessMutation.mutateAsync({
        assignmentId,
        data
      });

      setActionSuccess(`Payment completed successfully via ${data.payment_method}!`);
      setShowPaymentScreen(false);
      refetch();
      
      // Navigate to activity after short delay
      setTimeout(() => navigate('/agent/activity'), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to process payment');
    }
  };

  // Data transformation function
  const transformInspectionData = (frontendData: Partial<DeviceInspectionData>) => {
    return {
      inspection_notes: frontendData.notes || '',
      inspection_photos: [
        frontendData.front_image,
        frontendData.back_image,
        frontendData.screen_image,
        frontendData.imei_image,
        ...(frontendData.defect_images || [])
      ].filter(Boolean),
      verified_imei: frontendData.imei_number || '',
      imei_matches: frontendData.imei_verified || false,
      device_powers_on: frontendData.power_on || false,
      
      partner_assessment: {
        screen_condition: frontendData.screen_condition || 'good',
        body_condition: frontendData.body_condition || 'good',
        battery_health: frontendData.battery_health || 0,
        accessories: {
          charger_available: frontendData.has_charger || false,
          box_available: frontendData.has_box || false,
          earphones_available: frontendData.has_earphones || false,
          bill_available: frontendData.has_bill || false,
        },
        functional_issues: [
          ...(!frontendData.touch_working ? ['touch'] : []),
          ...(!frontendData.display_working ? ['display'] : []),
          ...(!frontendData.speakers_working ? ['speakers'] : []),
          ...(!frontendData.microphone_working ? ['microphone'] : []),
          ...(!frontendData.cameras_working ? ['cameras'] : []),
          ...(!frontendData.wifi_working ? ['wifi'] : []),
          ...(!frontendData.bluetooth_working ? ['bluetooth'] : []),
          ...(!frontendData.fingerprint_working ? ['fingerprint'] : []),
          ...(!frontendData.buttons_working ? ['buttons'] : []),
          ...(!frontendData.charging_port_working ? ['charging_port'] : []),
          ...(!frontendData.sim_slot_working ? ['sim_slot'] : []),
        ],
        additional_notes: frontendData.notes || ''
      },
      
      checklist_items: []
    };
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

  // UPDATED: Get workflow stage with KYC stage
  const getWorkflowStage = () => {
    if (!assignment) return 'loading';
    
    // Check if we have system calculated price and waiting for customer
    if (systemCalculatedPrice && !customerResponse) {
      return 'awaiting_customer';
    }
    
    // NEW: Check if customer accepted and waiting for KYC
    if (customerResponse === 'accept' && !kycData.agent_declaration) {
      return 'kyc_verification';
    }
    
    // NEW: Check if KYC completed and waiting for payment
    if (customerResponse === 'accept' && kycData.agent_declaration && !selectedPaymentMethod) {
      return 'payment_selection';
    }

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
    const handleImageUpload = async (_key: string, file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
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
        isSubmitting={submitInspectionMutation.isPending}
        deviceInfo={{
          brand: assignment.device_brand,
          model: assignment.device_model,
          storage: assignment.device_storage,
        }}
        onImageUpload={handleImageUpload}
      />
    );
  }

  // Show customer acceptance UI
  if (showCustomerAcceptance && systemCalculatedPrice) {
    return (
      <CustomerAcceptanceScreen
        deviceInfo={{
          brand: assignment.device_brand,
          model: assignment.device_model,
          storage: assignment.device_storage,
        }}
        customerInfo={{
          name: assignment.customer_name,
          phone: assignment.customer_phone,
        }}
        pricing={systemCalculatedPrice}
        customerResponse={customerResponse}
        rejectionReason={rejectionReason}
        customerSignature={customerSignature}
        onCustomerResponseChange={setCustomerResponse}
        onRejectionReasonChange={setRejectionReason}
        onSignatureChange={setCustomerSignature}
        onSubmit={handleCustomerAcceptance}
        onCancel={() => setShowCustomerAcceptance(false)}
        isSubmitting={customerAcceptanceMutation.isPending}
      />
    );
  }

  // NEW: Show KYC verification form
  if (showKYCForm && systemCalculatedPrice) {
    return (
      <AgentKYCVerificationScreen
        customerInfo={{
          name: assignment.customer_name,
          phone: assignment.customer_phone,
        }}
        finalPrice={systemCalculatedPrice.final_price}
        kycData={kycData}
        setKycData={setKycData}
        capturedImages={capturedImages}
        setCapturedImages={setCapturedImages}
        onSubmit={handleKYCSubmission}
        onCancel={() => setShowKYCForm(false)}
        isSubmitting={kycVerificationMutation.isPending}
      />
    );
  }

  // NEW: Show payment processing screen
  if (showPaymentScreen && systemCalculatedPrice) {
    return (
      <AgentPaymentProcessingScreen
        customerInfo={{
          name: assignment.customer_name,
          phone: assignment.customer_phone,
        }}
        finalAmount={systemCalculatedPrice.final_price}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        completionNotes={completionNotes}
        setCompletionNotes={setCompletionNotes}
        onComplete={handlePaymentCompletion}
        onCancel={() => setShowPaymentScreen(false)}
        isProcessing={paymentProcessMutation.isPending}
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

      {/* System Final Price Display (if calculated) */}
      {systemCalculatedPrice && (
        <div className="bg-gradient-to-r from-[#1B8A05]/20 to-[#16a34a]/20 border border-[#1B8A05] rounded-2xl p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#1B8A05] flex items-center gap-2">
              <BadgeCheck size={20} />
              System Calculated Price
            </h3>
            <span className="bg-[#1B8A05] text-white px-2 py-1 rounded text-xs font-bold">
              FINAL
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={24} className="text-[#1B8A05]" />
            <span className="text-2xl font-bold text-[#1B8A05]">
              {systemCalculatedPrice.final_price.toLocaleString('en-IN')}
            </span>
          </div>
          {systemCalculatedPrice.deductions.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Deductions: </span>
              {systemCalculatedPrice.deductions.map((d, i) => (
                <span key={i}>
                  {d.reason} (-₹{d.amount.toLocaleString('en-IN')})
                  {i < systemCalculatedPrice.deductions.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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
      {assignment.pickup_address && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
          <h3 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-[#FEC925]" />
            Pickup Location
          </h3>
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
        </div>
      )}

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

      {/* UPDATED: Workflow Progress with KYC stage */}
      <WorkflowProgress stage={stage} />

      {/* UPDATED: Action Buttons with KYC workflow */}
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

          {/* Stage: Awaiting Customer Response */}
          {stage === 'awaiting_customer' && (
            <button
              onClick={() => setShowCustomerAcceptance(true)}
              className="w-full py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <UserCheck size={24} />
              Customer Response Required
            </button>
          )}

          {/* NEW: Stage: KYC Verification */}
          {stage === 'kyc_verification' && (
            <button
              onClick={() => setShowKYCForm(true)}
              className="w-full py-4 bg-[#1B8A05] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <Shield size={24} />
              Complete KYC Verification
            </button>
          )}

          {/* Stage: Payment Selection */}
          {stage === 'payment_selection' && (
            <button
              onClick={() => setShowPaymentScreen(true)}
              className="w-full py-4 bg-[#1B8A05] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <CreditCard size={24} />
              Process Payment
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

      {/* Modals */}
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
// SUB COMPONENTS - COMPLETE IMPLEMENTATIONS
// =====================================================

// Status Badge Component
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

// UPDATED: Workflow Progress with KYC stage
const WorkflowProgress: React.FC<{ stage: string }> = ({ stage }) => {
  const stages = [
    'pending', 'accepted', 'en_route', 'checked_in', 'inspecting', 
    'awaiting_customer', 'kyc_verification', 'payment_selection', 'completed'
  ];
  const currentIndex = stages.indexOf(stage);

  const stageLabels: Record<string, string> = {
    pending: 'Accept',
    accepted: 'Start',
    en_route: 'Check In',
    checked_in: 'Inspect',
    inspecting: 'Submit',
    awaiting_customer: 'Customer',
    kyc_verification: 'KYC',      // NEW
    payment_selection: 'Payment',
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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

// COMPLETE Inspection Form Component
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

  const requiredImagesCaptured = Boolean(images.front && images.back && images.imei);
  
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
        <Section title="Inspection Notes (Required)">
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

        {/* System pricing note */}
        <div className="bg-[#FEC925]/10 border border-[#FEC925] rounded-xl p-4">
          <h4 className="font-bold text-[#1C1C1B] mb-2 flex items-center gap-2">
            <BadgeCheck size={18} className="text-[#b48f00]" />
            System Will Calculate Final Price
          </h4>
          <p className="text-sm text-gray-600">
            After you submit the inspection, our system will automatically calculate the final price based on the device condition and market data. This price cannot be adjusted and will be presented to the customer for acceptance.
          </p>
        </div>

        {/* Validation Summary */}
        {!isFormValid && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Complete Required Fields
            </h4>
            <ul className="text-sm text-red-600 space-y-1">
              {!requiredImagesCaptured && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Capture required photos (Front, Back, IMEI)
                </li>
              )}
              {(!data.imei_number || data.imei_number.length < 15) && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Enter valid IMEI number (15 digits)
                </li>
              )}
              {(!data.notes || data.notes.trim().length === 0) && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
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
                Submit for System Pricing
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

// COMPLETE Customer Acceptance Screen Component
interface CustomerAcceptanceScreenProps {
  deviceInfo: { brand: string; model: string; storage: string };
  customerInfo: { name: string; phone: string };
  pricing: {
    final_price: number;
    original_estimate: number;
    deductions: Array<{ reason: string; amount: number }>;
    is_final: boolean;
  };
  customerResponse: 'accept' | 'reject' | null;
  rejectionReason: string;
  customerSignature: string;
  onCustomerResponseChange: (response: 'accept' | 'reject' | null) => void;
  onRejectionReasonChange: (reason: string) => void;
  onSignatureChange: (signature: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CustomerAcceptanceScreen: React.FC<CustomerAcceptanceScreenProps> = ({
  deviceInfo,
  customerInfo,
  pricing,
  customerResponse,
  rejectionReason,
  customerSignature,
  onCustomerResponseChange,
  onRejectionReasonChange,
  onSignatureChange,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B8A05] to-[#16a34a] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="text-white font-bold">Customer Response</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">System Final Price</h1>
          <p className="text-white/80">Customer must accept or reject this price</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Device Info */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Package className="text-[#FEC925]" size={24} />
            <div>
              <h3 className="font-bold text-[#1C1C1B]">{deviceInfo.brand} {deviceInfo.model}</h3>
              <p className="text-sm text-gray-500">{deviceInfo.storage}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <User className="text-[#FEC925]" size={24} />
            <div>
              <h3 className="font-bold text-[#1C1C1B]">{customerInfo.name}</h3>
              <p className="text-sm text-gray-500">{customerInfo.phone}</p>
            </div>
          </div>
        </div>

        {/* Final Price Display */}
        <div className="bg-gradient-to-r from-[#1B8A05]/20 to-[#16a34a]/20 border border-[#1B8A05] rounded-xl p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-[#1B8A05] mb-2">System Calculated Price</h2>
            <div className="flex items-center justify-center gap-2">
              <IndianRupee size={32} className="text-[#1B8A05]" />
              <span className="text-4xl font-bold text-[#1B8A05]">
                {pricing.final_price.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-[#1B8A05] mt-2">
              Original Estimate: ₹{pricing.original_estimate.toLocaleString('en-IN')}
            </p>
          </div>

          {pricing.deductions.length > 0 && (
            <div className="bg-white/50 rounded-lg p-3">
              <h4 className="font-semibold text-[#1B8A05] mb-2 text-sm">Price Deductions:</h4>
              {pricing.deductions.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{d.reason}</span>
                  <span className="text-red-600 font-semibold">-₹{d.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Response */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4">Customer Response</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => onCustomerResponseChange('accept')}
              className={`p-4 rounded-xl border-2 transition flex items-center justify-center gap-3 ${
                customerResponse === 'accept'
                  ? 'border-[#1B8A05] bg-[#1B8A05]/10 text-[#1B8A05]'
                  : 'border-gray-200 text-gray-600 hover:border-[#1B8A05] hover:text-[#1B8A05]'
              }`}
            >
              <ThumbsUp size={24} />
              <span className="font-bold">Accept</span>
            </button>
            
            <button
              onClick={() => onCustomerResponseChange('reject')}
              className={`p-4 rounded-xl border-2 transition flex items-center justify-center gap-3 ${
                customerResponse === 'reject'
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-600'
              }`}
            >
              <ThumbsDown size={24} />
              <span className="font-bold">Reject</span>
            </button>
          </div>

          {customerResponse === 'accept' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Signature (Optional)</label>
                <textarea
                  value={customerSignature}
                  onChange={(e) => onSignatureChange(e.target.value)}
                  placeholder="Customer can sign here or use signature pad..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-20"
                />
              </div>
            </div>
          )}

          {customerResponse === 'reject' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => onRejectionReasonChange(e.target.value)}
                placeholder="Why did the customer reject the price?"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-20"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onSubmit}
            disabled={!customerResponse || isSubmitting}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              customerResponse && !isSubmitting
                ? customerResponse === 'accept'
                  ? 'bg-[#1B8A05] text-white hover:bg-[#157004]'
                  : 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {customerResponse === 'accept' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                {customerResponse === 'accept' ? 'Customer Accepts Price' : 'Customer Rejects Price'}
              </>
            )}
          </button>
          {!customerResponse && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Please select customer response
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// NEW: COMPLETE Agent KYC Verification Screen Component
interface AgentKYCVerificationScreenProps {
  customerInfo: { name: string; phone: string };
  finalPrice: number;
  kycData: Partial<KYCVerificationData>;
  setKycData: React.Dispatch<React.SetStateAction<Partial<KYCVerificationData>>>;
  capturedImages: { id_proof: string | null; signature: string | null; selfie: string | null };
  setCapturedImages: React.Dispatch<React.SetStateAction<{ id_proof: string | null; signature: string | null; selfie: string | null }>>;
  onSubmit: (data: KYCVerificationData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AgentKYCVerificationScreen: React.FC<AgentKYCVerificationScreenProps> = ({
  // customerInfo,
  finalPrice,
  kycData,
  setKycData,
  capturedImages,
  setCapturedImages,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const updateField = <K extends keyof KYCVerificationData>(key: K, value: KYCVerificationData[K]) => {
    setKycData(prev => ({ ...prev, [key]: value }));
  };

  const updateAddress = <K extends keyof CustomerAddress>(key: K, value: CustomerAddress[K]) => {
    setKycData(prev => ({
      ...prev,
      customer_address: {
        ...prev.customer_address,
        [key]: value
      } as CustomerAddress
    }));
  };

  const captureImage = async (type: 'id_proof' | 'signature' | 'selfie') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setCapturedImages(prev => ({ ...prev, [type]: base64 }));
          
          if (type === 'id_proof') updateField('id_proof_photo', base64);
          if (type === 'signature') updateField('customer_signature', base64);
          if (type === 'selfie') updateField('customer_selfie', base64);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const isFormValid = () => {
    return (
      kycData.customer_id_proof_type &&
      kycData.customer_id_number &&
      kycData.customer_full_name &&
      kycData.customer_father_name &&
      kycData.customer_date_of_birth &&
      kycData.customer_address?.line1 &&
      kycData.customer_address?.city &&
      kycData.customer_address?.state &&
      kycData.customer_address?.pincode &&
      capturedImages.id_proof &&
      capturedImages.signature &&
      capturedImages.selfie &&
      kycData.agent_declaration
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit(kycData as KYCVerificationData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B8A05] to-[#16a34a] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="text-white font-bold">Customer KYC Verification</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Verify Customer Identity</h1>
          <p className="text-white/80">Complete KYC for ₹{finalPrice.toLocaleString('en-IN')} transaction</p>
        </div>
      </div>

      {/* KYC Form Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Customer Identification Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#FEC925]" />
            Customer Identification
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Proof Type</label>
              <select
                value={kycData.customer_id_proof_type || 'aadhaar'}
                onChange={(e) => updateField('customer_id_proof_type', e.target.value as 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | 'pan_card')}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none bg-white"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="driving_license">Driving License</option>
                <option value="passport">Passport</option>
                <option value="voter_id">Voter ID</option>
                <option value="pan_card">PAN Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number</label>
              <input
                type="text"
                value={kycData.customer_id_number || ''}
                onChange={(e) => updateField('customer_id_number', e.target.value)}
                placeholder="Enter ID number"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Proof Photo</label>
              <button
                onClick={() => captureImage('id_proof')}
                className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                  capturedImages.id_proof ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
                }`}
              >
                {capturedImages.id_proof ? (
                  <>
                    <CheckCircle2 className="text-[#1B8A05]" size={24} />
                    <span className="text-sm font-semibold text-[#1B8A05]">ID Proof Captured</span>
                  </>
                ) : (
                  <>
                    <Camera className="text-gray-400" size={24} />
                    <span className="text-sm text-gray-600">Capture ID Proof Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <User size={20} className="text-[#FEC925]" />
            Personal Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={kycData.customer_full_name || ''}
                onChange={(e) => updateField('customer_full_name', e.target.value)}
                placeholder="Customer's full name as per ID"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
              <input
                type="text"
                value={kycData.customer_father_name || ''}
                onChange={(e) => updateField('customer_father_name', e.target.value)}
                placeholder="Father's full name"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={kycData.customer_date_of_birth || ''}
                onChange={(e) => updateField('customer_date_of_birth', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <Home size={20} className="text-[#FEC925]" />
            Customer Address
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
              <input
                type="text"
                value={kycData.customer_address?.line1 || ''}
                onChange={(e) => updateAddress('line1', e.target.value)}
                placeholder="House/Building number, Street"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={kycData.customer_address?.line2 || ''}
                onChange={(e) => updateAddress('line2', e.target.value)}
                placeholder="Locality, Area"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={kycData.customer_address?.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder="City"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={kycData.customer_address?.state || ''}
                  onChange={(e) => updateAddress('state', e.target.value)}
                  placeholder="State"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
              <input
                type="text"
                value={kycData.customer_address?.pincode || ''}
                onChange={(e) => updateAddress('pincode', e.target.value)}
                placeholder="6-digit PIN code"
                maxLength={6}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Document Capture Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <Camera size={20} className="text-[#FEC925]" />
            Document Capture
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => captureImage('signature')}
              className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                capturedImages.signature ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
              }`}
            >
              {capturedImages.signature ? (
                <>
                  <CheckCircle2 className="text-[#1B8A05]" size={24} />
                  <span className="text-xs font-semibold text-[#1B8A05]">Signature Captured</span>
                </>
              ) : (
                <>
                  <Edit3 className="text-gray-400" size={24} />
                  <span className="text-xs text-gray-600">Customer Signature</span>
                </>
              )}
            </button>

            <button
              onClick={() => captureImage('selfie')}
              className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                capturedImages.selfie ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
              }`}
            >
              {capturedImages.selfie ? (
                <>
                  <CheckCircle2 className="text-[#1B8A05]" size={24} />
                  <span className="text-xs font-semibold text-[#1B8A05]">Selfie Captured</span>
                </>
              ) : (
                <>
                  <User className="text-gray-400" size={24} />
                  <span className="text-xs text-gray-600">Selfie with Agent</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verification Notes Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4">Verification Notes (Optional)</h3>
          <textarea
            value={kycData.verification_notes || ''}
            onChange={(e) => updateField('verification_notes', e.target.value)}
            placeholder="Add any additional notes about the verification process..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-20"
          />
        </div>

        {/* Agent Declaration Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <Shield size={20} className="text-[#FEC925]" />
            Agent Declaration
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={kycData.agent_declaration || false}
                onChange={(e) => updateField('agent_declaration', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#1B8A05] border-gray-300 rounded focus:ring-[#1B8A05]"
              />
              <div>
                <p className="font-semibold text-blue-900 mb-2">I hereby declare that:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• I have verified the customer's identity documents</li>
                  <li>• The customer is present and has provided consent</li>
                  <li>• All information captured is accurate and complete</li>
                  <li>• The customer understands the transaction terms</li>
                  <li>• The customer's identity has been confirmed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Form Validation Summary */}
        {!isFormValid() && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Complete Required Fields
            </h4>
            <ul className="text-sm text-red-600 space-y-1">
              {!kycData.customer_full_name && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Customer full name is required
                </li>
              )}
              {!capturedImages.id_proof && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  ID proof photo is required
                </li>
              )}
              {!capturedImages.signature && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Customer signature is required
                </li>
              )}
              {!capturedImages.selfie && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Customer selfie with agent is required
                </li>
              )}
              {!kycData.agent_declaration && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Agent declaration must be confirmed
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
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              isFormValid() && !isSubmitting
                ? 'bg-[#1B8A05] text-white hover:bg-[#157004]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Shield size={20} />
                Complete KYC Verification
              </>
            )}
          </button>
          {!isFormValid() && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Complete all required fields and capture all documents
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// NEW: COMPLETE Agent Payment Processing Screen Component
interface AgentPaymentProcessingScreenProps {
  customerInfo: { name: string; phone: string };
  finalAmount: number;
  selectedPaymentMethod: 'cash' | 'partner_wallet' | null;
  setSelectedPaymentMethod: React.Dispatch<React.SetStateAction<'cash' | 'partner_wallet' | null>>;
  completionNotes: string;
  setCompletionNotes: React.Dispatch<React.SetStateAction<string>>;
  onComplete: (data: PaymentData) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const AgentPaymentProcessingScreen: React.FC<AgentPaymentProcessingScreenProps> = ({
  customerInfo,
  finalAmount,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  completionNotes,
  setCompletionNotes,
  onComplete,
  onCancel,
  isProcessing,
}) => {
  const handlePaymentProcess = () => {
    const paymentData: PaymentData = {
      payment_method: selectedPaymentMethod!,
      completion_notes: completionNotes || `Payment completed via ${selectedPaymentMethod}`
    };

    if (selectedPaymentMethod === 'cash') {
      paymentData.cash_payment_confirmation = {
        amount_given: finalAmount,
        payment_notes: 'Cash payment received from customer'
      };
    }

    onComplete(paymentData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1C1C1B] to-[#2d2d2c] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="text-white font-bold">Process Payment</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Complete Transaction</h1>
          <p className="text-white/80">Process ₹{finalAmount.toLocaleString('en-IN')} payment</p>
        </div>
      </div>

      {/* Payment Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Transaction Summary */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-3">Transaction Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-semibold">{customerInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold">{customerInfo.phone}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-bold text-[#1C1C1B]">Final Price:</span>
              <span className="font-bold text-[#1B8A05] flex items-center">
                <IndianRupee size={18} />
                {finalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4">Select Payment Method</h3>
          
          <div className="space-y-3">
            {/* Cash Payment */}
            <button
              onClick={() => setSelectedPaymentMethod('cash')}
              className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                selectedPaymentMethod === 'cash'
                  ? 'border-[#1B8A05] bg-[#1B8A05]/10'
                  : 'border-gray-200 hover:border-[#1B8A05]'
              }`}
            >
              <div className="w-12 h-12 bg-[#FEC925]/20 rounded-xl flex items-center justify-center">
                <IndianRupee className="text-[#FEC925]" size={24} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-[#1C1C1B]">Cash Payment</h4>
                <p className="text-sm text-gray-500">Customer pays in cash. Blocked amount will be re-credited to your wallet.</p>
              </div>
              {selectedPaymentMethod === 'cash' && (
                <CheckCircle2 className="text-[#1B8A05]" size={24} />
              )}
            </button>

            {/* Wallet Payment */}
            <button
              onClick={() => setSelectedPaymentMethod('partner_wallet')}
              className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                selectedPaymentMethod === 'partner_wallet'
                  ? 'border-[#1B8A05] bg-[#1B8A05]/10'
                  : 'border-gray-200 hover:border-[#1B8A05]'
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-[#1C1C1B]">Partner Wallet</h4>
                <p className="text-sm text-gray-500">Pay from your wallet. Amount will be deducted from blocked balance.</p>
              </div>
              {selectedPaymentMethod === 'partner_wallet' && (
                <CheckCircle2 className="text-[#1B8A05]" size={24} />
              )}
            </button>
          </div>

          {/* Payment Method Explanation */}
          {selectedPaymentMethod && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-1">
                {selectedPaymentMethod === 'cash' ? 'Cash Payment Process:' : 'Wallet Payment Process:'}
              </h4>
              <p className="text-sm text-blue-800">
                {selectedPaymentMethod === 'cash'
                  ? 'The blocked amount will be returned to your available wallet balance since customer is paying in cash.'
                  : 'The blocked amount will be deducted from your wallet as payment for the device purchase.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Completion Notes */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4">Completion Notes (Optional)</h3>
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes about the deal completion..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-20"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handlePaymentProcess}
            disabled={!selectedPaymentMethod || isProcessing}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              selectedPaymentMethod && !isProcessing
                ? 'bg-[#1B8A05] text-white hover:bg-[#157004]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle2 size={20} />
                Complete Transaction
              </>
            )}
          </button>
          {!selectedPaymentMethod && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Please select a payment method
            </p>
          )}
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