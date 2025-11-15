// src/pages/partner/catalog/CategoriesPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { catalogService, type Category } from '../../../api/services/catalogService';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: catalogService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const handleSelectCategory = (category: Category) => {
    navigate(`/partner/catalog/categories/${category.id}/brands`, {
      state: { category },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-yellow-500 mb-4" />
        <p className="text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Categories</h3>
        <p className="text-gray-600 text-center mb-6">
          {error instanceof Error ? error.message : 'Failed to load categories'}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Catalog</h1>
          <p className="text-gray-600 mt-1">Select a category to discover available leads</p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-black">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Find Your Next Deal</h2>
            <p className="text-black/80">
              Browse through verified devices and claim leads instantly
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-black/10 rounded-lg px-6 py-4">
            <div className="text-3xl font-bold">
              {data?.results.reduce((sum, cat) => sum + cat.available_lead_count, 0) || 0}
            </div>
            <div className="text-sm text-black/80">Total Leads Available</div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {data?.results && data.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.results.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelectCategory(category)}
              className="group bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-24 h-24 mb-4 rounded-2xl bg-gray-50 group-hover:bg-yellow-50 flex items-center justify-center transition-colors">
                  <img
                    src={category.icon}
                    alt={category.name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/96x96/f5f5f5/cccccc?text=' + category.name[0];
                    }}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors">
                  {category.name}
                </h3>

                {/* Lead Count */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full">
                  <Package size={16} />
                  <span className="font-medium">
                    {category.available_lead_count} {category.available_lead_count === 1 ? 'Lead' : 'Leads'}
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Available</h3>
          <p className="text-gray-500">Check back later for new device categories</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;