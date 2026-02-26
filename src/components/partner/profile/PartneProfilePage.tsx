// src/pages/partner/profile/PartnerProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePartnerStore } from '../../../stores/usePartnerStore';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import {
  Loader2, Save, User, Briefcase, TrendingUp,
  Star, CheckCircle, BarChart2, ToggleLeft, ToggleRight,
  AlertCircle, Shield
} from 'lucide-react';
import { type PartnerUpdatePayload } from '../../../api/types/api';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const configs: Record<string, { color: string; label: string }> = {
    approved:     { color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Approved' },
    pending:      { color: 'bg-amber-100 text-amber-700 border border-amber-200',      label: 'Pending Review' },
    under_review: { color: 'bg-blue-100 text-blue-700 border border-blue-200',         label: 'Under Review' },
    suspended:    { color: 'bg-red-100 text-red-700 border border-red-200',            label: 'Suspended' },
    rejected:     { color: 'bg-red-100 text-red-700 border border-red-200',            label: 'Rejected' },
    individual:   { color: 'bg-gray-100 text-gray-700 border border-gray-200',         label: 'Individual' },
  };
  const cfg = configs[status] || configs.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; accent: string }> = ({
  label, value, icon, accent,
}) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200`}>
    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10 ${accent}`} />
    <div className={`inline-flex p-2.5 rounded-xl mb-3 ${accent} bg-opacity-10`}>
      {icon}
    </div>
    <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
    <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
  </div>
);

// const ProfileCompletionBar: React.FC<{ percentage: number }> = ({ percentage }) => {
//   const color = percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-400' : 'bg-red-400';
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-2">
//         <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
//         <span className={`text-sm font-bold ${percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
//           {percentage}%
//         </span>
//       </div>
//       <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//         <div
//           className={`h-2.5 rounded-full transition-all duration-700 ${color}`}
//           style={{ width: `${percentage}%` }}
//         />
//       </div>
//       {percentage < 80 && (
//         <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
//           <AlertCircle size={12} /> Complete profile to receive leads
//         </p>
//       )}
//     </div>
//   );
// };

export const PartnerProfilePage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { partner, refetchPartner, isLoading } = usePartnerStore();

  const [formData, setFormData] = useState({
    business_name: '',
    service_radius_km: 10.0,
    price_range_min: 1000.0,
    price_range_max: 50000.0,
  });

  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (partner) {
      setFormData({
        business_name: partner.business_name || '',
        service_radius_km: parseFloat(partner.service_radius_km),
        price_range_min: parseFloat(partner.price_range_min),
        price_range_max: parseFloat(partner.price_range_max),
      });
      setIsAvailable(partner.is_available);
    }
  }, [partner]);

  const profileMutation = useMutation({
    mutationFn: (payload: PartnerUpdatePayload) => partnerService.updateMe(payload),
    onSuccess: (data) => {
      refetchPartner();
      queryClient.invalidateQueries({ queryKey: ['partnerProfile', data.id] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.response?.data?.price_range_min?.[0] || 'Profile update failed.');
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: (val: boolean) => partnerService.setAvailability(val),
    onSuccess: (_, val) => {
      setIsAvailable(val);
      refetchPartner();
      toast.success(`You are now ${val ? 'available' : 'unavailable'} for leads.`);
    },
    onError: () => toast.error('Failed to update availability.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.price_range_min > formData.price_range_max) {
      toast.error('Min price cannot be greater than max price.');
      return;
    }
    profileMutation.mutate({
      business_name: formData.business_name,
      service_radius_km: Number(formData.service_radius_km),
      price_range_min: Number(formData.price_range_min),
      price_range_max: Number(formData.price_range_max),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  const completionPct = partner?.profile_completion_percentage ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Header Card ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-6 md:p-8 shadow-xl">
        {/* Decorative yellow blob */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#FEC925] rounded-full blur-3xl opacity-20" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FEC925] flex items-center justify-center shadow-lg flex-shrink-0">
              <User size={30} className="text-[#1a1a1a]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white leading-tight">
                {partner?.business_name || partner?.user?.name || 'Your Profile'}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{partner?.user?.phone}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {partner?.status && <StatusBadge status={partner.status} />}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isAvailable ? 'bg-emerald-900/50 text-emerald-400' : 'bg-gray-700 text-gray-400'} border border-current border-opacity-30`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
          {/* Availability Toggle */}
          <button
            onClick={() => availabilityMutation.mutate(!isAvailable)}
            disabled={availabilityMutation.isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex-shrink-0 ${
              isAvailable
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            } disabled:opacity-50`}
          >
            {availabilityMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isAvailable ? (
              <ToggleRight size={20} />
            ) : (
              <ToggleLeft size={20} />
            )}
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Profile Completion */}
        <div className="relative mt-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-200">Profile Completion</span>
            <span className={`text-sm font-bold ${completionPct >= 80 ? 'text-emerald-400' : completionPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {completionPct}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${completionPct >= 80 ? 'bg-emerald-400' : completionPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {completionPct < 80 && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <AlertCircle size={12} /> Complete your profile to start receiving leads
            </p>
          )}
        </div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Partner Score"
          value={partner?.partner_score ?? '0.00'}
          icon={<TrendingUp size={20} className="text-[#FEC925]" />}
          accent="bg-[#FEC925]"
        />
        <MetricCard
          label="Avg Rating"
          value={`${partner?.average_rating ?? '0.0'} ★`}
          icon={<Star size={20} className="text-amber-500" />}
          accent="bg-amber-500"
        />
        <MetricCard
          label="Completion Rate"
          value={`${partner?.completion_rate ?? 0}%`}
          icon={<CheckCircle size={20} className="text-emerald-500" />}
          accent="bg-emerald-500"
        />
        <MetricCard
          label="Leads Completed"
          value={partner?.total_leads_completed ?? 0}
          icon={<BarChart2 size={20} className="text-blue-500" />}
          accent="bg-blue-500"
        />
      </div>

      {/* ── Edit Form ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-[#FEC925]/10 rounded-xl">
            <Briefcase size={20} className="text-[#1a1a1a]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Business Details</h2>
            <p className="text-xs text-gray-500">Update your business information and service parameters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
            <input
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="e.g., Sharma Finance Services"
              className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FEC925] transition-colors"
            />
          </div>

          {/* Service Radius */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Radius
              <span className="ml-2 text-xs font-normal text-gray-500">(how far you travel for leads)</span>
            </label>
            <div className="relative">
              <input
                name="service_radius_km"
                type="number"
                step="1"
                min="1"
                max="50"
                value={formData.service_radius_km}
                onChange={handleChange}
                className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#FEC925] transition-colors pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">km</span>
            </div>
            <input
              type="range" min="1" max="50" step="1"
              value={formData.service_radius_km}
              onChange={(e) => setFormData(p => ({ ...p, service_radius_km: Number(e.target.value) }))}
              className="w-full mt-2 accent-[#FEC925]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>1 km</span><span>25 km</span><span>50 km</span>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Price Range
              <span className="ml-2 text-xs font-normal text-gray-500">(lead value you accept)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Minimum (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    name="price_range_min"
                    type="number"
                    step="100"
                    min="0"
                    value={formData.price_range_min}
                    onChange={handleChange}
                    className="w-full p-3.5 pl-8 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#FEC925] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Maximum (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    name="price_range_max"
                    type="number"
                    step="100"
                    min="0"
                    value={formData.price_range_max}
                    onChange={handleChange}
                    className="w-full p-3.5 pl-8 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#FEC925] transition-colors"
                  />
                </div>
              </div>
            </div>
            {Number(formData.price_range_min) > Number(formData.price_range_max) && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> Min price cannot exceed max price
              </p>
            )}
          </div>

          {/* Background Check Status */}
          {partner?.background_check_status && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Shield size={18} className={`flex-shrink-0 ${partner.background_check_status === 'verified' ? 'text-emerald-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-700">Background Check</p>
                <p className="text-xs text-gray-500 capitalize">{partner.background_check_status.replace('_', ' ')}</p>
              </div>
              <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                partner.background_check_status === 'verified'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {partner.background_check_status.replace('_', ' ')}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={profileMutation.isPending || Number(formData.price_range_min) > Number(formData.price_range_max)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-base shadow-md hover:shadow-lg hover:bg-[#f0bc1a] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profileMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};