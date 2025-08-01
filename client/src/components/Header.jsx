import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'

export default function Header() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)
  const toggleMenu = () => setMenuOpen(!menuOpen)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ]

  return (
    <header className="bg-white dark:bg-neutral-900 shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-sky-600 tracking-tight">
          DigiDukaan
        </h1>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative text-base font-semibold transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-500 hover:after:w-full after:transition-all
                ${isActive
                  ? 'text-sky-500 after:w-full'
                  : 'text-gray-700 dark:text-gray-300 hover:text-sky-500'}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            onClick={toggleDarkMode}
            className="text-xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </nav>

        <div className="md:hidden flex justify-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="text-xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          <button
            onClick={toggleMenu}
            className="text-2xl text-gray-700 dark:text-gray-300 hover:text-sky-500 transition"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden animate-slide-down origin-top bg-white border-t dark:bg-neutral-900 px-4 pt-3 pb-4 rounded-b-xl shadow-md">
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
  )
}