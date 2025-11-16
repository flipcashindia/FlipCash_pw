// src/api/services/partnerClaimService.ts
/**
 * Partner Claim & Visit Management Service
 * Integrated workflow from claim to completion
 * 
 * USES: privateApiClient with Zustand auth store
 */

import { privateApiClient } from '../client/apiClient'
import type { AxiosResponse } from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface WalletInfo {
  claim_fee_deducted: string;
  purchase_amount_blocked: string;
  total_balance: string;
  blocked_balance: string;
  available_balance: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
}

export interface AddressInfo {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
}

export interface VisitInfo {
  inspection_duration_minutes: number | null;
  total_duration_minutes: number | null;
  travel_time_minutes: number | null;
}

export interface ClaimResponse {
  message: string;
  lead_id: string;
  lead_number: string;
  visit_id: string;
  visit_number: string;
  verification_code: string;
  wallet_info: WalletInfo;
  customer: CustomerInfo;
  pickup_address: AddressInfo;
  scheduled_date: string;
  scheduled_time_slot: string;
}

export interface CancelClaimRequest {
  reason: string;
}

export interface CancelClaimResponse {
  message: string;
  refunded_amount: string;
  claim_fee_not_refunded: string;
  wallet_info: {
    total_balance: string;
    available_balance: string;
  };
}

export interface CompleteVisitRequest {
  final_price?: string;
  customer_signature?: string;
}

export interface CompleteVisitResponse {
  message: string;
  lead_id: string;
  lead_number: string;
  visit_id: string;
  visit_number: string;
  final_price: string;
  completed_at: string;
  wallet_info: {
    estimated_price: string;
    final_price: string;
    refunded: string;
    total_balance: string;
    available_balance: string;
  };
  visit_info: VisitInfo;
}

// ============================================================================
// SERVICE
// ============================================================================

class PartnerClaimService {
  private readonly baseUrl = '/partner/leads';

  /**
   * Claim a lead
   * - Deducts claim fee immediately (non-refundable)
   * - Blocks purchase amount (refundable)
   * - Creates Visit record
   */
  async claimLead(leadId: string): Promise<ClaimResponse> {
    const response: AxiosResponse<ClaimResponse> = await privateApiClient.post(
      `${this.baseUrl}/${leadId}/claim/`
    );
    return response.data;
  }

  /**
   * Cancel a claimed lead
   * - Refunds blocked purchase amount
   * - Does NOT refund claim fee
   * - Cancels associated visit
   */
  async cancelClaim(
    leadId: string,
    data: CancelClaimRequest
  ): Promise<CancelClaimResponse> {
    const response: AxiosResponse<CancelClaimResponse> = await privateApiClient.post(
      `${this.baseUrl}/${leadId}/cancel/`,
      data
    );
    return response.data;
  }

  /**
   * Complete visit and process payment
   * - Unblocks purchase amount
   * - Deducts final price
   * - Refunds difference if any
   * - Marks visit as completed
   */
  async completeVisit(
    leadId: string,
    data?: CompleteVisitRequest
  ): Promise<CompleteVisitResponse> {
    const response: AxiosResponse<CompleteVisitResponse> = await privateApiClient.post(
      `${this.baseUrl}/${leadId}/complete_visit/`,
      data || {}
    );
    return response.data;
  }
}

export const partnerClaimService = new PartnerClaimService();