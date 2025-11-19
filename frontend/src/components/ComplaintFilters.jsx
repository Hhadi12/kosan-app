import React from 'react';
import {
  COMPLAINT_STATUS_OPTIONS,
  COMPLAINT_CATEGORY_OPTIONS,
  COMPLAINT_PRIORITY_OPTIONS,
} from '../utils/constants';

/**
 * ComplaintFilters Component
 *
 * Filter controls for complaint list.
 *
 * @param {Object} filters - Current filter values
 * @param {Function} onFilterChange - Callback when filter changes
 * @param {Function} onClearFilters - Callback to clear all filters
 */
const ComplaintFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value,
    });
  };

  const hasActiveFilters = filters.status || filters.category || filters.priority || filters.search;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Keluhan
          </label>
          <input
            type="text"
            placeholder="Cari judul atau deskripsi..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            {COMPLAINT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Kategori</option>
            {COMPLAINT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioritas
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Prioritas</option>
            {COMPLAINT_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Hapus Semua Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters;
