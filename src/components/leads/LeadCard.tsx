import React from 'react';
import { MapPin, Clock, Smartphone } from 'lucide-react';
import { type Lead } from '../../types/lead.types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Button } from '../common/Button';

interface LeadCardProps {
  lead: Lead;
  onClaim?: (leadId: string) => void;
  onClick?: () => void;
  claimLoading?: boolean;
  showActions?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({ 
  lead, 
  onClaim, 
  onClick, 
  claimLoading = false,
  showActions = true 
}) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {lead.device.brand} {lead.device.model}
            </h3>
            <p className="text-sm text-gray-600">{lead.device.storage}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{lead.address.city}, {lead.address.state}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatDateTime(lead.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600">Estimate</p>
          <p className="text-2xl font-bold text-teal-600">{formatCurrency(lead.estimate_price)}</p>
        </div>
        {showActions && onClaim && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClaim(lead.id);
            }}
            disabled={claimLoading}
            variant="primary"
            size="sm"
          >
            {claimLoading ? 'Claiming...' : 'Claim Lead'}
          </Button>
        )}
      </div>
    </div>
  );
};