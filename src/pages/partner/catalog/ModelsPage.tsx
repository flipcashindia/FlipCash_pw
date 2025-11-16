// src/pages/partner/catalog/ModelsPage.tsx
import React from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  IndianRupee,
} from 'lucide-react';
import { catalogService, type Model, type Category, type Brand } from '../../../api/services/catalogService';

const ModelsPage: React.FC = () => {
  const navigate = useNavigate();
  // UPDATED: Get both categoryId and brandId from params
  const { categoryId, brandId } = useParams<{ categoryId: string; brandId: string }>();
  const location = useLocation();
  const category = location.state?.category as Category | undefined;
  const brand = location.state?.brand as Brand | undefined;

  // UPDATED: Pass both IDs to the query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['catalog', 'models', categoryId, brandId],
    queryFn: () => catalogService.getModels(categoryId!, brandId!),
    enabled: !!(categoryId && brandId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleSelectModel = (model: Model) => {
    navigate(`/partner/catalog/models/${model.id}/leads`, {
      state: { category, brand, model },
    });
  };

  // ... rest of the component remains the same
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-yellow-500 mb-4" />
        <p className="text-gray-600">Loading models...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Models</h3>
        <p className="text-gray-600 text-center mb-6">
          {error instanceof Error ? error.message : 'Failed to load models'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link
          to="/partner/catalog"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Categories
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <Link
          to={`/partner/catalog/categories/${category?.id}/brands`}
          state={{ category }}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {category?.name}
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">{brand?.name || 'Models'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{brand?.name || 'Models'}</h1>
              <p className="text-gray-600 mt-1">Select a model to view available leads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Models List */}
      {data?.results && data.results.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model)}
              className="group w-full bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-6">
                {/* Image */}
                <div className="flex-shrink-0 w-28 h-28 rounded-xl bg-gray-50 group-hover:bg-yellow-50 flex items-center justify-center transition-colors overflow-hidden">
                  <img
                    src={model.primary_image}
                    alt={model.name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/112x112/f5f5f5/cccccc?text=' + model.name[0];
                    }}
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-yellow-700 transition-colors">
                    {model.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Storage Options */}
                    {model.storage_options && model.storage_options.length > 0 && (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <span className="font-medium">Storage:</span>
                        <span>{model.storage_options.join(', ')}</span>
                      </div>
                    )}
                    
                    {/* RAM Options */}
                    {model.ram_options && model.ram_options.length > 0 && (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">
                        <span className="font-medium">RAM:</span>
                        <span>{model.ram_options.join(', ')}</span>
                      </div>
                    )}
                    
                    {/* Launch Year */}
                    <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      <span>{model.launch_year}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Lead Count */}
                    <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                      <Package size={16} />
                      <span className="font-semibold">
                        {model.available_lead_count} {model.available_lead_count === 1 ? 'Lead' : 'Leads'}
                      </span>
                    </div>

                    {/* Base Price */}
                    <div className="flex items-center space-x-1 text-gray-600">
                      <IndianRupee size={16} />
                      <span className="text-sm">
                        Base: <span className="font-semibold">{parseFloat(model.base_price).toLocaleString('en-IN')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <ChevronRight size={28} className="text-yellow-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Package size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Models Available</h3>
          <p className="text-gray-500">No models found for this brand</p>
        </div>
      )}
    </div>
  );
};

export default ModelsPage;