import { NavLink } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border-t shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-12">

        <div>
          <h2 className="text-3xl font-extrabold text-sky-600 mb-3">DigiDukaan</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your digital storefront made simple. Run your business, sell smarter,
            and grow online — all with DigiDukaan.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Navigation</h3>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block text-sm transition-all duration-200 ${
                      isActive
                        ? 'text-sky-600 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-sky-500'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Resources</h3>
          <ul className="space-y-2">
            {['Privacy Policy', 'Terms of Service', 'Support'].map((label, i) => (
              <li key={i}>
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Contact</h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <FiMail className="text-sky-600" />
              <a href="mailto:digidukaan8@gmail.com" className="hover:text-sky-500 transition-colors">
                digidukaan8@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="text-sky-600" />
              <a href="#" className="hover:text-sky-500 transition-colors">
                +91 80000 00000
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FiMapPin className="text-sky-600" />
              <span>Mumbai, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4 pb-6 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} DigiDukaan. All rights reserved.
      </div>
    </footer>
  )
}