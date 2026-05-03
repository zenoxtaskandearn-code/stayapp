import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-blue-400 py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="heading-section text-white mb-4">About The Blueground</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              We're reinventing the way people live, offering apartments available where, when, and on the terms they want.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We're reinventing the way people live, offering apartments available where, when, and on the terms they want.
              Our expertly designed, fully furnished homes provide a launchpad to live globally, work remotely, and experience new adventures — 
              whether for a month, a year, or longer.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Offering</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              With our versatile portfolio of living solutions, Blueground can accommodate a wide range of guests' needs around the world.
              Blueground operates the largest curated network of furnished rentals in the world, designed for individuals and corporate clients 
              seeking stays of 30+ days.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Leveraging the benefits of our proprietary technology, quality product, and geo-local operational excellence,
              we have made significant strides to innovate the category through a series of strategic acquisitions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Move-in-Ready Homes</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We offer 20,000+ premium apartments in 68 cities globally, each featuring the signature Blueground quality, décor, and guest experience.
              Additionally, our extensive Partner Network provides access to an additional 18,000+ homes from vetted, third-party furnished apartment providers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Furnished Housing On-Demand</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Enjoy fast and highly customizable sourcing of flexible rentals across 20,000+ U.S. cities, including both urban and non-urban locations.
              Our solutions are ideally suited for nomadic essential workers and corporate teams on short- or long-term projects.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose The Blueground?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Premium furnished apartments',
                'Flexible lease terms (30+ days)',
                'Fully equipped homes',
                'Global presence in 68+ cities',
                '24/7 customer support',
                'Seamless booking experience',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;