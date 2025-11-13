import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import PaymentCard from '../components/PaymentCard';
import PaymentFilters from '../components/PaymentFilters';
import { getAllPayments, exportPayments } from '../api/paymentApi';
import {
  PAYMENT_PAGE_TITLES,
  PAYMENT_BUTTON_LABELS,
  PAYMENT_ERROR_MESSAGES,
  PAYMENT_EMPTY_MESSAGES,
  PAYMENT_LOADING_MESSAGES,
  PAYMENT_SUCCESS_MESSAGES,
} from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * PaymentList Page
 *
 * Main payment list page with filters and pagination
 * Admin: See all payments with export buttons
 * Tenant: See own payments only
 */
const PaymentList = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    payment_period_month: searchParams.get('month') || '',
    payment_period_year: searchParams.get('year') || '',
    search: '',
    ordering: '-due_date', // Default: newest due date first
    page: 1,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  // Fetch payments
  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments(filters);

      // Handle paginated response
      if (data.results) {
        setPayments(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } else {
        // Handle non-paginated response (tenant view)
        setPayments(Array.isArray(data) ? data : []);
        setPagination({ count: data.length || 0, next: null, previous: null });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(PAYMENT_ERROR_MESSAGES.fetchPayments);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 on filter change
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: '',
      payment_period_month: '',
      payment_period_year: '',
      search: '',
      ordering: '-due_date',
      page: 1,
    });
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      setExporting(true);
      await exportPayments(format, filters);
      toast.success(PAYMENT_SUCCESS_MESSAGES.paymentsExported);
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error(PAYMENT_ERROR_MESSAGES.exportFailed);
    } finally {
      setExporting(false);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.next) {
      setFilters({ ...filters, page: filters.page + 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      setFilters({ ...filters, page: filters.page - 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin() ? PAYMENT_PAGE_TITLES.paymentList : PAYMENT_PAGE_TITLES.myPayments}
              </h1>
              <p className="mt-2 text-gray-600">
                {isAdmin()
                  ? 'Kelola semua pembayaran penghuni'
                  : 'Lihat riwayat pembayaran Anda'}
              </p>
            </div>

            {/* Action Buttons (Admin Only) */}
            {isAdmin() && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/pembayaran/buat')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  {PAYMENT_BUTTON_LABELS.createPayment}
                </button>

                {/* Export Dropdown */}
                <div className="relative group">
                  <button
                    disabled={exporting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {exporting ? 'Mengekspor...' : 'Ekspor ▼'}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium rounded-t-lg"
                    >
                      {PAYMENT_BUTTON_LABELS.exportCSV}
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium rounded-b-lg"
                    >
                      {PAYMENT_BUTTON_LABELS.exportPDF}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <PaymentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{PAYMENT_LOADING_MESSAGES.loadingPayments}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && payments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filters.status || filters.payment_period_month || filters.search
                ? PAYMENT_EMPTY_MESSAGES.noPaymentsFilter
                : PAYMENT_EMPTY_MESSAGES.noPayments}
            </h3>
            <p className="mt-2 text-gray-500">
              {isAdmin() && !filters.status && 'Mulai dengan membuat pembayaran pertama'}
            </p>
            {(filters.status || filters.payment_period_month || filters.search) && (
              <button
                onClick={handleClearFilters}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hapus Filter
              </button>
            )}
          </div>
        )}

        {/* Payment Grid */}
        {!loading && payments.length > 0 && (
          <>
            {/* Results Count */}
            <div className="mb-4 text-gray-600">
              Menampilkan {payments.length} dari {pagination.count} pembayaran
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>

            {/* Pagination */}
            {(pagination.next || pagination.previous) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.previous}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ← Sebelumnya
                </button>

                <span className="text-gray-600 font-medium">Halaman {filters.page}</span>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.next}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentList;
