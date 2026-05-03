import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiCalendar, FiDollarSign, FiUser, FiHome, FiPhone, FiMail, FiImage, FiSearch, FiFilter, FiMoreVertical, FiMapPin, FiClock, FiEdit, FiSave } from 'react-icons/fi';
import { bookingService } from '../../services/bookingService';
import Loader from '../../components/Loader';

const getStatusConfig = (status) => {
  const config = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: FiClock, label: 'Pending' },
    confirmed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: FiCheck, label: 'Confirmed' },
    approved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: FiCheck, label: 'Approved' },
    rejected: { bg: 'bg-primary-light', text: 'text-primary', border: 'border-primary/20', icon: FiX, label: 'Rejected' },
    cancelled: { bg: 'bg-primary-light', text: 'text-primary', border: 'border-primary/20', icon: FiX, label: 'Cancelled' },
    completed: { bg: 'bg-primary-light', text: 'text-primary', border: 'border-primary/20', icon: FiCheck, label: 'Completed' },
  };
  return config[status] || config.pending;
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingDate, setEditingDate] = useState(false);
  const [editingBooking, setEditingBooking] = useState(false);
  const [newMoveInDate, setNewMoveInDate] = useState('');
  const [editForm, setEditForm] = useState({ move_in_date: '', months: 0 });

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', GBP: '£', EUR: '€' };
    return symbols[currency] || '$';
  };

  const formatPrice = (amount, currency = 'USD') => `${getCurrencySymbol(currency)}${(parseFloat(amount) || 0).toLocaleString()}`;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getAllBookings();
      const data = res.data || [];
      
      const bookingsWithPayment = await Promise.all(
        data.map(async (booking) => {
          try {
            const detailRes = await bookingService.getBookingById(booking.id);
            return { ...booking, payment: detailRes.data.payment, payment_screenshot: detailRes.data.payment?.screenshot };
          } catch {
            return booking;
          }
        })
      );
      
      setBookings(bookingsWithPayment);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await bookingService.updateBookingStatus(id, status);
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.booking_status === filter;
    const matchesSearch = !search || 
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'pending').length,
    approved: bookings.filter(b => b.booking_status === 'approved').length,
    rejected: bookings.filter(b => b.booking_status === 'rejected').length,
    revenue: bookings.filter(b => b.booking_status === 'approved').reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="text-gray-500 mt-1">View and manage all property reservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: FiCalendar, color: 'bg-primary-light text-primary' },
          { label: 'Pending', value: stats.pending, icon: FiClock, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Approved', value: stats.approved, icon: FiCheck, color: 'bg-green-50 text-green-600' },
          { label: 'Rejected', value: stats.rejected, icon: FiX, color: 'bg-primary-light text-primary' },
          { label: 'Revenue', value: `${getCurrencySymbol('USD')}${stats.revenue.toLocaleString()}`, icon: FiDollarSign, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by property or user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && <span className="ml-2 text-xs opacity-70">{bookings.filter(b => b.booking_status === status).length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredBookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.booking_status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">#{booking.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <StatusIcon size={12} className="inline mr-1" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{booking.title || 'Property'}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{formatPrice(booking.total_amount, booking.currency)}</div>
                        <div className="text-xs text-gray-500">{booking.months} month{booking.months > 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">User</div>
                        <div className="font-medium text-sm text-gray-900">{booking.user_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1"><FiMail size={10} />{booking.email || '-'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="text-sm text-gray-900 flex items-center gap-1"><FiMapPin size={10} />{booking.location || 'N/A'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Stay Period</div>
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <FiCalendar size={12} />
                          {booking.move_in_date ? new Date(booking.move_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          <span className="text-gray-400">→</span>
                          {booking.move_out_date ? new Date(booking.move_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedBooking(booking)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-light text-primary rounded-xl hover:bg-primary/20 font-medium text-sm">
                        <FiEdit size={16} /> Edit
                      </button>
                      {booking.payment_screenshot && (
                        <button onClick={() => setSelectedBooking(booking)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary text-white rounded-xl hover:bg-secondary-dark font-medium text-sm">
                          <FiImage size={16} /> Payment
                        </button>
                      )}
                      {booking.booking_status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} disabled={updatingId === booking.id} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                            {updatingId === booking.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck size={16} />}
                            {updatingId === booking.id ? '...' : 'Approve'}
                          </button>
                          <button onClick={() => handleStatusUpdate(booking.id, 'rejected')} disabled={updatingId === booking.id} className="px-4 py-2.5 bg-primary-light text-primary rounded-xl hover:bg-primary/20 disabled:opacity-60 disabled:cursor-not-allowed">
                            {updatingId === booking.id ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <FiX size={16} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Booking Details #{selectedBooking.id}</h3>
                <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
              </div>
              
              {/* Property */}
              <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                <img src={selectedBooking.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'} alt={selectedBooking.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h4 className="text-white font-semibold">{selectedBooking.title}</h4>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-5 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FiUser /> Customer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Name:</span> <strong>{selectedBooking.user_name}</strong></div>
                  <div><span className="text-gray-500">Email:</span> {selectedBooking.email}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedBooking.user_phone || 'Not provided'}</div>
                  <div><span className="text-gray-500">Booking Date:</span> {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleDateString() : '-'}</div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500">Check-in</div>
                  {editingDate ? (
                    <input
                      type="date"
                      value={newMoveInDate}
                      onChange={(e) => setNewMoveInDate(e.target.value)}
                      className="w-full text-sm border rounded px-2 py-1 mt-1"
                    />
                  ) : (
                    <div className="font-semibold text-sm flex items-center justify-center gap-1">
                      {selectedBooking.move_in_date ? new Date(selectedBooking.move_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      <button onClick={() => { setNewMoveInDate(selectedBooking.move_in_date?.split('T')[0]); setEditingDate(true); }} className="ml-1 text-primary hover:text-primary-dark">
                        <FiEdit size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xs text-gray-500">Check-out</div><div className="font-semibold text-sm">{selectedBooking.move_out_date ? new Date(selectedBooking.move_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</div></div>
                <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xs text-gray-500">Duration</div><div className="font-semibold text-sm">{selectedBooking.months} mo</div></div>
                <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xs text-gray-500">Amount</div><div className="font-semibold text-sm text-primary">{formatPrice(selectedBooking.total_amount, selectedBooking.currency)}</div></div>
              </div>

              {/* Full Edit Button */}
              <button 
                onClick={() => { setEditForm({ move_in_date: selectedBooking.move_in_date?.split('T')[0], months: selectedBooking.months }); setEditingBooking(true); }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center justify-center gap-2 mb-4"
              >
                <FiEdit size={16} /> Edit Booking
              </button>

              {/* Full Edit Form */}
              {editingBooking && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Edit Booking Details</h4>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Move-in Date</label>
                    <input type="date" value={editForm.move_in_date} onChange={(e) => setEditForm({...editForm, move_in_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Duration</label>
                    <select value={editForm.months} onChange={(e) => setEditForm({...editForm, months: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg">
                      <option value={1}>1 Month</option>
                      <option value={2}>2 Months</option>
                      <option value={3}>3 Months</option>
                      <option value={4}>4 Months</option>
                      <option value={5}>5 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>1 Year</option>
                      <option value={24}>2 Years</option>
                      <option value={36}>3 Years</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => { try { await bookingService.updateBooking(selectedBooking.id, editForm); setSelectedBooking({ ...selectedBooking, ...editForm }); setEditingBooking(false); alert('Booking updated!'); } catch (error) { alert('Error updating'); }}} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium">Save</button>
                    <button onClick={() => setEditingBooking(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">Cancel</button>
                  </div>
                </div>
              )}

              {editingDate && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={async () => {
                      try {
                        await bookingService.updateBooking(selectedBooking.id, { move_in_date: newMoveInDate });
                        setSelectedBooking({ ...selectedBooking, move_in_date: newMoveInDate });
                        setEditingDate(false);
                        alert('Move-in date updated!');
                      } catch (error) {
                        alert('Error updating date');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingDate(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Payment Proof */}
              {selectedBooking.payment_screenshot ? (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FiImage /> Payment Proof</h4>
                  <img src={selectedBooking.payment_screenshot.startsWith('http') ? selectedBooking.payment_screenshot : `http://localhost:5001${selectedBooking.payment_screenshot}`} alt="Payment proof" className="w-full h-64 object-contain rounded-2xl bg-gray-100" />
                  <div className="mt-2 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedBooking.payment_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {selectedBooking.payment_status === 'verified' ? '✓ Verified' : '⏳ Pending Verification'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center mb-4">
                  <FiImage className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No payment proof uploaded yet</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedBooking.booking_status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')} disabled={updatingId === selectedBooking.id} className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {updatingId === selectedBooking.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck />}
                    {updatingId === selectedBooking.id ? 'Processing...' : 'Approve Booking'}
                  </button>
                  <button onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')} disabled={updatingId === selectedBooking.id} className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {updatingId === selectedBooking.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiX />}
                    {updatingId === selectedBooking.id ? 'Processing...' : 'Reject Booking'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookings;