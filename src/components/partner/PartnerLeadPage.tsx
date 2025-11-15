// src/pages/partner/PartnerLeadsPage.tsx

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadsService } from '../../api/services/leadsService';
import { Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { 
    type AvailableLead, 
    type MyLead, 
    type Paginated,
    LeadStatus // Assume LeadStatus is imported as a const object for runtime lookups
} from '../../api/types/api';
import { Link, useParams, useNavigate } from 'react-router-dom';

// --- Components ---

// Card for "New Leads" tab
const AvailableLeadCard: React.FC<{ lead: AvailableLead }> = ({ lead }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-yellow hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500">{lead.lead_number}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                {/* FIX: Use days_old from your API data and provide a fallback */}
                {lead.days_old !== undefined ? `${lead.days_old} days ago` : (lead.age_hours ? `${lead.age_hours} hrs ago` : 'New')}
            </span>
        </div>
        {/* FIX: Use optional chaining on device_model */}
        <h3 className="text-lg font-semibold text-brand-black">{lead.device_model?.name || lead.device_name}</h3>
        <p className="text-brand-green font-bold text-xl mb-2">Est. ₹{lead.estimated_price}</p>
        
        {/* FIX: Use optional chaining for city and pincode */}
        <p className="text-sm text-gray-600">
            {lead.city ? `${lead.city}, ${lead.pincode}` : 'Location not specified'}
        </p>
        
        <p className="text-sm text-gray-600">
            **Pickup Date:** {lead.preferred_date} ({lead.preferred_time_slot})
        </p>
        
        {(lead.status === 'booked')&&
        (<Link 
            to={`/partner/lead/${lead.id}`} 
            className="mt-4 block w-full text-center px-4 py-2 bg-brand-yellow text-brand-black font-bold rounded-lg hover:bg-yellow-400 transition"
        >
            View Details & Claim
        </Link>)}
        {(lead.status === 'partner_assigned')&&
        (<div 
            
            className="mt-4 block w-full text-center px-4 py-2 bg-brand-green text-brand-black font-bold rounded-lg hover:bg-yellow-400 transition"
        >
            Already Claimed
        </div>)}
    </div>
);

// Card for "My Leads" tab
const MyLeadCard: React.FC<{ lead: MyLead }> = ({ lead }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-green hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500">{lead.lead_number}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${lead.status === LeadStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {lead.status_display}
            </span>
        </div>
        {/* FIX: Use optional chaining on device_model and fallback to device_name */}
        <h3 className="text-lg font-semibold text-brand-black">{lead.device_model?.name || lead.device_name}</h3>
        
        {/* FIX: Use optional chaining for customer details */}
        <p className="text-sm text-gray-600">
            **Customer:** {lead.customer_name || 'N/A'} ({lead.customer_phone || 'N/A'})
        </p>
        
        {/* FIX: Use optional chaining for pickup_address */}
        <p className="text-sm text-gray-600">
            **Address:** {lead.pickup_address?.address_line1 || 'Address not specified'}, {lead.pickup_address?.city || ''}
        </p>
        
        <p className="text-sm text-gray-600">
            **Scheduled:** {lead.preferred_date} ({lead.preferred_time_slot})
        </p>
        <Link 
            to={`/partner/lead/${lead.id}`} 
            className="mt-4 block w-full text-center px-4 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-green-600 transition"
        >
            Manage Lead
        </Link>
    </div>
);

// --- Main Page Component ---

export const PartnerLeadsPage: React.FC = () => {
    const { tab = 'new' } = useParams<{ tab: 'new' | 'my' }>(); // Default to 'new'
    const navigate = useNavigate();
    
    // State for filtering and pagination
    const [page, setPage] = useState(1);
    // Use LeadStatusType as the type for the filter state if defined
    const [statusFilter, setStatusFilter] = useState<string>(''); 

    // Reset page when tab changes
    useEffect(() => {
        setPage(1);
        setStatusFilter('');
    }, [tab]);

    // --- Data Fetching for Available Leads ---
    const { 
        data: availableLeads, 
        isLoading: isLoadingAvailable,
        isFetching: isFetchingAvailable,
    } = useQuery<Paginated<AvailableLead>, Error>({ // Explicitly type the query
        queryKey: ['availableLeads', page],
        queryFn: () => leadsService.getAvailableLeads({ page, ordering: '-created_at' }),
        enabled: tab === 'new',
        staleTime: 60000, 
    });

    console.log('available lead data; : ', availableLeads);
    

    // --- Data Fetching for My Leads ---
    const { 
        data: myLeads, 
        isLoading: isLoadingMy,
        isFetching: isFetchingMy,
    } = useQuery<Paginated<MyLead>, Error>({ // Explicitly type the query
        queryKey: ['myLeads', page, statusFilter],
        queryFn: () => leadsService.getMyLeads({ page, status: statusFilter }),
        enabled: tab === 'my',
        placeholderData: (prevData) => prevData,
    });

    console.log('my leads: ', myLeads)
    
    const isLoading = isLoadingAvailable || isLoadingMy;
    const isFetching = isFetchingAvailable || isFetchingMy;

    // This logic is correct, assuming your service returns a paginated object
    const currentData: Paginated<AvailableLead | MyLead> | undefined = tab === 'new' 
        ? availableLeads 
        : myLeads;

    console.log('current data : ', currentData)
    console.log('current data length : ', currentData?.length);

    // Filter options using the imported LeadStatus object
    const leadStatusOptions = [
        { value: '', label: 'All Statuses' },
        { value: LeadStatus.PARTNER_ASSIGNED, label: 'Assigned' },
        { value: LeadStatus.EN_ROUTE, label: 'En Route' },
        { value: LeadStatus.CHECKED_IN, label: 'Checked In' },
        { value: LeadStatus.INSPECTING, label: 'Inspecting' },
        { value: LeadStatus.OFFER_MADE, label: 'Offer Made' },
        { value: LeadStatus.NEGOTIATING, label: 'Negotiating' },
        { value: LeadStatus.ACCEPTED, label: 'Accepted' },
        { value: LeadStatus.COMPLETED, label: 'Completed' },
        { value: LeadStatus.CANCELLED, label: 'Cancelled' },
    ];

    // --- Render Logic ---

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            
            {/* --- Tab Navigation --- */}
            <h2 className="text-3xl font-extrabold text-brand-black mb-4">Partner Lead Management</h2>
            <div className="flex border-b mb-6">
                <button
                    onClick={() => navigate('/partner/leads/new')}
                    className={`px-6 py-3 font-semibold ${tab === 'new' ? 'border-b-2 border-brand-yellow text-brand-black' : 'text-gray-500 hover:text-brand-black/70'}`}
                >
                    New Leads ({availableLeads?.count ?? 0}) 
                </button>
                <button
                    onClick={() => navigate('/partner/leads/my')}
                    className={`px-6 py-3 font-semibold ${tab === 'my' ? 'border-b-2 border-brand-yellow text-brand-black' : 'text-gray-500 hover:text-brand-black/70'}`}
                >
                    My Leads ({myLeads?.count ?? 0})
                </button>
            </div>

            {/* --- Filter & Sorting (Only for My Leads) --- */}
            {tab === 'my' && (
                <div className="flex items-center space-x-4 mb-6 p-3 bg-gray-50 rounded-lg border">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1); // Reset to page 1 on filter change
                        }}
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow text-sm"
                    >
                        {leadStatusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* --- Loading State --- */}
            {/* Show loading state on initial load OR background refetch */}
            {(isLoading || (isFetching && !currentData?.results)) && (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-brand-yellow w-8 h-8" />
                    <span className="ml-3 text-gray-600">Loading leads...</span>
                </div>
            )}

            {/* --- Content Display --- */}
            {/* Show content only when not in initial load state */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentData?.length === 0 ? (
                        <p className="text-gray-500 col-span-3 text-center py-8">
                            {tab === 'new' 
                                ? 'No new leads available in your area right now.'
                                : 'You have no leads matching the current filter.'
                            }
                        </p>
                    ) : (
                        currentData?.results?.map((lead: AvailableLead | MyLead) => (
                            tab === 'new' 
                                ? <AvailableLeadCard key={lead.id} lead={lead as AvailableLead} /> 
                                : <MyLeadCard key={lead.id} lead={lead as MyLead} />
                        ))
                    )}
                </div>
            )}

            {/* --- Pagination Controls --- */}
            {!isLoading && (currentData?.length ?? 0) > 0 && (
                <div className="flex justify-center items-center mt-8 space-x-4">
                    <button
                        onClick={() => setPage(prev => prev - 1)}
                        disabled={!currentData?.previous} 
                        className="p-2 border rounded-full text-brand-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Page **{page}**
                    </span>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={!currentData?.next}
                        className="p-2 border rounded-full text-brand-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-gray-500">
                        (Total: {currentData?.length})
                    </span>
                </div>
            )}
        </div>
    );
};