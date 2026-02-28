// src/pages/agent/AgentDashboardPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  MapPin,
  ArrowRight,
  IndianRupee,
  Calendar,
  Loader2,
  Package,
  TrendingUp,
  Star,
  Navigation,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { 
  useAgentProfile, 
  useAgentDashboardStats, 
  useAgentAssignments 
} from '../../hooks/useAgentApp';

const AgentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Data fetching using your custom hooks
  const { data: profile, isLoading: profileLoading } = useAgentProfile();
  const { data: stats, isLoading: statsLoading } = useAgentDashboardStats();
  
  // Expanded status filter to include the full backend workflow
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAgentAssignments({
    status: 'assigned,accepted,en_route,checked_in,code_verified,inspecting,inspection_submitted,awaiting_customer_response,customer_accepted,kyc_completed,payment_processed',
  });

  const assignments = assignmentsData?.results || [];
  
  // Logic to separate "New" vs "In Progress" based on AgentLeadAssignment.Status
  const pendingAcceptance = assignments.filter(a => a.assignment_status === 'assigned');
  const activeAssignments = assignments.filter(a => 
    ['accepted', 'en_route', 'checked_in', 'code_verified', 'inspecting', 'inspection_submitted', 'awaiting_customer_response', 'customer_accepted', 'kyc_completed'].includes(a.assignment_status)
  );

  const isLoading = profileLoading || statsLoading || assignmentsLoading;

  // Helper for dynamic status colors based on your extended Status TextChoices
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: 'bg-blue-100 text-blue-700',
      accepted: 'bg-[#FEC925]/20 text-[#b48f00]',
      en_route: 'bg-purple-100 text-purple-700',
      checked_in: 'bg-green-100 text-green-700',
      code_verified: 'bg-cyan-100 text-cyan-700',
      inspecting: 'bg-orange-100 text-orange-700',
      inspection_submitted: 'bg-indigo-100 text-indigo-700',
      awaiting_customer_response: 'bg-yellow-100 text-yellow-800',
      customer_accepted: 'bg-emerald-100 text-emerald-700',
      kyc_completed: 'bg-teal-100 text-teal-700',
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
      code_verified: 'Verified',
      inspecting: 'Inspecting',
      inspection_submitted: 'Submitted',
      awaiting_customer_response: 'Pending Customer',
      customer_accepted: 'Ready for KYC',
      kyc_completed: 'Ready for Payment',
      completed: 'Done',
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
      {/* Welcome Header - Integrated with Partner-as-Agent logic */}
      <div className="bg-gradient-to-r from-[#1C1C1B] to-[#2d2d2c] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Hello, {profile?.user?.name?.split(' ')[0] || 'Agent'}!
            </h1>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Show if self-agent/partner mode */}
              {profile?.employee_code === 'SELF' ? (
                <span className="flex items-center gap-1 px-2 py-1 bg-[#FEC925]/20 text-[#FEC925] text-xs font-bold rounded-lg border border-[#FEC925]/30">
                  <UserCheck size={12} /> Partner Mode
                </span>
              ) : (
                <span className="text-white/60 text-sm">Code: {profile?.employee_code}</span>
              )}
              
              {/* Verification Status Badge */}
              <span className={`flex items-center gap-1 text-xs ${profile?.is_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                <ShieldCheck size={14} /> {profile?.verification_status?.toUpperCase()}
              </span>
            </div>
          </div>
          
          {profile?.employee_code === 'SELF' && (
            <button 
              onClick={() => navigate('/partner/dashboard')}
              className="px-4 py-2 bg-[#FEC925] text-[#1C1C1B] text-sm font-bold rounded-xl hover:bg-[#e5b520] transition-all shadow-md active:scale-95"
            >
              Partner View
            </button>
          )}
        </div>

        <p className="mt-4 text-white/70 text-sm">
          {activeAssignments.length > 0
            ? `Active: ${activeAssignments.length} leads in workflow`
            : pendingAcceptance.length > 0
            ? `New: ${pendingAcceptance.length} leads waiting for you`
            : 'No active leads. Check back later!'}
        </p>

        {/* Working organization info */}
        {profile?.partner_name && profile?.employee_code !== 'SELF' && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Organization</p>
            <p className="text-sm font-semibold text-[#FEC925]">{profile.partner_name}</p>
          </div>
        )}
      </div>

      {/* Pending Acceptance Alert - Animated */}
      {pendingAcceptance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEC925]/10 border-2 border-[#FEC925] rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FEC925] rounded-full flex items-center justify-center animate-pulse">
                <ClipboardList className="text-[#1C1C1B]" size={20} />
              </div>
              <div>
                <p className="font-bold text-[#1C1C1B]">
                  {pendingAcceptance.length} New Assignment{pendingAcceptance.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-600">Accept now to lock the lead</p>
              </div>
            </div>
            <Link
              to="/agent/leads?status=assigned"
              className="px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-bold hover:bg-[#e5b520] transition shadow-md"
            >
              View Leads
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid - Using real backend metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats?.in_progress || activeAssignments.length}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats?.completed_today || profile?.total_leads_completed || 0}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Leads"
          value={profile?.total_leads_completed || 0}
          color="purple"
        />
        <StatCard
          icon={Star}
          label="My Rating"
          value={profile?.average_rating ? parseFloat(profile.average_rating).toFixed(1) : '-'}
          color="yellow"
          showStar
        />
      </div>

      {/* Active Leads List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEC925]/20 rounded-lg flex items-center justify-center">
              <Navigation className="text-[#FEC925]" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[#1C1C1B]">Current Workflow</h2>
              <p className="text-xs text-gray-500 font-medium">Leads currently under your service</p>
            </div>
          </div>
          <Link
            to="/agent/leads"
            className="text-sm text-[#FEC925] font-bold hover:underline flex items-center gap-1"
          >
            History <ArrowRight size={14} />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-bold">Queue is Empty</p>
            <p className="text-sm text-gray-400">New leads will appear when assigned by partner</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignments.slice(0, 8).map((assignment) => (
              <motion.button
                key={assignment.assignment_id}
                onClick={() => navigate(`/agent/lead/${assignment.assignment_id}`)}
                className="w-full p-4 hover:bg-gray-50/80 transition text-left group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${getStatusColor(assignment.assignment_status)}`}>
                        {getStatusLabel(assignment.assignment_status)}
                      </span>
                      {assignment.assignment_priority !== 'normal' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${getPriorityColor(assignment.assignment_priority)}`}>
                          {assignment.assignment_priority}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-mono">#{assignment.lead_number}</span>
                    </div>
                    <p className="font-bold text-[#1C1C1B] text-lg">
                      {assignment.device_brand} {assignment.device_model}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-red-400" />
                        {assignment.pickup_address?.city || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-blue-400" />
                        {assignment.preferred_date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 font-black text-[#1B8A05] text-lg">
                      <IndianRupee size={16} />
                      <span>{parseFloat(assignment.estimated_price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-end text-gray-300 group-hover:text-[#FEC925] transition-colors">
                      <span className="text-[10px] font-bold uppercase mr-1">Process</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Container */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/agent/leads"
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:border-[#FEC925] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FEC925]/10 rounded-xl flex items-center justify-center group-hover:bg-[#FEC925] transition-colors">
              <ClipboardList className="text-[#FEC925] group-hover:text-white" size={24} />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1B]">Lead Bank</p>
              <p className="text-xs text-gray-500 font-medium">Historical logs</p>
            </div>
          </div>
        </Link>

        <Link
          to="/agent/activity"
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:border-[#1B8A05] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1B8A05]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1B8A05] transition-colors">
              <TrendingUp className="text-[#1B8A05] group-hover:text-white" size={24} />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1B]">Analytics</p>
              <p className="text-xs text-gray-500 font-medium">Daily summary</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Earning Summary - Gradient Footer */}
      <div className="bg-gradient-to-br from-[#1B8A05] to-[#156d04] rounded-2xl p-6 text-white shadow-lg">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
           <IndianRupee size={20} /> Shift Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black">{stats?.completed_today || 0}</p>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Done</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-2xl font-black">{activeAssignments.length}</p>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black tracking-tight">
              ₹{(stats?.total_earnings || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component (Shared)
interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  showStar?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, showStar }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-[#1B8A05] border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    yellow: 'bg-yellow-50 text-[#b48f00] border-yellow-100',
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${colorClasses[color].split(' ')[2]} flex flex-col items-center text-center`}>
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <div className="flex items-center gap-1 mb-1">
        {showStar && value !== '-' && (
          <Star size={16} className="text-[#FEC925]" fill="#FEC925" />
        )}
        <span className="text-xl font-black text-[#1C1C1B] tracking-tight">{value}</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  );
};

export default AgentDashboardPage;