// src/api/services/agentAppService.ts
// API service for Agent-facing application
// Handles all agent-specific API calls

import { useAuthStore } from '../../stores/authStore';
import type {
  AgentSelfProfile,
  AgentAssignedLead,
  AgentAssignedLeadsResponse,
  AgentDashboardStats,
  CheckInRequest,
  DeviceInspectionData,
  PriceReEstimationRequest,
  CompleteDealRequest,
  AgentActionResponse,
  LocationUpdateRequest,
} from '../types/agentApp.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper for API calls with better error handling
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
    
    console.error('Agent API Error:', {
      status: response.status,
      endpoint,
      error
    });
    
    // Handle DRF validation errors
    if (typeof error === 'object' && !error.detail && !error.error) {
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

// Helper for multipart form data (file uploads)
const apiCallMultipart = async <T>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  const token = useAuthStore.getState().accessToken;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.error || `API Error: ${response.status}`);
  }

  return response.json();
};

export const agentAppService = {
  // ==================== PROFILE ====================

  /**
   * Get agent's own profile
   */
  getProfile: async (): Promise<AgentSelfProfile> => {
    return apiCall<AgentSelfProfile>('/partner-agents/agent/profile/');
  },

  /**
   * Update agent's availability status
   */
  updateAvailability: async (isAvailable: boolean): Promise<AgentSelfProfile> => {
    return apiCall<AgentSelfProfile>('/partner-agents/agent/profile/availability/', {
      method: 'POST',
      body: JSON.stringify({ is_available: isAvailable }),
    });
  },

  /**
   * Update agent's location
   */
  updateLocation: async (data: LocationUpdateRequest): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>('/partner-agents/agent/profile/location/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== ASSIGNED LEADS ====================

  /**
   * Get agent's assigned leads
   */
  getAssignedLeads: async (params?: {
    status?: string;
    priority?: string;
    page?: number;
  }): Promise<AgentAssignedLeadsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.page) searchParams.append('page', String(params.page));

    const query = searchParams.toString();
    return apiCall<AgentAssignedLeadsResponse>(
      `/partner-agents/agent/assignments/${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get single assignment details
   */
  getAssignment: async (assignmentId: string): Promise<AgentAssignedLead> => {
    return apiCall<AgentAssignedLead>(`/partner-agents/agent/assignments/${assignmentId}/`);
  },

  /**
   * Get dashboard stats
   */
  getDashboardStats: async (): Promise<AgentDashboardStats> => {
    return apiCall<AgentDashboardStats>('/partner-agents/agent/stats/');
  },

  // ==================== ASSIGNMENT ACTIONS ====================

  /**
   * Accept an assignment
   */
  acceptAssignment: async (assignmentId: string): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/accept/`,
      { method: 'POST' }
    );
  },

  /**
   * Reject an assignment
   */
  rejectAssignment: async (
    assignmentId: string, 
    reason: string
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/reject/`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },

  /**
   * Start journey to customer location
   */
  startJourney: async (assignmentId: string): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/start-journey/`,
      { method: 'POST' }
    );
  },

  // ==================== CHECK-IN & VERIFICATION ====================

  /**
   * Check-in at customer location (with GPS verification)
   */
  checkIn: async (
    assignmentId: string, 
    data: CheckInRequest
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/check-in/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Verify with customer's OTP/verification code
   */
  verifyWithCode: async (
    assignmentId: string,
    verificationCode: string
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/verify-code/`,
      {
        method: 'POST',
        body: JSON.stringify({ verification_code: verificationCode }),
      }
    );
  },

  /**
   * Start device inspection
   */
  startInspection: async (assignmentId: string): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/start-inspection/`,
      { method: 'POST' }
    );
  },

  // ==================== DEVICE INSPECTION ====================

  /**
   * Submit device inspection data
   */
  submitInspection: async (
    assignmentId: string,
    inspectionData: DeviceInspectionData
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/submit-inspection/`,
      {
        method: 'POST',
        body: JSON.stringify({ inspection_data: inspectionData }),
      }
    );
  },

  /**
   * Upload inspection image
   */
  uploadInspectionImage: async (
    assignmentId: string,
    imageType: string,
    file: File
  ): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image_type', imageType);
    formData.append('image', file);

    return apiCallMultipart<{ url: string }>(
      `/partner-agents/agent/assignments/${assignmentId}/upload-image/`,
      formData
    );
  },

  // ==================== PRICE RE-ESTIMATION ====================

  /**
   * Calculate re-estimated price based on inspection
   */
  calculatePrice: async (
    assignmentId: string,
    inspectionData: DeviceInspectionData
  ): Promise<{
    original_price: number;
    calculated_price: number;
    deductions: Array<{ reason: string; amount: number }>;
  }> => {
    return apiCall(
      `/partner-agents/agent/assignments/${assignmentId}/calculate-price/`,
      {
        method: 'POST',
        body: JSON.stringify({ inspection_data: inspectionData }),
      }
    );
  },

  /**
   * Submit re-estimated price for approval
   */
  submitReEstimation: async (
    assignmentId: string,
    data: PriceReEstimationRequest
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/submit-price/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // ==================== DEAL COMPLETION ====================

  /**
   * Complete the deal
   */
  completeDeal: async (
    assignmentId: string,
    data: CompleteDealRequest
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/complete/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Cancel assignment (with reason)
   */
  cancelAssignment: async (
    assignmentId: string,
    reason: string
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/agent/assignments/${assignmentId}/cancel/`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },

  // ==================== ACTIVITY LOGS ====================

  /**
   * Get agent's activity history
   */
  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    count: number;
    results: Array<{
      id: string;
      activity_type: string;
      description: string;
      lead_number?: string;
      created_at: string;
    }>;
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const query = searchParams.toString();
    return apiCall(`/partner-agents/agent/activity-logs/${query ? `?${query}` : ''}`);
  },
};

export default agentAppService;