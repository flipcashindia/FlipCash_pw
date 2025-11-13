// src/pages/partner/profile/PartnerAreaPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import { Loader2, MapPin, Plus, X } from 'lucide-react';
import { type CreateServiceAreaRequest } from '../../../api/types/api';

export const PartnerAreaPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: areas, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['partnerServiceAreas'],
    queryFn: partnerService.getServiceAreas, //
  });

  const addAreaMutation = useMutation({
    mutationFn: (payload: CreateServiceAreaRequest) => partnerService.addServiceArea(payload), //
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerServiceAreas'] });
      toast.success('Service area added successfully!');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add area.');
    }
  });

  const deleteAreaMutation = useMutation({
    mutationFn: (areaId: string) => partnerService.deleteServiceArea(areaId), //
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerServiceAreas'] });
      toast.success('Service area removed.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove area.');
    }
  });

  return (
    <div className="space-y-8">
      {/* --- Add Area Form --- */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-brand-black">Add Service Area</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-black rounded-lg font-bold text-sm"
          >
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add New'}
          </button>
        </div>
        
        {showForm && (
          <AddServiceAreaForm
            isLoading={addAreaMutation.isPending}
            onSubmit={addAreaMutation.mutate}
          />
        )}
      </div>
      
      {/* --- Areas List --- */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-brand-black mb-6 pb-4 border-b">My Service Areas</h2>
        {isLoadingAreas ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {areas && areas.length > 0 ? (
              areas.map(area => (
                <div key={area.id} className="flex items-center justify-between p-4 bg-brand-gray-light/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-brand-green" />
                    <div>
                      <p className="font-semibold text-brand-black">{area.name}</p>
                      <p className="text-sm text-gray-600">
                        {area.city}, {area.state} ({area.radius_km} km radius)
                      </p>
                      <p className="text-xs text-gray-500">
                        Pincodes: {area.postal_codes.join(', ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAreaMutation.mutate(area.id)}
                    disabled={deleteAreaMutation.isPending}
                    className="text-brand-red hover:opacity-70 disabled:opacity-30 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">You have not defined any service areas.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-component for the Add Area Form ---
const AddServiceAreaForm: React.FC<{
  isLoading: boolean;
  onSubmit: (data: CreateServiceAreaRequest) => void;
}> = ({ isLoading, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '', city: '', state: '', pincodes: '', radius_km: 10
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateServiceAreaRequest = {
      name: formData.name,
      city: formData.city,
      state: formData.state,
      center_latitude: 0.0, // Backend should geocode
      center_longitude: 0.0, // Backend should geocode
      radius_km: Number(formData.radius_km),
      postal_codes: formData.pincodes.split(',').map(p => p.trim()).filter(Boolean), //
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Area Name (e.g., 'Patna Central')" className="w-full p-3 border-2 rounded-lg" required />
        <input name="radius_km" type="number" value={formData.radius_km} onChange={handleChange} placeholder="Radius (km)" className="w-full p-3 border-2 rounded-lg" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full p-3 border-2 rounded-lg" required />
        <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full p-3 border-2 rounded-lg" required />
      </div>
      <input name="pincodes" value={formData.pincodes} onChange={handleChange} placeholder="Enter Pincodes (comma-separated)" className="w-full p-3 border-2 rounded-lg" required />
      
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2 bg-brand-yellow text-brand-black rounded-lg font-bold text-sm disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
        Add Area
      </button>
    </form>
  );
};