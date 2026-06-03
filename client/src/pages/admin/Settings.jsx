import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const AdminSettings = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setAdminEmail(res.data.user?.email || '');
      setEmailForm(prev => ({ ...prev, newEmail: res.data.user?.email || '' }));
    }).catch(() => {});
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm({ ...emailForm, [name]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error changing password. Current password may be incorrect.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailSaving(true);
    setEmailMessage({ type: '', text: '' });
    try {
      const res = await api.put('/auth/change-email', {
        email: emailForm.newEmail,
        password: emailForm.password,
      });
      setEmailMessage({ type: 'success', text: 'Email changed successfully!' });
      setAdminEmail(emailForm.newEmail);
      setEmailForm(prev => ({ ...prev, password: '' }));
    } catch (error) {
      setEmailMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error changing email.'
      });
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
          <FiMail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="heading-section mb-0">Admin Email</h1>
          <p className="text-sm text-gray-500">Current: <span className="font-medium text-gray-800">{adminEmail}</span></p>
        </div>
      </motion.div>

      {emailMessage.text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border flex items-center gap-2 ${
            emailMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-600'
          }`}
        >
          {emailMessage.type === 'error' ? (
            <FiAlertCircle className="w-5 h-5" />
          ) : (
            <FiCheckCircle className="w-5 h-5" />
          )}
          {emailMessage.text}
        </motion.div>
      )}

      <form onSubmit={handleEmailSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium overflow-hidden max-w-xl"
        >
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">New Email Address</label>
              <input
                type="email"
                name="newEmail"
                value={emailForm.newEmail}
                onChange={handleEmailChange}
                className="input-premium w-full"
                placeholder="Enter new admin email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Confirm with Password</label>
              <input
                type="password"
                name="password"
                value={emailForm.password}
                onChange={handleEmailChange}
                className="input-premium w-full"
                placeholder="Enter your current password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={emailSaving}
              className="btn-primary flex items-center gap-2 px-8 py-3"
            >
              {emailSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Update Email
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
          <FiLock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="heading-section mb-0">Change Password</h1>
          <p className="text-sm text-gray-500">Update your admin password</p>
        </div>
      </motion.div>

      {passwordMessage.text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border flex items-center gap-2 ${
            passwordMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-600'
          }`}
        >
          {passwordMessage.type === 'error' ? (
            <FiAlertCircle className="w-5 h-5" />
          ) : (
            <FiCheckCircle className="w-5 h-5" />
          )}
          {passwordMessage.text}
        </motion.div>
      )}

      <form onSubmit={handlePasswordSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium overflow-hidden max-w-xl"
        >
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="input-premium w-full"
                placeholder="Enter current password"
                autoComplete="current-password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="input-premium w-full"
                placeholder="Enter new password"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="input-premium w-full"
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="btn-primary flex items-center gap-2 px-8 py-3"
            >
              {passwordSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default AdminSettings;