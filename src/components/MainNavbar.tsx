import React, { useState } from "react";
// --- IMPORTS FOR NAVBAR ONLY ---
import {
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
// [FIX] Using a placeholder to avoid build error
import flipcashLogo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

// --- NEW IMPORTS ---
import SearchModal from "./SearchModal";
import AuthModal from "./AuthModal";

// --- Reusable Logo Component (Updated to use Image) ---
const Logo = () => (
  <div className="flex items-center shrink-0">
    <a href="/" className="flex items-center space-x-2">
      <img
        // src={flipcashLogo}
        // [FIX] Using placeholder
        src={flipcashLogo}
        alt="Flipcash Logo"
        className="w-34 h-20 rounded-lg" // Your dimensions
      />
    </a>
  </div>
);

// --- [REMOVED] --- Submenu Content Types ---
// (No longer needed as no nav items have submenus)
interface SubmenuItem {
  name: string;
  href: string;
}
interface SubmenuImageItem {
  name: string;
  href: string;
  image: string;
}
interface SubmenuCategory {
  title: string;
  items: (SubmenuItem | SubmenuImageItem)[];
}
// --- [REMOVED] --- Submenu Data ---
// const sellProductsSubmenu: SubmenuCategory[] = [ ... ];

// --- [UPDATED] --- Nav Items ---
const navItems = [
  { name: "Home", href: "/" },
  { name: "Become Partner", href: "/partner-signup" },
  { name: "About Us", href: "/about" },
  { name: "FAQ's", href: "/faq" },
  { name: "Blog", href: "/blog" },
];

// --- [REMOVED] --- Desktop Submenu Component ---
// const DesktopSubmenu: React.FC<{ menu: SubmenuCategory[] }> = ({ menu }) => ( ... );

interface MainNavbarProps {
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onAccountClick?: () => void;
  onLoginSuccess?: (token: string) => void; // New prop
}

// --- Main Navbar Component (Updated with Modals) ---
const MainNavbar: React.FC<MainNavbarProps> = ({
  isLoggedIn,
  onLoginClick,
  onAccountClick,
  onLoginSuccess = () => {}, // Default empty function
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- [REMOVED] --- Hovered menu state
  // const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  
  // --- [REMOVED] --- Mobile submenu state
  // const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  // States for new modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Renamed from isLoginOpen

  const [isSticky, setIsSticky] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers for mobile menu to open modals
  const openSearchModal = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(true);
  };

  const openAuthModal = () => {
    setIsMobileMenuOpen(false);
    setIsAuthModalOpen(true);
  };

  // This is the new click handler for the profile icon
  const handleProfileClick = () => {
    if (isLoggedIn && onAccountClick) {
      onAccountClick(); // Go to /my-account
    } else if (!isLoggedIn && onLoginClick) {
      onLoginClick(); // This will open the modal
    } else if (!isLoggedIn) {
      // Fallback for when props aren't passed
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header
      className={`bg-[#ffe208] h-[80px] flex items-center transition-all duration-300 z-50 ${
        isSticky ? "fixed top-0 left-0 right-0 shadow-md" : "relative"
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6 flex items-center justify-between h-full">
        <Logo />
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={28} className="text-black" />
          </button>
        </div>
        {/* --- [SIMPLIFIED] --- Desktop Nav List */}
        <ul className="hidden md:flex items-center h-full space-x-8">
          {navItems.map((item) => (
            <li
              key={item.name}
              className="h-full flex items-center"
              // --- [REMOVED] --- Mouse enter/leave handlers
            >
              <a
                href={item.href}
                className="font-semibold text-black text-sm flex items-center space-x-1 hover:text-red-600 transition-colors"
              >
                <span>{item.name}</span>
                {/* --- [REMOVED] --- Submenu chevron logic */}
              </a>
              {/* --- [REMOVED] --- AnimatePresence for submenu */}
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center space-x-6">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            className="text-black hover:text-red-600 transition-colors"
          >
            <Search size={24} />
          </button>
          <button
            type="button"
            onClick={handleProfileClick} // Use the new handler
            aria-label="Account"
            className="text-black hover:text-red-600 transition-colors"
          >
            <User size={24} />
          </button>
        </div>
      </nav>

      {/* --- Mobile Menu Panel --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 w-full h-screen bg-white z-50 p-6 md:hidden overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={28} className="text-black" />
              </button>
            </div>
            {/* --- [SIMPLIFIED] --- Mobile Nav List */}
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  {/* --- [REMOVED] --- Ternary logic for submenu */}
                  <a
                    href={item.href}
                    className="font-semibold text-base py-2 block"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t mt-8 pt-6 flex items-center space-x-6">
              <button
                type="button"
                onClick={openSearchModal}
                aria-label="Search"
                className="text-black hover:text-red-600 transition-colors"
              >
                <Search size={24} />
              </button>
              <button
                type="button"
                onClick={openAuthModal} // Use the auth modal handler
                aria-label="Account"
                className="text-black hover:text-red-600 transition-colors"
              >
                <User size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Render Modals --- */}
      <AnimatePresence>
        {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={(token) => {
              console.log("Login Token:", token);
              // This prop will be passed from App.tsx
              onLoginSuccess(token);
              setIsAuthModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default MainNavbar;