import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';

export default function Header() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  return (
    <header className="bg-white dark:bg-neutral-900 shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-sky-600 tracking-tight">
          DigiDukaan
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative text-base font-medium transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-500 hover:after:w-full after:transition-all
                 ${isActive ? 'text-sky-500 after:w-full' : 'text-gray-700 dark:text-gray-300 hover:text-sky-500'}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            onClick={toggleDarkMode}
            className="text-xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Theme"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="text-xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Theme"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          <button
            onClick={toggleMenu}
            className="text-2xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Mobile Menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden animate-slide-down origin-top bg-white dark:bg-neutral-900 border-t px-4 pt-3 pb-4 rounded-b-xl shadow-md">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block text-base font-medium py-2 transition-colors ${
                  isActive
                    ? 'text-sky-500'
                    : 'text-gray-700 dark:text-gray-300 hover:text-sky-500'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
