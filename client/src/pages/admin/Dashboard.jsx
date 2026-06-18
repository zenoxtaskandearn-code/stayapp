import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiGrid, FiCalendar, FiDollarSign, FiUser, FiSettings, FiPlus, FiTrendingUp, FiArrowUp, FiArrowDown, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiBarChart2 } from 'react-icons/fi';
import { propertyService } from '../../services/propertyService';
import { bookingService } from '../../services/bookingService';
import Loader from '../../components/Loader';

const statCards = [
  { label: 'Total Properties', key: 'properties', icon: FiHome, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  { label: 'Total Bookings', key: 'bookings', icon: FiCalendar, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
  { label: 'Pending', key: 'pending', icon: FiClock, gradient: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50' },
  { label: 'Approved', key: 'approved', icon: FiCheckCircle, gradient: 'from-green-500 to-green-600', bg: 'bg-green-50' },
  { label: 'Total Revenue', key: 'revenue', icon: FiDollarSign, gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', prefix: '$' },
];

const quickActions = [
  { label: 'Add Property', icon: FiPlus, to: '/admin/properties', bg: 'from-rose-500 to-pink-600', hover: 'hover:from-rose-600 hover:to-pink-700' },
  { label: 'View Bookings', icon: FiCalendar, to: '/admin/bookings', bg: 'from-violet-500 to-purple-600', hover: 'hover:from-violet-600 hover:to-purple-700' },
  { label: 'Categories', icon: FiGrid, to: '/admin/categories', bg: 'from-cyan-500 to-blue-600', hover: 'hover:from-cyan-600 hover:to-blue-700' },
  { label: 'Settings', icon: FiSettings, to: '/admin/settings', bg: 'from-slate-500 to-gray-600', hover: 'hover:from-slate-600 hover:to-gray-700' },
];

const recentActivities = [
  { type: 'booking', label: 'New booking', icon: FiCalendar, color: 'text-purple-500' },
  { type: 'property', label: 'Property added', icon: FiHome, color: 'text-blue-500' },
  { type: 'payment', label: 'Payment received', icon: FiDollarSign, color: 'text-green-500' },
];

const getCurrencySymbol = (currency) => {
  const symbols = { USD: '$', GBP: '£', EUR: '€', NZD: 'NZ$' };

const formatPrice = (amount, currency = 'USD') => `${getCurrencySymbol(currency)}${(parseFloat(amount) || 0).toLocaleString()}`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    revenue: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        propertyService.getProperties(),
        bookingService.getAllBookings(),
      ]);

      const props = Array.isArray(propertiesRes.data) ? propertiesRes.data : (propertiesRes.data.properties || []);
      const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      
      setRecentBookings(bookings.slice(0, 5));

      setStats({
        totalProperties: props.length,
        totalBookings: bookings.length,
        revenue: bookings.filter(b => b.booking_status === 'approved').reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
        pendingBookings: bookings.filter(b => b.booking_status === 'pending').length,
        approvedBookings: bookings.filter(b => b.booking_status === 'approved').length,
        rejectedBookings: bookings.filter(b => b.booking_status === 'rejected').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatValue = (key) => {
    if (key === 'properties') return stats.totalProperties;
    if (key === 'bookings') return stats.totalBookings;
    if (key === 'pending') return stats.pendingBookings;
    if (key === 'approved') return stats.approvedBookings;
    if (key === 'revenue') return stats.revenue;
    return 0;
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
          <p className="text-white/80">Here's what's happening with your properties today.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="text-gray-600" size={22} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stat.key === 'revenue' ? formatPrice(getStatValue(stat.key)) : (typeof getStatValue(stat.key) === 'number' ? getStatValue(stat.key).toLocaleString() : 0)}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${action.bg} ${action.hover} text-white transition-all hover:shadow-lg hover:scale-[1.02]`}
            >
              <action.icon size={20} />
              <span className="font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-primary hover:text-primary-dark font-medium text-sm">View All →</Link>
        </div>
        
        {recentBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">#{booking.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.user_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{booking.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{booking.title || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-green-600">{formatPrice(booking.total_amount, booking.currency)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.booking_status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-primary-light text-primary'
                        }`}>
                          {booking.booking_status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;