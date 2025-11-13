import React from 'react';
import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone, ArrowRight } from 'lucide-react';
import flipcashLogo from '../assets/logo.png'; // <-- This path will cause an error if the file doesn't exist.

// --- Custom X Icon (No Change) ---
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.16 19.5h1.85l-10.5-12.03L3.18 3.05H1.33l10.8 12.35 6.01 5.303Z"/>
  </svg>
);

// --- Footer Logo (No Change) ---
const FooterLogo = () => (
  <div className="flex items-center shrink-0">
    <a href="/" className="flex items-center space-x-2">
      
      <img 
        src= {flipcashLogo} 
        alt="Flipcash Logo" 
        className="w-34 h-16 rounded-lg" // Your dimensions
      />
    </a>
  </div>
);

// --- Individual Link Components (No Change) ---
const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <li>
    <a href={href} className="text-gray-400 hover:text-white transition-colors duration-200">
      {children}
    </a>
  </li>
);

const ContactItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-start gap-3">
    <span className="text-yellow-400 mt-1">{icon}</span>
    <span className="text-gray-400">{children}</span>
  </div>
);


// --- Main Footer Component ---
const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      {/* Top Yellow Bar (No Change) */}
      <div className="bg-[#ffe208] text-black">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between">
          <FooterLogo />
          <div className="flex items-center gap-5 mt-4 md:mt-0">
            <a href="#" aria-label="Facebook" className="hover:text-black/70 transition-colors">
              <Facebook size={24} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-black/70 transition-colors">
              <Instagram size={24} />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-black/70 transition-colors">
              <Linkedin size={24} />
            </a>
            <a href="#" aria-label="X" className="hover:text-black/70 transition-colors">
              <XIcon />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        {/* --- [LAYOUT CHANGE] ---
            Changed to a 3-column grid on large screens since "Quick Links" was removed.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          {/* Section 1: About (Content Changed) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Flipcash Partners</h3>
            {/* --- [CONTENT CHANGE] --- */}
            <p className="text-gray-400 text-sm leading-relaxed">
              Flipcash partners are the backbone of our service. Join our network to get access to exclusive leads, earn competitive commissions, and grow your business with our full support.
            </p>
          </div>

          {/* --- [REMOVED] ---
            Section 2: Quick Links has been completely removed.
          */}

          {/* Section 3: Important Links (Link Updated) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Important Links</h3>
            <div className="flex gap-8 text-sm">
              <ul className="space-y-3">
                <FooterLink href="/about">About Us</FooterLink>
                <FooterLink href="/career">Career</FooterLink>
                <FooterLink href="/blog">Blog</FooterLink>
                {/* --- [LINK CHANGE] --- */}
                <FooterLink href="/partner-signup">Become Partner</FooterLink>
                <FooterLink href="/contact">Contact Us</FooterLink>
              </ul>
              <ul className="space-y-3">
                <FooterLink href="/refund-policy">Refund Policy</FooterLink>
                <FooterLink href="/terms">Terms & Conditions</FooterLink>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
                <FooterLink href="/terms-of-use">Terms of Use</FooterLink>
                <FooterLink href="/cookies-policy">Cookies Policy</FooterLink>
              </ul>
            </div>
          </div>

          {/* Section 4: Contact (No Change) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-4 text-sm">
              <ContactItem icon={<MapPin size={20} />}>
                123 Flipcash Tower, Tech Park,
                New Delhi, 110001, India
              </ContactItem>
              <ContactItem icon={<Mail size={20} />}>
                support@flipcash.com
              </ContactItem>
              <ContactItem icon={<Phone size={20} />}>
                (64) 8342 1245
              </ContactItem>
              <a href="#" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                Get direction <ArrowRight size={16} />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar (No Change) */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p className="text-center md:text-left mb-4 md:mb-0">
            Copyright © 2025 by <span className="text-white font-semibold">FLIPCASH</span>. All Rights Reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;