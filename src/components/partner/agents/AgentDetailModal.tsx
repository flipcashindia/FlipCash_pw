// src/components/partner/agents/AgentDetailModal.tsx
// Modal showing detailed agent information
// Used in: AgentsPage when clicking "View Details"
// Uses correct field names from agent.types.ts matching backend serializers

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Clock,
  BadgeCheck,
  Shield,
  Activity,
  Package,
  ExternalLink,
} from 'lucide-react';
import type { AgentProfile, AgentListItem, AgentStatus } from '../../../api/types/agent.type';

interface AgentDetailModalProps {
  isOpen: boolean;
  agent: AgentListItem | AgentProfile | null;
  onClose: () => void;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ isOpen, agent, onClose }) => {
  if (!isOpen || !agent) return null;

  // Helper to get name - handles both flat (AgentListItem) and nested (AgentProfile) formats
  const getName = () => {
    if ('user_name' in agent) return agent.user_name;
    if ('user' in agent && agent.user) return agent.user.name;
    return 'Agent';
  };

  // Helper to get phone - handles both formats
  const getPhone = () => {
    if ('user_phone' in agent) return agent.user_phone;
    if ('user' in agent && agent.user) return agent.user.phone;
    return '';
  };

  // Helper to get email - only available in full profile
  const getEmail = () => {
    if ('user' in agent && agent.user) return agent.user.email;
    return undefined;
  };

  const name = getName();
  const phone = getPhone();
  const email = getEmail();

  const getStatusBadge = (status: AgentStatus) => {
    const badges: Record<AgentStatus, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      active: { 
        bg: 'bg-[#1B8A05]/10', 
        text: 'text-[#1B8A05]', 
        icon: <CheckCircle size={16} />,
        label: 'Active'
      },
      inactive: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-600', 
        icon: <XCircle size={16} />,
        label: 'Inactive'
      },
      suspended: { 
        bg: 'bg-[#FF0000]/10', 
        text: 'text-[#FF0000]', 
        icon: <AlertCircle size={16} />,
        label: 'Suspended'
      },
      pending: { 
        bg: 'bg-[#FEC925]/20', 
        text: 'text-[#b48f00]', 
        icon: <Clock size={16} />,
        label: 'Pending'
      },
    };
    return badges[status] || badges.inactive;
  };

  const getVerificationBadge = (status: 'pending' | 'verified' | 'rejected') => {
    const badges = {
      verified: { bg: 'bg-[#1B8A05]/10', text: 'text-[#1B8A05]', icon: <Shield size={14} />, label: 'Verified' },
      pending: { bg: 'bg-[#FEC925]/20', text: 'text-[#b48f00]', icon: <Clock size={14} />, label: 'Pending Verification' },
      rejected: { bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', icon: <XCircle size={14} />, label: 'Verification Rejected' },
    };
    return badges[status] || badges.pending;
  };

  const statusBadge = getStatusBadge(agent.status);
  const verificationBadge = getVerificationBadge(agent.verification_status);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRating = (rating: string | null): string => {
    if (!rating) return 'N/A';
    const num = parseFloat(rating);
    return isNaN(num) ? 'N/A' : num.toFixed(1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1C1C1B] to-[#333] p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#FEC925]/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#FEC925]">
                    {name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                    
                    {/* Availability Badge */}
                    {agent.is_available && agent.status === 'active' && (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                        Available
                      </span>
                    )}
                  </div>
                  
                  {/* Verification Badge */}
                  <div className="mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 w-fit ${verificationBadge.bg} ${verificationBadge.text}`}>
                      {verificationBadge.icon}
                      {verificationBadge.label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Contact Info */}
            <div className="mb-6">
              <h4 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
                <User className="text-[#FEC925]" size={18} />
                Contact Information
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Phone size={16} />
                    Phone
                  </span>
                  <a href={`tel:+91${phone}`} className="font-semibold text-[#1B8A05] hover:underline">
                    +91 {phone}
                  </a>
                </div>
                {email && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </span>
                    <span className="font-semibold text-[#1C1C1B]">{email}</span>
                  </div>
                )}
                {agent.employee_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <BadgeCheck size={16} />
                      Employee Code
                    </span>
                    <span className="font-semibold text-[#1C1C1B]">{agent.employee_code}</span>
                  </div>
                )}
                {'masked_aadhaar' in agent && agent.masked_aadhaar && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Shield size={16} />
                      Aadhaar
                    </span>
                    <span className="font-mono text-[#1C1C1B]">{agent.masked_aadhaar}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mb-6">
              <h4 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
                <TrendingUp className="text-[#FEC925]" size={18} />
                Performance
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1B8A05]/10 p-4 rounded-xl text-center">
                  <Package className="text-[#1B8A05] mx-auto mb-1" size={20} />
                  <p className="text-2xl font-bold text-[#1B8A05]">{agent.total_leads_completed || 0}</p>
                  <p className="text-sm text-gray-600">Leads Completed</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-xl text-center">
                  <Activity className="text-blue-700 mx-auto mb-1" size={20} />
                  <p className="text-2xl font-bold text-blue-700">
                    {'total_visits_completed' in agent ? agent.total_visits_completed : agent.total_leads_completed || 0}
                  </p>
                  <p className="text-sm text-gray-600">Visits Completed</p>
                </div>
                <div className="bg-[#FEC925]/20 p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="text-[#FEC925]" size={20} fill="#FEC925" />
                  </div>
                  <p className="text-2xl font-bold text-[#1C1C1B]">
                    {formatRating(agent.average_rating)}
                  </p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-xl text-center">
                  <Clock className="text-purple-700 mx-auto mb-1" size={20} />
                  <p className="text-2xl font-bold text-purple-700">
                    {agent.current_assigned_leads_count || 0}
                  </p>
                  <p className="text-sm text-gray-600">Active Now</p>
                </div>
              </div>
            </div>

            {/* Capacity Info - Only show if max_concurrent_leads is available */}
            {'max_concurrent_leads' in agent && (
              <div className="mb-6">
                <h4 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
                  <Activity className="text-[#FEC925]" size={18} />
                  Capacity
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Max Concurrent Leads</span>
                    <span className="font-bold text-[#1C1C1B]">{agent.max_concurrent_leads}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Currently Assigned</span>
                    <span className="font-bold text-[#1C1C1B]">
                      {agent.current_assigned_leads_count || 0}
                    </span>
                  </div>
                  {'can_accept_leads' in agent && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Can Accept Leads</span>
                      <span className={`font-semibold ${agent.can_accept_leads ? 'text-[#1B8A05]' : 'text-[#FF0000]'}`}>
                        {agent.can_accept_leads ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  
                  {/* Capacity Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Capacity Used</span>
                      <span>
                        {agent.current_assigned_leads_count || 0}/{agent.max_concurrent_leads}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          ((agent.current_assigned_leads_count || 0) / agent.max_concurrent_leads) >= 1
                            ? 'bg-[#FF0000]'
                            : ((agent.current_assigned_leads_count || 0) / agent.max_concurrent_leads) >= 0.8
                              ? 'bg-[#FEC925]'
                              : 'bg-[#1B8A05]'
                        }`}
                        style={{ 
                          width: `${Math.min(((agent.current_assigned_leads_count || 0) / agent.max_concurrent_leads) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {'last_known_latitude' in agent && 'last_known_longitude' in agent && 
             agent.last_known_latitude && agent.last_known_longitude && (
              <div className="mb-6">
                <h4 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
                  <MapPin className="text-[#FEC925]" size={18} />
                  Last Known Location
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Coordinates</span>
                    <span className="font-mono text-sm">
                      {parseFloat(agent.last_known_latitude).toFixed(6)}, {parseFloat(agent.last_known_longitude).toFixed(6)}
                    </span>
                  </div>
                  {'last_location_update' in agent && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-sm">{formatDate(agent.last_location_update)}</span>
                    </div>
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${agent.last_known_latitude},${agent.last_known_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-semibold hover:bg-[#e5b520] transition text-sm"
                  >
                    <MapPin size={16} />
                    View on Map
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}

            {/* Notes */}
            {'notes' in agent && agent.notes && (
              <div className="mb-6">
                <h4 className="font-bold text-[#1C1C1B] mb-3">Notes</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-700">{agent.notes}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
                <Calendar className="text-[#FEC925]" size={18} />
                Timeline
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-semibold">{formatDate(agent.created_at)}</span>
                </div>
                {'updated_at' in agent && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-semibold">{formatDate(agent.updated_at)}</span>
                  </div>
                )}
                {'verified_at' in agent && agent.verified_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Verified At</span>
                    <span className="font-semibold text-[#1B8A05]">{formatDate(agent.verified_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-100 text-[#1C1C1B] rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AgentDetailModal;