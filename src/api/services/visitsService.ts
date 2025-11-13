// src/api/services/visitsService.ts
import { privateApiClient } from '../client/apiClient';
import { type VisitDetails, type VisitChecklistItem } from '../types/api';

/**
 * API 1.2 (Visits): Get Visit Details
 * GET /visits/{visit_id}/
 */
const getVisitDetails = async (visitId: string): Promise<VisitDetails> => {
  const { data } = await privateApiClient.get(`/visits/${visitId}/`); // [cite: 1.2]
  return data;
};

/**
 * API 2.4 (Leads): Check-in at Customer Location (Partner)
 * This is used to create the Visit object and get its ID.
 */
const checkIn = async (leadId: string): Promise<any> => {
  // We send 0,0 for lat/lon as this is a manual flow
  const payload = { latitude: "0.0", longitude: "0.0", notes: "Manual Check-in" }; // [cite: 2.4]
  const { data } = await privateApiClient.post(`/leads/partner/leads/${leadId}/checkin/`, payload); // [cite: 2.4]
  return data; // This response includes the visit object [cite: 2.4]
};

/**
 * API 1.5 (Visits): Verify Code (Partner)
 * POST /visits/{visit_id}/verify_code/
 */
const verifyVisitCode = async (visitId: string, code: string): Promise<any> => {
  // We send 0,0 for lat/lon as this is a manual flow
  const payload = { verification_code: code, latitude: "0.0", longitude: "0.0" }; // [cite: 1.5]
  const { data } = await privateApiClient.post(`/visits/${visitId}/verify_code/`, payload); // [cite: 1.5]
  return data;
};

/**
 * API 1.8 (Visits): Start Inspection (Partner)
 * POST /visits/{visit_id}/start_inspection/
 */
const startInspection = async (visitId: string): Promise<any> => {
  const payload = { customer_present: true, initial_notes: "Starting inspection" }; // [cite: 1.8]
  const { data } = await privateApiClient.post(`/visits/${visitId}/start_inspection/`, payload); // [cite: 1.8]
  return data;
};

/**
 * API 2.1 (Visits): Get Visit Checklist
 * GET /visits/{visit_id}/checklist/
 */
const getChecklist = async (visitId: string): Promise<VisitChecklistItem[]> => {
  const { data } = await privateApiClient.get(`/visits/${visitId}/checklist/`); // [cite: 2.1]
  return data.results; 
};

/**
 * API 2.2 (Visits): Update Checklist Item (Partner)
 * POST /visits/checklist/{item_id}/update/
 */
const updateChecklistItem = async (itemId: string, payload: { status: 'pass' | 'fail' | 'na', value?: string, notes: string }): Promise<VisitChecklistItem> => {
  const { data } = await privateApiClient.post(`/visits/checklist/${itemId}/update/`, payload); // [cite: 2.2]
  return data;
};

/**
 * API 1.9 (Visits): Complete Inspection (Partner)
 * POST /visits/{visit_id}/complete_inspection/
 */
const completeInspection = async (visitId: string, payload: { inspection_notes: string, partner_recommended_price: string }): Promise<any> => {
  const { data } = await privateApiClient.post(`/visits/${visitId}/complete_inspection/`, payload); // [cite: 1.9]
  return data;
};

export const visitsService = {
  getVisitDetails,
  checkIn,
  verifyVisitCode,
  startInspection,
  getChecklist,
  updateChecklistItem,
  completeInspection,
};