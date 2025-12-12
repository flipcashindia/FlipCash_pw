// src/pages/agent/AgentLeadDetailPage.tsx
// Agent Lead Detail - COMPLETE FULL VERSION WITH ALL DISPLAYS
// Updated for NEW 3-step KYC → Payment → Complete workflow
// Includes: Inspection, Customer Acceptance, KYC, Payment, Timeline, Results Display

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
  Edit3,
  Home,
  ChevronDown,
  ChevronUp,
  Download,
  Image as ImageIcon,
  FileCheck,
  Receipt,
  History,
  MapPinIcon,
  UserCircle,
  Boxes,
  CheckSquare,
  XSquare,
  RefreshCw,
} from 'lucide-react';

// ✅ UPDATED IMPORTS - NEW 3-STEP WORKFLOW
import {
  useAgentAssignment,
  useAcceptAssignment,
  useRejectAssignment,
  useStartJourney,
  useCheckIn,
  useVerifyCode,
  useStartInspection,
  useSubmitInspection,
  // useCustomerAcceptance,
  useUploadKYCDocuments,      // ✅ NEW
  useProcessPayment,           // ✅ NEW
  useFinalComplete,            // ✅ NEW
  useWorkflowStatus,           // ✅ NEW
  useCurrentLocation,
} from '../../hooks/useAgentApp';

import type { 
  DeviceInspectionData,
  KYCDocumentUploadRequest,   // ✅ NEW
  PaymentProcessRequest,       // ✅ NEW
  // CustomerAddress,
} from '../../api/types/agentApp.types';
import { useAuthStore } from '../../stores/authStore';


import VerificationCodeEntry from '../../components/agent/VerificationCodeEntry';
import DeviceImageCapture from '../../components/agent/DeviceImageCapture';

// Type definitions for timeline and displays
interface StatusLog {
  status: string;
  timestamp: string;
  changed_by: string;
  notes?: string;
  gps_coordinates?: { latitude: number; longitude: number };
  attached_photos?: string[];
}

interface InspectionResult {
  screen_condition: string;
  body_condition: string;
  battery_health: number | null;
  accessories: {
    charger_available: boolean;
    box_available: boolean;
    earphones_available: boolean;
    bill_available: boolean;
  };
  functional_issues: string[];
  inspection_photos: string[];
  inspection_notes: string;
  verified_imei: string;
  submitted_at: string;
}

// ============================================================================
// UPDATE INSPECTION DATA INTERFACE (Replace existing around line 150)
// ============================================================================

interface DynamicInspectionData {
  // Core fields
  inspection_notes: string;
  inspection_photos: string[];
  verified_imei: string;
  imei_matches: boolean;
  device_powers_on: boolean;
  
  // Dynamic attribute responses - key-value pairs
  attribute_responses: Record<string, any>;
  
  // Image fields
  front_image?: string;
  back_image?: string;
  screen_image?: string;
  imei_image?: string;
  defect_images?: string[];
}

interface KYCDocuments {
  id_proof_type: string;
  id_number: string;
  id_proof_photo: string;
  customer_signature: string;
  customer_selfie: string;
  verified_at: string;
}

interface PaymentDetails {
  payment_method: string;
  amount: number;
  transaction_id?: string;
  processed_at: string;
  wallet_balance_before?: number;
  wallet_balance_after?: number;
}

// ⬇️ INSERT NEW CODE HERE (After line 136) ⬇️

interface SystemCalculatedPrice {
  final_price: number;
  original_estimate: number;
  deductions: Array<{
    reason: string;
    amount: string | number;
    type?: string;
  }>;
  additions?: Array<{
    reason: string;
    amount: string | number;
    type?: string;
  }>;
  is_final: boolean;
}

interface VerifiedConditions {
  screen_condition: string;
  body_condition: string;
  battery_health: number | null;
  accessories: Record<string, boolean>;
  functional_issues: string[];
  device_powers_on?: boolean;
  display_working?: boolean;
  touch_working?: boolean;
  camera_working?: boolean;
  speaker_working?: boolean;
  microphone_working?: boolean;
  wifi_working?: boolean;
  bluetooth_working?: boolean;
  icloud_locked?: boolean;
  water_damage?: boolean;
  physical_damage?: boolean;
}

interface PricingBreakdown {
  base_price: string;
  deductions: Array<{
    reason: string;
    amount: string;
    type: string;
  }>;
  additions?: Array<{
    reason: string;
    amount: string;
    type: string;
  }>;
  total_deductions: string;
  total_additions?: string;
  final_price: string;
  calculation_method?: string;
}

// interface VisitData {
//   inspection_notes: string;
//   inspection_photos: string[];
//   verified_imei: string;
//   verified_conditions: VerifiedConditions;
//   pricing_breakdown: PricingBreakdown;
//   partner_recommended_price: string;
//   full_assessment: any;
//   inspection_completed_at: string;
// }

// interface CustomerResponseData {
//   response: 'accepted' | 'rejected';
//   responded_at: string;
//   final_price?: string;
//   rejection_reason?: string;
// }

// ⬆️ END OF NEW CODE ⬆️

// Component 1: Condition Comparison Table
interface ConditionComparisonProps {
  customerClaimed: any;
  agentVerified: VerifiedConditions;
}

const ConditionComparisonTable: React.FC<ConditionComparisonProps> = ({
  customerClaimed,
  agentVerified
}) => {
  const conditions = [
    { key: 'screen_condition', label: 'Screen Condition' },
    { key: 'body_condition', label: 'Body Condition' },
    { key: 'battery_health', label: 'Battery Health', suffix: '%' },
  ];

  const hasDifference = (key: string) => {
    return customerClaimed?.[key as keyof typeof customerClaimed] !== agentVerified?.[key as keyof typeof agentVerified];
  };

  const getValueDisplay = (value: any, suffix?: string) => {
    if (value === null || value === undefined) return '-';
    return `${value}${suffix || ''}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Condition
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Claimed
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent Verified
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {conditions.map(({ key, label, suffix }) => {
            const isDifferent = hasDifference(key);
            const customerValue = customerClaimed?.[key];
            const verifiedValue = agentVerified?.[key as keyof typeof agentVerified];
            
            return (
              <tr key={key} className={isDifferent ? 'bg-yellow-50' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {label}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {getValueDisplay(customerValue, suffix)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {getValueDisplay(verifiedValue, suffix)}
                </td>
                <td className="px-4 py-3 text-center">
                  {isDifferent ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Differs
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Matches
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Component 2: Functional Issues Display
interface FunctionalIssuesProps {
  customerIssues: string[];
  verifiedIssues: string[];
}

const FunctionalIssuesDisplay: React.FC<FunctionalIssuesProps> = ({
  customerIssues = [],
  verifiedIssues = []
}) => {
  const allIssues = [...new Set([...customerIssues, ...verifiedIssues])];
  
  const getIssueIcon = (issue: string) => {
    const icons: Record<string, any> = {
      wifi: Wifi,
      bluetooth: Bluetooth,
      speaker: Volume2,
      microphone: Mic,
      camera: Camera,
      display: Eye,
      touch: Smartphone,
      charging: Zap,
    };
    const Icon = icons[issue.toLowerCase()] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Functional Issues
      </h4>
      
      {allIssues.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          No functional issues reported
        </div>
      ) : (
        <div className="space-y-2">
          {allIssues.map((issue) => {
            const customerReported = customerIssues.includes(issue);
            const agentFound = verifiedIssues.includes(issue);
            
            return (
              <div
                key={issue}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  customerReported && agentFound
                    ? 'bg-green-50 border-green-200'
                    : !customerReported && agentFound
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getIssueIcon(issue)}
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {issue.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${customerReported ? 'text-gray-700' : 'text-gray-400'}`}>
                    Customer: {customerReported ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${agentFound ? 'text-red-600' : 'text-green-600'}`}>
                    Agent: {agentFound ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Component 3: Accessories Comparison
interface AccessoriesComparisonProps {
  customerAccessories: Record<string, boolean>;
  verifiedAccessories: Record<string, boolean>;
}

const AccessoriesComparison: React.FC<AccessoriesComparisonProps> = ({
  customerAccessories = {},
  verifiedAccessories = {}
}) => {
  const accessories = [
    { key: 'charger', label: 'Charger', icon: '🔌' },
    { key: 'box', label: 'Original Box', icon: '📦' },
    { key: 'earphones', label: 'Earphones', icon: '🎧' },
    { key: 'bill', label: 'Bill/Invoice', icon: '🧾' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Boxes className="w-4 h-4" />
        Accessories Verification
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        {accessories.map(({ key, label, icon }) => {
          const customerHas = customerAccessories[key] === true || customerAccessories[`${key}_available`] === true;
          const agentVerified = verifiedAccessories[key] === true || verifiedAccessories[`${key}_available`] === true;
          const matches = customerHas === agentVerified;
          
          return (
            <div
              key={key}
              className={`p-3 rounded-lg border-2 transition-all ${
                matches
                  ? agentVerified
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                  : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                {matches ? (
                  <CheckSquare className="w-4 h-4 text-green-600" />
                ) : (
                  <XSquare className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-2">
                {label}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={customerHas ? 'text-green-600' : 'text-gray-400'}>
                  Claimed: {customerHas ? '✓' : '✗'}
                </span>
                <span className={agentVerified ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  Found: {agentVerified ? '✓' : '✗'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Component 4: Pricing Breakdown Display
interface PricingBreakdownDisplayProps {
  breakdown: PricingBreakdown;
  originalEstimate?: string;
}

const PricingBreakdownDisplay: React.FC<PricingBreakdownDisplayProps> = ({
  breakdown,
  originalEstimate
}) => {
  const getDeductionIcon = (type: string) => {
    const icons: Record<string, string> = {
      cosmetic: '🎨',
      battery: '🔋',
      functional: '⚡',
      accessory: '📦',
      storage: '💾',
      physical: '🔨',
    };
    return icons[type.toLowerCase()] || '•';
  };

  const getDeductionColor = (type: string) => {
    const colors: Record<string, string> = {
      cosmetic: 'text-orange-600',
      battery: 'text-blue-600',
      functional: 'text-red-600',
      accessory: 'text-purple-600',
      storage: 'text-cyan-600',
      physical: 'text-amber-600',
    };
    return colors[type.toLowerCase()] || 'text-gray-600';
  };

  const parseAmount = (amount: string | number): number => {
    if (typeof amount === 'number') return amount;
    return parseFloat(amount) || 0;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {/* Original Estimate */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          Original Estimate
        </span>
        <span className="text-lg font-semibold text-gray-900">
          ₹{parseFloat(originalEstimate || breakdown.base_price).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Deductions */}
      {breakdown.deductions && breakdown.deductions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">
              Deductions Applied:
            </span>
          </div>
          
          {breakdown.deductions.map((deduction, index) => (
            <div
              key={index}
              className="flex items-start justify-between pl-6 py-2 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="flex items-start gap-2 flex-1">
                <span className="text-base leading-none">
                  {getDeductionIcon(deduction.type)}
                </span>
                <span className={`text-sm ${getDeductionColor(deduction.type)}`}>
                  {deduction.reason}
                </span>
              </div>
              <span className="text-sm font-semibold text-red-600 whitespace-nowrap ml-4">
                -₹{parseAmount(deduction.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
          
          {/* Total Deductions */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              Total Deductions
            </span>
            <span className="text-base font-bold text-red-600">
              -₹{parseAmount(breakdown.total_deductions).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Additions (if any) */}
      {breakdown.additions && breakdown.additions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            Additions:
          </span>
          {breakdown.additions.map((addition, index) => (
            <div
              key={index}
              className="flex items-start justify-between pl-6 py-1"
            >
              <span className="text-sm text-green-600">{addition.reason}</span>
              <span className="text-sm font-semibold text-green-600">
                +₹{parseAmount(addition.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Final Price */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-gray-300">
        <div>
          <div className="text-base font-bold text-gray-900">
            Final Offer Price
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            System calculated
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ₹{parseAmount(breakdown.final_price).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};









// ✅ NEW: Helper function to convert base64 to File
const base64ToFile = async (base64: string, filename: string): Promise<File> => {
  const response = await fetch(base64);
  const blob = await response.blob();
  return new File([blob], filename, { type: 'image/jpeg' });
};

const AgentLeadDetailPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  
  const { data: assignment, isLoading, error, refetch } = useAgentAssignment(assignmentId || '');
  
  // console.log('[AgentLeadDetailPage] Assignment data:', assignment);
  

  // ✅ UPDATED MUTATIONS - NEW 3-STEP WORKFLOW
  const acceptMutation = useAcceptAssignment();
  const rejectMutation = useRejectAssignment();
  const startJourneyMutation = useStartJourney();
  const checkInMutation = useCheckIn();
  const verifyCodeMutation = useVerifyCode();
  const startInspectionMutation = useStartInspection();
  const submitInspectionMutation = useSubmitInspection();
  // const customerAcceptanceMutation = useCustomerAcceptance();
  const uploadKYCMutation = useUploadKYCDocuments();         // ✅ NEW
  const processPaymentMutation = useProcessPayment();        // ✅ NEW
  const finalCompleteMutation = useFinalComplete();          // ✅ NEW
  const workflowStatusQuery = useWorkflowStatus(assignmentId || ''); // ✅ NEW
  const { getCurrentLocation } = useCurrentLocation();

  // Modal/Form states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyCodeModal, setShowVerifyCodeModal] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showCustomerAcceptance, setShowCustomerAcceptance] = useState(false);
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  
  // NEW: Expandable sections
  const [showTimeline, setShowTimeline] = useState(false);
  const [showInspectionResults, setShowInspectionResults] = useState(false);
  const [showKYCDocuments, setShowKYCDocuments] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
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

  // System calculated price state
  const [systemCalculatedPrice, setSystemCalculatedPrice] = useState<{
    final_price: number;
    original_estimate: number;
    deductions: Array<{ reason: string; amount: number }>;
    is_final: boolean;
  } | null>(null);

  // Customer response state
  const [customerResponse, setCustomerResponse] = useState<'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  // const [customerSignature, setCustomerSignature] = useState<string>('');

  // KYC verification state (still using old structure for UI)
  // ✅ NEW - Use this
  const [kycData, setKycData] = useState<{
    id_proof_type: 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | 'pan';
    id_number: string;
    address_proof_type?: 'utility_bill' | 'bank_statement' | 'rental_agreement';  // ✅ REMOVED: 'aadhaar' | 'passport'
    verification_notes: string;
  }>({
    id_proof_type: 'aadhaar',
    id_number: '',
    address_proof_type: undefined,
    verification_notes: ''
  });

  // Captured images state for KYC PaymentProcessRequest
  // ✅ NEW - Use this
  const [capturedImages, setCapturedImages] = useState({
    id_proof_front: null as string | null,
    id_proof_back: null as string | null,
    signature: null as string | null,
    address_proof: null as string | null,
    device_bill: null as string | null,
    device_warranty: null as string | null,
  });
  // Payment processing state  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'partner_wallet' | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // NEW: Mock data for displays (replace with real API data)
  const [submittedInspection, setSubmittedInspection] = useState<InspectionResult | null>(null);
  const [submittedKYC, setSubmittedKYC] = useState<KYCDocuments | null>(null);
  const [completedPayment, setCompletedPayment] = useState<PaymentDetails | null>(null);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);

  // Update KYC data when assignment loads
  // useEffect(() => {
  //   if (assignment?.customer_name && !kycData.customer_full_name) {
  //     setKycData(prev => ({
  //       ...prev,
  //       customer_full_name: assignment.customer_name
  //     }));
  //   }
  // }, [assignment?.customer_name]);

// ============================================================================
// REPLACE THE HOOKS SECTION (After other hooks, around line 450)
// ============================================================================

  // Manual fetch for device attributes instead of using hook
  const [deviceAttributes, setDeviceAttributes] = useState<any>(null);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [attributesError, setAttributesError] = useState<string | null>(null);

  // Fetch device attributes manually
  // useEffect(() => {
  //   console.log('Assignment ID for fetching device attributes:', assignmentId);
  //   const fetchDeviceAttributes = async () => {
  //     if (!assignmentId) return;
      
  //     setIsLoadingAttributes(true);
  //     setAttributesError(null);
      
  //     try {
  //       const token = useAuthStore.getState().accessToken;
        
  //       if (!token) {
  //         throw new Error('Authentication token not found');
  //       }
        
  //       console.log('Fetching device attributes for assignment:', assignmentId);
        
  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_BASE_URL}/partner-agents/assignments/${assignmentId}/device-attributes/`,
  //         {
  //           method: 'GET',
  //           headers: {
  //             'Authorization': `Bearer ${token}`,
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );
  //       console.log('getting attribures response : ', response);

  //       console.log('[DeviceAttributes] Fetch response status:', response.status);
        
  //       if (!response.ok) {
  //         const errorData = await response.json().catch(() => ({}));
  //         throw new Error(errorData.error || `Failed to fetch device attributes: ${response.status}`);
  //       }
        
  //       const data = await response.json();
  //       console.log('[DeviceAttributes] Fetched successfully:', data);
        
  //       setDeviceAttributes(data);
  //     } catch (err: any) {
  //       console.error('[DeviceAttributes] Fetch error:', err);
  //       setAttributesError(err.message || 'Failed to load device attributes');
  //     } finally {
  //       setIsLoadingAttributes(false);
  //     }
  //   };
    
  //   // Fetch when assignment is loaded and we're in inspecting stage
  //   if (assignmentId && assignment?.assignment_status === 'code_verified') {
  //     fetchDeviceAttributes();
  //   }
  // }, [assignmentId, assignment?.assignment_status]);

  // Fetch device attributes manually
useEffect(() => {
  console.log('=== Device Attributes Effect Triggered ===');
  console.log('Assignment ID:', assignmentId);
  console.log('Assignment Status:', assignment?.assignment_status);
  console.log('Assignment Data:', assignment);
  
  const fetchDeviceAttributes = async () => {
    if (!assignmentId) {
      console.log('❌ No assignmentId - skipping fetch');
      return;
    }
    
    if (!assignment) {
      console.log('❌ No assignment data yet - skipping fetch');
      return;
    }
    
    console.log('✅ Conditions met - fetching device attributes...');
    
    setIsLoadingAttributes(true);
    setAttributesError(null);
    
    try {
      const token = useAuthStore.getState().accessToken;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Fetching from URL:', `${import.meta.env.VITE_API_BASE_URL}/partner-agents/assignments/${assignmentId}/device-attributes/`);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/partner-agents/assignments/${assignmentId}/device-attributes/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('[DeviceAttributes] Response status:', response.status);
      console.log('[DeviceAttributes] Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[DeviceAttributes] Error response:', errorData);
        throw new Error(errorData.error || `Failed to fetch device attributes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[DeviceAttributes] ✅ Fetched successfully:', data);
      
      setDeviceAttributes(data);
    } catch (err: any) {
      console.error('[DeviceAttributes] ❌ Fetch error:', err);
      setAttributesError(err.message || 'Failed to load device attributes');
    } finally {
      setIsLoadingAttributes(false);
    }
  };
  
  // ✅ FIXED: Fetch when assignment is loaded (not just when status is 'code_verified')
  // This will attempt to fetch whenever we have an assignmentId and assignment data
  if (assignmentId && assignment) {
    console.log('🚀 Starting fetch...');
    fetchDeviceAttributes();
  } else {
    console.log('⏳ Waiting for assignment data...');
  }
}, [assignmentId, assignment]); // ✅ FIXED: Simplified dependencies





  // Update inspection data state to use dynamic structure
  const [dynamicInspectionData, setDynamicInspectionData] = useState<DynamicInspectionData>({
    inspection_notes: '',
    inspection_photos: [],
    verified_imei: '',
    imei_matches: false,
    device_powers_on: true,
    attribute_responses: {},
    front_image: undefined,
    back_image: undefined,
    screen_image: undefined,
    imei_image: undefined,
    defect_images: [],
  });

 // handleKYCSubmission
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

  // Load status logs from assignment data
  useEffect(() => {
    if (assignment?.status) {
      setStatusLogs(assignment.status_history || []);
    }
  }, [assignment?.status]);







  // ⬇️ INSERT NEW CODE HERE (After line 311) ⬇️

  // ============================================================================
  // NEW: DATA LOADING HOOKS FOR PERSISTENCE
  // ============================================================================

  // Load inspection results when assignment loads
  useEffect(() => {
    if (!assignment?.visit_data) return;
    
    // console.log('[DataLoad] Loading visit data:', assignment.visit_data);
    
    const visit = assignment.visit_data;
    
    if (visit.verified_conditions) {
      setSubmittedInspection({
        screen_condition: visit.verified_conditions.screen_condition || 'good',
        body_condition: visit.verified_conditions.body_condition || 'good',
        battery_health: visit.verified_conditions.battery_health || null,
        accessories: {
          charger_available: visit.verified_conditions.accessories?.charger || false,
          box_available: visit.verified_conditions.accessories?.box || false,
          earphones_available: visit.verified_conditions.accessories?.earphones || false,
          bill_available: visit.verified_conditions.accessories?.bill || false,
        },
        functional_issues: visit.verified_conditions.functional_issues || [],
        inspection_photos: visit.inspection_photos || [],
        inspection_notes: visit.inspection_notes || '',
        verified_imei: visit.verified_imei || '',
        submitted_at: visit.inspection_completed_at || new Date().toISOString(),
      });
      setShowInspectionResults(true);
    }
    
    if (visit.pricing_breakdown) {
      setSystemCalculatedPrice({
        final_price: parseFloat(visit.pricing_breakdown.final_price),
        original_estimate: parseFloat(assignment.estimated_price || '0'),
        deductions: (visit.pricing_breakdown.deductions || []).map(d => ({
          ...d,
          amount: typeof d.amount === 'string' ? parseFloat(d.amount) : d.amount
        })),
        is_final: true,
      });
    }
  }, [assignment]);

  // Load customer response when assignment loads
  useEffect(() => {
    if (!assignment?.customer_response_data) return;
    
    console.log('[DataLoad] Loading customer response:', assignment.customer_response_data);
    
    const response = assignment.customer_response_data;
    
    if (response.response === 'accepted') {
      setCustomerResponse('accept');
    } else if (response.response === 'rejected') {
      setCustomerResponse('reject');
      if (response.rejection_reason) {
        setRejectionReason(response.rejection_reason);
      }
    }
  }, [assignment]);

  // Load KYC data when assignment loads
  useEffect(() => {
    if (!assignment?.kyc_data?.kyc_completed) return;
    
    console.log('[DataLoad] Loading KYC data:', assignment.kyc_data);
    
    setShowKYCDocuments(true);
  }, [assignment]);

  // Load payment data when assignment loads  
  useEffect(() => {
    if (!assignment?.payment_data?.payment_completed) return;
    
    console.log('[DataLoad] Loading payment data:', assignment.payment_data);
    
    const payment = assignment.payment_data;
    
    setCompletedPayment({
      payment_method: 'cash',
      amount: parseFloat(payment.amount || '0'),
      transaction_id: payment.transaction_id || '',
      processed_at: payment.processed_at || new Date().toISOString(),
      wallet_balance_before: payment.wallet_balance_before ? parseFloat(payment.wallet_balance_before) : undefined,
      wallet_balance_after: payment.wallet_balance_after ? parseFloat(payment.wallet_balance_after) : undefined,
    });
    setShowPaymentDetails(true);
  }, [assignment]);

  // ⬆️ END OF NEW HOOKS ⬆️


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
      
      // Refetch data before showing modal
      await Promise.all([
        refetch(),
        workflowStatusQuery.refetch()
      ]);
      
      setShowVerifyCodeModal(true);
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
      
      // Critical: Refetch both queries to update workflow stage
      const [assignmentResult, workflowResult] = await Promise.all([
        refetch(),
        workflowStatusQuery.refetch()
      ]);
      
      console.log('[VerifyCode] Refetch complete:', {
        assignmentStatus: assignmentResult.data?.assignment_status,
        workflowStage: workflowResult.data?.current_stage
      });
    } catch (err: any) {
      throw new Error(err.message || 'Invalid verification code');
    }
  };

  // # ============================================================
  // # STEP 1: Add regenerate function (add after other handlers)
  // # ============================================================

  // Add this function around line 600 (after handleFinalComplete)
  const handleRegenerateCode = async () => {
    if (!assignmentId) return;
    
    setActionError(null);
    
    try {
      // Get token from localStorage (adjust if you store it differently)
      // const token = localStorage.getItem('token'); // or sessionStorage.getItem('token')
      const token = useAuthStore.getState().accessToken;
      if (!token) {
        setActionError('Authentication token not found');
        return;
      }
      
      // Call API directly
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/partner-agents/assignments/${assignmentId}/regenerate-code/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate code');
      }
      
      // Show success message with new code
      setActionSuccess(`New code generated get from the customer`);
      
      // Refetch assignment data
      refetch();
      
    } catch (err: any) {
      setActionError(err.message || 'Failed to regenerate verification code');
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


// const handleSubmitInspection = async () => {
//   if (!assignmentId) return;

//   setActionError(null);
//   try {
//     let inspectionPayload: any;

//     // Check if we're using dynamic form (has attribute_responses)
//     if (dynamicInspectionData.attribute_responses && 
//         Object.keys(dynamicInspectionData.attribute_responses).length > 0) {
//       // DYNAMIC FORM
//       console.log('=== DYNAMIC FORM SUBMISSION ===');
//       console.log('Dynamic Inspection Data:', dynamicInspectionData);
      
//       inspectionPayload = {
//         inspection_notes: dynamicInspectionData.inspection_notes,
//         inspection_photos: [
//           dynamicInspectionData.front_image,
//           dynamicInspectionData.back_image,
//           dynamicInspectionData.screen_image,
//           dynamicInspectionData.imei_image,
//           ...(dynamicInspectionData.defect_images || [])
//         ].filter(Boolean),
//         verified_imei: dynamicInspectionData.verified_imei,
//         imei_matches: dynamicInspectionData.imei_matches,
//         device_powers_on: dynamicInspectionData.device_powers_on,
        
//         partner_assessment: {
//           ...dynamicInspectionData.attribute_responses,
//           additional_notes: dynamicInspectionData.inspection_notes
//         },
        
//         checklist_items: []
//       };
      
//       console.log('Built Dynamic Payload:', JSON.stringify(inspectionPayload, null, 2));
//     } else {
//       // STATIC FORM
//       console.log('=== STATIC FORM SUBMISSION ===');
//       const rawData = transformInspectionData(inspectionData);
//       inspectionPayload = {
//         ...rawData,
//         inspection_photos: (rawData.inspection_photos || []).filter((p): p is string => !!p)
//       };
      
//       console.log('Built Static Payload:', JSON.stringify(inspectionPayload, null, 2));
//     }

//     console.log('🚀 Submitting to backend...');
    
//     const inspectionResult = await submitInspectionMutation.mutateAsync({
//       assignmentId,
//       data: inspectionPayload,
//     });

//     console.log('✅ Backend Response:', inspectionResult);
    
//     // Store system calculated price
//     if (inspectionResult.calculated_price) {
//       setSystemCalculatedPrice({
//         final_price: inspectionResult.calculated_price,
//         original_estimate: inspectionResult.original_price || 0,
//         deductions: inspectionResult.deductions || [],
//         is_final: true
//       });
//     }

//     // Store submitted inspection for display
//     if (dynamicInspectionData.attribute_responses && 
//         Object.keys(dynamicInspectionData.attribute_responses).length > 0) {
//       // From dynamic form
//       setSubmittedInspection({
//         screen_condition: dynamicInspectionData.attribute_responses.screen_condition || 'good',
//         body_condition: dynamicInspectionData.attribute_responses.body_condition || 'good',
//         battery_health: dynamicInspectionData.attribute_responses.battery_health || null,
//         accessories: dynamicInspectionData.attribute_responses.accessories || {},
//         functional_issues: dynamicInspectionData.attribute_responses.functional_issues || [],
//         inspection_photos: inspectionPayload.inspection_photos,
//         inspection_notes: dynamicInspectionData.inspection_notes,
//         verified_imei: dynamicInspectionData.verified_imei,
//         submitted_at: new Date().toISOString(),
//       });
//     } else {
//       // From static form
//       setSubmittedInspection({
//         screen_condition: inspectionData.screen_condition || 'good',
//         body_condition: inspectionData.body_condition || 'good',
//         battery_health: inspectionData.battery_health || null,
//         accessories: {
//           charger_available: inspectionData.has_charger || false,
//           box_available: inspectionData.has_box || false,
//           earphones_available: inspectionData.has_earphones || false,
//           bill_available: inspectionData.has_bill || false,
//         },
//         functional_issues: [
//           ...(!inspectionData.touch_working ? ['Touch'] : []),
//           ...(!inspectionData.display_working ? ['Display'] : []),
//           ...(!inspectionData.speakers_working ? ['Speakers'] : []),
//           ...(!inspectionData.microphone_working ? ['Microphone'] : []),
//           ...(!inspectionData.cameras_working ? ['Cameras'] : []),
//         ],
//         inspection_photos: [
//           inspectionData.front_image,
//           inspectionData.back_image,
//           inspectionData.screen_image,
//           inspectionData.imei_image,
//         ].filter((p): p is string => !!p),
//         inspection_notes: inspectionData.notes || '',
//         verified_imei: inspectionData.imei_number || '',
//         submitted_at: new Date().toISOString(),
//       });
//     }
    
//     setShowInspectionForm(false);
//     setShowCustomerAcceptance(true);
//     refetch();
//   } catch (err: any) {
//     console.error('❌ Submission Error:', err);
//     console.error('Error details:', err.response?.data || err.message);
//     setActionError(err.message || 'Failed to submit inspection');
//   }
// };
  

const handleSubmitInspection = async () => {
  // console.log('=== HANDLE SUBMIT INSPECTION TRIGGERED ===');
  if (!assignmentId) return;

  setActionError(null);
  
  // ✅ CRITICAL: Properly determine which form we're using
  const hasAttributes = deviceAttributes?.data?.attributes && 
                       deviceAttributes.data.attributes.length > 0;
  
  const hasDynamicData = hasAttributes &&
                        dynamicInspectionData.verified_imei && 
                        dynamicInspectionData.inspection_notes &&
                        Object.keys(dynamicInspectionData.attribute_responses || {}).length > 0;
  
  // console.log('=== INSPECTION SUBMISSION DEBUG ===');
  // console.log('Has Attributes:', hasAttributes);
  // console.log('Has Dynamic Data:', hasDynamicData);
  // console.log('Dynamic Inspection Data:', dynamicInspectionData);
  // console.log('Static Inspection Data:', inspectionData);

  // ✅ PRE-FLIGHT VALIDATION
  if (hasDynamicData) {
    console.log('✅ Using DYNAMIC form');
    
    if (!dynamicInspectionData.verified_imei || dynamicInspectionData.verified_imei.length !== 15) {
      setActionError('❌ Please enter a valid 15-digit IMEI number');
      return;
    }
    
    if (!dynamicInspectionData.inspection_notes?.trim()) {
      setActionError('❌ Please add inspection notes');
      return;
    }
    
    if (!dynamicInspectionData.front_image || !dynamicInspectionData.back_image || !dynamicInspectionData.imei_image) {
      setActionError('❌ Please capture all required photos (Front, Back, IMEI)');
      return;
    }
    
    if (!dynamicInspectionData.attribute_responses || Object.keys(dynamicInspectionData.attribute_responses).length === 0) {
      setActionError('❌ Please complete device inspection criteria');
      return;
    }
  } else {
    console.log('⚠️ Using STATIC form (fallback)');
    
    if (!inspectionData.imei_number || inspectionData.imei_number.length < 15) {
      setActionError('❌ Please enter a valid IMEI number');
      return;
    }
    
    if (!inspectionData.notes?.trim()) {
      setActionError('❌ Please add inspection notes');
      return;
    }
    
    if (!inspectionData.front_image || !inspectionData.back_image || !inspectionData.imei_image) {
      setActionError('❌ Please capture all required photos');
      return;
    }
  }
  
  // console.log('✅ Pre-flight validation passed');

  try {
    let inspectionPayload: any;

    if (hasDynamicData) {
      // ========================================
      // BUILD DYNAMIC FORM PAYLOAD
      // ========================================
      console.log('🔧 Building DYNAMIC form payload...');
      // ✅ Convert all attribute values to strings
      const stringifyAttributeResponses = (attrs: Record<string, any>): Record<string, string> => {
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(attrs)) {
          if (typeof value === 'boolean') {
            result[key] = value ? 'true' : 'false';
          } else if (value === null || value === undefined) {
            result[key] = '';
          } else {
            result[key] = String(value);
          }
        }
        return result;
      };
      
      inspectionPayload = {
        // Core fields from dynamicInspectionData
        inspection_notes: dynamicInspectionData.inspection_notes,
        inspection_photos: [
          dynamicInspectionData.front_image,
          dynamicInspectionData.back_image,
          dynamicInspectionData.screen_image,
          dynamicInspectionData.imei_image,
          ...(dynamicInspectionData.defect_images || [])
        ].filter(Boolean),  // Remove null/undefined
        verified_imei: dynamicInspectionData.verified_imei,
        imei_matches: dynamicInspectionData.imei_matches,
        device_powers_on: dynamicInspectionData.device_powers_on,
        
        // Dynamic attribute responses
        // ✅ Convert to strings
        attribute_responses: stringifyAttributeResponses(
          dynamicInspectionData.attribute_responses
        ),
        // Also send as partner_assessment for backward compatibility
        partner_assessment: {
          ...stringifyAttributeResponses(dynamicInspectionData.attribute_responses),
          additional_notes: dynamicInspectionData.inspection_notes
        },
        
        checklist_items: []
      };
      
      // console.log('✅ Built DYNAMIC payload:', JSON.stringify(inspectionPayload, null, 2));
    } else {
      // ========================================
      // BUILD STATIC FORM PAYLOAD
      // ========================================
      // console.log('🔧 Building STATIC form payload...');
      
      const rawData = transformInspectionData(inspectionData);
      inspectionPayload = {
        ...rawData,
        inspection_photos: (rawData.inspection_photos || []).filter((p): p is string => !!p)
      };
      
      // console.log('✅ Built STATIC payload:', JSON.stringify(inspectionPayload, null, 2));
    }

    // ========================================
    // FINAL VALIDATION BEFORE SENDING
    // ========================================
    // console.log('🔍 Final validation check...');
    // console.log('  verified_imei:', inspectionPayload.verified_imei);
    // console.log('  inspection_notes:', inspectionPayload.inspection_notes);
    // console.log('  inspection_photos length:', inspectionPayload.inspection_photos?.length);
    
    if (!inspectionPayload.verified_imei || inspectionPayload.verified_imei.length !== 15) {
      // console.error('❌ IMEI validation failed:', inspectionPayload.verified_imei);
      setActionError('IMEI must be exactly 15 digits');
      return;
    }
    
    if (!inspectionPayload.inspection_notes || inspectionPayload.inspection_notes.trim().length === 0) {
      // console.error('❌ Notes validation failed');
      setActionError('Inspection notes are required');
      return;
    }
    
    if (!inspectionPayload.inspection_photos || inspectionPayload.inspection_photos.length === 0) {
      // console.error('❌ Photos validation failed:', inspectionPayload.inspection_photos);
      setActionError('At least one inspection photo is required');
      return;
    }

    // console.log('✅ Final validation passed');
    // console.log('📤 Submitting to backend...');
    // console.log('📦 Final Payload:', inspectionPayload);
    
    // ========================================
    // SUBMIT TO BACKEND
    // ========================================
    const inspectionResult = await submitInspectionMutation.mutateAsync({
      assignmentId,
      data: inspectionPayload,
    });

    // console.log('✅ Backend Response:', inspectionResult);
    
    // Store system calculated price
    if (inspectionResult.calculated_price || inspectionResult.system_final_price) {
      setSystemCalculatedPrice({
        final_price: inspectionResult.calculated_price || inspectionResult.system_final_price || 0,
        original_estimate: inspectionResult.original_price || inspectionResult.original_estimate || 0,
        deductions: inspectionResult.deductions || [],
        is_final: true
      });
    }

    // Store submitted inspection for display
    if (hasDynamicData) {
      console.log('Has dynamic data submittion doing')
      setSubmittedInspection({
        screen_condition: dynamicInspectionData.attribute_responses.screen_condition || 'good',
        body_condition: dynamicInspectionData.attribute_responses.body_condition || 'good',
        battery_health: dynamicInspectionData.attribute_responses.battery_health || null,
        accessories: dynamicInspectionData.attribute_responses.accessories || {},
        functional_issues: dynamicInspectionData.attribute_responses.functional_issues || [],
        inspection_photos: inspectionPayload.inspection_photos,
        inspection_notes: inspectionPayload.inspection_notes,
        verified_imei: inspectionPayload.verified_imei,
        submitted_at: new Date().toISOString(),
      });
    } else {
      setSubmittedInspection({
        screen_condition: inspectionData.screen_condition || 'good',
        body_condition: inspectionData.body_condition || 'good',
        battery_health: inspectionData.battery_health || null,
        accessories: {
          charger_available: inspectionData.has_charger || false,
          box_available: inspectionData.has_box || false,
          earphones_available: inspectionData.has_earphones || false,
          bill_available: inspectionData.has_bill || false,
        },
        functional_issues: [
          ...(!inspectionData.touch_working ? ['Touch'] : []),
          ...(!inspectionData.display_working ? ['Display'] : []),
          ...(!inspectionData.speakers_working ? ['Speakers'] : []),
          ...(!inspectionData.microphone_working ? ['Microphone'] : []),
          ...(!inspectionData.cameras_working ? ['Cameras'] : []),
        ],
        inspection_photos: [
          inspectionData.front_image,
          inspectionData.back_image,
          inspectionData.screen_image,
          inspectionData.imei_image,
        ].filter((p): p is string => !!p),
        inspection_notes: inspectionData.notes || '',
        verified_imei: inspectionData.imei_number || '',
        submitted_at: new Date().toISOString(),
      });
    }
    
    setShowInspectionForm(false);
    setShowCustomerAcceptance(true);
    refetch();
  } catch (err: any) {
    console.error('❌ Submission Error:', err);
    console.error('Error details:', err.response?.data || err.message);
    setActionError(err.message || 'Failed to submit inspection');
  }
};




  // CustomerAcceptanceScreenProps
  // ✅ UPDATED: KYC Handler for NEW 3-step workflow
  // REPLACE handleKYCSubmission with this improved version:
  const handleKYCSubmission = async () => {
    if (!assignmentId) return;
    setActionError(null);
    
    try {
      // Convert base64 strings to File objects
      const idProofFrontFile = await base64ToFile(capturedImages.id_proof_front!, 'id-proof-front.jpg');
      const signatureFile = await base64ToFile(capturedImages.signature!, 'signature.jpg');

      // Build KYC request matching backend structure
      const kycRequest: KYCDocumentUploadRequest = {
        id_proof_type: kycData.id_proof_type,
        id_number: kycData.id_number,
        customer_confirmed: true,
        verification_notes: kycData.verification_notes || 'KYC verified by agent',
        id_proof_front: idProofFrontFile,
        customer_signature: signatureFile,
      };

      // Add back image if Aadhaar
      if (kycData.id_proof_type === 'aadhaar' && capturedImages.id_proof_back) {
        const idProofBackFile = await base64ToFile(capturedImages.id_proof_back, 'id-proof-back.jpg');
        kycRequest.id_proof_back = idProofBackFile;
      }

      // Add address proof if captured
      if (capturedImages.address_proof && kycData.address_proof_type) {
        const addressProofFile = await base64ToFile(capturedImages.address_proof, 'address-proof.jpg');
        kycRequest.address_proof_type = kycData.address_proof_type;
        kycRequest.address_proof = addressProofFile;
      }

      // Add device documents if captured
      if (capturedImages.device_bill) {
        const billFile = await base64ToFile(capturedImages.device_bill, 'device-bill.jpg');
        kycRequest.device_bill = billFile;
      }
      
      if (capturedImages.device_warranty) {
        const warrantyFile = await base64ToFile(capturedImages.device_warranty, 'device-warranty.jpg');
        kycRequest.device_warranty = warrantyFile;
      }

      await uploadKYCMutation.mutateAsync({
        assignmentId,
        data: kycRequest,
      });

      // Store submitted KYC for display
      setSubmittedKYC({
        id_proof_type: kycData.id_proof_type,
        id_number: kycData.id_number,
        id_proof_photo: capturedImages.id_proof_front!,
        customer_signature: capturedImages.signature!,
        customer_selfie: '', // Not captured in this flow
        verified_at: new Date().toISOString(),
      });

      setActionSuccess('KYC documents uploaded successfully! Processing payment...');
      setShowKYCForm(false);
      
      // Wait a moment then show payment screen
      setTimeout(() => {
        setShowPaymentScreen(true);
      }, 1500);
      
      refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to upload KYC documents');
    }
  };   
  // ✅ UPDATED: Payment Handler for NEW 3-step workflow
  const handlePaymentCompletion = async () => {
    if (!assignmentId || !selectedPaymentMethod) return;
    setActionError(null);
    
    try {
      // Build payment request matching backend structure
      const paymentRequest: PaymentProcessRequest = {
        payment_method: selectedPaymentMethod,
        payment_notes: completionNotes || `Payment completed via ${selectedPaymentMethod === 'cash' ? 'Cash' : 'Partner Wallet'}`,
        // generate_invoice: true, // Always generate invoice
      };

      // Add cash_amount_given if cash payment
      if (selectedPaymentMethod === 'cash' && systemCalculatedPrice) {
        paymentRequest.cash_amount_given = systemCalculatedPrice.final_price;
      }

      const result = await processPaymentMutation.mutateAsync({
        assignmentId,
        data: paymentRequest,
      });

      // Store completed payment for display
      setCompletedPayment({
        payment_method: selectedPaymentMethod,
        amount: systemCalculatedPrice?.final_price || 0,
        transaction_id: result.transaction_id,
        processed_at: new Date().toISOString(),
        wallet_balance_before: result.wallet_balance_before,
        wallet_balance_after: result.wallet_balance_after,
      });

      setActionSuccess(`Payment processed successfully! Completing deal...`);
      setShowPaymentScreen(false);
      
      // Automatically call final completion
      setTimeout(async () => {
        await handleFinalComplete();
      }, 1500);
      
    } catch (err: any) {
      setActionError(err.message || 'Failed to process payment');
    }
  };


  // ✅ NEW: Final Completion Handler
  const handleFinalComplete = async () => {
    if (!assignmentId) return;
    setActionError(null);
    
    try {
      await finalCompleteMutation.mutateAsync({
        assignmentId,
        data: {
          completion_notes: completionNotes || 'Deal completed successfully',
        },
      });

      setActionSuccess('Deal completed successfully!');
      refetch();
      
      setTimeout(() => navigate('/agent/activity'), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to complete deal');
    }
  };

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

  // ✅ UPDATED: Complete workflow stage logic with ALL statuses
  const getWorkflowStage = () => {
    if (!assignment) return 'loading';
    
    // Use workflow status if available (most accurate)
    if (workflowStatusQuery.data?.current_stage) {
      const stage = workflowStatusQuery.data.current_stage;
      
      // Map backend workflow stages to UI stages
      switch (stage) {
        case 'assigned': return 'pending';
        case 'accepted': return 'accepted';
        case 'en_route': return 'en_route';
        case 'checked_in': return 'checked_in';
        case 'code_verified': return 'code_verified';
        case 'inspecting': return 'inspecting';
        case 'inspection_submitted': return 'awaiting_customer';
        case 'customer_accepted': return 'kyc_verification';
        case 'customer_rejected': return 'rejected';
        case 'kyc_completed': return 'payment_selection';
        case 'payment_processed': return 'final_completion';
        case 'completed': return 'completed';
        case 'cancelled': return 'cancelled';
        default: return 'unknown';
      }
    }
    
    // Fallback to assignment status (from assignment object)
    switch (assignment.assignment_status) {
      case 'assigned': 
        return 'pending';
      case 'accepted': 
        return 'accepted';
      case 'en_route': 
        return 'en_route';
      case 'checked_in': 
        return 'checked_in';
      case 'code_verified': 
        return 'code_verified';
      case 'inspecting': 
        return 'inspecting';
      case 'inspection_submitted': 
        return 'awaiting_customer';
      case 'customer_accepted': 
        return 'kyc_verification';
      case 'customer_rejected': 
        return 'rejected';
      case 'kyc_completed': 
        return 'payment_selection';
      case 'payment_processed': 
        return 'final_completion';
      case 'completed': 
        return 'completed';
      case 'cancelled': 
        return 'cancelled';
      case 'rejected': 
        return 'rejected';
      default: 
        return 'unknown';
    }
  };
// Waiting for Customer
  const stage = getWorkflowStage();

   // Add after existing useEffect blocks showInspectionForm

  // Fetch customer response status
  // Update the polling useEffect to handle auto-progression
  useEffect(() => {
    const checkCustomerResponse = async () => {
      if (!assignmentId || stage !== 'awaiting_customer') return;
      
      try {
        const token = useAuthStore.getState().accessToken;
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/partner-agents/my-leads/${assignmentId}/customer-response/`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        const data = await response.json();
        console.log('[CustomerResponse] Fetched data:', data);
        
        if (data.has_responded) {
          if (data.response === 'accepted') {
            setCustomerResponse('accept');
            setActionSuccess('Customer accepted! Proceeding to KYC.');
            // Refetch to update workflow stage
            await Promise.all([
              refetch(),
              workflowStatusQuery.refetch()
            ]);
          } else if (data.response === 'rejected') {
            setCustomerResponse('reject');
            setRejectionReason(data.rejection_reason || 'Customer rejected');
            setActionSuccess('Customer rejected the price.');
            await Promise.all([
              refetch(),
              workflowStatusQuery.refetch()
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to check customer response:', err);
      }
    };
    
    // Check immediately and then every 5 seconds
    checkCustomerResponse();
    const interval = setInterval(checkCustomerResponse, 5000);
    return () => clearInterval(interval);
  }, [assignmentId, stage, refetch, workflowStatusQuery]);



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

  // // Show inspection form
  // if (showInspectionForm) {
  //   const handleImageUpload = async (_key: string, file: File): Promise<string> => {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(reader.result as string);
  //       reader.onerror = () => reject(new Error('Failed to read file'));
  //       reader.readAsDataURL(file);
  //     });
  //   };

  //   return (
  //     <InspectionForm
  //       data={inspectionData}
  //       onDataChange={setInspectionData}
  //       onSubmit={handleSubmitInspection}
  //       onCancel={() => setShowInspectionForm(false)}
  //       isSubmitting={submitInspectionMutation.isPending}
  //       deviceInfo={{
  //         brand: assignment.device_brand,
  //         model: assignment.device_model,
  //         storage: assignment.device_storage,
  //       }}
  //       onImageUpload={handleImageUpload}
  //     />
  //   );
  // }

  
  // Show dynamic inspection form
  // if (showInspectionForm) {
  //   if (isLoadingAttributes) {
  //     return (
  //       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
  //         <Loader2 className="w-12 h-12 animate-spin text-[#FEC925] mb-4" />
  //         <p className="text-gray-600 font-medium">Loading device inspection form...</p>
  //         <p className="text-gray-500 text-sm mt-2">Fetching inspection criteria...</p>
  //       </div>
  //     );
  //   }

  //   if (attributesError) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 p-6">
  //         <div className="max-w-md mx-auto mt-20">
  //           <div className="bg-white rounded-2xl border-2 border-red-200 p-6 text-center">
  //             <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               Failed to Load Inspection Form
  //             </h3>
  //             <p className="text-gray-600 mb-4">{attributesError}</p>
  //             <div className="flex gap-3">
  //               <button
  //                 onClick={() => setShowInspectionForm(false)}
  //                 className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
  //               >
  //                 Go Back
  //               </button>
  //               <button
  //                 onClick={async () => {
  //                   setAttributesError(null);
  //                   setIsLoadingAttributes(true);
  //                   try {
  //                     const token = useAuthStore.getState().accessToken;
  //                     const response = await fetch(
  //                       `${import.meta.env.VITE_API_BASE_URL}/partner-agents/assignments/${assignmentId}/device-attributes/`,
  //                       {
  //                         method: 'GET',
  //                         headers: {
  //                           'Authorization': `Bearer ${token}`,
  //                           'Content-Type': 'application/json',
  //                         },
  //                       }
  //                     );
                      
  //                     if (!response.ok) {
  //                       throw new Error('Failed to fetch device attributes');
  //                     }
                      
  //                     const data = await response.json();
  //                     setDeviceAttributes(data);
  //                   } catch (err: any) {
  //                     setAttributesError(err.message);
  //                   } finally {
  //                     setIsLoadingAttributes(false);
  //                   }
  //                 }}
  //                 className="flex-1 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-semibold hover:bg-[#e5b520] transition"
  //               >
  //                 Retry
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (!deviceAttributes?.data?.attributes) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 p-6">
  //         <div className="max-w-md mx-auto mt-20">
  //           <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 text-center">
  //             <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               No Inspection Criteria Available
  //             </h3>
  //             <p className="text-gray-600 mb-4">
  //               Unable to load inspection form for this device category.
  //             </p>
  //             <button
  //               onClick={() => setShowInspectionForm(false)}
  //               className="w-full px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-semibold hover:bg-[#e5b520] transition"
  //             >
  //               Go Back
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <DynamicInspectionForm
  //       data={dynamicInspectionData}
  //       onDataChange={setDynamicInspectionData}
  //       onSubmit={handleSubmitInspection}
  //       onCancel={() => setShowInspectionForm(false)}
  //       isSubmitting={submitInspectionMutation.isPending}
  //       deviceInfo={deviceAttributes.data.device_info}
  //       attributes={deviceAttributes.data.attributes}
  //       pricingConfig={deviceAttributes.data.pricing_config}
  //     />
  //   );
  // }

// Show inspection form - with fallback to old form if dynamic attributes fail
if (showInspectionForm) {
  // ✅ CRITICAL FIX: Add validation check before showing form
  const hasAttributes = deviceAttributes?.data?.attributes && 
                       deviceAttributes.data.attributes.length > 0;
  
  const hasDynamicData = dynamicInspectionData.verified_imei && 
                        dynamicInspectionData.inspection_notes &&
                        (dynamicInspectionData.front_image || 
                         dynamicInspectionData.back_image ||
                         dynamicInspectionData.imei_image);
  
  const hasStaticData = inspectionData.imei_number && 
                       inspectionData.notes &&
                       (inspectionData.front_image || 
                        inspectionData.back_image ||
                        inspectionData.imei_image);

  console.log('[InspectionForm] Form validation check:', {
    hasAttributes,
    hasDynamicData,
    hasStaticData,
    dynamicInspectionData,
    inspectionData
  });
  
  // Try dynamic form first if attributes are being loaded
  if (isLoadingAttributes) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#FEC925] mb-4" />
        <p className="text-gray-600 font-medium">Loading device inspection form...</p>
        <p className="text-gray-500 text-sm mt-2">Fetching inspection criteria...</p>
      </div>
    );
  }

  if (attributesError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-2xl border-2 border-red-200 p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Inspection Form
            </h3>
            <p className="text-gray-600 mb-4">{attributesError}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInspectionForm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Go Back
              </button>
              <button
                onClick={async () => {
                  setAttributesError(null);
                  setIsLoadingAttributes(true);
                  try {
                    const token = useAuthStore.getState().accessToken;
                    const response = await fetch(
                      `${import.meta.env.VITE_API_BASE_URL}/partner-agents/assignments/${assignmentId}/device-attributes/`,
                      {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    
                    if (!response.ok) {
                      throw new Error('Failed to fetch device attributes');
                    }
                    
                    const data = await response.json();
                    setDeviceAttributes(data);
                  } catch (err: any) {
                    setAttributesError(err.message);
                  } finally {
                    setIsLoadingAttributes(false);
                  }
                }}
                className="flex-1 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-semibold hover:bg-[#e5b520] transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ If we have valid dynamic attributes, use dynamic form
  if (hasAttributes) {
    console.log('[InspectionForm] Using dynamic inspection form');
    return (
      <DynamicInspectionForm
        data={dynamicInspectionData}
        onDataChange={setDynamicInspectionData}
        onSubmit={handleSubmitInspection}
        onCancel={() => setShowInspectionForm(false)}
        isSubmitting={submitInspectionMutation.isPending}
        deviceInfo={deviceAttributes.data.device_info}
        attributes={deviceAttributes.data.attributes}
        pricingConfig={deviceAttributes.data.pricing_config}
      />
    );
  }

  // ✅ FALLBACK: Use static form - BUT THIS IS THE PROBLEM
  // The static form state (inspectionData) is empty!
  // console.warn('[InspectionForm] ⚠️ Falling back to static form - this may cause issues');
  // console.warn('[InspectionForm] Static form data:', inspectionData);
  
  // Show warning that we're using fallback
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Warning banner */}
      <div className="bg-amber-50 border-b-2 border-amber-300 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
          <div>
            <p className="font-semibold text-amber-900">Using Fallback Form</p>
            <p className="text-sm text-amber-700">
              Dynamic inspection attributes unavailable. Using basic form.
            </p>
          </div>
        </div>
      </div>
      
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
        onImageUpload={async (_key: string, file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
        }}
      />
    </div>
  );
}



  // Show inspection form - with fallback to old form if dynamic attributes fail
  // if (showInspectionForm) {
  //   // Try dynamic form first if attributes are being loaded
  //   if (isLoadingAttributes) {
  //     return (
  //       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
  //         <Loader2 className="w-12 h-12 animate-spin text-[#FEC925] mb-4" />
  //         <p className="text-gray-600 font-medium">Loading device inspection form...</p>
  //         <p className="text-gray-500 text-sm mt-2">Fetching inspection criteria...</p>
  //       </div>
  //     );
  //   }

  //   // If we have valid dynamic attributes data, use dynamic form
  //   if (deviceAttributes?.data?.attributes && deviceAttributes.data.attributes.length > 0) {
  //     return (
  //       <DynamicInspectionForm
  //         data={dynamicInspectionData}
  //         onDataChange={setDynamicInspectionData}
  //         onSubmit={handleSubmitInspection}
  //         onCancel={() => setShowInspectionForm(false)}
  //         isSubmitting={submitInspectionMutation.isPending}
  //         deviceInfo={deviceAttributes.data.device_info}
  //         attributes={deviceAttributes.data.attributes}
  //         pricingConfig={deviceAttributes.data.pricing_config}
  //       />
  //     );
  //   }

  //   // FALLBACK: Use old static inspection form if dynamic attributes unavailable
  //   console.log('[InspectionForm] Using static fallback form - dynamic attributes not available');
    
  //   const handleImageUpload = async (_key: string, file: File): Promise<string> => {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(reader.result as string);
  //       reader.onerror = () => reject(new Error('Failed to read file'));
  //       reader.readAsDataURL(file);
  //     });
  //   };

  //   return (
  //     <InspectionForm
  //       data={inspectionData}
  //       onDataChange={setInspectionData}
  //       onSubmit={handleSubmitInspection}
  //       onCancel={() => setShowInspectionForm(false)}
  //       isSubmitting={submitInspectionMutation.isPending}
  //       deviceInfo={{
  //         brand: assignment.device_brand,
  //         model: assignment.device_model,
  //         storage: assignment.device_storage,
  //       }}
  //       onImageUpload={handleImageUpload}
  //     />
  //   );
  // }



  // Show customer acceptance UI
  {showCustomerAcceptance && systemCalculatedPrice && (
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
      onCancel={() => setShowCustomerAcceptance(false)}
    />
  )}

  // Show KYC verification form 
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
        isSubmitting={uploadKYCMutation.isPending}
      />
    );
  }

  // Show payment processing screen 
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
        isProcessing={processPaymentMutation.isPending}
      />
    );
  }

  console.log('showCustomerAcceptance', showCustomerAcceptance);
  console.log('systemCalculatedPrice', systemCalculatedPrice);




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

      {/* System Final Price Display */}
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

      {/* Workflow Progress */}
      <WorkflowProgress stage={stage} />

      {/* NEW: Visit Timeline Display (Expandable) */}
      {statusLogs.length > 0 && (
        <VisitTimelineDisplay
          statusLogs={statusLogs}
          isExpanded={showTimeline}
          onToggle={() => setShowTimeline(!showTimeline)}
        />
      )}

      {/* NEW: Inspection Results Display (Expandable) */}
      {/* // ⬇️ REPLACE WITH THIS ⬇️ */}

      {submittedInspection && (
        <InspectionResultsDisplay
          inspection={submittedInspection}
          isExpanded={showInspectionResults}
          onToggle={() => setShowInspectionResults(!showInspectionResults)}
          onImageClick={setSelectedImage}
          assignment={assignment}  // ✨ NEW
          systemCalculatedPrice={systemCalculatedPrice}  // ✨ NEW
          customerResponse={customerResponse}  // ✨ NEW
          rejectionReason={rejectionReason}  // ✨ NEW
        />
      )}

      {/* NEW: KYC Documents Display (Expandable) */}
      {submittedKYC && (
        <KYCDocumentsDisplay
          kycDocs={submittedKYC}
          isExpanded={showKYCDocuments}
          onToggle={() => setShowKYCDocuments(!showKYCDocuments)}
          onImageClick={setSelectedImage}
        />
      )}

      {/* NEW: Payment Details Display (Expandable) */}
      {completedPayment && (
        <PaymentDetailsDisplay
          payment={completedPayment}
          isExpanded={showPaymentDetails}
          onToggle={() => setShowPaymentDetails(!showPaymentDetails)}
        />
      )}

      {/* Action Buttons */}
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

          {/* Stage: Checked In - Verify Code */}
          {stage === 'checked_in' && (
            <button
              onClick={() => setShowVerifyCodeModal(true)}
              className="w-full py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <KeyRound size={24} />
              Enter Verification Code
            </button>
          )}

          {/* Stage: Code Verified - Start Inspection */}
          {stage === 'code_verified' && (
            <button
              onClick={handleStartInspection}
              disabled={startInspectionMutation.isPending}
              className="w-full py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {startInspectionMutation.isPending ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <ClipboardCheck size={24} />
                  Start Device Inspection
                </>
              )}
            </button>
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

          {/* Stage: KYC Verification */}
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

          {/* Stage: Final Completion */}
          {stage === 'final_completion' && (
            <button
              onClick={handleFinalComplete}
              disabled={finalCompleteMutation.isPending}
              className="w-full py-4 bg-[#1B8A05] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {finalCompleteMutation.isPending ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <BadgeCheck size={24} />
                  Complete Deal
                </>
              )}
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
            
            {/* Regenerate Code Button */}
            <button
              type="button"
              onClick={handleRegenerateCode}
              disabled={isLoading}
              className="w-full mt-3 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Regenerate Code
            </button>

          </Modal>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <Modal onClose={() => setSelectedImage(null)}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1C1C1B]">Image Preview</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full rounded-xl"
              />
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedImage;
                  link.download = 'image.jpg';
                  link.click();
                }}
                className="w-full mt-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download Image
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// =====================================================
// NEW: DISPLAY COMPONENTS FOR TIMELINE, INSPECTION, KYC, PAYMENT
// =====================================================

// Visit Timeline Display Component
interface VisitTimelineDisplayProps {
  statusLogs: StatusLog[];
  isExpanded: boolean;
  onToggle: () => void;
}

const VisitTimelineDisplay: React.FC<VisitTimelineDisplayProps> = ({
  statusLogs,
  isExpanded,
  onToggle,
}) => {
  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      assigned: User,
      accepted: CheckCircle2,
      en_route: Navigation,
      checked_in: MapPinned,
      code_verified: KeyRound,
      inspecting: ClipboardCheck,
      inspection_submitted: FileCheck,
      customer_accepted: ThumbsUp,
      customer_rejected: ThumbsDown,
      kyc_completed: Shield,
      payment_processed: CreditCard,
      completed: BadgeCheck,
      cancelled: XCircle,
    };
    return icons[status] || AlertCircle;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: 'text-blue-600 bg-blue-100',
      accepted: 'text-[#FEC925] bg-[#FEC925]/20',
      en_route: 'text-purple-600 bg-purple-100',
      checked_in: 'text-green-600 bg-green-100',
      code_verified: 'text-indigo-600 bg-indigo-100',
      inspecting: 'text-orange-600 bg-orange-100',
      inspection_submitted: 'text-indigo-600 bg-indigo-100',
      customer_accepted: 'text-[#1B8A05] bg-[#1B8A05]/20',
      customer_rejected: 'text-red-600 bg-red-100',
      kyc_completed: 'text-[#1B8A05] bg-[#1B8A05]/20',
      payment_processed: 'text-[#1B8A05] bg-[#1B8A05]/20',
      completed: 'text-[#1B8A05] bg-[#1B8A05]/20',
      cancelled: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-bold text-[#1C1C1B] flex items-center gap-2">
          <History size={18} className="text-[#FEC925]" />
          Visit Timeline ({statusLogs.length} updates)
        </h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3"
          >
            {statusLogs.map((log, index) => {
              const StatusIcon = getStatusIcon(log.status);
              return (
                <div key={index} className="flex gap-3 border-l-2 border-gray-200 pl-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(log.status)}`}>
                    <StatusIcon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1C1C1B] capitalize">
                      {log.status.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">By: {log.changed_by}</p>
                    {log.notes && (
                      <p className="text-sm text-gray-700 mt-1">{log.notes}</p>
                    )}
                    {log.gps_coordinates && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <MapPinIcon size={12} />
                        {log.gps_coordinates.latitude.toFixed(6)}, {log.gps_coordinates.longitude.toFixed(6)}
                      </p>
                    )}
                    {log.attached_photos && log.attached_photos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {log.attached_photos.map((photo, i) => (
                          <img
                            key={i}
                            src={photo}
                            alt={`Log ${i}`}
                            className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Inspection Results Display Component

// ⬇️ REPLACE WITH THIS ⬇️

interface InspectionResultsDisplayProps {
  inspection: InspectionResult;
  isExpanded: boolean;
  onToggle: () => void;
  onImageClick: (image: string) => void;
  assignment?: any;  // ✨ NEW
  systemCalculatedPrice?: SystemCalculatedPrice | null;  // ✨ NEW
  customerResponse?: 'accept' | 'reject' | null;  // ✨ NEW
  rejectionReason?: string;  // ✨ NEW
}



const InspectionResultsDisplay: React.FC<InspectionResultsDisplayProps> = ({
  inspection,
  isExpanded,
  onToggle,
  onImageClick,
  assignment,  // ✨ NEW
  systemCalculatedPrice,  // ✨ NEW
  customerResponse,  // ✨ NEW
  rejectionReason,  // ✨ NEW
}) => {
  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      excellent: 'text-[#1B8A05] bg-[#1B8A05]/10',
      good: 'text-green-600 bg-green-100',
      fair: 'text-yellow-600 bg-yellow-100',
      poor: 'text-orange-600 bg-orange-100',
      broken: 'text-red-600 bg-red-100',
      damaged: 'text-red-600 bg-red-100',
    };
    return colors[condition] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-bold text-[#1C1C1B] flex items-center gap-2">
          <ClipboardCheck size={18} className="text-[#FEC925]" />
          Inspection Results
        </h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Physical Condition */}
            <div className="bg-gray-50 rounded-xl p-3">
              <h4 className="font-semibold text-[#1C1C1B] mb-2">Physical Condition</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-gray-600">Screen:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${getConditionColor(inspection.screen_condition)}`}>
                    {inspection.screen_condition}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Body:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${getConditionColor(inspection.body_condition)}`}>
                    {inspection.body_condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Battery Health */}
            {inspection.battery_health !== null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <h4 className="font-semibold text-[#1C1C1B] mb-2">Battery Health</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#1B8A05] h-3 rounded-full transition-all"
                      style={{ width: `${inspection.battery_health}%` }}
                    />
                  </div>
                  <span className="font-bold text-[#1B8A05]">{inspection.battery_health}%</span>
                </div>
              </div>
            )}

            {/* Accessories */}
            <div className="bg-gray-50 rounded-xl p-3">
              <h4 className="font-semibold text-[#1C1C1B] mb-2">Accessories</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(inspection.accessories).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {value ? (
                      <CheckSquare size={16} className="text-[#1B8A05]" />
                    ) : (
                      <XSquare size={16} className="text-gray-400" />
                    )}
                    <span className="text-sm capitalize">
                      {key.replace('_available', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Functional Issues */}
            {inspection.functional_issues.length > 0 && (
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <h4 className="font-semibold text-red-700 mb-2">Functional Issues Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {inspection.functional_issues.map((issue, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Device Photos */}
            {inspection.inspection_photos.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <h4 className="font-semibold text-[#1C1C1B] mb-2 flex items-center gap-2">
                  <ImageIcon size={16} />
                  Device Photos ({inspection.inspection_photos.length})
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {inspection.inspection_photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Device ${i}`}
                      className="w-full h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => onImageClick(photo)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inspection Notes */}
            {inspection.inspection_notes && (
              <div className="bg-gray-50 rounded-xl p-3">
                <h4 className="font-semibold text-[#1C1C1B] mb-2">Inspection Notes</h4>
                <p className="text-sm text-gray-700">{inspection.inspection_notes}</p>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* NEW: CONDITION MATRIX COMPARISON SECTION            */}
            {/* ═══════════════════════════════════════════════════ */}

            {/* Condition Comparison */}
            {assignment?.customer_condition_responses && assignment?.visit_data?.verified_conditions && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gray-300" />
                  <h4 className="font-bold text-[#1C1C1B] text-sm">
                    VERIFICATION DETAILS
                  </h4>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>

                {/* Condition Comparison Table */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <RefreshCw size={14} />
                    Condition Verification
                  </h5>
                  <ConditionComparisonTable
                    customerClaimed={assignment.customer_condition_responses}
                    agentVerified={assignment.visit_data.verified_conditions}
                  />
                </div>

                {/* Functional Issues Comparison */}
                <FunctionalIssuesDisplay
                  customerIssues={assignment.customer_condition_responses?.functional_issues || []}
                  verifiedIssues={assignment.visit_data.verified_conditions?.functional_issues || []}
                />

                {/* Accessories Comparison */}
                <AccessoriesComparison
                  customerAccessories={assignment.customer_condition_responses?.accessories || {}}
                  verifiedAccessories={assignment.visit_data.verified_conditions?.accessories || {}}
                />
              </div>
            )}

            {/* System Calculated Price with Breakdown */}
            {systemCalculatedPrice && assignment?.visit_data?.pricing_breakdown && (
              <div>
                <div className="flex items-center gap-2 mb-3 mt-4">
                  <div className="h-px flex-1 bg-gray-300" />
                  <h4 className="font-bold text-[#1C1C1B] text-sm">
                    PRICE CALCULATION
                  </h4>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>
                
                <PricingBreakdownDisplay
                  breakdown={assignment.visit_data.pricing_breakdown}
                  originalEstimate={assignment.estimated_price}
                />
              </div>
            )}

            {/* Customer Response Badge */}
            {customerResponse && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gray-300" />
                  <h4 className="font-bold text-[#1C1C1B] text-sm">
                    CUSTOMER DECISION
                  </h4>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>
                
                <div className={`p-4 rounded-xl border-2 ${
                  customerResponse === 'accept'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Customer Response:
                    </span>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                      customerResponse === 'accept'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {customerResponse === 'accept' ? (
                        <>
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          ACCEPTED
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          REJECTED
                        </>
                      )}
                    </div>
                  </div>
                  
                  {customerResponse === 'accept' && systemCalculatedPrice && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">
                          Agreed Price:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          ₹{systemCalculatedPrice.final_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {customerResponse === 'reject' && rejectionReason && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <span className="text-xs text-red-600 font-medium">
                        Reason:
                      </span>
                      <p className="text-sm text-red-700 mt-1">
                        {rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* END: CONDITION MATRIX COMPARISON SECTION            */}
            {/* ═══════════════════════════════════════════════════ */}



            {/* IMEI */}
            <div className="bg-gray-50 rounded-xl p-3">
              <h4 className="font-semibold text-[#1C1C1B] mb-2">IMEI Number</h4>
              <p className="text-sm font-mono text-gray-700">{inspection.verified_imei}</p>
            </div>

            {/* Submitted At */}
            <div className="text-xs text-gray-500 text-center">
              Submitted on {new Date(inspection.submitted_at).toLocaleString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// KYC Documents Display Component
interface KYCDocumentsDisplayProps {
  kycDocs: KYCDocuments;
  isExpanded: boolean;
  onToggle: () => void;
  onImageClick: (image: string) => void;
}

const KYCDocumentsDisplay: React.FC<KYCDocumentsDisplayProps> = ({
  kycDocs,
  isExpanded,
  onToggle,
  onImageClick,
}) => {
  const getIdProofLabel = (type: string) => {
    const labels: Record<string, string> = {
      aadhaar: 'Aadhaar Card',
      driving_license: 'Driving License',
      passport: 'Passport',
      voter_id: 'Voter ID',
      pan: 'PAN Card',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-bold text-[#1C1C1B] flex items-center gap-2">
          <Shield size={18} className="text-[#FEC925]" />
          KYC Documents
        </h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            {/* ID Proof Info */}
            <div className="bg-gray-50 rounded-xl p-3">
              <h4 className="font-semibold text-[#1C1C1B] mb-2">ID Proof Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-semibold">{getIdProofLabel(kycDocs.id_proof_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ID Number:</span>
                  <span className="text-sm font-mono font-semibold">{kycDocs.id_number}</span>
                </div>
              </div>
            </div>

            {/* Document Images */}
            <div className="bg-gray-50 rounded-xl p-3">
              <h4 className="font-semibold text-[#1C1C1B] mb-3 flex items-center gap-2">
                <ImageIcon size={16} />
                Captured Documents
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {/* ID Proof */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">ID Proof</p>
                  <img
                    src={kycDocs.id_proof_photo}
                    alt="ID Proof"
                    className="w-full h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition border-2 border-gray-200"
                    onClick={() => onImageClick(kycDocs.id_proof_photo)}
                  />
                </div>

                {/* Signature */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Signature</p>
                  <img
                    src={kycDocs.customer_signature}
                    alt="Signature"
                    className="w-full h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition border-2 border-gray-200"
                    onClick={() => onImageClick(kycDocs.customer_signature)}
                  />
                </div>

                {/* Selfie */}
                {kycDocs.customer_selfie && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Selfie</p>
                    <img
                      src={kycDocs.customer_selfie}
                      alt="Selfie"
                      className="w-full h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition border-2 border-gray-200"
                      onClick={() => onImageClick(kycDocs.customer_selfie)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-[#1B8A05]/10 border border-[#1B8A05] rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="text-[#1B8A05]" size={20} />
                  <span className="font-semibold text-[#1B8A05]">KYC Verified</span>
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(kycDocs.verified_at).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Payment Details Display Component
interface PaymentDetailsDisplayProps {
  payment: PaymentDetails;
  isExpanded: boolean;
  onToggle: () => void;
}

const PaymentDetailsDisplay: React.FC<PaymentDetailsDisplayProps> = ({
  payment,
  isExpanded,
  onToggle,
}) => {
  const getPaymentMethodLabel = (method: string) => {
    return method === 'cash' ? 'Cash Payment' : 'Partner Wallet';
  };

  const getPaymentMethodIcon = (method: string) => {
    return method === 'cash' ? IndianRupee : Wallet;
  };

  const PaymentIcon = getPaymentMethodIcon(payment.payment_method);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-bold text-[#1C1C1B] flex items-center gap-2">
          <Receipt size={18} className="text-[#FEC925]" />
          Payment Details
        </h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Payment Method */}
            <div className="bg-gradient-to-r from-[#1B8A05]/20 to-[#16a34a]/20 border border-[#1B8A05] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1B8A05]/20 rounded-xl flex items-center justify-center">
                  <PaymentIcon className="text-[#1B8A05]" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-bold text-[#1B8A05]">{getPaymentMethodLabel(payment.payment_method)}</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 rounded-xl p-3">
              <h4 className="font-semibold text-[#1C1C1B] mb-2">Transaction Amount</h4>
              <div className="flex items-center gap-2">
                <IndianRupee size={24} className="text-[#1B8A05]" />
                <span className="text-2xl font-bold text-[#1B8A05]">
                  {payment.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Transaction ID */}
            {payment.transaction_id && (
              <div className="bg-gray-50 rounded-xl p-3">
                <h4 className="font-semibold text-[#1C1C1B] mb-2">Transaction ID</h4>
                <p className="text-sm font-mono text-gray-700">{payment.transaction_id}</p>
              </div>
            )}

            {/* Wallet Balance Info */}
            {payment.wallet_balance_before !== undefined && payment.wallet_balance_after !== undefined && (
              <div className="bg-gray-50 rounded-xl p-3">
                <h4 className="font-semibold text-[#1C1C1B] mb-2">Wallet Balance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Before:</span>
                    <span className="text-sm font-semibold">
                      ₹{payment.wallet_balance_before.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">After:</span>
                    <span className="text-sm font-semibold text-[#1B8A05]">
                      ₹{payment.wallet_balance_after.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">Change:</span>
                    <span className={`text-sm font-bold ${
                      payment.wallet_balance_after > payment.wallet_balance_before
                        ? 'text-[#1B8A05]'
                        : 'text-red-600'
                    }`}>
                      {payment.wallet_balance_after > payment.wallet_balance_before ? '+' : ''}
                      ₹{Math.abs(payment.wallet_balance_after - payment.wallet_balance_before).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Processed At */}
            <div className="text-xs text-gray-500 text-center">
              Processed on {new Date(payment.processed_at).toLocaleString()}
            </div>

            {/* Download Invoice Button */}
            <button
              className="w-full py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#e5b520] transition"
            >
              <Download size={18} />
              Download Invoice
            </button>
          </motion.div>
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
      code_verified: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      inspecting: 'bg-orange-100 text-orange-700 border-orange-200',
      inspection_submitted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      customer_accepted: 'bg-[#1B8A05]/20 text-[#1B8A05] border-[#1B8A05]',
      customer_rejected: 'bg-red-100 text-red-700 border-red-200',
      kyc_completed: 'bg-[#1B8A05]/20 text-[#1B8A05] border-[#1B8A05]',
      payment_processed: 'bg-[#1B8A05]/20 text-[#1B8A05] border-[#1B8A05]',
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
      code_verified: 'Code Verified',
      inspecting: 'Inspecting Device',
      inspection_submitted: 'Inspection Complete',
      customer_accepted: 'Customer Accepted',
      customer_rejected: 'Customer Rejected',
      kyc_completed: 'KYC Verified',
      payment_processed: 'Payment Processed',
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

// Workflow Progress Component
const WorkflowProgress: React.FC<{ stage: string }> = ({ stage }) => {
  const stages = [
    'pending',           // 1. Assigned
    'accepted',          // 2. Accepted
    'en_route',          // 3. En Route
    'checked_in',        // 4. Checked In
    'code_verified',     // 5. Code Verified ✅
    'inspecting',        // 6. Inspecting
    'awaiting_customer', // 7. Inspection Submitted ✅
    'kyc_verification',  // 8. Customer Accepted → KYC ✅
    'payment_selection', // 9. KYC Complete → Payment ✅
    'final_completion',  // 10. Payment → Final Complete ✅
    'completed'          // 11. Done
  ];
  
  const currentIndex = stages.indexOf(stage);

  const stageLabels: Record<string, string> = {
    pending: 'Assign',
    accepted: 'Accept',
    en_route: 'Journey',
    checked_in: 'Check-In',
    code_verified: 'Verify',
    inspecting: 'Inspect',
    awaiting_customer: 'Customer',
    kyc_verification: 'KYC',
    payment_selection: 'Payment',
    final_completion: 'Finalize',
    completed: 'Done',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4">
      <h3 className="font-bold text-[#1C1C1B] mb-4">Progress</h3>
      <div className="flex justify-between relative overflow-x-auto pb-8">
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
            <div key={s} className="flex flex-col items-center z-10 min-w-[60px]">
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
              <span className={`text-[10px] mt-2 text-center ${isCurrent ? 'font-bold text-[#1C1C1B]' : 'text-gray-500'}`}>
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

// Inspection Form Component
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
            <ToggleField icon={Boxes} label="Buttons" value={data.buttons_working ?? true} onChange={(v) => updateField('buttons_working', v)} />
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
// 

// ============================================================================
// DYNAMIC INSPECTION FORM COMPONENT
// ============================================================================

interface DynamicInspectionFormProps {
  data: DynamicInspectionData;
  onDataChange: (data: DynamicInspectionData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  deviceInfo: any;
  attributes: any[];
  pricingConfig: any;
}

const DynamicInspectionForm: React.FC<DynamicInspectionFormProps> = ({
  data,
  onDataChange,
  onSubmit,
  onCancel,
  isSubmitting,
  deviceInfo,
  attributes,
  pricingConfig,
}) => {
  const updateField = <K extends keyof DynamicInspectionData>(
    key: K,
    value: DynamicInspectionData[K]
  ) => {
    onDataChange({ ...data, [key]: value });
  };

  const updateAttributeResponse = (attributeName: string, value: any) => {
    onDataChange({
      ...data,
      attribute_responses: {
        ...data.attribute_responses,
        [attributeName]: value,
      },
    });
  };

  const captureImage = async (type: 'front_image' | 'back_image' | 'screen_image' | 'imei_image') => {
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
          updateField(type, base64);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  // Validation
  const requiredImagesCaptured = Boolean(
    data.front_image && data.back_image && data.imei_image
  );

  const requiredAttributesFilled = attributes
    .filter(attr => attr.is_required)
    .every(attr => {
      const value = data.attribute_responses[attr.name];
      return value !== undefined && value !== null && value !== '';
    });

  const isFormValid =
    requiredImagesCaptured &&
    data.verified_imei &&
    data.verified_imei.length >= 15 &&
    data.inspection_notes &&
    data.inspection_notes.trim().length > 0 &&
    requiredAttributesFilled;

  // Group attributes by type
  const cosmeticAttributes = attributes.filter(a => a.attribute_type === 'cosmetic');
  const functionalAttributes = attributes.filter(a => a.attribute_type === 'functional');
  const batteryAttributes = attributes.filter(a => a.attribute_type === 'battery');
  const accessoryAttributes = attributes.filter(a => a.attribute_type === 'accessory');

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
            <h1 className="text-xl font-bold text-[#1C1C1B]">
              {deviceInfo.brand} {deviceInfo.model}
            </h1>
            <p className="text-[#1C1C1B]/70">{deviceInfo.storage}</p>
            <p className="text-[#1C1C1B]/60 text-sm">
              Est. Price: ₹{parseFloat(deviceInfo.estimated_price || '0').toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Required Device Photos */}
        <Section title="Device Photos (Required)">
          <div className="grid grid-cols-2 gap-3">
            <ImageCaptureButton
              label="Front"
              image={data.front_image}
              onCapture={() => captureImage('front_image')}
              required
            />
            <ImageCaptureButton
              label="Back"
              image={data.back_image}
              onCapture={() => captureImage('back_image')}
              required
            />
            <ImageCaptureButton
              label="Screen On"
              image={data.screen_image}
              onCapture={() => captureImage('screen_image')}
            />
            <ImageCaptureButton
              label="IMEI"
              image={data.imei_image}
              onCapture={() => captureImage('imei_image')}
              required
            />
          </div>
          {!requiredImagesCaptured && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle size={14} />
              Front, Back, and IMEI photos are required
            </p>
          )}
        </Section>

        {/* Cosmetic Conditions */}
        {cosmeticAttributes.length > 0 && (
          <Section title="Physical Condition">
            <div className="space-y-4">
              {cosmeticAttributes.map(attr => (
                <DynamicAttributeField
                  key={attr.id}
                  attribute={attr}
                  value={data.attribute_responses[attr.name]}
                  onChange={(value) => updateAttributeResponse(attr.name, value)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Battery Health */}
        {batteryAttributes.length > 0 && (
          <Section title="Battery Health">
            <div className="space-y-4">
              {batteryAttributes.map(attr => (
                <DynamicAttributeField
                  key={attr.id}
                  attribute={attr}
                  value={data.attribute_responses[attr.name]}
                  onChange={(value) => updateAttributeResponse(attr.name, value)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Functional Tests */}
        {functionalAttributes.length > 0 && (
          <Section title="Functional Tests">
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <AlertCircle size={14} />
                Tap to select working features. All features should be tested.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {functionalAttributes.map(attr => (
                <DynamicAttributeField
                  key={attr.id}
                  attribute={attr}
                  value={data.attribute_responses[attr.name]}
                  onChange={(value) => updateAttributeResponse(attr.name, value)}
                  compact
                />
              ))}
            </div>
          </Section>
        )}

        {/* Accessories */}
        {accessoryAttributes.length > 0 && (
          <Section title="Accessories Included">
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Package size={14} />
                Select all accessories that are available with the device.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {accessoryAttributes.map(attr => (
                <DynamicAttributeField
                  key={attr.id}
                  attribute={attr}
                  value={data.attribute_responses[attr.name]}
                  onChange={(value) => updateAttributeResponse(attr.name, value)}
                  compact
                />
              ))}
            </div>
          </Section>
        )}

        {/* IMEI Verification */}
        <Section title="Device Verification (Required)">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IMEI Number *
              </label>
              <input
                type="text"
                value={data.verified_imei}
                onChange={(e) => updateField('verified_imei', e.target.value)}
                placeholder="Enter 15-digit IMEI number"
                maxLength={15}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none font-mono"
              />
              {data.verified_imei && data.verified_imei.length !== 15 && (
                <p className="text-sm text-red-600 mt-1">IMEI must be 15 digits</p>
              )}
            </div>
            <ToggleField
              icon={CheckCircle2}
              label="IMEI Verified & Matches"
              value={data.imei_matches}
              onChange={(v) => updateField('imei_matches', v)}
            />
            <ToggleField
              icon={Zap}
              label="Device Powers On"
              value={data.device_powers_on}
              onChange={(v) => updateField('device_powers_on', v)}
            />
          </div>
        </Section>

        {/* Inspection Notes */}
        <Section title="Inspection Notes (Required)">
          <textarea
            value={data.inspection_notes}
            onChange={(e) => updateField('inspection_notes', e.target.value)}
            placeholder="Describe overall device condition, any defects, customer interaction notes..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-24"
          />
          {(!data.inspection_notes || data.inspection_notes.trim().length === 0) && (
            <p className="text-sm text-red-600 mt-1">Inspection notes are required</p>
          )}
        </Section>

        {/* Pricing Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <BadgeCheck size={18} />
            {pricingConfig.calculation_method === 'system_automated' 
              ? 'System Will Calculate Final Price'
              : 'Pricing Information'}
          </h4>
          <p className="text-sm text-blue-800 mb-2">
            {pricingConfig.notes || 'Price will be calculated based on verified conditions'}
          </p>
          {pricingConfig.uses_condition_matrix && (
            <div className="text-xs text-blue-700 bg-blue-100 rounded-lg p-2 mt-2">
              <p className="font-semibold mb-1">Deduction Types:</p>
              <div className="flex flex-wrap gap-1">
                {pricingConfig.deduction_types?.map((type: string) => (
                  <span key={type} className="px-2 py-0.5 bg-blue-200 rounded capitalize">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Validation Summary */}
        {!isFormValid && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Complete Required Fields
            </h4>
            <ul className="text-sm text-red-600 space-y-1">
              {!requiredImagesCaptured && (
                <li>• Capture required photos (Front, Back, IMEI)</li>
              )}
              {(!data.verified_imei || data.verified_imei.length < 15) && (
                <li>• Enter valid 15-digit IMEI number</li>
              )}
              {!requiredAttributesFilled && (
                <li>• Complete all required condition checks</li>
              )}
              {(!data.inspection_notes || data.inspection_notes.trim().length === 0) && (
                <li>• Add inspection notes</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Submit Footer */}
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

// Submit for System Pricing const impact


// ============================================================================
// HELPER COMPONENTS FOR DYNAMIC FORM
// ============================================================================

interface DynamicAttributeFieldProps {
  attribute: any;
  value: any;
  onChange: (value: any) => void;
  compact?: boolean;
}

const DynamicAttributeField: React.FC<DynamicAttributeFieldProps> = ({
  attribute,
  value,
  onChange,
  compact = false,
}) => {
  const getPriceImpactDisplay = (selectedValue: any) => {
    if (!attribute.price_impact || !selectedValue) return null;
    const impact = attribute.price_impact[selectedValue];
    if (!impact) return null;

    const isNegative = impact.value < 0;
    const displayValue = Math.abs(impact.value);

    return (
      <span className={`text-xs font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
        {isNegative ? '-' : '+'}
        {impact.type === 'percentage' ? `${displayValue}%` : `₹${displayValue}`}
      </span>
    );
  };

  const getIconForAttribute = (attrName: string) => {
    const iconMap: Record<string, any> = {
      'wifi': Wifi,
      'wifi_working': Wifi,
      'bluetooth': Bluetooth,
      'bluetooth_working': Bluetooth,
      'camera': Camera,
      'cameras_working': Camera,
      'speaker': Volume2,
      'speakers_working': Volume2,
      'microphone': Mic,
      'microphone_working': Mic,
      'display': Eye,
      'display_working': Eye,
      'touch': Smartphone,
      'touch_working': Smartphone,
      'charging': Zap,
      'charging_port_working': Zap,
      'fingerprint': Fingerprint,
      'fingerprint_working': Fingerprint,
      'charger': Zap,
      'has_charger': Zap,
      'box': Package,
      'has_box': Package,
      'earphones': Volume2,
      'has_earphones': Volume2,
      'bill': FileText,
      'has_bill': FileText,
    };
    
    const normalizedName = attrName.toLowerCase().replace(/\s+/g, '_');
    for (const key in iconMap) {
      if (normalizedName.includes(key)) {
        return iconMap[key];
      }
    }
    return CheckCircle2;
  };

  // Boolean field as select/unselect button
  if (attribute.is_boolean) {
    const Icon = getIconForAttribute(attribute.name);
    const isSelected = value === true || value === 'Yes';
    
    return (
      <button
        type="button"
        onClick={() => onChange(!isSelected)}
        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
          isSelected 
            ? 'border-[#1B8A05] bg-gradient-to-br from-[#1B8A05]/10 to-[#1B8A05]/5 shadow-sm' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        {/* Selection indicator in top-right corner */}
        <div className="absolute top-2 right-2">
          {isSelected ? (
            <div className="w-6 h-6 rounded-full bg-[#1B8A05] flex items-center justify-center">
              <CheckCircle2 size={16} className="text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
          )}
        </div>

        {/* Required indicator */}
        {attribute.is_required && (
          <div className="absolute top-2 left-2">
            <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
          </div>
        )}

        {/* Icon and Label */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-[#1B8A05]/20' 
              : 'bg-gray-100'
          }`}>
            <Icon 
              size={24} 
              className={isSelected ? 'text-[#1B8A05]' : 'text-gray-400'} 
            />
          </div>
          
          <div className="text-center">
            <p className={`text-sm font-semibold transition-colors ${
              isSelected ? 'text-[#1B8A05]' : 'text-gray-700'
            }`}>
              {attribute.question_text || attribute.name}
            </p>
            
            {attribute.help_text && (
              <p className="text-xs text-gray-500 mt-1">
                {attribute.help_text}
              </p>
            )}
          </div>

          {/* Price Impact Badge */}
          {isSelected && getPriceImpactDisplay('Yes') && (
            <div className="mt-1">
              {getPriceImpactDisplay('Yes')}
            </div>
          )}
          {!isSelected && getPriceImpactDisplay('No') && (
            <div className="mt-1 text-xs text-gray-500">
              Impact: {getPriceImpactDisplay('No')}
            </div>
          )}
        </div>

        {/* Selection label at bottom */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className={`text-xs font-bold ${
            isSelected ? 'text-[#1B8A05]' : 'text-gray-400'
          }`}>
            {isSelected ? '✓ Working' : 'Not Working'}
          </span>
        </div>
      </button>
    );
  }

  // Select field with options Customer Response Required
  if (attribute.options && attribute.options.length > 0) {
    return (
      <div className={compact ? '' : 'mb-3'}>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          {attribute.is_required && (
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          )}
          {attribute.question_text || attribute.name}
        </label>
        {attribute.help_text && (
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <AlertCircle size={12} />
            {attribute.help_text}
          </p>
        )}
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-3 border-2 rounded-xl focus:border-[#FEC925] focus:outline-none bg-white transition-colors ${
            value ? 'border-[#1B8A05] bg-[#1B8A05]/5' : 'border-gray-200'
          }`}
        >
          <option value="">
            {attribute.placeholder || `Select ${attribute.name}`}
          </option>
          {attribute.options.map((option: string) => {
            // const impact = getPriceImpactDisplay(option);
            return (
              <option key={option} value={option}>
                {option}
              </option>

            );
          })}
        </select>
        {value && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-600">Selected: <strong>{value}</strong></span>
            {getPriceImpactDisplay(value) && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Price Impact:</span>
                {getPriceImpactDisplay(value)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Text input fallback
  return (
    <div className={compact ? '' : 'mb-3'}>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {attribute.is_required && (
          <span className="w-2 h-2 bg-red-500 rounded-full" />
        )}
        {attribute.question_text || attribute.name}
      </label>
      {attribute.help_text && (
        <p className="text-xs text-gray-500 mb-2">{attribute.help_text}</p>
      )}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={attribute.placeholder || `Enter ${attribute.name}`}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
      />
    </div>
  );
};

interface ImageCaptureButtonProps {
  label: string;
  image: string | undefined;
  onCapture: () => void;
  required?: boolean;
}

const ImageCaptureButton: React.FC<ImageCaptureButtonProps> = ({
  label,
  image,
  onCapture,
  required = false,
}) => (
  <button
    type="button"
    onClick={onCapture}
    className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition ${
      image ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
    }`}
  >
    {image ? (
      <>
        <CheckCircle2 className="text-[#1B8A05]" size={24} />
        <span className="text-sm font-semibold text-[#1B8A05]">
          {label} ✓
        </span>
      </>
    ) : (
      <>
        <Camera className="text-gray-400" size={24} />
        <span className="text-sm text-gray-600">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </>
    )}
  </button>
);

// 
// REPLACE entire CustomerAcceptanceScreen component with this simple version:

interface CustomerAcceptanceScreenProps {
  deviceInfo: { brand: string; model: string; storage: string };
  customerInfo: { name: string; phone: string };
  pricing: {
    final_price: number;
    original_estimate: number;
    deductions: Array<{ reason: string; amount: number }>;
  };
  customerResponse: 'accept' | 'reject' | null;
  rejectionReason?: string;
  customerSignature?: string | null;
  onCancel: () => void;
  onContinue?: () => void;  // New: for auto-progression
}

const CustomerAcceptanceScreen: React.FC<CustomerAcceptanceScreenProps> = ({
  deviceInfo,
  customerInfo,
  pricing,
  customerResponse,
  rejectionReason,
  onCancel,
  onContinue,
}) => {
  // Auto-progress after customer responds
  useEffect(() => {
    if (customerResponse === 'accept' && onContinue) {
      const timer = setTimeout(() => {
        onContinue();
      }, 3000);
      return () => clearTimeout(timer);
    } else if (customerResponse === 'reject') {
      const timer = setTimeout(() => {
        onCancel();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [customerResponse, onContinue, onCancel]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Dynamic based on response */}
      <div className={`p-6 ${
        customerResponse === 'accept' 
          ? 'bg-gradient-to-r from-[#1B8A05] to-[#16a34a]'
          : customerResponse === 'reject'
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : 'bg-gradient-to-r from-blue-500 to-blue-600'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="text-white font-bold">
            {customerResponse === 'accept' 
              ? 'Customer Accepted!' 
              : customerResponse === 'reject'
              ? 'Customer Rejected'
              : 'Waiting for Customer'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Device & Customer Info */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Package className="text-[#FEC925]" size={24} />
            <div>
              <h3 className="font-bold text-[#1C1C1B]">{deviceInfo.brand} {deviceInfo.model}</h3>
              <p className="text-sm text-gray-500">{deviceInfo.storage}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t">
            <UserCircle className="text-[#FEC925]" size={24} />
            <div>
              <h3 className="font-bold text-[#1C1C1B]">{customerInfo.name}</h3>
              <p className="text-sm text-gray-500">{customerInfo.phone}</p>
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className={`border rounded-xl p-6 text-center ${
          customerResponse === 'accept'
            ? 'bg-gradient-to-r from-[#1B8A05]/20 to-[#16a34a]/20 border-[#1B8A05]'
            : customerResponse === 'reject'
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300'
            : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300'
        }`}>
          <h2 className={`text-lg font-bold mb-2 ${
            customerResponse === 'accept'
              ? 'text-[#1B8A05]'
              : customerResponse === 'reject'
              ? 'text-red-600'
              : 'text-blue-600'
          }`}>
            Offered Price
          </h2>
          <div className="flex items-center justify-center gap-2">
            <IndianRupee size={32} className={
              customerResponse === 'accept'
                ? 'text-[#1B8A05]'
                : customerResponse === 'reject'
                ? 'text-red-600'
                : 'text-blue-600'
            } />
            <span className={`text-4xl font-bold ${
              customerResponse === 'accept'
                ? 'text-[#1B8A05]'
                : customerResponse === 'reject'
                ? 'text-red-600'
                : 'text-blue-600'
            }`}>
              {pricing.final_price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Status Card - Changes based on response */}
        <AnimatePresence mode="wait">
          {customerResponse === null && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-6 border border-gray-200 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="text-blue-600 animate-spin" size={32} />
              </div>
              <h3 className="font-bold text-[#1C1C1B] mb-2">Waiting for Customer Response</h3>
              <p className="text-gray-600 mb-4">Customer will accept or reject on their app</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>Checking for response...</span>
              </div>
            </motion.div>
          )}

          {customerResponse === 'accept' && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 border-2 border-[#1B8A05] text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-[#1B8A05]/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <ThumbsUp className="text-[#1B8A05]" size={40} />
              </motion.div>
              <h3 className="font-bold text-[#1B8A05] text-xl mb-2">Customer Accepted!</h3>
              <p className="text-gray-600 mb-4">
                Deal price: ₹{pricing.final_price.toLocaleString('en-IN')} confirmed
              </p>
              <div className="bg-[#1B8A05]/10 rounded-lg p-3">
                <p className="text-sm text-[#1B8A05] font-semibold">
                  Proceeding to KYC verification in 3 seconds...
                </p>
              </div>
            </motion.div>
          )}

          {customerResponse === 'reject' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 border-2 border-red-500 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <ThumbsDown className="text-red-600" size={40} />
              </motion.div>
              <h3 className="font-bold text-red-600 text-xl mb-2">Customer Rejected</h3>
              <p className="text-gray-600 mb-4">
                Customer declined the offer of ₹{pricing.final_price.toLocaleString('en-IN')}
              </p>
              {rejectionReason && (
                <div className="bg-red-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-red-700 mb-1">Reason:</p>
                  <p className="text-sm text-red-600">{rejectionReason}</p>
                </div>
              )}
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-700 font-semibold">
                  Returning to leads in 5 seconds...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Action Buttons */}
        {customerResponse && (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Back to Leads
            </button>
            {customerResponse === 'accept' && onContinue && (
              <button
                onClick={onContinue}
                className="flex-1 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#157004] transition flex items-center justify-center gap-2"
              >
                <Shield size={20} />
                Continue to KYC
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Agent KYC Verification Screen Component
// ✅ NEW AgentKYCVerificationScreenProps (simplified)
interface AgentKYCVerificationScreenProps {
  customerInfo: { name: string; phone: string };
  finalPrice: number;
  kycData: {
    id_proof_type: 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | 'pan';
    id_number: string;
    address_proof_type?: 'utility_bill' | 'bank_statement' | 'rental_agreement';  // ✅ FIXED
    verification_notes: string;
  };
  setKycData: React.Dispatch<React.SetStateAction<{
    id_proof_type: 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | 'pan';
    id_number: string;
    address_proof_type?: 'utility_bill' | 'bank_statement' | 'rental_agreement';  // ✅ FIXED
    verification_notes: string;
  }>>;
  capturedImages: { 
    id_proof_front: string | null; 
    id_proof_back: string | null;
    signature: string | null;
    address_proof: string | null;
    device_bill: string | null;
    device_warranty: string | null;
  };
  setCapturedImages: React.Dispatch<React.SetStateAction<{ 
    id_proof_front: string | null; 
    id_proof_back: string | null;
    signature: string | null;
    address_proof: string | null;
    device_bill: string | null;
    device_warranty: string | null;
  }>>;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

// ============================================================================
// STEP 5: Simplified Agent KYC Verification Screen
// ============================================================================

const AgentKYCVerificationScreen: React.FC<AgentKYCVerificationScreenProps> = ({
  customerInfo,
  finalPrice,
  kycData,
  setKycData,
  capturedImages,
  setCapturedImages,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const updateField = <K extends keyof typeof kycData>(key: K, value: typeof kycData[K]) => {
    setKycData(prev => ({ ...prev, [key]: value }));
  };

  const captureImage = async (type: 'id_proof_front' | 'id_proof_back' | 'signature' | 'address_proof' | 'device_bill' | 'device_warranty') => {
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
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const isFormValid = () => {
    const requiredFields = 
      kycData.id_proof_type &&
      kycData.id_number &&
      capturedImages.id_proof_front &&
      capturedImages.signature;

    // For Aadhaar, require back image
    if (kycData.id_proof_type === 'aadhaar') {
      return requiredFields && capturedImages.id_proof_back;
    }

    return requiredFields;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B8A05] to-[#16a34a] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="text-white font-bold">KYC Verification</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Verify Customer Documents</h1>
          <p className="text-white/80">For ₹{finalPrice.toLocaleString('en-IN')} transaction with {customerInfo.name}</p>
        </div>
      </div>

      {/* KYC Form Content */}
      <div className="p-4 space-y-6 pb-32">
        {/* ID Proof Section */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#FEC925]">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#FEC925]" />
            ID Proof (Required)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Type</label>
              <select
                value={kycData.id_proof_type}
                onChange={(e) => updateField('id_proof_type', e.target.value as any)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none bg-white"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="driving_license">Driving License</option>
                <option value="passport">Passport</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number</label>
              <input
                type="text"
                value={kycData.id_number}
                onChange={(e) => updateField('id_number', e.target.value)}
                placeholder="Enter ID number"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none"
              />
            </div>

            {/* ID Proof Front */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Proof - Front Side *
              </label>
              <button
                type="button"
                onClick={() => captureImage('id_proof_front')}
                className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                  capturedImages.id_proof_front ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
                }`}
              >
                {capturedImages.id_proof_front ? (
                  <>
                    <CheckCircle2 className="text-[#1B8A05]" size={24} />
                    <span className="text-sm font-semibold text-[#1B8A05]">ID Front Captured ✓</span>
                  </>
                ) : (
                  <>
                    <Camera className="text-gray-400" size={24} />
                    <span className="text-sm text-gray-600">Capture ID Front</span>
                  </>
                )}
              </button>
            </div>
            
            {/* ID Proof Back - Only for Aadhaar */}
            {kycData.id_proof_type === 'aadhaar' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhaar - Back Side * (Required for Aadhaar)
                </label>
                <button
                  type="button"
                  onClick={() => captureImage('id_proof_back')}
                  className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                    capturedImages.id_proof_back ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
                  }`}
                >
                  {capturedImages.id_proof_back ? (
                    <>
                      <CheckCircle2 className="text-[#1B8A05]" size={24} />
                      <span className="text-sm font-semibold text-[#1B8A05]">Aadhaar Back Captured ✓</span>
                    </>
                  ) : (
                    <>
                      <Camera className="text-gray-400" size={24} />
                      <span className="text-sm text-gray-600">Capture Aadhaar Back</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Signature - Required */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#FEC925]">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <Edit3 size={20} className="text-[#FEC925]" />
            Customer Signature (Required)
          </h3>
          <button
            type="button"
            onClick={() => captureImage('signature')}
            className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center gap-3 transition ${
              capturedImages.signature ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
            }`}
          >
            {capturedImages.signature ? (
              <>
                <CheckCircle2 className="text-[#1B8A05]" size={32} />
                <span className="text-base font-semibold text-[#1B8A05]">Signature Captured ✓</span>
                <span className="text-xs text-gray-500">Click to recapture</span>
              </>
            ) : (
              <>
                <Edit3 className="text-gray-400" size={32} />
                <span className="text-base text-gray-600 font-medium">Capture Customer Signature</span>
                <span className="text-xs text-gray-500">On blank paper or tablet screen</span>
              </>
            )}
          </button>
        </div>

        {/* Optional: Address Proof */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <Home size={20} className="text-gray-400" />
            Address Proof (Optional)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Proof Type</label>
              <select
                value={kycData.address_proof_type || ''}
                onChange={(e) => updateField('address_proof_type', e.target.value as any || undefined)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none bg-white"
              >
                <option value="">Not providing address proof</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="rental_agreement">Rental Agreement</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="passport">Passport</option>
              </select>
            </div>

            {kycData.address_proof_type && (
              <button
                type="button"
                onClick={() => captureImage('address_proof')}
                className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                  capturedImages.address_proof ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
                }`}
              >
                {capturedImages.address_proof ? (
                  <>
                    <CheckCircle2 className="text-[#1B8A05]" size={24} />
                    <span className="text-sm font-semibold text-[#1B8A05]">Address Proof Captured ✓</span>
                  </>
                ) : (
                  <>
                    <Camera className="text-gray-400" size={24} />
                    <span className="text-sm text-gray-600">Capture Address Proof</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Optional: Device Documents */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <Package size={20} className="text-gray-400" />
            Device Documents (Optional)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Device Bill */}
            <button
              type="button"
              onClick={() => captureImage('device_bill')}
              className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                capturedImages.device_bill ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
              }`}
            >
              {capturedImages.device_bill ? (
                <>
                  <CheckCircle2 className="text-[#1B8A05]" size={20} />
                  <span className="text-xs font-semibold text-[#1B8A05] text-center">Bill Captured</span>
                </>
              ) : (
                <>
                  <Receipt className="text-gray-400" size={20} />
                  <span className="text-xs text-gray-600 text-center">Device Bill</span>
                </>
              )}
            </button>

            {/* Device Warranty */}
            <button
              type="button"
              onClick={() => captureImage('device_warranty')}
              className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition ${
                capturedImages.device_warranty ? 'border-[#1B8A05] bg-[#1B8A05]/10' : 'border-gray-300 hover:border-[#FEC925]'
              }`}
            >
              {capturedImages.device_warranty ? (
                <>
                  <CheckCircle2 className="text-[#1B8A05]" size={20} />
                  <span className="text-xs font-semibold text-[#1B8A05] text-center">Warranty Captured</span>
                </>
              ) : (
                <>
                  <Shield className="text-gray-400" size={20} />
                  <span className="text-xs text-gray-600 text-center">Warranty Card</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verification Notes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Verification Notes (Optional)
          </h3>
          <textarea
            value={kycData.verification_notes}
            onChange={(e) => updateField('verification_notes', e.target.value)}
            placeholder="Add any notes about KYC verification..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-20"
          />
        </div>

        {/* Validation Summary */}
        {!isFormValid() && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Required Fields Missing
            </h4>
            <ul className="text-sm text-red-600 space-y-1">
              {!kycData.id_number && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  ID number is required
                </li>
              )}
              {!capturedImages.id_proof_front && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  ID proof front photo is required
                </li>
              )}
              {kycData.id_proof_type === 'aadhaar' && !capturedImages.id_proof_back && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Aadhaar back photo is required
                </li>
              )}
              {!capturedImages.signature && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Customer signature is required
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-2xl mx-auto space-y-2">
          <button
            onClick={onSubmit}
            disabled={!isFormValid() || isSubmitting}
            className={`w-full px-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              isFormValid() && !isSubmitting
                ? 'bg-[#1B8A05] text-white hover:bg-[#157004] shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Uploading Documents...</span>
              </>
            ) : (
              <>
                <Shield size={24} />
                <span>Submit KYC Documents</span>
              </>
            )}
          </button>
          {!isFormValid() && (
            <p className="text-center text-sm text-red-600 font-medium">
              Complete all required fields to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


// Agent Payment Processing Screen Component
interface AgentPaymentProcessingScreenProps {
  customerInfo: { name: string; phone: string };
  finalAmount: number;
  selectedPaymentMethod: 'cash' | 'partner_wallet' | null;
  setSelectedPaymentMethod: React.Dispatch<React.SetStateAction<'cash' | 'partner_wallet' | null>>;
  completionNotes: string;
  setCompletionNotes: React.Dispatch<React.SetStateAction<string>>;
  onComplete: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

// ============================================================================
// STEP 6: Payment Processing Screen (Already matches API well, minor improvements)
// ============================================================================

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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1C1C1B] to-[#2d2d2c] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="text-white font-bold">Payment Processing</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Complete Transaction</h1>
          <p className="text-white/80">Final step: Process ₹{finalAmount.toLocaleString('en-IN')} payment</p>
        </div>
      </div>

      {/* Payment Content */}
      <div className="p-4 space-y-6 pb-32">
        {/* Transaction Summary */}
        <div className="bg-white rounded-xl p-4 border-2 border-[#FEC925]">
          <h3 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
            <Receipt size={20} className="text-[#FEC925]" />
            Transaction Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-semibold">{customerInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold">{customerInfo.phone}</span>
            </div>
            <div className="flex justify-between border-t-2 pt-2 mt-2">
              <span className="font-bold text-[#1C1C1B]">Final Amount:</span>
              <span className="font-bold text-[#1B8A05] flex items-center text-xl">
                <IndianRupee size={20} />
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
              type="button"
              onClick={() => setSelectedPaymentMethod('cash')}
              className={`w-full p-5 rounded-xl border-2 transition flex items-center gap-4 ${
                selectedPaymentMethod === 'cash'
                  ? 'border-[#1B8A05] bg-[#1B8A05]/10'
                  : 'border-gray-200 hover:border-[#1B8A05]'
              }`}
            >
              <div className="w-14 h-14 bg-[#FEC925]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <IndianRupee className="text-[#FEC925]" size={28} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-[#1C1C1B] mb-1">Cash Payment</h4>
                <p className="text-sm text-gray-600">Customer pays cash. Blocked wallet amount returns to you.</p>
              </div>
              {selectedPaymentMethod === 'cash' && (
                <CheckCircle2 className="text-[#1B8A05] flex-shrink-0" size={28} />
              )}
            </button>

            {/* Wallet Payment */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('partner_wallet')}
              className={`w-full p-5 rounded-xl border-2 transition flex items-center gap-4 ${
                selectedPaymentMethod === 'partner_wallet'
                  ? 'border-[#1B8A05] bg-[#1B8A05]/10'
                  : 'border-gray-200 hover:border-[#1B8A05]'
              }`}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet className="text-blue-600" size={28} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-[#1C1C1B] mb-1">Partner Wallet</h4>
                <p className="text-sm text-gray-600">Pay from wallet. Amount deducted from blocked balance.</p>
              </div>
              {selectedPaymentMethod === 'partner_wallet' && (
                <CheckCircle2 className="text-[#1B8A05] flex-shrink-0" size={28} />
              )}
            </button>
          </div>

          {/* Payment Method Explanation */}
          {selectedPaymentMethod && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                {selectedPaymentMethod === 'cash' ? 'Cash Payment Details' : 'Wallet Payment Details'}
              </h4>
              <p className="text-sm text-blue-800">
                {selectedPaymentMethod === 'cash'
                  ? '✓ Customer pays you cash directly\n✓ Your blocked wallet amount will be released\n✓ Transaction completes immediately'
                  : '✓ Amount deducted from your wallet\n✓ Blocked balance will be used\n✓ Instant transaction completion'
                }
              </p>
            </div>
          )}
        </div>

        {/* Completion Notes */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Transaction Notes (Optional)
          </h3>
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes about payment or transaction..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-20"
          />
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
            <AlertCircle size={18} />
            Before Completing Payment
          </h4>
          <ul className="text-sm text-amber-800 space-y-1 ml-1">
            <li>✓ Verify customer details are correct</li>
            <li>✓ Ensure all documents are captured</li>
            <li>✓ Confirm payment method with customer</li>
            {selectedPaymentMethod === 'cash' && (
              <li className="font-semibold">✓ Collect cash from customer before proceeding</li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-2xl mx-auto space-y-2">
          <button
            onClick={onComplete}
            disabled={!selectedPaymentMethod || isProcessing}
            className={`w-full px-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              selectedPaymentMethod && !isProcessing
                ? 'bg-[#1B8A05] text-white hover:bg-[#157004] shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={24} />
                <span>Process Payment & Complete Deal</span>
              </>
            )}
          </button>
          {!selectedPaymentMethod && (
            <p className="text-center text-sm text-red-600 font-medium">
              Please select a payment method
            </p>
          )}
          {selectedPaymentMethod && (
            <p className="text-center text-xs text-gray-500">
              This will finalize the transaction and mark the visit as complete
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