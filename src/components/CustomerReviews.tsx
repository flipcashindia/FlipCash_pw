import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";
import DefaultUser from "../assets/User.png";

// --- Data Types ---
interface Product {
  name: string;
  price: string;
  image: string;
}

interface Review {
  id: number;
  customerName: string;
  isVerified: boolean;
  rating: number;
  reviewText: string;
  product: Product; // We'll repurpose this for "Partner Focus"
}

// --- [CONTENT CHANGED] ---
// Mock data is now from a Partner's Point of View
const reviewData: Review[] = [
  {
    id: 1,
    customerName: "Rohan K.",
    isVerified: true,
    rating: 5,
    reviewText:
      "Onboarding was surprisingly fast. I was verified and claiming my first leads the very next day. This is a serious upgrade for my business.",
    product: {
      name: "Primary Focus: iPhones",
      price: "Avg. Commission: ₹2,500",
      image: DefaultUser,
    },
  },
  {
    id: 2,
    customerName: "Priya Mobiles",
    isVerified: true,
    rating: 5,
    reviewText:
      "I love the 'New Leads' flow. I can filter by my area and get a steady stream of pickups. My weekly earnings have been consistent and growing.",
    product: {
      name: "Primary Focus: Samsung",
      price: "Avg. Commission: ₹1,800",
      image: DefaultUser,
    },
  },
  {
    id: 3,
    customerName: "Delhi Electronics",
    isVerified: true,
    rating: 5,
    reviewText:
      "The wallet system is transparent. I can see all my earnings, claim fees, and withdraw my money instantly. No more waiting for bank transfers.",
    product: {
      name: "Primary Focus: Laptops",
      price: "Avg. Commission: ₹4,000",
      image: DefaultUser,
    },
  },
  {
    id: 4,
    customerName: "Ankit G.",
    isVerified: true,
    rating: 5,
    reviewText:
      "The counter-offer feature is fantastic. It gives me the flexibility to negotiate based on the actual device condition. It's fair for everyone.",
    product: {
      name: "Primary Focus: Smart Watches",
      price: "Avg. Commission: ₹1,200",
      image: DefaultUser,
    },
  },
  {
    id: 5,
    customerName: "South Blr Partners",
    isVerified: true,
    rating: 5,
    reviewText:
      "My earnings have increased by 30% since joining. The app is easy to use and I get instant notifications for new leads.",
    product: {
      name: "Primary Focus: All Devices",
      price: "Avg. Weekly: ₹25,000",
      image: DefaultUser,
    },
  },
  {
    id: 6,
    customerName: "Mike B.",
    isVerified: false,
    rating: 5,
    reviewText:
      "Incredible value. The 'sell my device' process was simple and I got a fair price. Used the credit to buy a new tablet.",
    product: {
      name: "Galaxy Tab S9",
      price: "₹620.00", // Changed to Rupees
      image: DefaultUser,
    },
  },
  {
    id: 7,
    customerName: "Alpha B.",
    isVerified: false,
    rating: 3,
    reviewText:
      "Good platform, but sometimes the lead notifications are a bit slow. Support team is responsive though.",
    product: {
      name: "Galaxy Tab S10",
      price: "₹680.00", // Changed to Rupees
      image: DefaultUser,
    },
  },
  {
    id: 8,
    customerName: "Bate B.",
    isVerified: false,
    rating: 4,
    reviewText:
      "The KYC process took a day longer than I expected, but once it was done, everything has been very smooth. Happy with the partnership.",
    product: {
      name: "Samsung S9",
      price: "₹450.00", // Changed to Rupees
      image: DefaultUser,
    },
  },
  {
    id: 9,
    customerName: "Ponk B.",
    isVerified: false,
    rating: 5,
    reviewText:
      "I recommend this to any mobile shop owner. It's a great way to get extra business with zero marketing effort on my part.",
    product: {
      name: "Galaxy H9",
      price: "₹690.00", // Changed to Rupees
      image: DefaultUser,
    },
  },
];

// --- Star Rating Component (No Change) ---
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5 text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={18} fill={i < rating ? "currentColor" : "none"} />
    ))}
  </div>
);

// --- Single Review Card Component (UPDATED) ---
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="flex flex-col justify-between h-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
        {review.isVerified && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle size={14} />
            {/* --- [CONTENT CHANGED] --- */}
            Verified Partner
          </span>
        )}
      </div>
      <StarRating rating={review.rating} />
      <p className="text-gray-600 text-md leading-relaxed mt-4">
        {review.reviewText}
      </p>
    </div>
    <div className="border-t border-gray-200 mt-6 pt-4">
      <div className="flex items-center gap-4">
        <img
          src={review.product.image}
          alt={review.product.name}
          className="w-14 h-14 rounded-lg bg-gray-50 object-contain"
        />
        <div>
          <p className="text-md font-medium text-gray-800">
            {/* --- [CONTENT CHANGED] --- */}
            Partner Focus: {review.product.name}
          </p>
          <p className="text-xl font-bold text-teal-600 mt-1">
            {/* --- [STYLE/CONTENT CHANGED] --- */}
            {review.product.price}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Carousel Component (UPDATED) ---
const CustomerReviews: React.FC = () => {
  const [page, setPage] = useState(0);
  const reviewsPerPage = 3;
  const numPages = Math.ceil(reviewData.length / reviewsPerPage);

  useEffect(() => {
    const interval = setInterval(() => {
      setPage((prevPage) => (prevPage + 1) % numPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [numPages]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute",
    }),
  };

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          {/* --- [CONTENT CHANGED] --- */}
          What Our Partners Say
        </h2>

        {/* Carousel Container */}
        <div className="relative h-[420px] md:h-[380px]">
          <AnimatePresence initial={false} custom={page}>
            <motion.div
              key={page}
              custom={page}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="absolute w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {reviewData
                .slice(page * reviewsPerPage, (page + 1) * reviewsPerPage)
                .map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[...Array(numPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                // --- [STYLE CHANGED] ---
                i === page ? "w-6 bg-teal-600" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to review page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;