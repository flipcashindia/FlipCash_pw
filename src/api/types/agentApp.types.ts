// src/types/agentApp.types.ts
// Type definitions for Agent-facing Application
// IMPORTANT: Field names MUST match backend serializers exactly

// =====================================================
// AGENT SELF PROFILE
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
  partner: string;
  partner_name: string;
  employee_code: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  verification_status: 'pending' | 'verified' | 'rejected';
  is_verified: boolean;
  is_available: boolean;
  can_accept_leads: boolean;
  current_assigned_leads_count: number;
  max_concurrent_leads: number;
  total_leads_completed: number;
  average_rating: string | null;
  created_at: string;
}

// =====================================================
// ASSIGNED LEAD (What agent sees)
// =====================================================

export interface AgentAssignedLead {
  // Assignment info
  assignment_id: string;
  assignment_status: AssignmentStatus;
  assignment_priority: 'low' | 'normal' | 'high' | 'urgent';
  assignment_notes: string;
  
  // Lead info
  lead_id: string;
  lead_number: string;
  lead_status: string;
  lead_status_display: string;
  
  // Customer info (limited for privacy)
  customer_name: string;
  customer_phone: string;
  
  // Device info
  device_category: string;
  device_brand: string;
  device_model: string;
  device_storage: string;
  device_color: string;
  condition_responses: Record<string, any>;
  
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
// VERIFICATION & INSPECTION
// =====================================================

export interface VerificationCodeRequest {
  verification_code: string;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface DeviceConditionItem {
  id: string;
  question: string;
  category: string;
  answer: boolean | string | null;
  notes?: string;
  image_url?: string;
}

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
  
  // Additional notes
  notes: string;
  
  // Images (URLs after upload)
  front_image?: string;
  back_image?: string;
  screen_image?: string;
  imei_image?: string;
  defect_images?: string[];
}

export interface InspectionSubmitRequest {
  inspection_data: DeviceInspectionData;
  images: {
    front?: File;
    back?: File;
    screen?: File;
    imei?: File;
    defects?: File[];
  };
}

// =====================================================
// PRICE RE-ESTIMATION
// =====================================================

export interface PriceDeduction {
  reason: string;
  amount: number;
  category: string;
}

export interface PriceReEstimationData {
  original_price: number;
  deductions: PriceDeduction[];
  final_price: number;
  notes: string;
}

export interface PriceReEstimationRequest {
  inspection_data: DeviceInspectionData;
  proposed_price: number;
  price_breakdown: {
    base_price: number;
    deductions: PriceDeduction[];
  };
  notes: string;
}

// =====================================================
// DEAL COMPLETION
// =====================================================

export interface CompleteDealRequest {
  final_price: number;
  payment_method: 'cash' | 'upi' | 'bank_transfer';
  customer_signature?: string; // Base64 encoded signature
  notes?: string;
}

export interface CompletedDeal {
  id: string;
  lead_number: string;
  device_name: string;
  final_price: number;
  payment_method: string;
  completed_at: string;
  customer_name: string;
}

// =====================================================
// AGENT STATS
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
// API RESPONSES
// =====================================================

export interface AgentAssignedLeadsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentAssignedLead[];
}

export interface AgentActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

// =====================================================
// LOCATION
// =====================================================

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}