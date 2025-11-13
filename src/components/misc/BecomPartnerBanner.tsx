import React from 'react';
import { useNavigate } from 'react-router-dom';

const BecomePartnerBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-teal-50">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">Join hundreds of partners earning with FlipCash</p>
        <button
          onClick={() => navigate('/partner-signup')}
          className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600"
        >
          Become a Partner
        </button>
      </div>
    </section>
  );
};

export default BecomePartnerBanner;