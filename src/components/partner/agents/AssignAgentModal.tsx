// src/components/partner/agents/AssignAgentModal.tsx
// Modal for assigning OR reassigning an agent to a lead.
// Assign:   fresh assign when no agent is currently assigned.
// Reassign: replaces the current agent (unassigns old then assigns new).
//
// Backend:
//   POST   /api/v1/partner-agents/assignments/          ← create assignment
//   DELETE /api/v1/partner-agents/assignments/{id}/     ← unassign (handled by parent via onBeforeAssign)

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, UserPlus, Loader2, Search, Star, CheckCircle,
  Phone, AlertCircle, Users, Activity, Package,
  Calendar, IndianRupee, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { useAvailableAgents, useCreateAssignment } from '../../../hooks/useAgents';
import type { AgentListItem } from '../../../api/types/agent.type';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssignAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadNumber: string;
  deviceName: string;
  customerName?: string;
  scheduledDate?: string;
  estimatedPrice?: number;

  // Reassign mode
  isReassigning?: boolean;
  currentAgentName?: string;
  currentAgentPhone?: string;

  // Called BEFORE the new assignment is created so the parent can
  // DELETE the existing assignment first. Should throw on failure.
  onBeforeAssign?: () => Promise<void>;

  onSuccess?: () => void;
}

type Priority = 'low' | 'normal' | 'high' | 'urgent';
type Step = 'select' | 'confirm';

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { bg: string; activeBg: string; text: string; border: string; label: string }> = {
  low:    { bg: 'bg-gray-100',        activeBg: 'bg-gray-200',       text: 'text-gray-700',   border: 'border-gray-400',   label: 'Low'    },
  normal: { bg: 'bg-blue-50',         activeBg: 'bg-blue-100',       text: 'text-blue-700',   border: 'border-blue-500',   label: 'Normal' },
  high:   { bg: 'bg-orange-50',       activeBg: 'bg-orange-100',     text: 'text-orange-700', border: 'border-orange-500', label: 'High'   },
  urgent: { bg: 'bg-[#FF0000]/5',     activeBg: 'bg-[#FF0000]/15',   text: 'text-[#FF0000]',  border: 'border-[#FF0000]',  label: 'Urgent' },
};

// ─── Main component ───────────────────────────────────────────────────────────

const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadNumber,
  deviceName,
  customerName,
  scheduledDate,
  estimatedPrice,
  isReassigning = false,
  currentAgentName,
  currentAgentPhone,
  onBeforeAssign,
  onSuccess,
}) => {
  const [step, setStep]                       = useState<Step>('select');
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedAgent, setSelectedAgent]     = useState<AgentListItem | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [priority, setPriority]               = useState<Priority>('normal');
  const [error, setError]                     = useState<string | null>(null);
  const [preAssignLoading, setPreAssignLoading] = useState(false);

  // Reset every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedAgent(null);
      setAssignmentNotes('');
      setSearchQuery('');
      setPriority('normal');
      setError(null);
    }
  }, [isOpen]);

  const { data: availableAgents, isLoading, error: fetchError } = useAvailableAgents();
  const createAssignmentMutation = useCreateAssignment();

  const isPending = createAssignmentMutation.isPending || preAssignLoading;

  // Filter agents by search query
  const filteredAgents = useMemo(() => {
    if (!availableAgents) return [];
    if (!searchQuery.trim()) return availableAgents;
    const q = searchQuery.toLowerCase();
    return availableAgents.filter((a) =>
      a.user_name.toLowerCase().includes(q) ||
      a.user_phone.includes(q) ||
      a.employee_code?.toLowerCase().includes(q)
    );
  }, [availableAgents, searchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAgentSelect = (agent: AgentListItem) => {
    setSelectedAgent(agent);
    setError(null);
  };

  // "Next" button on select step
  const handleProceed = () => {
    if (!selectedAgent) { setError('Please select an agent'); return; }
    if (isReassigning) {
      setStep('confirm');  // Show confirm screen before acting
    } else {
      handleAssign();      // Fresh assign — no confirmation needed
    }
  };

  // Final assign action
  const handleAssign = async () => {
    if (!selectedAgent) return;
    try {
      setError(null);

      // Step 1: Unassign existing agent if reassigning
      if (isReassigning && onBeforeAssign) {
        setPreAssignLoading(true);
        await onBeforeAssign();
        setPreAssignLoading(false);
      }

      // Step 2: Create new assignment
      await createAssignmentMutation.mutateAsync({
        agent_id: selectedAgent.id,
        lead_id: leadId,
        priority,
        assignment_notes: assignmentNotes.trim() || undefined,
      });

      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setPreAssignLoading(false);
      setError(err.message || 'Failed to assign agent. Please try again.');
      setStep('select');
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setStep('select');
      setSelectedAgent(null);
      setAssignmentNotes('');
      setSearchQuery('');
      setPriority('normal');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        >

          {/* ── Header ────────────────────────────────────────────────── */}
          <div className={`p-6 flex-shrink-0 ${
            isReassigning
              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
              : 'bg-gradient-to-r from-[#FEC925] to-[#e5b520]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {isReassigning
                    ? <RefreshCw className="text-white" size={22} />
                    : <UserPlus className="text-[#1C1C1B]" size={24} />
                  }
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isReassigning
                      ? step === 'confirm' ? 'Confirm Reassignment' : 'Reassign Agent'
                      : 'Assign Agent'
                    }
                  </h3>
                  <p className="text-white/70 text-sm">Lead #{leadNumber}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="text-white/70 hover:text-white transition disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* ── Scrollable content ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Lead summary */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Package className="text-[#FEC925]" size={16} />
                  <span className="font-semibold text-[#1C1C1B] text-sm">{deviceName}</span>
                </div>
                {customerName && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users size={14} /><span>{customerName}</span>
                  </div>
                )}
                {scheduledDate && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar size={14} /><span>{scheduledDate}</span>
                  </div>
                )}
                {estimatedPrice && (
                  <div className="flex items-center gap-2 text-[#1B8A05] text-sm">
                    <IndianRupee size={14} />
                    <span className="font-semibold">{estimatedPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Current agent banner — reassign mode only */}
            {isReassigning && currentAgentName && (
              <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-orange-800 text-sm">Currently Assigned</p>
                  <p className="text-orange-700 font-semibold">{currentAgentName}</p>
                  {currentAgentPhone && (
                    <p className="text-orange-600 text-sm flex items-center gap-1 mt-0.5">
                      <Phone size={12} /> {currentAgentPhone}
                    </p>
                  )}
                  <p className="text-orange-600 text-xs mt-1">
                    Selecting a new agent below will replace this assignment.
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {(error || fetchError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="text-[#FF0000] flex-shrink-0" size={20} />
                <p className="text-[#FF0000] font-semibold text-sm">
                  {error || 'Failed to load agents. Please try again.'}
                </p>
              </motion.div>
            )}

            {/* ══ STEP 1: Select agent ══════════════════════════════════ */}
            {step === 'select' && (
              <>
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, phone or employee code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none text-sm transition"
                  />
                </div>

                {/* Priority */}
                <div>
                  <p className="font-bold text-[#1C1C1B] text-sm mb-2">Priority</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                      const cfg = PRIORITY_CONFIG[p];
                      const active = priority === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setPriority(p)}
                          className={`py-2 rounded-xl text-sm font-semibold border-2 transition ${
                            active
                              ? `${cfg.activeBg} ${cfg.text} ${cfg.border}`
                              : `${cfg.bg} ${cfg.text} border-transparent`
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Agent list */}
                <div>
                  <h4 className="font-bold text-[#1C1C1B] text-sm mb-3 flex items-center gap-2">
                    <Users className="text-[#FEC925]" size={16} />
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
                        {searchQuery
                          ? 'Try different search terms'
                          : 'All agents are currently busy or unavailable'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {filteredAgents.map((agent) => (
                        <AgentSelectCard
                          key={agent.id}
                          agent={agent}
                          isSelected={selectedAgent?.id === agent.id}
                          onSelect={() => handleAgentSelect(agent)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes — visible once agent selected */}
                <AnimatePresence>
                  {selectedAgent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block font-bold text-[#1C1C1B] text-sm mb-2">
                        Assignment Notes{' '}
                        <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        placeholder="Any special instructions for the agent..."
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none text-sm transition"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected summary pill */}
                <AnimatePresence>
                  {selectedAgent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-[#1B8A05]/10 p-4 rounded-xl border-2 border-[#1B8A05]"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-[#1B8A05] flex-shrink-0" size={22} />
                        <p className="text-sm text-gray-700">
                          <span className="font-bold text-[#1C1C1B]">{selectedAgent.user_name}</span>{' '}
                          will {isReassigning ? 'replace the current agent with ' : 'receive this lead with '}
                          <span className={`font-semibold ${PRIORITY_CONFIG[priority].text}`}>
                            {PRIORITY_CONFIG[priority].label}
                          </span>{' '}
                          priority.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* ══ STEP 2: Confirm reassignment ═════════════════════════ */}
            {step === 'confirm' && selectedAgent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
              >
                <div className="text-center pt-2">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <RefreshCw className="text-orange-500" size={28} />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Review the agent swap below before confirming.
                  </p>
                </div>

                {/* From → To card */}
                <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 font-bold text-xs">OUT</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Removing</p>
                      <p className="font-bold text-[#1C1C1B]">{currentAgentName || 'Current Agent'}</p>
                      {currentAgentPhone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={12} />{currentAgentPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4">
                    <div className="w-0.5 h-5 bg-gray-300" />
                    <RefreshCw className="text-gray-400" size={14} />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#1B8A05] font-bold text-xs">IN</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Assigning</p>
                      <p className="font-bold text-[#1C1C1B]">{selectedAgent.user_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone size={12} />{selectedAgent.user_phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                  ⚠️ The previous agent will be removed from this lead immediately.
                  This cannot be undone once confirmed.
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
            {/* Back only on confirm step */}
            {step === 'confirm' && (
              <button
                onClick={() => setStep('select')}
                disabled={isPending}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                Back
              </button>
            )}

            <button
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={step === 'confirm' ? handleAssign : handleProceed}
              disabled={!selectedAgent || isPending}
              className={`flex-1 px-4 py-3 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isReassigning
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-[#1B8A05] hover:bg-[#156d04]'
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {preAssignLoading ? 'Removing old agent...' : 'Assigning...'}
                </>
              ) : step === 'confirm' ? (
                <><RefreshCw size={18} /> Confirm Reassign</>
              ) : isReassigning ? (
                <><RefreshCw size={18} /> {selectedAgent ? 'Review & Reassign' : 'Select an Agent'}</>
              ) : (
                <><UserPlus size={18} /> {selectedAgent ? 'Assign Agent' : 'Select an Agent'}</>
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Agent Select Card ────────────────────────────────────────────────────────

interface AgentSelectCardProps {
  agent: AgentListItem;
  isSelected: boolean;
  onSelect: () => void;
}

const AgentSelectCard: React.FC<AgentSelectCardProps> = ({ agent, isSelected, onSelect }) => {
  const formatRating = (r: string | null) => {
    if (!r) return '-';
    const n = parseFloat(r);
    return isNaN(n) ? '-' : n.toFixed(1);
  };

  const used    = agent.current_assigned_leads_count || 0;
  const max     = 5;
  const pct     = Math.min((used / max) * 100, 100);

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
        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'bg-[#1B8A05]/20' : 'bg-[#FEC925]/20'
        }`}>
          {isSelected
            ? <CheckCircle className="text-[#1B8A05]" size={22} />
            : <span className="text-base font-bold text-[#b48f00]">
                {agent.user_name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-[#1C1C1B] text-sm truncate">{agent.user_name}</h4>
            {agent.average_rating && (
              <span className="flex items-center gap-0.5 text-[#FEC925] text-xs flex-shrink-0">
                <Star size={12} fill="#FEC925" />
                {formatRating(agent.average_rating)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Phone size={12} />{agent.user_phone}</span>
            <span className="flex items-center gap-1"><Activity size={12} />{agent.total_leads_completed} done</span>
            {agent.employee_code && <span className="text-gray-400">#{agent.employee_code}</span>}
          </div>

          {/* Capacity bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 100 ? 'bg-[#FF0000]' : pct >= 80 ? 'bg-[#FEC925]' : 'bg-[#1B8A05]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{used}/{max} leads</span>
          </div>
        </div>

        {/* Radio dot */}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'border-[#1B8A05] bg-[#1B8A05]' : 'border-gray-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
};

export default AssignAgentModal;