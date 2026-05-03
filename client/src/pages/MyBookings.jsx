import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaHome, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { bookingService } from '../services/bookingService';
import { useAuthStore } from '../store/useStore';
import Loader from '../components/Loader';

const getCurrencySymbol = (curr) => {
  const symbols = { USD: '$', GBP: '£', EUR: '€' };
  return symbols[curr] || '$';
};

const MyBookings = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const formatPrice = (amount, currency = 'USD') => `${getCurrencySymbol(currency)}${(parseFloat(amount) || 0).toLocaleString()}`;

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Pass user_id to get correct user's bookings
      const res = await bookingService.getMyBookings(user?.id);
      setBookings(res.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-primary-light text-primary border-primary/20',
      cancelled: 'bg-primary-light text-primary border-primary/20',
      completed: 'bg-primary-light text-primary border-primary/20',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'confirmed' || status === 'approved') return <FaCheckCircle />;
    if (status === 'cancelled' || status === 'rejected') return <FaTimesCircle />;
    return <FaClock />;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.booking_status === activeTab;
  });

const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-primary-dark py-16">
        <div className="container-custom">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            My Bookings
          </motion.h1>
          <p className="text-white/80">Manage your property reservations</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.key === 'all' ? bookings.length : bookings.filter(b => b.booking_status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHome className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' ? "You haven't made any bookings yet." : `No ${activeTab} bookings.`}
            </p>
            <Link to="/properties" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors">
              <FaHome /> Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-64 h-48 lg:h-auto relative">
                    <img
                      src={booking.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'}
                      alt={booking.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.booking_status)}`}>
                        {getStatusIcon(booking.booking_status)}
                        {booking.booking_status || 'pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {booking.title || 'Property'}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaMapMarkerAlt className="text-xs" />
                          <span>{booking.location || 'Location not specified'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(booking.total_amount || booking.monthly_price, booking?.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.months} month{booking.months > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">Check-in</div>
                        <div className="font-medium text-sm">
                          {booking.move_in_date ? new Date(booking.move_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">Check-out</div>
                        <div className="font-medium text-sm">
                          {booking.move_out_date ? new Date(booking.move_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">Booking ID</div>
                        <div className="font-medium text-sm">#{booking.id}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">Property</div>
                        <div className="font-medium text-sm">Monthly</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/properties/${booking.property_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <FaHome /> View Property
                      </Link>
                      {booking.booking_status === 'pending' && (
                        <Link
                          to={`/payment/${booking.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium"
                        >
                          Complete Payment
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;