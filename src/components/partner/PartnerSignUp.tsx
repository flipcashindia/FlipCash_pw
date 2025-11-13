// src/pages/PartnerSignUp.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { validateMobile, validatePincode } from '../../utils/validators';
import { Loader2, ArrowRight, CheckCircle, UserCheck, Building, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '../../stores/useModalStore';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../api/services/authService2'; // <-- 2. Import Auth Service (for login)
import { partnerService } from '../../api/services/partnerService'; // <-- 3. Import Partner Service (for signup)
import {  type PartnerSignupCompleteRequest } from '../../api/types/api';
import { handleApiError } from '../../utils/handleApiError'; // <-- Import the error handler

// --- Helper: Get Device ID ---
const getOrCreateDeviceID = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// --- Branded Input Component ---
const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string, isRequired?: boolean }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-semibold text-[#1C1C1B] mb-2">
      {props.label} {props.isRequired && <span className="text-[#FF0000]">*</span>}
    </label>
    <input
      {...props}
      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:ring-4 focus:ring-[#FEC925]/30 focus:outline-none font-medium transition"
    />
  </div>
);

// --- Branded Select Component ---
const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, isRequired?: boolean, children: React.ReactNode }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-semibold text-[#1C1C1B] mb-2">
      {props.label} {props.isRequired && <span className="text-[#FF0000]">*</span>}
    </label>
    <select
      {...props}
      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:ring-4 focus:ring-[#FEC925]/30 focus:outline-none font-medium transition bg-white appearance-none"
    >
      {props.children}
    </select>
  </div>
);

// --- Branded Button ---
const FormButton: React.FC<{
  type: 'submit' | 'button';
  onClick?: () => void;
  isLoading: boolean;
  text: string;
}> = ({ type, onClick, isLoading, text }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={isLoading}
    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#FEC925] to-[#1B8A05] text-[#1C1C1B] rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition"
  >
    {isLoading ? (
      <>
        <Loader2 className="animate-spin" size={24} />
        Processing...
      </>
    ) : (
      <>
        {text}
        <ArrowRight size={20} />
      </>
    )}
  </button>
);

// --- Stepper UI ---
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = [
    { num: 1, title: 'Verify Phone' },
    { num: 2, title: 'Verify OTP' },
    { num: 3, title: 'Business Details' },
  ];
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                currentStep > step.num
                  ? 'bg-[#1B8A05] text-white'
                  : currentStep === step.num
                  ? 'bg-gradient-to-br from-[#FEC925] to-[#1B8A05] text-[#1C1C1B] ring-4 ring-[#FEC925]/50'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step.num ? <CheckCircle size={20} /> : step.num}
            </div>
            <p className={`text-xs font-semibold mt-2 ${currentStep >= step.num ? 'text-[#1C1C1B]' : 'text-gray-500'}`}>
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 transition-all ${
                currentStep > step.num ? 'bg-[#1B8A05]' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Final Success Step ---
const Step4Success: React.FC = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center text-center space-y-4"
    >
      <CheckCircle className="w-20 h-20 text-[#1B8A05]" />
      <h3 className="text-2xl font-bold text-[#1C1C1B]">Profile Submitted!</h3>
      <p className="text-gray-600">
        Thank you! Your profile is now under review by the FlipCash team.
        You can now access your partner dashboard.
      </p>
      <button
        onClick={() => navigate('/partner/dashboard')}
        className="w-full px-6 py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold text-lg"
      >
        Go to Dashboard
      </button>
    </motion.div>
  );
};


// --- Main Component ---
const PartnerSignUp: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const { 
    isAuthenticated, 
    user, 
    login, 
    setUser, 
    setTokens, 
    isLoading: isAuthLoading 
  } = useAuthStore();
  const { openAuthModal } = useModalStore();

  const [step, setStep] = useState<'phone' | 'otp' | 'details' | 'success'>('phone');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    full_name: '',
    email: '',
    business_name: '',
    business_type: 'individual',
    city: '',
    state: '',
    pincode: '',
  });

  // This hook auto-skips steps if logged in
  useEffect(() => {
    if (isAuthLoading) return; 

    if (isAuthenticated() && user) {
      if (user.role === 'partner') {
        toast.info("You are already a partner.");
        navigate('/partner/dashboard');
      } else {
        // Logged in as 'consumer', auto-fill form and skip to Step 3
        setFormData(prev => ({
          ...prev,
          phone: user.phone.replace('+91', ''),
          full_name: user.name || '',
          email: user.email || '',
        }));
        setStep('details');
      }
    } else {
      // Not logged in, start at step 1
      setStep('phone');
    }
  }, [isAuthenticated, user, isAuthLoading, navigate, toast]);


  // Centralized handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'otp' || name === 'pincode') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Step 1: Call LOGIN OTP Service
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMobile(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      // Call the main login OTP service
      const response = await authService.sendLoginOtp({ phone: formData.phone, purpose: 'login' }); 
      setStep('otp');
      toast.success(response.detail);
    } catch (err: any) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Call LOGIN (Verify OTP) Service
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceID();
      
      // This calls the login function from useAuthStore
      await login(formData.phone, formData.otp, deviceId); 

      toast.success("Phone Verified! Please complete your details.");
      // The useEffect will now detect the user is logged in
      // and automatically move to step 'details'.
      
    } catch (err: any) {
      toast.error(handleApiError(err)); //
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Call PRIVATE Complete Signup Service
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) { toast.error('Full name is required'); return; }
    if (!formData.business_name.trim()) { toast.error('Business name is required'); return; }
    if (!formData.city.trim()) { toast.error('City is required'); return; }
    if (!formData.state.trim()) { toast.error('State is required'); return; }
    if (!validatePincode(formData.pincode)) { toast.error('Invalid pincode'); return; }

    setLoading(true);
    try {
      // Payload for the new authenticated endpoint
      // We don't send 'phone' as the backend gets it from the auth token
      const payload: Omit<PartnerSignupCompleteRequest, 'phone'> = {
        full_name: formData.full_name,
        email: formData.email || undefined,
        business_name: formData.business_name,
        // Send business_type if it's in your form/model
        business_type: formData.business_type as PartnerSignupCompleteRequest['business_type'],
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      // Call the new, private API
      const response = await partnerService.completeSignup(payload);
      
      // Manually update the auth store with the NEW user object and tokens
      setTokens(response.data.tokens.access, response.data.tokens.refresh);
      setUser(response.data.user);

      toast.success(response.message);
      setStep('success'); // Go to the final success step
      
    } catch (err: any) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (isAuthLoading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
        </div>
      );
    }

    switch (step) {
      case 'phone':
        return (
          <motion.form
            key="phone"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            onSubmit={handleRequestOTP}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-[#1C1C1B]">Login or Register</h3>
            <p className="text-gray-600">Enter your phone number to login or start your partner registration.</p>
            <FormInput
              label="Phone Number"
              isRequired type="tel" name="phone"
              maxLength={10} value={formData.phone}
              onChange={handleChange} placeholder="Enter your 10-digit mobile number"
            />
            <FormButton type="submit" isLoading={loading} text="Send OTP" />
          </motion.form>
        );
      case 'otp':
        return (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            onSubmit={handleVerifyOTP}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-[#1C1C1B]">Enter OTP</h3>
            <p className="text-gray-600">Enter the 6-digit code sent to <strong className="text-[#1C1C1B]">{formData.phone}</strong>.</p>
            <FormInput
              label="6-Digit OTP"
              isRequired type="text" name="otp"
              maxLength={6} value={formData.otp}
              onChange={handleChange} placeholder="123456"
            />
            <FormButton type="submit" isLoading={loading} text="Verify & Continue" />
            <button type="button" onClick={() => setStep('phone')} className="w-full text-center text-sm font-medium text-[#1B8A05] hover:underline">
              Change phone number?
            </button>
          </motion.form>
        );
      case 'details':
        return (
          <motion.form
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            onSubmit={handleRegister}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-[#1C1C1B]">Complete Your Profile</h3>
            <p className="text-gray-600">Welcome! Please provide your business details to become a partner.</p>
            
            <FormInput
              label="Full Name"
              isRequired type="text" name="full_name"
              value={formData.full_name} onChange={handleChange}
              placeholder="e.g., Ramesh Kumar"
            />
            <FormInput
              label="Email Address"
              type="email" name="email" // Email is optional
              value={formData.email} onChange={handleChange}
              placeholder="e.g., ramesh@example.com"
            />
            <FormInput
              label="Business Name"
              isRequired type="text" name="business_name"
              value={formData.business_name} onChange={handleChange}
              placeholder="e.g., Ramesh Telecom"
            />
            <FormSelect
              label="Business Type"
              isRequired name="business_type"
              value={formData.business_type} onChange={handleChange}
            >
              {/* These values now match your backend view/serializer */}
              <option value="individual">Individual</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="pvt_ltd">Private Limited</option>
              <option value="llp">LLP</option>
            </FormSelect>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="City" isRequired type="text" name="city"
                value={formData.city} onChange={handleChange}
                placeholder="e.g., New Delhi"
              />
              <FormInput
                label="State" isRequired type="text" name="state"
                value={formData.state} onChange={handleChange}
                placeholder="e.g., Delhi"
              />
            </div>
            <FormInput
              label="Pincode" isRequired type="tel" name="pincode"
              maxLength={6} value={formData.pincode}
              onChange={handleChange} placeholder="e.g., 110001"
            />

            <FormButton type="submit" isLoading={loading} text="Complete Registration" />
          </motion.form>
        );
      case 'success':
        return <Step4Success />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7F6] via-white to-[#EAF6F4] py-12 px-4">
      <div className="container mx-auto">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden md:grid md:grid-cols-2">
          
          {/* --- Promo Column --- */}
          <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#1C1C1B] to-[#3a3a3a]">
            <h2 className="text-3xl font-bold text-white mb-6">
              Join the <span className="text-[#FEC925]">Flip Cash</span> Partner Network
            </h2>
            <p className="text-gray-300 mb-8">
              Get access to hundreds of leads in your area, manage your pickups, and grow your business—all in one place.
            </p>
            <ul className="space-y-4 text-gray-200">
              <li className="flex items-center gap-3">
                <UserCheck className="text-[#FEC925]" size={20} />
                <span>Verified Leads in Your Area</span>
              </li>
              <li className="flex items-center gap-3">
                <Building className="text-[#FEC925]" size={20} />
                <span>Grow Your Business</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="text-[#FEC925]" size={20} />
                <span>Secure & On-Time Payments</span>
              </li>
            </ul>
          </div>

          {/* --- Form Column --- */}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-[#1C1C1B] mb-6 md:hidden">
              Partner Registration
            </h1>
            
            {step !== 'success' && (
              <StepIndicator currentStep={step === 'phone' ? 1 : step === 'otp' ? 2 : 3} />
            )}
            
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {step !== 'success' && !isAuthenticated() && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="font-medium text-[#1B8A05] hover:underline"
                  >
                    Log In
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSignUp;