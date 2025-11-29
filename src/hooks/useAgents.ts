// src/hooks/useAgents.ts
// React Query hooks for Partner managing Agents
// Used in: AgentsPage, AgentDetailModal, AddAgentModal, AssignLeadModal

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../api/services/agentService';
import type {
  AgentProfile,
  AgentListParams,
  CreateAgentRequest,
  UpdateAgentRequest,
  CreateAssignmentRequest,
  ReassignLeadRequest,
  AadhaarVerifyRequest,
  AssignmentListParams,
} from '../api/types/agent.type';

// =====================================================
// QUERY KEYS
// =====================================================

export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (params?: AgentListParams) => [...agentKeys.lists(), params] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  assignments: (id: string) => [...agentKeys.all, id, 'assignments'] as const,
  activityLogs: (id: string) => [...agentKeys.all, id, 'activity-logs'] as const,
  stats: () => [...agentKeys.all, 'stats'] as const,
  assignableLeads: () => [...agentKeys.all, 'assignable-leads'] as const,
  allAssignments: (params?: AssignmentListParams) => [...agentKeys.all, 'all-assignments', params] as const,
};

// =====================================================
// QUERIES - Reading Data
// =====================================================

/**
 * Get list of agents
 * Used in AgentsPage to display all agents
 */
export const useAgents = (params?: AgentListParams) => {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: () => agentService.getAgents(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get single agent details
 * Used in AgentDetailModal
 */
export const useAgent = (agentId: string) => {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => agentService.getAgent(agentId),
    enabled: !!agentId,
  });
};

/**
 * Get agent's assignments
 * Used in AgentDetailModal to show assigned leads
 */
export const useAgentAssignments = (agentId: string, status?: string) => {
  return useQuery({
    queryKey: agentKeys.assignments(agentId),
    queryFn: () => agentService.getAgentAssignments(agentId, status),
    enabled: !!agentId,
  });
};

/**
 * Get agent's activity logs
 * Used in AgentDetailModal for activity history
 */
export const useAgentActivityLogs = (agentId: string) => {
  return useQuery({
    queryKey: agentKeys.activityLogs(agentId),
    queryFn: () => agentService.getAgentActivityLogs(agentId),
    enabled: !!agentId,
  });
};

/**
 * Get overall agents stats
 * Used in AgentsPage header
 */
export const useAgentStats = () => {
  return useQuery({
    queryKey: agentKeys.stats(),
    queryFn: () => agentService.getOverallStats(),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Get assignable leads (leads that can be assigned to agents)
 * Used in AssignLeadModal dropdown
 */
export const useAssignableLeads = () => {
  return useQuery({
    queryKey: agentKeys.assignableLeads(),
    queryFn: () => agentService.getAssignableLeads(),
    staleTime: 30000,
  });
};

/**
 * Get all assignments
 * Used in assignments management page
 */
export const useAllAssignments = (params?: AssignmentListParams) => {
  return useQuery({
    queryKey: agentKeys.allAssignments(params),
    queryFn: () => agentService.getAssignments(params),
    staleTime: 30000,
  });
};

/**
 * Get available agents for lead assignment
 * Used in AssignLeadModal
 */
export const useAvailableAgents = () => {
  return useQuery({
    queryKey: [...agentKeys.all, 'available'],
    queryFn: () => agentService.getAvailableAgentsForLead(),
    staleTime: 30000,
  });
};

// =====================================================
// MUTATIONS - Creating/Updating Data
// =====================================================

/**
 * Create a new agent
 * Used in AddAgentModal
 */
export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAgentRequest) => agentService.createAgent(data),
    onSuccess: () => {
      // Invalidate agents list to refetch
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
    onError: (error) => {
      console.error('[useCreateAgent] Error:', error);
    },
  });
};

/**
 * Update an agent
 * Used in AgentDetailModal edit mode
 */
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: UpdateAgentRequest }) =>
      agentService.updateAgent(agentId, data),
    onSuccess: (data, variables) => {
      // Update agent in cache
      queryClient.setQueryData(agentKeys.detail(variables.agentId), data);
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
};

/**
 * Patch an agent (partial update)
 * Used for quick updates like availability toggle
 */
export const usePatchAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: Partial<UpdateAgentRequest> }) =>
      agentService.patchAgent(agentId, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(agentKeys.detail(variables.agentId), data);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
};

/**
 * Remove an agent (soft delete)
 * Used in AgentsPage action menu
 */
export const useRemoveAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => agentService.removeAgent(agentId),
    onSuccess: (_, agentId) => {
      // Remove from cache and refetch list
      queryClient.removeQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Toggle agent status (active/inactive)
 * Used in AgentsPage action menu
 */
export const useToggleAgentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => agentService.toggleStatus(agentId),
    onSuccess: (data, agentId) => {
      queryClient.setQueryData(agentKeys.detail(agentId), data);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Toggle agent availability
 * Used in AgentsPage action menu
 */
export const useToggleAgentAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => agentService.toggleAvailability(agentId),
    onSuccess: (data, agentId) => {
      queryClient.setQueryData(agentKeys.detail(agentId), data);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Activate an agent
 * Used in AgentsPage action menu
 */
export const useActivateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => agentService.activateAgent(agentId),
    onSuccess: (data, agentId) => {
      queryClient.setQueryData(agentKeys.detail(agentId), data);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Deactivate an agent
 * Used in AgentsPage action menu
 */
export const useDeactivateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => agentService.deactivateAgent(agentId),
    onSuccess: (data, agentId) => {
      queryClient.setQueryData(agentKeys.detail(agentId), data);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Verify agent (Aadhaar verification)
 * Used in AgentDetailModal
 */
export const useVerifyAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: AadhaarVerifyRequest }) =>
      agentService.verifyAgent(agentId, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(agentKeys.detail(variables.agentId), data);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

// =====================================================
// ASSIGNMENT MUTATIONS
// =====================================================

/**
 * Create a new assignment (assign lead to agent)
 * Used in AssignLeadModal
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => agentService.createAssignment(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: agentKeys.assignments(variables.agent_id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.assignableLeads() });
      queryClient.invalidateQueries({ queryKey: agentKeys.allAssignments() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Cancel an assignment
 * Used in assignment management
 */
export const useCancelAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason?: string }) =>
      agentService.cancelAssignment(assignmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.allAssignments() });
      queryClient.invalidateQueries({ queryKey: agentKeys.assignableLeads() });
    },
  });
};

/**
 * Reassign lead to different agent
 * Used in assignment management
 */
export const useReassignLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: ReassignLeadRequest }) =>
      agentService.reassignLead(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.allAssignments() });
      // Invalidate all agent assignments
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
};

// =====================================================
// HELPER HOOKS
// =====================================================

/**
 * Get agent by ID from cache or fetch
 */
export const useCachedAgent = (agentId: string): AgentProfile | undefined => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<AgentProfile>(agentKeys.detail(agentId));
};