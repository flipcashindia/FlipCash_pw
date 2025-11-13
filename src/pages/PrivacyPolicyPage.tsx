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

// --- Main Privacy Policy Page Component ---
const PrivacyPolicyPage: React.FC = () => {
  return (
    <section className="bg-white">
      {/* Page Header Banner */}
      <div 
        className="py-16 md:py-20" 
        style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <div className="flex justify-center items-center text-sm text-gray-600">
            <a href="/" className="hover:text-red-600 transition-colors">Home</a>
            <span className="mx-2">»</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Using prose for clean typography styling */}
          <div className="bg-white p-6 md:p-10 border rounded-2xl shadow-lg prose prose-lg max-w-none">
            
            <p className="text-lg text-gray-600 mb-8">
              Your privacy is critically important to us. At Flipcash, we have a few fundamental principles:
            </p>
            <ul className="list-disc pl-6 mb-8 text-lg text-gray-600">
              <li>We are thoughtful about the personal information we ask you to provide and the personal information that we collect about you through the operation of our services.</li>
              <li>We store personal information for only as long as we have a reason to keep it.</li>
              <li>We aim for full transparency on how we gather, use, and share your personal information.</li>
            </ul>

            <PolicySection title="1. Information We Collect">
              <p>
                We only collect information about you if we have a reason to do so—for example, to provide our Services, to communicate with you, or to make our Services better.
              </p>
              <ul>
                <li>
                  <strong>Information You Provide to Us:</strong> We collect information that you provide directly to us. For example, we collect information when you create an account, sell a device, make a purchase, or fill out a contact form. This includes your name, email address, phone number, and shipping/pickup address.
                </li>
                <li>
                  <strong>Device Information (When Selling):</strong> When you sell a device, we collect information about that device, such as its model, condition, and serial number (IMEI), to provide an accurate quote and prevent fraud.
                </li>
                <li>
                  <strong>Transaction Information:</strong> We collect information in connection with transactions you complete on our Platform, including product details, purchase price, and payment information (e.g., UPI ID or bank account details for payouts).
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="2. How We Use Your Information">
              <p>
                We use the information we collect in the following ways:
              </p>
              <ul>
                <li>To provide, maintain, and improve our Services (e.g., to process your buyback order or fulfill your purchase).</li>
                <li>To communicate with you, respond to your help requests, and send you marketing communications (which you can opt out of).</li>
                <li>To verify your identity and prevent fraud.</li>
                <li>To process payments and payouts.</li>
                <li>To personalize your experience on our Platform.</li>
              </ul>
            </PolicySection>

            <PolicySection title="3. How We Share Information">
              <p>We do not sell our users' private personal information.</p>
              <ul>
                <li>
                  <strong>With Your Consent:</strong> We may share information with your consent.
                </li>
                <li>
                  <strong>Third-Party Vendors:</strong> We may share information with third-party vendors who need to know information about you in order to provide their services to us (e.g., payment providers, logistics partners for pickup/delivery).
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose information about you in response to a subpoena, court order, or other governmental request.
                </li>
                <li>
                  <strong>Data Erasure (When Selling):</strong> When you sell a device to Flipcash, you are responsible for erasing all personal data from it. While our internal processes include a factory reset, Flipcash is not liable for any data left on your device.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Data Security">
              <p>
                We use a combination of technical, administrative, and physical controls to maintain the security of your data. While no service is 100% secure, we work very hard to protect information about you against unauthorized access, use, alteration, or destruction.
              </p>
            </PolicySection>

            <PolicySection title="5. Your Rights">
              <p>
                You have several choices available when it comes to information about you:
              </p>
              <ul>
                <li>
                  <strong>Limit Information:</strong> You can choose not to provide certain information, but this may mean you are unable to use certain features.
                </li>
                <li>
                  <strong>Access and Update:</strong> You can review and update your personal information (like your name and address) in your "Account Details" and "Addresses" sections of your account.
                </li>
                <li>
                  <strong>Opt-Out of Communications:</strong> You may opt out of receiving promotional messages from us by following the instructions in those messages.
                </li>
              </ul>
            </PolicySection>
            
            <PolicySection title="6. Contact Us">
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul>
                <li><strong>Email:</strong> support@flipcash.com</li>
                <li><strong>Phone:</strong> (64) 8342 1245</li>
              </ul>
            </PolicySection>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;
