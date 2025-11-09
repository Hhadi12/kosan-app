import React, { useState } from 'react';
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
 */
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        // Future: { path: '/tenants', label: 'Penghuni' },
        // Future: { path: '/payments', label: 'Pembayaran' },
        // Future: { path: '/complaints', label: 'Keluhan' },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/rooms', label: 'Kamar' },
        // Future: { path: '/favorites', label: 'Favorit Saya' },
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

          {/* Right Side: User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-600">
              {user?.username}
              {isAdmin() && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 font-medium"
            >
              Keluar
            </button>
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
