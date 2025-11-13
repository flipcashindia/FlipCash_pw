import React from "react";
import { ArrowRight } from "lucide-react";

const BecomePartnerBanner: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Become Our Partner Today!
        </h2>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
          Join our network of trusted partners, get access to exclusive leads, and start earning attractive commissions.
        </p>
        <a
          href="/partner-signup" // You'll want to link this to your partner registration page
          className="inline-flex items-center justify-center px-10 py-4 
                     border border-white text-lg font-semibold rounded-full shadow-lg 
                     bg-white text-teal-600 hover:bg-gray-100 hover:text-teal-700 
                     transition-transform duration-300 hover:scale-105"
        >
          Join Now
          <ArrowRight size={22} className="ml-3" />
        </a>
      </div>
    </section>
  );
};

export default BecomePartnerBanner;