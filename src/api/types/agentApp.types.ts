// src/api/types/agentApp.types.ts
// Type definitions for Agent Self-Service Application
// CRITICAL: Field names MUST match backend serializers exactly
// Based on: FlipCash_b1/partner_agents/urls.py

// =====================================================
// AGENT PROFILE (AgentMeView)
// GET/PUT /api/v1/partner-agents/me/
// =====================================================

export interface AgentSelfProfile {
  id: string;
  user: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    is_phone_verified: boolean;
    kyc_status: string;
    created_at: string;
  };
  partner: string;                    // UUID
  partner_name: string;               // Partner business name
  employee_code: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  verification_status: 'pending' | 'verified' | 'rejected';
  is_verified: boolean;
  is_available: boolean;
  can_accept_leads: boolean;
  current_assigned_leads_count: number;
  max_concurrent_leads: number;
  total_leads_completed: number;
  total_visits_completed: number;
  average_rating: string | null;
  created_at: string;
}

// =====================================================
// ASSIGNED LEAD (AgentAssignedLeadsView)
// GET /api/v1/partner-agents/my-leads/
// =====================================================

export interface AgentAssignedLead {
  // Assignment info
  assignment_id: string;
  assignment_status: AssignmentStatus;
  assignment_priority: 'low' | 'normal' | 'high' | 'urgent';
  assignment_notes: string;
  
  // Lead info
  lead: string;                       // lead UUID
  lead_number: string;
  
  // Device info
  device_name: string;
  device_category: string;
  device_brand: string;
  device_model: string;
  device_storage: string;
  device_color: string;
  condition_responses?: Record<string, any>;
  
  // Customer info
  customer_name: string;
  customer_phone: string;
  
  // Pricing
  estimated_price: string;
  quoted_price: string | null;
  final_price: string | null;
  
  // Pickup
  pickup_address: {
    id: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  preferred_date: string;
  preferred_time_slot: string;
  
  // Notes
  customer_notes: string;
  
  // Timestamps
  assigned_at: string;
  accepted_at: string | null;
  started_at: string | null;
  checked_in_at: string | null;
  inspection_started_at: string | null;
  completed_at: string | null;
  expected_completion_at: string | null;
  status: string;
  status_history: [];
}

// ✅ COMPLETE: All assignment statuses from backend AgentLeadAssignment.Status
export type AssignmentStatus = 
  | 'assigned'
  | 'accepted'
  | 'rejected'
  | 'en_route'
  | 'checked_in'
  | 'code_verified'
  | 'inspecting'
  | 'inspection_submitted'
  | 'awaiting_customer_response'
  | 'customer_accepted'
  | 'customer_rejected'
  | 'kyc_completed'
  | 'payment_processed'
  | 'completed'
  | 'cancelled';

// =====================================================
// VISIT DETAILS (AgentVisitDetailView)
// GET /api/v1/partner-agents/my-leads/{id}/visit/
// =====================================================

export interface AgentVisitDetail {
  id: string;                         // visit UUID
  lead: string;
  lead_number: string;
  assignment: string;
  
  // Status
  status: VisitStatus;
  status_display: string;
  
  // Customer
  customer_name: string;
  customer_phone: string;
  
  // Device
  device_name: string;
  device_category: string;
  device_brand: string;
  device_model: string;
  
  // Pricing
  estimated_price: string;
  offered_price: string | null;
  final_price: string | null;
  
  // Location
  pickup_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    latitude: number | null;
    longitude: number | null;
  };
  
  // Schedule
  scheduled_date: string;
  scheduled_time_slot: string;
  
  // Verification
  verification_code?: string;         // Only shown when needed
  code_verified: boolean;
  code_verified_at: string | null;
  
  // Inspection
  inspection_started_at: string | null;
  inspection_completed_at: string | null;
  inspection_notes: string | null;
  inspection_photos: string[];
  
  // Completion
  completed_at: string | null;
  completion_notes: string | null;
  customer_signature_url: string | null;
  
  // Timestamps
  started_at: string | null;
  arrived_at: string | null;
}

export type VisitStatus = 
  | 'scheduled'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'inspection_done'
  | 'offer_made'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// =====================================================
// REQUEST TYPES
// =====================================================

/**
 * Update availability
 * PUT /api/v1/partner-agents/me/
 */
export interface UpdateAvailabilityRequest {
  is_available: boolean;
}

/**
 * Check-in at location
 * POST /api/v1/partner-agents/my-leads/{id}/check-in/
 */
export interface CheckInRequest {
  latitude: number;
  longitude: number;
  notes?: string;
}

/**
 * Verify arrival code
 * POST /api/v1/partner-agents/my-leads/{id}/visit/verify-code/
 */
export interface VerifyCodeRequest {
  code: string;                       // 6-digit code from customer
  latitude?: number;
  longitude?: number;
}

/**
 * Submit inspection
 * POST /api/v1/partner-agents/my-leads/{id}/visit/submit-inspection/
 * 
 * Backend expects partner_assessment as an object with:
 * - screen_condition, body_condition, battery_health, device_age
 * - accessories: { charger_available, box_available, earphones_available, bill_available }
 * - functional_issues: string[]
 */
export interface SubmitInspectionRequest {
  verified_imei: string;
  imei_matches: boolean;
  device_powers_on: boolean;
  inspection_notes: string;
  inspection_photos: string[];       // URLs of uploaded photos
  partner_assessment: PartnerAssessment;
  condition_inputs?: Record<string, string | number | boolean>;  // Direct pricing inputs
  partner_recommended_price?: number;  // Optional recommended price
  checklist_items?: ChecklistItem[];
}

/**
 * Partner's assessment of the device condition
 * Used in submit-inspection endpoint
 */
export interface PartnerAssessment {
  screen_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  body_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  battery_health?: number;              // 0-100 percentage
  battery_condition?: 'excellent' | 'good' | 'fair' | 'poor';
  device_age?: string;                  // e.g., "0-6_months", "6-12_months", "1-2_years"
  accessories: {
    charger_available: boolean;
    box_available: boolean;
    earphones_available?: boolean;
    bill_available?: boolean;
  };
  functional_issues: string[];          // List of issues found
}

export interface ChecklistItem {
  item: string;
  passed: boolean;
  notes?: string;
}

/**
 * Make price offer
 * POST /api/v1/partner-agents/my-leads/{id}/visit/make-offer/
 */
export interface MakeOfferRequest {
  offered_price: number;
  offer_notes?: string;
}

/**
 * Complete visit
 * POST /api/v1/partner-agents/my-leads/{id}/visit/complete/
 */
export interface CompleteVisitRequest {
  final_price: number;
  customer_signature_url?: string;
  completion_notes?: string;
}

/**
 * Cancel visit
 * POST /api/v1/partner-agents/my-leads/{id}/visit/cancel/
 */
export interface CancelVisitRequest {
  reason: string;
}

/**
 * Location breadcrumb
 * POST /api/v1/partner-agents/my-leads/{id}/visit/breadcrumb/
 */
export interface LocationBreadcrumbRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Update GPS location
 * POST /api/v1/partner-agents/update-location/
 */
export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface AgentAssignedLeadsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentAssignedLead[];
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

// =====================================================
// STATS
// =====================================================

export interface AgentDashboardStats {
  total_assigned: number;
  pending_acceptance: number;
  in_progress: number;
  completed_today: number;
  completed_this_week: number;
  completed_this_month: number;
  average_rating: number | null;
  total_earnings: number;
}

// =====================================================
// DEVICE INSPECTION DATA (for UI form)
// =====================================================

export interface DeviceInspectionData {
  // Physical condition
  screen_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  body_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  
  // Functional tests
  power_on: boolean;
  touch_working: boolean;
  display_working: boolean;
  speakers_working: boolean;
  microphone_working: boolean;
  cameras_working: boolean;
  buttons_working: boolean;
  charging_port_working: boolean;
  wifi_working: boolean;
  bluetooth_working: boolean;
  sim_slot_working: boolean;
  fingerprint_working: boolean | null;
  face_id_working: boolean | null;
  
  // Device info verification
  imei_verified: boolean;
  imei_number: string;
  storage_verified: boolean;
  actual_storage: string;
  battery_health: number | null;
  
  // Accessories
  has_box: boolean;
  has_charger: boolean;
  has_earphones: boolean;
  has_bill: boolean;
  
  // Additional
  notes: string;
  
  // Image URLs (after upload)
  front_image?: string;
  back_image?: string;
  screen_image?: string;
  imei_image?: string;
  defect_images?: string[];
}

// =====================================================
// PRICE CALCULATION
// =====================================================

export interface PriceDeduction {
  reason: string;
  amount: number;
  category: string;
}

export interface CalculatedPrice {
  original_price: number;
  calculated_price: number;
  deductions: PriceDeduction[];
}

// =====================================================
// GEOLOCATION
// =====================================================

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// =====================================================
// ADDITIONAL REQUEST TYPES (Aliases & Extended)
// =====================================================

/**
 * Location update request
 * POST /api/v1/partner-agents/update-location/
 */
export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
}

/**
 * Price re-estimation request
 * Used when agent submits new price based on inspection
 */
export interface PriceReEstimationRequest {
  original_price: number;
  proposed_price: number;
  deductions: PriceDeduction[];
  reason_for_change?: string;
  notes?: string;
}

/**
 * Complete deal request
 * Final step to complete the transaction
 */
export interface CompleteDealRequest {
  final_price: number;
  payment_method: 'cash' | 'upi' | 'bank_transfer';
  customer_signature?: string;       // Base64 or URL
  customer_id_verified?: boolean;
  notes?: string;
}

/**
 * Agent action response
 * Standard response for agent actions
 */
export interface AgentActionResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
  error?: string;
}

// =====================================================
// ACTIVITY LOG (for agent's own activity)
// =====================================================

export interface AgentActivityLogEntry {
  id: string;
  activity_type: string;
  description: string;
  lead_number?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface AgentActivityLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentActivityLogEntry[];
}





// =====================================================
// KYC VERIFICATION & PAYMENT PROCESSING (NEW)
// =====================================================

/**
 * Customer address for KYC verification
 */
export interface CustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

/**
 * KYC verification request
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/kyc-verification/
 */
export interface KYCVerificationRequest {
  // Customer identification
  customer_id_proof_type: 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | 'pan_card';
  customer_id_number: string;
  
  // Customer personal details
  customer_full_name: string;
  customer_father_name: string;
  customer_date_of_birth: string; // YYYY-MM-DD format
  customer_address: CustomerAddress;
  
  // Document images (base64 encoded)
  id_proof_photo: string;
  customer_signature: string;
  customer_selfie: string;
  
  // Agent verification
  agent_declaration: boolean;
  verification_notes?: string;
}

/**
 * KYC verification response
 */
export interface KYCVerificationResponse {
  success: boolean;
  message: string;
  customer_name: string;
  verification_id: string;
  verified_at: string;
  next_action: string;
  workflow_stage: string;
  available_payment_methods: string[];
  final_amount: number;
}

/**
 * Cash payment confirmation details
 */
export interface CashPaymentConfirmation {
  amount_given: number;
  customer_receipt_signature?: string; // base64 encoded
  payment_notes?: string;
}

/**
 * Payment processing request
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/process-payment/
 */
export interface PaymentProcessRequest {
  payment_method: 'cash' | 'partner_wallet';
  cash_payment_confirmation?: CashPaymentConfirmation;
  completion_notes?: string;
}

/**
 * Payment processing response
 */
export interface PaymentProcessResponse {
  success: boolean;
  message: string;
  transaction_details: {
    lead_number: string;
    customer_name: string;
    final_amount: number;
    payment_method: string;
    transaction_id: string;
    completed_at: string;
  };
  next_action: string;
  workflow_stage: string;
}

/**
 * KYC verification data (for UI form)
 */
export interface KYCVerificationData {
  customer_id_proof_type: 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | 'pan_card';
  customer_id_number: string;
  customer_full_name: string;
  customer_father_name: string;
  customer_date_of_birth: string;
  customer_address: CustomerAddress;
  id_proof_photo: string;
  customer_signature: string;
  customer_selfie: string;
  agent_declaration: boolean;
  verification_notes?: string;
}

/**
 * Payment data (for UI form)
 */
export interface PaymentData {
  payment_method: 'cash' | 'partner_wallet';
  cash_payment_confirmation?: CashPaymentConfirmation;
  completion_notes?: string;
}

// =====================================================
// CUSTOMER ACCEPTANCE (EXISTING - for reference)
// =====================================================

/**
 * Customer acceptance request
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/customer-response/
 */
export interface CustomerAcceptanceRequest {
  customer_response: 'accept' | 'reject';
  customer_signature?: string; // base64 encoded
  rejection_reason?: string;
}

/**
 * Customer acceptance response
 */
// export interface CustomerAcceptanceResponse {
//   success: boolean;
//   message: string;
//   next_action?: string;
//   workflow_stage?: string;
//   payment_methods?: string[];
// }


// =====================================================
// NEW WORKFLOW TYPES
// =====================================================

/**
 * KYC Document Upload Request (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/kyc-documents/
 * 
 * Uses multipart/form-data
 * Backend: AgentKYCDocumentUploadSerializer
 */
export interface KYCDocumentUploadRequest {
  // Required fields
  id_proof_type: 'aadhaar' | 'pan' | 'driving_license' | 'passport' | 'voter_id';
  id_number: string;
  customer_confirmed: boolean;
  
  // Required files
  id_proof_front: File | Blob;          // Always required
  customer_signature: File | Blob;       // Always required
  
  // Conditionally required
  id_proof_back?: File | Blob;          // Required for Aadhaar, optional for others
  
  // Optional fields
  address_proof_type?: 'utility_bill' | 'bank_statement' | 'rental_agreement';
  address_proof?: File | Blob;
  
  // Optional device documents
  device_bill?: File | Blob;
  device_warranty?: File | Blob;
  device_box?: File | Blob;
  
  // Optional notes
  verification_notes?: string;
}

/**
 * KYC Document Upload Response (NEW)
 * Backend: AgentKYCDocumentUploadView response
 */
export interface KYCDocumentUploadResponse {
  success: boolean;
  message: string;
  documents_uploaded: number;
  assignment_status: string;
  lead_status: string;
  visit_status: string;
  next_action: string;
  final_price: number;
  customer_name: string;
  customer_phone: string;
}

/**
 * Payment Processing Request (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/process-payment/
 * 
 * Backend: AgentPaymentProcessSerializer
 */
export interface PaymentProcessRequest {
  payment_method: 'cash' | 'partner_wallet';
  
  // Required if payment_method === 'cash'
  cash_amount_given?: number;
  
  // Optional
  receipt_signature?: string;  // base64 or blob
  payment_notes?: string;
}

/**
 * Payment Processing Response (NEW)
 * Backend: PaymentResultSerializer + AgentPaymentProcessView response
 */
export interface PaymentProcessResponse {
  success: boolean;
  message: string;
  transaction_id: string;
  payment_method: string;
  amount_paid: number;
  wallet_balance_before: number;
  wallet_balance_after: number;
  amount_unblocked?: number;  // Only for cash payments
  invoice_generated: boolean;
  invoice_number?: string;
  assignment_status: string;
  lead_status: string;
  visit_status: string;
  next_action: string;
}

/**
 * Final Completion Request (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/final-complete/
 * 
 * No body required typically
 */
export interface FinalCompleteRequest {
  completion_notes?: string;
}

/**
 * Final Completion Response (NEW)
 * Backend: VisitCompletionResponseSerializer
 */
export interface FinalCompleteResponse {
  success: boolean;
  message: string;
  visit_id: string;
  lead_id: string;
  assignment_id: string;
  visit_status: string;
  lead_status: string;
  assignment_status: string;
  completed_at: string;
  final_price: number;
  kyc_documents_count: number;
  payment_transaction_id: string;
  invoice_number?: string;
}

/**
 * Workflow Status Response (NEW)
 * GET /api/v1/partner-agents/my-leads/{assignment_id}/visit/workflow-status/
 * 
 * Backend: WorkflowStatusSerializer
 */
export interface WorkflowStatusResponse {
  assignment_status: string;
  visit_status: string;
  lead_status: string;
  stages_completed: string[];
  current_stage: string;
  next_stage?: string;
  requirements: {
    documents_needed?: string[];
    payment_methods_available?: string[];
    minimum_documents?: number;
  };
  can_proceed: boolean;
  blocking_issues: string[];
}

// =====================================================
// UPDATED: Customer Acceptance Types (for reference)
// =====================================================

/**
 * Customer Acceptance Request (EXISTING)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/customer-response/
 */
export interface CustomerAcceptanceRequest {
  customer_response: 'accept' | 'reject';
  customer_signature?: string; // base64 encoded
  rejection_reason?: string;
}

/**
 * Customer Acceptance Response (EXISTING)
 */
export interface CustomerAcceptanceResponse {
  success: boolean;
  message: string;
  customer_response: string;
  final_price: number;
  next_action: string;
  workflow_stage: string;
  available_actions: string[];
  assignment_status: string;
  lead_status: string;
  visit_status: string;
}

// =====================================================
// HELPER TYPES FOR UI
// =====================================================

/**
 * KYC Form Data (for UI state management)
 */
export interface KYCFormData {
  idProofType: 'aadhaar' | 'pan' | 'driving_license' | 'passport' | 'voter_id';
  idNumber: string;
  idProofFrontFile: File | null;
  idProofBackFile: File | null;
  customerSignatureFile: File | null;
  addressProofType?: 'utility_bill' | 'bank_statement' | 'rental_agreement';
  addressProofFile: File | null;
  deviceBillFile: File | null;
  deviceWarrantyFile: File | null;
  deviceBoxFile: File | null;
  verificationNotes: string;
  customerConfirmed: boolean;
}

/**
 * Payment Form Data (for UI state management)
 */
export interface PaymentFormData {
  paymentMethod: 'cash' | 'partner_wallet' | null;
  cashAmountGiven: number;
  receiptSignature: string | null;
  paymentNotes: string;
}

/**
 * Workflow Stage enum
 */
export const WorkflowStage = {
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  EN_ROUTE: 'en_route',
  CHECKED_IN: 'checked_in',
  CODE_VERIFIED: 'code_verified',
  INSPECTING: 'inspecting',
  INSPECTION_SUBMITTED: 'inspection_submitted',
  AWAITING_CUSTOMER_RESPONSE: 'awaiting_customer_response',
  CUSTOMER_ACCEPTED: 'customer_accepted',
  CUSTOMER_REJECTED: 'customer_rejected',
  KYC_COMPLETED: 'kyc_completed',
  PAYMENT_PROCESSED: 'payment_processed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Document upload status
 */
export interface DocumentUploadStatus {
  type: string;
  file: File | null;
  preview: string | null;
  uploaded: boolean;
  url?: string;
  error?: string;
}








// Export all new types
// export {
//   CustomerAddress,
//   KYCVerificationRequest,
//   KYCVerificationResponse,
//   CashPaymentConfirmation,
//   PaymentProcessRequest,
//   PaymentProcessResponse,
//   KYCVerificationData,
//   PaymentData,
//   CustomerAcceptanceRequest,
//   CustomerAcceptanceResponse,
// };
































































































































































