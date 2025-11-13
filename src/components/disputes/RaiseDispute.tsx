import React, { useState } from "react";
import { disputeService } from "../../api/services/disputeService";
import { useToast } from "../../contexts/ToastContext";
import { useImageUpload } from "../../hooks/useImageUpload";
import { ImageUploader } from "../common/ImageUploader";
import { Button } from "../common/Button";

const RaiseDispute: React.FC = () => {
  const toast = useToast();
  const { uploadImages } = useImageUpload();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({ lead: '', reason: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const evidenceUrls = images.length > 0 ? await uploadImages(images) : [];
      await disputeService.createDispute({ ...formData, evidence_urls: evidenceUrls });
      toast.success('Dispute raised successfully');
      setFormData({ lead: '', reason: '', description: '' });
      setImages([]);
    } catch (error) {
      toast.error('Failed to raise dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">File a Dispute</h1>
      <p className="text-gray-600 mb-6">Report an issue with a lead</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Lead ID <span className="text-red-500">*</span></label>
          <input type="text" value={formData.lead} onChange={(e) => setFormData({ ...formData, lead: e.target.value })} className="w-full p-3 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reason <span className="text-red-500">*</span></label>
          <select value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full p-3 border rounded-lg" required>
            <option value="">Select...</option>
            <option value="payment">Payment Issue</option>
            <option value="device">Device Condition Mismatch</option>
            <option value="customer">Customer No-Show</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full p-3 border rounded-lg" required />
        </div>
        <ImageUploader onImagesChange={setImages} maxImages={5} />
        <Button type="submit" loading={loading} variant="danger" size="lg" className="w-full">Submit Dispute</Button>
      </form>
    </div>
  );
};

export default RaiseDispute;