import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Loader2,
  MapPin,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

// --- Types ---
type PartnerStep =
  | "permissions"
  | "mobile"
  | "details"
  | "otp"
  | "serviceArea"
  | "success";

// --- Reusable Input (Copied from AuthModal) ---
const OnboardingInput: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  required?: boolean;
}> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  maxLength,
  required = true,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      required={required}
    />
  </div>
);

// --- Step-by-Step Animation Variants (Copied from AuthModal) ---
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// --- Stepper Dots (Copied from AuthModal, colors updated to teal) ---
const StepperDots: React.FC<{ steps: number; currentStep: number }> = ({
  steps,
  currentStep,
}) => (
  <div className="flex justify-center gap-2 mb-8">
    {Array.from({ length: steps }).map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i === currentStep ? "bg-teal-500 scale-125" : "bg-gray-300"
        }`}
      />
    ))}
  </div>
);

// --- Main Partner Onboarding Page ---
const PartnerSignUp: React.FC<{
  onLoginSuccess: (token: string) => void;
}> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState("");

  // State
  const [mobile, setMobile] = useState("");
  const [partnerStep, setPartnerStep] = useState<PartnerStep>("permissions");
  const [partnerOtp, setPartnerOtp] = useState("");
  const [partnerDetails, setPartnerDetails] = useState({
    name: "",
    email: "",
  });
  const [pincode, setPincode] = useState("");
  const [mockPincodes, setMockPincodes] = useState<string[]>([]);

  // --- Animation Helper ---
  const paginate = (newDirection: number) => {
    setDirection(newDirection);
  };

  // --- Form Handlers ---
  const handlePartnerDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPartnerDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- Partner Flow ---
  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (partnerStep === "permissions") {
      console.log("Permissions granted (simulated)");
      setMockPincodes(["110001", "110002", "122001", "122002"]);
      paginate(1);
      setPartnerStep("mobile");
    } else if (partnerStep === "mobile") {
      console.log("Partner Mobile:", mobile);
      paginate(1);
      setPartnerStep("details");
    } else if (partnerStep === "details") {
      console.log("Sending OTP to:", mobile, "for", partnerDetails.name);
      paginate(1);
      setPartnerStep("otp");
    } else if (partnerStep === "otp") {
      if (partnerOtp === "123456") {
        console.log("OTP Verified");
        paginate(1);
        setPartnerStep("serviceArea");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } else if (partnerStep === "serviceArea") {
      if (!pincode) {
        setError("Please select a service area pincode.");
        return;
      }
      console.log("Partner Onboarding Complete:", {
        ...partnerDetails,
        mobile,
        pincode,
      });
      paginate(1);
      setPartnerStep("success");
    }
  };

  // --- Success Step Timer ---
  useEffect(() => {
    let timer: any;
    if (partnerStep === "success") {
      timer = setTimeout(() => {
        console.log("Partner onboarding success, redirecting to my-account");
        onLoginSuccess("mock-partner-token-pending-kyc-789");
        navigate("/my-account");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [partnerStep, navigate, onLoginSuccess]);

  // --- Back Button Logic ---
  const handleBack = () => {
    setError("");
    paginate(-1);

    if (partnerStep === "mobile") setPartnerStep("permissions");
    else if (partnerStep === "details") setPartnerStep("mobile");
    else if (partnerStep === "otp") setPartnerStep("details");
    else if (partnerStep === "serviceArea") setPartnerStep("otp");
    else if (partnerStep === "permissions") navigate("/"); // Go back to home from first step
  };

  // --- Stepper Dot Logic ---
  const getPartnerStepIndex = () => {
    switch (partnerStep) {
      case "permissions": return 0;
      case "mobile": return 1;
      case "details": return 2;
      case "otp": return 3;
      case "serviceArea": return 4;
      default: return 0;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto max-w-lg">
        <div className="bg-white p-8 md:p-12 shadow-xl rounded-lg">
          
          {/* --- New Page Header --- */}
          <div className="text-center mb-10 border-b pb-6 relative">
            <button
              onClick={handleBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Partner Onboarding
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Join our network and start earning today.
            </p>
          </div>

          <AnimatePresence mode="wait" custom={direction}>

            {/* Step 1: Permissions */}
            {partnerStep === "permissions" && (
              <motion.form
                key="partner-permissions"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onSubmit={handlePartnerSubmit}
                className="space-y-6 text-center"
              >
                <StepperDots steps={5} currentStep={getPartnerStepIndex()} />
                <MapPin size={64} className="mx-auto text-teal-500" />
                <h3 className="text-xl font-semibold">Location Access</h3>
                <p className="text-gray-600">
                  To become a partner, we need to know your service area.
                  Please allow location access to find serviceable pincodes.
                </p>
                <button
                  type="submit"
                  className="w-full bg-teal-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors !mt-8"
                >
                  Allow Location Access
                </button>
              </motion.form>
            )}

            {/* Step 2: Mobile */}
            {partnerStep === "mobile" && (
              <motion.form
                key="partner-mobile"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onSubmit={handlePartnerSubmit}
                className="space-y-6"
              >
                <StepperDots steps={5} currentStep={getPartnerStepIndex()} />
                <p className="text-gray-600 text-center">
                  Enter your mobile number to create your partner account.
                </p>
                <OnboardingInput
                  label="Mobile Number"
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={10}
                />
                <button
                  type="submit"
                  className="w-full bg-teal-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
                >
                  Continue
                </button>
              </motion.form>
            )}

            {/* Step 3: Details */}
            {partnerStep === "details" && (
              <motion.form
                key="partner-details"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onSubmit={handlePartnerSubmit}
                className="space-y-4"
              >
                <StepperDots steps={5} currentStep={getPartnerStepIndex()} />
                <p className="text-gray-600 text-center pb-4">
                  Just a few more details to get you set up.
                </p>
                <OnboardingInput
                  label="Full Name"
                  id="name"
                  value={partnerDetails.name}
                  onChange={handlePartnerDetailsChange}
                />
                <OnboardingInput
                  label="Email"
                  id="email"
                  type="email"
                  value={partnerDetails.email}
                  onChange={handlePartnerDetailsChange}
                />
                <button
                  type="submit"
                  className="w-full bg-teal-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors !mt-8"
                >
                  Get OTP
                </button>
              </motion.form>
            )}

            {/* Step 4: OTP */}
            {partnerStep === "otp" && (
              <motion.form
                key="partner-otp"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onSubmit={handlePartnerSubmit}
                className="space-y-6"
              >
                <StepperDots steps={5} currentStep={getPartnerStepIndex()} />
                <p className="text-gray-600 text-center">
                  We've sent an OTP to{" "}
                  <span className="font-semibold text-black">{mobile}</span>.
                </p>
                <OnboardingInput
                  label="Enter OTP"
                  id="partnerOtp"
                  type="text"
                  value={partnerOtp}
                  onChange={(e) => setPartnerOtp(e.target.value)}
                  maxLength={6}
                />
                {error && (
                  <p className="text-red-600 text-sm text-center">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-teal-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
                >
                  Verify OTP
                </button>
              </motion.form>
            )}

            {/* Step 5: Service Area */}
            {partnerStep === "serviceArea" && (
              <motion.form
                key="partner-service"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onSubmit={handlePartnerSubmit}
                className="space-y-6"
              >
                <StepperDots steps={5} currentStep={getPartnerStepIndex()} />
                <p className="text-gray-600 text-center">
                  Select your primary service pincode from the list.
                </p>
                <div>
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Service Area Pincode
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="pincode"
                    name="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="" disabled>
                      -- Select a pincode --
                    </option>
                    {mockPincodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
                {error && (
                  <p className="text-red-600 text-sm text-center">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-teal-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors !mt-8"
                >
                  Complete Onboarding
                </button>
              </motion.form>
            )}

            {/* Step 6: Success */}
            {partnerStep === "success" && (
              <motion.div
                key="partner-success"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col items-center justify-center h-64"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  <ShieldCheck
                    size={80}
                    className="text-teal-500"
                    strokeWidth={2}
                  />
                </motion.div>
                <h3 className="text-2xl font-bold mt-6">
                  Onboarding Complete!
                </h3>
                <p className="text-gray-600 mt-2">
                  Next up: KYC Verification.
                </p>
                <Loader2 size={24} className="animate-spin mt-4" />
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PartnerSignUp;