// src/pages/partner/profile/PartnerAreaPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import {
  Loader2, MapPin, Plus, X, Navigation,
  Tag, Map, AlertCircle, CheckCircle,
} from 'lucide-react';
import { type CreateServiceAreaRequest, type ServiceArea } from '../../../api/types/api';

// ── Service Area Card ─────────────────────────────────────────────────────────

const AreaCard: React.FC<{
  area: ServiceArea;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}> = ({ area, onDelete, isDeleting }) => {
  const pincodes = Array.isArray(area.postal_codes) ? area.postal_codes : [];

  return (
    <div className={`relative rounded-2xl border-2 transition-all duration-200 hover:shadow-md overflow-hidden ${
      area.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-75'
    }`}>
      {/* Active indicator bar */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${area.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${area.is_active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <MapPin size={18} className={area.is_active ? 'text-emerald-600' : 'text-gray-400'} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{area.name}</h3>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  area.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {area.is_active ? <CheckCircle size={10} /> : null}
                  {area.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {[area.city, area.state].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDelete(area.id)}
            disabled={isDeleting}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-30"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Navigation size={12} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">{area.radius_km} km radius</span>
          </div>
          {area.priority && (
            <div className="flex items-center gap-1.5">
              <Tag size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">Priority {area.priority}</span>
            </div>
          )}
        </div>

        {/* Pincodes */}
        {pincodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pincodes.slice(0, 6).map((pin: string) => (
              <span key={pin} className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                {pin}
              </span>
            ))}
            {pincodes.length > 6 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">
                +{pincodes.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Add Area Form ─────────────────────────────────────────────────────────────

const AddAreaForm: React.FC<{
  isLoading: boolean;
  onSubmit: (data: CreateServiceAreaRequest) => void;
  onCancel: () => void;
}> = ({ isLoading, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', city: '', state: '',
    pincodes: '', radius_km: 10,
    priority: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Area name is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.pincodes.trim()) errs.pincodes = 'At least one pincode is required';
    else {
      const pins = formData.pincodes.split(',').map(p => p.trim()).filter(Boolean);
      const invalid = pins.filter(p => !/^\d{6}$/.test(p));
      if (invalid.length) errs.pincodes = `Invalid pincodes: ${invalid.join(', ')}`;
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSubmit({
      name: formData.name,
      city: formData.city,
      state: formData.state,
      center_latitude: 0.0,
      center_longitude: 0.0,
      radius_km: Number(formData.radius_km),
      postal_codes: formData.pincodes.split(',').map(p => p.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Area Name</label>
        <input
          name="name" value={formData.name} onChange={handleChange}
          placeholder="e.g., Patna Central or South Delhi"
          className={`w-full p-3.5 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#FEC925]'
          }`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
          <input
            name="city" value={formData.city} onChange={handleChange}
            placeholder="e.g., Patna"
            className={`w-full p-3.5 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
              errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#FEC925]'
            }`}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.city}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
          <input
            name="state" value={formData.state} onChange={handleChange}
            placeholder="e.g., Bihar"
            className={`w-full p-3.5 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
              errors.state ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#FEC925]'
            }`}
          />
          {errors.state && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.state}</p>}
        </div>
      </div>

      {/* Radius */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Service Radius — <span className="text-[#1a1a1a] font-bold">{formData.radius_km} km</span>
        </label>
        <input
          name="radius_km" type="range" min="1" max="50" step="1"
          value={formData.radius_km}
          onChange={e => setFormData(p => ({ ...p, radius_km: Number(e.target.value) }))}
          className="w-full accent-[#FEC925]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>1 km</span><span>25 km</span><span>50 km</span>
        </div>
      </div>

      {/* Pincodes */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Pincodes
          <span className="ml-1 font-normal text-gray-400">(comma-separated, 6-digit)</span>
        </label>
        <input
          name="pincodes" value={formData.pincodes} onChange={handleChange}
          placeholder="e.g., 800001, 800002, 800003"
          className={`w-full p-3.5 border-2 rounded-xl text-sm font-mono focus:outline-none transition-colors ${
            errors.pincodes ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#FEC925]'
          }`}
        />
        {errors.pincodes && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.pincodes}</p>}
        {/* Live preview */}
        {formData.pincodes && !errors.pincodes && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {formData.pincodes.split(',').map(p => p.trim()).filter(Boolean).map(pin => (
              <span key={pin} className="text-xs font-mono bg-[#FEC925]/20 text-[#1a1a1a] px-2 py-0.5 rounded-lg">
                {pin}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-sm shadow-sm hover:bg-[#f0bc1a] active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          Add Service Area
        </button>
        <button
          type="button" onClick={onCancel}
          className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const PartnerAreaPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: areas, isLoading } = useQuery({
    queryKey: ['partnerServiceAreas'],
    queryFn: partnerService.getServiceAreas,
  });

  const addMutation = useMutation({
    mutationFn: (payload: CreateServiceAreaRequest) => partnerService.addServiceArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerServiceAreas'] });
      toast.success('Service area added!');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add area.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (areaId: string) => partnerService.deleteServiceArea(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerServiceAreas'] });
      toast.success('Service area removed.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove area.');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this service area? You may miss leads from this zone.')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredAreas = areas?.filter(a => {
    if (filter === 'active') return a.is_active;
    if (filter === 'inactive') return !a.is_active;
    return true;
  }) ?? [];

  const activeCount = areas?.filter(a => a.is_active).length ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Service Areas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Define where you provide services</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm hover:bg-[#2d2d2d] transition-colors"
        >
          <Plus size={16} /> {showForm ? 'Close' : 'Add Area'}
        </button>
      </div>

      {/* ── Stats ── */}
      {areas && areas.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-gray-900">{areas.length}</p>
            <p className="text-xs text-gray-500">Total Areas</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-emerald-600">{activeCount}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-gray-400">{areas.length - activeCount}</p>
            <p className="text-xs text-gray-500">Inactive</p>
          </div>
        </div>
      )}

      {/* ── Add Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#FEC925]/10 rounded-xl">
              <MapPin size={18} className="text-[#1a1a1a]" />
            </div>
            <h3 className="font-bold text-gray-900">Add New Service Area</h3>
          </div>
          <div className="p-6 md:p-8">
            <AddAreaForm
              isLoading={addMutation.isPending}
              onSubmit={addMutation.mutate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* ── Areas List ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FEC925]/10 rounded-xl">
              <Map size={20} className="text-[#1a1a1a]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">My Service Areas</h2>
          </div>
          {/* Filter tabs */}
          {areas && areas.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(['all', 'active', 'inactive'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredAreas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAreas.map(area => (
                <AreaCard
                  key={area.id}
                  area={area}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-gray-400" />
              </div>
              {areas && areas.length > 0 ? (
                <>
                  <h3 className="font-bold text-gray-700 mb-1">No {filter} areas</h3>
                  <p className="text-sm text-gray-500">Try switching the filter above</p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-gray-700 mb-1">No service areas defined</h3>
                  <p className="text-sm text-gray-500 mb-4">Add service areas to start receiving leads in your zones</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-sm hover:bg-[#f0bc1a] transition-colors"
                  >
                    <Plus size={16} /> Add First Area
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tip ── */}
      <div className="flex items-start gap-3 p-4 bg-[#FEC925]/10 border border-[#FEC925]/40 rounded-xl">
        <AlertCircle size={16} className="text-[#1a1a1a] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 leading-relaxed">
          Leads are assigned based on your service areas and radius. Having more specific areas with
          accurate pincodes improves your lead matching accuracy.
        </p>
      </div>
    </div>
  );
};