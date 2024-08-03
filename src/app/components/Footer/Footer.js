import React from 'react';
import { FaDiscord, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto text-center">
        <div className="mb-4">
          <p className="text-lg font-semibold">Follow Us</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="https://discord.gg/mJBKAvpuHy" className="text-blue-400 hover:text-blue-600 transition duration-300">
              <FaDiscord size={24} />
            </a>
            <a href="https://twitter.com/yourtwitterhandle" className="text-blue-400 hover:text-blue-600 transition duration-300">
              <FaTwitter size={24} />
            </a>
            <a href="https://facebook.com/yourfacebookpage" className="text-blue-400 hover:text-blue-600 transition duration-300">
              <FaFacebook size={24} />
            </a>
            <a href="https://instagram.com/yourinstagramhandle" className="text-blue-400 hover:text-blue-600 transition duration-300">
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-lg font-semibold">&copy; 2024 Unofficial Esports</p>
          <p className="text-sm">All rights reserved.</p>
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-semibold">Contact Us</p>
          <p className="text-sm">
            Have questions or feedback? Reach out to us on <a href="https://discord.gg/mJBKAvpuHy" className="text-blue-400 hover:text-blue-600 transition duration-300">Discord</a>.
          </p>
        </div>
        <div className="text-sm">
          <a href="/privacy-policy" className="text-blue-400 hover:text-blue-600 transition duration-300">Privacy Policy</a> | 
          <a href="/terms-of-service" className="text-blue-400 hover:text-blue-600 transition duration-300">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
