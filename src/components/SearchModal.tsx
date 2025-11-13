import React from "react";
import { motion } from "framer-motion";
import { X, Search } from "lucide-react";

// --- Data for Search ---
const searchProducts = [
  {
    name: "Apple iPhone 16 Pro",
    image: "https://placehold.co/300x300/f5f5f5/333?text=iPhone+16+Pro",
  },
  {
    name: "Apple iPhone 16",
    image: "https://placehold.co/300x300/f5f5f5/333?text=iPhone+16",
  },
  {
    name: "Apple iPhone 15 Pro Max",
    image: "https://placehold.co/300x300/f5f5f5/333?text=iPhone+15+Pro",
  },
  {
    name: "Apple iPhone 14",
    image: "https://placehold.co/300x300/f5f5f5/333?text=iPhone+14",
  },
  {
    name: "Apple iPhone 13 Mini",
    image: "https://placehold.co/300x300/f5f5f5/333?text=iPhone+13+Mini",
  },
  {
    name: "Apple iPhone 13",
    image: "https://placehold.co/300x300/f5f5f5/333?text=iPhone+13",
  },
];

// --- Search Modal Component ---
const SearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-white p-6 md:p-12 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close search"
          className="absolute top-6 right-6 md:top-12 md:right-12 text-black hover:opacity-70 transition-opacity"
        >
          <X size={32} />
        </button>

        {/* Content */}
        <h2 className="text-3xl md:text-4xl font-semibold text-center mt-12 mb-8">
          What are you looking for?
        </h2>

        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="search"
            placeholder="Search"
            className="w-full pl-6 pr-14 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffe208]"
          />
          <button className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">
            <Search size={24} />
          </button>
        </div>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <span className="font-semibold text-gray-600">Popular searches:</span>
          {["Featured", "Trendy", "New", "Sale"].map((tag) => (
            <button
              key={tag}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Featured Products */}
        <h3 className="text-2xl font-semibold mb-6">Featured product</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {searchProducts.map((product) => (
            <a href="#" key={product.name} className="block group text-center">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 aspect-square flex items-center justify-center transition-all group-hover:shadow-lg group-hover:border-transparent">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-800">
                {product.name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchModal;
