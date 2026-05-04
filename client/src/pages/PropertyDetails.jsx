import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';
import { FiCreditCard } from 'react-icons/fi';
import { propertyService } from '../services/propertyService';
import { useAuthStore, useCurrencyStore } from '../store/useStore';

const PropertyDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { symbol } = useCurrencyStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [moveInDate, setMoveInDate] = useState(searchParams.get('moveIn') || '');
  const [months, setMonths] = useState(1);

  const formatPrice = (amount) => `${symbol}${(parseFloat(amount) || 0).toLocaleString()}`;

  // Calculate move out date
  const getMoveOutDate = () => {
    if (!moveInDate) return '';
    const [y, m, d] = moveInDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    start.setMonth(start.getMonth() + months);
    return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getPropertyById(id);
      const prop = res.data;
      if (!prop) {
        navigate('/properties');
        return;
      }
      
      prop.monthly_rent = prop.monthly_price || prop.monthly_rent || 0;
      
      // Only redirect if property is DELETED - use map_link or Yahoo
      if (prop.status === 'deleted') {
        window.location.href = prop.map_link || 'https://www.yahoo.com';
        return;
      }
      
      setProperty(prop);
    } catch (error) {
      console.error('Error fetching property:', error);
      // Redirect to properties page if property not found or deleted
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      // Store pending booking data before redirecting to login
      localStorage.setItem('pendingBooking', JSON.stringify({ 
        propertyId: id, 
        moveIn: moveInDate, 
        months: months 
      }));
      localStorage.setItem('returnToBooking', `/booking/${id}?moveIn=${moveInDate}&months=${months}`);
      window.location.href = '/login';
      return;
    }
    // Redirect with move in date and months
    window.location.href = `/booking/${id}?moveIn=${moveInDate}&months=${months}`;
  };

  if (loading) return <PropertySkeleton />;
  if (!property) return <div className="text-center py-12">Property not found</div>;

  const monthlyRate = parseFloat(property.monthly_price || property.monthly_rent || 0);
  const deposit = parseFloat(property.deposit || 0);
  const totalPrice = (monthlyRate * months) + deposit;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <div className="rounded-2xl overflow-hidden h-[400px] mb-4">
                <img
                  src={property.images?.[selectedImage] || 'https://via.placeholder.com/800x400'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {property.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <FaMapMarkerAlt />
                <span>{property.location}</span>
              </div>

              <div className="flex gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-700">
                  <FaBed />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaBath />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaRulerCombined />
                  <span>{property.square_feet} sqft</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: property.description }} />
              </div>

              {property.amenities?.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-700">
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.payment_methods?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-3">Accepted Payment Methods</h2>
                  <div className="space-y-3">
                    {property.payment_methods.map((method) => (
                      <div key={method.id} className="bg-primary/30 rounded-xl p-4">
                        <div className="font-semibold text-gray-900">{method.name}</div>
                        {method.description && (
                          <div className="text-sm text-gray-700 mt-1" dangerouslySetInnerHTML={{ __html: method.description }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.map_link && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-3">Location on Map</h2>
                  <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                      src={(() => {
                        const link = property.map_link;
                        if (link.startsWith('<iframe')) {
                          const match = link.match(/src="([^"]+)"/);
                          return match ? match[1] : link;
                        }
                        return link;
                      })()}
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={property.title}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Booking Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="card-premium p-6">
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(monthlyRate)}</span>
                <span className="text-gray-500">/month</span>
                {deposit > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    + Security Deposit: <span className="font-medium text-gray-700">{formatPrice(deposit)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Move In Date</label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    className="input-premium w-full"
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months</option>
                    <option value={5}>5 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={36}>3 Years</option>
                    <option value={48}>4 Years</option>
                    <option value={60}>5 Years</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Monthly Rent</span>
                  <span className="text-gray-700">{formatPrice(monthlyRate)} × {months} month{months > 1 ? 's' : ''}</span>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Security Deposit</span>
                    <span className="text-gray-700">{formatPrice(deposit)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total ({months} Month{months > 1 ? 's' : ''})</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button onClick={handleBooking} className="btn-primary w-full">
                {isAuthenticated ? 'Continue to Book' : 'Login to Book'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const PropertySkeleton = () => (
  <div className="section-padding">
    <div className="container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="skeleton-shimmer h-[400px] rounded-2xl mb-4" />
          <div className="skeleton-shimmer h-8 w-3/4 mb-4 rounded" />
          <div className="skeleton-shimmer h-4 w-1/2 rounded" />
        </div>
        <div className="card-premium p-6">
          <div className="skeleton-shimmer h-10 w-1/3 mb-4 rounded" />
          <div className="skeleton-shimmer h-10 rounded mb-4" />
          <div className="skeleton-shimmer h-10 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default PropertyDetails;