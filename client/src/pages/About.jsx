import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="heading-section mb-6">About The Blueground</h1>
          <p className="text-lg text-gray-600 mb-8">
            We are dedicated to helping you find the perfect rental property. Our platform connects
            property owners with tenants, making the rental process seamless and efficient.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { number: '1000+', label: 'Properties Listed' },
              { number: '500+', label: 'Happy Tenants' },
              { number: '50+', label: 'Cities Covered' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-premium p-6"
              >
                <p className="text-3xl font-bold text-primary mb-2">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Our Locations</h2>
          <p className="text-gray-500 text-center mb-8">Find properties in prime locations worldwide</p>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.9428030668947!2d-74.00601568459473!3d40.71277597933098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a197c06b7cb%3A0x40a06c78f79e5de6!2sOne%20World%20Trade%20Center!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Blueground Locations"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
