// src/pages/partner/catalog/BrandsPage.tsx
import React from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Loader2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { catalogService, type Brand, type Category } from '../../../api/services/catalogService';

const BrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const category = location.state?.category as Category | undefined;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['catalog', 'brands', categoryId],
    queryFn: () => catalogService.getBrands(categoryId!),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleSelectBrand = (brand: Brand) => {
    navigate(`/partner/catalog/categories/${categoryId}/brands/${brand.id}/models`, {
      state: { category, brand },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-yellow-500 mb-4" />
        <p className="text-gray-600">Loading brands...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Brands</h3>
        <p className="text-gray-600 text-center mb-6">
          {error instanceof Error ? error.message : 'Failed to load brands'}
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
        <span className="text-gray-900 font-medium">{category?.name || 'Brands'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/partner/catalog')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category?.name || 'Brands'}</h1>
              <p className="text-gray-600 mt-1">Select a brand to view available models</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      {data?.results && data.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.results.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleSelectBrand(brand)}
              className="group bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center">
                {/* Logo */}
                <div className="w-24 h-24 mb-4 rounded-2xl bg-gray-50 group-hover:bg-yellow-50 flex items-center justify-center transition-colors">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/96x96/f5f5f5/cccccc?text=' + brand.name[0];
                    }}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors">
                  {brand.name}
                </h3>

                {/* Lead Count */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full">
                  <Package size={16} />
                  <span className="font-medium">
                    {brand.available_lead_count} {brand.available_lead_count === 1 ? 'Lead' : 'Leads'}
                  </span>
                </div>

                {/* Hover Arrow */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={20} className="text-yellow-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Package size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Brands Available</h3>
          <p className="text-gray-500">No brands found in this category</p>
        </div>
      )}
    </div>
  );
};

export default BrandsPage;