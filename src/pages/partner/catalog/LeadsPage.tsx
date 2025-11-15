// src/pages/partner/catalog/LeadsPage.tsx
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  MapPin,
  Calendar,
  IndianRupee,
  AlertTriangle,
  Flag,
  Filter,
} from 'lucide-react';
import {
  catalogService,
  type Lead,
  type Category,
  type Brand,
  type Model,
} from '../../../api/services/catalogService';

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const location = useLocation();
  const category = location.state?.category as Category | undefined;
  const brand = location.state?.brand as Brand | undefined;
  const model = location.state?.model as Model | undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['catalog', 'leads', modelId],
    queryFn: () => catalogService.getLeads(modelId!),
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredLeads = data?.results.filter((lead) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      lead.device.model_name.toLowerCase().includes(search) ||
      lead.location.city.toLowerCase().includes(search) ||
      lead.location.postal_code.includes(search);

    const matchesUrgent = !showUrgentOnly || lead.priority.is_urgent;

    return matchesSearch && matchesUrgent;
  });

  const handleSelectLead = (lead: Lead) => {
    navigate(`/partner/catalog/leads/${lead.id}`, {
      state: { category, brand, model, lead },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-yellow-500 mb-4" />
        <p className="text-gray-600">Loading leads...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Leads</h3>
        <p className="text-gray-600 text-center mb-6">
          {error instanceof Error ? error.message : 'Failed to load leads'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm flex-wrap">
        <Link to="/partner/catalog" className="text-gray-500 hover:text-gray-700 transition-colors">
          Categories
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <Link
          to={`/partner/catalog/categories/${category?.id}/brands`}
          state={{ category }}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {category?.name}
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <Link
          to={`/partner/catalog/brands/${brand?.id}/models`}
          state={{ category, brand }}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {brand?.name}
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">{model?.name || 'Leads'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{model?.name || 'Available Leads'}</h1>
              <p className="text-gray-600 mt-1">Click on a lead to view full details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by city, pincode, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowUrgentOnly(!showUrgentOnly)}
          className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
            showUrgentOnly
              ? 'bg-red-500 text-white'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <Filter size={20} />
          <span>Urgent Only</span>
        </button>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredLeads?.length || 0}</span> of{' '}
          <span className="font-semibold">{data?.results.length || 0}</span> leads
        </p>
      </div>

      {/* Leads List */}
      {filteredLeads && filteredLeads.length > 0 ? (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => handleSelectLead(lead)}
              className="group w-full bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-6">
                {/* Image */}
                <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-gray-50 overflow-hidden">
                  <img
                    src={lead.device.image}
                    alt={lead.device.model_name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/96x96/f5f5f5/cccccc?text=?';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-yellow-700 transition-colors">
                        {lead.device.model_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {lead.device.storage} • {lead.device.ram} • {lead.device.color}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center text-2xl font-bold text-gray-900">
                        <IndianRupee size={20} />
                        <span>{parseFloat(lead.pricing.estimated_price).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-xs text-gray-500">Est. Price</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lead.priority.is_urgent && (
                      <div className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                        <AlertTriangle size={14} />
                        <span>Urgent</span>
                      </div>
                    )}
                    {lead.priority.is_flagged && (
                      <div className="flex items-center space-x-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
                        <Flag size={14} />
                        <span>Flagged</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <MapPin size={14} />
                      <span>
                        {lead.location.city}, {lead.location.postal_code}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                      <Calendar size={14} />
                      <span>{lead.schedule.preferred_date}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Lead ID: <span className="font-mono">{lead.lead_number}</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg group-hover:bg-yellow-500 transition-colors">
                      <span>View Details</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Package size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Leads Found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search' : 'No leads available for this model'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;