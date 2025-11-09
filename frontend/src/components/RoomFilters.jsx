import React from 'react';
import { ROOM_STATUS_OPTIONS, ROOM_TYPE_OPTIONS, BUTTON_LABELS } from '../utils/constants';

/**
 * RoomFilters Component
 *
 * Provides filtering controls for the room list.
 * Allows filtering by status, room type, floor, and price range.
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback when filters change
 *
 * @example
 * <RoomFilters
 *   filters={{ status: 'available', floor: 2 }}
 *   onFilterChange={(newFilters) => setFilters(newFilters)}
 * />
 */
const RoomFilters = ({ filters, onFilterChange }) => {
  // Handle individual filter changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update filters, remove filter if value is empty
    onFilterChange({
      ...filters,
      [name]: value || undefined,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange({});
  };

  // Clear search only
  const clearSearch = () => {
    onFilterChange({
      ...filters,
      search: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      {/* Filter Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {BUTTON_LABELS.filter}
        </h3>

        {/* Clear Filters Button */}
        {Object.keys(filters).length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {BUTTON_LABELS.clearFilter}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Cari Nomor Kamar
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Contoh: A101, B2..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
          />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Hapus pencarian"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            {ROOM_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type Filter */}
        <div>
          <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipe Kamar
          </label>
          <select
            id="room_type"
            name="room_type"
            value={filters.room_type || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Tipe</option>
            {ROOM_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Filter */}
        <div>
          <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
            Lantai
          </label>
          <input
            type="number"
            id="floor"
            name="floor"
            value={filters.floor || ''}
            onChange={handleChange}
            min="1"
            placeholder="Semua lantai"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Min Price Filter */}
        <div>
          <label htmlFor="min_price" className="block text-sm font-medium text-gray-700 mb-2">
            Harga Minimum
          </label>
          <input
            type="number"
            id="min_price"
            name="min_price"
            value={filters.min_price || ''}
            onChange={handleChange}
            min="0"
            step="100000"
            placeholder="Rp 0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-2">
            Harga Maksimum
          </label>
          <input
            type="number"
            id="max_price"
            name="max_price"
            value={filters.max_price || ''}
            onChange={handleChange}
            min="0"
            step="100000"
            placeholder="Tidak terbatas"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Filter aktif:</span>{' '}
            {Object.keys(filters).length} filter diterapkan
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomFilters;
