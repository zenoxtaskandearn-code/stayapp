import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Terms = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms and Conditions</h1>
            <p className="text-white/80 max-w-xl mx-auto">
              Please read our terms and conditions carefully before making a booking.
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Booking and Reservation</h2>
            <p className="text-gray-600 mb-6">
              By making a reservation through The Blueground, you agree to enter into a binding agreement for the duration of your selected stay. All bookings are subject to availability and confirmation.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Payment Terms</h2>
            <p className="text-gray-600 mb-6">
              Payments are processed securely through our platform. The first month's rent is due at the time of booking. Security deposits are held and refunded within 14 days of checkout, minus any applicable deductions for damages.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Check-in and Check-out</h2>
            <p className="text-gray-600 mb-6">
              Check-in time is from 3:00 PM and check-out is by 11:00 AM. Early check-in or late check-out may be available upon request and is subject to availability.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Cancellation Policy</h2>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>Cancellations made 7+ days before check-in: Full refund</span>
              </li>
              <li className="flex items-start gap-2">
                <FiAlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                <span>Cancellations made 3-6 days before check-in: 50% refund</span>
              </li>
              <li className="flex items-start gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <span>Cancellations made less than 3 days before check-in: No refund</span>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mb-4">5. House Rules</h2>
            <p className="text-gray-600 mb-6">
              Guests are expected to maintain the property in good condition. No smoking indoors, no pets (unless explicitly allowed), and no parties or events without prior approval. Violation of these rules may result in immediate termination without refund.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Liability</h2>
            <p className="text-gray-600 mb-6">
              The Blueground is not liable for any injury, loss, or damage to personal property during your stay. Guests are responsible for securing their valuables.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Property Condition</h2>
            <p className="text-gray-600 mb-6">
              All properties are inspected before and after each stay. Guests will be charged for any damages beyond normal wear and tear.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These terms are governed by the laws of the United Kingdom. Any disputes shall be subject to the jurisdiction of UK courts.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these terms, please contact us at info@estate-theblueground.co.uk or +44 739 794 3670.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-4">
              By proceeding with a booking, you acknowledge that you have read and agree to these Terms and Conditions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;