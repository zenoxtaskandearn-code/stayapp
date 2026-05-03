import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiCreditCard, FiMapPin, FiHome, FiCalendar, FiX, FiExternalLink, FiHelpCircle } from 'react-icons/fi';
import Loader from '../components/Loader';
import { bookingService } from '../services/bookingService';
import { paymentMethodService } from '../services/paymentMethodService';
import { useAuthStore } from '../store/useStore';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [methodDetails, setMethodDetails] = useState(null);

  const getCurrencySymbol = (curr) => {
    const symbols = { USD: '$', GBP: '£', EUR: '€' };
    return symbols[curr] || '$';
  };

  const formatPrice = (amount, curr = 'USD') => `${getCurrencySymbol(curr)}${(parseFloat(amount) || 0).toLocaleString()}`;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getBookingById(bookingId);
      setBooking(res.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInstructions = async (methodId) => {
    try {
      const res = await paymentMethodService.getById(methodId);
      setMethodDetails(res.data);
      setSelectedMethod(methodId);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <Loader />;
  if (!booking) return <div className="text-center py-12">Booking not found</div>;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-8 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiCheckCircle className="text-green-500" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Booking ID: #{booking.id}</h2>
                  <p className="text-gray-500">Booking confirmed! Please complete your payment.</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              
              {booking.payment_methods?.length > 0 && (
                <div className="space-y-4">
                  {booking.payment_methods.map((method) => (
                    <div key={method.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleViewInstructions(method.id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FiCreditCard className="text-primary w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{method.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">{method.description?.replace(/<[^>]*>/g, '').slice(0, 80)}...</p>
                          </div>
                        </div>
                        <FiExternalLink className="text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">Reservation Notice</h4>
                <p className="text-sm text-yellow-700">
                  Your reservation is now confirmed and temporarily secured.<br />
                  Please complete the payment within <strong>24 hours</strong>.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  If the payment is not received within this time frame, the reservation will be automatically canceled due to non-payment.
                </p>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" />
                  <span className="text-green-800 font-medium">Payment will be verified within 12-24 hours</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card-premium p-6 mb-6"
            >
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="flex gap-4 mb-4 pb-4 border-b">
                {booking.images?.[0] ? (
                  <img
                    src={booking.images[0]}
                    alt={booking.title}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop'; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                    <FiHome className="text-gray-400" size={24} />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{booking.title || booking.property_title}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiMapPin size={12} />
                    {booking.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{booking.bedrooms || 0} bed</span>•<span>{booking.bathrooms || 0} bath</span>•<span>{booking.square_feet || 0} sqft</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Property Type</span>
                  <span className="capitalize">{booking.property_type || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Rent</span>
                  <span>{formatPrice(booking.monthly_price, booking?.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Security Deposit</span>
                  <span>{formatPrice(booking.property_deposit, booking?.currency)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-500 flex items-center gap-1">
                    <FiCalendar size={14} />
                    Move In
                  </span>
                  <span>{new Date(booking.move_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Move Out</span>
                  <span>{booking.move_out_date ? new Date(booking.move_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span>{booking.months} Month{booking.months > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between pt-3 border-t font-semibold">
                  <span>Total Amount ({booking.currency})</span>
                  <span className="text-primary text-lg font-bold">{formatPrice(booking.total_amount, booking?.currency)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card-premium p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <FiHelpCircle className="text-primary" />
                <h4 className="font-semibold text-gray-900">Need Help?</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">Contact our support team for any questions about your booking.</p>
              <Link to="/contact" className="block text-center py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
                Contact Support
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMethod && methodDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setSelectedMethod(null); setMethodDetails(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <FiCreditCard className="text-primary" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">{methodDetails.name}</h2>
                </div>
                <button
                  onClick={() => { setSelectedMethod(null); setMethodDetails(null); }}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {methodDetails.description && (
                  <div className="mb-6">
                    <div dangerouslySetInnerHTML={{ __html: methodDetails.description }} className="prose max-w-none" />
                  </div>
                )}
                {methodDetails.instructions && (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: methodDetails.instructions }} className="prose max-w-none" />
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => { setSelectedMethod(null); setMethodDetails(null); }}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;