import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiCreditCard, FiSave, FiX } from 'react-icons/fi';
import { paymentMethodService } from '../../services/paymentMethodService';
import Loader from '../../components/Loader';

const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMethod, setEditMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    is_active: true,
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await paymentMethodService.getAllAdmin();
      setMethods(res.data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Name is required');
      return;
    }

    setSaving(true);
    try {
      if (editMethod) {
        await paymentMethodService.update(editMethod.id, formData);
      } else {
        await paymentMethodService.create(formData);
      }
      setShowModal(false);
      setEditMethod(null);
      setFormData({ name: '', description: '', instructions: '', is_active: true });
      fetchMethods();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving payment method');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (method) => {
    setEditMethod(method);
    setFormData({
      name: method.name || '',
      description: method.description || '',
      instructions: method.instructions || '',
      is_active: method.is_active !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      await paymentMethodService.delete(id);
      fetchMethods();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting payment method');
    }
  };

  const openAddModal = () => {
    setEditMethod(null);
    setFormData({ name: '', description: '', instructions: '', is_active: true });
    setShowModal(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="heading-section mb-2">Payment Methods</h1>
              <p className="text-gray-500">Manage payment methods for your properties</p>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              <FiPlus size={16} /> Add Payment Method
            </button>
          </div>

          {methods.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods yet</h3>
              <p className="text-gray-500 mb-6">Add your first payment method to assign to properties.</p>
              <button 
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
              >
                <FiPlus size={16} /> Add Payment Method
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <FiCreditCard className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{method.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            method.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {method.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(method)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(method.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {method.description && (
                      <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                    )}

                    {method.instructions && (
                      <div 
                        className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: method.instructions }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {editMethod ? 'Edit' : 'Add'} Payment Method
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-premium"
                    placeholder="e.g., Bank Transfer, Cash Payment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="input-premium w-full resize-none"
                    placeholder="Brief description of this payment method"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions (HTML Allowed)
                  </label>
<textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      rows={6}
                      className="input-premium w-full"
                      placeholder="<p><b>Bank Transfer Details:</b></p><p>Account: 1234567890</p><p>Sort Code: 00-00-00</p>"
                    />
                  <p className="text-xs text-gray-500 mt-1">
                    You can use HTML tags like &lt;b&gt;, &lt;br/&gt;, &lt;a&gt; for formatting.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={16} /> {editMethod ? 'Update' : 'Create'} Method
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
