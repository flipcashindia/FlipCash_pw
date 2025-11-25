import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Users, Target, TrendingUp, Clock, Shield, ArrowRight } from 'lucide-react';

// --- Benefit Card Component ---
interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -8 }}
    className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group"
  >
    {/* Icon with gradient background on hover */}
    <div className="relative mb-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
        <Icon size={36} strokeWidth={2} />
      </div>
      {/* Decorative element */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#FEC925] to-[#1B8A05] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1B8A05] transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-600 text-sm leading-relaxed">
      {description}
    </p>
  </motion.div>
);

// --- Stats Component ---
const StatsBar: React.FC = () => {
  const stats = [
    { value: "500+", label: "Active Partners" },
    { value: "₹50L+", label: "Monthly Earnings" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "Partner Support" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12 mb-16"
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 text-center"
        >
          <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FEC925] to-[#1B8A05] bg-clip-text text-transparent mb-2">
            {stat.value}
          </p>
          <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
        </div>
      ))}
    </motion.div>
  );
};

// --- Main Section ---
const PartnerBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Briefcase,
      title: "Verified Leads Daily",
      description: "Access premium leads in your area. Every lead is verified and ready to convert with customers actively looking to sell their devices.",
    },
    {
      icon: DollarSign,
      title: "Lucrative Earnings",
      description: "Earn up to ₹500 per device verification. Weekly payouts with transparent commission structure and no hidden charges.",
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Work on your own terms. Choose your working hours, accept leads at your convenience, and maintain work-life balance.",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "24/7 partner assistance team. Get instant help with technical issues, lead queries, and payment support whenever you need.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Guaranteed weekly payouts directly to your bank. Complete transparency with detailed earnings dashboard and instant payment tracking.",
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Scale your business with performance bonuses. Top performers get priority leads, higher commissions, and exclusive incentives.",
    },
    {
      icon: Target,
      title: "Training Provided",
      description: "Complete onboarding and regular training sessions. Learn best practices, verification techniques, and customer handling skills.",
    },
    {
      icon: Briefcase,
      title: "Business Tools",
      description: "Professional partner app with lead management, navigation, payment tracking, and performance analytics - all in one place.",
    },
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FEC925] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1B8A05] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-[#FEC925] to-[#1B8A05] text-white text-sm font-semibold px-4 py-2 rounded-full">
              Partner Program
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Partner With FlipCash?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join India's fastest-growing device buyback platform. Earn competitive commissions, 
            work flexibly, and grow your business with comprehensive support.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <StatsBar />

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              index={index}
            />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-16"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h3>
          <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Join our network of successful partners across India. Start receiving leads today and grow your income.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#FEC925] to-[#1B8A05] text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Become a Partner
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-900 font-semibold px-8 py-4 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
            >
              Learn More
            </motion.button>
          </div>
          
          {/* Trust badges */}
          <div className="mt-10 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-4">Trusted by professionals across India</p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <div className="flex items-center gap-2 text-gray-300">
                <Shield size={18} />
                <span className="text-sm">Verified Platform</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <DollarSign size={18} />
                <span className="text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users size={18} />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 md:p-8 border border-blue-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Have Questions?
              </h4>
              <p className="text-gray-600 text-sm">
                Our team is here to help you understand the partnership process and get started quickly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 whitespace-nowrap">
                Download Brochure
              </button>
              <button className="bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 whitespace-nowrap">
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerBenefitsSection;