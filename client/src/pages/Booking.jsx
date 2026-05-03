import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import { useAuthStore, useCurrencyStore } from '../store/useStore';
import Loader from '../components/Loader';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { symbol, currency } = useCurrencyStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    moveIn: '',
    months: 1,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const formatPrice = (amount) => `${symbol}${(parseFloat(amount) || 0).toLocaleString()}`;

  const getMoveOutDate = () => {
    if (!formData.moveIn || !formData.months) return '-';
    const [y, m, d] = formData.moveIn.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    start.setMonth(start.getMonth() + formData.months);
    return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const urlParams = new URLSearchParams(window.location.search);
  const moveInParam = urlParams.get('moveIn');
  const monthsParam = urlParams.get('months');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProperty();
    
    if (moveInParam) {
      setFormData(prev => ({ ...prev, moveIn: moveInParam }));
    }
    if (monthsParam) {
      setFormData(prev => ({ ...prev, months: parseInt(monthsParam) }));
    }
  }, [id, isAuthenticated]);

  const fetchProperty = async () => {
    try {
      const res = await propertyService.getPropertyById(id);
      const prop = res.data;
      if (prop) {
        prop.monthly_rent = prop.monthly_price || prop.monthly_rent || 0;
      }
      setProperty(prop);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.moveIn) {
      alert('Please select move in date');
      return;
    }
    if (!agreed) {
      alert('Please agree to the Terms and Conditions');
      return;
    }
    if (property?.min_rental_months && formData.months < property.min_rental_months) {
      alert(`This property requires a minimum rental of ${property.min_rental_months} months`);
      return;
    }
    if (!user?.id) {
      alert('Please login to book a property');
      localStorage.setItem('returnToBooking', `/booking/${id}?moveIn=${formData.moveIn}&months=${formData.months}`);
      localStorage.setItem('pendingBooking', JSON.stringify({ propertyId: id, moveIn: formData.moveIn, months: formData.months }));
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const bookingData = {
        property_id: parseInt(id),
        propertyId: parseInt(id),
        move_in_date: formData.moveIn,
        months: formData.months,
        user_id: user?.id,
        currency: currency,
      };
      const res = await bookingService.createBooking(bookingData);
      if (res.data?.booking?.id) {
        navigate(`/payment/${res.data.booking.id}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.response?.data?.message || 'Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) return <Loader />;
  if (!property) return <div className="p-8 text-center">Property not found</div>;

  const totalPrice = property.monthly_price * formData.months;
  const depositAmount = parseFloat(property.deposit) || 0;
  const grandTotal = totalPrice + depositAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Property Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-48 md:h-64">
                <img
                  src={property.images?.[0] || '/hero.jpg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Link to={`/properties/${id}`} className="text-white font-medium hover:underline">
                    ← Back to property
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <p className="text-gray-500 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" /> {property.location}
                </p>
              </div>
            </div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date *</label>
                    <input
                      type="date"
                      name="moveIn"
                      value={formData.moveIn}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-premium w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select
                      name="months"
                      value={formData.months}
                      onChange={handleChange}
                      className="input-premium w-full"
                    >
                      <option value={1}>1 Month</option>
                      <option value={2}>2 Months</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>1 Year</option>
                      <option value={24}>2 Years</option>
                      <option value={36}>3 Years</option>
                      <option value={48}>4 Years</option>
                      <option value={60}>5 Years</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer mt-0.5"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      I have read and agree to the <Link to="/terms" target="_blank" className="text-primary font-medium">Terms and Conditions</Link>
                    </span>
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={submitting || !agreed}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-6 sticky top-24"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Price Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{formatPrice(property.monthly_price)} x {formData.months} month(s)</span>
                  <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                {depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="text-gray-900">{formatPrice(depositAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Move-in Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.moveIn ? new Date(formData.moveIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                </p>
                <p className="text-xs text-gray-500 mt-3 mb-2">Move-out Date</p>
                <p className="text-sm font-medium text-gray-900">{getMoveOutDate()}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentDetails(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Payment Instructions</h2>
              <button onClick={() => setShowPaymentDetails(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer</h3>
                <p className="text-sm text-gray-600 mb-2">Please transfer the total amount to the following account:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Account Name:</strong> The Blueground</p>
                  <p><strong>Account Number:</strong> 12345678</p>
                  <p><strong>Sort Code:</strong> 00-00-00</p>
                  <p><strong>Reference:</strong> BOOK{property?.id}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Payment will be verified within 24-48 hours after transfer.
              </p>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowPaymentDetails(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Booking;