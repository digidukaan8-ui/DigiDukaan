import { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiChevronDown, FiSearch } from 'react-icons/fi';
import logo from '../assets/logo.webp'
import useThemeStore from '../store/theme';
import useAuthStore from '../store/auth';

export default function Header() {
  const { isDark, toggleMode } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const toggleDropdown = useCallback(() => setDropdownOpen(prev => !prev), []);

  const links = () => {
    if (isAuthenticated && user?.role === 'buyer') {
      return [
        { to: '/', label: 'Home' },
        { to: '/buyer/cart', label: 'Cart' },
        { to: '/buyer/chat', label: 'Chat' },
        { to: '/buyer/order', label: 'Orders' },
        { to: '/buyer/dashboard', label: 'Dashboard' },
        { to: '/logout', label: 'Logout' },
      ];
    } else if (isAuthenticated && user?.role === 'seller') {
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

  const getCurrentLabel = () => {
    const currentLink = links().find(link => link.to === location.pathname);
    return currentLink ? currentLink.label : 'Menu';
  };

  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/products/search?q=${encodeURIComponent(query.trim())}`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const searchResults = data?.data || data || [];

      navigate(`/search?q=${encodeURIComponent(query.trim())}`, {
        state: { results: searchResults, query: query.trim() }
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`, {
        state: { results: [], query: query.trim() }
      });
    }
  };

  const handleNavigation = useCallback((path) => {
    setDropdownOpen(false);
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-neutral-900 w-full shadow-lg border-b border-gray-200 dark:border-neutral-800 fixed top-0 z-[90]">
      <div className="hidden md:flex w-full max-w-7xl mx-auto px-5 lg:px-10 h-20 justify-between items-center gap-4">
        <NavLink to="/" className="flex justify-center items-center gap-3 group flex-shrink-0">
          <img
            src={logo}
            alt="DigiDukaan"
            className="w-11 h-fit object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
            DigiDukaan
          </span>
        </NavLink>

        {user?.role !== "seller" && <div className="flex-grow max-w-lg">
          <form onSubmit={handleSearch} className="relative" role="search">
            <label htmlFor="desktop-search" className="sr-only">Search products</label>
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
            <input
              type="search"
              id="desktop-search"
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              autoComplete="off"
              aria-label="Search products"
              className="w-full pl-12 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
            />
          </form>
        </div>}

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={toggleMode}
            type="button"
            className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              type="button"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Navigation menu"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span>{getCurrentLabel()}</span>
              <FiChevronDown className={`text-base transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden z-[100]" role="menu">
                {links().map((link) => (
                  <button
                    key={link.to}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigation(link.to);
                    }}
                    role="menuitem"
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${location.pathname === link.to
                      ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
                      }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex w-full px-5 h-16 justify-between items-center border-b border-gray-100 dark:border-neutral-800">
          <NavLink to="/" className="flex justify-center items-center gap-2 group">
            <img
              src={logo}
              alt="DigiDukaan"
              className="w-10 h-fit object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
              DigiDukaan
            </span>
          </NavLink>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMode}
              type="button"
              className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {isDark ? <FiSun className="text-base" /> : <FiMoon className="text-base" />}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                type="button"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="Navigation menu"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 shadow-sm transition-all duration-200"
              >
                <span className="text-xs">{getCurrentLabel()}</span>
                <FiChevronDown className={`text-sm transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden z-[100]" role="menu">
                  {links().map((link) => (
                    <button
                      key={link.to}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigation(link.to);
                      }}
                      role="menuitem"
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${location.pathname === link.to
                        ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
                        }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {user?.role !== "seller" &&
          <div className="px-5 py-2">
            <form onSubmit={handleSearch} className="relative" role="search">
              <label htmlFor="mobile-search" className="sr-only">Search products</label>
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="search"
                id="mobile-search"
                name="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                autoComplete="off"
                aria-label="Search products"
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
              />
            </form>
          </div>}
      </div>
    </header>
  );
}