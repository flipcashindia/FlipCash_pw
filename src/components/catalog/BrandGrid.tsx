import React from 'react';
import { type Brand } from '../../types/catalog.types';

interface BrandGridProps {
  brands: Brand[];
  onBrandClick: (brandId: string) => void;
}

const BrandGrid: React.FC<BrandGridProps> = ({ brands, onBrandClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {brands.map((brand) => (
        <button key={brand.id} onClick={() => onBrandClick(brand.id)} className="p-6 bg-white border rounded-xl hover:shadow-lg transition">
          {brand.logo_url && <img src={brand.logo_url} alt={brand.name} className="w-full h-20 object-contain mb-2" />}
          <p className="text-center font-semibold">{brand.name}</p>
        </button>
      ))}
    </div>
  );
};

export default BrandGrid;