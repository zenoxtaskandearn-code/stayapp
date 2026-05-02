import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShield, FiClock, FiHeart, FiAward, FiArrowRight, FiSearch } from 'react-icons/fi';
import PropertyCard from '../components/PropertyCard';
import { propertyService } from '../services/propertyService';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({ search: '', moveIn: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await propertyService.getFeaturedProperties();
        const data = res.data;
        if (Array.isArray(data)) {
          setFeaturedProperties(data.slice(0, 4));
        }
      } catch (error) {
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchData.search.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await propertyService.getProperties({ search: searchData.search, limit: 5 });
        setSuggestions(res.data?.properties || res.data || []);
      } catch (error) {
        setSuggestions([]);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [searchData.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    let url = `/properties?search=${searchData.search}`;
    if (searchData.moveIn) url += `&moveIn=${searchData.moveIn}`;
    window.location.href = url;
  };

  const selectSuggestion = (location) => {
    setSearchData({ ...searchData, search: location });
    setShowSuggestions(false);
    window.location.href = `/properties?search=${location}`;
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[75vh] md:h-[80vh] p-4 mt-5">
        <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent" />
          <div className="relative z-10 h-full flex items-center justify-start px-8 md:px-14 lg:px-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-lg md:max-w-xl"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-7 md:p-9">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-[2.5px] bg-primary" />
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">Premium Living</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 leading-[1.15] mb-5">
                  Feel at home,<br />
                  <span className="text-primary">free to roam.</span>
                </h1>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-7 max-w-md">
                  Experience the home that moves with you for a month, a year, or longer with a global network of designer, furnished apartments.
                </p>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center bg-gray-50 rounded-full p-1.5 shadow-lg border border-gray-200">
                    <div className="flex-1 px-5">
                      <input 
                        type="text" 
                        placeholder="Where?" 
                        value={searchData.search} 
                        onChange={(e) => {
                          setSearchData({ ...searchData, search: e.target.value });
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full bg-transparent text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none" 
                      />
                    </div>
                    <div className="w-px h-8 bg-gray-300" />
                    <div className="flex-1 px-5">
                      <input 
                        type="text" 
                        placeholder="When?" 
                        value={searchData.moveIn} 
                        onChange={(e) => setSearchData({ ...searchData, moveIn: e.target.value })} 
                        onFocus={(e) => (e.target.type = 'date')} 
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')} 
                        className="w-full bg-transparent text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none" 
                      />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all text-sm md:text-base shadow-lg hover:shadow-xl">Search</button>
                  </div>
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {suggestions.map((property, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectSuggestion(property.location)}
                          className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <FiSearch className="text-gray-400" />
                          <span className="text-gray-900">{property.location}</span>
                          <span className="text-gray-500 text-sm">- {property.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Properties */}
      {!loading && featuredProperties.length > 0 && (
      <section className="py-20 bg-gray-50">
        <div className="px-6 md:px-12 lg:px-16">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Explore</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Popular Properties</h2>
              </div>
              <Link to="/properties" className="mt-4 md:mt-0 text-primary font-semibold hover:text-primary-dark flex items-center gap-2">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="px-6 md:px-12 lg:px-16">
          <div className="bg-gray-50 rounded-3xl p-10 md:p-14">
            <div className="text-center mb-12">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Simple Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[{ number: '01', title: 'Search', desc: 'Find your perfect home' }, { number: '02', title: 'Book', desc: 'Select dates and book' }, { number: '03', title: 'Move In', desc: 'Enjoy your new home' }].map((step, i) => (
                <motion.div key={i} whileHover={{ y: -6 }} className="bg-white rounded-2xl p-8 text-center shadow-md">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="px-6 md:px-12 lg:px-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Ready to find your home?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Browse our collection of premium properties and find the perfect place for you.</p>
            <Link to="/properties" className="inline-flex items-center gap-3 bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl">
              Browse Properties <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-gray-50">
        <div className="px-6 md:px-12 lg:px-16">
          <div className="bg-white rounded-3xl p-10 md:p-14 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest">About Us</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Your Home Away From Home</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-5">StayFinder was founded with a simple mission: to make finding premium rental accommodations as seamless and enjoyable as possible. We believe that where you live should enhance your life, not complicate it.</p>
                <p className="text-gray-600 text-lg leading-relaxed mb-10">Our curated collection of furnished apartments spans the world's most desirable cities, each one selected for its quality, location, and ability to feel like home.</p>
                <div className="flex gap-10">
                  <div><span className="text-4xl font-bold text-primary">15K+</span><p className="text-gray-500 font-medium">Properties</p></div>
                  <div><span className="text-4xl font-bold text-primary">80+</span><p className="text-gray-500 font-medium">Cities</p></div>
                  <div><span className="text-4xl font-bold text-primary">4.9</span><p className="text-gray-500 font-medium">Rating</p></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-2xl h-40" />
                <div className="bg-primary/10 rounded-2xl h-40 mt-8" />
                <div className="bg-primary/10 rounded-2xl h-40 -mt-8" />
                <div className="bg-primary/10 rounded-2xl h-40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="px-6 md:px-12 lg:px-16">
          <div className="bg-gray-50 rounded-3xl p-10 md:p-14">
            <div className="text-center mb-12">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">The StayFinder Difference</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{ icon: FiShield, title: 'Secure Booking', desc: 'Your payments are protected with enterprise-grade security' }, { icon: FiClock, title: 'Flexible Terms', desc: 'Stay for a month, a year, or whenever you need' }, { icon: FiHeart, title: 'Premium Comfort', desc: 'Designer furnished apartments in prime locations' }, { icon: FiAward, title: 'Quality Assured', desc: 'Every property verified and inspected for your peace of mind' }].map((feature, i) => (
                <motion.div key={i} whileHover={{ y: -6 }} className="bg-white p-6 rounded-2xl shadow-md">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <feature.icon className="text-primary text-2xl" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;