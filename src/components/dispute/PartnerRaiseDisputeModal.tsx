// src/components/dispute/PartnerRaiseDisputeModal.tsx
// Dispute modal for partners - same structure as consumer but different dispute types
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, AlertTriangle, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
// const token = useAuthStore.getState().accessToken;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface PartnerRaiseDisputeModalProps {
  leadId: string;
  leadNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Partner-specific dispute types
const PARTNER_DISPUTE_TYPES = [
  { value: 'customer_no_show', label: 'Customer No Show', icon: '🚫', description: 'Customer was not available at pickup location' },
  { value: 'customer_behavior', label: 'Customer Behavior', icon: '👤', description: 'Unprofessional or inappropriate customer conduct' },
  { value: 'device_mismatch', label: 'Device Mismatch', icon: '📱', description: 'Device does not match the description provided' },
  { value: 'fake_booking', label: 'Fake/Spam Booking', icon: '⚠️', description: 'Customer appears to be fake or not genuine' },
  { value: 'payment', label: 'Payment Issue', icon: '💳', description: 'Problem with payment or wallet transaction' },
  { value: 'pricing', label: 'Pricing Dispute', icon: '💰', description: 'Disagreement about device valuation' },
  { value: 'other', label: 'Other', icon: '❓', description: 'Any other issue' }
];

const PartnerRaiseDisputeModal: React.FC<PartnerRaiseDisputeModalProps> = ({
  leadId,
  leadNumber,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [evidenceDocuments, setEvidenceDocuments] = useState<string[]>([]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Convert file to base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File, type: 'photo' | 'document') => {
    setUploadingFile(true);
    setError(null);

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (type === 'photo') {
        if (!file.type.startsWith('image/')) {
          throw new Error('Please upload a valid image file');
        }
      } else {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          throw new Error('Please upload PDF or DOC files only');
        }
      }

      // Convert to base64 data URL
      const base64DataUrl = await fileToBase64(file);

      if (type === 'photo') {
        setEvidencePhotos(prev => [...prev, base64DataUrl]);
      } else {
        setEvidenceDocuments(prev => [...prev, base64DataUrl]);
      }

    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const removePhoto = (index: number) => {
    setEvidencePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setEvidenceDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) {
      setError('Please select a dispute type');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a detailed description');
      return;
    }

    if (description.trim().length < 20) {
      setError('Please provide more details (at least 20 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('Authentication required');

      const payload = {
        lead: leadId,
        dispute_type: selectedType,
        description: description.trim(),
        evidence: {
          photos: evidencePhotos,
          documents: evidenceDocuments,
          notes: evidenceNotes.trim()
        }
      };

      console.log('📤 Partner submitting dispute:', {
        ...payload,
        evidence: {
          photos: `${payload.evidence.photos.length} photos`,
          documents: `${payload.evidence.documents.length} documents`,
          notes: payload.evidence.notes ? 'Yes' : 'No'
        }
      });

      const res = await fetch(`${API_BASE_URL}/ops/disputes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `Failed to create dispute (${res.status})`);
      }

      const data = await res.json();
      console.log('✅ Dispute created:', data);
      
      onSuccess();
      onClose();
      
      // Reset form
      setSelectedType('');
      setDescription('');
      setEvidencePhotos([]);
      setEvidenceDocuments([]);
      setEvidenceNotes('');

    } catch (err: any) {
      console.error('❌ Dispute creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !uploadingFile) {
      setSelectedType('');
      setDescription('');
      setEvidencePhotos([]);
      setEvidenceDocuments([]);
      setEvidenceNotes('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b-2 border-[#FF0000]/20 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-[#FF0000]" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1C1C1B]">Report Issue</h2>
                <p className="text-gray-600">Lead #{leadNumber}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading || uploadingFile}
              className="text-gray-400 hover:text-[#FF0000] transition disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-xl flex items-center gap-3"
              >
                <AlertTriangle className="text-[#FF0000] flex-shrink-0" size={20} />
                <p className="text-sm font-semibold text-[#1C1C1B]">{error}</p>
              </motion.div>
            )}

            {/* Dispute Type Selection */}
            <div>
              <label className="block font-bold text-lg text-[#1C1C1B] mb-4">
                What type of issue are you reporting? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PARTNER_DISPUTE_TYPES.map((type) => {
                  const isSelected = selectedType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      disabled={loading || uploadingFile}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${isSelected 
                          ? 'border-[#FF0000] bg-[#FF0000]/5 shadow-lg' 
                          : 'border-gray-200 hover:border-[#FF0000]/50'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <p className={`font-bold ${isSelected ? 'text-[#FF0000]' : 'text-[#1C1C1B]'}`}>
                            {type.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block font-bold text-lg text-[#1C1C1B] mb-2">
                Describe your issue in detail *
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Provide as much information as possible to help us resolve your issue quickly.
              </p>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || uploadingFile}
                placeholder="Explain what happened, when it happened, and why you're raising this dispute..."
                rows={6}
                maxLength={2000}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none transition resize-none disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-2">
                {description.length} / 2000 characters
              </p>
            </div>

            {/* Evidence Upload Section */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg text-[#1C1C1B] mb-4 flex items-center gap-2">
                <Upload size={20} className="text-[#FEC925]" />
                Supporting Evidence (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload photos or documents to support your case.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <ImageIcon size={16} className="inline mr-2" />
                    Photos (Max 5MB each)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => handleFileUpload(file, 'photo'));
                      e.target.value = '';
                    }}
                    disabled={loading || uploadingFile}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FEC925] file:text-[#1C1C1B] file:font-semibold hover:file:bg-[#e5b520] disabled:opacity-50"
                  />
                  {evidencePhotos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {evidencePhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Evidence ${idx + 1}`} 
                            className="w-20 h-20 object-cover rounded-lg border-2 border-[#1B8A05]" 
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF0000] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-[#1B8A05] text-white text-xs py-0.5 px-1 rounded-b-lg text-center">
                            Photo {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText size={16} className="inline mr-2" />
                    Documents (PDF/DOC)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => handleFileUpload(file, 'document'));
                      e.target.value = '';
                    }}
                    disabled={loading || uploadingFile}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FEC925] file:text-[#1C1C1B] file:font-semibold hover:file:bg-[#e5b520] disabled:opacity-50"
                  />
                  {evidenceDocuments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {evidenceDocuments.map((_doc, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <FileText className="text-[#1B8A05]" size={16} />
                            <span className="text-xs text-gray-700 font-semibold">Document {idx + 1}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(idx)}
                            className="text-[#FF0000] text-xs font-semibold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  disabled={loading || uploadingFile}
                  placeholder="Any additional information (timestamps, conversations, etc.)"
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#FEC925] focus:outline-none transition resize-none disabled:opacity-50 text-sm"
                />
              </div>

              {uploadingFile && (
                <div className="mt-4 flex items-center gap-2 text-[#FEC925]">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm font-semibold">Processing file...</span>
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="bg-[#FEC925]/10 border-2 border-[#FEC925] rounded-xl p-4">
              <h4 className="font-bold text-[#1C1C1B] mb-2">⚠️ Important Information</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Your dispute will be reviewed within 24-48 hours</li>
                <li>• You'll receive updates via SMS and in-app notifications</li>
                <li>• Providing evidence strengthens your case</li>
                <li>• False disputes may affect your partner rating</li>
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading || uploadingFile}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold text-lg text-[#1C1C1B] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingFile || !selectedType || !description.trim()}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#FF0000] text-white rounded-xl hover:shadow-2xl hover:bg-[#CC0000] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle size={20} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PartnerRaiseDisputeModal;