import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Users, Target, TrendingUp, Clock, Shield, ArrowRight, Phone, Mail } from 'lucide-react';

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
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="flex flex-col items-center text-center p-5 sm:p-6 lg:p-7 xl:p-8 bg-white rounded-2xl lg:rounded-3xl border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 group h-full"
  >
    {/* Icon with gradient background on hover */}
    <div className="relative mb-5 sm:mb-6">
      <motion.div 
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300"
      >
        <Icon className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11" strokeWidth={2} />
      </motion.div>
      {/* Decorative element */}
      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-[#FEC925] to-[#1B8A05] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    
    <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#1B8A05] transition-colors duration-300 leading-tight">
      {title}
    </h3>
    <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

// --- Stats Component ---
const StatsBar: React.FC = () => {
  const stats = [
    { value: "100+", label: "Active Partners" },
    { value: "₹20L+", label: "Monthly Earnings" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "Partner Support" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 mt-10 sm:mt-12 lg:mt-16 mb-12 sm:mb-14 lg:mb-20"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -5, scale: 1.05 }}
          className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl lg:rounded-2xl border border-gray-200 hover:border-gray-300 text-center transition-all duration-300 hover:shadow-lg"
        >
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-[#FEC925] to-[#1B8A05] bg-clip-text text-transparent mb-1 sm:mb-2">
            {stat.value}
          </p>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{stat.label}</p>
        </motion.div>
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
      title: "Profit-Driven Earnings",
      description: "Partners earn by buying verified devices and reselling them for profit. Earnings depend on device condition, market demand, and resale value — with complete transparency and no hidden charges.",
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
      description: "Scale your business with performance bonuses. Top performers get priority leads, higher profits.",
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
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements - more for large screens */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 lg:w-[600px] lg:h-[600px] bg-[#FEC925] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 lg:w-[600px] lg:h-[600px] bg-[#1B8A05] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Container with better max-width for large screens */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] relative">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 lg:mb-14"
        >
          <div className="inline-block mb-3 sm:mb-4 lg:mb-6">
            <span className="bg-gradient-to-r from-[#FEC925] to-[#1B8A05] text-white text-xs sm:text-sm lg:text-base font-semibold px-4 py-2 lg:px-6 lg:py-3 rounded-full shadow-md">
              Partner Program
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 leading-tight px-4">
            Why Partner With FlipCash?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
            Join India's fastest-growing device buyback platform. Earn competitive commissions, 
            work flexibly, and grow your business with comprehensive support.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <StatsBar />

        {/* Benefits Grid - Optimized for all screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 mb-12 sm:mb-16 lg:mb-20">
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

        {/* CTA Section - Better mobile and desktop optimization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl lg:rounded-3xl xl:rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-14 xl:p-20 text-center shadow-2xl mt-12 sm:mt-16 lg:mt-20 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEC925] opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1B8A05] opacity-10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
              Ready to Start Earning?
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
              Join our network of successful partners across India. Start receiving leads today and grow your income.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center mb-8 sm:mb-10 lg:mb-14">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-[#FEC925] to-[#1B8A05] text-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-full flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                Become a Partner
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-white text-gray-900 font-semibold text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-full border-2 border-white hover:bg-gray-50 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </div>
            
            {/* Trust badges */}
            <div className="pt-6 sm:pt-8 lg:pt-10 border-t border-gray-700">
              <p className="text-gray-400 text-xs sm:text-sm lg:text-base mb-4 sm:mb-5 lg:mb-6">Trusted by professionals across India</p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 xl:gap-10 items-center">
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="text-xs sm:text-sm lg:text-base">Verified Platform</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="text-xs sm:text-sm lg:text-base">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="text-xs sm:text-sm lg:text-base">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Info Section - Better responsive design */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-blue-50 via-green-50 to-blue-50 rounded-2xl lg:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 border border-blue-100"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 lg:gap-8 xl:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h4 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                Have Questions?
              </h4>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600 leading-relaxed">
                Our team is here to help you understand the partnership process and get started quickly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 w-full lg:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-white text-gray-900 font-semibold text-xs sm:text-sm lg:text-base px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-xl lg:rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 whitespace-nowrap"
              >
                Download Brochure
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gray-900 text-white font-semibold text-xs sm:text-sm lg:text-base px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-xl lg:rounded-2xl hover:bg-gray-800 transition-all duration-300 whitespace-nowrap"
              >
                Contact Support
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Contact Bar for Mobile - Touch Friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-12 lg:hidden"
        >
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="tel:+911234567890"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FEC925] to-[#1B8A05] text-white font-semibold text-sm px-4 py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <Phone size={18} />
              <span>Call Us</span>
            </a>
            <a 
              href="mailto:partners@flipcash.in"
              className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold text-sm px-4 py-4 rounded-xl border-2 border-gray-200 shadow-lg active:scale-95 transition-transform"
            >
              <Mail size={18} />
              <span>Email Us</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerBenefitsSection;