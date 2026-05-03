import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCreditCard, FiMapPin, FiHome, FiCalendar } from 'react-icons/fi';
import Loader from '../components/Loader';
import { bookingService } from '../services/bookingService';
import { useAuthStore, useCurrencyStore } from '../store/useStore';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader />;
  if (!booking) return <div className="text-center py-12">Booking not found</div>;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Payment Instructions (Larger) */}
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
                  <p className="text-sm text-primary mt-1">Booking details will be sent to your registered email.</p>
                </div>
              </div>

<h3 className="text-lg font-semibold mb-4">Payment Instructions</h3>
               
              {booking.payment_methods?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Available Payment Methods</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {booking.payment_methods.map((method) => (
                      <a
                        key={method.id}
                        href={`/payment-instructions/${method.id}`}
                        target="_blank"
                        className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FiCreditCard className="text-primary" />
                          <h5 className="font-medium text-gray-900">{method.name}</h5>
                        </div>
                        <span className="text-primary text-sm font-medium">View Instructions →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" />
                  <span className="text-green-800 font-medium">Payment will be verified within 24-48 hours</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right - Booking Details (Smaller) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card-premium p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              {/* Property Info with Image */}
              <div className="flex gap-4 mb-4 pb-4 border-b">
                {booking.images?.[0] ? (
                  <img
                    src={booking.images[0]}
                    alt={booking.title}
                    className="w-24 h-24 rounded-lg object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop'; }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
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

              {/* Booking Details */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;