import React from 'react';
import { Briefcase, DollarSign, Users, Target } from 'lucide-react'; // Lucide icons

// --- [NEW] Benefit Card Component ---
// This component replaces the old "BenefitItem" and the separate icon bar.
// It holds the icon, title, and description together.
interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-4">
    {/* Icon with its own black, circular background */}
    <div className="bg-black text-white rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-lg">
      <Icon size={40} strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 text-sm max-w-xs">
      {description}
    </p>
  </div>
);

// --- Main Section (Refactored) ---
const PartnerBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Briefcase,
      title: "Exclusive Leads",
      description: "Get access to a steady stream of verified leads in your service area. Maximize your potential.",
    },
    {
      icon: DollarSign,
      title: "High Commissions",
      description: "Earn competitive commission rates on every successful transaction. Transparent and timely payouts.",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Benefit from our dedicated partner support team ready to assist you every step of the way.",
    },
    {
      icon: Target,
      title: "Flexible Work",
      description: "Manage your workload and schedule according to your availability. Work on your own terms.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* --- Heading (No Change) --- */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Benefits of Partnering With Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock new opportunities and grow your business with our robust partner program.
          </p>
        </div>

        {/* --- [REMOVED] --- 
          The separate black icon bar is gone.
        */}

        {/* --- [CHANGED] --- 
          This single grid now handles everything responsively.
          - 1 column on mobile (default)
          - 2 columns on medium screens (md:)
          - 4 columns on large screens (lg:)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerBenefitsSection;