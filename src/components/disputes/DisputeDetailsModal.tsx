import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Dispute } from '../../types/dispute.types';
import { formatDateTime } from '../../utils/formatters';

interface DisputeDetailsModalProps {
  dispute: Dispute;
  onClose: () => void;
}

const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({ dispute, onClose }) => {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dispute Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Reason</p>
            <p className="font-semibold">{dispute.reason}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p>{dispute.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold capitalize">{dispute.status.replace('_', ' ')}</p>
          </div>
          {dispute.resolution && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Resolution</p>
              <p>{dispute.resolution}</p>
            </div>
          )}
          {dispute.evidence_urls.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Evidence</p>
              <div className="grid grid-cols-3 gap-2">
                {dispute.evidence_urls.map((url, idx) => (
                  <img key={idx} src={url} alt={`Evidence ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            </div>
          )}
          <div className="text-sm text-gray-500 pt-4 border-t">Created {formatDateTime(dispute.created_at)}</div>
        </div>
      </motion.div>
    </>
  );
};

export default DisputeDetailsModal;