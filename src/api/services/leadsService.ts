// src/api/services/leadsService.ts
import { privateApiClient } from '../client/apiClient';
import { 
    type AvailableLead, 
    type MyLead, 
    type LeadDetails,
    type Paginated
} from '../types/api';

/**
 * API 2.1: Browse Available Leads (Partner)
 * GET /api/v1/partner/leads/
 */
// const getAvailableLeads = async (filters: { [key: string]: any }): Promise<Paginated<AvailableLead>> => {
//     // Corrected URL: /partner/leads/
//     const { data } = await privateApiClient.get('/partner/leads/', {
//         params: filters,
//     });
//     return data;
// };
const getAvailableLeads = async (_filters: { [key: string]: any }): Promise<Paginated<AvailableLead>> => {
    // Corrected URL: /partner/leads/
    const { data } = await privateApiClient.get('/leads/leads/', {
    });
    console.log('leads data : ', data)
    return data;
};

/**
 * API 2.3: View Claimed/Assigned Leads (Partner)
 * GET /api/v1/partner/my-leads/
 */
// const getMyLeads = async (filters: { [key: string]: any }): Promise<Paginated<MyLead>> => {
//     // Corrected URL: /partner/leads/my-leads/
//     const { data } = await privateApiClient.get('/partner/leads/my-leads/', {
//         params: filters,
//     });
//     return data;
// };

const getMyLeads = async (_filters: { [key: string]: any }): Promise<Paginated<MyLead>> => {
    // Corrected URL: /partner/leads/my-leads/
    const { data } = await privateApiClient.get('/leads/partner/leads/my_leads/', {    
    });
    console.log('my leads data : : ', data.results)
    return data;
};



/**
 * API 1.3: Get Lead Details
 * GET /api/v1/leads/{lead_id}/
 */



const getLeadDetails = async (leadId: string): Promise<LeadDetails> => {
    // Corrected URL: /leads/{leadId}/
    const { data } = await privateApiClient.get(`/leads/leads/${leadId}/`);
    console.log('leads data from : ', data)
    return data;
};

/**
 * API 2.2: Claim Lead (Partner)
 * POST /api/v1/partner/leads/{lead_id}/claim/
 */
const claimLead = async (leadId: string): Promise<any> => {
    const payload = { notes: "I am claiming this lead" }; 
    // Corrected URL: /partner/leads/{leadId}/claim/
    const { data } = await privateApiClient.post(`/leads/partner/leads/${leadId}/claim/`, payload);
    console.log('claimed leads : ', data)
    return data;
};

/**
 * API 3.1: Create Offer (Partner)
 * POST /api/v1/offers/
 */
const createOffer = async (payload: { lead: string, partner_offered_price: string, message: string }): Promise<any> => {
    // Corrected URL: /offers/
    const { data } = await privateApiClient.post('/offers/', payload);
    console.log('offer creations result : ', data)
    return data;
};

export const leadsService = {
    getAvailableLeads,
    getMyLeads,
    getLeadDetails,
    claimLead,
    createOffer,
};