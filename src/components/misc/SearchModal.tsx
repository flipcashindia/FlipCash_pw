import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
// import { useCatalog } from '../../hooks/useCatalog';

interface SearchModalProps {
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  // const { models, loadModels } = useCatalog();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // loadModels({ search: query });
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for devices..." className="flex-1 p-3 border rounded-lg" />
          <button type="submit" className="px-6 py-3 bg-teal-500 text-white rounded-lg"><Search size={20} /></button>
        </form>
      </motion.div>
    </>
  );
};

export default SearchModal;