import { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import logo from '../assets/logo.webp'
import useThemeStore from '../store/theme';
import useAuthStore from '../store/auth';
import axios from 'axios';

// import { useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';

export default function Header() {
  const { isDark, toggleMode } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  const links = () => {
    if (isAuthenticated && user.role === 'buyer') {
      return [
        { to: '/', label: 'Home' },
        { to: '/buyer/cart', label: 'Cart' },
        { to: '/buyer/chat', label: 'Chat' },
        { to: '/buyer/order', label: 'Orders' },
        { to: '/buyer/dashboard', label: 'Dashboard' },
        { to: '/logout', label: 'Logout' },
      ];
    } else if (isAuthenticated && user.role === 'seller') {
      return [
        { to: '/seller/store', label: 'Store' },
        { to: '/seller/order', label: 'Orders' },
        { to: '/seller/chat', label: 'Chat' },
        { to: '/seller/dashboard', label: 'Dashboard' },
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

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsDropdownVisible(false);
      return;
    }
    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/products/search?q=${query}`);
        setResults(response.data);
        setIsDropdownVisible(true);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      }
    };
    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="bg-white dark:bg-neutral-900 w-full shadow-lg border-b border-gray-200 dark:border-neutral-800 fixed top-0 z-[90] h-20">
      <div className="w-full max-w-7xl mx-auto px-5 md:px-10 h-full flex justify-between items-center">
        <NavLink to="/" className="flex justify-center items-center gap-3 group">
          <img
            src={logo}
            alt="DigiDukaan"
            className="w-11 sm:w-12 h-fit object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <span className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
            DigiDukaan
          </span>
        </NavLink>

        <div className="hidden md:flex flex-grow justify-center" ref={searchContainerRef}>
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {isDropdownVisible && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                {results.map((product) => (
                  <Link
                    to={`/product/${product._id}`}
                    key={product._id}
                    className="block px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => {
                      setQuery('');
                      setIsDropdownVisible(false);
                    }}
                  >
                    {product.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2" aria-label="Main Navigation">
          {links().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition-all duration-200 py-2 px-4 rounded-lg
                 ${isActive
                  ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            onClick={toggleMode}
            className="ml-2 p-2.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200"
            aria-label="Toggle Mobile Menu"
          >
            {menuOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 shadow-lg">
          <div className="px-5 py-4 space-y-1">
            {links().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200
                   ${isActive
                    ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}