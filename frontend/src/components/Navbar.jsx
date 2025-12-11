import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Navbar Component
 *
 * Persistent navigation bar shown across all pages.
 * Features:
 * - Role-based menu items (different for admin vs regular users)
 * - Active link highlighting
 * - Mobile responsive with hamburger menu
 * - Mobile menu slides from left
 * - Auto-closes on link click
 * - User profile dropdown menu
 */
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items based on user role
  const navItems = isAdmin()
    ? [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/rooms', label: 'Kamar' },
        { path: '/penghuni', label: 'Penghuni' },
        { path: '/pembayaran', label: 'Pembayaran' },
        { path: '/keluhan', label: 'Keluhan' },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/rooms', label: 'Kamar' },
        { path: '/keluhan', label: 'Keluhan' },
      ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
              onClick={handleLinkClick}
            >
              Kosan App
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                  onClick={handleLinkClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: User Dropdown */}
          <div className="hidden md:flex items-center" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.first_name || user?.username}
                </span>
                {isAdmin() && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    Admin
                  </span>
                )}
                {/* Dropdown Arrow */}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-50">
                  <Link
                    to="/profil"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profil Saya
                    </div>
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />

          {/* Slide-out Menu from Left */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-500">Masuk sebagai</p>
              <p className="font-semibold text-gray-900">{user?.username}</p>
              {isAdmin() && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>

            {/* Navigation Links */}
            <div className="py-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={handleLinkClick}
                >
                  {item.label}
                </Link>
              ))}

              {/* Profile Link in Mobile Menu */}
              <Link
                to="/profil"
                className={`block px-4 py-3 font-medium transition-colors duration-200 ${
                  isActive('/profil')
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={handleLinkClick}
              >
                Profil Saya
              </Link>
            </div>

            {/* Logout Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition duration-200 font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
