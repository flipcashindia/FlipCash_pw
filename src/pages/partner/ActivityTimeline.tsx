// src/components/partner/ActivityTimeline.tsx
/**
 * Activity Timeline Component
 * Shows chronological history of visit events
 */

import React from 'react';
import { useVisitTimeline } from '../../hooks/usePartnerVisitWorkflow';
import { Clock, User, CheckCircle2, XCircle } from 'lucide-react';

interface ActivityTimelineProps {
  visitId: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ visitId }) => {
  const { data: timeline, isLoading } = useVisitTimeline(visitId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEC925]"></div>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Clock className="w-12 h-12 mb-2" />
        <p>No activity yet</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-[#FEC925]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'cancelled':
        return 'border-red-500 bg-red-50';
      case 'in_progress':
        return 'border-[#FEC925] bg-[#FEC925] bg-opacity-10';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {timeline.map((event, index) => (
        <div key={event.id} className="relative">
          {/* Connector Line */}
          {index !== timeline.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
          )}

          {/* Event Card */}
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
              {getStatusIcon(event.new_status)}
            </div>

            {/* Content */}
            <div className={`flex-1 p-4 rounded-lg border-2 ${getStatusColor(event.new_status)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[#1C1C1B]">
                    {event.new_status_display}
                  </h4>
                  {event.changed_by_name && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {event.changed_by_name}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              {event.reason && (
                <p className="text-sm text-gray-700 mt-2 italic">
                  Reason: {event.reason}
                </p>
              )}

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded text-xs space-y-1">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};