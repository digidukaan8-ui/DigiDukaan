export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-4 pb-20 pt-40 sm:px-6 md:px-16 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-sky-600">
          Privacy Policy
        </h1>

        <section className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          <p>
            At DigiDukaan, we respect your privacy and are committed to protecting your personal data.
            This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our platform.
          </p>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Personal data like name, phone number, and email address during registration.</li>
              <li>Store details, products, and order data.</li>
              <li>Payment details through secure third-party payment processors.</li>
              <li>Device and usage data to improve platform performance.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To create and manage your seller/buyer account.</li>
              <li>To process transactions and deliver products.</li>
              <li>To improve platform functionality and customer support.</li>
              <li>To comply with legal obligations and prevent fraud.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">3. Sharing of Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>We do not sell or rent your data to any third parties.</li>
              <li>We only share data with service providers who help us operate the platform (e.g., payment gateways).</li>
              <li>We may disclose data to authorities if required by law or to protect rights and safety.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information.
              However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">5. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You can access or update your data in the account settings.</li>
              <li>You can request deletion of your account and associated data by contacting our support.</li>
              <li>You can opt out of non-essential communication at any time.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">7. Policy Updates</h2>
            <p>
              We may update this policy occasionally. Any changes will be posted on this page with a revised "Last updated" date.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">8. Contact Us</h2>
            <p>
              For any questions regarding this Privacy Policy, please contact us at <a href="mailto:digidukaan@gmail.com" className="text-sky-500 hover:underline">digidukaan@gmail.com</a>.
            </p>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400">
            Last updated: August 1, 2025
          </p>
        </section>
      </div>
    </div>
  );
}