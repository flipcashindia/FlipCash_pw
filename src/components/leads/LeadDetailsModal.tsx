import React from 'react';
import { X, MapPin, Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Lead } from '../../types/lead.types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Lead Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Package size={20} />
              Device Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Brand</p>
                <p className="font-semibold">{lead.device.brand}</p>
              </div>
              <div>
                <p className="text-gray-600">Model</p>
                <p className="font-semibold">{lead.device.model}</p>
              </div>
              <div>
                <p className="text-gray-600">Storage</p>
                <p className="font-semibold">{lead.device.storage || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">RAM</p>
                <p className="font-semibold">{lead.device.ram || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">IMEI</p>
                <p className="font-semibold">{lead.device.imei || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Purchase Year</p>
                <p className="font-semibold">{lead.device.purchase_year || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Condition</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Body Condition</p>
                <p className="font-semibold capitalize">{lead.condition.body_condition.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Screen Condition</p>
                <p className="font-semibold capitalize">{lead.condition.screen_condition.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Warranty</p>
                <p className="font-semibold">{lead.condition.warranty_months} months</p>
              </div>
            </div>
            {lead.condition.functional_issues.length > 0 && (
              <div className="mt-3">
                <p className="text-gray-600 text-sm mb-1">Functional Issues</p>
                <div className="flex flex-wrap gap-2">
                  {lead.condition.functional_issues.map((issue, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MapPin size={20} />
              Address
            </h3>
            <p className="text-sm">{lead.address.address_line1}</p>
            <p className="text-sm">{lead.address.city}, {lead.address.state} - {lead.address.pincode}</p>
          </div>

          {lead.images && lead.images.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {lead.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Device ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            </div>
          )}

          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Estimated Price</span>
              <span className="text-3xl font-bold text-teal-600">{formatCurrency(lead.estimate_price)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>Created {formatDateTime(lead.created_at)}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};