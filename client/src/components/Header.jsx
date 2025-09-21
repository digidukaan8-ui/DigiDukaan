import { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import logo from '../assets/logo.webp'
import useThemeStore from '../store/theme';
import useAuthStore from '../store/auth';
import { motion } from 'framer-motion'

export default function Header() {
  const { isDark, toggleMode } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  const links = () => {
    if (isAuthenticated && user.role === 'buyer') {
      return [
        { to: '/', label: 'Home' },
        { to: '/buyer/dashboard', label: 'Dashboard' },
        { to: '/buyer/cart', label: 'Cart' },
        { to: '/buyer/notification', label: 'Notification' },
        { to: '/buyer/profile', label: 'Profile' },
        { to: '/logout', label: 'Logout' },
      ];
    } else if (isAuthenticated && user.role === 'seller') {
      return [
        { to: '/seller/store', label: 'Store' },
        { to: '/order', label: 'Orders' },
        { to: '/notification', label: 'Notification' },
        { to: '/profile', label: 'Profile' },
        { to: '/logout', label: 'Logout' },
      ];
    } else {
      return [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ];
    }
  }


  return (
    <header className="bg-white dark:bg-neutral-900 w-full shadow-md fixed top-0 z-50 transition-all duration-300">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
        className="w-full mx-auto px-5 md:px-10 py-4 flex justify-between items-center">
        <div className='flex justify-center items-center'>
          <img src={logo} alt="DigiDukaan" className='w-10 sm:w-12 h-fit object-cover' />
        </div>

        <nav className="hidden md:flex items-center gap-10" aria-label="Main Navigation">
          {links().map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative text-lg font-medium transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-500 hover:after:w-full after:transition-all
                 ${isActive ? 'text-sky-500 after:w-full' : 'text-gray-700 dark:text-gray-300 hover:text-sky-500'}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            onClick={toggleMode}
            className="text-xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Theme"
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-5">
          <button
            onClick={toggleMode}
            className="text-2xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Theme"
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>

          <button
            onClick={toggleMenu}
            className="text-2xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Mobile Menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </motion.div>

      {menuOpen && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ willChange: "transform, opacity" }}
          className="md:hidden animate-slide-down origin-top bg-white dark:bg-neutral-900 border-t px-4 pt-3 pb-4 rounded-b-xl shadow-md">
          {links().map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block text-base font-medium py-2 transition-colors ${isActive
                  ? 'text-sky-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-sky-500'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </motion.div>
      )}
    </header>
  );
}
