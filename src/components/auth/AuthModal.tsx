import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  X, Phone, KeyRound, Smartphone, Shield, Zap, Loader2,
  User, LogOut, ArrowRight, FileText, Banknote, MapPin, ListChecks 
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore'; // ✅ Use the correct store
import { authService } from '../../api/services/authService2'; // Make sure path is correct
import { useToast } from '../../contexts/ToastContext';
import { type ApiError, type User as ApiUser } from '../../api/types/api';

type LoginStep = 'phone' | 'otp';

// // --- Helper: Branded Auth Input ---
// const AuthInput: React.FC<{ label: string; id: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; maxLength?: number; required?: boolean; }> = ({ label, id, type = "text", value, onChange, maxLength, required = true }) => (
//   <div>
//     <label htmlFor={id} className="block text-sm font-semibold text-brand-black mb-2">
//       {label}
//       {required && <span className="text-brand-red">*</span>}
//     </label>
//     <input 
//       type={type} id={id} name={id} value={value} 
//       onChange={onChange} maxLength={maxLength} 
//       className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg 
//                  focus:outline-none focus:ring-4 focus:ring-brand-yellow/30 focus:border-brand-yellow 
//                  font-medium transition" //
//       required={required} 
//     />
//   </div>
// );

// --- Helper: Branded Auth Button ---
const AuthButton: React.FC<{
  type: 'submit' | 'button';
  isLoading: boolean;
  text: string;
}> = ({ type, isLoading, text }) => (
  <button
    type={type}
    disabled={isLoading}
    className="w-full flex items-center justify-center gap-3 px-6 py-4 
               bg-gradient-to-r from-brand-yellow to-brand-green text-brand-black 
               rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed 
               font-bold text-lg shadow-lg transition" //
  >
    {isLoading ? <Loader2 className="animate-spin" size={24} /> : text}
  </button>
);

// --- Helper: Get Device ID ---
const getOrCreateDeviceID = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// --- Helper: Partner Menu ---
const PartnerMenu: React.FC<{ user: ApiUser; onLogout: () => void; onClose: () => void; }> = ({ user, onLogout, onClose }) => {
  
  const menuItems = [
    { name: 'Dashboard', href: '/partner/dashboard', icon: Zap },
    { name: 'My Leads', href: '/partner/leads/my', icon: ListChecks },
    { name: 'KYC & Documents', href: '/partner/profile/documents', icon: FileText },
    { name: 'Bank Accounts', href: '/partner/profile/bank', icon: Banknote },
    { name: 'Service Areas', href: '/partner/profile/areas', icon: MapPin },
  ];

  return (
    <motion.div
      key="partner-menu"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="bg-white p-4 rounded-xl border-2 border-brand-green/30">
        <h3 className="text-lg font-bold text-brand-black">
          Welcome, {user.name || 'Partner'}!
        </h3>
        <p className="text-sm text-gray-600">
          Manage your profile and leads here.
        </p>
      </div>
      
      <div className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClose}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-brand-yellow transition"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-brand-green" />
              <span className="font-semibold text-brand-black">{item.name}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
        ))}
      </div>
      
      <div className="border-t pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-brand-red rounded-xl font-bold text-lg hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </motion.div>
  );
};

// --- Helper: Consumer CTA ---
const ConsumerMenu: React.FC<{ user: ApiUser; onLogout: () => void; onClose: () => void; }> = ({ user, onLogout, onClose }) => {
  const navigate = useNavigate();

  const handlePartnerSignupClick = () => {
    onClose();
    navigate('/partner-signup');
  };

  return (
    <motion.div
      key="consumer-menu"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-xl border-2 border-brand-yellow/30 text-center">
        <h3 className="text-lg font-bold text-brand-black">
          Welcome, {user.name || 'FlipCash User'}!
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          This is the partner portal. To manage your device sales, please visit our consumer website.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-brand-yellow/10 to-brand-green/10 p-6 rounded-2xl border-2 border-brand-green">
        <h4 className="text-xl font-bold text-brand-black text-center">Want to sell devices?</h4>
        <p className="text-center text-gray-600 my-3">
          Join our partner network to get verified leads, manage pickups, and grow your business.
        </p>
        <button
          onClick={handlePartnerSignupClick}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-brand-yellow to-brand-green text-brand-black rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-[1.02]"
        >
          <User size={20} />
          Become a Partner
        </button>
      </div>
      
      <div className="border-t pt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-brand-red rounded-xl font-bold text-lg hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </motion.div>
  );
};


// --- Main AuthModal Component ---
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  
  // --- THIS IS THE FIX ---
  // We get *all* state and functions from the Zustand store
  const { login, logout, user, isAuthenticated } = useAuthStore();
  // -----------------------

  const toast = useToast();
  // const navigate = useNavigate();
  
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let formattedPhone = phone.trim().replace(/\D/g, ''); 
      if (formattedPhone.length !== 10) {
         setError('Please enter a valid 10-digit mobile number.');
         setLoading(false);
         return;
      }
      const response = await authService.sendLoginOtp({ phone: formattedPhone, purpose: 'login' }); //
      setPhone(formattedPhone); 
      setStep('otp');
      startResendCooldown(response.resend_after || 30); //
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceID();
      
      // This 'login' function is from useAuthStore.
      // It will call the API AND set the global Zustand state.
      const response = await login(phone, otp, deviceId); //
      
      const userRole = response.user.role; //
      console.log('user role: ', userRole);
      
      toast.success('Login Successful!');
      
      // Reset local form state
      setLoading(false);
      setError('');
      setStep('phone');
      setOtp('');
      
      // We don't call handleSuccess here, because the component will
      // automatically re-render with the new `isAuthenticated()` value.
      // We also don't navigate, we let the `renderContent` logic handle it.
      
    } catch (err: any) {
       const apiError = err as ApiError;
       const message = apiError.response?.data?.detail || "Invalid or expired OTP. Please try again.";
       setError(message); //
       setOtp('');
       setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // This will clear the Zustand state
    // The component will re-render and show the login form.
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    try {
      const response = await authService.sendLoginOtp({ phone: phone, purpose: 'login' }); //
      setOtp('');
      startResendCooldown(response.resend_after || 30); //
      toast.success('OTP has been resent.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError('');
    setResendCooldown(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // This render function checks the global auth state
  const renderContent = () => {
    if (isAuthenticated() && user) {
      // --- USER IS LOGGED IN ---
      if (user.role === 'partner') { //
        return <PartnerMenu user={user} onLogout={handleLogout} onClose={onClose} />;
      } else {
        return <ConsumerMenu user={user} onLogout={handleLogout} onClose={onClose} />;
      }
    }

    // --- USER IS LOGGED OUT ---
    // (This part is based on your local state 'step')
    if (step === 'phone') {
      return (
        <motion.form
          key="phone"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleSendOTP}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-brand-black mb-3 flex items-center gap-2">
              <Phone size={18} className="text-brand-yellow" />
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPhone(value);
                }}
                placeholder="9876543210"
                className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-yellow/30 focus:border-brand-yellow text-lg font-semibold transition-all"
                required
                maxLength={10}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-brand-red text-sm bg-red-50 p-4 rounded-xl border-2 border-red-200"
            >
              <div className="w-2 h-2 bg-brand-red rounded-full"></div>
              {error}
            </motion.div>
          )}

          <AuthButton type="submit" isLoading={loading} text={loading ? 'Sending OTP...' : 'Send OTP'} />
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Want to sell devices?{' '}
              <Link
                to="/partner-signup"
                onClick={onClose}
                className="font-medium text-brand-green hover:underline"
              >
                Become a Partner
              </Link>
            </p>
          </div>
        </motion.form>
      );
    }

    if (step === 'otp') {
      return (
        <motion.form
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleVerifyOTP}
          className="space-y-6"
        >
          <div className="bg-white p-8 rounded-2xl border-2 border-brand-yellow/50 shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-brand-yellow/20 to-brand-green/20 rounded-full">
                <KeyRound size={40} className="text-brand-yellow" />
              </div>
            </div>
            
            <label className="block text-sm font-bold text-brand-black mb-4 text-center">
              Enter 6-Digit OTP
            </label>
            
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setOtp(value);
              }}
              placeholder="••••••"
              className="w-full px-4 py-5 text-center text-3xl tracking-[0.5em] font-bold border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-yellow/30 focus:border-brand-yellow transition-all"
              required
              maxLength={6}
              autoFocus
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-brand-red text-sm bg-red-50 p-4 rounded-xl border-2 border-red-200"
            >
              <div className="w-2 h-2 bg-brand-red rounded-full"></div>
              {error}
            </motion.div>
          )}

          <AuthButton type="submit" isLoading={loading} text={loading ? 'Verifying...' : 'Verify & Login'} />

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
              className="text-sm text-gray-600 hover:text-brand-black font-semibold transition-colors"
            >
              ← Change Number
            </button>
            
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resendCooldown > 0}
              className={`text-sm font-bold transition-colors ${
                resendCooldown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-brand-green hover:text-brand-green/80'
              }`}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend OTP'}
            </button>
          </div>
        </motion.form>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-gradient-to-br from-[#F0F7F6] via-white to-[#EAF6F4] shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b-2 border-brand-yellow px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-brand-black">
                  {/* --- Dynamic Header --- */}
                  {isAuthenticated() ? 'My Account' : 'Login / Sign Up'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isAuthenticated() ? (user?.role === 'partner' ? 'Partner Portal' : 'Welcome!') : 'Login to your Account'}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} className="text-brand-black" />
              </button>
            </div>

            <div className="p-6">
              {/* --- Show promos only when logging in --- */}
              {!isAuthenticated() && step === 'phone' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 gap-3 mb-8"
                >
                  <div className="bg-white p-4 rounded-xl border-2 border-brand-yellow/30 text-center">
                    <Zap className="mx-auto text-brand-yellow mb-2" size={28} />
                    <p className="text-xs font-semibold text-brand-black">Instant Quotes</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border-2 border-brand-green/30 text-center">
                    <Shield className="mx-auto text-brand-green mb-2" size={28} />
                    <p className="text-xs font-semibold text-brand-black">100% Safe</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border-2 border-brand-yellow/30 text-center">
                    <Smartphone className="mx-auto text-brand-yellow mb-2" size={28} />
                    <p className="text-xs font-semibold text-brand-black">Easy Pickup</p>
                  </div>
                </motion.div>
              )}

              {/* --- Render content based on auth state --- */}
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </div>

            <div className="px-6 pb-6 mt-auto">
              <div className="bg-white/50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" onClick={onClose} className="text-brand-green font-semibold hover:underline">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;