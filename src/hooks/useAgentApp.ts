// src/hooks/useAgentApp.ts
// React Query hooks for Agent-facing application

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentAppService } from '../api/services/agentAppService';
import type {
  // AgentSelfProfile,
  // AgentAssignedLead,
  // AgentDashboardStats,
  CheckInRequest,
  DeviceInspectionData,
  PriceReEstimationRequest,
  CompleteDealRequest,
  LocationUpdateRequest,
} from '../api/types/agentApp.types';

// =====================================================
// QUERY KEYS
// =====================================================

export const agentAppKeys = {
  all: ['agentApp'] as const,
  profile: () => [...agentAppKeys.all, 'profile'] as const,
  stats: () => [...agentAppKeys.all, 'stats'] as const,
  assignments: () => [...agentAppKeys.all, 'assignments'] as const,
  assignmentsList: (filters: Record<string, any>) => 
    [...agentAppKeys.assignments(), 'list', filters] as const,
  assignment: (id: string) => [...agentAppKeys.assignments(), id] as const,
  activityLogs: () => [...agentAppKeys.all, 'activityLogs'] as const,
};

// =====================================================
// PROFILE HOOKS
// =====================================================

/**
 * Get agent's own profile
 */
export const useAgentProfile = () => {
  return useQuery({
    queryKey: agentAppKeys.profile(),
    queryFn: () => agentAppService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update agent availability
 */
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (isAvailable: boolean) => 
      agentAppService.updateAvailability(isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
    },
  });
};

/**
 * Update agent location
 */
export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (data: LocationUpdateRequest) => 
      agentAppService.updateLocation(data),
  });
};

// =====================================================
// DASHBOARD & STATS HOOKS
// =====================================================

/**
 * Get dashboard stats
 */
export const useAgentDashboardStats = () => {
  return useQuery({
    queryKey: agentAppKeys.stats(),
    queryFn: () => agentAppService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// =====================================================
// ASSIGNMENTS HOOKS
// =====================================================

/**
 * Get assigned leads list
 */
export const useAgentAssignments = (params?: {
  status?: string;
  priority?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: agentAppKeys.assignmentsList(params || {}),
    queryFn: () => agentAppService.getAssignedLeads(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get single assignment details
 */
export const useAgentAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: agentAppKeys.assignment(assignmentId),
    queryFn: () => agentAppService.getAssignment(assignmentId),
    enabled: !!assignmentId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// =====================================================
// ASSIGNMENT ACTIONS HOOKS
// =====================================================

/**
 * Accept assignment
 */
export const useAcceptAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => 
      agentAppService.acceptAssignment(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

/**
 * Reject assignment
 */
export const useRejectAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) => 
      agentAppService.rejectAssignment(assignmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

/**
 * Start journey
 */
export const useStartJourney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => 
      agentAppService.startJourney(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
    },
  });
};

// =====================================================
// CHECK-IN & VERIFICATION HOOKS
// =====================================================

/**
 * Check-in at location
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CheckInRequest }) => 
      agentAppService.checkIn(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
    },
  });
};

/**
 * Verify with customer code
 */
export const useVerifyCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, code }: { assignmentId: string; code: string }) => 
      agentAppService.verifyWithCode(assignmentId, code),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
    },
  });
};

/**
 * Start inspection
 */
export const useStartInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => 
      agentAppService.startInspection(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
    },
  });
};

// =====================================================
// INSPECTION HOOKS
// =====================================================

/**
 * Submit inspection data
 */
export const useSubmitInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      data 
    }: { 
      assignmentId: string; 
      data: DeviceInspectionData 
    }) => agentAppService.submitInspection(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
    },
  });
};

/**
 * Upload inspection image
 */
export const useUploadInspectionImage = () => {
  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      imageType, 
      file 
    }: { 
      assignmentId: string; 
      imageType: string; 
      file: File 
    }) => agentAppService.uploadInspectionImage(assignmentId, imageType, file),
  });
};

// =====================================================
// PRICE RE-ESTIMATION HOOKS
// =====================================================

/**
 * Calculate price based on inspection
 */
export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      data 
    }: { 
      assignmentId: string; 
      data: DeviceInspectionData 
    }) => agentAppService.calculatePrice(assignmentId, data),
  });
};

/**
 * Submit re-estimated price
 */
export const useSubmitReEstimation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      data 
    }: { 
      assignmentId: string; 
      data: PriceReEstimationRequest 
    }) => agentAppService.submitReEstimation(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
    },
  });
};

// =====================================================
// DEAL COMPLETION HOOKS
// =====================================================

/**
 * Complete deal
 */
export const useCompleteDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      data 
    }: { 
      assignmentId: string; 
      data: CompleteDealRequest 
    }) => agentAppService.completeDeal(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

/**
 * Cancel assignment
 */
export const useCancelAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) => 
      agentAppService.cancelAssignment(assignmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

// =====================================================
// ACTIVITY LOGS HOOKS
// =====================================================

/**
 * Get activity logs
 */
export const useAgentActivityLogs = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...agentAppKeys.activityLogs(), params],
    queryFn: () => agentAppService.getActivityLogs(params),
    staleTime: 5 * 60 * 1000,
  });
};

// =====================================================
// GEOLOCATION HOOK
// =====================================================

/**
 * Custom hook for getting current location
 */
export const useCurrentLocation = () => {
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return { getCurrentLocation };
};