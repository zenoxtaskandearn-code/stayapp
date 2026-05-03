import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="section-padding">
      <div className="container-custom">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-section text-center mb-12"
        >
          Contact Us
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {[
                { icon: FaEnvelope, title: 'Email', info: 'info@estate-theblueground.co.uk' },
                { icon: FaPhone, title: 'Phone', info: '+44 739 794 3670' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-premium p-8 space-y-5"
          >
            <input type="text" placeholder="Your Name" className="input-premium" />
            <input type="email" placeholder="Your Email" className="input-premium" />
            <input type="text" placeholder="Subject" className="input-premium" />
            <textarea
              rows="4"
              placeholder="Your Message"
              className="input-premium resize-none"
            />
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
