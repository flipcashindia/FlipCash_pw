// src/components/partner/InspectionForm.tsx
/**
 * Inspection Form Component
 * Device inspection and assessment form
 */

import React, { useState } from 'react';
import { Camera, Upload, DollarSign, Check } from 'lucide-react';
import { useCompleteInspection } from '../../hooks/usePartnerVisitWorkflow';

interface InspectionFormProps {
  visitId: string;
  leadId: string;
}

export const InspectionForm: React.FC<InspectionFormProps> = ({ visitId, leadId }) => {
  const [formData, setFormData] = useState({
    inspection_notes: '',
    verified_imei: '',
    imei_matches: true,
    device_powers_on: true,
    partner_recommended_price: '',
    screen_condition: 'excellent',
    body_condition: 'excellent',
    battery_health: '100',
  });


  console.log(leadId);
  

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const completeInspection = useCompleteInspection();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files]);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload photos first (simplified - you'd use actual upload endpoint)
    const photoUrls = photoPreviews; // In real app, upload and get URLs

    completeInspection.mutate({
      visitId,
      data: {
        inspection_notes: formData.inspection_notes,
        inspection_photos: photoUrls,
        verified_imei: formData.verified_imei,
        imei_matches: formData.imei_matches,
        device_powers_on: formData.device_powers_on,
        partner_assessment: {
          screen_condition: formData.screen_condition,
          body_condition: formData.body_condition,
          battery_health: formData.battery_health,
        },
        partner_recommended_price: formData.partner_recommended_price,
        checklist_items: [
          {
            item_name: 'Screen',
            category: 'Display',
            status: formData.screen_condition === 'excellent' ? 'pass' : 'fail',
            notes: `Condition: ${formData.screen_condition}`,
          },
          {
            item_name: 'Body',
            category: 'Physical',
            status: formData.body_condition === 'excellent' ? 'pass' : 'fail',
            notes: `Condition: ${formData.body_condition}`,
          },
          {
            item_name: 'Battery',
            category: 'Performance',
            status: parseInt(formData.battery_health) >= 80 ? 'pass' : 'fail',
            notes: `Health: ${formData.battery_health}%`,
          },
        ],
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <h2 className="text-xl font-bold text-[#1C1C1B] mb-6 flex items-center gap-2">
        <Camera className="w-6 h-6 text-[#FEC925]" />
        Device Inspection
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IMEI Verification */}
        <div className="p-4 bg-[#F5F5F5] rounded-lg space-y-4">
          <h3 className="font-semibold text-[#1C1C1B]">IMEI Verification</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verified IMEI Number *
            </label>
            <input
              type="text"
              value={formData.verified_imei}
              onChange={(e) => setFormData({ ...formData, verified_imei: e.target.value })}
              placeholder="Enter 15-digit IMEI"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none font-mono"
              maxLength={15}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="imei_matches"
              checked={formData.imei_matches}
              onChange={(e) => setFormData({ ...formData, imei_matches: e.target.checked })}
              className="w-5 h-5 text-[#FEC925] rounded focus:ring-[#FEC925]"
            />
            <label htmlFor="imei_matches" className="text-sm font-medium text-gray-700">
              IMEI matches customer declaration
            </label>
          </div>
        </div>

        {/* Device Condition */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[#1C1C1B]">Device Condition</h3>
          
          {/* Power On */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="device_powers_on"
              checked={formData.device_powers_on}
              onChange={(e) => setFormData({ ...formData, device_powers_on: e.target.checked })}
              className="w-5 h-5 text-[#FEC925] rounded focus:ring-[#FEC925]"
            />
            <label htmlFor="device_powers_on" className="text-sm font-medium text-gray-700">
              Device powers on normally
            </label>
          </div>

          {/* Screen Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screen Condition
            </label>
            <select
              value={formData.screen_condition}
              onChange={(e) => setFormData({ ...formData, screen_condition: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
            >
              <option value="excellent">Excellent - No scratches</option>
              <option value="good">Good - Minor scratches</option>
              <option value="fair">Fair - Visible scratches</option>
              <option value="poor">Poor - Cracks/damage</option>
            </select>
          </div>

          {/* Body Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Condition
            </label>
            <select
              value={formData.body_condition}
              onChange={(e) => setFormData({ ...formData, body_condition: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
            >
              <option value="excellent">Excellent - Like new</option>
              <option value="good">Good - Minor wear</option>
              <option value="fair">Fair - Visible wear</option>
              <option value="poor">Poor - Major damage</option>
            </select>
          </div>

          {/* Battery Health */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Battery Health (%)
            </label>
            <input
              type="number"
              value={formData.battery_health}
              onChange={(e) => setFormData({ ...formData, battery_health: e.target.value })}
              min="0"
              max="100"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
            />
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Device Photos *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {photoPreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {photoPreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            )}
            <label className="cursor-pointer">
              <span className="text-[#FEC925] font-semibold hover:underline">
                Upload photos
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 3 photos required (front, back, screen on)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Recommended Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Recommended Price *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={formData.partner_recommended_price}
              onChange={(e) =>
                setFormData({ ...formData, partner_recommended_price: e.target.value })
              }
              placeholder="Enter your assessment price"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none text-lg font-semibold"
              min="0"
              step="100"
              required
            />
          </div>
        </div>

        {/* Inspection Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspection Notes
          </label>
          <textarea
            value={formData.inspection_notes}
            onChange={(e) => setFormData({ ...formData, inspection_notes: e.target.value })}
            placeholder="Any additional observations..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none resize-none"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={completeInspection.isPending || photos.length < 3}
          className="w-full py-4 bg-[#1B8A05] hover:bg-[#176f04] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {completeInspection.isPending ? 'Submitting...' : 'Complete Inspection'}
        </button>
      </form>
    </div>
  );
};