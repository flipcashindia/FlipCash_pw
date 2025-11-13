// src/pages/partner/profile/PartnerProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePartnerStore } from '../../../stores/usePartnerStore';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import { Loader2, Save } from 'lucide-react';
import { type PartnerUpdatePayload } from '../../../api/types/api';

export const PartnerProfilePage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { partner, refetchPartner, isLoading } = usePartnerStore();
  
  const [formData, setFormData] = useState({
    business_name: '',
    service_radius_km: 10.0,
    price_range_min: 1000.0,
    price_range_max: 50000.0,
  });

  // Load data from the store into the form
  useEffect(() => {
    if (partner) {
      setFormData({
        business_name: partner.business_name,
        service_radius_km: parseFloat(partner.service_radius_km),
        price_range_min: parseFloat(partner.price_range_min),
        price_range_max: parseFloat(partner.price_range_max),
      });
    }
  }, [partner]);

  const profileMutation = useMutation({
    mutationFn: (payload: PartnerUpdatePayload) => partnerService.updateMe(payload), //
    onSuccess: (data) => {
      refetchPartner(); // Refetch the store
      queryClient.invalidateQueries({ queryKey: ['partnerProfile', data.id] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Profile update failed.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PartnerUpdatePayload = {
      business_name: formData.business_name, //
      service_radius_km: Number(formData.service_radius_km), //
      price_range_min: Number(formData.price_range_min), //
      price_range_max: Number(formData.price_range_max), //
    };
    profileMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-brand-black mb-6 pb-4 border-b">My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-semibold text-brand-black mb-2">Business Name</label>
          <input
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-200 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-black mb-2">Service Radius (in km)</label>
          <input
            name="service_radius_km"
            type="number"
            step="1"
            min="1"
            max="50"
            value={formData.service_radius_km}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-200 rounded-xl"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-brand-black mb-2">Min Price Range (₹)</label>
            <input
              name="price_range_min"
              type="number"
              step="100"
              min="0"
              value={formData.price_range_min}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-black mb-2">Max Price Range (₹)</label>
            <input
              name="price_range_max"
              type="number"
              step="100"
              min="0"
              value={formData.price_range_max}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={profileMutation.isPending}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {profileMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Save Changes
        </button>
      </form>
    </div>
  );
};