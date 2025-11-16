// src/hooks/usePartnerVisitWorkflow.ts
/**
 * React Query hooks for Partner Visit Workflow
 * Complete integration from claim to payment
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { partnerClaimService } from '../api/services/partnerClaimService';
import { visitService } from '../api/services/visitsService';
import type {
  ClaimResponse,
  CancelClaimRequest,
  CompleteVisitRequest,
} from '../api/services/partnerClaimService';
import type {
  VerifyCodeRequest,
  CompleteInspectionRequest,
  CancelVisitRequest,
} from '../api/services/visitsService';

// ============================================================================
// CLAIM HOOKS
// ============================================================================

export const useClaimLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: string) => partnerClaimService.claimLead(leadId),
    onSuccess: (_data: ClaimResponse) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};

export const useCancelClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CancelClaimRequest }) =>
      partnerClaimService.cancelClaim(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};

export const useCompleteVisitPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data?: CompleteVisitRequest }) =>
      partnerClaimService.completeVisit(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};

// ============================================================================
// VISIT HOOKS
// ============================================================================

export const useVisit = (visitId: string | undefined) => {
  return useQuery({
    queryKey: ['visits', visitId],
    queryFn: () => visitService.getVisit(visitId!),
    enabled: !!visitId,
  });
};

export const useVisits = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['visits', params],
    queryFn: () => visitService.listVisits(params),
  });
};

export const useUpcomingVisits = () => {
  return useQuery({
    queryKey: ['visits', 'upcoming'],
    queryFn: () => visitService.getUpcomingVisits(),
  });
};

export const useVerificationCode = (visitId: string | undefined) => {
  return useQuery({
    queryKey: ['visits', visitId, 'verification-code'],
    queryFn: () => visitService.getVerificationCode(visitId!),
    enabled: !!visitId,
  });
};

export const useVerifyCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: VerifyCodeRequest }) =>
      visitService.verifyCode(visitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};

// ✅ FIXED: Accept object with visitId and optional notes
export const useStartVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, notes }: { visitId: string; notes?: string }) =>
      visitService.startVisit(visitId, notes ? { notes } : undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};

export const useStartInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => visitService.startInspection(visitId),
    onSuccess: (_, visitId) => {
      queryClient.invalidateQueries({ queryKey: ['visits', visitId] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};

export const useCompleteInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: CompleteInspectionRequest }) =>
      visitService.completeInspection(visitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};

export const useCancelVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: CancelVisitRequest }) =>
      visitService.cancelVisit(visitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'leads'] });
    },
  });
};

export const useVisitTimeline = (visitId: string | undefined) => {
  return useQuery({
    queryKey: ['visits', visitId, 'timeline'],
    queryFn: () => visitService.getTimeline(visitId!),
    enabled: !!visitId,
  });
};

export const useVisitChecklist = (visitId: string | undefined) => {
  return useQuery({
    queryKey: ['visits', visitId, 'checklist'],
    queryFn: () => visitService.getChecklist(visitId!),
    enabled: !!visitId,
  });
};

export const useVisitStats = () => {
  return useQuery({
    queryKey: ['visits', 'stats'],
    queryFn: () => visitService.getStats(),
  });
};

// ============================================================================
// COMBINED WORKFLOW HOOK
// ============================================================================

export const usePartnerVisitWorkflow = (visitId?: string) => {
  const visit = useVisit(visitId);
  const timeline = useVisitTimeline(visitId);
  const checklist = useVisitChecklist(visitId);

  const startVisit = useStartVisit();
  const verifyCode = useVerifyCode();
  const startInspection = useStartInspection();
  const completeInspection = useCompleteInspection();
  const cancelVisit = useCancelVisit();
  const completePayment = useCompleteVisitPayment();

  return {
    // Data
    visit: visit.data,
    timeline: timeline.data,
    checklist: checklist.data,
    isLoading: visit.isLoading || timeline.isLoading || checklist.isLoading,
    error: visit.error || timeline.error || checklist.error,

    // Actions - ✅ FIXED: Pass objects to mutations
    startVisit: (notes?: string) =>
      startVisit.mutate({ visitId: visitId!, notes }),
    
    verifyCode: (code: string) =>
      verifyCode.mutate({ visitId: visitId!, data: { code } }),
    
    startInspection: () =>
      startInspection.mutate(visitId!),
    
    completeInspection: (data: CompleteInspectionRequest) =>
      completeInspection.mutate({ visitId: visitId!, data }),
    
    cancelVisit: (reason: string) =>
      cancelVisit.mutate({ visitId: visitId!, data: { reason } }),
    
    completePayment: (leadId: string, data?: CompleteVisitRequest) =>
      completePayment.mutate({ leadId, data }),

    // Mutation states
    isStarting: startVisit.isPending,
    isVerifying: verifyCode.isPending,
    isInspecting: startInspection.isPending || completeInspection.isPending,
    isCancelling: cancelVisit.isPending,
    isCompleting: completePayment.isPending,

    // Refetch
    refetch: () => {
      visit.refetch();
      timeline.refetch();
      checklist.refetch();
    },
  };
};