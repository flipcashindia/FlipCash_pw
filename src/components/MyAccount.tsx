import React, { useState, useEffect } from "react";
// import KYCVerification from "./KYCVerification";
import { Loader2 } from "lucide-react";
import PartnerDashboard from "./PartnerDashboard"; 

// Mock partner data (still needed for KYCVerification prop)
// const mockPartner = {
//   name: "Rohan", // Make sure this matches
//   email: "rohan@example.com",
//   mobile: "9876543210",
// };

const MyAccount: React.FC = () => {
  const [kycStatus, setKycStatus] = useState<"pending" | "approved" | "loading">(
    "loading" // Start in loading state
  );

  useEffect(() => {
    const fetchStatus = () => {
      console.log("Fetching KYC status...");
      setTimeout(() => {
        // --- !!! SET TO "approved" TO SEE DASHBOARD !!! ---
        setKycStatus("approved");
        // setKycStatus("pending");
      }, 500);
    };
    fetchStatus();
  }, []);

  if (kycStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 size={48} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (kycStatus === "pending") {
    // If pending, show the full KYC verification component
    return (
      // <KYCVerification
      //   partnerData={{
      //     name: mockPartner.name,
      //     email: mockPartner.email,
      //     mobile: mockPartner.mobile,
      //   }}
      //   onKycComplete={() => setKycStatus("approved")} // Simulates submission
      // />
      <p>kyc</p>
    );
  }

  // If approved, show the main partner dashboard
  return <PartnerDashboard />;
};

export default MyAccount;