import React from "react";

export default function AboutPage() {
  const features = [
    "Create your store in under 5 minutes.",
    "Add unlimited products both new and used.",
    "Customize delivery zones and areas.",
    "Nearby buyers only see your products.",
    "Get paid instantly via online payment.",
    "Withdraw money anytime from your wallet.",
    "Secure and trusted digital platform.",
    "Built for Indian small businesses.",
    "User-friendly mobile-first interface.",
    "No app installation required by customers.",
    "Sell groceries, fashion, electronics, anything.",
    "Supports multilingual product entries.",
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-sky-100 to-white text-gray-800 min-h-screen">
      <div className="min-h-screen px-4 py-10 sm:px-8 lg:px-16 max-w-7xl mx-auto space-y-20">
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-600">
            About <span className="text-blue-900">DigiDukaan</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            DigiDukaan is not just an app -- it's a revolution for India's small and local
            sellers to go digital, build trust, and grow easily without technical knowledge.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sky-700 border-l-4 border-sky-500 pl-3">
            What is DigiDukaan?
          </h2>
          <p className="text-base sm:text-lg text-gray-700">
            DigiDukaan allows anyone to set up an online store in minutes -- without coding or
            complex setup. It's made for local shopkeepers, resellers, and entrepreneurs across
            India.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sky-700 border-l-4 border-sky-500 pl-3">
            Features You'll Love
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl border border-blue-100 text-sm sm:text-base transition-all duration-300 ease-in-out"
              >
                <p className="text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sky-700 border-l-4 border-sky-500 pl-3">
            How It Works
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-base sm:text-lg">
            <li>Register and create your store in minutes.</li>
            <li>List your products with photos and price.</li>
            <li>Define your delivery zones and buyer reach.</li>
            <li>Customers pay securely via UPI/online payment.</li>
            <li>Amount is instantly credited to your wallet.</li>
            <li>Withdraw anytime to your bank -- no lock-in.</li>
            <li>Only pay a small commission per order.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sky-700 border-l-4 border-sky-500 pl-3">
            Why DigiDukaan?
          </h2>
          <p className="text-base text-gray-700">
            Over 70% of India's small sellers are still offline. DigiDukaan makes it easy for
            anyone to go online, sell locally, and grow at their own pace -- without needing
            marketing or tech skills.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 text-base">
            <li>No need for expensive website builders.</li>
            <li>Local buyers find your store through smart filters.</li>
            <li>Zero app download required for buyers.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sky-700 border-l-4 border-sky-500 pl-3">
            How Earnings Work
          </h2>
          <p className="text-base text-gray-700">
            We support 100% online payments only. After each order, your wallet gets credited
            (minus a small commission). You can withdraw instantly -- no waiting, no hold.
          </p>
        </section>

        <section className="text-center mt-8">
          <p className="text-lg font-medium text-blue-800">
            Ready to start your online store? DigiDukaan is free, fast, and made for you.
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white mt-20">
        <div className="overflow-hidden -mb-1">
          <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="w-full h-6">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#00c6ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0072ff', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path d="M0,10 C30,20 60,0 120,10 L120,30 L0,30 Z" fill="url(#gradient)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-semibold border-b border-sky-400 pb-2 mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><i className="fas fa-envelope mr-2 text-sky-400"></i> support@marketplace.com</li>
              <li><i className="fas fa-phone mr-2 text-sky-400"></i> +91-12345-67890</li>
              <li><i className="fas fa-map-marker-alt mr-2 text-sky-400"></i> Mumbai, India</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold border-b border-sky-400 pb-2 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/about" className="hover:text-sky-400 transition">About Us</a></li>
              <li><a href="/contact" className="hover:text-sky-400 transition">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-sky-400 transition">FAQs</a></li>
              <li><a href="/terms" className="hover:text-sky-400 transition">Terms & Conditions</a></li>
              <li><a href="/privacy" className="hover:text-sky-400 transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold border-b border-sky-400 pb-2 mb-4">Follow Us</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href="#" className="bg-sky-400 hover:bg-white hover:text-blue-700 text-black px-3 py-1 rounded transition font-medium">Facebook</a>
              <a href="#" className="bg-sky-400 hover:bg-white hover:text-blue-700 text-black px-3 py-1 rounded transition font-medium">Instagram</a>
              <a href="#" className="bg-sky-400 hover:bg-white hover:text-blue-700 text-black px-3 py-1 rounded transition font-medium">Twitter</a>
              <a href="#" className="bg-sky-400 hover:bg-white hover:text-blue-700 text-black px-3 py-1 rounded transition font-medium">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="bg-gray-950 text-center text-sm py-3 border-t border-white/10">
          &copy; 2025 <strong>Marketplace</strong>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}