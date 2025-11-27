// src/api/services/agentService.ts
// API service for Partner Agent management

import { useAuthStore } from '../../stores/authStore';
import type {
  AgentProfile,
  AgentLeadAssignment,
  AgentActivityLog,
  AgentListResponse,
  AgentAssignmentsResponse,
  CreateAgentRequest,
  UpdateAgentRequest,
  AssignLeadToAgentRequest,
  AgentStats,
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

// Helper for API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    // Debug: Log raw error response
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      error: error
    });
    
    // Handle DRF validation errors (field-level errors)
    if (typeof error === 'object' && !error.detail && !error.error) {
      // DRF returns errors like { "phone": ["error message"], "name": ["error"] }
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

  return response.json();
};

export const agentService = {
  // ==================== AGENT CRUD ====================

  /**
   * Get list of agents for the partner
   */
  getAgents: async (params?: {
    status?: string;
    is_available?: boolean;
    search?: string;
    page?: number;
  }): Promise<AgentListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.is_available !== undefined) searchParams.append('is_available', String(params.is_available));
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', String(params.page));

    const query = searchParams.toString();
    return apiCall<AgentListResponse>(`/partner-agents/agents/${query ? `?${query}` : ''}`);
  },

  /**
   * Get single agent details
   */
  getAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`);
  },

  /**
   * Create a new agent
   */
  createAgent: async (data: CreateAgentRequest): Promise<AgentProfile> => {
    return apiCall<AgentProfile>('/partner-agents/agents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an agent
   */
  updateAgent: async (agentId: string, data: UpdateAgentRequest): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete/Remove an agent
   */
  removeAgent: async (agentId: string): Promise<void> => {
    await apiCall<void>(`/partner-agents/agents/${agentId}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle agent availability
   */
  toggleAvailability: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/toggle_availability/`, {
      method: 'POST',
    });
  },

  /**
   * Activate an agent
   */
  activateAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/activate/`, {
      method: 'POST',
    });
  },

  /**
   * Deactivate an agent
   */
  deactivateAgent: async (agentId: string): Promise<AgentProfile> => {
    return apiCall<AgentProfile>(`/partner-agents/agents/${agentId}/deactivate/`, {
      method: 'POST',
    });
  },

  // ==================== LEAD ASSIGNMENTS ====================

  /**
   * Get all assignments for a partner
   */
  getAssignments: async (params?: {
    agent?: string;
    lead?: string;
    status?: string;
    page?: number;
  }): Promise<AgentAssignmentsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.agent) searchParams.append('agent', params.agent);
    if (params?.lead) searchParams.append('lead', params.lead);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', String(params.page));

    const query = searchParams.toString();
    return apiCall<AgentAssignmentsResponse>(`/partner-agents/assignments/${query ? `?${query}` : ''}`);
  },

  /**
   * Assign a lead to an agent
   */
  assignLeadToAgent: async (
    agentId: string,
    data: AssignLeadToAgentRequest
  ): Promise<AgentLeadAssignment> => {
    return apiCall<AgentLeadAssignment>(`/partner-agents/agents/${agentId}/assign_lead/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get assignment details
   */
  getAssignment: async (assignmentId: string): Promise<AgentLeadAssignment> => {
    return apiCall<AgentLeadAssignment>(`/partner-agents/assignments/${assignmentId}/`);
  },

  /**
   * Cancel an assignment
   */
  cancelAssignment: async (assignmentId: string, reason: string): Promise<AgentLeadAssignment> => {
    return apiCall<AgentLeadAssignment>(`/partner-agents/assignments/${assignmentId}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Reassign a lead to different agent
   */
  reassignLead: async (
    assignmentId: string,
    newAgentId: string,
    notes?: string
  ): Promise<AgentLeadAssignment> => {
    return apiCall<AgentLeadAssignment>(`/partner-agents/assignments/${assignmentId}/reassign/`, {
      method: 'POST',
      body: JSON.stringify({ new_agent_id: newAgentId, notes }),
    });
  },

  // ==================== ACTIVITY & STATS ====================

  /**
   * Get agent activity logs
   */
  getAgentActivity: async (
    agentId: string,
    params?: { page?: number }
  ): Promise<{ results: AgentActivityLog[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));

    const query = searchParams.toString();
    return apiCall<{ results: AgentActivityLog[] }>(
      `/partner-agents/agents/${agentId}/activity/${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get agent stats/metrics
   */
  getAgentStats: async (agentId: string): Promise<any> => {
    return apiCall<any>(`/partner-agents/agents/${agentId}/stats/`);
  },

  /**
   * Get overall agents stats for partner
   */
  getOverallStats: async (): Promise<AgentStats> => {
    return apiCall<AgentStats>('/partner-agents/agents/stats/');
  },

  // ==================== AVAILABLE AGENTS FOR LEAD ====================

  /**
   * Get available agents that can be assigned to a lead
   */
  getAvailableAgentsForLead: async (leadId: string): Promise<AgentProfile[]> => {
    return apiCall<AgentProfile[]>(`/partner-agents/agents/available/?lead=${leadId}`);
  },
};

export default agentService;