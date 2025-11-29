// src/pages/agent/AgentDashboardPage.tsx
// Agent Dashboard - Overview with stats and recent assignments

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  MapPin,
  // Phone,
  ArrowRight,
  IndianRupee,
  Calendar,
  Loader2,
  // AlertCircle,
  Package,
  TrendingUp,
  Star,
  Navigation,
  // PlayCircle,
} from 'lucide-react';
import { 
  useAgentProfile, 
  useAgentDashboardStats, 
  useAgentAssignments 
} from '../../hooks/useAgentApp';

// FlipCash Colors
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
// };

const AgentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useAgentProfile();
  const { data: stats, isLoading: statsLoading } = useAgentDashboardStats();
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAgentAssignments({
    status: 'assigned,accepted,en_route,checked_in,inspecting',
  });

  const assignments = assignmentsData?.results || [];
  const pendingAcceptance = assignments.filter(a => a.assignment_status === 'assigned');
  const activeAssignments = assignments.filter(a => 
    ['accepted', 'en_route', 'checked_in', 'inspecting'].includes(a.assignment_status)
  );

  const isLoading = profileLoading || statsLoading || assignmentsLoading;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: 'bg-blue-100 text-blue-700',
      accepted: 'bg-[#FEC925]/20 text-[#b48f00]',
      en_route: 'bg-purple-100 text-purple-700',
      checked_in: 'bg-green-100 text-green-700',
      inspecting: 'bg-orange-100 text-orange-700',
      completed: 'bg-[#1B8A05]/20 text-[#1B8A05]',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      assigned: 'New',
      accepted: 'Accepted',
      en_route: 'En Route',
      checked_in: 'At Location',
      inspecting: 'Inspecting',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-[#FF0000] text-white',
      high: 'bg-orange-500 text-white',
      normal: 'bg-gray-200 text-gray-700',
      low: 'bg-gray-100 text-gray-500',
    };
    return colors[priority] || 'bg-gray-200 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#FEC925]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1C1C1B] to-[#2d2d2c] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Hello, {profile?.user?.name?.split(' ')[0] || 'Agent'}! 👋
        </h1>
        <p className="text-white/70">
          {activeAssignments.length > 0
            ? `You have ${activeAssignments.length} active ${activeAssignments.length === 1 ? 'lead' : 'leads'} to complete`
            : pendingAcceptance.length > 0
            ? `You have ${pendingAcceptance.length} new ${pendingAcceptance.length === 1 ? 'lead' : 'leads'} waiting`
            : 'No active leads right now. Take a break!'}
        </p>
      </div>

      {/* Pending Acceptance Alert */}
      {pendingAcceptance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEC925]/10 border-2 border-[#FEC925] rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FEC925] rounded-full flex items-center justify-center animate-pulse">
                <ClipboardList className="text-[#1C1C1B]" size={20} />
              </div>
              <div>
                <p className="font-bold text-[#1C1C1B]">
                  {pendingAcceptance.length} New {pendingAcceptance.length === 1 ? 'Lead' : 'Leads'} Waiting!
                </p>
                <p className="text-sm text-gray-600">Accept to start earning</p>
              </div>
            </div>
            <Link
              to="/agent/leads?status=assigned"
              className="px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-bold hover:bg-[#e5b520] transition"
            >
              View Now
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats?.in_progress || activeAssignments.length}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Today"
          value={stats?.completed_today || 0}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="This Week"
          value={stats?.completed_this_week || 0}
          color="purple"
        />
        <StatCard
          icon={Star}
          label="Rating"
          value={profile?.average_rating ? parseFloat(profile.average_rating).toFixed(1) : '-'}
          color="yellow"
          showStar
        />
      </div>

      {/* Active Leads */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEC925]/20 rounded-lg flex items-center justify-center">
              <Navigation className="text-[#FEC925]" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[#1C1C1B]">Active Leads</h2>
              <p className="text-sm text-gray-500">Leads you're currently working on</p>
            </div>
          </div>
          <Link
            to="/agent/leads"
            className="text-[#FEC925] font-semibold hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-semibold">No active leads</p>
            <p className="text-sm text-gray-400">New leads will appear here when assigned</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignments.slice(0, 5).map((assignment) => (
              <motion.button
                key={assignment.assignment_id}
                onClick={() => navigate(`/agent/lead/${assignment.assignment_id}`)}
                className="w-full p-4 hover:bg-gray-50 transition text-left"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(assignment.assignment_status)}`}>
                        {getStatusLabel(assignment.assignment_status)}
                      </span>
                      {assignment.assignment_priority !== 'normal' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(assignment.assignment_priority)}`}>
                          {assignment.assignment_priority.toUpperCase()}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">#{assignment.lead_number}</span>
                    </div>
                    <p className="font-semibold text-[#1C1C1B]">
                      {assignment.device_brand} {assignment.device_model}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {assignment.pickup_address?.city || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {assignment.preferred_date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-[#1B8A05]">
                      <IndianRupee size={16} />
                      <span>{parseFloat(assignment.estimated_price).toLocaleString('en-IN')}</span>
                    </div>
                    <ArrowRight className="text-gray-400 mt-2" size={20} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/agent/leads"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-[#FEC925] hover:shadow-md transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FEC925]/20 rounded-xl flex items-center justify-center group-hover:bg-[#FEC925]/30 transition">
              <ClipboardList className="text-[#FEC925]" size={24} />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1B]">All Leads</p>
              <p className="text-sm text-gray-500">View assigned</p>
            </div>
          </div>
        </Link>

        <Link
          to="/agent/activity"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-[#1B8A05] hover:shadow-md transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1B8A05]/20 rounded-xl flex items-center justify-center group-hover:bg-[#1B8A05]/30 transition">
              <TrendingUp className="text-[#1B8A05]" size={24} />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1B]">Activity</p>
              <p className="text-sm text-gray-500">Your history</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Summary */}
      <div className="bg-gradient-to-r from-[#1B8A05] to-[#156d04] rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{stats?.completed_today || 0}</p>
            <p className="text-white/70 text-sm">Completed</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-3xl font-bold">{stats?.in_progress || activeAssignments.length}</p>
            <p className="text-white/70 text-sm">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              ₹{(stats?.total_earnings || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-white/70 text-sm">Earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  showStar?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, showStar }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-[#1B8A05]/10 text-[#1B8A05]',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-[#FEC925]/10 text-[#FEC925]',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <div className="flex items-center gap-1">
        {showStar && value !== '-' && (
          <Star size={18} className="text-[#FEC925]" fill="#FEC925" />
        )}
        <span className="text-2xl font-bold text-[#1C1C1B]">{value}</span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
};

export default AgentDashboardPage;