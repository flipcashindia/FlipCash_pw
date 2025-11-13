import React from 'react';
import { type Category } from '../../types/catalog.types';

interface LeadFiltersProps {
  onFilterChange: (filters: any) => void;
  categories: Category[];
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ onFilterChange, categories }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold mb-3">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'low') onFilterChange({ min_price: 0, max_price: 10000 });
              else if (value === 'medium') onFilterChange({ min_price: 10000, max_price: 30000 });
              else if (value === 'high') onFilterChange({ min_price: 30000, max_price: undefined });
              else onFilterChange({ min_price: undefined, max_price: undefined });
            }}
          >
            <option value="">All Prices</option>
            <option value="low">Under ₹10,000</option>
            <option value="medium">₹10,000 - ₹30,000</option>
            <option value="high">Above ₹30,000</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            onChange={(e) => onFilterChange({ ordering: e.target.value })}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-estimate_price">Highest Price</option>
            <option value="estimate_price">Lowest Price</option>
          </select>
        </div>
      </div>
    </div>
  );
};