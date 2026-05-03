import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiCalendar, FiLogOut } from 'react-icons/fi';
import { useAuthStore, useCurrencyStore } from '../store/useStore';
import { currencies } from '../utils/currency';

const Navbar = ({ scrolled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isAuthenticated, logout, user } = useAuthStore();
  const { currency, symbol, setCurrency } = useCurrencyStore();

  const languages = [
    { code: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'ES', flag: '🇪🇸', name: 'Español' },
    { code: 'FR', flag: '🇫🇷', name: 'Français' },
    { code: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  ];

  const [selectedLang, setSelectedLang] = useState(languages[0]);

  return (
    <nav className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-2xl ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg' 
        : 'bg-white/90 backdrop-blur-md shadow-lg'
    }`}>
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0">
            <img src="/icon.svg" alt="StayFinder" className="h-10" />
          </Link>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrencyMenu(false); setShowProfileMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                <span>{selectedLang.flag}</span>
                <span>{selectedLang.code}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px]"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setSelectedLang(lang); setShowLangMenu(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedLang.code === lang.code ? 'text-primary font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button 
                onClick={() => { setShowCurrencyMenu(!showCurrencyMenu); setShowLangMenu(false); setShowProfileMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                <span>{symbol}</span>
                <span>{currency}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {showCurrencyMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[100px]"
                  >
                    {currencies.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => { setCurrency(curr.code); setShowCurrencyMenu(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          currency === curr.code ? 'text-primary font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span>{curr.symbol}</span>
                        <span>{curr.code}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowLangMenu(false); setShowCurrencyMenu(false); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-gray-100 hover:bg-gray-200"
                >
                  <FiUser className="text-gray-700" size={18} />
                </button>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px]"
                    >
                      <Link
                        to="/my-bookings"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiCalendar size={16} />
                        My Bookings
                      </Link>
                      <button
                        onClick={() => { logout(); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all"
              >
                <FiUser size={16} />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100"
          >
            <div className="p-6 space-y-4">
              {/* Mobile Language Dropdown */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Language</p>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang); }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                        selectedLang.code === lang.code 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Currency Dropdown */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</p>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => { setCurrency(curr.code); }}
                      className={`flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm ${
                        currency === curr.code 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{curr.symbol}</span>
                      <span>{curr.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    <Link onClick={() => setIsOpen(false)} to="/my-bookings" className="flex items-center gap-3 px-4 py-4 rounded-xl bg-gray-50 text-gray-700 font-medium">
                      <FiCalendar size={20} />
                      My Bookings
                    </Link>
                    <button onClick={() => { logout(); setIsOpen(false); }} className="w-full mt-2 px-4 py-4 rounded-xl border border-gray-200 text-red-600 font-medium">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link onClick={() => setIsOpen(false)} to="/login" className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-primary text-white font-medium">
                    <FiUser size={20} />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;