import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiHome, FiMapPin, FiDollarSign, FiX, FiImage, FiCheck, FiTrash, FiUpload } from 'react-icons/fi';
import { propertyService } from '../../services/propertyService';
import { categoryService } from '../../services/categoryService';
import { paymentMethodService } from '../../services/paymentMethodService';
import api from '../../services/api';
import Loader from '../../components/Loader';

const amenitiesList = ['WiFi', 'Pool', 'Garden', 'Parking', 'A/C', 'Security', 'Kitchen', 'Washer', 'Gym', 'Balcony', 'Fireplace', 'Heating', 'TV'];
const currencyOptions = [
  { code: 'GBP', symbol: '£' },
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
];

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [displayCurrency, setDisplayCurrency] = useState('GBP');
  const [formData, setFormData] = useState({
    title: '', location: '', description: '', map_link: '', monthly_price: '', deposit: '', bedrooms: '', bathrooms: '', square_feet: '', property_type: '', category_id: '', status: 'available', amenities: [], images: [], payment_method_ids: []
  });

  const displaySymbol = currencyOptions.find((c) => c.code === displayCurrency)?.symbol || '$';

  useEffect(() => {
    fetchProperties();
    fetchCategories();
    fetchPaymentMethods();
  }, []);

  const fetchProperties = async () => {
    try {
      // Admin should see all properties (including booked), not just available
      const res = await propertyService.getProperties({ status: 'all' });
      const data = res.data;
      setProperties(Array.isArray(data) ? data : (data.properties || []));
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await paymentMethodService.getAll();
      setPaymentMethods(res.data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const res = await propertyService.deleteProperty(id);
        // If there's a redirect URL from server, redirect user
        if (res.data?.redirectUrl) {
          window.location.href = res.data.redirectUrl;
        } else {
          fetchProperties();
        }
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const openModal = (property = null) => {
    if (property) {
      setEditProperty(property);
      
      // Load selected payment method IDs - handle all possible formats
      let selectedPaymentIds = [];
      if (property.payment_methods && Array.isArray(property.payment_methods)) {
        selectedPaymentIds = property.payment_methods.map(pm => pm.id);
      } else if (property.payment_method_ids) {
        if (Array.isArray(property.payment_method_ids)) {
          selectedPaymentIds = property.payment_method_ids;
        } else if (typeof property.payment_method_ids === 'string') {
          if (property.payment_method_ids.includes(',')) {
            selectedPaymentIds = property.payment_method_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          } else if (property.payment_method_ids.match(/^\d+$/)) {
            selectedPaymentIds = [parseInt(property.payment_method_ids)];
          } else {
            try {
              const parsed = JSON.parse(property.payment_method_ids);
              selectedPaymentIds = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              selectedPaymentIds = [];
            }
          }
        }
      }
      
      // Ensure it's always an array
      if (!Array.isArray(selectedPaymentIds)) {
        selectedPaymentIds = [];
      }
      
      setFormData({
        title: property.title || '',
        location: property.location || '',
        description: property.description || '',
        map_link: property.map_link || '',
        monthly_price: property.monthly_price || '',
        deposit: property.deposit || '',
        min_rental_months: property.min_rental_months || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        square_feet: property.square_feet || '',
        property_type: property.property_type || '',
        category_id: property.category_id || '',
        status: property.status || 'available',
        amenities: typeof property.amenities === 'string' ? JSON.parse(property.amenities) : (property.amenities || []),
        images: property.images || [],
        payment_method_ids: selectedPaymentIds,
      });
    } else {
      setEditProperty(null);
      setFormData({
title: '', location: '', description: '', map_link: '', monthly_price: '', deposit: '', min_rental_months: '', bedrooms: '', bathrooms: '', square_feet: '', property_type: '', category_id: '', status: 'available', amenities: [], images: [], payment_method_ids: []
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      try {
        const res = await api.post('/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.url) {
          uploadedUrls.push(res.data.url);
        }
      } catch (error) {
        console.error('Error uploading:', error);
        alert('Upload failed: ' + (error.response?.data?.message || error.message));
      }
    }
    
    setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { 
        title: formData.title,
        description: formData.description || '',
        location: formData.location,
        monthly_price: parseFloat(formData.monthly_price) || 0,
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
        min_rental_months: formData.min_rental_months ? parseInt(formData.min_rental_months) : 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        square_feet: parseInt(formData.square_feet) || 0,
        property_type: formData.property_type || 'apartment',
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        status: formData.status || 'available',
        amenities: formData.amenities || [],
        images: formData.images || [],
        map_link: formData.map_link || null,
      };
      console.log('Saving:', data);
      
      let propertyId;
      if (editProperty) {
        await propertyService.updateProperty(editProperty.id, data);
        propertyId = editProperty.id;
      } else {
        const res = await propertyService.createProperty(data);
        propertyId = res.data?.id;
      }
      
      // Save payment methods for this property
      if (propertyId && formData.payment_method_ids.length > 0) {
        await paymentMethodService.updateForProperty(propertyId, formData.payment_method_ids);
      }
      
      setShowModal(false);
      setEditProperty(null);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const filteredProperties = properties.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your property listings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Display</span>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            <FiPlus size={16} /> Add Property
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input type="text" placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-96 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <FiHome className="mx-auto text-gray-300 text-4xl mb-4" />
          <p className="text-gray-500">No properties found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => (
            <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md">
              <div className="relative h-40">
                <img src={property.images?.[0] || 'https://via.placeholder.com/400x200'} alt={property.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-sm font-medium">{displaySymbol}{property.monthly_price || 0}/mo</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2"><FiMapPin size={12} /><span className="truncate">{property.location}</span></div>
                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.square_feet} sqft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${property.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{property.status || 'available'}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(property)} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"><FiEdit size={14} /></button>
                    <button onClick={() => handleDelete(property.id)} className="p-2 rounded-lg bg-primary-light text-primary hover:bg-primary/20"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editProperty ? 'Edit Property' : 'Add Property'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Location *</label><input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed Link</label><input type="text" value={formData.map_link} onChange={(e) => setFormData({...formData, map_link: e.target.value})} placeholder="Paste the full iframe code or just the src URL" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /><p className="text-xs text-gray-400 mt-1">Google Maps → Share → "Embed a map" → Copy and paste the entire iframe code here</p></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{displaySymbol}</span>
                      <input
                        type="number"
                        required
                        value={formData.monthly_price}
                        onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label><input type="number" value={formData.deposit} onChange={(e) => setFormData({...formData, deposit: e.target.value})} placeholder="One-time deposit" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
<div><label className="block text-sm font-medium text-gray-700 mb-1">Min Rental Months</label>
                      <select value={formData.min_rental_months || ''} onChange={(e) => setFormData({...formData, min_rental_months: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                        <option value="">No minimum</option>
                        <option value="1">1 Month</option>
                        <option value="2">2 Months</option>
                        <option value="3">3 Months</option>
                        <option value="4">4 Months</option>
                        <option value="5">5 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                        <option value="24">2 Years</option>
                        <option value="36">3 Years</option>
                        <option value="48">4 Years</option>
                        <option value="60">5 Years</option>
                      </select>
                    </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select value={formData.property_type} onChange={(e) => setFormData({...formData, property_type: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option value="">Select Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="House">House</option>
                      <option value="Studio">Studio</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <select value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option value="">Select</option>
                      <option value="1">1 Bed</option>
                      <option value="2">2 Beds</option>
                      <option value="3">3 Beds</option>
                      <option value="4">4 Beds</option>
                      <option value="5">5 Beds</option>
                      <option value="6">6+ Beds</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <select value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option value="">Select</option>
                      <option value="1">1 Bath</option>
                      <option value="2">2 Baths</option>
                      <option value="3">3 Baths</option>
                      <option value="4">4 Baths</option>
                      <option value="5">5+ Baths</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Square Meters (m²)</label><input type="number" value={formData.square_feet} onChange={(e) => setFormData({...formData, square_feet: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"><option value="available">Available</option><option value="inactive">Inactive</option></select></div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-xs text-gray-500 mb-2">Supports HTML formatting</p>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setFormData({...formData, description: e.currentTarget.innerHTML})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[120px] prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.description }}
                />
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
                <p className="text-sm text-gray-500 mb-4">Select all payment methods available for this property</p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => {
                        const ids = [...formData.payment_method_ids];
                        const index = ids.indexOf(pm.id);
                        if (index > -1) {
                          ids.splice(index, 1);
                        } else {
                          ids.push(pm.id);
                        }
                        setFormData({ ...formData, payment_method_ids: ids });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.payment_method_ids.includes(pm.id)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pm.name}
                    </button>
                  ))}
                </div>
                {paymentMethods.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No payment methods found. <Link to="/admin/payment-methods" className="text-primary hover:underline">Create one</Link>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map(amenity => (
                    <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.amenities.includes(amenity) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {formData.amenities.includes(amenity) && <FiCheck size={12} className="inline mr-1" />}
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Images - Direct Upload */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Images</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary transition-colors">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">< Loader /> Uploading...</div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 mx-auto">
                      <FiUpload className="text-gray-400 text-3xl" />
                      <span className="text-primary font-medium">Click to upload images</span>
                      <span className="text-gray-500 text-sm">or drag and drop (PNG, JPG)</span>
                    </button>
                  )}
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1.5 bg-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editProperty ? 'Update Property' : 'Add Property'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
