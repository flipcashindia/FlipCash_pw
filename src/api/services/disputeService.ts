import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { type Dispute, type DisputeFilters, type CreateDisputeRequest } from '../../types/dispute.types';

export const disputeService = {
  async getDisputes(filters?: DisputeFilters): Promise<Dispute[]> {
    const response = await apiClient.get(API_ENDPOINTS.DISPUTES.LIST, { params: filters });
    return response.data.results || response.data;
  },

  async getMyDisputes(): Promise<Dispute[]> {
    const response = await apiClient.get(API_ENDPOINTS.DISPUTES.MY_DISPUTES);
    return response.data.results || response.data;
  },

  async getDisputeDetail(id: string): Promise<Dispute> {
    const response = await apiClient.get(API_ENDPOINTS.DISPUTES.DETAIL(id));
    return response.data;
  },

  async createDispute(data: CreateDisputeRequest): Promise<Dispute> {
    const response = await apiClient.post(API_ENDPOINTS.DISPUTES.CREATE, data);
    return response.data;
  },

  async updateDispute(id: string, data: Partial<Dispute>): Promise<Dispute> {
    const response = await apiClient.patch(API_ENDPOINTS.DISPUTES.UPDATE(id), data);
    return response.data;
  },
};