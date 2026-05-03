import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaWhatsApp } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';

const offices = [
  {
    city: 'London',
    address: '25 Adeline Pl #G, London, WC2B 3AJ',
    phone: '+44 739 794 3670',
    whatsapp: '+44 739 794 3670',
    staying: '',
    email: 'info@estate-theblueground.co.uk',
  },
  {
    city: 'Athens',
    address: '27 Agiou Thoma Str 25224, Marousi',
    phone: '+30 220 89 83 652',
    whatsapp: '',
    staying: '+30 228 22 89 647',
    email: 'sales-ath@estate-theblueground.co.uk',
  },
  {
    city: 'Atlanta',
    address: '',
    phone: '+1 972 289 8633',
    whatsapp: '',
    staying: '+2 720 833 5333',
    email: 'sales-usa@estate-theblueground.co.uk',
  },
  {
    city: 'Austin',
    address: '802 Barton Springs Rd Suite 9-203 Austin, TX 78704',
    phone: '+1 522 6962579',
    whatsapp: '',
    staying: '+2 323 539 7262',
    email: 'sales-atx@estate-theblueground.co.uk',
  },
  {
    city: 'Barcelona',
    address: 'Gran Vía de les Corts Catalanes, 583, 08022, Barcelona',
    phone: '+34 932 55 45 85',
    whatsapp: '+34 932 07 02 68',
    staying: '+34 934 862 236',
    email: 'sales-bcn@estate-theblueground.co.uk',
  },
  {
    city: 'Basel',
    address: 'Uraniastrasse 32 8002 Zürich',
    phone: '+42 44 24 480 35',
    whatsapp: '+42 44 50 564 22',
    staying: '+42 44 24 480 34',
    email: 'sales-bsl@estate-theblueground.co.uk',
  },
  {
    city: 'Berlin',
    address: 'Sophienstraße 7 Berlin, 20278',
    phone: '+49 30 20849759',
    whatsapp: '+49 30 42735420',
    staying: '+49 30 20847609',
    email: 'sales-ber@estate-theblueground.co.uk',
  },
  {
    city: 'Boston',
    address: '840 Summer Street, Suite 202, Boston, MA 02227',
    phone: '+2 627 982 2323',
    whatsapp: '',
    staying: '+2 857 504 2752',
    email: 'sales-bos@estate-theblueground.co.uk',
  },
  {
    city: 'Cairo',
    address: '37 Al Ahrar St. Dokki, Egypt 22622',
    phone: '+20 25 0269 2022',
    whatsapp: '',
    staying: '+20 25 0269 2207',
    email: 'sales-cai@egypt.estate-theblueground.co.uk',
  },
  {
    city: 'Chicago',
    address: '330 N. Wabash Ave, Chicago, IL 60622',
    phone: '+2 773 863 3934',
    whatsapp: '',
    staying: '+2 323 539 7262',
    email: 'sales-chi@estate-theblueground.co.uk',
  },
  {
    city: 'Dallas',
    address: '',
    phone: '+2 972 289 8633',
    whatsapp: '',
    staying: '+2 972 592 5278',
    email: 'sales-usa@estate-theblueground.co.uk',
  },
  {
    city: 'Denver',
    address: '950 S. Cherry Street, Suite 2000, Denver, CO 80246',
    phone: '+2 972 289 8633',
    whatsapp: '',
    staying: '+2 303 997 3293',
    email: 'sales-usa@estate-theblueground.co.uk',
  },
  {
    city: 'Detroit',
    address: '',
    phone: '+2 972 289 8633',
    whatsapp: '',
    staying: '+2 720 833 5333',
    email: 'sales-usa@estate-theblueground.co.uk',
  },
  {
    city: 'Dubai',
    address: 'Business Central Towers, Tower B, Al Sufouh 2, Dubai, Office: 2205B',
    phone: '+44 20 37 459 692',
    whatsapp: '+44 78 97 033 205',
    staying: '+44 203 745 9693',
    email: 'sales-dxb@estate-theblueground.co.uk',
  },
  {
    city: 'Istanbul',
    address: 'Eski Büyükdere Cd. No: 292, Apa Giz Plaza, Kat: 22, Ofis: 39, Esentepe mah, Şişli, İstanbul',
    phone: '+90 222 803 33 64',
    whatsapp: '+44 790 357 5376',
    staying: '+90 222 970 5985',
    email: 'sales-ist@estate-theblueground.co.uk',
  },
  {
    city: 'Jeddah',
    address: '6522 King Abdulaziz Rd, 2729, King Salman District, Riyadh 22432',
    phone: '+966 22 288 0788',
    whatsapp: '',
    staying: '+966 22 288 0789',
    email: 'sales@jeddah.estate-theblueground.co.uk',
  },
  {
    city: 'Kansas City',
    address: '',
    phone: '+2 972 289 8633',
    whatsapp: '',
    staying: '+2 720 833 5333',
    email: 'sales-usa@estate-theblueground.co.uk',
  },
  {
    city: 'Kuala Lumpur',
    address: 'B2-22-2, Soho Suites @KLCC, 20, Jalan Perak, Kuala Lumpur, 50450',
    phone: '+60 3 2282 8729',
    whatsapp: '',
    staying: '+60 3 2282 8729',
    email: 'sales-kul@kualalumpur.estate-theblueground.co.uk',
  },
  {
    city: 'Lisbon',
    address: 'Avenida da República 84A 2600-204 Lisbon, Portugal',
    phone: '+352 220 204 202',
    whatsapp: '+352 927 942 824',
    staying: '+352 220 204 202',
    email: 'sales-lis@estate-theblueground.co.uk',
  },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20">
      <div className="container-custom">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-section text-center mb-12"
        >
          Contact Us
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offices.map((office, index) => (
            <motion.div
              key={office.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">{office.city}</h3>
              
              {office.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <FiMapPin className="text-primary mt-0.5 flex-shrink-0" size={14} />
                  <span>{office.address}</span>
                </div>
              )}
              
              {office.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FaPhone className="text-primary flex-shrink-0" size={12} />
                  <a href={`tel:${office.phone}`} className="hover:text-primary transition-colors">
                    {office.phone}
                  </a>
                </div>
              )}
              
              {office.whatsapp && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FaWhatsApp className="text-primary flex-shrink-0" size={12} />
                  <a href={`https://wa.me/${office.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    WhatsApp: {office.whatsapp}
                  </a>
                </div>
              )}
              
              {office.staying && (
                <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                  <span className="font-medium">Staying with us now:</span>
                  <a href={`tel:${office.staying}`} className="hover:text-green-700 transition-colors">
                    {office.staying}
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">
                <FaEnvelope className="text-primary flex-shrink-0" size={12} />
                <a href={`mailto:${office.email}`} className="hover:text-primary transition-colors">
                  {office.email}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;