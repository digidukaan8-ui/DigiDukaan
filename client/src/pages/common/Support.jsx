import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-800 px-4 pb-20 pt-40 sm:px-10 text-gray-800 dark:text-gray-100">
      <div className="max-w-5xl mx-auto space-y-14">
        <section className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-600">Need Help? We're Here!</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Whether you're facing technical issues or need guidance, our support team is always ready to assist you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Common Issues</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">
            {[
              "Order not delivered or delayed",
              "Wallet or payment not reflecting",
              "Need help setting up your digital store",
              "Unable to upload or manage products",
              "Return and refund related queries",
              "Login or account access problems",
              "Issue with GST or tax settings",
              "Technical error or bug in the app",
            ].map((issue, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition">
                {issue}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition">
              <FaEnvelope className="text-xl text-sky-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email us</p>
                <p className="font-medium text-gray-900 dark:text-white">digidukaan@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition">
              <FaPhoneAlt className="text-xl text-sky-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Call us</p>
                <p className="font-medium text-gray-900 dark:text-white">+91 80000 00000</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Looking for quick answers? Visit our{" "}
            <NavLink to="/faq" className="text-sky-500 font-medium hover:underline">
              FAQ page
            </NavLink>{" "}
            or{" "}
            <a
              href="mailto:digidukaan@gmail.com"
              className="text-sky-500 font-medium hover:underline"
            >
              send us a message
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}