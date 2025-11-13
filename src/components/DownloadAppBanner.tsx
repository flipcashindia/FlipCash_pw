import React from "react";
import { ArrowRight } from "lucide-react";
import AppDemoImg from "../assets/AppDemoImg.png";

// Image import
const appPhoneMockup = AppDemoImg;

const DownloadAppBanner: React.FC = () => {
  return (
    <section
      className="py-16"
      style={{
        // Keeping the gradient as-is, let me know if you want this changed!
        background: "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 40%, #ffffff 100%)",
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* --- Text Content --- */}
          <div className="md:w-1/2 text-center md:text-left">
            
            {/* --- [BRANDING CHANGE] --- */}
            <span className="text-teal-600 font-semibold text-sm uppercase">
              {/* --- [CONTENT CHANGE] --- */}
              Manage Leads on the Go
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">
              {/* --- [CONTENT CHANGE] --- */}
              Get Instant Lead Alerts
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-lg mx-auto md:mx-0">
              {/* --- [CONTENT CHANGE] --- */}
              Download the Flipcash Partner app to receive new lead alerts,
              manage your pickups, and track your commissions — all from your phone.
            </p>
            <a
              href="#" // You'll want to update this link to the app store
              // --- [BRANDING CHANGE] ---
              className="inline-flex items-center justify-center px-8 py-3 
                       border border-transparent text-base font-medium rounded-full shadow-lg 
                       text-white bg-teal-500 hover:bg-teal-600 
                       transition-transform duration-300 hover:scale-105"
            >
              {/* --- [CONTENT CHANGE] --- */}
              Get the Partner App
              <ArrowRight size={20} className="ml-2" />
            </a>
          </div>

          {/* --- Image Content (No Change) --- */}
          <div className="md:w-1/2 flex justify-center">
            <img
              src={appPhoneMockup}
              alt="Flipcash Partner App Mockup" // Alt text updated
              className="w-90 h-90 md:w-100 md:h-100 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppBanner;