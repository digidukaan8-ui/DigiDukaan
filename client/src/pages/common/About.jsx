import { motion } from 'framer-motion';
import {
  Store,
  Sparkles,
  Wallet,
  ShieldCheck,
  Globe,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export default function About() {
  return (
    <div className="min-h-screen w-full px-6 pb-20 pt-40 sm:px-10 md:px-20 bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto space-y-24">

        <motion.section
          className="text-center space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-600 dark:text-sky-400 drop-shadow-md">
            About DigiDukaan
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300 leading-relaxed">
            DigiDukaan isn’t just an app it’s a movement to empower India’s micro-businesses to thrive digitally. Launch your online store in minutes, serve locally, grow nationally.
          </p>
        </motion.section>

        <motion.section
          className="space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          variants={fadeUp}
        >
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Store className="text-sky-600" /> What is DigiDukaan?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            DigiDukaan is a no-code SaaS platform for sellers to build and manage online stores with ease. Designed specifically for Indian retailers it brings digital commerce to the masses.
          </p>
        </motion.section>

        <motion.section
          className="space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={2}
          variants={fadeUp}
        >
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-600" /> Features You’ll Love
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              'Create your store in under 5 minutes.',
              'Unlimited product listings.',
              'Local delivery zone control.',
              'Nearby buyers only.',
              'Instant online payments.',
              'Withdraw anytime.',
              'Safe, secure, verified.',
              'Multilingual support.',
              'Mobile-first UI.',
              'No app required for buyers.',
              'Sell anything.',
              'Supports resale, home businesses.',
            ].map((item, i) => (
              <motion.div
                key={i}
                className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 text-sm sm:text-base text-gray-800 dark:text-gray-300"
                custom={i * 0.05}
                variants={fadeUp}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={3}
          variants={fadeUp}
        >
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-green-600" /> How It Works
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-base sm:text-lg text-gray-700 dark:text-gray-300">
            <li>Sign up and create your store.</li>
            <li>Add your product details and images.</li>
            <li>Define delivery zones by pin code or radius.</li>
            <li>Customers order & pay online securely.</li>
            <li>Funds land in your DigiDukaan wallet.</li>
            <li>Withdraw to your bank account anytime.</li>
            <li>Transparent, small commission per order.</li>
          </ol>
        </motion.section>

        <motion.section
          className="space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={4}
          variants={fadeUp}
        >
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Globe className="text-indigo-600" /> Why DigiDukaan?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            Millions of Indian sellers still use offline methods. DigiDukaan brings the future to their doorstep no ads, no coding, no tech barriers.
          </p>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-700 dark:text-gray-300">
            <li>Reach local buyers with zero ad cost.</li>
            <li>Build trust with a clean, responsive storefront.</li>
            <li>Scale at your own pace from lane to city.</li>
          </ul>
        </motion.section>

        <motion.section
          className="space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={5}
          variants={fadeUp}
        >
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Wallet className="text-yellow-600" /> How Earnings Work
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            We only support online payments to reduce fraud and increase seller safety. Earnings are instantly credited to your wallet after each order.
          </p>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            Withdraw to your bank account anytime. No hidden fees just a small success commission.
          </p>
        </motion.section>

        <motion.section
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mt-6">
            Start your DigiDukaan journey today it’s fast, free, and made for you.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
