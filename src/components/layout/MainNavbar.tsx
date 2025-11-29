// src/components/layout/MainNavbar.tsx
// Updated with Agent Role Support

import React, { useState } from "react";
import { Search, User, Menu, X, LogOut } from "lucide-react";
import flipcashLogo from '../../../public/flipcash_header_logo.png';
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "../misc/SearchModal";
import AuthModal from "../auth/AuthModal";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useModalStore } from "../../stores/useModalStore";


const Logo = () => (
  <div className="flex items-center shrink-0">
    <Link to="/" className="flex items-center space-x-2">
      <img src={flipcashLogo} alt="Flipcash Logo" className="h-20 p-3 rounded-lg" />
    </Link>
  </div>
);

// Base navigation items
const baseNavItems = [
  { name: "Home", href: "/" },
  { name: "Become Partner", href: "/partner-signup" },
  { name: "About Us", href: "/about" },
  { name: "FAQ's", href: "/faq" },
  { name: "Blog", href: "/blog" },
];

const MainNavbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Use global state for modals
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useModalStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [isSticky, setIsSticky] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Create dynamic navItems list based on auth state and role
  const navItems = React.useMemo(() => {
    const isPartner = isAuthenticated() && user?.role === 'partner';
    const isAgent = isAuthenticated() && user?.role === 'agent';

    // If user is a partner or agent, filter out the "Become Partner" link
    if (isPartner || isAgent) {
      return baseNavItems.filter(item => item.name !== "Become Partner");
    }
    
    // Otherwise, return the full list
    return baseNavItems;
  }, [isAuthenticated, user]);


  const openSearchModal = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(true);
  };

  const handleLoginClick = () => {
    setIsMobileMenuOpen(false);
    openAuthModal();
  };

  /**
   * Handle profile/account click based on user role
   * - Partner → /partner/dashboard
   * - Agent → /agent/dashboard
   * - Consumer → /my-account
   */
  const handleProfileClick = () => {
    setIsMobileMenuOpen(false);
    if (isAuthenticated()) {
      switch (user?.role) {
        case 'partner':
          navigate('/partner/dashboard');
          break;
        case 'agent':
          navigate('/agent/dashboard');
          break;
        default:
          navigate('/my-account');
      }
    } else {
      openAuthModal();
    }
  };

  /**
   * Get dashboard path based on user role
   */
  const getDashboardPath = (): string => {
    if (!isAuthenticated()) return '/';
    
    switch (user?.role) {
      case 'partner':
        return '/partner/dashboard';
      case 'agent':
        return '/agent/dashboard';
      default:
        return '/my-account';
    }
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/'); 
  };

  return (
    <header className={`bg-brand-yellow h-[80px] flex items-center transition-all duration-300 z-50 ${isSticky ? "fixed top-0 left-0 right-0 shadow-md" : "relative"}`}>
      <nav className="container mx-auto px-4 md:px-6 flex items-center justify-between h-full">
        <Logo />
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={28} className="text-brand-black" />
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center h-full space-x-8">
          {navItems.map((item) => (
            <li key={item.name} className="h-full flex items-center">
              <Link to={item.href} className="font-semibold text-brand-black text-sm flex items-center space-x-1 hover:text-brand-red transition-colors">
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          
          {/* Show Dashboard link for authenticated partners/agents */}
          {isAuthenticated() && (user?.role === 'partner' || user?.role === 'agent') && (
            <li className="h-full flex items-center">
              <Link 
                to={getDashboardPath()} 
                className="font-semibold text-brand-black text-sm flex items-center space-x-1 hover:text-brand-red transition-colors"
              >
                <span>Dashboard</span>
              </Link>
            </li>
          )}
        </ul>
        
        <div className="hidden md:flex items-center space-x-6">
          <button type="button" onClick={() => setIsSearchOpen(true)} aria-label="Search" className="text-brand-black hover:text-brand-red transition-colors">
            <Search size={24} />
          </button>
          <button type="button" onClick={handleProfileClick} aria-label="Account" className="text-brand-black hover:text-brand-red transition-colors">
            <User size={24} />
          </button>
          
          {isAuthenticated() && (
             <button type="button" onClick={handleLogout} aria-label="Logout" className="text-brand-black hover:text-brand-red transition-colors">
               <LogOut size={24} />
             </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: "easeOut" }} className="fixed top-0 right-0 w-full h-screen bg-white z-50 p-6 md:hidden overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <X size={28} className="text-brand-black" />
              </button>
            </div>
            
            {/* Mobile Nav Items */}
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-base py-2 block">{item.name}</Link>
                </li>
              ))}
              
              {/* Show Dashboard link for authenticated partners/agents in mobile */}
              {isAuthenticated() && (user?.role === 'partner' || user?.role === 'agent') && (
                <li>
                  <Link 
                    to={getDashboardPath()} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="font-semibold text-base py-2 block text-brand-green"
                  >
                    {user?.role === 'agent' ? 'Agent Dashboard' : 'Partner Dashboard'}
                  </Link>
                </li>
              )}
            </ul>
            
            <div className="border-t mt-8 pt-6 flex items-center space-x-6">
              <button type="button" onClick={openSearchModal} aria-label="Search" className="text-brand-black hover:text-brand-red transition-colors">
                <Search size={24} />
              </button>
              <button type="button" onClick={handleLoginClick} aria-label="Account" className="text-brand-black hover:text-brand-red transition-colors">
                <User size={24} />
              </button>
              {isAuthenticated() && (
                <button type="button" onClick={handleLogout} aria-label="Logout" className="text-brand-black hover:text-brand-red transition-colors">
                  <LogOut size={24} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={closeAuthModal} 
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default MainNavbar;