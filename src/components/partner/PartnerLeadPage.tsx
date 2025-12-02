// src/pages/partner/PartnerLeadsPage.tsx

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadsService } from '../../api/services/leadsService';
import { 
    Loader2, 
    ChevronLeft, 
    ChevronRight, 
    Filter, 
    MapPin, 
    Calendar, 
    // Clock, 
    Phone, 
    User, 
    Package,
    IndianRupee,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { 
    type AvailableLead, 
    type MyLead, 
    type Paginated,
    type DeviceModel,
    type Address,
    LeadStatus
} from '../../api/types/api';
import { Link, useParams, useNavigate } from 'react-router-dom';

// --- FlipCash Color Theme Constants ---
const COLORS = {
    brandYellow: '#FEC925',
    brandBlack: '#1C1C1B',
    brandGreen: '#1B8A05',
    brandRed: '#FF0000',
    greyLight: '#F5F5F5',
    white: '#FFFFFF',
};

// --- Helper Functions ---
const formatPrice = (price: string | number | null | undefined): string => {
    if (!price) return '₹0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString('en-IN')}`;
};

const getStatusColor = (status: string): { bg: string; text: string; border: string } => {
    const statusColors: Record<string, { bg: string; text: string; border: string }> = {
        'booked': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' },
        'partner_assigned': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400' },
        'en_route': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-400' },
        'checked_in': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400' },
        'inspecting': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400' },
        'offer_made': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-400' },
        'negotiating': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-400' },
        'accepted': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-400' },
        'payment_processing': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-400' },
        'completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' },
        'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400' },
        'disputed': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
        'expired': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
    };
    return statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400' };
};

// --- Type Guards ---
const getDeviceName = (deviceModel: DeviceModel | null, brandName?: string): string => {
    if (deviceModel?.name) return deviceModel.name;
    if (brandName) return brandName;
    return 'Unknown Device';
};

const getAddressDisplay = (address: Address | null | undefined): { short: string; full: string } => {
    if (!address) return { short: 'Address not specified', full: 'Address not specified' };
    
    const parts = [address.line1, address.city, address.postal_code].filter(Boolean);
    const shortAddress = address.city ? `${address.city}, ${address.postal_code || ''}` : 'Location not specified';
    const fullAddress = parts.join(', ');
    
    return { short: shortAddress, full: fullAddress };
};

// --- Components ---

// Card for "New Leads" tab (Available Leads)
const AvailableLeadCard: React.FC<{ lead: AvailableLead }> = ({ lead }) => {
    // console.log('Rendering AvailableLeadCard with lead:', lead);
    
    const deviceName = getDeviceName(lead.device_model, lead.brand_name);
    const addressInfo = getAddressDisplay(lead.pickup_address);
    // const statusColors = getStatusColor(lead.status);
    
    // Determine age display
    const ageDisplay = lead.days_old !== undefined 
        ? `${lead.days_old} day${lead.days_old !== 1 ? 's' : ''} ago`
        : lead.age_hours 
            ? `${lead.age_hours} hrs ago` 
            : 'New';

    return (
        <div 
            className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4"
            style={{ borderLeftColor: COLORS.brandYellow }}
        >
            {/* Header: Lead Number & Age */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {lead.lead_number}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    {ageDisplay}
                </span>
            </div>
            
            {/* Device Info */}
            <div className="mb-3">
                <h3 className="text-lg font-bold" style={{ color: COLORS.brandBlack }}>
                    {deviceName}
                </h3>
                {(lead.storage || lead.color) && (
                    <p className="text-sm text-gray-500 mt-0.5">
                        {[lead.storage, lead.color].filter(Boolean).join(' • ')}
                    </p>
                )}
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-1 mb-4">
                <IndianRupee className="w-5 h-5" style={{ color: COLORS.brandGreen }} />
                <span className="text-2xl font-bold" style={{ color: COLORS.brandGreen }}>
                    {formatPrice(lead.estimated_price).replace('₹', '')}
                </span>
                <span className="text-xs text-gray-500 ml-1">estimated</span>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-2 mb-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{addressInfo.short}</span>
            </div>
            
            {/* Pickup Schedule */}
            <div className="flex items-center gap-2 mb-4 text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                    {lead.preferred_date} • {lead.preferred_time_slot}
                </span>
            </div>
            
            {/* Urgent Badge */}
            {lead.is_urgent && (
                <div className="flex items-center gap-1 mb-3">
                    <AlertCircle className="w-4 h-4" style={{ color: COLORS.brandRed }} />
                    <span className="text-xs font-semibold" style={{ color: COLORS.brandRed }}>
                        Urgent
                    </span>
                </div>
            )}
            
            {/* Action Button */}
            {lead.status === 'booked' && (
                <Link 
                    to={`/partner/catalog/leads/${lead.id}`} 
                    className="mt-2 block w-full text-center px-4 py-2.5 font-bold rounded-lg transition-all duration-200 hover:shadow-md"
                    style={{ 
                        backgroundColor: COLORS.brandYellow, 
                        color: COLORS.brandBlack 
                    }}
                >
                    View Details & Claim
                </Link>
            )}
            {lead.status != 'booked' && (
                <div 
                    className="mt-2 block w-full text-center px-4 py-2.5 font-bold rounded-lg cursor-not-allowed opacity-75"
                    style={{ 
                        backgroundColor: COLORS.brandGreen, 
                        color: COLORS.white 
                    }}
                >
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    Already Claimed
                </div>
            )}
        </div>
    );
};

// Card for "My Leads" tab (Claimed/Assigned Leads)
const MyLeadCard: React.FC<{ lead: MyLead }> = ({ lead }) => {
    // console.log('Rendering MyLeadCard with lead:', lead);
    
    const deviceName = getDeviceName(lead.device_model, lead.brand_name);
    const addressInfo = getAddressDisplay(lead.pickup_address);
    const statusColors = getStatusColor(lead.status);
    
    // Determine the best price to show
    const displayPrice = lead.final_price || lead.quoted_price || lead.estimated_price;
    const priceLabel = lead.final_price ? 'Final' : lead.quoted_price ? 'Quoted' : 'Estimated';
    
    // Customer info from user object
    const customerName = lead.user?.name || 'N/A';
    const customerPhone = lead.user?.phone || 'N/A';
    
    // Use pickup_date_display if available, otherwise preferred_date
    const pickupDateDisplay = lead.pickup_date_display || lead.preferred_date;

    return (
        <div 
            className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4"
            style={{ borderLeftColor: COLORS.brandGreen }}
        >
            {/* Header: Lead Number & Status */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {lead.lead_number}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}>
                    {lead.status_display}
                </span>
            </div>
            
            {/* Device Info */}
            <div className="mb-3">
                <h3 className="text-lg font-bold" style={{ color: COLORS.brandBlack }}>
                    {deviceName}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                    {lead.storage && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            {lead.storage}
                        </span>
                    )}
                    {lead.ram && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            {lead.ram}
                        </span>
                    )}
                    {lead.color && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            {lead.color}
                        </span>
                    )}
                </div>
            </div>
            
            {/* Price with label */}
            <div className="flex items-center gap-1 mb-4">
                <IndianRupee className="w-5 h-5" style={{ color: COLORS.brandGreen }} />
                <span className="text-2xl font-bold" style={{ color: COLORS.brandGreen }}>
                    {formatPrice(displayPrice).replace('₹', '')}
                </span>
                <span className="text-xs text-gray-500 ml-1">{priceLabel.toLowerCase()}</span>
            </div>
            
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium" style={{ color: COLORS.brandBlack }}>
                        {customerName}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a 
                        href={`tel:${customerPhone}`} 
                        className="text-sm font-medium hover:underline"
                        style={{ color: COLORS.brandGreen }}
                    >
                        {customerPhone}
                    </a>
                </div>
            </div>
            
            {/* Address */}
            <div className="flex items-start gap-2 mb-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{addressInfo.full}</span>
            </div>
            
            {/* Schedule */}
            <div className="flex items-center gap-2 mb-4 text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                    {pickupDateDisplay} • {lead.preferred_time_slot}
                </span>
            </div>
            
            {/* Messages/Offers Count */}
            {(lead.messages_count !== undefined || lead.offers_count !== undefined) && (
                <div className="flex gap-4 mb-3 text-sm text-gray-500">
                    {lead.messages_count !== undefined && (
                        <span>
                            {lead.messages_count} message{lead.messages_count !== 1 ? 's' : ''}
                            {lead.unread_messages_count ? ` (${lead.unread_messages_count} unread)` : ''}
                        </span>
                    )}
                    {lead.offers_count !== undefined && (
                        <span>{lead.offers_count} offer{lead.offers_count !== 1 ? 's' : ''}</span>
                    )}
                </div>
            )}
            
            {/* Action Button */}
            <Link 
                to={`/partner/lead/${lead.id}`} 
                className="mt-2 block w-full text-center px-4 py-2.5 font-bold rounded-lg transition-all duration-200 hover:shadow-md"
                style={{ 
                    backgroundColor: COLORS.brandGreen, 
                    color: COLORS.white 
                }}
            >
                Manage Lead
            </Link>
        </div>
    );
};

// Loading Skeleton Component
const LeadCardSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-gray-200 animate-pulse">
        <div className="flex justify-between items-center mb-3">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-7 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
    </div>
);

// --- Main Page Component ---
export const PartnerLeadsPage: React.FC = () => {
    const { tab = 'new' } = useParams<{ tab: 'new' | 'my' }>();
    const navigate = useNavigate();
    
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>(''); 

    useEffect(() => {
        setPage(1);
        setStatusFilter('');
    }, [tab]);

    // --- Data Fetching for Available Leads ---
    const { 
        data: availableLeads, 
        isLoading: isLoadingAvailable,
        isFetching: isFetchingAvailable,
        error: availableLeadsError,
    } = useQuery<Paginated<AvailableLead>, Error>({
        queryKey: ['availableLeads', page],
        queryFn: () => leadsService.getAvailableLeads({ page, ordering: '-created_at' }),
        enabled: tab === 'new',
        staleTime: 60000, 
    });

    // --- Data Fetching for My Leads ---
    const { 
        data: myLeads, 
        isLoading: isLoadingMy,
        isFetching: isFetchingMy,
        error: myLeadsError,
    } = useQuery<Paginated<MyLead>, Error>({
        queryKey: ['myLeads', page, statusFilter],
        queryFn: () => {
            const params: Record<string, any> = { page };
            if (statusFilter && statusFilter !== '') {
                params.status = statusFilter;
            }
            // console.log('Fetching myLeads with params:', params);
            return leadsService.getMyLeads(params);
        },
        enabled: tab === 'my',
        placeholderData: (prevData) => prevData,
    });

    const isLoading = isLoadingAvailable || isLoadingMy;
    const isFetching = isFetchingAvailable || isFetchingMy;
    const error = tab === 'new' ? availableLeadsError : myLeadsError;

    const currentData = tab === 'new' ? availableLeads : myLeads;

    // Enhanced logging
    // console.log('=== DEBUG INFO ===');
    // console.log('Current tab:', tab);
    // console.log('Status filter:', statusFilter);
    // console.log('Is loading:', isLoading);
    // console.log('Current data:', currentData);
    // console.log('==================');

    // Determine the actual data structure
    let leadsArray: (AvailableLead | MyLead)[] = [];
    let totalCount = 0;
    let hasNext = false;
    let hasPrevious = false;

    if (currentData) {
        if (Array.isArray(currentData)) {
            leadsArray = currentData;
            totalCount = currentData.length;
        } else if (currentData.results && Array.isArray(currentData.results)) {
            leadsArray = currentData.results;
            totalCount = currentData.count || 0;
            hasNext = !!currentData.next;
            hasPrevious = !!currentData.previous;
        }
    }

    // console.log('Processed leadsArray length:', leadsArray.length);

    // Filter options - Match backend LeadStatus choices
    const leadStatusOptions = [
        { value: '', label: 'All Statuses' },
        { value: LeadStatus.PARTNER_ASSIGNED, label: 'Partner Assigned' },
        { value: LeadStatus.EN_ROUTE, label: 'En Route' },
        { value: LeadStatus.CHECKED_IN, label: 'Checked In' },
        { value: LeadStatus.INSPECTING, label: 'Inspecting' },
        { value: LeadStatus.OFFER_MADE, label: 'Offer Made' },
        { value: LeadStatus.NEGOTIATING, label: 'Negotiating' },
        { value: LeadStatus.ACCEPTED, label: 'Accepted' },
        { value: LeadStatus.PAYMENT_PROCESSING, label: 'Payment Processing' },
        { value: LeadStatus.COMPLETED, label: 'Completed' },
        { value: LeadStatus.CANCELLED, label: 'Cancelled' },
    ];

    // Calculate tab counts
    const availableCount = Array.isArray(availableLeads) 
        ? availableLeads.length 
        : (availableLeads?.count ?? 0);
    const myLeadsCount = Array.isArray(myLeads) 
        ? myLeads.length 
        : (myLeads?.count ?? 0);

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            
            {/* --- Page Header --- */}
            <h2 
                className="text-3xl font-extrabold mb-6"
                style={{ color: COLORS.brandBlack }}
            >
                Partner Lead Management
            </h2>
            
            {/* --- Tab Navigation --- */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => navigate('/partner/leads/new')}
                    className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                        tab === 'new' 
                            ? 'border-b-2 text-gray-900' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ 
                        borderBottomColor: tab === 'new' ? COLORS.brandYellow : 'transparent',
                        color: tab === 'new' ? COLORS.brandBlack : undefined
                    }}
                >
                    <Package className="w-4 h-4 inline mr-2" />
                    New Leads ({availableCount}) 
                </button>
                <button
                    onClick={() => navigate('/partner/leads/my')}
                    className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                        tab === 'my' 
                            ? 'border-b-2 text-gray-900' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ 
                        borderBottomColor: tab === 'my' ? COLORS.brandYellow : 'transparent',
                        color: tab === 'my' ? COLORS.brandBlack : undefined
                    }}
                >
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                    My Leads ({myLeadsCount})
                </button>
            </div>

            {/* --- Filter & Sorting (Only for My Leads) --- */}
            {tab === 'my' && (
                <div 
                    className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-lg border"
                    style={{ backgroundColor: COLORS.greyLight }}
                >
                    <Filter className="w-5 h-5 text-gray-500" />
                    <div className="flex items-center gap-2">
                        <label 
                            htmlFor="status-filter" 
                            className="text-sm font-medium text-gray-700"
                        >
                            Filter by Status:
                        </label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => {
                                // console.log('Filter changed to:', e.target.value);
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2"
                            style={{ 
                                '--tw-ring-color': COLORS.brandYellow 
                            } as React.CSSProperties}
                        >
                            {leadStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {statusFilter && (
                        <button
                            onClick={() => {
                                setStatusFilter('');
                                setPage(1);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
            )}

            {/* --- Error State --- */}
            {error && (
                <div 
                    className="flex items-center gap-3 p-4 rounded-lg mb-6"
                    style={{ backgroundColor: '#FEE2E2' }}
                >
                    <AlertCircle className="w-5 h-5" style={{ color: COLORS.brandRed }} />
                    <span className="text-sm" style={{ color: COLORS.brandRed }}>
                        Error loading leads: {error.message}
                    </span>
                </div>
            )}

            {/* --- Loading State --- */}
            {(isLoading || (isFetching && leadsArray.length === 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <LeadCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* --- Content Display --- */}
            {!isLoading && !error && (
                <>
                    {leadsArray.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 text-lg">
                                {tab === 'new' 
                                    ? 'No new leads available in your area right now.'
                                    : statusFilter 
                                        ? `No leads found with status: ${leadStatusOptions.find(opt => opt.value === statusFilter)?.label}`
                                        : 'You have no leads yet. Start by claiming available leads!'
                                }
                            </p>
                            {tab === 'my' && (
                                <button
                                    onClick={() => navigate('/partner/leads/new')}
                                    className="mt-4 px-6 py-2 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
                                    style={{ 
                                        backgroundColor: COLORS.brandYellow, 
                                        color: COLORS.brandBlack 
                                    }}
                                >
                                    Browse Available Leads
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leadsArray.map((lead: AvailableLead | MyLead) => {
                                return tab === 'new' 
                                    ? <AvailableLeadCard key={lead.id} lead={lead as AvailableLead} /> 
                                    : <MyLeadCard key={lead.id} lead={lead as MyLead} />;
                            })}
                        </div>
                    )}
                </>
            )}

            {/* --- Fetching Indicator --- */}
            {isFetching && leadsArray.length > 0 && (
                <div className="flex justify-center items-center mt-4">
                    <Loader2 
                        className="animate-spin w-5 h-5 mr-2" 
                        style={{ color: COLORS.brandYellow }} 
                    />
                    <span className="text-sm text-gray-500">Updating...</span>
                </div>
            )}

            {/* --- Pagination Controls --- */}
            {!isLoading && leadsArray.length > 0 && !Array.isArray(currentData) && (
                <div className="flex justify-center items-center mt-8 gap-4">
                    <button
                        onClick={() => setPage(prev => prev - 1)}
                        disabled={!hasPrevious} 
                        className="p-2 border rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        style={{ 
                            color: COLORS.brandBlack,
                            borderColor: hasPrevious ? COLORS.brandBlack : '#D1D5DB'
                        }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Page <strong>{page}</strong>
                    </span>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={!hasNext}
                        className="p-2 border rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        style={{ 
                            color: COLORS.brandBlack,
                            borderColor: hasNext ? COLORS.brandBlack : '#D1D5DB'
                        }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-gray-500 ml-2">
                        (Total: {totalCount} lead{totalCount !== 1 ? 's' : ''})
                    </span>
                </div>
            )}
        </div>
    );
};