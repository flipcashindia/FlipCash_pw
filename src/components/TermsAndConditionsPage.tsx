import React from 'react';

// --- Reusable Policy Section ---
const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
    <div className="space-y-4 text-gray-700 leading-relaxed prose-p:my-3 prose-ul:my-4 prose-li:my-2">
      {children}
    </div>
  </div>
);

// --- Main Terms & Conditions Page Component ---
const TermsAndConditionsPage: React.FC = () => {
  return (
    <section className="bg-white">
      {/* Page Header Banner */}
      <div 
        className="py-16 md:py-20" 
        style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <div className="flex justify-center items-center text-sm text-gray-600">
            <a href="/" className="hover:text-red-600 transition-colors">Home</a>
            <span className="mx-2">»</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Using prose for clean typography styling */}
          <div className="bg-white p-6 md:p-10 border rounded-2xl shadow-lg prose prose-lg max-w-none">
            
            <p className="text-lg text-gray-600 mb-8">
              Welcome to Flipcash. These terms and conditions ("Terms") govern your ("you" or "User") access to and use of our website and mobile application ("App" or "Platform") and the services provided by us.
            </p>

            <PolicySection title="1. Introduction">
              <p>
                Please read these Terms carefully. By accessing or using the Platform, you signify your acceptance to be bound by the Terms. This is a legally binding contract between you and Flipcash. If you do not agree with any part of these Terms, you must refrain from accessing or using our Platform.
              </p>
            </PolicySection>

            <PolicySection title="2. Definitions">
              <ul>
                <li><strong>"Customer"</strong> is any entity or individual that has requested to sell their used device or purchase a refurbished device through Flipcash.</li>
                <li><strong>"Lead"</strong> is a confirmed intent of the Customer to sell an old device post the acceptance of a price determined by Flipcash.</li>
                <li><strong>"Re-quote"</strong> is a process where the initial price is re-evaluated based on an in-person inspection of the device.</li>
              </ul>
            </PolicySection>

            <PolicySection title="3. Membership & Account">
              <p>
                To use certain services, you must register for an account. You represent and warrant that:
              </p>
              <ul>
                <li>You are of legal age to form a binding contract (at least 18 years old).</li>
                <li>You will provide us with accurate, current, and complete registration information and keep this information updated.</li>
                <li>You are responsible for keeping your password secure and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Scope of Services (For Sellers)">
              <ol className="list-decimal pl-6">
                <li>A Customer receives a price quote for their electronic gadget on the Platform.</li>
                <li>If the Customer accepts, they schedule a pickup.</li>
                <li>An authorized Flipcash agent will visit the Customer's address to complete the pickup.</li>
                <li>The agent will verify the device condition. If the condition matches the description, the agent will pay the full quoted amount.</li>
                <li>If the condition does not match, the agent will provide a "Re-quote." The Customer has the full right to accept or reject this new offer without any penalty.</li>
                <li>The Customer must provide valid ID proof and/or an original bill for the device if requested.</li>
                <li>The Customer must ensure all personal data is erased, and SIM/memory cards are removed from the device before handing it over.</li>
              </ol>
            </PolicySection>
            
            <PolicySection title="5. Scope of Services (For Buyers)">
              <p>
                Customers may purchase certified refurbished devices from the Platform. All devices are subject to our warranty and return policies as specified in our <a href="/refund-policy" className="text-teal-600 font-semibold hover:underline">Refund Policy</a>.
              </p>
            </PolicySection>

            <PolicySection title="6. User Covenants">
              <p>You agree to use the Platform in strict compliance with all applicable laws. You must not:</p>
              <ul>
                <li>Use the Platform for any purpose that is unlawful or prohibited by these Terms.</li>
                <li>Engage in activities that infringe on the rights of others (e.g., intellectual property).</li>
                <li>Upload or transmit any harmful, fraudulent, deceptive, or abusive content.</li>
                <li>Interfere with the operation of the Platform, including introducing malware, viruses, or initiating denial-of-service attacks.</li>
              </ul>
            </PolicySection>

            <PolicySection title="7. Intellectual Property">
              <p>
                All materials on the Platform, including text, software, photos, graphics, the Flipcash logo, and other trademarks, are the property of Flipcash or its licensors and are protected by copyright and trademark laws. You may not use, modify, reproduce, or distribute any of the content without our prior written permission.
              </p>
            </PolicySection>

            <PolicySection title="8. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Flipcash and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages, including loss of profits or data, arising from your use of our Platform. The Platform and its services are provided on an "as is" and "as available" basis without warranties of any kind.
              </p>
            </PolicySection>

            <PolicySection title="9. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.
              </p>
            </PolicySection>
            
            <PolicySection title="10. Contact Us">
              <p>
                If you have any questions or concerns about these Terms, please contact us at:
              </p>
              <ul>
                <li><strong>Email:</strong> support@flipcash.com</li>
                <li><strong>Phone:</strong> (64) 8342 1245</li>
                <li><strong>Address:</strong> 123 Flipcash Tower, Tech Park, New Delhi, 110001, India</li>
              </ul>
            </PolicySection>

          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsAndConditionsPage;

