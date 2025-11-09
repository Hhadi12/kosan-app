import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import RoomCard from '../components/RoomCard';
import RoomCardSkeleton from '../components/RoomCardSkeleton';
import RoomFilters from '../components/RoomFilters';
import { getAllRooms } from '../api/roomApi';
import { useAuth } from '../contexts/AuthContext';
import { printRooms, exportToCSV, exportToPDF } from '../utils/exportUtils';
import {
  PAGE_TITLES,
  BUTTON_LABELS,
  EMPTY_MESSAGES,
  LOADING_MESSAGES,
  ERROR_MESSAGES,
} from '../utils/constants';

/**
 * RoomList Page
 *
 * Main page for displaying all rooms with filtering capabilities.
 * Shows room cards in a responsive grid layout.
 * Admins can see a "Tambah Kamar" button to create new rooms.
 */
const RoomList = () => {
  const { isAdmin } = useAuth();

  // State management
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('room_number_asc'); // Default: A-Z
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 12;

  // Fetch rooms from API
  const fetchRooms = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllRooms(filters);
      setRooms(data.rooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(ERROR_MESSAGES.fetchRooms);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rooms when component mounts or backend filters change
  useEffect(() => {
    fetchRooms();
  }, [filters.status, filters.room_type, filters.floor, filters.min_price, filters.max_price]);

  // Apply frontend search and sorting when rooms or filters change
  useEffect(() => {
    let result = [...rooms];

    // Apply search filter (starts with)
    if (filters.search) {
      const searchTerm = filters.search.toUpperCase();
      result = result.filter(room =>
        room.room_number.toUpperCase().startsWith(searchTerm)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'room_number_asc':
        result.sort((a, b) => a.room_number.localeCompare(b.room_number));
        break;
      case 'room_number_desc':
        result.sort((a, b) => b.room_number.localeCompare(a.room_number));
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'floor_asc':
        result.sort((a, b) => a.floor - b.floor);
        break;
      case 'floor_desc':
        result.sort((a, b) => b.floor - a.floor);
        break;
      default:
        break;
    }

    setFilteredRooms(result);
    setCurrentPage(1); // Reset to first page when filters/sort change
  }, [rooms, filters.search, sortBy]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Remove undefined values to clean up query params
    const cleanedFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, value]) => value !== undefined && value !== '')
    );
    setFilters(cleanedFilters);
  };

  // Handle sort changes
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Calculate room statistics
  const stats = {
    available: filteredRooms.filter(r => r.status === 'available').length,
    occupied: filteredRooms.filter(r => r.status === 'occupied').length,
    maintenance: filteredRooms.filter(r => r.status === 'maintenance').length,
  };

  // Handle stats click to filter by status
  const handleStatsClick = (status) => {
    handleFilterChange({
      ...filters,
      status: filters.status === status ? undefined : status,
    });
  };

  // Retry fetching rooms
  const handleRetry = () => {
    fetchRooms();
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  // Generate page numbers with ellipsis (max 5 buttons)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis logic
      if (currentPage <= 3) {
        // Near start: 1 2 3 4 ... last
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1 ... last-3 last-2 last-1 last
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: 1 ... current-1 current current+1 ... last
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (typeof page === 'number' && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle export functions (admin only)
  const handlePrint = () => {
    if (filteredRooms.length === 0) {
      toast.error('Tidak ada data untuk dicetak');
      return;
    }
    printRooms(filteredRooms);
    toast.success('Membuka jendela cetak...');
  };

  const handleExportCSV = () => {
    if (filteredRooms.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    exportToCSV(filteredRooms);
    toast.success('File CSV berhasil diunduh');
  };

  const handleExportPDF = () => {
    if (filteredRooms.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    exportToPDF(filteredRooms);
    toast.success('File PDF berhasil diunduh');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{PAGE_TITLES.roomList}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Kelola dan lihat semua kamar kosan
              </p>
            </div>

            {/* Add Room Button - Admin Only */}
            {isAdmin() && (
              <Link
                to="/rooms/create"
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {BUTTON_LABELS.create}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <RoomFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Stats Summary - Below filters, above grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Available Stat */}
            <button
              onClick={() => handleStatsClick('available')}
              className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all duration-200 hover:shadow-lg ${
                filters.status === 'available'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Tersedia</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Occupied Stat */}
            <button
              onClick={() => handleStatsClick('occupied')}
              className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all duration-200 hover:shadow-lg ${
                filters.status === 'occupied'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Terisi</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.occupied}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Maintenance Stat */}
            <button
              onClick={() => handleStatsClick('maintenance')}
              className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all duration-200 hover:shadow-lg ${
                filters.status === 'maintenance'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pemeliharaan</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.maintenance}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Sort Dropdown and Export Buttons - Above room count */}
        {!loading && !error && filteredRooms.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                Urutkan:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="room_number_asc">Nomor Kamar (A-Z)</option>
                <option value="room_number_desc">Nomor Kamar (Z-A)</option>
                <option value="price_asc">Harga (Terendah)</option>
                <option value="price_desc">Harga (Tertinggi)</option>
                <option value="floor_asc">Lantai (Terendah)</option>
                <option value="floor_desc">Lantai (Tertinggi)</option>
              </select>
            </div>

            {/* Export Buttons - Admin Only */}
            {isAdmin() && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">Ekspor:</span>

                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Cetak daftar kamar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="hidden sm:inline">Cetak</span>
                </button>

                {/* CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Unduh sebagai CSV"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">CSV</span>
                </button>

                {/* PDF Button */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Unduh sebagai PDF"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <RoomCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRooms.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {Object.keys(filters).length > 0 ? EMPTY_MESSAGES.noRoomsFilter : EMPTY_MESSAGES.noRooms}
            </h3>
            <p className="text-gray-500 mb-6">
              {Object.keys(filters).length > 0
                ? 'Coba ubah filter Anda atau hapus filter untuk melihat semua kamar'
                : 'Belum ada kamar yang tersedia saat ini'}
            </p>
            {isAdmin() && Object.keys(filters).length === 0 && (
              <Link
                to="/rooms/create"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {BUTTON_LABELS.create}
              </Link>
            )}
          </div>
        )}

        {/* Room Count and Grid */}
        {!loading && !error && filteredRooms.length > 0 && (
          <>
            {/* Room Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{filteredRooms.length}</span> kamar
                {(Object.keys(filters).length > 0 || sortBy !== 'room_number_asc') && (
                  <span className="text-sm ml-2 text-gray-500">
                    {Object.keys(filters).length > 0 && `(${Object.keys(filters).length} filter aktif)`}
                  </span>
                )}
              </p>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RoomList;
