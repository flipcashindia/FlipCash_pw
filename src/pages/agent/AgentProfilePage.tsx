// src/pages/agent/AgentProfilePage.tsx
// Agent Profile - View and manage agent profile

import React from 'react';
// import { motion } from 'framer-motion';
import {
  // User,
  Phone,
  Mail,
  BadgeCheck,
  Star,
  Clock,
  CheckCircle2,
  // MapPin,
  Calendar,
  Shield,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  Building2,
  // Award,
  TrendingUp,
} from 'lucide-react';
import { useAgentProfile, useUpdateAvailability } from '../../hooks/useAgentApp';

// FlipCash Colors
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
// };

const AgentProfilePage: React.FC = () => {
  const { data: profile, isLoading, error } = useAgentProfile();
  const updateAvailabilityMutation = useUpdateAvailability();

  const handleToggleAvailability = async () => {
    if (profile) {
      try {
        await updateAvailabilityMutation.mutateAsync(!profile.is_available);
      } catch (err) {
        // console.error('Failed to update availability:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#FEC925]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="text-lg font-semibold text-gray-900">Failed to load profile</p>
        <p className="text-gray-500">{(error as Error)?.message || 'Please try again'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1B]">My Profile</h1>
        <p className="text-gray-500">Manage your agent profile and settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#1C1C1B] to-[#2d2d2c] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-[#FEC925]/20 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-[#FEC925]">
              {profile.user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile.user?.name || 'Agent'}</h2>
            <p className="text-white/70">{profile.employee_code || 'No Employee Code'}</p>
            <div className="flex items-center gap-2 mt-2">
              <VerificationBadge status={profile.verification_status} />
              <StatusBadge status={profile.status} />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 size={18} className="text-[#FEC925]" />
              <span className="text-xl font-bold">{profile.total_leads_completed || 0}</span>
            </div>
            <p className="text-xs text-white/70">Completed</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={18} className="text-[#FEC925]" fill="#FEC925" />
              <span className="text-xl font-bold">
                {profile.average_rating ? parseFloat(profile.average_rating).toFixed(1) : '-'}
              </span>
            </div>
            <p className="text-xs text-white/70">Rating</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={18} className="text-[#FEC925]" />
              <span className="text-xl font-bold">{profile.current_assigned_leads_count || 0}</span>
            </div>
            <p className="text-xs text-white/70">Active</p>
          </div>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              profile.is_available ? 'bg-[#1B8A05]/20' : 'bg-gray-100'
            }`}>
              {profile.is_available ? (
                <CheckCircle2 className="text-[#1B8A05]" size={24} />
              ) : (
                <Clock className="text-gray-400" size={24} />
              )}
            </div>
            <div>
              <p className="font-semibold text-[#1C1C1B]">Availability Status</p>
              <p className="text-sm text-gray-500">
                {profile.is_available ? 'You can receive new leads' : 'You will not receive new leads'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={updateAvailabilityMutation.isPending}
            className={`p-2 rounded-lg transition ${
              profile.is_available
                ? 'bg-[#1B8A05]/20 text-[#1B8A05]'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {updateAvailabilityMutation.isPending ? (
              <Loader2 className="animate-spin" size={28} />
            ) : profile.is_available ? (
              <ToggleRight size={28} />
            ) : (
              <ToggleLeft size={28} />
            )}
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        <h3 className="font-bold text-[#1C1C1B]">Contact Information</h3>
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#FEC925]/20 rounded-full flex items-center justify-center">
            <Phone className="text-[#FEC925]" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-semibold text-[#1C1C1B]">{profile.user?.phone}</p>
          </div>
        </div>

        {profile.user?.email && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-[#1C1C1B]">{profile.user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Partner Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        <h3 className="font-bold text-[#1C1C1B]">Organization</h3>
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Building2 className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Partner</p>
            <p className="font-semibold text-[#1C1C1B]">{profile.partner_name || 'N/A'}</p>
          </div>
        </div>

        {profile.employee_code && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <BadgeCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Employee Code</p>
              <p className="font-semibold text-[#1C1C1B]">{profile.employee_code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        <h3 className="font-bold text-[#1C1C1B]">Performance</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1B8A05]/10 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="text-[#1B8A05]" size={24} />
            </div>
            <p className="text-2xl font-bold text-[#1C1C1B]">
              {profile.total_leads_completed || 0}
            </p>
            <p className="text-sm text-gray-500">Total Completed</p>
          </div>
          <div className="bg-[#FEC925]/10 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="text-[#FEC925]" size={24} fill="#FEC925" />
            </div>
            <p className="text-2xl font-bold text-[#1C1C1B]">
              {profile.average_rating ? parseFloat(profile.average_rating).toFixed(1) : '-'}
            </p>
            <p className="text-sm text-gray-500">Average Rating</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Max Concurrent Leads</span>
            <span className="font-semibold">{profile.max_concurrent_leads}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Currently Assigned</span>
            <span className="font-semibold">{profile.current_assigned_leads_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        <h3 className="font-bold text-[#1C1C1B]">Account</h3>
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="text-gray-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-semibold text-[#1C1C1B]">
              {new Date(profile.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const VerificationBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    verified: {
      bg: 'bg-[#1B8A05]/20',
      text: 'text-[#1B8A05]',
      icon: Shield,
      label: 'Verified',
    },
    pending: {
      bg: 'bg-[#FEC925]/20',
      text: 'text-[#b48f00]',
      icon: Clock,
      label: 'Pending',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: AlertCircle,
      label: 'Rejected',
    },
  };

  const { bg, text, icon: Icon, label } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string }> = {
    active: { bg: 'bg-[#1B8A05]/20', text: 'text-[#1B8A05]' },
    inactive: { bg: 'bg-gray-200', text: 'text-gray-600' },
    suspended: { bg: 'bg-red-100', text: 'text-red-700' },
    pending: { bg: 'bg-[#FEC925]/20', text: 'text-[#b48f00]' },
  };

  const { bg, text } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${bg} ${text}`}>
      {status}
    </span>
  );
};

export default AgentProfilePage;


