import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight } from 'react-icons/fa';
import api from '../services/api';
import { useAuthStore } from '../store/useStore';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [userEmail, setUserEmail] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
 
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.user, res.data.token);
      
      // Check for pending booking and redirect back
      const returnUrl = localStorage.getItem('returnToBooking');
      const pendingBooking = localStorage.getItem('pendingBooking');
      
      if (returnUrl) {
        localStorage.removeItem('returnToBooking');
        localStorage.removeItem('pendingBooking');
        navigate(returnUrl);
      } else if (pendingBooking) {
        localStorage.removeItem('pendingBooking');
        const pb = JSON.parse(pendingBooking);
        navigate(`/booking/${pb.propertyId}?moveIn=${pb.moveIn}&months=${pb.months}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-email', { email: userEmail, otp });
      login(res.data.user, res.data.token);
      
      // Check for pending booking and redirect back
      const returnUrl = localStorage.getItem('returnToBooking');
      const pendingBooking = localStorage.getItem('pendingBooking');
      
      if (returnUrl) {
        localStorage.removeItem('returnToBooking');
        localStorage.removeItem('pendingBooking');
        navigate(returnUrl);
      } else if (pendingBooking) {
        localStorage.removeItem('pendingBooking');
        const pb = JSON.parse(pendingBooking);
        navigate(`/booking/${pb.propertyId}?moveIn=${pb.moveIn}&months=${pb.months}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email: userEmail });
      alert('OTP sent again!');
    } catch (err) {
      alert('Failed to resend OTP');
    }
  };

  if (verificationStep) {
    return (
      <div className="section-padding min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 max-w-md w-full"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>
          <p className="text-gray-600 text-center mb-6">
            We've sent a verification code to <strong>{userEmail}</strong>
          </p>
          
          {error && <div className="bg-primary-light text-primary p-3 rounded-lg mb-4">{error}</div>}
          
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                className="input-premium w-full text-center text-2xl tracking-wided"
                maxLength={6}
                required
              />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" onClick={handleResend} className="text-primary text-sm">
              Resend OTP
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-gray-500 text-center mb-6">Join The Blueground today</p>
        
        {error && <div className="bg-primary-light text-primary p-3 rounded-lg mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="input-premium w-full pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="input-premium w-full pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1234567890"
                className="input-premium w-full pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="input-premium w-full pl-11"
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating Account...' : 'Create Account'} <FaArrowRight className="ml-2" />
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;