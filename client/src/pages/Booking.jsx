import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import { useAuthStore, useCurrencyStore } from '../store/useStore';
import Loader from '../components/Loader';

const defaultTerms = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6;">
  <div style="border-bottom: 2px solid #e5e7eb; pb: 6px; mb: 8px;">
    <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">Blueground Rental Terms and Conditions</h2>
    <p style="color: #6b7280; margin: 0; font-size: 14px;">Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>

  <div style="margin-bottom: 24px;">
    <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px;">These Terms and Conditions govern the booking of properties through Blueground. By making a reservation, you agree to the following terms.</p>
  </div>

  <div style="background: #f0f9ff; border-left: 4px solid #4979a4; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Introduction</h3>
    <p style="margin: 0; color: #4b5563; font-size: 14px;">These Terms and Conditions govern the booking of properties through Blueground. By making a reservation, you agree to the following terms.</p>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">2</span>
      Reservation and Payment
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">2.1 A booking is confirmed only upon receipt of full payment, as specified at the time of booking.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">2.2 All payments must be made via the payment methods provided by Blueground.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">2.3 Failure to make the required payment(s) on time may result in the cancellation of your booking.</p>
      <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 12px; border-radius: 8px; margin-top: 12px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;"><strong>2.4</strong> Our agent will be available to show the property, sign the contract, and hand over the keys only after the payment is processed by our bank.</p>
      </div>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">3</span>
      Cancellations and Refunds
    </h3>
    <div style="margin-left: 36px;">
      <div style="background: #dcfce7; border: 1px solid #86efac; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;"><strong>3.1</strong> Cancellations made by the guest before the check-in date are eligible for a full refund.</p>
      </div>
      <div style="background: #dcfce7; border: 1px solid #86efac; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;"><strong>3.2</strong> In the event of force majeure (e.g., natural disasters, pandemics), bookings may be cancelled with a full refund or rescheduled based on availability.</p>
      </div>
      <div style="background: #dcfce7; border: 1px solid #86efac; padding: 12px; border-radius: 8px;">
        <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;"><strong>3.3</strong> Property Viewing Refund Policy: If, during the property visit, you find the property unsatisfactory or decide not to proceed with the rental for any reason, the rental contract will not be signed, and you will be entitled to an immediate refund of the payment made. No further obligations will arise from the cancelled booking.</p>
      </div>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">3</span>
      Deposit Return Conditions
    </h3>
    <div style="margin-left: 36px;">
      <div style="background: #dcfce7; border: 1px solid #86efac; padding: 12px; border-radius: 8px;">
        <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;"><strong>3.4</strong> The full security deposit will be returned at the end of the rental period, provided that the property is handed back in good condition and shows no signs of damage, deterioration, or missing items compared to its original state at the start of the tenancy. In the event that any damages are identified, the cost of repairs will be deducted from the deposit, and any remaining balance will be returned to the tenant.</p>
      </div>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">4</span>
      Check-in and Check-out
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">4.1 Check-in is flexible and can be made at any time on the day of arrival. Check-out must be completed by 12:00 PM on the day of departure, unless otherwise agreed with the Landlord.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">4.2 Early check-in or late check-out can be arranged with prior notice and no additional fees will be charged.</p>
    </div>
  </div>

  <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1e40af; margin: 0 0 12px 0;">Very Important</h3>
    <p style="margin: 0; color: #1e40af; font-size: 14px;">The rental contract can be extended under a private arrangement after the Blueground reservation expires. A private arrangement means you can rent the property directly from the Landlord without intermediaries. To do this, you must contact the Landlord and negotiate the terms.</p>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">5</span>
      Property Use
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">5.1 The property is to be used solely for residential purposes.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">5.2 No parties, events, or illegal activities are permitted on the premises.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">5.3 Guests are responsible for any damage to the property during their stay and will be charged accordingly.</p>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">6</span>
      Changes to the Booking
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">6.1 Any request to amend a booking must be submitted in writing, and we will do our best to accommodate such requests, subject to availability.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">6.2 Any changes to the booking, including changes in dates or the number of guests, are free. However, additional fees may apply for other types of changes such as extending the stay or requesting premium services.</p>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">7</span>
      Property Inspection
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">7.1 Guests are responsible for inspecting the property upon check-in.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">7.2 Any issues or damages found upon check-in should be reported to the Landlord or agent immediately to avoid potential charges upon check-out.</p>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">8</span>
      Liability
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">8.1 Blueground and the Landlord shall not be held liable for any accidents, injuries, or loss of personal belongings during the stay.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">8.2 Guests are responsible for ensuring their safety and security during their stay.</p>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">9</span>
      Termination of Booking
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">9.1 We reserve the right to terminate a booking at any time if the guest violates these Terms and Conditions, engages in illegal activities, or causes disturbances.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">9.2 In such cases, no refund will be provided, and additional fees may apply for any damages caused.</p>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">10</span>
      Governing Law
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">10.1 These Terms and Conditions are governed and construed under the laws of the country where the property is located, and any disputes arising shall be subject to the jurisdiction of the courts in that region.</p>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #4979a4; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">11</span>
      Data Privacy
    </h3>
    <div style="margin-left: 36px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">11.1 All personal data provided for the booking will be treated under our Privacy Policy.</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">11.2 We will not share your information with third parties unless required by law or necessary to facilitate your Blueground reservation.</p>
    </div>
  </div>

  <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb; text-align: center;">
    <p style="color: #6b7280; font-size: 13px; margin: 0;">By proceeding with your booking, you acknowledge that you have read and agree to these Terms and Conditions.</p>
  </div>
</div>
`;

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { symbol, currency } = useCurrencyStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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
    const start = new Date(formData.moveIn);
    const end = new Date(start);
    end.setMonth(end.getMonth() + formData.months);
    return end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      alert('Please agree to the Terms of Rent');
      return;
    }
    if (!user?.id) {
      alert('Please login to book a property');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const bookingData = {
        property_id: parseInt(id),
        move_in_date: formData.moveIn,
        months: formData.months,
        user_id: user.id,
        currency: currency,
      };
      const res = await bookingService.createBooking(bookingData);
      navigate(`/payment/${res.data.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      const msg = error.response?.data?.message || 'Error creating booking. Please try again.';
      alert(msg);
      if (msg.includes('login')) {
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!property) return <div className="text-center py-12">Property not found</div>;

  const monthlyRate = parseFloat(property.monthly_price || property.monthly_rent || 0);
  const depositAmount = parseFloat(property.deposit || 0);
  const totalPrice = (monthlyRate * formData.months) + depositAmount;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="heading-section mb-8"
        >
          Book Property
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="card-premium p-8 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Move In Date</label>
                  <input
                    type="date"
                    required
                    value={formData.moveIn}
                    onChange={(e) => setFormData({ ...formData, moveIn: e.target.value })}
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={formData.months}
                    onChange={(e) => setFormData({ ...formData, months: parseInt(e.target.value) })}
                    className="input-premium"
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  <span>Read Rental Agreement</span>
                  <span className="text-xs opacity-70">(Required)</span>
                </button>
                <button 
                  type="submit"
                  disabled={submitting || !agreed}
                  className="btn-primary flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Agree and Proceed to Payment'
                  )}
                </button>
              </div>
            </motion.form>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="card-premium p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

              <div className="flex gap-4 mb-4">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-24 h-24 rounded-lg object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop'; }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{property.title}</h4>
                  <p className="text-sm text-gray-500">{property.location}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="capitalize">{property.property_type}</span>•<span>{property.bedrooms} bed</span>•<span>{property.bathrooms} bath</span>•<span>{property.square_feet} sqft</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property</span>
                  <span className="font-medium text-right max-w-[150px] text-right">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-right">{property.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrooms</span>
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bathrooms</span>
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Square Feet</span>
                  <span>{property.square_feet} sqft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span>{formatPrice(property.monthly_price)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Move In</span>
                  <span>{formData.moveIn ? new Date(formData.moveIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Move Out</span>
                  <span>{getMoveOutDate()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span>{formData.months} Month{formData.months > 1 ? 's' : ''}</span>
                </div>
                {depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit</span>
                    <span>{formatPrice(depositAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

<AnimatePresence>
        {showTerms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTerms(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-primary/10 to-transparent">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Blueground Rental Terms</h2>
                  <p className="text-sm text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <FaTimes className="text-gray-500 w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: defaultTerms }}
                />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    I have read and agree to the <span className="text-primary font-medium">Terms and Conditions</span>
                  </span>
                </label>
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowTerms(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAgreed(true); setShowTerms(false); }}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!agreed}
                  >
                    Agree and Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booking;