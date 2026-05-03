import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiCheckCircle } from 'react-icons/fi';

const Privacy = () => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-blue-400 py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-white/80 max-w-xl mx-auto">
              Learn how we protect and handle your personal information.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-10"
        >
          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-6">
              We collect personal information such as your name, email address, phone number, and payment details when you register, book a property, or contact us. We also collect usage data and cookies to improve our services.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>To provide and maintain our rental services</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>To process bookings and payments</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>To communicate with you about your bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>To improve our services and user experience</span>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Data Protection</h2>
            <div className="flex items-start gap-3 text-gray-600 mb-6">
              <FiLock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <p>
                We implement industry-standard security measures to protect your data. All payment transactions are encrypted and processed securely through our payment partners.
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 mb-6">
              We do not sell your personal information. We may share data with service providers who assist in operating our platform, strictly under confidentiality agreements. We may disclose information when required by law.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 mb-6">
              You have the right to access, correct, or delete your personal information. Contact us at info@estate-theblueground.co.uk to exercise these rights.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Cookies</h2>
            <p className="text-gray-600 mb-6">
              We use cookies to enhance your experience. You can disable cookies in your browser settings, though this may affect some features of our service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              For privacy concerns, contact us at info@estate-theblueground.co.uk or +44 739 794 3670.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;