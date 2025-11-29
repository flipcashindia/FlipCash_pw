// src/pages/agent/AgentActivityPage.tsx
// Agent Activity - View activity history and completed leads

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  MapPin,
  // Clock,
  Loader2,
  Package,
  IndianRupee,
  Calendar,
  ArrowRight,
  Star,
  // TrendingUp,
  // XCircle,
  Navigation,
  KeyRound,
  ClipboardCheck,
} from 'lucide-react';
import { useAgentAssignments, useAgentActivityLogs } from '../../hooks/useAgentApp';

// // FlipCash Colors
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
// };

const AgentActivityPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: completedData, isLoading: completedLoading } = useAgentAssignments({
    status: 'completed',
  });
  const { data: activityData, isLoading: activityLoading } = useAgentActivityLogs({
    limit: 20,
  });

  const completedLeads = completedData?.results || [];
  const activityLogs = activityData?.results || [];

  const isLoading = completedLoading || activityLoading;

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      status_change: Activity,
      location_update: MapPin,
      lead_accepted: CheckCircle2,
      lead_completed: Star,
      check_in: Navigation,
      inspection_started: ClipboardCheck,
      verification: KeyRound,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      status_change: 'bg-blue-100 text-blue-600',
      location_update: 'bg-purple-100 text-purple-600',
      lead_accepted: 'bg-[#FEC925]/20 text-[#b48f00]',
      lead_completed: 'bg-[#1B8A05]/20 text-[#1B8A05]',
      check_in: 'bg-green-100 text-green-600',
      inspection_started: 'bg-orange-100 text-orange-600',
      verification: 'bg-cyan-100 text-cyan-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#FEC925]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1B]">Activity</h1>
        <p className="text-gray-500">Your activity history and completed leads</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#1B8A05] to-[#156d04] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={24} />
            <span className="text-3xl font-bold">{completedLeads.length}</span>
          </div>
          <p className="text-white/80 text-sm">Completed Leads</p>
        </div>
        <div className="bg-gradient-to-br from-[#FEC925] to-[#e5b520] rounded-2xl p-4 text-[#1C1C1B]">
          <div className="flex items-center gap-3 mb-2">
            <IndianRupee size={24} />
            <span className="text-3xl font-bold">
              {completedLeads.reduce((sum, l) => sum + parseFloat(l.final_price || l.estimated_price || '0'), 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[#1C1C1B]/80 text-sm">Total Earnings</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEC925]/20 rounded-lg flex items-center justify-center">
              <Activity className="text-[#FEC925]" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[#1C1C1B]">Recent Activity</h2>
              <p className="text-sm text-gray-500">Your latest actions</p>
            </div>
          </div>
        </div>

        {activityLogs.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-semibold">No activity yet</p>
            <p className="text-sm text-gray-400">Your activity will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activityLogs.slice(0, 10).map((log, index) => {
              const Icon = getActivityIcon(log.activity_type);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(log.activity_type)}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1C1C1B] font-medium">
                      {log.description}
                    </p>
                    {log.lead_number && (
                      <p className="text-xs text-gray-500 mt-1">
                        Lead #{log.lead_number}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(log.created_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Leads */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B8A05]/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-[#1B8A05]" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[#1C1C1B]">Completed Leads</h2>
              <p className="text-sm text-gray-500">Leads you've successfully completed</p>
            </div>
          </div>
        </div>

        {completedLeads.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-semibold">No completed leads yet</p>
            <p className="text-sm text-gray-400">Complete your first lead to see it here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {completedLeads.map((lead, index) => (
              <motion.button
                key={lead.assignment_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/agent/lead/${lead.assignment_id}`)}
                className="w-full p-4 hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1B8A05]/20 text-[#1B8A05]">
                        Completed
                      </span>
                      <span className="text-xs text-gray-400">#{lead.lead_number}</span>
                    </div>
                    <p className="font-semibold text-[#1C1C1B]">
                      {lead.device_brand} {lead.device_model}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {lead.pickup_address?.city || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {lead.preferred_date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-[#1B8A05]">
                      <IndianRupee size={16} />
                      <span>
                        {parseFloat(lead.final_price || lead.estimated_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <ArrowRight className="text-gray-400 mt-2 ml-auto" size={18} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default AgentActivityPage;