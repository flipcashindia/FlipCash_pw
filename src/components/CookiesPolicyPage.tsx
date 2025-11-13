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

// --- Main Cookies Policy Page Component ---
const CookiesPolicyPage: React.FC = () => {
  return (
    <section className="bg-white">
      {/* Page Header Banner */}
      <div 
        className="py-16 md:py-20" 
        style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cookies Policy
          </h1>
          <div className="flex justify-center items-center text-sm text-gray-600">
            <a href="/" className="hover:text-red-600 transition-colors">Home</a>
            <span className="mx-2">»</span>
            <span>Cookies Policy</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Using prose for clean typography styling */}
          <div className="bg-white p-6 md:p-10 border rounded-2xl shadow-lg prose prose-lg max-w-none">
            
            <p className="text-lg text-gray-600 mb-8">
              This Cookies Policy explains how Flipcash ("we", "us", "our") uses cookies and similar technologies when you visit our website. This policy should be read alongside our <a href="/privacy" className="text-teal-600 font-semibold hover:underline">Privacy Policy</a>.
            </p>

            <PolicySection title="1. What Are Cookies?">
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
              </p>
            </PolicySection>

            <PolicySection title="2. How We Use Cookies">
              <p>
                We use cookies for several reasons, detailed below. Unfortunately, in most cases, there are no industry-standard options for disabling cookies without completely disabling the functionality and features they add to this site.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account-related cookies:</strong> If you create an account with us, we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out, but in some cases, they may remain afterward to remember your site preferences.
                </li>
                <li>
                  <strong>Login-related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
                </li>
                <li>
                  <strong>Order processing cookies:</strong> This site offers e-commerce or payment facilities, and some cookies are essential to ensure that your order is remembered between pages so that we can process it properly.
                </li>
                <li>
                  <strong>Site preferences cookies:</strong> To provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="3. Types of Cookies We Use">
              <ul>
                <li>
                  <strong>Essential Cookies:</strong> These are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.
                </li>
                <li>
                  <strong>Performance Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are.
                </li>
                <li>
                  <strong>Functional Cookies:</strong> These are used to recognize you when you return to our website and enable us to personalize our content for you and remember your preferences (for example, your choice of language or region).
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Your Choices">
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by setting or amending your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
              </p>
            </PolicySection>
            
            <PolicySection title="5. Changes to This Policy">
              <p>
                We may update this Cookies Policy from time to time. We will notify you of any changes by posting the new Cookies Policy on this page. We encourage you to review this Cookies Policy periodically for any changes.
              </p>
            </PolicySection>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CookiesPolicyPage;
