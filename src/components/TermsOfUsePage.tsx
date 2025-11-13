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

// --- Main Terms of Use Page Component ---
const TermsOfUsePage: React.FC = () => {
  return (
    <section className="bg-white">
      {/* Page Header Banner */}
      <div 
        className="py-16 md:py-20" 
        style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Use
          </h1>
          <div className="flex justify-center items-center text-sm text-gray-600">
            <a href="/" className="hover:text-red-600 transition-colors">Home</a>
            <span className="mx-2">»</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Using prose for clean typography styling */}
          <div className="bg-white p-6 md:p-10 border rounded-2xl shadow-lg prose prose-lg max-w-none">
            
            <p className="text-lg text-gray-600 mb-8">
              Welcome to Flipcash ("we", "us", "our"). These Terms of Use ("Terms") govern your access to and use of our website, mobile applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
            </p>

            <PolicySection title="1. Membership and Accounts">
              <p>
                To access certain features of our Services, you must register for an account. By creating an account, you warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are at least eighteen (18) years old or the age of legal majority in your jurisdiction.</li>
                <li>You will provide accurate, current, and complete information during registration and will update such information to keep it accurate.</li>
                <li>You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use.</li>
              </ul>
            </PolicySection>

            <PolicySection title="2. Permitted Use and Compliance">
              <p>
                We grant you a limited, non-exclusive, non-transferable license to access and use the Services for your personal and commercial use related to selling or buying devices as intended through the Platform.
              </p>
              <p>You agree that you will comply with all applicable laws and regulations. You will not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Engage in any conduct that restricts or inhibits any other person from using or enjoying the Services.</li>
                <li>Modify, reproduce, distribute, or otherwise exploit any part of the Services without our express written permission.</li>
                <li>Use the Services for any fraudulent, harmful, or unlawful purpose.</li>
                <li>Introduce any viruses, malware, or other harmful code to the Platform.</li>
              </ul>
            </PolicySection>
            
            <PolicySection title="3. Copyright and Trademarks">
              <p>
                All materials in the Services, including but not limited to text, software, photos, graphics, the Flipcash logo, and other trademarks, are the property of Flipcash or its licensors and are protected by international copyright and trademark laws. Any violation of these restrictions may result in infringement that can subject you to civil and/or criminal penalties.
              </p>
            </PolicySection>
            
            <PolicySection title="4. Privacy">
              <p>
                We value and protect your privacy. Please review our <a href="/privacy" className="text-teal-600 font-semibold hover:underline">Privacy Policy</a>, as it contains important information relating to your use of the Services and how we handle your personal data.
              </p>
            </PolicySection>

            <PolicySection title="5. Warranty Disclaimers">
              <p>
                THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ANY AND ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p>
                WE DO NOT WARRANT THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, BE ALWAYS AVAILABLE, UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
              </p>
            </PolicySection>

            <PolicySection title="6. Limitation of Liability">
              <p>
                UNDER NO CIRCUMSTANCES WILL YOU BE ENTITLED TO RECOVER FROM US ANY INCIDENTAL, CONSEQUENTIAL, INDIRECT, PUNITIVE, OR SPECIAL DAMAGES (INCLUDING DAMAGES FOR LOSS OF BUSINESS OR LOSS OF PROFITS), WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE ARISING FROM OR RELATING TO THE SERVICES.
              </p>
            </PolicySection>
            
            <PolicySection title="7. Indemnity">
              <p>
                You agree to indemnify and hold Flipcash and its affiliates, officers, directors, employees, and agents harmless, including costs and legal fees, from any claim or demand made by any third party due to or arising out of (i) your access to or use of the Services, or (ii) your violation of these Terms.
              </p>
            </PolicySection>
            
            <PolicySection title="8. Governing Law">
              <p>
                You and Flipcash agree that all matters arising from or relating to the use and operation of the Services will be governed by the substantive laws of the Republic of India, and will be heard and resolved in the courts located in New Delhi.
              </p>
            </PolicySection>

            <PolicySection title="9. Changes to Terms">
              <p>
                We reserve the right to modify these Terms at any time. Any changes will be effective immediately upon posting. Your continued use of our Services after the posting of any changes constitutes your acceptance of the modified Terms.
              </p>
            </PolicySection>

          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsOfUsePage;
