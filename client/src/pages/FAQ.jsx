import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    question: 'When can I move into the apartment I want?',
    answer: "Our website shows the real-time availability for all apartments, and you can see the earliest possible move-in date for a given property on both the market page with all listings and the property detail page. When you view a property's availability calendar on its detail page, you may see that you can move in on any date within a year of the availability date, or you may see that there are specific periods during which the apartment is unavailable because other guests have made bookings. In general, you can save money by booking a move-in closer to an apartment's availability date. Please note the year of the availability date, as some apartments' earliest availability date will be in the next calendar year. If you can't find your ideal apartment, please contact us.",
  },
  {
    question: 'What is included in the price?',
    answer: "The cost of a Blueground stay includes the rent and utilities. It may also include cleaning, restocking (e.g., supplies, linens, towels), insurance, and where required by local laws, taxes and/or occupancy fees. It's important that when browsing apartments you've selected your desired dates and indicated any flexibility on move-in/move-out, as rental costs vary based on apartment, seasonal demand, and duration of stay. If you've not selected dates, it's possible that the price you see isn't representative of what it would be for your desired dates. To see which dates offer the lowest possible rent at current demand levels, go to your property of interest and view the info icon above the pricing summary.",
  },
  {
    question: 'Are the photos of the apartment real?',
    answer: "Yes, all photos are of the actual apartment unless indicated otherwise. For newer or recently redecorated apartments, we may show model photos or photos of a similar apartment, and we'll always highlight this with a note reading, for example, \"Sample photos of d cor & layout.\" If possible, you can view the photos of other apartments in same building as your desired apartment to get a sense of what it will look like.",
  },
  {
    question: 'Can I arrange a viewing?',
    answer: "For Blueground properties, we only offer in-person viewings if the apartment you're interested in is vacant, you're booking a stay for 6+ months, the building's rules allow it, and we have the staffing capacity to guide a viewing. We encourage you to view the 3D Tour available on some apartments' detail pages; and unless stated otherwise, an apartment's photos will always show you exactly how it looks. For partner properties, viewings are not offered.",
  },
  {
    question: 'Is the price negotiable?',
    answer: "No, the rental and other costs associated with a booking aren t negotiable. We offer a wide variety of homes in order to have options for as many prospective guests as possible. We also offer programs with discounted rates for students and guests who stay for a year or longer. If you re having trouble finding an apartment that s right for you, or believe you re eligible for savings via a discount program, please contact us, as we may be able to direct you to a suitable option.",
  },
  {
    question: 'Are pets allowed?',
    answer: "Most of our apartments are pet friendly, though restrictions do apply based on landlord limitations. Some apartments allow only specific pet breeds and/or sizes, and most buildings require documentation for your pets (e.g., vaccination records) that we'll ask you for before move-in. To find pet-friendly apartments, use the \"Pets allowed\" filter while browsing. You'll also see whether an apartment allows pets on the apartment detail page; and depending on the apartment, you may be able to add and pay for your pet(s) during the booking process.",
  },
  {
    question: 'Are TV and internet included?',
    answer: "Yes, TV and internet service are included as utilities.",
  },
  {
    question: 'How do cleanings work?',
    answer: "We thoroughly clean all apartments between reservations, including cleaning all surfaces, and restocking all supplies, linens, and towels. If you'd like additional cleaning and restocking services during your stay, you can request and pay for them in the Blueground app.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20">
      <div className="container-custom">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-section text-center mb-12"
        >
          Frequently Asked Questions
        </motion.h1>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <FiChevronDown 
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-6 text-gray-600">{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;