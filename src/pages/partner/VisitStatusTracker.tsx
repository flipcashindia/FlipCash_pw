// src/components/partner/VisitStatusTracker.tsx
/**
 * Visit Status Tracker Component
 * Visual progress indicator for visit workflow
 */

import React from 'react';
import { Check, Circle, MapPin, Camera, CheckCircle2, XCircle } from 'lucide-react';

interface VisitStatusTrackerProps {
  visit: {
    status: string;
    is_code_verified: boolean;
    partner_started_at: string | null;
    arrived_at: string | null;
    inspection_started_at: string | null;
    inspection_completed_at: string | null;
    actual_end_time: string | null;
  };
}

export const VisitStatusTracker: React.FC<VisitStatusTrackerProps> = ({ visit }) => {
  const steps = [
    {
      key: 'scheduled',
      label: 'Scheduled',
      icon: Circle,
      completed: ['en_route', 'arrived', 'in_progress', 'completed'].includes(visit.status),
      active: visit.status === 'scheduled',
    },
    {
      key: 'en_route',
      label: 'En Route',
      icon: MapPin,
      completed: ['arrived', 'in_progress', 'completed'].includes(visit.status),
      active: visit.status === 'en_route',
    },
    {
      key: 'arrived',
      label: 'Arrived',
      icon: Check,
      completed: ['in_progress', 'completed'].includes(visit.status),
      active: visit.status === 'arrived',
    },
    {
      key: 'in_progress',
      label: 'Inspecting',
      icon: Camera,
      completed: visit.status === 'completed',
      active: visit.status === 'in_progress',
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      completed: visit.status === 'completed',
      active: false,
    },
  ];

  if (visit.status === 'cancelled') {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <XCircle className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="text-lg font-bold text-red-900">Visit Cancelled</h3>
            <p className="text-sm text-red-700">This visit has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <h2 className="text-xl font-bold text-[#1C1C1B] mb-6">Visit Progress</h2>
      
      {/* Progress Bar */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200">
          <div
            className="h-full bg-[#FEC925] transition-all duration-500"
            style={{
              width: `${(steps.filter((s) => s.completed).length / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Icon Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 transition-all duration-300 ${
                    step.completed
                      ? 'bg-[#1B8A05] border-[#1B8A05] text-white'
                      : step.active
                      ? 'bg-[#FEC925] border-[#FEC925] text-[#1C1C1B] animate-pulse'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Label */}
                <p
                  className={`mt-3 text-sm font-semibold ${
                    step.completed || step.active ? 'text-[#1C1C1B]' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>

                {/* Timestamp */}
                {step.key === 'en_route' && visit.partner_started_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(visit.partner_started_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                {step.key === 'arrived' && visit.arrived_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(visit.arrived_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                {step.key === 'in_progress' && visit.inspection_started_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(visit.inspection_started_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                {step.key === 'completed' && visit.actual_end_time && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(visit.actual_end_time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification Status */}
      {visit.status === 'arrived' && !visit.is_code_verified && (
        <div className="mt-6 p-4 bg-[#FEC925] bg-opacity-10 border border-[#FEC925] rounded-lg">
          <p className="text-sm font-semibold text-[#1C1C1B]">
            ⏳ Waiting for customer verification code
          </p>
        </div>
      )}

      {visit.is_code_verified && visit.status !== 'completed' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800">
            ✓ Arrival verified successfully
          </p>
        </div>
      )}
    </div>
  );
};


