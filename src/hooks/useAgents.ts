// src/hooks/useAgents.ts
// React Query hooks for agent management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../api/services/agentService';
import type {
  // AgentProfile,
  // AgentLeadAssignment,
  CreateAgentRequest,
  UpdateAgentRequest,
  AssignLeadToAgentRequest,
  // AgentStats,
} from '../api/types/agent.type';

// Query Keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  assignments: () => [...agentKeys.all, 'assignments'] as const,
  assignment: (filters: Record<string, any>) => [...agentKeys.assignments(), filters] as const,
  stats: () => [...agentKeys.all, 'stats'] as const,
  available: (leadId: string) => [...agentKeys.all, 'available', leadId] as const,
};

// ==================== AGENT QUERIES ====================

/**
 * Hook to fetch agents list
 */
export const useAgents = (params?: {
  status?: string;
  is_available?: boolean;
  search?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: agentKeys.list(params || {}),
    queryFn: () => agentService.getAgents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch single agent
 */
export const useAgent = (agentId: string) => {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => agentService.getAgent(agentId),
    enabled: !!agentId,
  });
};

/**
 * Hook to fetch available agents for a lead
 */
export const useAvailableAgents = (leadId: string) => {
  return useQuery({
    queryKey: agentKeys.available(leadId),
    queryFn: () => agentService.getAvailableAgentsForLead(leadId),
    enabled: !!leadId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch agent stats
 */
export const useAgentStats = () => {
  return useQuery({
    queryKey: agentKeys.stats(),
    queryFn: () => agentService.getOverallStats(),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch assignments
 */
export const useAssignments = (params?: {
  agent?: string;
  lead?: string;
  status?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: agentKeys.assignment(params || {}),
    queryFn: () => agentService.getAssignments(params),
    staleTime: 60 * 1000,
  });
};

// ==================== AGENT MUTATIONS ====================

/**
 * Hook to create a new agent
 */
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentRequest) => agentService.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Hook to update an agent
 */
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: UpdateAgentRequest }) =>
      agentService.updateAgent(agentId, data),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
};

/**
 * Hook to remove an agent
 */
export const useRemoveAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => agentService.removeAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Hook to toggle agent availability
 */
export const useToggleAgentAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => agentService.toggleAvailability(agentId),
    onSuccess: (_, agentId) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
};

/**
 * Hook to activate an agent
 */
export const useActivateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => agentService.activateAgent(agentId),
    onSuccess: (_, agentId) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

/**
 * Hook to deactivate an agent
 */
export const useDeactivateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => agentService.deactivateAgent(agentId),
    onSuccess: (_, agentId) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.stats() });
    },
  });
};

// ==================== ASSIGNMENT MUTATIONS ====================

/**
 * Hook to assign lead to agent
 */
export const useAssignLeadToAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: AssignLeadToAgentRequest }) =>
      agentService.assignLeadToAgent(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['leads'] }); // Invalidate leads too
    },
  });
};

/**
 * Hook to cancel assignment
 */
export const useCancelAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) =>
      agentService.cancelAssignment(assignmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
};

/**
 * Hook to reassign lead
 */
export const useReassignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      newAgentId,
      notes,
    }: {
      assignmentId: string;
      newAgentId: string;
      notes?: string;
    }) => agentService.reassignLead(assignmentId, newAgentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
};