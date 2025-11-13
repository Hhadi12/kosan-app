import React from 'react';
import {
  PAYMENT_STATUS_OPTIONS,
  MONTH_OPTIONS,
  PAYMENT_FORM_LABELS,
  BUTTON_LABELS,
} from '../utils/constants';

/**
 * PaymentFilters Component
 *
 * Filter controls for payment list
 * Includes: status, month, year, search, sort
 *
 * @param {object} filters - Current filter values
 * @param {function} onFilterChange - Handler for filter changes
 * @param {function} onClearFilters - Handler to clear all filters
 */
const PaymentFilters = ({ filters, onFilterChange, onClearFilters }) => {
  // Handle input change
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  // Generate year options (current year ± 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {PAYMENT_FORM_LABELS.status}
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {PAYMENT_FORM_LABELS.payment_period_month}
          </label>
          <select
            value={filters.payment_period_month || ''}
            onChange={(e) => handleChange('payment_period_month', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {PAYMENT_FORM_LABELS.payment_period_year}
          </label>
          <select
            value={filters.payment_period_year || ''}
            onChange={(e) => handleChange('payment_period_year', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Tahun</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
          <select
            value={filters.ordering || ''}
            onChange={(e) => handleChange('ordering', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="-due_date">Jatuh Tempo (Terbaru)</option>
            <option value="due_date">Jatuh Tempo (Terlama)</option>
            <option value="-amount">Jumlah (Tertinggi)</option>
            <option value="amount">Jumlah (Terendah)</option>
            <option value="-payment_date">Tanggal Bayar (Terbaru)</option>
            <option value="payment_date">Tanggal Bayar (Terlama)</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cari Nama Penghuni
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Ketik nama penghuni..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onClearFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            {BUTTON_LABELS.clearFilter}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.status ||
        filters.payment_period_month ||
        filters.payment_period_year ||
        filters.search) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Filter aktif:{' '}
            {filters.status && <span className="font-medium">Status, </span>}
            {filters.payment_period_month && <span className="font-medium">Bulan, </span>}
            {filters.payment_period_year && <span className="font-medium">Tahun, </span>}
            {filters.search && <span className="font-medium">Pencarian</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentFilters;
