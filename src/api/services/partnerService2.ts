import { 
  publicApiClient, 
  privateApiClient 
} from '../client/apiClient'; // Adjust path as needed
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
  type PartnerDocument,
  type ServiceArea
} from '../../api/types/api'; // Adjust path as needed

// --- PUBLIC SIGNUP FLOW ---

const signupSendOtp = async (
  payload: PartnerSignupSendOtpRequest // <-- FIXED: Removed 'type'
): Promise<PartnerSignupSendOtpResponse> => { // <-- FIXED: Removed 'type'
  const { data } = await publicApiClient.post('/accounts/partner/signup/send-otp/', payload); // <-- FIXED: Removed 'type' from URL
  return data;
};

const signupVerifyOtp = async (
  payload: PartnerSignupVerifyOtpRequest
): Promise<PartnerSignupVerifyOtpResponse> => {
  const { data } = await publicApiClient.post('/accounts/partner/signup/verify-otp/', payload); //
  return data;
};

const signupComplete = async (
  payload: PartnerSignupCompleteRequest
): Promise<PartnerSignupCompleteResponse> => {
  const { data } = await publicApiClient.post('/accounts/partner/signup/complete/', payload); //
  return data;
};


// --- AUTHENTICATED PARTNER ENDPOINTS ---

/**
 * API 1.1: Get Partner Profile
 */
const getMe = async (): Promise<PartnerProfile> => {
  const { data } = await privateApiClient.get('/partners/me/'); //
  console.log('Fetched partner profile: ', data);
  return data;
};

/**
 * API 1.2: Update Partner Profile
 */
const updateMe = async (payload: PartnerUpdatePayload): Promise<PartnerProfile> => {
  const { data } = await privateApiClient.patch('/partners/me/', payload); //
  console.log('Updated partner profile: ', data);
  return data;
};

/**
 * API 1.3: Toggle Availability
 */
const toggleAvailability = async (
  payload: PartnerToggleAvailabilityRequest
): Promise<PartnerToggleAvailabilityResponse> => {
  const { data } = await privateApiClient.patch('/partners/me/availability/', payload); //
  console.log('Toggled availability: ', data);
  return data;
};

/**
 * API 3.1: List Bank Accounts
 */
const getBankAccounts = async (): Promise<PartnerBankAccount[]> => {
  const { data } = await privateApiClient.get('/partners/bank-accounts/'); //
  console.log('Fetched bank accounts: ', data);
  return data.results; // Assuming paginated response
};

/**
 * API 2.1: List Partner Documents
 */
const getDocuments = async (): Promise<PartnerDocument[]> => {
  const { data } = await privateApiClient.get('/partners/documents/'); //
  console.log('Fetched partner documents: ', data);
  return data.results; // Assuming paginated response
};

/**
 * API 4.1: List Service Areas
 */
const getServiceAreas = async (): Promise<ServiceArea[]> => {
  const { data } = await privateApiClient.get('/partners/service-areas/'); //
  console.log('Fetched service areas: ', data);
  return data.results; // Assuming paginated response
};


export const partnerService = {
  // Public
  signupSendOtp,
  signupVerifyOtp,
  signupComplete,
  
  // Private (Authenticated)
  getMe,
  updateMe,
  toggleAvailability,
  getBankAccounts,
  getDocuments,
  getServiceAreas
};