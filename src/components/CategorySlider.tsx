import React, { useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Image Imports (make sure paths are correct) ---
import phoneImg from '../assets/Category/phone.png';
import earphonesImg from '../assets/Category/Earphone.png';
import cablesImg from '../assets/Category/Cables.png';
import watchImg from '../assets/Category/Watch.png';
import chargerImg from '../assets/Category/Charger.png';
import laptopImg from '../assets/Category/Laptop.png';

// --- Data Types ---
interface Category {
  id: number;
  name: string;
  image: string;
}

// --- Category Data ---
const categoryData: Category[] = [
  { id: 1, name: 'Phones', image: phoneImg },
  { id: 2, name: 'Earphones', image: earphonesImg },
  { id: 3, name: 'Cables', image: cablesImg },
  { id: 4, name: 'Smart Watches', image: watchImg },
  { id: 5, name: 'Chargers', image: chargerImg },
  { id: 6, name: 'Laptops', image: laptopImg },
];

// --- Category Card ---
const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to your SelectModal page (adjust route if needed)
    navigate('/select-brand');
  };

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 w-44 md:w-48 scroll-snap-align-start group focus:outline-none"
    >
      <div className="flex flex-col items-center p-6 bg-gray-100 rounded-2xl h-full transition-all duration-300 hover:shadow-md hover:bg-white">
        <img
          src={category.image}
          alt={category.name}
          className="w-32 h-32 object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <h3 className="mt-4 text-base font-semibold text-gray-900 text-center">
          {category.name}
        </h3>
      </div>
    </button>
  );
};

// --- Slider Navigation Buttons ---
const SliderButton: React.FC<{ onClick: () => void; direction: 'left' | 'right' }> = ({ onClick, direction }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-10
                w-12 h-12 rounded-full bg-[#ffe208] shadow-md
                flex items-center justify-center text-black
                hover:bg-yellow-300 transition-colors duration-200
                ${direction === 'left' ? 'left-2 md:left-4' : 'right-2 md:right-4'}
                opacity-50 hover:opacity-100`}
    aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
  >
    {direction === 'left' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
  </button>
);

// --- Main Category Slider ---
const CategorySlider: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('button')?.clientWidth || 192;
      const scrollAmount = (cardWidth + 24) * (direction === 'left' ? -1 : 1);

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftStart(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftStart(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => setIsDragging(false);
  const handleTouchEnd = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeftStart - walk;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Explore Lead Categories</h2>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className={`flex gap-6 overflow-x-auto cursor-grab snap-x snap-mandatory scroll-smooth scrollbar-hide py-4 ${isDragging ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            {categoryData.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <SliderButton onClick={() => handleScroll('left')} direction="left" />
          <SliderButton onClick={() => handleScroll('right')} direction="right" />
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
