import { motion } from 'framer-motion';
import { FaSearch, FaCalendarCheck, FaHome, FaMoneyBillWave } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: FaSearch,
      title: 'Search Properties',
      description: 'Browse through our extensive list of rental properties in your preferred location.',
    },
    {
      icon: FaCalendarCheck,
      title: 'Book Your Stay',
      description: 'Select your move-in date, duration, and complete the booking process.',
    },
    {
      icon: FaMoneyBillWave,
      title: 'Make Payment',
      description: 'Securely transfer the payment and upload the receipt for verification.',
    },
    {
      icon: FaHome,
      title: 'Move In',
      description: 'Once verified, you\'re all set to move into your new home!',
    },
  ];

  return (
    <div className="section-padding">
      <div className="container-custom">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-section text-center mb-12"
        >
          How It Works
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-premium p-6 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
