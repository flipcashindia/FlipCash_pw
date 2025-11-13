import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How do I become a partner?', a: 'Click on "Become Partner" and complete the registration with your business details and KYC documents.' },
  { q: 'What is the claim fee?', a: 'A small fee is deducted from your wallet when you claim a lead. This ensures commitment from partners.' },
  { q: 'How do I withdraw earnings?', a: 'Navigate to My Wallet and choose between UPI or Bank Transfer to withdraw your earnings.' },
  { q: 'What if customer details are incorrect?', a: 'You can raise a dispute from the Dispute section with relevant evidence.' },
];

const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow">
              <button onClick={() => setOpen(open === idx ? null : idx)} className="w-full p-6 text-left flex justify-between items-center">
                <span className="font-semibold">{faq.q}</span>
                <ChevronDown className={`transition-transform ${open === idx ? 'rotate-180' : ''}`} />
              </button>
              {open === idx && <div className="px-6 pb-6 text-gray-600">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;