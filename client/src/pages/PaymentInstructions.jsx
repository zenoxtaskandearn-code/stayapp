import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { paymentMethodService } from '../services/paymentMethodService';
import Loader from '../components/Loader';

const PaymentInstructions = () => {
  const { methodId } = useParams();
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethod = async () => {
      try {
        const res = await paymentMethodService.getById(methodId);
        setMethod(res.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMethod();
  }, [methodId]);

  if (loading) return <Loader />;
  if (!method) return <div className="p-8 text-center">Payment method not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-blue-400 py-12 md:py-16">
        <div className="container-custom">
          <Link to="/my-bookings" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <FiArrowLeft /> Back to My Bookings
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiCreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{method.name}</h1>
              <p className="text-white/80">Payment Instructions</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          {method.description && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div dangerouslySetInnerHTML={{ __html: method.description }} className="prose max-w-none" />
            </div>
          )}

          {method.instructions && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div dangerouslySetInnerHTML={{ __html: method.instructions }} className="prose max-w-none" />
            </div>
          )}

          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              <span className="text-green-800 font-medium">Payment will be verified within 12-24 hours</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/my-bookings" className="text-primary hover:underline">
              View My Bookings
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentInstructions;