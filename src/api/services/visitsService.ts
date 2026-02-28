

import { privateApiClient } from '../client/apiClient';
import type { AxiosResponse } from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export const VisitStatus = {
  SCHEDULED: 'scheduled',
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export type VisitStatus = typeof VisitStatus[keyof typeof VisitStatus];

export interface Visit {
  id: string;
  visit_number: string;
  lead_number: string;
  customer_name: string;
  customer_phone: string;
  device_name: string;
  partner_name: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  status: VisitStatus;
  status_display: string;
  is_code_verified: boolean;
  can_verify: boolean;
  created_at: string;
}


export interface VerificationCodeResponse {
  verification_code: string;
  expires_at: string;
  is_expired: boolean;
  can_verify: boolean;
  visit_number: string;
  partner_name: string;
  scheduled_date: string;
  scheduled_time_slot: string;
}

export interface VerifyCodeRequest {
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  verified_at?: string;
  can_start_inspection?: boolean;
  attempts_remaining?: number;
}

export interface StartVisitRequest {
  notes?: string;
}

export interface StartVisitResponse {
  message: string;
  status: string;
  started_at: string;
}

export interface ChecklistItem {
  item_name: string;
  category: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
  photo_url?: string;
  details?: Record<string, any>;
}

export interface CompleteInspectionRequest {
  inspection_notes: string;
  inspection_photos: string[];
  verified_imei: string;
  imei_matches: boolean;
  device_powers_on: boolean;
  partner_assessment: Record<string, any>;
  partner_recommended_price: string;
  checklist_items?: ChecklistItem[];
}

export interface CompleteInspectionResponse {
  message: string;
  inspection_completed_at: string;
  partner_recommended_price: string;
}

export interface CancelVisitRequest {
  reason: string;
}

export interface CancelVisitResponse {
  message: string;
  cancelled_at: string;
}

export interface VisitTimeline {
  id: string;
  old_status: string;
  old_status_display: string;
  new_status: string;
  new_status_display: string;
  changed_by: string | null;
  changed_by_name: string | null;
  reason: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ChecklistSummary {
  total: number;
  pass: number;
  fail: number;
  na: number;
}

export interface VisitDetail extends Visit {
  lead: any; // Full lead object
  partner: any; // Full partner object
  verification_code_masked: string;
  verification_code_expires_at: string;
  verified_at: string | null;
  verification_attempts: number;
  max_verification_attempts: number;
  is_code_expired: boolean;
  partner_started_at: string | null;
  arrived_at: string | null;
  inspection_started_at: string | null;
  inspection_completed_at: string | null;
  actual_end_time: string | null;
  travel_time_minutes: number | null;
  inspection_duration_minutes: number | null;
  total_visit_duration_minutes: number | null;
  inspection_notes: string;
  inspection_photos: string[];
  verified_imei: string;
  imei_matches: boolean | null;
  device_powers_on: boolean | null;
  partner_assessment: Record<string, any>;
  partner_recommended_price: string | null;
  customer_present: boolean;
  customer_signature_url: string;
  checklist_summary: ChecklistSummary;
  updated_at: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export class VisitService {
  private readonly baseUrl = '/visits';

  /**
   * List all visits (filtered by user role)
   */
  async listVisits(params?: Record<string, any>): Promise<Visit[]> {
    const response: AxiosResponse<Visit[]> = await privateApiClient.get(this.baseUrl, {
      params,
    });
    return response.data;
  }

  /**
   * Get visit details
   */
  async getVisit(visitId: string): Promise<VisitDetail> {
    const response: AxiosResponse<VisitDetail> = await privateApiClient.get(
      `${this.baseUrl}/${visitId}/`
    );
    return response.data;
  }

  /**
   * Get verification code (customer only)
   */
  async getVerificationCode(
    visitId: string
  ): Promise<VerificationCodeResponse> {
    const response: AxiosResponse<VerificationCodeResponse> = await privateApiClient.get(
      `${this.baseUrl}/${visitId}/verification_code/`
    );
    return response.data;
  }

  /**
   * Verify arrival code (partner only)
   */
  async verifyCode(
    visitId: string,
    data: VerifyCodeRequest
  ): Promise<VerifyCodeResponse> {
    const response: AxiosResponse<VerifyCodeResponse> = await privateApiClient.post(
      `${this.baseUrl}/${visitId}/verify_code/`,
      data
    );
    return response.data;
  }

  /**
   * Regenerate verification code (customer only)
   */
  async regenerateCode(
    visitId: string,
    reason?: string
  ): Promise<VerificationCodeResponse> {
    const response: AxiosResponse<VerificationCodeResponse> = await privateApiClient.post(
      `${this.baseUrl}/${visitId}/regenerate_code/`,
      { reason: reason || '' }
    );
    return response.data;
  }

  /**
   * Start visit (partner marks en route)
   */
  async startVisit(
    visitId: string,
    data?: StartVisitRequest
  ): Promise<StartVisitResponse> {
    const response: AxiosResponse<StartVisitResponse> = await privateApiClient.post(
      `${this.baseUrl}/${visitId}/start/`,
      data || {}
    );
    return response.data;
  }

  /**
   * Start inspection (after arrival verification)
   */
  async startInspection(visitId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await privateApiClient.post(
      `${this.baseUrl}/${visitId}/start_inspection/`
    );
    return response.data;
  }

  /**
   * Complete inspection and submit results
   */
  async completeInspection(
    visitId: string,
    data: CompleteInspectionRequest
  ): Promise<CompleteInspectionResponse> {
    const response: AxiosResponse<CompleteInspectionResponse> = await privateApiClient.post(
      `${this.baseUrl}/${visitId}/complete_inspection/`,
      data
    );
    return response.data;
  }

  /**
   * Cancel visit
   */
  async cancelVisit(
    visitId: string,
    data: CancelVisitRequest
  ): Promise<CancelVisitResponse> {
    const response: AxiosResponse<CancelVisitResponse> = await privateApiClient.post(
      `${this.baseUrl}/${visitId}/cancel/`,
      data
    );
    return response.data;
  }

  /**
   * Get visit timeline (status logs)
   */
  async getTimeline(visitId: string): Promise<VisitTimeline[]> {
    const response: AxiosResponse<VisitTimeline[]> = await privateApiClient.get(
      `${this.baseUrl}/${visitId}/timeline/`
    );
    return response.data;
  }

  /**
   * Get verification checklist
   */
  async getChecklist(visitId: string): Promise<ChecklistItem[]> {
    const response: AxiosResponse<ChecklistItem[]> = await privateApiClient.get(
      `${this.baseUrl}/${visitId}/checklist/`
    );
    return response.data;
  }

  /**
   * Get upcoming visits
   */
  async getUpcomingVisits(): Promise<Visit[]> {
    const response: AxiosResponse<Visit[]> = await privateApiClient.get(
      `${this.baseUrl}/upcoming/`
    );
    return response.data;
  }

  /**
   * Get visit statistics
   */
  async getStats(): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await privateApiClient.get(
      `${this.baseUrl}/visits/stats/`
    );
    console.log('Visit stats:', response.data);
    return response.data;
  }
}

export const visitService = new VisitService();