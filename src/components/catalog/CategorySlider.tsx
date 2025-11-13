import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
import { type Category } from '../../types/catalog.types';

interface CategorySliderProps {
  categories: Category[];
  onCategoryClick?: (categoryId: string) => void;
}

const CategoryCard: React.FC<{ category: Category; onClick: () => void }> = ({ category, onClick }) => (
  <button onClick={onClick} className="flex-shrink-0 w-44 md:w-48 scroll-snap-align-start group focus:outline-none">
    <div className="flex flex-col items-center p-6 bg-gray-100 rounded-2xl h-full transition-all duration-300 hover:shadow-md hover:bg-white">
      {category.image_url && <img src={category.image_url} alt={category.name} className="w-32 h-32 object-contain transition-transform duration-300 group-hover:scale-105" />}
      <h3 className="mt-4 text-base font-semibold text-gray-900 text-center">{category.name}</h3>
    </div>
  </button>
);

const CategorySlider: React.FC<CategorySliderProps> = ({ categories, onCategoryClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // const [isDragging, setIsDragging] = useState(false);
  // const [startX, setStartX] = useState(0);
  // const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 192;
      const scrollAmount = (cardWidth + 24) * (direction === 'left' ? -1 : 1);
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Explore Categories</h2>
        <div className="relative">
          <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide py-4">
            {categories.map((category) => <CategoryCard key={category.id} category={category} onClick={() => onCategoryClick?.(category.id)} />)}
          </div>
          <button onClick={() => handleScroll('left')} className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-10 w-12 h-12 rounded-full bg-[#ffe208] shadow-md flex items-center justify-center hover:bg-yellow-300">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => handleScroll('right')} className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 w-12 h-12 rounded-full bg-[#ffe208] shadow-md flex items-center justify-center hover:bg-yellow-300">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;