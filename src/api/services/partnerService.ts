// src/api/services/partnerService.ts
import {
  publicApiClient,
  privateApiClient
} from '../client/apiClient';
import {
  type PartnerSignupSendOtpRequest,
  type PartnerSignupSendOtpResponse,
  type PartnerSignupVerifyOtpRequest,
  type PartnerSignupVerifyOtpResponse,
  type PartnerSignupCompleteRequest,
  type PartnerSignupCompleteResponse,
  type PartnerProfile,
  type PartnerUpdatePayload,
  type PartnerToggleAvailabilityRequest,
  type PartnerToggleAvailabilityResponse,
  type PartnerBankAccount,
  type AddBankAccountRequest,
  type PartnerDocument,
  type PartnerMetrics,
  type ServiceArea,
  type CreateServiceAreaRequest,
} from '../types/api';

// ─────────────────────────────────────────────────────────────────────────────
// NEW LOCATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ServiceZone {
  id: string;
  name: string;
  pincodes: string[];
  pincode_count: number;
  already_added: boolean;   // injected by AvailableCitiesView
  is_active: boolean;
  sort_order: number;
}

export interface AvailableCity {
  id: string;
  name: string;
  state: string;
  is_major: boolean;
  is_popular: boolean;
  zones: ServiceZone[];
}

export interface AvailableCitiesResponse {
  results: AvailableCity[];
  count: number;
}

export interface AvailableZonesResponse {
  city_id: string;
  city_name: string;
  state: string;
  is_major: boolean;
  zones: ServiceZone[];
}

export interface PincodeSearchResult {
  type: 'city' | 'zone' | 'pincode';
  display: string;
  city: string;
  state: string;
  city_id: string;
  zone_id?: string;
  pincode?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SIGNUP FLOW
// ─────────────────────────────────────────────────────────────────────────────

const signupSendOtp = async (
  payload: PartnerSignupSendOtpRequest
): Promise<PartnerSignupSendOtpResponse> => {
  const { data } = await publicApiClient.post('/accounts/partner/signup/send-otp/', payload);
  return data;
};

const signupVerifyOtp = async (
  payload: PartnerSignupVerifyOtpRequest
): Promise<PartnerSignupVerifyOtpResponse> => {
  const { data } = await publicApiClient.post('/accounts/partner/signup/verify-otp/', payload);
  return data;
};

const completeSignup = async (
  payload: PartnerSignupCompleteRequest
): Promise<PartnerSignupCompleteResponse> => {
  const { data } = await privateApiClient.post('/accounts/partner/signup/complete/', payload);
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PARTNER PROFILE
// ─────────────────────────────────────────────────────────────────────────────

const getMe = async (): Promise<PartnerProfile> => {
  const { data } = await privateApiClient.get('/partners/me/');
  return data;
};

const getMyMatrics = async (): Promise<PartnerMetrics> => {
  const { data } = await privateApiClient.get('/partners/me/matrics');
  return data;
};

const updateMe = async (payload: PartnerUpdatePayload): Promise<PartnerProfile> => {
  const { data } = await privateApiClient.patch('/partners/me/', payload);
  return data;
};

const toggleAvailability = async (
  payload: PartnerToggleAvailabilityRequest
): Promise<PartnerToggleAvailabilityResponse> => {
  const { data } = await privateApiClient.patch('/partners/me/availability/', payload);
  return data;
};

const setAvailability = async (
  is_available: boolean
): Promise<PartnerToggleAvailabilityResponse> => {
  const { data } = await privateApiClient.post('/partners/me/availability/', { is_available });
  return data;
};

const uploadAvatar = async (
  formData: FormData
): Promise<{ detail: string; profile_image_url: string }> => {
  const { data } = await privateApiClient.post('/partners/me/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const deleteAvatar = async (): Promise<{ detail: string }> => {
  const { data } = await privateApiClient.delete('/partners/me/avatar/');
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

const getDocuments = async (): Promise<PartnerDocument[]> => {
  const { data } = await privateApiClient.get('/partners/documents/');
  return Array.isArray(data) ? data : data.results;
};

const uploadDocument = async (formData: FormData): Promise<PartnerDocument> => {
  const { data } = await privateApiClient.post('/partners/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const deleteDocument = async (docId: string): Promise<void> => {
  await privateApiClient.delete(`/partners/documents/${docId}/`);
};

// ─────────────────────────────────────────────────────────────────────────────
// BANK ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────

const getBankAccounts = async (): Promise<PartnerBankAccount[]> => {
  const { data } = await privateApiClient.get('/partners/bank-accounts/');
  return Array.isArray(data) ? data : data.results;
};

const addBankAccount = async (payload: AddBankAccountRequest): Promise<PartnerBankAccount> => {
  const { data } = await privateApiClient.post('/partners/bank-accounts/', payload);
  return data;
};

const deleteBankAccount = async (accountId: string): Promise<void> => {
  await privateApiClient.delete(`/partners/bank-accounts/${accountId}/`);
};

const setPrimaryBankAccount = async (accountId: string): Promise<void> => {
  await privateApiClient.post(`/partners/bank-accounts/${accountId}/set_primary/`);
};

const verifyBankAccount = async (accountId: string): Promise<any> => {
  const { data } = await privateApiClient.post(`/partners/bank-accounts/${accountId}/verify/`);
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE AREAS — partner's active zones
// ─────────────────────────────────────────────────────────────────────────────

/** List partner's current service areas */
const getServiceAreas = async (): Promise<ServiceArea[]> => {
  const { data } = await privateApiClient.get('/locations/partner/service-areas/');
  return Array.isArray(data) ? data : data.results ?? [];
};

/** Add a zone by zone_id (new preferred method) */
const addServiceAreaByZone = async (zone_id: string): Promise<ServiceArea> => {
  const { data } = await privateApiClient.post('/locations/partner/service-areas/', { zone_id });
  return data;
};

/** Legacy add (kept so old call sites don't break) */
const addServiceArea = async (payload: CreateServiceAreaRequest): Promise<ServiceArea> => {
  // If payload has zone_id use new endpoint; otherwise fall back to partners endpoint
  if ((payload as any).zone_id) {
    return addServiceAreaByZone((payload as any).zone_id);
  }
  const { data } = await privateApiClient.post('/partners/service-areas/', payload);
  return data;
};

/** Toggle is_active on a service area */
const toggleServiceArea = async (
  areaId: string,
  is_active: boolean
): Promise<ServiceArea> => {
  const { data } = await privateApiClient.patch(
    `/locations/partner/service-areas/${areaId}/`,
    { is_active }
  );
  return data;
};

/** Remove a zone from partner's service areas */
const deleteServiceArea = async (areaId: string): Promise<void> => {
  await privateApiClient.delete(`/locations/partner/service-areas/${areaId}/`);
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION DISCOVERY — for the new zone-picker UI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all active cities with their zones + already_added flag.
 * Used to power the PartnerAreaPage zone picker.
 */
const getAvailableCities = async (): Promise<AvailableCitiesResponse> => {
  const { data } = await privateApiClient.get('/locations/partner/available-cities/');
  return data;
};

/**
 * Fetch zones for a single city with already_added flag.
 * Called when partner expands a city card.
 */
const getAvailableZones = async (city_id: string): Promise<AvailableZonesResponse> => {
  const { data } = await privateApiClient.get(
    `/locations/partner/available-zones/?city_id=${city_id}`
  );
  return data;
};

/**
 * Public pincode / city search (homepage search bar).
 */
const searchLocation = async (q: string): Promise<PincodeSearchResult[]> => {
  const { data } = await publicApiClient.get(`/locations/search/?q=${encodeURIComponent(q)}`);
  return data.results ?? [];
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const partnerService = {
  // Public
  signupSendOtp,
  signupVerifyOtp,

  // Authenticated
  completeSignup,
  getMe,
  getMyMatrics,
  updateMe,
  toggleAvailability,
  setAvailability,
  uploadAvatar,
  deleteAvatar,

  // Documents
  getDocuments,
  uploadDocument,
  deleteDocument,

  // Bank accounts
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  verifyBankAccount,

  // Service areas (partner's current areas)
  getServiceAreas,
  addServiceArea,
  addServiceAreaByZone,
  toggleServiceArea,
  deleteServiceArea,

  // Location discovery (zone picker)
  getAvailableCities,
  getAvailableZones,
  searchLocation,
};