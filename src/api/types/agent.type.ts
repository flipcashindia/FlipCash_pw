// src/api/types/agent.types.ts
// Type definitions for Partner Agents
// CRITICAL: Field names MUST match backend serializers exactly
// Based on: FlipCash_b1/partner_agents/serializers.py

// =====================================================
// USER MODEL (from accounts app)
// =====================================================

export interface AgentUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  is_phone_verified?: boolean;
  kyc_status?: string;
  created_at?: string;
}

// =====================================================
// AGENT PROFILE (AgentProfileSerializer)
// =====================================================

export interface AgentProfile {
  id: string;
  user: AgentUser;
  partner: string;                    // UUID of partner
  partner_business_name: string;      // read_only from serializer
  
  // Backend uses employee_code, NOT employee_id
  employee_code: string;
  
  status: AgentStatus;
  is_available: boolean;
  
  // Verification
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_at?: string;
  is_verified?: boolean;              // read_only computed field
  
  // Aadhaar (masked in response)
  masked_aadhaar?: string;
  
  // Location (Decimal fields come as strings)
  last_known_latitude: string | null;
  last_known_longitude: string | null;
  last_location_update: string | null;
  
  // Metrics (read_only)
  total_leads_completed: number;
  total_visits_completed: number;
  average_rating: string | null;      // Decimal as string
  
  // Capacity
  max_concurrent_leads: number;
  can_accept_leads?: boolean;         // computed
  current_assigned_leads_count?: number; // computed
  active_assignments_count?: number;  // alias for current_assigned_leads_count
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Notes
  notes?: string;
}

export type AgentStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// =====================================================
// AGENT LIST ITEM (Flat structure from list endpoint)
// Backend returns flat fields for list view for performance
// =====================================================

export interface AgentListItem {
  id: string;
  user_phone: string;                  // Flat field from serializer
  user_name: string;                   // Flat field from serializer
  employee_code: string;
  status: AgentStatus;
  is_available: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_verified: boolean;
  can_accept_leads: boolean;
  current_assigned_leads_count: number;
  total_leads_completed: number;
  average_rating: string;              // Decimal as string
  created_at: string;
}

// =====================================================
// LEAD ASSIGNMENT (LeadAssignmentSerializer)
// =====================================================

export interface AgentLeadAssignment {
  id: string;
  agent: string;                      // UUID
  agent_name: string;                 // read_only
  lead: string;                       // UUID
  lead_number: string;                // read_only
  status: AssignmentStatus;
  status_display: string;             // read_only
  priority: AssignmentPriority;
  
  // Timestamps
  assigned_at: string;
  accepted_at: string | null;
  started_at: string | null;
  checked_in_at: string | null;
  inspection_started_at: string | null;
  completed_at: string | null;
  expected_completion_at: string | null;
  
  // Location (check-in coordinates)
  checkin_latitude: string | null;
  checkin_longitude: string | null;
  
  // Notes
  assignment_notes: string;
  completion_notes?: string;
  
  // Lead details (nested, for detail view)
  lead_details?: LeadDetails;
}

export type AssignmentStatus = 
  | 'assigned'      // Just assigned, waiting for agent to accept
  | 'accepted'      // Agent accepted
  | 'rejected'      // Agent rejected
  | 'en_route'      // Agent is traveling to location
  | 'checked_in'    // Agent arrived at location
  | 'inspecting'    // Device inspection in progress
  | 'in_progress'   // Legacy status
  | 'completed'     // Assignment completed
  | 'cancelled';    // Assignment cancelled

export type AssignmentPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface LeadDetails {
  lead_number: string;
  device_name: string;
  device_category: string;
  device_brand: string;
  device_model: string;
  device_storage?: string;
  device_color?: string;
  customer_name: string;
  customer_phone: string;
  pickup_address: PickupAddress;
  estimated_price: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  condition_responses?: Record<string, any>;
}

export interface PickupAddress {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
}

// =====================================================
// ACTIVITY LOG (AgentActivityLogSerializer)
// =====================================================

export interface AgentActivityLog {
  id: string;
  agent: string;
  agent_name?: string;
  activity_type: string;
  description: string;
  lead_assignment: string | null;
  lead_number?: string | null;
  latitude: string | null;
  longitude: string | null;
  ip_address?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// =====================================================
// REQUEST TYPES (matching serializer fields)
// =====================================================

/**
 * AgentCreateSerializer fields
 * POST /api/v1/partner-agents/agents/
 */
export interface CreateAgentRequest {
  phone: string;                    // Required - 10 digit Indian phone (starting 6-9)
  name: string;                     // Required - Full name
  email?: string;                   // Optional
  employee_code?: string;           // Optional - unique within partner
  max_concurrent_leads?: number;    // Optional, default 5, range 1-20
  aadhaar_number?: string;          // Optional - 12 digits
  notes?: string;                   // Optional
}

/**
 * AgentUpdateSerializer fields
 * PUT/PATCH /api/v1/partner-agents/agents/{id}/
 */
export interface UpdateAgentRequest {
  name?: string;
  email?: string;
  employee_code?: string;
  status?: AgentStatus;
  is_available?: boolean;
  max_concurrent_leads?: number;
  notes?: string;
}

/**
 * LeadAssignmentCreateSerializer fields
 * POST /api/v1/partner-agents/assignments/
 */
export interface CreateAssignmentRequest {
  agent_id: string;                 // UUID of agent
  lead_id: string;                  // UUID of lead
  priority?: AssignmentPriority;    // default 'normal'
  assignment_notes?: string;
  expected_completion_at?: string;  // ISO datetime
}

/**
 * Reassign lead request
 * POST /api/v1/partner-agents/assignments/{id}/reassign/
 */
export interface ReassignLeadRequest {
  new_agent_id: string;
  reason?: string;
}

/**
 * Aadhaar verification request
 * POST /api/v1/partner-agents/agents/{id}/verify/
 */
export interface AadhaarVerifyRequest {
  aadhaar_number: string;
  aadhaar_front_image?: string;     // URL or base64
  aadhaar_back_image?: string;      // URL or base64
}

// =====================================================
// RESPONSE TYPES
// =====================================================

// Backend returns flat array for list endpoint (not paginated by default)
export type AgentListResponse = AgentListItem[];

// Paginated response (if pagination is enabled)
export interface AgentListPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentListItem[];
}

export interface AgentAssignmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentLeadAssignment[];
}

export interface ActivityLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentActivityLog[];
}

// =====================================================
// STATS
// =====================================================

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  available_agents: number;
  verified_agents: number;
  total_assignments_today: number;
  completed_today: number;
}

export interface SingleAgentStats {
  total_assignments: number;
  completed_assignments: number;
  pending_assignments: number;
  average_completion_time: string | null;
  total_earnings: number;
  this_month_completed: number;
}

// =====================================================
// ASSIGNABLE LEADS
// GET /api/v1/partner-agents/assignable-leads/
// =====================================================

export interface AssignableLead {
  id: string;
  lead_number: string;
  device_name: string;
  device_category: string;
  device_brand: string;
  device_model: string;
  customer_name: string;
  pickup_city: string;
  estimated_price: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  status: string;
  claimed_at: string;
}

export interface AssignableLeadsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AssignableLead[];
}

// =====================================================
// FILTER PARAMS
// =====================================================

export interface AgentListParams {
  status?: AgentStatus;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_available?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AssignmentListParams {
  status?: string;                  // comma-separated: 'assigned,accepted,en_route'
  priority?: AssignmentPriority;
  agent?: string;                   // UUID
  lead?: string;                    // UUID
  lead_number?: string;
  is_active?: boolean;
  is_overdue?: boolean;
  page?: number;
  page_size?: number;
}







