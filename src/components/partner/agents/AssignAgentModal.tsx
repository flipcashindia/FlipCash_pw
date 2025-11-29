// src/components/partner/agents/AssignAgentModal.tsx
// Modal for assigning a lead to an agent
// Used in: LeadsPage, LeadDetailPage when partner wants to assign a claimed lead to an agent
// Backend: POST /api/v1/partner-agents/assignments/
// Uses: useAvailableAgents, useCreateAssignment from useAgents.ts

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserPlus,
  Loader2,
  Search,
  Star,
  CheckCircle,
  Phone,
  // MapPin,
  AlertCircle,
  Users,
  Activity,
  // Clock,
  Package,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { useAvailableAgents, useCreateAssignment } from '../../../hooks/useAgents';
import type { AgentListItem } from '../../../api/types/agent.type';

interface AssignAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadNumber: string;
  deviceName: string;
  customerName?: string;
  scheduledDate?: string;
  estimatedPrice?: number;
  onSuccess?: () => void;
}

type Priority = 'low' | 'normal' | 'high' | 'urgent';

const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadNumber,
  deviceName,
  customerName,
  scheduledDate,
  estimatedPrice,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [error, setError] = useState<string | null>(null);

  // Fetch available agents (active, available, can accept leads)
  const { data: availableAgents, isLoading, error: fetchError } = useAvailableAgents();
  const createAssignmentMutation = useCreateAssignment();

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!availableAgents) return [];
    if (!searchQuery) return availableAgents;
    
    const query = searchQuery.toLowerCase();
    return availableAgents.filter((agent) => 
      agent.user_name.toLowerCase().includes(query) ||
      agent.user_phone.includes(query) ||
      agent.employee_code?.toLowerCase().includes(query)
    );
  }, [availableAgents, searchQuery]);

  const handleAssign = async () => {
    if (!selectedAgent) {
      setError('Please select an agent');
      return;
    }

    try {
      setError(null);
      
      // CreateAssignmentRequest: agent_id, lead_id, priority, assignment_notes, expected_completion_at
      await createAssignmentMutation.mutateAsync({
        agent_id: selectedAgent.id,
        lead_id: leadId,
        priority,
        assignment_notes: assignmentNotes.trim() || undefined,
      });

      // Reset and close
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to assign agent');
    }
  };

  const handleClose = () => {
    if (!createAssignmentMutation.isPending) {
      setSelectedAgent(null);
      setAssignmentNotes('');
      setSearchQuery('');
      setPriority('normal');
      setError(null);
      onClose();
    }
  };

  const getPriorityConfig = (p: Priority) => {
    const configs = {
      low: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Low' },
      normal: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Normal' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
      urgent: { bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', label: 'Urgent' },
    };
    return configs[p];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FEC925] to-[#e5b520] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <UserPlus className="text-[#1C1C1B]" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1C1C1B]">Assign Agent</h3>
                  <p className="text-[#1C1C1B]/70 text-sm">
                    Lead #{leadNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={createAssignmentMutation.isPending}
                className="text-[#1C1C1B]/60 hover:text-[#1C1C1B] transition disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Lead Summary */}
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Package className="text-[#FEC925]" size={18} />
                  <span className="font-semibold text-[#1C1C1B]">{deviceName}</span>
                </div>
                {customerName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span>{customerName}</span>
                  </div>
                )}
                {scheduledDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>{scheduledDate}</span>
                  </div>
                )}
                {estimatedPrice && (
                  <div className="flex items-center gap-2 text-[#1B8A05]">
                    <IndianRupee size={16} />
                    <span className="font-semibold">{estimatedPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {(error || fetchError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="text-[#FF0000] flex-shrink-0" size={20} />
                <p className="text-[#FF0000] font-semibold text-sm">
                  {error || 'Failed to load agents'}
                </p>
              </motion.div>
            )}

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search agents by name, phone, or employee code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Priority Selection */}
            <div className="mb-4">
              <label className="block font-bold text-[#1C1C1B] mb-2">Priority</label>
              <div className="flex gap-2">
                {(['low', 'normal', 'high', 'urgent'] as Priority[]).map((p) => {
                  const config = getPriorityConfig(p);
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                        isSelected
                          ? `${config.bg} ${config.text} ring-2 ring-offset-1 ring-[#FEC925]`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Agents List */}
            <div className="mb-4">
              <h4 className="font-bold text-[#1C1C1B] mb-3 flex items-center gap-2">
                <Users className="text-[#FEC925]" size={18} />
                Available Agents ({filteredAgents.length})
              </h4>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#FEC925]" size={32} />
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Users className="text-gray-300 mx-auto mb-3" size={48} />
                  <p className="text-gray-600 font-semibold">No available agents</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchQuery ? 'Try different search terms' : 'All agents are currently busy or unavailable'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredAgents.map((agent) => (
                    <AgentSelectCard
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgent?.id === agent.id}
                      onSelect={() => setSelectedAgent(agent)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Assignment Notes */}
            {selectedAgent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4"
              >
                <label className="block font-bold text-[#1C1C1B] mb-2">
                  Assignment Notes <span className="text-gray-400 font-normal text-sm">(Optional)</span>
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Any special instructions for the agent..."
                  rows={3}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none transition"
                />
              </motion.div>
            )}

            {/* Selected Agent Summary */}
            {selectedAgent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1B8A05]/10 p-4 rounded-xl border-2 border-[#1B8A05]"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-[#1B8A05] flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <p className="font-bold text-[#1C1C1B]">Ready to assign</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{selectedAgent.user_name}</span> will receive this lead assignment with{' '}
                      <span className={`font-semibold ${getPriorityConfig(priority).text}`}>
                        {getPriorityConfig(priority).label}
                      </span>{' '}
                      priority
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={handleClose}
              disabled={createAssignmentMutation.isPending}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedAgent || createAssignmentMutation.isPending}
              className="flex-1 px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAssignmentMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Assign Agent
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ========== Agent Select Card ==========

interface AgentSelectCardProps {
  agent: AgentListItem;
  isSelected: boolean;
  onSelect: () => void;
}

const AgentSelectCard: React.FC<AgentSelectCardProps> = ({ agent, isSelected, onSelect }) => {
  const formatRating = (rating: string | null): string => {
    if (!rating) return '-';
    const num = parseFloat(rating);
    return isNaN(num) ? '-' : num.toFixed(1);
  };

  const capacityUsed = agent.current_assigned_leads_count || 0;
  // AgentListItem doesn't have max_concurrent_leads, default to 5
  const capacityMax = 5;
  const capacityPercent = (capacityUsed / capacityMax) * 100;

  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 transition text-left ${
        isSelected
          ? 'border-[#1B8A05] bg-[#1B8A05]/5'
          : 'border-gray-200 hover:border-[#FEC925] hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'bg-[#1B8A05]/20' : 'bg-[#FEC925]/20'
        }`}>
          {isSelected ? (
            <CheckCircle className="text-[#1B8A05]" size={24} />
          ) : (
            <span className="text-lg font-bold text-[#b48f00]">
              {agent.user_name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-[#1C1C1B] truncate">{agent.user_name}</h4>
            {agent.average_rating && (
              <span className="flex items-center gap-1 text-[#FEC925] text-sm flex-shrink-0">
                <Star size={14} fill="#FEC925" />
                {formatRating(agent.average_rating)}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Phone size={14} />
              {agent.user_phone}
            </span>
            <span className="flex items-center gap-1">
              <Activity size={14} />
              {agent.total_leads_completed} completed
            </span>
            {agent.employee_code && (
              <span className="text-gray-400">
                #{agent.employee_code}
              </span>
            )}
          </div>

          {/* Capacity indicator */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  capacityPercent >= 100 ? 'bg-[#FF0000]' : capacityPercent >= 80 ? 'bg-[#FEC925]' : 'bg-[#1B8A05]'
                }`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {capacityUsed}/{capacityMax}
            </span>
          </div>
        </div>

        {/* Selection Indicator */}
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected
            ? 'border-[#1B8A05] bg-[#1B8A05]'
            : 'border-gray-300'
        }`}>
          {isSelected && <CheckCircle className="text-white" size={16} />}
        </div>
      </div>
    </button>
  );
};

export default AssignAgentModal;