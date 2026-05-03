import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaArrowUp } from 'react-icons/fa';
import Logo from './Logo';

const WaveShape = () => (
  <div className="relative w-full -mt-px">
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-20">
      <path d="M0 0V120C240 120 480 80 720 80C960 80 1200 120 1440 120V0H0Z" fill="currentColor" className="text-gray-900" />
    </svg>
  </div>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 relative">
      <WaveShape />
      
      <div className="container-custom pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon.svg" alt="Blueground" className="h-10" />
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Find your perfect home to stay with our premium rental property platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Properties', path: '/properties' },
                { label: 'About', path: '/about' },
                { label: 'Contact', path: '/contact' },
                { label: 'FAQs', path: '/faq' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {[
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'FAQs', path: '/faq' },
                { label: 'Contact Us', path: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} The Blueground. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-primary transition-colors">Terms</Link>
          </div>
          
          <button
            onClick={scrollToTop}
            className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center hover:bg-primary-dark transition-all"
          >
            <FaArrowUp className="text-sm" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;