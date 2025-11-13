/**
 * Utility Functions for Formatting
 *
 * This file contains helper functions for formatting prices, dates, and other data
 * according to Indonesian locale and conventions.
 */

/**
 * Format price to Indonesian Rupiah currency
 *
 * @param {number} price - Price value to format
 * @returns {string} - Formatted price string (e.g., "Rp 1.500.000")
 *
 * @example
 * formatPrice(1500000) // "Rp 1.500.000"
 * formatPrice(2100000) // "Rp 2.100.000"
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format date to Indonesian date format
 *
 * @param {string|Date} date - Date to format (ISO string or Date object)
 * @returns {string} - Formatted date string (e.g., "9 Januari 2025")
 *
 * @example
 * formatDate('2025-01-09T10:30:00') // "9 Januari 2025"
 * formatDate(new Date()) // "9 Januari 2025"
 */
export const formatDate = (date) => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date with time to Indonesian format
 *
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time (e.g., "9 Januari 2025, 10:30")
 *
 * @example
 * formatDateTime('2025-01-09T10:30:00') // "9 Januari 2025, 10:30"
 */
export const formatDateTime = (date) => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const dateStr = dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dateStr}, ${timeStr}`;
};

/**
 * Format number with thousand separators (Indonesian style)
 *
 * @param {number} num - Number to format
 * @returns {string} - Formatted number (e.g., "1.500")
 *
 * @example
 * formatNumber(1500) // "1.500"
 * formatNumber(2100000) // "2.100.000"
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';

  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Parse formatted price string back to number
 * Useful for form inputs that display formatted prices
 *
 * @param {string} priceStr - Formatted price string
 * @returns {number} - Numeric value
 *
 * @example
 * parsePrice('Rp 1.500.000') // 1500000
 * parsePrice('1.500.000') // 1500000
 */
export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;

  // Remove 'Rp', spaces, and dots (thousand separators)
  const numStr = priceStr.replace(/Rp\s?/g, '').replace(/\./g, '');

  return parseInt(numStr, 10) || 0;
};

/**
 * Capitalize first letter of each word
 *
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 *
 * @example
 * capitalize('kamar single') // "Kamar Single"
 */
export const capitalize = (str) => {
  if (!str) return '';

  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Alias for formatPrice for consistency with payment system
 * @alias formatPrice
 */
export const formatRupiah = formatPrice;
