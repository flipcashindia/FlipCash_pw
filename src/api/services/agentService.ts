// src/api/services/agentService.ts
// API service for Partner managing their Agents
// CRITICAL: Endpoints MUST match backend partner_agents/urls.py exactly
//
// Base URL: /api/v1/partner-agents/

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

// 👇 This safely unwraps Django Pagination
const extractData = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data; 
  if (data.results && Array.isArray(data.results)) return data.results; 
  if (data.data && Array.isArray(data.data)) return data.data; 
  return data; 
};

export const agentService = {
  // ============================================================
  // AGENT CRUD
  // ============================================================

  getAgents: async (params?: AgentListParams): Promise<AgentListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.verification_status) searchParams.append('verification_status', params.verification_status);
    if (params?.is_available !== undefined) searchParams.append('is_available', String(params.is_available));
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.page_size) searchParams.append('page_size', String(params.page_size));

    const query = searchParams.toString();
    
    // 👇 FIX: Unwrap the paginated response here!
    const rawData = await apiCall<any>(`/partner-agents/agents/${query ? `?${query}` : ''}`);
    return extractData(rawData) as AgentListResponse;
  },

  getAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`);
  },

  createAgent: async (data: CreateAgentRequest): Promise<AgentProfile> => {
    console.log('[AgentService] Creating agent with data:', data);
    return apiCall<AgentProfile>('/partner-agents/agents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAgent: async (agentId: string, data: UpdateAgentRequest): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patchAgent: async (agentId: string, data: Partial<UpdateAgentRequest>): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  removeAgent: async (agentId: string): Promise<void> => {
    return apiCall<void>(`/partner-agents/agents/${agentId}/`, {
      method: 'DELETE',
    });
  },

  // ============================================================
  // AGENT STATUS & VERIFICATION
  // ============================================================

  toggleStatus: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/toggle-status/`, {
      method: 'POST',
    });
  },

  verifyAgent: async (agentId: string, data: AadhaarVerifyRequest): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/verify/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  toggleAvailability: async (agentId: string): Promise<AgentProfile> => {
    const agent = await agentService.getAgent(agentId);
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available: !agent.is_available }),
    });
  },

  activateAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    });
  },

  deactivateAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'inactive' }),
    });
  },

  // ============================================================
  // AGENT ASSIGNMENTS & ACTIVITY
  // ============================================================

  getAgentAssignments: async (
    agentId: string,
    status?: string
  ): Promise<AgentAssignmentsResponse> => {
    const query = status ? `?status=${status}` : '';
    // 👇 FIX: Unwrap the paginated response here!
    const rawData = await apiCall<any>(`/partner-agents/agents/${agentId}/assignments/${query}`);
    return extractData(rawData) as AgentAssignmentsResponse;
  },

  getAgentActivityLogs: async (agentId: string): Promise<ActivityLogsResponse> => {
    // 👇 FIX: Unwrap the paginated response here!
    const rawData = await apiCall<any>(`/partner-agents/agents/${agentId}/activity-logs/`);
    return extractData(rawData) as ActivityLogsResponse;
  },

  // ============================================================
  // LEAD ASSIGNMENTS (Partner managing assignments)
  // ============================================================

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
    // 👇 FIX: Unwrap the paginated response here!
    const rawData = await apiCall<any>(`/partner-agents/assignments/${query ? `?${query}` : ''}`);
    return extractData(rawData) as AgentAssignmentsResponse;
  },

  createAssignment: async (data: CreateAssignmentRequest): Promise<AgentLeadAssignment> => {
    console.log('[AgentService] Creating assignment:', data);
    return apiCall<AgentLeadAssignment>('/partner-agents/assignments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAssignment: async (assignmentId: string): Promise<AgentLeadAssignment> => {
    return apiCall<AgentLeadAssignment>(`/partner-agents/assignments/${assignmentId}/`);
  },

  cancelAssignment: async (assignmentId: string, reason?: string): Promise<void> => {
    return apiCall<void>(`/partner-agents/assignments/${assignmentId}/`, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
  },

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

  getAssignableLeads: async (): Promise<AssignableLeadsResponse> => {
    // 👇 FIX: Unwrap the paginated response here!
    const rawData = await apiCall<any>('/partner-agents/assignable-leads/');
    return extractData(rawData) as AssignableLeadsResponse;
  },

  // ============================================================
  // STATS
  // ============================================================

  getOverallStats: async (): Promise<AgentStats> => {
    try {
      const response = await apiCall<AgentStats>('/partner-agents/agents/stats/');
      return response;
    } catch {
      // Fallback works properly now because `getAgents()` actually returns an array!
      const agents = await agentService.getAgents();
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

  getAvailableAgentsForLead: async (): Promise<AgentListItem[]> => {
    // This will no longer crash because `getAgents()` returns the unwrapped array!
    const agents = await agentService.getAgents({
      status: 'active',
      is_available: true,
    });
    return agents.filter((agent) => agent.can_accept_leads !== false);
  },
};

export default agentService;