import React, { useState } from "react";
import { Star } from "lucide-react";

const Feedback: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">We'd Love to Hear From You</h1>
      <p className="text-gray-600 mt-2 mb-6">
        How was your experience with Flipcash?
      </p>
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please rate your overall experience <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill={
                    star <= (hoverRating || rating)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="thoughts" className="block text-sm font-medium text-gray-700 mb-1">
            Share your thoughts (optional)
          </label>
          <textarea
            id="thoughts"
            rows={5}
            placeholder="What did you like? What could be improved?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;