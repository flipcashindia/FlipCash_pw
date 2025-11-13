import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft } from "lucide-react";

// --- Types ---
type AuthView = "main" | "login"; // Simplified: No more 'partner'
type LoginStep = "mobile" | "otp";

// --- Reusable Input (No Change) ---
const AuthInput: React.FC<{
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
      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-black"
      required={required}
    />
  </div>
);

// --- Step-by-Step Animation Variants (No Change) ---
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

// --- AuthModal Component (Simplified) ---
const AuthModal: React.FC<{
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}> = ({ onClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>("main");
  const [direction, setDirection] = useState(0);
  const [error, setError] = useState("");

  // Common state
  const [mobile, setMobile] = useState("");

  // Login state
  const [loginStep, setLoginStep] = useState<LoginStep>("mobile");
  const [loginOtp, setLoginOtp] = useState("");

  // --- Animation Helper ---
  const paginate = (newDirection: number) => {
    setDirection(newDirection);
  };

  // --- Login Flow ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (loginStep === "mobile") {
      console.log("Sending OTP to:", mobile);
      paginate(1);
      setView("login"); 
      setLoginStep("otp");
    } else if (loginStep === "otp") {
      if (loginOtp === "123456") {
        console.log("Login Success");
        onLoginSuccess("mock-access-token-123");
        onClose();
        navigate("/my-account"); // Or wherever logged-in users go
      } else {
        setError("Invalid OTP. Please try again.");
      }
    }
  };

  // --- Reset Function (Simplified) ---
  const resetFlow = () => {
    setView("main");
    setLoginStep("mobile");
    setMobile("");
    setLoginOtp("");
    setError("");
  };

  const handleBack = () => {
    setError("");
    paginate(-1);
    if (loginStep === "otp") {
      setLoginStep("mobile");
      setView("main"); // Go back to the main mobile entry
    } else {
      resetFlow();
    }
  };

  // --- Dynamic Header (Simplified) ---
  const getHeader = () => {
    if (view === "login") {
      if (loginStep === "otp") return "Verify Number";
      return "Log In";
    }
    return "Log In"; // Default for 'main'
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 right-0 w-full max-w-md h-screen bg-white z-50 shadow-xl overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <button
            onClick={handleBack}
            className={`text-black hover:opacity-70 transition-opacity ${
              view === "main" ? "opacity-0 pointer-events-none" : ""
            }`}
            aria-hidden={view === "main" ? true : undefined}
          >
            <ArrowLeft size={24} />
          </button>

          <h2 className="text-xl font-bold text-center">{getHeader()}</h2>
          <button
            onClick={onClose}
            aria-label="Close login"
            className="text-black hover:opacity-70 transition-opacity"
          >
            <X size={28} />
          </button>
        </div>

        {/* This container holds all the animated steps */}
        <div className="p-8">
          <AnimatePresence mode="wait" custom={direction}>
            {/* --- Main View (Button Removed) --- */}
            {view === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <AuthInput
                    label="Mobile Number"
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    maxLength={10}
                  />
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <div className="space-y-4 pt-4">
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Send OTP
                    </button>
                    {/* "Become Our Partner" button removed */}
                  </div>
                </form>
              </motion.div>
            )}

            {/* --- Login Flow --- */}
            {view === "login" && loginStep === "otp" && (
                <motion.form
                  key="login-otp"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={direction}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-6"
                >
                  <p className="text-gray-600">
                    We've sent an OTP to{" "}
                    <span className="font-semibold text-black">{mobile}</span>
                    .
                  </p>
                  <AuthInput
                    label="Enter OTP"
                    id="loginOtp"
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    maxLength={6}
                  />
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </button>
                </motion.form>
            )}
            
            {/* --- Partner Flow Removed --- */}

          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default AuthModal;