// src/api/services/partnerService.ts
import { 
  publicApiClient, 
  privateApiClient 
} from '../client/apiClient';
import {
  type PartnerSignupSendOtpRequest,
  type PartnerSignupSendOtpResponse,
  // ... (all your other imported types) ...
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
  // type PartnerDocumentType,
  type ServiceArea,
  type CreateServiceAreaRequest
} from '../types/api';

// --- PUBLIC SIGNUP FLOW ---
const signupSendOtp = async (
  payload: PartnerSignupSendOtpRequest
): Promise<PartnerSignupSendOtpResponse> => {
  const { data } = await publicApiClient.post('/accounts/partner/signup/send-otp/', payload);
  return data;
};
// ... (signupVerifyOtp, signupComplete) ...

const signupVerifyOtp = async (
  payload: PartnerSignupVerifyOtpRequest
): Promise<PartnerSignupVerifyOtpResponse> => {
  const { data } = await publicApiClient.post('/accounts/partner/signup/verify-otp/', payload);
  return data;
};

const completeSignup = async (
  payload: PartnerSignupCompleteRequest
): Promise<PartnerSignupCompleteResponse> => {
  // Use the private client to send the auth token
  const { data } = await privateApiClient.post(
    '/accounts/partner/signup/complete/', 
    payload
  );
  console.log('Completed partner signup: ', data);
  return data;
};

// --- 1. PARTNER PROFILE ---
const getMe = async (): Promise<PartnerProfile> => {
  const { data } = await privateApiClient.get('/partners/me/'); 
  // console.log('Fetched partner profile: ', data);
  return data;
};

const updateMe = async (payload: PartnerUpdatePayload): Promise<PartnerProfile> => {
  const { data } = await privateApiClient.patch('/partners/me/', payload); 
  console.log('Updated partner profile: ', data);
  return data;
};

const toggleAvailability = async (
  payload: PartnerToggleAvailabilityRequest
): Promise<PartnerToggleAvailabilityResponse> => {
  const { data } = await privateApiClient.patch('/partners/me/availability/', payload); 
  console.log('Toggled availability: ', data);
  return data;
};

// --- 2. PARTNER DOCUMENTS ---
// --- 2. PARTNER DOCUMENTS ---
const getDocuments = async (): Promise<PartnerDocument[]> => {
  const { data } = await privateApiClient.get('/partners/documents/'); 
  console.log('Fetched partner documents: ', data);

  // --- THIS IS THE FIX ---
  // Your log shows 'data' is an array, so return 'data' directly.
  return data; 
  // return data.results; // <-- THIS WAS THE BUG
};

const uploadDocument = async (formData: FormData): Promise<PartnerDocument> => {
  // FormData must contain 'document_type' and 'document_file'
  const { data } = await privateApiClient.post('/partners/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }, 
  });
  console.log('Uploaded document: ', data);
  return data;
};

const deleteDocument = async (docId: string): Promise<void> => {
  await privateApiClient.delete(`/partners/documents/${docId}/`); 
};

// --- 3. BANK ACCOUNTS ---
const getBankAccounts = async (): Promise<PartnerBankAccount[]> => {
  const { data } = await privateApiClient.get('/partners/bank-accounts/'); 
  console.log('Fetched bank accounts: ', data);
  
  // This one is now correct:
  return data; 
};

const addBankAccount = async (payload: AddBankAccountRequest): Promise<PartnerBankAccount> => {
  const { data } = await privateApiClient.post('/partners/bank-accounts/', payload); 
  console.log('Added bank account: ', data);
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
  console.log('Bank account verified: ', data);
  return data;
};

// --- 4. SERVICE AREAS ---
const getServiceAreas = async (): Promise<ServiceArea[]> => {
  const { data } = await privateApiClient.get('/partners/service-areas/');
  console.log('Fetched service areas: ', data);

  // --- THIS IS THE FIX ---
  // Your log shows 'data' is an array, so return 'data' directly.
  return data; 
  // return data.results; // <-- THIS WAS THE BUG
};

const addServiceArea = async (payload: CreateServiceAreaRequest): Promise<ServiceArea> => {
  const { data } = await privateApiClient.post('/partners/service-areas/', payload); 
  console.log('Added service area: ', data);
  return data;
};

const deleteServiceArea = async (areaId: string): Promise<void> => {
  await privateApiClient.delete(`/partners/service-areas/${areaId}/`); 
};


export const partnerService = {
  // Public
  signupSendOtp,
  signupVerifyOtp,
  
  
  // Private (Authenticated)
  completeSignup,
  getMe,
  updateMe,
  toggleAvailability,
  getDocuments,
  uploadDocument,
  deleteDocument,
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  verifyBankAccount,
  getServiceAreas,
  addServiceArea,
  deleteServiceArea
};