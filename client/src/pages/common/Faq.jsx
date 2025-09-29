import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const faqs = [
  {
    question: 'What is DigiDukaan?',
    answer: 'DigiDukaan is an online platform for local shops and brands to sell new or second-hand products digitally.',
  },
  {
    question: 'How do I register as a shop or brand?',
    answer: 'Go to the Register page, select your role, and fill in required details like name, email, city, and product info.',
  },
  {
    question: 'Can I list second-hand products?',
    answer: 'Yes! Sellers can mark items as “used” and set pricing and condition as per their choice.',
  },
  {
    question: 'What is accommodation support in DigiDukaan?',
    answer: 'We provide extra visibility and premium listing support for bulk sellers, local stores, and verified brands.',
  },
  {
    question: 'Do I have to handle delivery myself?',
    answer: 'Yes. Sellers define their own delivery zones, and only users in that zone can see and buy your products.',
  },
  {
    question: 'How are payments processed?',
    answer: 'Buyers pay online and the amount is added to the seller’s DigiDukaan wallet. You can withdraw anytime.',
  },
  {
    question: 'Is there any listing fee?',
    answer: 'No listing fee. However, DigiDukaan charges a small commission on every successful transaction.',
  },
  {
    question: 'Can I edit or delete my product after adding?',
    answer: 'Yes. From your dashboard, you can update product info or delete it anytime.',
  },
  {
    question: 'Can I promote my store or products?',
    answer: 'Yes, featured placement and premium exposure is available for sellers with good ratings or bulk inventory.',
  },
  {
    question: 'Do I get notified on new orders?',
    answer: 'Yes, you will receive notifications and also find them listed under your orders dashboard.',
  },
  {
    question: 'How do buyers find my shop?',
    answer: 'Users select their delivery location, and all eligible sellers for that location are shown to them.',
  },
  {
    question: 'How do I withdraw money from my wallet?',
    answer: 'Go to Wallet in your dashboard and click “Withdraw”. Enter UPI/Bank details and amount to receive funds.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-800 px-4 pb-20 pt-40 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                onMouseEnter={() => setOpenIndex(index)}
                onMouseLeave={() => setOpenIndex(null)}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left"
                >
                  <span className="text-base font-medium">{item.question}</span>
                  {isOpen ? (
                    <FiChevronUp className="text-xl" />
                  ) : (
                    <FiChevronDown className="text-xl" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-sm text-gray-700 dark:text-gray-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}