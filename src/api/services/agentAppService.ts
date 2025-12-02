// src/api/services/agentAppService.ts
// API service for Agent Self-Service Application
// CRITICAL: Endpoints MUST match backend partner_agents/urls.py exactly
//
// Base URL: /api/v1/partner-agents/
//
// Agent Self-Service Endpoints:
// - GET/PUT  /me/                                    - Own profile / Update availability
// - GET      /my-leads/                              - List assigned leads
// - GET      /my-leads/{id}/                         - Get lead detail
// - POST     /my-leads/{id}/accept/                  - Accept assignment
// - POST     /my-leads/{id}/reject/                  - Reject assignment
// - POST     /my-leads/{id}/start/                   - Start en route
// - POST     /my-leads/{id}/check-in/                - Check in at location
// - POST     /my-leads/{id}/start-inspection/        - Start inspection
// - POST     /my-leads/{id}/complete/                - Complete assignment
// - POST     /update-location/                       - Update GPS location
//
// Agent Visit Workflow Endpoints:
// - GET      /my-leads/{id}/visit/                   - Visit details
// - POST     /my-leads/{id}/visit/start/             - Start visit (en route)
// - POST     /my-leads/{id}/visit/verify-code/       - Verify customer code
// - POST     /my-leads/{id}/visit/start-inspection/  - Start inspection
// - POST     /my-leads/{id}/visit/submit-inspection/ - Submit inspection with system price calculation
// - POST     /my-leads/{id}/visit/customer-response/ - Customer acceptance/rejection (NEW)
// - POST     /my-leads/{id}/visit/complete/          - Complete visit with payment method (UPDATED)
// - POST     /my-leads/{id}/visit/cancel/            - Cancel visit
// - POST     /my-leads/{id}/visit/breadcrumb/        - Record location breadcrumb

import { useAuthStore } from '../../stores/authStore';
import type {
  AgentSelfProfile,
  AgentAssignedLead,
  AgentAssignedLeadsResponse,
  AgentVisitDetail,
  AgentDashboardStats,
  CheckInRequest,
  VerifyCodeRequest,
  SubmitInspectionRequest,
  MakeOfferRequest,
  CompleteVisitRequest,
  CancelVisitRequest,
  LocationBreadcrumbRequest,
  UpdateLocationRequest,
  PriceReEstimationRequest,
  // CompleteDealRequest,
  AgentActionResponse,
  ActionResponse,
  DeviceInspectionData,
  AgentActivityLogsResponse,
  // CustomerAddress,
  KYCVerificationRequest,
  KYCVerificationResponse,
  // CashPaymentConfirmation,
  PaymentProcessRequest,
  PaymentProcessResponse,
  // KYCVerificationData,
  // PaymentData,
  // CustomerAcceptanceRequest,
  // CustomerAcceptanceResponse,
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

// Helper for API calls with comprehensive error handling
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[AgentAppService] ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    console.error('[AgentAppService] API Error:', {
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

// Helper for multipart form data (file uploads)
const apiCallMultipart = async <T>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  const token = useAuthStore.getState().accessToken;
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[AgentAppService] POST (multipart) ${url}`);
  
  const response = await fetch(url, {
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

// ============================================================
// HELPER: Transform DeviceInspectionData to SubmitInspectionRequest
// Converts frontend form data to backend API format
// ============================================================

const transformInspectionData = (
  data: SubmitInspectionRequest | DeviceInspectionData
): SubmitInspectionRequest => {
  // If already in SubmitInspectionRequest format (has partner_assessment as object)
  if ('partner_assessment' in data && typeof data.partner_assessment === 'object' && data.partner_assessment !== null && 'accessories' in data.partner_assessment) {
    return data as SubmitInspectionRequest;
  }

  // Transform DeviceInspectionData to SubmitInspectionRequest
  const inspectionData = data as DeviceInspectionData;
  
  // Build functional issues list
  const functionalIssues: string[] = [];
  if (!inspectionData.touch_working) functionalIssues.push('touch_not_working');
  if (!inspectionData.display_working) functionalIssues.push('display_not_working');
  if (!inspectionData.speakers_working) functionalIssues.push('speakers_not_working');
  if (!inspectionData.microphone_working) functionalIssues.push('microphone_not_working');
  if (!inspectionData.cameras_working) functionalIssues.push('cameras_not_working');
  if (!inspectionData.buttons_working) functionalIssues.push('buttons_not_working');
  if (!inspectionData.charging_port_working) functionalIssues.push('charging_port_not_working');
  if (!inspectionData.wifi_working) functionalIssues.push('wifi_not_working');
  if (!inspectionData.bluetooth_working) functionalIssues.push('bluetooth_not_working');
  if (!inspectionData.sim_slot_working) functionalIssues.push('sim_slot_not_working');
  if (inspectionData.fingerprint_working === false) functionalIssues.push('fingerprint_not_working');
  if (inspectionData.face_id_working === false) functionalIssues.push('face_id_not_working');

  // FIXED: Collect all photo URLs/data and filter out undefined values
  const photos: string[] = [
    inspectionData.front_image,
    inspectionData.back_image,
    inspectionData.screen_image,
    inspectionData.imei_image,
    ...(inspectionData.defect_images || [])
  ].filter((photo): photo is string => Boolean(photo)); // Type guard to ensure only strings
  
  // Validate: Backend requires at least 1 photo (min_length=1)
  if (photos.length === 0) {
    console.warn('[transformInspectionData] No photos captured - backend will reject this');
  }

  const submitRequest: SubmitInspectionRequest = {
    verified_imei: inspectionData.imei_number || '',
    imei_matches: inspectionData.imei_verified ?? false,
    device_powers_on: inspectionData.power_on ?? true,
    inspection_notes: inspectionData.notes || '',
    inspection_photos: photos, // Now guaranteed to be string[]
    partner_assessment: {
      screen_condition: inspectionData.screen_condition || 'good',
      body_condition: inspectionData.body_condition || 'good',
      battery_health: inspectionData.battery_health || undefined,
      accessories: {
        charger_available: inspectionData.has_charger || false,
        box_available: inspectionData.has_box || false,
        earphones_available: inspectionData.has_earphones || false,
        bill_available: inspectionData.has_bill || false,
      },
      functional_issues: functionalIssues,
    },
    // Also send condition_inputs for direct pricing engine input
    condition_inputs: {
      screen_condition: inspectionData.screen_condition,
      body_condition: inspectionData.body_condition,
      battery_health: inspectionData.battery_health || 50,
      has_charger: inspectionData.has_charger ? 'yes' : 'no',
      has_box: inspectionData.has_box ? 'yes' : 'no',
      has_earphones: inspectionData.has_earphones ? 'yes' : 'no',
      has_bill: inspectionData.has_bill ? 'yes' : 'no',
      touch_working: inspectionData.touch_working ? 'yes' : 'no',
      display_working: inspectionData.display_working ? 'yes' : 'no',
      speakers_working: inspectionData.speakers_working ? 'yes' : 'no',
      cameras_working: inspectionData.cameras_working ? 'yes' : 'no',
    },
  };
  
  // Log what we're sending for debugging
  console.log('[transformInspectionData] Transformed payload:', {
    verified_imei: submitRequest.verified_imei,
    imei_matches: submitRequest.imei_matches,
    device_powers_on: submitRequest.device_powers_on,
    inspection_notes_length: submitRequest.inspection_notes.length,
    inspection_photos_count: submitRequest.inspection_photos.length,
    partner_assessment: submitRequest.partner_assessment,
  });

  return submitRequest;
};

export const agentAppService = {
  // ============================================================
  // AGENT PROFILE
  // ============================================================

  /**
   * Get agent's own profile
   * GET /api/v1/partner-agents/me/
   */
  getProfile: async (): Promise<AgentSelfProfile> => {
    return apiCall<AgentSelfProfile>('/partner-agents/me/');
  },

  /**
   * Update agent's availability status
   * PUT /api/v1/partner-agents/me/
   */
  updateAvailability: async (isAvailable: boolean): Promise<AgentSelfProfile> => {
    return apiCall<AgentSelfProfile>('/partner-agents/me/', {
      method: 'PUT',
      body: JSON.stringify({ is_available: isAvailable }),
    });
  },

  /**
   * Update agent's GPS location
   * POST /api/v1/partner-agents/update-location/
   */
  updateLocation: async (data: UpdateLocationRequest): Promise<ActionResponse> => {
    return apiCall<ActionResponse>('/partner-agents/update-location/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ============================================================
  // ASSIGNED LEADS
  // ============================================================

  /**
   * Get agent's assigned leads
   * GET /api/v1/partner-agents/my-leads/
   * Query: ?status=assigned,accepted,in_progress (default: active only)
   */
  getAssignedLeads: async (params?: {
    status?: string;
    page?: number;
  }): Promise<AgentAssignedLeadsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', String(params.page));

    const query = searchParams.toString();
    return apiCall<AgentAssignedLeadsResponse>(
      `/partner-agents/my-leads/${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get single assignment detail
   * GET /api/v1/partner-agents/my-leads/{assignment_id}/
   */
  getAssignment: async (assignmentId: string): Promise<AgentAssignedLead> => {
    return apiCall<AgentAssignedLead>(`/partner-agents/my-leads/${assignmentId}/`);
  },

  // ============================================================
  // ASSIGNMENT ACTIONS
  // ============================================================

  /**
   * Accept an assignment
   * POST /api/v1/partner-agents/my-leads/{id}/accept/
   */
  acceptAssignment: async (assignmentId: string): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/accept/`,
      { method: 'POST' }
    );
  },

  /**
   * Reject an assignment
   * POST /api/v1/partner-agents/my-leads/{id}/reject/
   */
  rejectAssignment: async (assignmentId: string, reason: string): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/reject/`,
      { 
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },

  /**
   * Start traveling to customer (en route)
   * POST /api/v1/partner-agents/my-leads/{id}/start/
   */
  startJourney: async (assignmentId: string): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/start/`,
      { method: 'POST' }
    );
  },

  /**
   * Check in at customer location
   * POST /api/v1/partner-agents/my-leads/{id}/check-in/
   */
  checkIn: async (
    assignmentId: string,
    data: CheckInRequest
  ): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/check-in/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Start device inspection
   * POST /api/v1/partner-agents/my-leads/{id}/start-inspection/
   */
  startInspection: async (assignmentId: string): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/start-inspection/`,
      { method: 'POST' }
    );
  },

  /**
   * Complete assignment
   * POST /api/v1/partner-agents/my-leads/{id}/complete/
   */
  completeAssignment: async (
    assignmentId: string,
    data: { completion_notes?: string; final_price?: number }
  ): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/complete/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // ============================================================
  // VISIT WORKFLOW (More detailed endpoints)
  // ============================================================

  /**
   * Get visit details
   * GET /api/v1/partner-agents/my-leads/{id}/visit/
   */
  getVisitDetails: async (assignmentId: string): Promise<AgentVisitDetail> => {
    return apiCall<AgentVisitDetail>(
      `/partner-agents/my-leads/${assignmentId}/visit/`
    );
  },

  /**
   * Start visit (en route)
   * POST /api/v1/partner-agents/my-leads/{id}/visit/start/
   */
  startVisit: async (assignmentId: string): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/visit/start/`,
      { method: 'POST' }
    );
  },

  /**
   * Verify customer code
   * POST /api/v1/partner-agents/my-leads/{id}/visit/verify-code/
   */
  verifyCode: async (
    assignmentId: string,
    data: VerifyCodeRequest
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/visit/verify-code/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Start inspection (visit workflow)
   * POST /api/v1/partner-agents/my-leads/{id}/visit/start-inspection/
   */
  startVisitInspection: async (assignmentId: string): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/visit/start-inspection/`,
      { method: 'POST' }
    );
  },

  /**
   * Submit inspection with SYSTEM PRICE CALCULATION (UPDATED)
   * POST /api/v1/partner-agents/my-leads/{id}/visit/submit-inspection/
   * 
   * Returns system_final_price (no agent adjustment allowed in new workflow)
   */
  submitInspection: async (
    assignmentId: string,
    data: SubmitInspectionRequest | DeviceInspectionData
  ): Promise<ActionResponse & { 
    system_final_price?: number;
    original_estimate?: number;
    deductions?: Record<string, number>;
    is_final?: boolean;
    no_adjustment_allowed?: boolean;
  }> => {
    // Transform DeviceInspectionData to SubmitInspectionRequest if needed
    const payload = transformInspectionData(data);
    
    return apiCall<ActionResponse & {
      system_final_price?: number;
      original_estimate?: number;
      deductions?: Record<string, number>;
      is_final?: boolean;
      no_adjustment_allowed?: boolean;
    }>(
      `/partner-agents/my-leads/${assignmentId}/visit/submit-inspection/`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Submit customer acceptance/rejection response (NEW WORKFLOW)
   * POST /api/v1/partner-agents/my-leads/{id}/visit/customer-response/
   */
  submitCustomerAcceptance: async (
    assignmentId: string,
    data: {
      customer_response: 'accept' | 'reject';
      customer_signature?: string;
      rejection_reason?: string;
    }
  ): Promise<ActionResponse & {
    next_action?: string;
    workflow_stage?: string;
    payment_methods?: string[];
  }> => {
    return apiCall<ActionResponse & {
      next_action?: string;
      workflow_stage?: string; 
      payment_methods?: string[];
    }>(
      `/partner-agents/my-leads/${assignmentId}/visit/customer-response/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Make price offer to customer (LEGACY - may be removed in new workflow)
   * POST /api/v1/partner-agents/my-leads/{id}/visit/make-offer/
   */
  makeOffer: async (
    assignmentId: string,
    data: MakeOfferRequest
  ): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/visit/make-offer/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Complete visit after customer accepts (LEGACY)
   * POST /api/v1/partner-agents/my-leads/{id}/visit/complete/
   */
  completeVisit: async (
    assignmentId: string,
    data: CompleteVisitRequest
  ): Promise<ActionResponse> => {
    return apiCall<ActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/visit/complete/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Cancel visit
   * POST /api/v1/partner-agents/my-leads/{id}/visit/cancel/
   */
  cancelVisit: async (
    assignmentId: string,
    data: CancelVisitRequest
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/visit/cancel/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Record location breadcrumb during travel
   * POST /api/v1/partner-agents/my-leads/{id}/visit/breadcrumb/
   */
  recordBreadcrumb: async (
    assignmentId: string,
    data: LocationBreadcrumbRequest
  ): Promise<AgentActionResponse> => {
    return apiCall<AgentActionResponse>(
      `/partner-agents/my-leads/${assignmentId}/visit/breadcrumb/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // ============================================================
  // PRICE RE-ESTIMATION & DEAL COMPLETION
  // ============================================================

  /**
   * Calculate price based on inspection
   * Uses submitInspection endpoint and returns calculated price
   */
  calculatePrice: async (
    assignmentId: string,
    inspectionData: DeviceInspectionData
  ): Promise<{ original_price: number; calculated_price: number; deductions: Array<{ reason: string; amount: number }> }> => {
    const response = await apiCall<{
      success: boolean;
      original_price: number;
      calculated_price: number;
      deductions: Array<{ reason: string; amount: number }>;
    }>(
      `/partner-agents/my-leads/${assignmentId}/visit/calculate-price/`,
      {
        method: 'POST',
        body: JSON.stringify(inspectionData),
      }
    );
    return {
      original_price: response.original_price,
      calculated_price: response.calculated_price,
      deductions: response.deductions || [],
    };
  },

  /**
   * Submit price re-estimation based on inspection
   * Used after inspection to propose new price with deductions
   */
  submitPriceReEstimation: async (
    assignmentId: string,
    data: PriceReEstimationRequest
  ): Promise<AgentActionResponse & { calculated_price?: number }> => {
    return apiCall<AgentActionResponse & { calculated_price?: number }>(
      `/partner-agents/my-leads/${assignmentId}/visit/submit-price/`,
      {
        method: 'POST',
        body: JSON.stringify({
          proposed_price: data.proposed_price,
          price_breakdown: {
            original_price: data.original_price,
            deductions: data.deductions,
          },
          notes: data.notes,
        }),
      }
    );
  },

  /**
   * Complete the deal with payment method selection (NEW WORKFLOW)
   * POST /api/v1/partner-agents/my-leads/{id}/visit/complete/
   * Final step with payment method choice
   */
  completeDeal: async (
    assignmentId: string,
    data: {
      payment_method: 'cash' | 'partner_wallet';
      completion_notes?: string;
    }
  ): Promise<ActionResponse & {
    transaction_id?: string;
    wallet_balance_after?: number;
    blocked_balance_after?: number;
    message?: string;
  }> => {
    return apiCall<ActionResponse & {
      transaction_id?: string;
      wallet_balance_after?: number;
      blocked_balance_after?: number;
      message?: string;
    }>(
      `/partner-agents/my-leads/${assignmentId}/visit/complete/`,
      {
        method: 'POST',
        body: JSON.stringify({
          payment_method: data.payment_method,
          completion_notes: data.completion_notes,
        }),
      }
    );
  },

  // ============================================================
  // FILE UPLOADS
  // ============================================================

  /**
   * Upload inspection image
   * Uses multipart form data
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
      `/partner-agents/my-leads/${assignmentId}/visit/upload-image/`,
      formData
    );
  },


  // ============================================================
  // KYC VERIFICATION & PAYMENT PROCESSING (NEW)
  // ============================================================

  /**
   * Submit KYC verification for customer during visit (NEW)
   * POST /api/v1/partner-agents/my-leads/{assignment_id}/kyc-verification/
   */
  submitKYCVerification: async (
    assignmentId: string,
    data: KYCVerificationRequest
  ): Promise<KYCVerificationResponse> => {
    return apiCall<KYCVerificationResponse>(
      `/partner-agents/my-leads/${assignmentId}/kyc-verification/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Process payment after KYC verification (NEW)
   * POST /api/v1/partner-agents/my-leads/{assignment_id}/process-payment/
   */
  processPayment: async (
    assignmentId: string,
    data: PaymentProcessRequest
  ): Promise<PaymentProcessResponse> => {
    return apiCall<PaymentProcessResponse>(
      `/partner-agents/my-leads/${assignmentId}/process-payment/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },




  // ============================================================
  // ACTIVITY LOGS
  // ============================================================

  /**
   * Get agent's activity history
   * GET /api/v1/partner-agents/agent/activity-logs/
   */
  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AgentActivityLogsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const query = searchParams.toString();
    return apiCall<AgentActivityLogsResponse>(
      `/partner-agents/agent/activity-logs/${query ? `?${query}` : ''}`
    );
  },

  // ============================================================
  // STATS
  // ============================================================

  /**
   * Get dashboard stats
   * Note: May need to calculate from leads list if backend doesn't provide
   */
  getDashboardStats: async (): Promise<AgentDashboardStats> => {
    try {
      // Try to get stats from dedicated endpoint
      return await apiCall<AgentDashboardStats>('/partner-agents/me/stats/');
    } catch {
      // Fallback: calculate from leads
      const allLeads = await agentAppService.getAssignedLeads();
      const leads = allLeads.results || [];
      
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      return {
        total_assigned: leads.length,
        pending_acceptance: leads.filter(l => l.assignment_status === 'assigned').length,
        in_progress: leads.filter(l => ['accepted', 'en_route', 'checked_in', 'inspecting'].includes(l.assignment_status)).length,
        completed_today: leads.filter(l => l.assignment_status === 'completed' && l.completed_at?.startsWith(today)).length,
        completed_this_week: leads.filter(l => l.assignment_status === 'completed' && l.completed_at && l.completed_at >= weekAgo).length,
        completed_this_month: leads.filter(l => l.assignment_status === 'completed').length,
        average_rating: null,
        total_earnings: 0,
      };
    }
  },
};

export default agentAppService;