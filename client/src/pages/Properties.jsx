import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropertyCard from '../components/PropertyCard';
import { PropertyGridSkeleton } from '../components/PropertyCardSkeleton';
import { propertyService } from '../services/propertyService';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaMapMarkerAlt, FaHome, FaDollarSign } from 'react-icons/fa';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    moveIn: searchParams.get('moveIn') || '',
    moveOut: searchParams.get('moveOut') || '',
  });

  useEffect(() => {
    fetchFilters();
    fetchProperties();
  }, [filters]);

  useEffect(() => {
    // Fetch available types and locations
    const fetchFilterOptions = async () => {
      try {
        const [typesRes, locationsRes] = await Promise.all([
          propertyService.getPropertyTypes(),
          propertyService.getLocations(),
        ]);
        setPropertyTypes(typesRes.data || []);
        setLocations(locationsRes.data || []);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  const fetchFilters = async () => {
    try {
      const [typesRes, locationsRes] = await Promise.all([
        propertyService.getPropertyTypes(),
        propertyService.getLocations(),
      ]);
      setPropertyTypes(typesRes.data || []);
      setLocations(locationsRes.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getProperties(filters);
      const data = res.data;
      let props = Array.isArray(data) ? data : (data.properties || []);
      props = props.map(p => ({
        ...p,
        monthly_rent: p.monthly_price || p.monthly_rent || 0
      }));
      setProperties(props);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      location: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            placeholder="Property name or keyword..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-premium pl-10"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
        <div className="relative">
          <FaHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="input-premium pl-10 appearance-none"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type.property_type} value={type.property_type}>
                {type.property_type} ({type.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            className="input-premium pl-10 appearance-none"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.city} value={loc.city}>
                {loc.city} ({loc.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (Monthly)</label>
        <div className="relative">
          <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="input-premium pl-10 mb-3"
          >
            <option value="">Min Price</option>
            <option value="500">$500</option>
            <option value="1000">$1,000</option>
            <option value="1500">$1,500</option>
            <option value="2000">$2,000</option>
            <option value="2500">$2,500</option>
            <option value="3000">$3,000</option>
            <option value="4000">$4,000</option>
            <option value="5000">$5,000</option>
          </select>
        </div>
        <div className="relative">
          <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="input-premium pl-10"
          >
            <option value="">Max Price</option>
            <option value="1000">$1,000</option>
            <option value="1500">$1,500</option>
            <option value="2000">$2,000</option>
            <option value="2500">$2,500</option>
            <option value="3000">$3,000</option>
            <option value="4000">$4,000</option>
            <option value="5000">$5,000</option>
            <option value="10000">$10,000</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.search || filters.type || filters.location || filters.minPrice || filters.maxPrice) && (
        <button
          onClick={clearFilters}
          className="w-full py-3 text-primary font-medium hover:bg-primary-light px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <FaTimes size={14} />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container-custom">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Find Your <span className="text-primary">Perfect Home</span>
          </motion.h1>
          <p className="text-gray-500 text-lg">
            Browse {properties.length} premium Properties available for rent
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-premium p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <FaFilter className="text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <FaFilter />
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {showMobileFilters && (
                <div className="mt-4 bg-white rounded-2xl shadow-premium p-6">
                  <FilterPanel />
                </div>
              )}
            </div>

            {/* Properties Grid */}
            {loading ? (
              <PropertyGridSkeleton />
            ) : Array.isArray(properties) && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <FaHome className="mx-auto text-gray-300 text-5xl mb-4" />
                <p className="text-gray-500 text-lg mb-2">No Properties Found</p>
                <p className="text-gray-400">Try adjusting your filters to see more results.</p>
                <button onClick={clearFilters} className="btn-primary mt-4">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;