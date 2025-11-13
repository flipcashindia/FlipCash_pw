import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">FlipCash Partner</h3>
            <p className="text-gray-400">Your trusted platform for device resale partnerships</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
              <li><a href="/career" className="text-gray-400 hover:text-white">Careers</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
              <li><a href="/refund-policy" className="text-gray-400 hover:text-white">Refund Policy</a></li>
              <li><a href="/cookies-policy" className="text-gray-400 hover:text-white">Cookies Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-teal-400"><Facebook size={24} /></a>
              <a href="#" className="hover:text-teal-400"><Instagram size={24} /></a>
              <a href="#" className="hover:text-teal-400"><Twitter size={24} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 FlipCash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;