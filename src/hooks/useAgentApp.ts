// src/hooks/useAgentApp.ts
// UPDATED: Added NEW hooks for KYC documents & payment workflow
// Import from the UPDATED service file

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { agentAppService } from '../api/services/agentAppService';
import type {
  CheckInRequest,
  SubmitInspectionRequest,
  MakeOfferRequest,
  CompleteVisitRequest,
  CancelVisitRequest,
  LocationBreadcrumbRequest,
  DeviceInspectionData,
  // NEW types
  KYCDocumentUploadRequest,
  PaymentProcessRequest,
  FinalCompleteRequest,
  CustomerAcceptanceRequest,
} from '../api/types/agentApp.types';

// =====================================================
// QUERY KEYS
// =====================================================

export const agentAppKeys = {
  all: ['agentApp'] as const,
  profile: () => [...agentAppKeys.all, 'profile'] as const,
  stats: () => [...agentAppKeys.all, 'stats'] as const,
  assignments: () => [...agentAppKeys.all, 'assignments'] as const,
  assignmentsList: (params?: { status?: string }) => [...agentAppKeys.assignments(), 'list', params] as const,
  assignment: (id: string) => [...agentAppKeys.assignments(), 'detail', id] as const,
  visit: (id: string) => [...agentAppKeys.all, 'visit', id] as const,
  workflowStatus: (id: string) => [...agentAppKeys.all, 'workflow-status', id] as const,
  activityLogs: (params?: { page?: number; limit?: number }) => [...agentAppKeys.all, 'activity-logs', params] as const,
};

// =====================================================
// PROFILE QUERIES
// =====================================================

export const useAgentProfile = () => {
  return useQuery({
    queryKey: agentAppKeys.profile(),
    queryFn: () => agentAppService.getProfile(),
    staleTime: 60000, // 1 minute
  });
};

export const useAgentDashboardStats = () => {
  return useQuery({
    queryKey: agentAppKeys.stats(),
    queryFn: () => agentAppService.getDashboardStats(),
    staleTime: 30000, // 30 seconds
  });
};

// =====================================================
// ASSIGNMENTS QUERIES
// =====================================================

export const useAgentAssignments = (params?: { status?: string; page?: number }) => {
  return useQuery({
    queryKey: agentAppKeys.assignmentsList(params),
    queryFn: () => agentAppService.getAssignedLeads(params),
    staleTime: 30000,
  });
};

export const useAgentAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: agentAppKeys.assignment(assignmentId),
    queryFn: () => agentAppService.getAssignment(assignmentId),
    enabled: !!assignmentId,
    staleTime: 10000, // 10 seconds - want fresh data for workflow
  });
};

export const useAgentVisit = (assignmentId: string) => {
  return useQuery({
    queryKey: agentAppKeys.visit(assignmentId),
    queryFn: () => agentAppService.getVisitDetails(assignmentId),
    enabled: !!assignmentId,
    staleTime: 10000,
  });
};

/**
 * NEW: Get workflow status
 * GET /api/v1/partner-agents/my-leads/{assignment_id}/visit/workflow-status/
 */
export const useWorkflowStatus = (assignmentId: string) => {
  return useQuery({
    queryKey: agentAppKeys.workflowStatus(assignmentId),
    queryFn: () => agentAppService.getWorkflowStatus(assignmentId),
    enabled: !!assignmentId,
    staleTime: 5000, // 5 seconds - want very fresh workflow state
    refetchOnWindowFocus: true,
  });
};

export const useAgentActivityLogs = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: agentAppKeys.activityLogs(params),
    queryFn: () => agentAppService.getActivityLogs(params),
    staleTime: 60000,
  });
};

// =====================================================
// PROFILE MUTATIONS
// =====================================================

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (isAvailable: boolean) => agentAppService.updateAvailability(isAvailable),
    onSuccess: (data) => {
      queryClient.setQueryData(agentAppKeys.profile(), data);
    },
  });
};

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (data: { latitude: number; longitude: number }) =>
      agentAppService.updateLocation(data),
  });
};

// =====================================================
// ASSIGNMENT WORKFLOW MUTATIONS
// =====================================================

export const useAcceptAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => agentAppService.acceptAssignment(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
    },
  });
};

export const useRejectAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) =>
      agentAppService.rejectAssignment(assignmentId, reason),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

export const useStartJourney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => agentAppService.startJourney(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
    },
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CheckInRequest }) =>
      agentAppService.checkIn(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
    },
  });
};

export const useVerifyCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, code }: { assignmentId: string; code: string }) =>
      agentAppService.verifyCode(assignmentId, { code }),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
    },
  });
};

export const useStartInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => agentAppService.startVisitInspection(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
    },
  });
};

export const useSubmitInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: SubmitInspectionRequest | DeviceInspectionData }) =>
      agentAppService.submitInspection(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
    },
  });
};

/**
 * Customer acceptance/rejection (EXISTING)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/customer-response/
 */
export const useCustomerAcceptance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: CustomerAcceptanceRequest
    }) => agentAppService.submitCustomerAcceptance(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
    },
  });
};

export const useMakeOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: MakeOfferRequest }) =>
      agentAppService.makeOffer(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
    },
  });
};

export const useCompleteVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CompleteVisitRequest }) =>
      agentAppService.completeVisit(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

export const useCancelVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CancelVisitRequest }) =>
      agentAppService.cancelVisit(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

export const useRecordBreadcrumb = () => {
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: LocationBreadcrumbRequest }) =>
      agentAppService.recordBreadcrumb(assignmentId, data),
  });
};

// =====================================================
// PRICE CALCULATION (Legacy)
// =====================================================

export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: DeviceInspectionData }) =>
      agentAppService.calculatePrice(assignmentId, data),
  });
};

export const useCompleteDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: { payment_method: 'cash' | 'partner_wallet'; completion_notes?: string }
    }) => agentAppService.completeDeal(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
    },
  });
};

// =====================================================
// FILE UPLOADS
// =====================================================

export const useUploadInspectionImage = () => {
  return useMutation({
    mutationFn: ({ assignmentId, imageType, file }: { assignmentId: string; imageType: string; file: File }) =>
      agentAppService.uploadInspectionImage(assignmentId, imageType, file),
  });
};

// =====================================================
// NEW WORKFLOW MUTATIONS: KYC DOCUMENTS & PAYMENT
// =====================================================

/**
 * Upload KYC documents (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/kyc-documents/
 * 
 * Uses multipart/form-data for file uploads
 */
export const useUploadKYCDocuments = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: KYCDocumentUploadRequest
    }) => agentAppService.uploadKYCDocuments(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

/**
 * Process payment (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/process-payment/
 * 
 * Cash or partner wallet payment
 */
export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: PaymentProcessRequest
    }) => agentAppService.processPayment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
    },
  });
};

/**
 * Final completion (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/final-complete/
 * 
 * Finalizes everything after payment
 */
export const useFinalComplete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data?: FinalCompleteRequest
    }) => agentAppService.finalComplete(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.workflowStatus(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
    },
  });
};

// =====================================================
// GEOLOCATION HOOK
// =====================================================

export const useCurrentLocation = () => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      setIsGettingLocation(true);
      setLocationError(null);

      if (!navigator.geolocation) {
        setIsGettingLocation(false);
        setLocationError('Geolocation is not supported by your browser');
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsGettingLocation(false);
          resolve(position);
        },
        (error) => {
          setIsGettingLocation(false);
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          setLocationError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const watchLocation = useCallback((onUpdate: (position: GeolocationPosition) => void): number | null => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      return null;
    }

    return navigator.geolocation.watchPosition(
      onUpdate,
      (error) => {
        console.error('Watch location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, []);

  const clearWatch = useCallback((watchId: number) => {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return {
    getCurrentLocation,
    watchLocation,
    clearWatch,
    isGettingLocation,
    locationError,
  };
};

// =====================================================
// COMBINED WORKFLOW HOOK (UPDATED)
// =====================================================

/**
 * Combined hook for lead workflow management (UPDATED)
 * Now includes NEW workflow steps: KYC documents, payment processing, final completion
 */
export const useLeadWorkflow = (assignmentId: string) => {
  const assignment = useAgentAssignment(assignmentId);
  const workflowStatus = useWorkflowStatus(assignmentId);
  const accept = useAcceptAssignment();
  const reject = useRejectAssignment();
  const startJourney = useStartJourney();
  const checkIn = useCheckIn();
  const verifyCode = useVerifyCode();
  const startInspection = useStartInspection();
  const submitInspection = useSubmitInspection();
  const customerAcceptance = useCustomerAcceptance();
  // NEW workflow mutations
  const uploadKYCDocuments = useUploadKYCDocuments();
  const processPayment = useProcessPayment();
  const finalComplete = useFinalComplete();
  // Legacy
  const calculatePrice = useCalculatePrice();
  const makeOffer = useMakeOffer();
  const completeDeal = useCompleteDeal();
  const cancelVisit = useCancelVisit();
  const location = useCurrentLocation();

  const isLoading =
    accept.isPending ||
    reject.isPending ||
    startJourney.isPending ||
    checkIn.isPending ||
    verifyCode.isPending ||
    startInspection.isPending ||
    submitInspection.isPending ||
    customerAcceptance.isPending ||
    uploadKYCDocuments.isPending ||
    processPayment.isPending ||
    finalComplete.isPending ||
    calculatePrice.isPending ||
    makeOffer.isPending ||
    completeDeal.isPending ||
    cancelVisit.isPending;

  return {
    assignment,
    workflowStatus,
    accept,
    reject,
    startJourney,
    checkIn,
    verifyCode,
    startInspection,
    submitInspection,
    customerAcceptance,
    // NEW
    uploadKYCDocuments,
    processPayment,
    finalComplete,
    // Legacy
    calculatePrice,
    makeOffer,
    completeDeal,
    cancelVisit,
    location,
    isLoading,
  };
};






// // Add new hook for polling customer response
// export const useCustomerResponseStatus = (assignmentId: string, enabled: boolean = false) => {
//   return useQuery({
//     queryKey: ['customerResponseStatus', assignmentId],
//     queryFn: () => agentAppApi.getCustomerResponseStatus(assignmentId),
//     enabled: enabled && !!assignmentId,
//     refetchInterval: enabled ? 3000 : false, // Poll every 3 seconds when enabled
//   });
// };