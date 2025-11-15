// src/pages/partner/catalog/LeadDetailPage.tsx
import React from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Calendar,
  IndianRupee,
  AlertTriangle,
  Flag,
  Lock,
  User,
  Phone,
  Clock,
  Package as PackageIcon,
} from 'lucide-react';
import {
  catalogService,
  type Category,
  type Brand,
  type Model,
  // type Lead,
} from '../../../api/services/catalogService';

const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();
  const location = useLocation();
  const category = location.state?.category as Category | undefined;
  const brand = location.state?.brand as Brand | undefined;
  const model = location.state?.model as Model | undefined;
  // const leadPreview = location.state?.lead as Lead | undefined;

  const { data: lead, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['catalog', 'leadDetail', leadId],
    queryFn: () => catalogService.getLeadDetail(leadId!),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleClaim = () => {
    // Navigate to claim flow (to be implemented)
    alert('Claim functionality will be implemented next. Lead ID: ' + lead?.id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-yellow-500 mb-4" />
        <p className="text-gray-600">Loading lead details...</p>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Lead Details</h3>
        <p className="text-gray-600 text-center mb-6">
          {error instanceof Error ? error.message : 'Failed to load lead details'}
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
    <div className="space-y-6 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm flex-wrap">
        <Link to="/partner/catalog" className="text-gray-500 hover:text-gray-700">
          Categories
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <Link
          to={`/partner/catalog/categories/${category?.id}/brands`}
          state={{ category }}
          className="text-gray-500 hover:text-gray-700"
        >
          {category?.name}
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <Link
          to={`/partner/catalog/brands/${brand?.id}/models`}
          state={{ category, brand }}
          className="text-gray-500 hover:text-gray-700"
        >
          {brand?.name}
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <Link
          to={`/partner/catalog/models/${model?.id}/leads`}
          state={{ category, brand, model }}
          className="text-gray-500 hover:text-gray-700"
        >
          {model?.name}
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Lead Details</span>
      </div>

      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Preview</h1>
          <p className="text-gray-600 mt-1">Review details before claiming</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Device Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start gap-6">
              {/* Image Gallery */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-xl bg-gray-50 overflow-hidden mb-3">
                  <img
                    src={
                      lead.device.images.find((i) => i.is_primary)?.image ||
                      lead.device.images[0]?.image
                    }
                    alt={lead.device.model_name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/160x160/f5f5f5/cccccc?text=?';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                {lead.device.images.length > 1 && (
                  <div className="flex gap-2">
                    {lead.device.images.slice(1, 4).map((img) => (
                      <div key={img.id} className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden">
                        <img
                          src={img.image}
                          alt="Device"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Device Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {lead.device.model_name}
                    </h2>
                    <p className="text-gray-600">
                      {lead.device.brand_name} • {lead.device.category_name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
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
                  </div>
                </div>

                {/* Price */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 rounded-xl mb-4">
                  <IndianRupee size={28} className="text-green-700" />
                  <div>
                    <div className="text-3xl font-bold text-green-700">
                      {parseFloat(lead.pricing.estimated_price).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-green-600">Estimated Price</div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Storage</div>
                    <div className="font-semibold text-gray-900">{lead.device.storage}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">RAM</div>
                    <div className="font-semibold text-gray-900">{lead.device.ram}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Color</div>
                    <div className="font-semibold text-gray-900">{lead.device.color}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Launch Year</div>
                    <div className="font-semibold text-gray-900">{lead.device.launch_year}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {lead.condition.customer_notes && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-1">Customer Notes:</div>
                <div className="text-sm text-blue-700">{lead.condition.customer_notes}</div>
              </div>
            )}
          </div>

          {/* Customer Info (Masked) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle size={20} className="text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Information (Masked)
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User size={18} />
                  <span>Customer Name</span>
                </div>
                <span className="font-medium text-gray-900">{lead.customer.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone size={18} />
                  <span>Phone Number</span>
                </div>
                <span className="font-medium text-gray-900">{lead.customer.phone}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <Lock size={18} className="text-yellow-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Full contact details and address will be revealed after claiming the lead
              </p>
            </div>
          </div>

          {/* Location Info (Partial) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pickup Location (Partial)</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">City</span>
                <span className="font-medium text-gray-900">{lead.pickup.address.city}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">State</span>
                <span className="font-medium text-gray-900">{lead.pickup.address.state}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Pincode</span>
                <span className="font-medium text-gray-900">{lead.pickup.address.postal_code}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <Lock size={18} className="text-yellow-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Complete address with landmarks will be revealed after claiming
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Pickup & Actions */}
        <div className="space-y-6">
          {/* Pickup Schedule */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pickup Schedule</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Preferred Date</div>
                <div className="font-semibold text-green-900 text-lg">
                  {lead.pickup.preferred_date}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Time Slot</div>
                <div className="font-semibold text-green-900 text-lg flex items-center space-x-2">
                  <Clock size={18} />
                  <span>{lead.pickup.preferred_time_slot}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Fee Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <IndianRupee size={20} className="text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Claim Fee</h3>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-700 mb-1">
                  ₹{parseFloat(lead.pricing.claim_fee).toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-yellow-600">Will be deducted from wallet</div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Claiming unlocks full customer details and address
              </p>
              <p className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                You'll have exclusive access to contact the customer
              </p>
              <p className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Lead expires after 48 hours if not claimed
              </p>
            </div>
          </div>

          {/* Lead Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <PackageIcon size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lead Status</h3>
            </div>

            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                lead.can_claim
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {lead.can_claim ? '✓ Available to Claim' : '✗ Not Available'}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Lead ID: <span className="font-mono">{lead.lead_number}</span>
            </div>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={!lead.can_claim}
            className="w-full py-4 bg-yellow-400 text-black font-bold text-lg rounded-xl hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {lead.can_claim ? 'Claim This Lead →' : 'Lead Not Available'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;