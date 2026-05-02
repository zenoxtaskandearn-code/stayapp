import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBed, FaBath, FaRulerCombined, FaImage } from 'react-icons/fa';
import { useCurrencyStore } from '../store/useStore';

const defaultImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop';

const PropertyCard = ({ property }) => {
  const [searchParams] = useSearchParams();
  const moveIn = searchParams.get('moveIn');
  const moveOut = searchParams.get('moveOut');
  const { symbol } = useCurrencyStore();
  const price = property.monthly_price || property.monthly_rent || 0;
  const imageUrl = property.images?.[0] || defaultImage;

  const propertyLink = `/properties/${property.id}${moveIn || moveOut ? `?moveIn=${moveIn || ''}&moveOut=${moveOut || ''}` : ''}`;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-premium"
    >
      <Link to={propertyLink}>
        <div className="relative overflow-hidden h-48">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => { e.target.src = defaultImage; }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FaImage className="text-gray-400" size={40} />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-semibold text-gray-900">
            {symbol}{price}/mo
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3">{property.location}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FaBed size={14} />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1">
              <FaBath size={14} />
              <span>{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center gap-1">
              <FaRulerCombined size={14} />
              <span>{property.square_feet} sqft</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
