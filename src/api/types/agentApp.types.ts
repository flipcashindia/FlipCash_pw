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
}

export type AssignmentStatus = 
  | 'assigned'
  | 'accepted'
  | 'rejected'
  | 'en_route'
  | 'checked_in'
  | 'inspecting'
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