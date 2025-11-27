// src/components/partner/agents/AgentDetailModal.tsx
// Modal showing detailed agent information

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
  // Activity,
  TrendingUp,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import type { AgentProfile, AgentStatus } from '../../../api/types/agent.type';

interface AgentDetailModalProps {
  isOpen: boolean;
  agent: AgentProfile | null;
  onClose: () => void;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ isOpen, agent, onClose }) => {
  if (!isOpen || !agent) return null;

  const getStatusBadge = (status: AgentStatus) => {
    const badges: Record<AgentStatus, { bg: string; text: string; icon: React.ReactNode }> = {
      active: { bg: 'bg-[#1B8A05]/10', text: 'text-[#1B8A05]', icon: <CheckCircle size={16} /> },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <XCircle size={16} /> },
      suspended: { bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', icon: <AlertCircle size={16} /> },
      pending: { bg: 'bg-[#FEC925]/20', text: 'text-[#b48f00]', icon: <Clock size={16} /> },
    };
    return badges[status] || badges.inactive;
  };

  const statusBadge = getStatusBadge(agent.status);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                    {agent.user.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{agent.user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.icon}
                      {agent.status}
                    </span>
                    {agent.is_available && agent.status === 'active' && (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                        Available
                      </span>
                    )}
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
                  <a href={`tel:${agent.user.phone}`} className="font-semibold text-[#1B8A05] hover:underline">
                    +91 {agent.user.phone}
                  </a>
                </div>
                {agent.user.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </span>
                    <span className="font-semibold text-[#1C1C1B]">{agent.user.email}</span>
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
                  <p className="text-2xl font-bold text-[#1B8A05]">{agent.total_visits_completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="bg-[#FF0000]/10 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#FF0000]">{agent.total_visits_cancelled}</p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
                <div className="bg-[#FEC925]/20 p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="text-[#FEC925]" size={20} fill="#FEC925" />
                    <span className="text-2xl font-bold text-[#1C1C1B]">
                      {agent.average_rating ? parseFloat(agent.average_rating).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Rating ({agent.total_ratings} reviews)</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-700">{agent.active_assignments_count || 0}</p>
                  <p className="text-sm text-gray-600">Active Now</p>
                </div>
              </div>
            </div>

            {/* Location */}
            {agent.last_known_latitude && agent.last_known_longitude && (
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
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-sm">{formatDate(agent.last_location_update)}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${agent.last_known_latitude},${agent.last_known_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-semibold hover:bg-[#e5b520] transition text-sm"
                  >
                    <MapPin size={16} />
                    View on Map
                  </a>
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
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold">{formatDate(agent.updated_at)}</span>
                </div>
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