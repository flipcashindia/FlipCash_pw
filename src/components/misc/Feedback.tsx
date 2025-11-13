import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const Feedback: React.FC = () => {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for your feedback!');
    setRating(0);
    setComment('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
        <p className="text-gray-600 mb-6">Help us improve our services</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                  <Star size={32} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comments</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={5} className="w-full p-3 border rounded-lg" required />
          </div>
          <button type="submit" className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;