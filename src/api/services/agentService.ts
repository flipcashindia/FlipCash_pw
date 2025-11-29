// src/api/services/agentService.ts
// API service for Partner managing their Agents
// CRITICAL: Endpoints MUST match backend partner_agents/urls.py exactly
//
// Base URL: /api/v1/partner-agents/
//
// Partner Endpoints:
// - GET/POST       /agents/                    - List/Create agents
// - GET/PUT/DELETE /agents/{id}/               - Get/Update/Delete agent
// - POST           /agents/{id}/verify/        - Submit Aadhaar verification
// - POST           /agents/{id}/toggle-status/ - Toggle active/inactive
// - GET            /agents/{id}/assignments/   - Get agent's assignments
// - GET            /agents/{id}/activity-logs/ - Get agent's activity logs
// - GET/POST       /assignments/               - List/Create assignments
// - GET/DELETE     /assignments/{id}/          - Get/Cancel assignment
// - POST           /assignments/{id}/reassign/ - Reassign to different agent
// - GET            /assignable-leads/          - Get leads that can be assigned

import { useAuthStore } from '../../stores/authStore';
import type {
  AgentProfile,
  AgentListItem,
  AgentLeadAssignment,
  AgentListResponse,
  AgentAssignmentsResponse,
  ActivityLogsResponse,
  CreateAgentRequest,
  UpdateAgentRequest,
  CreateAssignmentRequest,
  ReassignLeadRequest,
  AadhaarVerifyRequest,
  AgentStats,
  AssignableLeadsResponse,
  AgentListParams,
  AssignmentListParams,
} from '../types/agent.type';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper for API calls with comprehensive error handling
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[AgentService] ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    console.error('[AgentService] API Error:', {
      status: response.status,
      statusText: response.statusText,
      url,
      error
    });
    
    // Handle DRF validation errors (field-level errors)
    if (typeof error === 'object' && !error.detail && !error.error && !error.message) {
      const messages = Object.entries(error)
        .map(([field, msgs]) => {
          const msgArray = Array.isArray(msgs) ? msgs : [msgs];
          return `${field}: ${msgArray.join(', ')}`;
        })
        .join('; ');
      throw new Error(messages || `API Error: ${response.status}`);
    }
    
    throw new Error(error.detail || error.error || error.message || `API Error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const agentService = {
  // ============================================================
  // AGENT CRUD
  // ============================================================

  /**
   * Get list of agents for the partner
   * GET /api/v1/partner-agents/agents/
   * Filters: status, verification_status, is_available, search
   */
  getAgents: async (params?: AgentListParams): Promise<AgentListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.verification_status) searchParams.append('verification_status', params.verification_status);
    if (params?.is_available !== undefined) searchParams.append('is_available', String(params.is_available));
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.page_size) searchParams.append('page_size', String(params.page_size));

    const query = searchParams.toString();
    return apiCall<AgentListResponse>(`/partner-agents/agents/${query ? `?${query}` : ''}`);
  },

  /**
   * Get single agent details
   * GET /api/v1/partner-agents/agents/{id}/
   */
  getAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`);
  },

  /**
   * Create a new agent
   * POST /api/v1/partner-agents/agents/
   * Body: { phone, name, email?, employee_code?, max_concurrent_leads?, aadhaar_number?, notes? }
   */
  createAgent: async (data: CreateAgentRequest): Promise<AgentProfile> => {
    console.log('[AgentService] Creating agent with data:', data);
    return apiCall<AgentProfile>('/partner-agents/agents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an agent (full update)
   * PUT /api/v1/partner-agents/agents/{id}/
   */
  updateAgent: async (agentId: string, data: UpdateAgentRequest): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update an agent
   * PATCH /api/v1/partner-agents/agents/{id}/
   */
  patchAgent: async (agentId: string, data: Partial<UpdateAgentRequest>): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete/Deactivate an agent (soft delete)
   * DELETE /api/v1/partner-agents/agents/{id}/
   * Note: Fails if agent has active assignments
   */
  removeAgent: async (agentId: string): Promise<void> => {
    return apiCall<void>(`/partner-agents/agents/${agentId}/`, {
      method: 'DELETE',
    });
  },

  // ============================================================
  // AGENT STATUS & VERIFICATION
  // ============================================================

  /**
   * Toggle agent active/inactive status
   * POST /api/v1/partner-agents/agents/{id}/toggle-status/
   */
  toggleStatus: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/toggle-status/`, {
      method: 'POST',
    });
  },

  /**
   * Submit Aadhaar verification
   * POST /api/v1/partner-agents/agents/{id}/verify/
   * Body: { aadhaar_number, aadhaar_front_image?, aadhaar_back_image? }
   */
  verifyAgent: async (agentId: string, data: AadhaarVerifyRequest): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/verify/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Toggle agent availability
   * PATCH /api/v1/partner-agents/agents/{id}/
   */
  toggleAvailability: async (agentId: string): Promise<AgentProfile> => {
    // First get current status
    const agent = await agentService.getAgent(agentId);
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available: !agent.is_available }),
    });
  },

  /**
   * Activate an agent
   * PATCH /api/v1/partner-agents/agents/{id}/
   */
  activateAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    });
  },

  /**
   * Deactivate an agent
   * PATCH /api/v1/partner-agents/agents/{id}/
   */
  deactivateAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'inactive' }),
    });
  },

  // ============================================================
  // AGENT ASSIGNMENTS & ACTIVITY
  // ============================================================

  /**
   * Get agent's lead assignments
   * GET /api/v1/partner-agents/agents/{id}/assignments/
   * Query: ?status=assigned,accepted,in_progress
   */
  getAgentAssignments: async (
    agentId: string,
    status?: string
  ): Promise<AgentAssignmentsResponse> => {
    const query = status ? `?status=${status}` : '';
    return apiCall<AgentAssignmentsResponse>(
      `/partner-agents/agents/${agentId}/assignments/${query}`
    );
  },

  /**
   * Get agent's activity logs (last 100)
   * GET /api/v1/partner-agents/agents/{id}/activity-logs/
   */
  getAgentActivityLogs: async (agentId: string): Promise<ActivityLogsResponse> => {
    return apiCall<ActivityLogsResponse>(
      `/partner-agents/agents/${agentId}/activity-logs/`
    );
  },

  // ============================================================
  // LEAD ASSIGNMENTS (Partner managing assignments)
  // ============================================================

  /**
   * Get all lead assignments
   * GET /api/v1/partner-agents/assignments/
   * Filters: status, priority, agent, lead, lead_number, is_active, is_overdue
   */
  getAssignments: async (params?: AssignmentListParams): Promise<AgentAssignmentsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.agent) searchParams.append('agent', params.agent);
    if (params?.lead) searchParams.append('lead', params.lead);
    if (params?.lead_number) searchParams.append('lead_number', params.lead_number);
    if (params?.is_active !== undefined) searchParams.append('is_active', String(params.is_active));
    if (params?.is_overdue !== undefined) searchParams.append('is_overdue', String(params.is_overdue));
    if (params?.page) searchParams.append('page', String(params.page));

    const query = searchParams.toString();
    return apiCall<AgentAssignmentsResponse>(`/partner-agents/assignments/${query ? `?${query}` : ''}`);
  },

  /**
   * Assign a lead to an agent
   * POST /api/v1/partner-agents/assignments/
   * Body: { agent_id, lead_id, priority?, assignment_notes?, expected_completion_at? }
   */
  createAssignment: async (data: CreateAssignmentRequest): Promise<AgentLeadAssignment> => {
    console.log('[AgentService] Creating assignment:', data);
    return apiCall<AgentLeadAssignment>('/partner-agents/assignments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get assignment details
   * GET /api/v1/partner-agents/assignments/{id}/
   */
  getAssignment: async (assignmentId: string): Promise<AgentLeadAssignment> => {
    return apiCall<AgentLeadAssignment>(`/partner-agents/assignments/${assignmentId}/`);
  },

  /**
   * Cancel an assignment
   * DELETE /api/v1/partner-agents/assignments/{id}/
   * Body: { reason? }
   */
  cancelAssignment: async (assignmentId: string, reason?: string): Promise<void> => {
    return apiCall<void>(`/partner-agents/assignments/${assignmentId}/`, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
  },

  /**
   * Reassign lead to different agent
   * POST /api/v1/partner-agents/assignments/{id}/reassign/
   * Body: { new_agent_id, reason? }
   */
  reassignLead: async (
    assignmentId: string,
    data: ReassignLeadRequest
  ): Promise<AgentLeadAssignment> => {
    return apiCall<AgentLeadAssignment>(`/partner-agents/assignments/${assignmentId}/reassign/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ============================================================
  // ASSIGNABLE LEADS
  // ============================================================

  /**
   * Get leads that can be assigned to agents
   * GET /api/v1/partner-agents/assignable-leads/
   * Returns leads claimed by partner without active agent assignments
   */
  getAssignableLeads: async (): Promise<AssignableLeadsResponse> => {
    return apiCall<AssignableLeadsResponse>('/partner-agents/assignable-leads/');
  },

  // ============================================================
  // STATS
  // ============================================================

  /**
   * Get overall agents stats for partner
   * Note: Check if backend provides this endpoint
   */
  getOverallStats: async (): Promise<AgentStats> => {
    // If backend doesn't have a dedicated stats endpoint, 
    // we can calculate from getAgents
    try {
      const response = await apiCall<AgentStats>('/partner-agents/agents/stats/');
      return response;
    } catch {
      // Fallback: calculate from agents list
      const agents = await agentService.getAgents();
      // AgentListResponse is a flat array (AgentListItem[])
      return {
        total_agents: agents.length,
        active_agents: agents.filter((a) => a.status === 'active').length,
        available_agents: agents.filter((a) => a.is_available).length,
        verified_agents: agents.filter((a) => a.verification_status === 'verified').length,
        total_assignments_today: 0,
        completed_today: 0,
      };
    }
  },

  // ============================================================
  // HELPER: Get available agents for a specific lead
  // ============================================================

  /**
   * Get agents that can be assigned to a specific lead
   * Uses getAgents with is_available filter
   */
  getAvailableAgentsForLead: async (): Promise<AgentListItem[]> => {
    const agents = await agentService.getAgents({
      status: 'active',
      is_available: true,
    });
    // Filter agents who can accept more leads
    return agents.filter((agent) => agent.can_accept_leads !== false);
  },
};

export default agentService;


