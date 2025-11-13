import React, { useEffect, useState } from 'react';
import { disputeService } from '../../api/services/disputeService';
import { type Dispute } from '../../types/dispute.types';
import { formatDate } from '../../utils/formatters';
import { AlertCircle } from 'lucide-react';

interface DisputeListProps {
  onDisputeClick: (dispute: Dispute) => void;
}

const DisputeList: React.FC<DisputeListProps> = ({ onDisputeClick }) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const data = await disputeService.getMyDisputes();
      setDisputes(data);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <div key={dispute.id} onClick={() => onDisputeClick(dispute)} className="bg-white p-4 rounded-lg shadow border cursor-pointer hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <h3 className="font-semibold">{dispute.reason}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[dispute.status]}`}>
              {dispute.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{dispute.description}</p>
          <p className="text-xs text-gray-500">{formatDate(dispute.created_at)}</p>
        </div>
      ))}
    </div>
  );
};

export default DisputeList;