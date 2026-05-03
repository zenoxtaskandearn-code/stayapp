import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Terms = () => {
  const [agreed, setAgreed] = useState(false);

  const sections = [
    {
      title: 'Introduction',
      content: 'These Terms and Conditions govern the booking of properties through Blueground. By making a reservation, you agree to the following terms.',
    },
    {
      title: 'Reservation and Payment',
      content: [
        'A booking is confirmed only upon receipt of full payment, as specified at the time of booking.',
        'All payments must be made via the payment methods provided by Blueground.',
        'Failure to make the required payment(s) on time may result in the cancellation of your booking.',
        'Our agent will be available to show the property, sign the contract, and hand over the keys only after the payment is processed by our bank.',
      ],
      highlighted: [3],
    },
    {
      title: 'Cancellations and Refunds',
      content: [
        'Cancellations made by the guest before the check-in date are eligible for a full refund.',
        'In the event of force majeure (e.g., natural disasters, pandemics), bookings may be cancelled with a full refund or rescheduled based on availability.',
        'Property Viewing Refund Policy: If, during the property visit, you find the property unsatisfactory or decide not to proceed with the rental for any reason, the rental contract will not be signed, and you will be entitled to an immediate refund of the payment made. No further obligations will arise from the cancelled booking.',
        'The full security deposit will be returned at the end of the rental period, provided that the property is handed back in good condition and shows no signs of damage, deterioration, or missing items compared to its original state at the start of the tenancy. In the event that any damages are identified, the cost of repairs will be deducted from the deposit, and any remaining balance will be returned to the tenant.',
      ],
      highlighted: [0, 1, 2, 3],
    },
    {
      title: 'Check-in and Check-out',
      content: [
        'Check-in is flexible and can be made at any time on the day of arrival. Check-out must be completed by 12:00 PM on the day of departure, unless otherwise agreed with the Landlord.',
        'Early check-in or late check-out can be arranged with prior notice and no additional fees will be charged.',
      ],
    },
    {
      title: 'Very Important',
      content: ['The rental contract can be extended under a private arrangement after the Blueground reservation expires. A private arrangement means you can rent the property directly from the Landlord without intermediaries. To do this, you must contact the Landlord and negotiate the terms.'],
      isAlert: true,
    },
    {
      title: 'Property Use',
      content: [
        'The property is to be used solely for residential purposes.',
        'No parties, events, or illegal activities are permitted on the premises.',
        'Guests are responsible for any damage to the property during their stay and will be charged accordingly.',
      ],
    },
    {
      title: 'Changes to the Booking',
      content: [
        'Any request to amend a booking must be submitted in writing, and we will do our best to accommodate such requests, subject to availability.',
        'Any changes to the booking, including changes in dates or the number of guests, are free. However, additional fees may apply for other types of changes such as extending the stay or requesting premium services.',
      ],
    },
    {
      title: 'Property Inspection',
      content: [
        'Guests are responsible for inspecting the property upon check-in.',
        'Any issues or damages found upon check-in should be reported to the Landlord or agent immediately to avoid potential charges upon check-out.',
      ],
    },
    {
      title: 'Liability',
      content: [
        'Blueground and the Landlord shall not be held liable for any accidents, injuries, or loss of personal belongings during the stay.',
        'Guests are responsible for ensuring their safety and security during their stay.',
      ],
    },
    {
      title: 'Termination of Booking',
      content: [
        'We reserve the right to terminate a booking at any time if the guest violates these Terms and Conditions, engages in illegal activities, or causes disturbances.',
        'In such cases, no refund will be provided, and additional fees may apply for any damages caused.',
      ],
    },
    {
      title: 'Governing Law',
      content: ['These Terms and Conditions are governed and construed under the laws of the country where the property is located, and any disputes arising shall be subject to the jurisdiction of the courts in that region.'],
    },
    {
      title: 'Data Privacy',
      content: [
        'All personal data provided for the booking will be treated under our Privacy Policy.',
        'We will not share your information with third parties unless required by law or necessary to facilitate your Blueground reservation.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-blue-400 py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Blueground Rental Terms and Conditions</h1>
            <p className="text-white/80 max-w-xl mx-auto">
              Please read our terms and conditions carefully before making a booking.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl shadow-sm mb-6 overflow-hidden ${
                section.isAlert ? 'border-l-4 border-yellow-400' : ''
              }`}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiFileText className="text-primary" />
                  {section.title}
                </h2>
                
                {Array.isArray(section.content) ? (
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li 
                        key={i} 
                        className={`flex items-start gap-2 ${
                          section.highlighted?.includes(i) ? 'text-primary font-medium' : 'text-gray-600'
                        } ${
                          section.isAlert ? 'text-yellow-700' : ''
                        }`}
                      >
                        {section.highlighted?.includes(i) || section.isAlert ? (
                          <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                        ) : (
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        )}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">{section.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          <div className="mt-8 p-6 bg-gray-100 rounded-2xl">
            <p className="text-gray-600 text-sm">
              By proceeding with a booking, you acknowledge that you have read and agree to these Terms and Conditions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;