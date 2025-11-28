// src/types/agent.types.ts
// Type definitions for Partner Agents
// IMPORTANT: Field names MUST match backend serializers exactly

export interface AgentUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  is_phone_verified?: boolean;
  kyc_status?: string;
  created_at?: string;
}

export interface AgentProfile {
  id: string;
  user: AgentUser;
  partner: string;
  partner_business_name: string;
  
  // Backend uses employee_code, NOT employee_id
  employee_code: string;
  
  status: AgentStatus;
  is_available: boolean;
  
  // Verification
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_at?: string;
  is_verified?: boolean;
  
  // Aadhaar (masked)
  masked_aadhaar?: string;
  
  // Location
  last_known_latitude: string | null;
  last_known_longitude: string | null;
  last_location_update: string | null;
  
  // Metrics
  total_leads_completed: number;
  total_visits_completed: number;
  average_rating: string | null;

  total_visits_cancelled: number;
  total_ratings: number;
  active_assignments_count: number;
  
  
  // Capacity
  max_concurrent_leads: number;
  can_accept_leads?: boolean;
  current_assigned_leads_count?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Notes
  notes?: string;
}

export type AgentStatus = 'active' | 'inactive' | 'suspended' | 'pending';


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

// API Request/Response types
// CRITICAL: Field names MUST match AgentCreateSerializer exactly
export interface CreateAgentRequest {
  phone: string;           // Required - 10 digit Indian phone
  name: string;            // Required - Full name
  email?: string;          // Optional
  employee_code?: string;  // Backend field name (NOT employee_id)
  max_concurrent_leads?: number; // Optional, default 5
  aadhaar_number?: string; // Optional - 12 digits
  notes?: string;   
  // employee_id: string;       // Optional
}

export interface UpdateAgentRequest {
  employee_code?: string;
  status?: AgentStatus;
  is_available?: boolean;
  max_concurrent_leads?: number;
  notes?: string;
}

export interface AssignLeadToAgentRequest {
  lead_id: string;
  assignment_notes?: string;
}

export interface AgentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentProfile[];
}

export interface AgentAssignmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentLeadAssignment[];
}

// Stats
export interface AgentStats {
  total_agents: number;
  active_agents: number;
  available_agents: number;
  total_assignments_today: number;
  completed_today: number;
}