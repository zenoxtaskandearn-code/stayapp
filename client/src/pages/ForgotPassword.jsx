import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(token ? 'reset' : 'email');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Password reset link sent to your email!');
      setStep('sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', { token, password });
      setMessage('Password reset successful! Please login.');
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done' || step === 'sent') {
    return (
      <div className="section-padding min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 max-w-md w-full text-center"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${step === 'done' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            <FaKey size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">{step === 'done' ? 'Success!' : 'Email Sent!'}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          {step === 'done' && (
            <button onClick={() => navigate('/login')} className="btn-primary">
              Go to Login
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="section-padding min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 max-w-md w-full"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
          
          {error && <div className="bg-primary-light text-primary p-3 rounded-lg mb-4">{error}</div>}
          
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-premium w-full"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading || !password} className="btn-primary w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
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
        <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-center mb-6">Enter your email to reset password</p>
        
        {error && <div className="bg-primary-light text-primary p-3 rounded-lg mb-4">{error}</div>}
        
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="input-premium w-full pl-11"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;