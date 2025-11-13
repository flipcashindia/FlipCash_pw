import React from 'react';

// --- Brand Data ---
import appleLogo from '../assets/Brands/apple_logo.png';
import samsungLogo from '../assets/Brands/samsung_logo.png';
import vivoLogo from '../assets/Brands/vivo_logo.png';
import oppoLogo from '../assets/Brands/Oppo_logo.png';
import miLogo from '../assets/Brands/Mi_logo.png';
import lenovoLogo from '../assets/Brands/Lenovo_logo.png';

const brands = [
  { name: 'Apple', href: '#', imgSrc: appleLogo },
  { name: 'Samsung', href: '#', imgSrc: samsungLogo },
  { name: 'Vivo', href: '#', imgSrc: vivoLogo },
  { name: 'Lenovo', href: '#', imgSrc: lenovoLogo },
  { name: 'Oppo', href: '#', imgSrc: oppoLogo },
  { name: 'Xiaomi', href: '#', imgSrc: miLogo },
];

const TopBrands: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="group grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {brands.map((brand) => (
            <a
              key={brand.name}
              href={brand.href}
              className={`
                relative flex items-center justify-center h-28 md:h-32 bg-white
                transition-all duration-300 ease-in-out
                group-hover:grayscale group-hover:opacity-60
                hover:!grayscale-0 hover:!opacity-100
              `}
              aria-label={`Shop ${brand.name}`}
            >
              <img
                src={brand.imgSrc}
                alt={brand.name}
                className="max-h-20 w-auto object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrands;
