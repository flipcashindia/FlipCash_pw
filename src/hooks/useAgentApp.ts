// src/hooks/useAgentApp.ts
// React Query hooks for Agent Self-Service Application
// Used by agents to manage their own leads, profile, and workflow

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { agentAppService } from '../api/services/agentAppService';
import type {
  CheckInRequest,
  // VerifyCodeRequest,
  SubmitInspectionRequest,
  MakeOfferRequest,
  CompleteVisitRequest,
  CancelVisitRequest,
  LocationBreadcrumbRequest,
  DeviceInspectionData,
  // CompleteDealRequest,
  KYCVerificationRequest,
  // KYCVerificationResponse,
  PaymentProcessRequest,
  // PaymentProcessResponse,
  // CustomerAcceptanceRequest,
  // CustomerAcceptanceResponse,
  KYCVerificationData,
  PaymentData,
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
  activityLogs: (params?: { page?: number; limit?: number }) => [...agentAppKeys.all, 'activity-logs', params] as const,
};

// =====================================================
// PROFILE QUERIES
// =====================================================

/**
 * Get agent's own profile
 * Used in AgentLayout sidebar and AgentProfilePage
 */
export const useAgentProfile = () => {
  return useQuery({
    queryKey: agentAppKeys.profile(),
    queryFn: () => agentAppService.getProfile(),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Get agent's dashboard stats
 * Used in AgentDashboardPage
 */
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

/**
 * Get agent's assigned leads
 * Used in AgentLeadsPage and AgentDashboardPage
 */
export const useAgentAssignments = (params?: { status?: string; page?: number }) => {
  return useQuery({
    queryKey: agentAppKeys.assignmentsList(params),
    queryFn: () => agentAppService.getAssignedLeads(params),
    staleTime: 30000,
  });
};

/**
 * Get single assignment detail
 * Used in AgentLeadDetailPage
 */
export const useAgentAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: agentAppKeys.assignment(assignmentId),
    queryFn: () => agentAppService.getAssignment(assignmentId),
    enabled: !!assignmentId,
    staleTime: 10000, // 10 seconds - want fresh data for workflow
  });
};

/**
 * Get visit details
 * Used in AgentLeadDetailPage for visit workflow
 */
export const useAgentVisit = (assignmentId: string) => {
  return useQuery({
    queryKey: agentAppKeys.visit(assignmentId),
    queryFn: () => agentAppService.getVisitDetails(assignmentId),
    enabled: !!assignmentId,
    staleTime: 10000,
  });
};

/**
 * Get activity logs
 * Used in AgentActivityPage
 */
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

/**
 * Update agent availability
 * Used in AgentLayout sidebar and AgentProfilePage
 */
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (isAvailable: boolean) => agentAppService.updateAvailability(isAvailable),
    onSuccess: (data) => {
      queryClient.setQueryData(agentAppKeys.profile(), data);
    },
  });
};

/**
 * Update agent location
 * Used for GPS tracking during journey
 */
export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (data: { latitude: number; longitude: number }) =>
      agentAppService.updateLocation(data),
  });
};

// =====================================================
// ASSIGNMENT WORKFLOW MUTATIONS
// =====================================================

/**
 * Accept an assignment
 * Used in AgentLeadDetailPage
 */
export const useAcceptAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => agentAppService.acceptAssignment(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
    },
  });
};

/**
 * Reject an assignment
 * Used in AgentLeadDetailPage
 */
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

/**
 * Start journey (en route)
 * Used in AgentLeadDetailPage
 */
export const useStartJourney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => agentAppService.startJourney(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
    },
  });
};

/**
 * Check in at customer location
 * Used in AgentLeadDetailPage
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CheckInRequest }) =>
      agentAppService.checkIn(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
    },
  });
};

/**
 * Verify customer code
 * Used in VerificationCodeEntry modal
 */
export const useVerifyCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, code }: { assignmentId: string; code: string }) =>
      agentAppService.verifyCode(assignmentId, { code }),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
    },
  });
};

/**
 * Start inspection
 * Used in AgentLeadDetailPage
 */
export const useStartInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Use startVisitInspection to match the visit workflow
    // This hits /visit/start-inspection/ which is required before /visit/submit-inspection/
    mutationFn: (assignmentId: string) => agentAppService.startVisitInspection(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
    },
  });
};

/**
 * Submit inspection with device data
 * Used in InspectionForm
 */
export const useSubmitInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: DeviceInspectionData | SubmitInspectionRequest }) =>
      agentAppService.submitInspection(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
    },
  });
};

/**
 * Submit customer acceptance/rejection response (NEW WORKFLOW)
 * Used in CustomerAcceptanceScreen component
 */
export const useCustomerAcceptance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: {
        customer_response: 'accept' | 'reject';
        customer_signature?: string;
        rejection_reason?: string;
      }
    }) => agentAppService.submitCustomerAcceptance(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
    },
  });
};

/**
 * Calculate price based on inspection
 * Used in PriceBreakdown component
 */
export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: DeviceInspectionData }) =>
      agentAppService.calculatePrice(assignmentId, data),
  });
};

/**
 * Make price offer
 * Used in PriceBreakdown component
 */
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

/**
 * Complete visit
 * Used in DealCompletion component
 */
export const useCompleteVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CompleteVisitRequest }) =>
      agentAppService.completeVisit(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
    },
  });
};

/**
 * Complete deal with payment method selection (UPDATED NEW WORKFLOW)
 * Used in PaymentMethodScreen component
 */
export const useCompleteDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: {
        payment_method: 'cash' | 'partner_wallet';
        completion_notes?: string;
      }
    }) => agentAppService.completeDeal(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.profile() });
    },
  });
};

/**
 * Cancel visit
 * Used in AgentLeadDetailPage
 */
export const useCancelVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CancelVisitRequest }) =>
      agentAppService.cancelVisit(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

/**
 * Cancel assignment (alias for cancel visit with reason)
 */
export const useCancelAssignment = () => {
  return useCancelVisit();
};

/**
 * Record location breadcrumb
 * Used during journey for tracking
 */
export const useRecordBreadcrumb = () => {
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: LocationBreadcrumbRequest }) =>
      agentAppService.recordBreadcrumb(assignmentId, data),
  });
};

/**
 * Upload inspection image
 * Used in DeviceImageCapture component
 */
export const useUploadInspectionImage = () => {
  return useMutation({
    mutationFn: ({ assignmentId, imageType, file }: { assignmentId: string; imageType: string; file: File }) =>
      agentAppService.uploadInspectionImage(assignmentId, imageType, file),
  });
};

// =====================================================
// GEOLOCATION HOOK
// =====================================================

/**
 * Hook for getting current location
 * Used for check-in and breadcrumb tracking
 */
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
// NEW WORKFLOW MUTATIONS (KYC & PAYMENT)
// =====================================================

/**
 * Submit customer acceptance/rejection response (UPDATED)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/visit/customer-response/
 * Used in CustomerAcceptanceScreen component
 */
// export const useCustomerAcceptance = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: ({ assignmentId, data }: { 
//       assignmentId: string; 
//       data: CustomerAcceptanceRequest
//     }) => agentAppService.submitCustomerAcceptance(assignmentId, data),
//     onSuccess: (_, { assignmentId }) => {
//       queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
//       queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
//     },
//   });
// };

/**
 * Submit KYC verification for customer (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/kyc-verification/
 * Used in AgentKYCVerificationScreen component
 */
export const useKYCVerification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: KYCVerificationRequest | KYCVerificationData
    }) => {
      // Transform KYCVerificationData to KYCVerificationRequest if needed
      const requestData = data as KYCVerificationRequest;
      return agentAppService.submitKYCVerification(assignmentId, requestData);
    },
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: agentAppKeys.assignment(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.visit(assignmentId) });
      queryClient.invalidateQueries({ queryKey: agentAppKeys.stats() });
    },
  });
};

/**
 * Process payment after KYC verification (NEW)
 * POST /api/v1/partner-agents/my-leads/{assignment_id}/process-payment/
 * Used in AgentPaymentProcessingScreen component
 */
export const usePaymentProcess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { 
      assignmentId: string; 
      data: PaymentProcessRequest | PaymentData
    }) => {
      // Transform PaymentData to PaymentProcessRequest if needed
      const requestData = data as PaymentProcessRequest;
      return agentAppService.processPayment(assignmentId, requestData);
    },
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
// UPDATED COMBINED WORKFLOW HOOK (with KYC)
// =====================================================

/**
 * Combined hook for lead workflow management (UPDATED)
 * Provides all the mutations needed for the complete workflow including KYC
 */
export const useLeadWorkflow = (assignmentId: string) => {
  const assignment = useAgentAssignment(assignmentId);
  const accept = useAcceptAssignment();
  const reject = useRejectAssignment();
  const startJourney = useStartJourney();
  const checkIn = useCheckIn();
  const verifyCode = useVerifyCode();
  const startInspection = useStartInspection();
  const submitInspection = useSubmitInspection();
  const customerAcceptance = useCustomerAcceptance(); // UPDATED
  const kycVerification = useKYCVerification();         // NEW
  const paymentProcess = usePaymentProcess();           // NEW
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
    kycVerification.isPending ||      // NEW
    paymentProcess.isPending ||       // NEW
    calculatePrice.isPending ||
    makeOffer.isPending ||
    completeDeal.isPending ||
    cancelVisit.isPending;

  return {
    assignment,
    accept,
    reject,
    startJourney,
    checkIn,
    verifyCode,
    startInspection,
    submitInspection,
    customerAcceptance,
    kycVerification,      // NEW
    paymentProcess,       // NEW
    calculatePrice,
    makeOffer,
    completeDeal,
    cancelVisit,
    location,
    isLoading,
  };
};

// Export the new hooks
// export {
//   useCustomerAcceptance,
//   useKYCVerification,
//   usePaymentProcess,
// };