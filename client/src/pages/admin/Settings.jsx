import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiGlobe, FiSave } from 'react-icons/fi';
import api from '../../services/api';
import Loader from '../../components/Loader';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    website_name: '',
    theme_color: '#4979a4',
    footer_text: '',
    contact_email: '',
    contact_phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/settings', settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
          <FiSettings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="heading-section mb-0">Settings</h1>
          <p className="text-sm text-gray-500">Manage your website and payment settings</p>
        </div>
      </motion.div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border ${
            message.type === 'error'
              ? 'bg-primary-light border-primary/20 text-primary'
              : 'bg-green-50 border-green-200 text-green-600'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary/10 to-blue-100 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiGlobe className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800">General Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Website Name</label>
                <input
                  type="text"
                  name="website_name"
                  value={settings.website_name || ''}
                  onChange={handleChange}
                  className="input-premium w-full"
                  placeholder="StayFinder"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={settings.contact_email || ''}
                    onChange={handleChange}
                    className="input-premium w-full"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={settings.contact_phone || ''}
                    onChange={handleChange}
                    className="input-premium w-full"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Footer Text</label>
                <textarea
                  name="footer_text"
                  value={settings.footer_text || ''}
                  onChange={handleChange}
                  rows={3}
                  className="input-premium w-full resize-none"
                  placeholder="© 2026 StayFinder. All rights reserved."
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Methods Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary/10 to-blue-100 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiSave className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800">Manage Payments</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                To manage payment methods (Bank Transfer, Remitly, Cash, etc.) for your properties, please go to the 
                <a href="/admin/payment-methods" className="text-primary font-medium hover:underline mx-1">Payment Methods</a>
                section in the sidebar.
              </p>
              <p className="text-sm text-gray-500">
                You can assign different payment methods to each property by editing the property and selecting the available options.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex justify-end"
        >
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-8 py-3"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default AdminSettings;