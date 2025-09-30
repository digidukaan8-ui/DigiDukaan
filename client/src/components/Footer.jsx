import { NavLink } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi'

export default function Footer() {
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/faq', label: 'FAQ' },
  ]

  const resources = [
    { to: '/termsofservice', label: 'Terms of Service' },
    { to: '/privacypolicy', label: 'Privacy Policy' },
    { to: '/support', label: 'Support' },
  ]

  const socialLinks = [
    { icon: FiGithub, href: '#', label: 'GitHub' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FiInstagram, href: '#', label: 'Instagram' },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-gray-700 dark:text-gray-300 border-t-2 border-gray-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">

          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
              DigiDukaan
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Your digital storefront made simple. Run your business, sell smarter,
              and grow online all with DigiDukaan.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200"
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b-2 border-sky-500 dark:border-sky-400 pb-2 inline-block">
              Navigation
            </h3>
            <ul className="space-y-2.5 mt-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `block text-sm transition-all duration-200 hover:translate-x-1 ${isActive
                        ? 'text-sky-600 dark:text-sky-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400'
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
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b-2 border-sky-500 dark:border-sky-400 pb-2 inline-block">
              Resources
            </h3>
            <ul className="space-y-2.5 mt-4">
              {resources.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200 hover:translate-x-1"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b-2 border-sky-500 dark:border-sky-400 pb-2 inline-block">
              Contact
            </h3>
            <ul className="space-y-3 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3 group">
                <FiMail className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:digidukaan8@gmail.com" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors break-all">
                  digidukaan8@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <FiPhone className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+918000000000" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  +91 80000 00000
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <FiMapPin className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-neutral-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} DigiDukaan. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
              Made with <span className="text-red-500">❤</span> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}