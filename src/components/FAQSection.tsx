import React, { useState } from 'react';
import { ChevronDown} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <motion.button
        className={`flex justify-between items-center w-full text-left py-4 px-6 md:px-8 text-lg font-semibold transition-colors duration-200 
                    ${isOpen ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <motion.span
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={24} />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-blue-50"
          >
            <p className="px-6 md:px-8 pb-4 text-gray-700 text-base leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection: React.FC = () => {
  // --- [CONTENT CHANGED] ---
  // FAQs are now rewritten for the Partner's Point of View
  const faqs = [
    {
      question: "How do I become a Flipcash Partner?",
      answer: "You can start the process by navigating to our 'Partner Sign Up' page. You will need to complete a few steps: verify your mobile number, provide your personal details, and finally, complete our KYC verification process. Once approved, your dashboard will be activated."
    },
    {
      question: "How do I get new leads?",
      answer: "Once your account is active, you can go to the 'New Leads' tab in your partner dashboard. This section shows a live list of all available device pickup requests from customers in your designated service area. You can filter them and claim the ones you want."
    },
    {
      question: "What is a 'Claim Fee'?",
      answer: "A 'Claim Fee' is a small percentage of the device's estimated value, which is deducted from your wallet when you claim a lead. This confirms your commitment to the visit. This fee is automatically refunded to your wallet if the customer cancels the visit."
    },
    {
      question: "How and when do I get paid?",
      answer: "After you successfully complete a visit, verify the device, and the customer accepts the final price, your commission for the lead is credited to your 'My Wallet' in the dashboard. You can then withdraw your available balance to your bank account or UPI."
    },
    {
      question: "What if I have an issue with a customer or a lead?",
      answer: "If you encounter any problems, such as a dispute over device condition or a payment issue, you can use the 'Raise Dispute' tab in your dashboard to create a support ticket. For general questions, please use the 'Helpdesk' tab."
    },
  ];
  // --- [END CONTENT CHANGE] ---

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;