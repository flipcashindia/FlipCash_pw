// src/pages/partner/agents/AgentsPage.tsx
// Main page for partner to manage their agents

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  // Filter,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  // Mail,
  // MapPin,
  Star,
  MoreVertical,
  Eye,
  // Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  useAgents,
  useAgentStats,
  useRemoveAgent,
  useToggleAgentAvailability,
  useActivateAgent,
  useDeactivateAgent,
} from '../../hooks/useAgents';
import type { AgentListItem, AgentStatus } from '../../api/types/agent.type';
import AddAgentModal from '../../components/partner/agents/AddAgentModal';
import AgentDetailModal from '../../components/partner/agents/AgentDetailModal';

// FlipCash Colors
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
// };

const AgentsPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | ''>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionMenuAgent, setActionMenuAgent] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Queries
  const {
    data: agentsData,
    isLoading,
    error,
    refetch,
  } = useAgents({
    status: statusFilter || undefined,
    is_available: availabilityFilter === 'true' ? true : availabilityFilter === 'false' ? false : undefined,
    search: searchQuery || undefined,
  });

  const { data: stats } = useAgentStats();

  // Mutations
  const removeAgentMutation = useRemoveAgent();
  const toggleAvailabilityMutation = useToggleAgentAvailability();
  const activateAgentMutation = useActivateAgent();
  const deactivateAgentMutation = useDeactivateAgent();

  // Handle both flat array and paginated response formats
  const agents: AgentListItem[] = Array.isArray(agentsData) 
    ? agentsData 
    : (agentsData || []);

  // Handlers
  const handleRemoveAgent = async (agentId: string) => {
    try {
      await removeAgentMutation.mutateAsync(agentId);
      setConfirmDelete(null);
      setActionMenuAgent(null);
    } catch (err) {
      console.error('Failed to remove agent:', err);
    }
  };

  const handleToggleAvailability = async (agentId: string) => {
    try {
      await toggleAvailabilityMutation.mutateAsync(agentId);
      setActionMenuAgent(null);
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleActivateAgent = async (agentId: string) => {
    try {
      await activateAgentMutation.mutateAsync(agentId);
      setActionMenuAgent(null);
    } catch (err) {
      console.error('Failed to activate agent:', err);
    }
  };

  const handleDeactivateAgent = async (agentId: string) => {
    try {
      await deactivateAgentMutation.mutateAsync(agentId);
      setActionMenuAgent(null);
    } catch (err) {
      console.error('Failed to deactivate agent:', err);
    }
  };

  const handleViewAgent = (agent: AgentListItem) => {
    setSelectedAgent(agent);
    setIsDetailModalOpen(true);
    setActionMenuAgent(null);
  };

  const getStatusBadge = (status: AgentStatus) => {
    const badges: Record<AgentStatus, { bg: string; text: string; icon: React.ReactNode }> = {
      active: { bg: 'bg-[#1B8A05]/10', text: 'text-[#1B8A05]', icon: <CheckCircle size={14} /> },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <XCircle size={14} /> },
      suspended: { bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', icon: <AlertCircle size={14} /> },
      pending: { bg: 'bg-[#FEC925]/20', text: 'text-[#b48f00]', icon: <Loader2 size={14} /> },
    };
    return badges[status] || badges.inactive;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1C1B]">Manage Agents</h1>
          <p className="text-gray-600 mt-1">Add, manage, and assign leads to your field agents</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center gap-2 shadow-lg"
        >
          <UserPlus size={20} />
          Add New Agent
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="text-[#FEC925]" size={24} />}
            label="Total Agents"
            value={stats.total_agents}
            bgColor="bg-[#FEC925]/10"
          />
          <StatCard
            icon={<UserCheck className="text-[#1B8A05]" size={24} />}
            label="Active Agents"
            value={stats.active_agents}
            bgColor="bg-[#1B8A05]/10"
          />
          <StatCard
            icon={<Activity className="text-blue-600" size={24} />}
            label="Available Now"
            value={stats.available_agents}
            bgColor="bg-blue-100"
          />
          <StatCard
            icon={<TrendingUp className="text-purple-600" size={24} />}
            label="Completed Today"
            value={stats.completed_today}
            bgColor="bg-purple-100"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#FEC925] focus:ring-2 focus:ring-[#FEC925]/20 outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AgentStatus | '')}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FEC925] outline-none bg-white min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          {/* Availability Filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FEC925] outline-none bg-white min-w-[150px]"
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-[#FEC925]" size={48} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="text-[#FF0000] mb-3" size={48} />
            <p className="text-gray-600 font-semibold">Failed to load agents</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-semibold hover:bg-[#e5b520]"
            >
              Try Again
            </button>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="text-gray-300 mb-3" size={64} />
            <p className="text-gray-600 font-semibold text-lg">No agents found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery || statusFilter || availabilityFilter
                ? 'Try adjusting your filters'
                : 'Add your first agent to get started'}
            </p>
            {!searchQuery && !statusFilter && !availabilityFilter && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-6 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04]"
              >
                <UserPlus size={20} className="inline mr-2" />
                Add First Agent
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {agents.map((agent, index) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                index={index}
                isMenuOpen={actionMenuAgent === agent.id}
                onToggleMenu={() => setActionMenuAgent(actionMenuAgent === agent.id ? null : agent.id)}
                onView={() => handleViewAgent(agent)}
                onToggleAvailability={() => handleToggleAvailability(agent.id)}
                onActivate={() => handleActivateAgent(agent.id)}
                onDeactivate={() => handleDeactivateAgent(agent.id)}
                onDelete={() => setConfirmDelete(agent.id)}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAgentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />

      <AgentDetailModal
        isOpen={isDetailModalOpen}
        agent={selectedAgent}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAgent(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF0000]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="text-[#FF0000]" size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1C1C1B] mb-2">Remove Agent?</h3>
                <p className="text-gray-600 mb-6">
                  This will remove the agent from your team. Any active assignments will need to be reassigned.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRemoveAgent(confirmDelete)}
                    disabled={removeAgentMutation.isPending}
                    className="flex-1 px-4 py-3 bg-[#FF0000] text-white rounded-xl font-semibold hover:bg-[#cc0000] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {removeAgentMutation.isPending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ========== Sub Components ==========

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} p-4 rounded-xl`}>
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-2xl font-bold text-[#1C1C1B]">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);

interface AgentRowProps {
  agent: AgentListItem;
  index: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onView: () => void;
  onToggleAvailability: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  getStatusBadge: (status: AgentStatus) => { bg: string; text: string; icon: React.ReactNode };
}

const AgentRow: React.FC<AgentRowProps> = ({
  agent,
  index,
  isMenuOpen,
  onToggleMenu,
  onView,
  onToggleAvailability,
  onActivate,
  onDeactivate,
  onDelete,
  getStatusBadge,
}) => {
  const statusBadge = getStatusBadge(agent.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 hover:bg-gray-50 transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 bg-[#FEC925]/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-[#b48f00]">
              {agent.user_name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[#1C1C1B] truncate">{agent.user_name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                {statusBadge.icon}
                {agent.status}
              </span>
              {agent.is_available && agent.status === 'active' && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Available
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {agent.user_phone}
              </span>
              {agent.employee_code && (
                <span className="text-gray-400">ID: {agent.employee_code}</span>
              )}
              {agent.average_rating && (
                <span className="flex items-center gap-1 text-[#FEC925]">
                  <Star size={14} fill="#FEC925" />
                  {parseFloat(agent.average_rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-[#1C1C1B]">{agent.total_leads_completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#1C1C1B]">{agent.current_assigned_leads_count || 0}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative ml-4">
          <button
            onClick={onToggleMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <MoreVertical size={20} className="text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20"
              >
                <button
                  onClick={onView}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye size={16} className="text-gray-500" />
                  View Details
                </button>
                <button
                  onClick={onToggleAvailability}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  {agent.is_available ? (
                    <>
                      <ToggleRight size={16} className="text-[#1B8A05]" />
                      Mark Unavailable
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={16} className="text-gray-500" />
                      Mark Available
                    </>
                  )}
                </button>
                {agent.status === 'active' ? (
                  <button
                    onClick={onDeactivate}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600"
                  >
                    <UserX size={16} />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={onActivate}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-[#1B8A05]"
                  >
                    <UserCheck size={16} />
                    Activate
                  </button>
                )}
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={onDelete}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#FF0000]/5 flex items-center gap-2 text-[#FF0000]"
                >
                  <Trash2 size={16} />
                  Remove Agent
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentsPage;