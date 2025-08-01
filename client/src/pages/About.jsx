export default function About() {
  return (
    <div className="min-h-screen w-full px-4 py-8 sm:px-6 md:px-12 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-sky-500">
            About DigiDukaan
          </h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            DigiDukaan is more than an app it's a movement to help India's small and local businesses grow in the digital age. Whether you own a kirana store, boutique, or run a home-based resale business, we provide you the tools to create your online shop in minutes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What is DigiDukaan?</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            DigiDukaan is a platform that helps sellers set up an online store without any coding or technical experience. It’s built for everyday sellers shopkeepers, vendors, resellers, and small brands to start selling their products locally and get paid directly through online payments.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Features You'll Love</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Create your store in under 5 minutes.',
              'Add unlimited products both new and used.',
              'Customize delivery zones and areas.',
              'Nearby buyers only see your products.',
              'Get paid instantly via online payment.',
              'Withdraw money anytime from your wallet.',
              'Secure and trusted digital platform.',
              'Built for Indian small businesses.',
              'User-friendly mobile-first interface.',
              'No app installation required by customers.',
              'Sell groceries, fashion, electronics, anything.',
              'Supports multilingual product entries.',
            ].map((item, i) => (
              <div
                key={i}
                className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Sign up and create your DigiDukaan account.</li>
            <li>Build your online store by adding product details and images.</li>
            <li>Set delivery zones so only nearby customers can buy.</li>
            <li>Buyers explore your store and place orders through a secure online payment gateway.</li>
            <li>The payment is added to your DigiDukaan wallet.</li>
            <li>You can withdraw earnings anytime directly to your bank.</li>
            <li>DigiDukaan takes a small commission per order no hidden charges.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Why DigiDukaan?</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            In India, millions of small businesses still rely on offline methods to sell. We’re changing that. DigiDukaan makes it possible for anyone to open a store, without any coding or marketing knowledge. Whether you want to grow locally or start something new, this is your platform.
          </p>
          <ul className="text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
            <li>Reach buyers around you without spending on ads.</li>
            <li>Build customer trust with easy product browsing and smooth checkout.</li>
            <li>Scale from one lane to an entire city your control, your speed.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How Earnings Work</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            DigiDukaan supports only online payments to ensure seller safety and avoid cash-on-delivery issues. After a buyer pays, the amount (after platform charges) is credited to your wallet. From there, you can withdraw it to your bank account instantly.
          </p>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Platform charges a minimal commission on each sale we grow only when you grow.
          </p>
        </section>

        <section className="text-center pt-6">
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            Start building your DigiDukaan today it’s free, simple, and built for your growth.
          </p>
        </section>
      </div>
    </div>
  );
}