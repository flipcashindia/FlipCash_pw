import React from 'react';

// --- Reusable Policy Section ---
const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
    <div className="space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </div>
);

// --- Main Refund Policy Page Component ---
const RefundPolicyPage: React.FC = () => {
  return (
    <section className="bg-white">
      {/* Page Header Banner */}
      <div 
        className="py-16 md:py-20" 
        style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Refund Policy
          </h1>
          <div className="flex justify-center items-center text-sm text-gray-600">
            <a href="/" className="hover:text-red-600 transition-colors">Home</a>
            <span className="mx-2">»</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 md:p-10 border rounded-2xl shadow-lg prose prose-lg max-w-none">
            
            <p className="text-lg text-gray-600 mb-8">
              At Flipcash, we are committed to transparency and fairness. Our refund policy is designed to be clear and straightforward, covering both purchases and sales made through our platform.
            </p>

            <PolicySection title="1. For Buyers: Purchasing Refurbished Devices">
              <p>
                We stand by the quality of our certified refurbished devices. If you are not satisfied with your purchase, you are eligible for a refund or replacement under the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>7-Day Hassle-Free Returns:</strong> You may return any device purchased from Flipcash within 7 days of delivery for a full refund, no questions asked. The device must be in the same condition you received it in, with all original accessories and packaging.
                </li>
                <li>
                  <strong>Warranty Claims:</strong> All our devices come with a standard 6-month (or 1-year, depending on the product) warranty. If your device malfunctions within the warranty period, you are eligible for a free repair, replacement, or a full refund if a replacement is not available.
                </li>
                <li>
                  <strong>How to Initiate a Return:</strong> To initiate a return, please go to your "My Orders" page, select the order, and click "Request Return." Our team will arrange for a pickup.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="2. For Sellers: Selling Your Old Device">
              <p>
                We aim to provide instant and fair payment for your old devices. Our process is built on trust and accuracy.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Quote Guarantee:</strong> The quote you receive online is based on the information you provide. If the device condition matches your description upon inspection by our agent, you are guaranteed to receive the full quoted amount.
                </li>
                <li>
                  <strong>Re-Quote and Cancellation:</strong> If our agent finds a discrepancy in the device's condition (e.g., more scratches than stated, functional issues), they will provide a revised quote on the spot.
                </li>
                <li>
                  <strong>Your Right to Refuse:</strong> You have zero obligation to accept the new quote. If you are not satisfied with the re-quoted price, you may cancel the transaction instantly. There are no cancellation fees, and our agent will leave without the device.
                </li>
                <li>
                  <strong>No Refunds After Sale:</strong> Once you have accepted the final price (either the original quote or a revised quote) and received payment, the sale is final. As you are the seller receiving payment, a "refund" from you to Flipcash is not applicable.
                </li>
              </ul>
            </PolicySection>
            
            <PolicySection title="3. General Terms">
              <p>
                <strong>Processing Time:</strong> For buyers, once a returned item is received and inspected at our facility, your refund will be processed within 3-5 business days to your original payment method or your Flipcash Wallet, as per your preference.
              </p>
              <p>
                <strong>Contact Us:</strong> If you have any questions about our refund policy or a specific transaction, please contact our support team through the <a href="/contact" className="text-teal-600 font-semibold hover:underline">Contact Us</a> page or your account's <a href="/my-account/helpdesk" className="text-teal-600 font-semibold hover:underline">Helpdesk</a>.
              </p>
            </PolicySection>

          </div>
        </div>
      </div>
    </section>
  );
};

export default RefundPolicyPage;

