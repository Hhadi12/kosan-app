/**
 * TenantList Page
 *
 * Displays list of all tenants with filters, search, and pagination.
 * Admin: Can see all tenants
 * Tenant: Redirects to own profile
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllTenants } from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';
import TenantCard from '../components/TenantCard';
import {
  TENANT_PAGE_TITLES,
  TENANT_STATS_LABELS,
  TENANT_EMPTY_MESSAGES,
  TENANT_LOADING_MESSAGES,
  TENANT_ERROR_MESSAGES,
} from '../utils/constants';
import toast from 'react-hot-toast';

const TenantList = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // all, assigned, unassigned

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tenantsPerPage = 12;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    assigned: 0,
    unassigned: 0,
  });

  useEffect(() => {
    // Redirect non-admin users to their profile
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }

    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await getAllTenants();
      setTenants(data.tenants || []);

      // Calculate stats
      const allTenants = data.tenants || [];
      setStats({
        total: allTenants.length,
        active: allTenants.filter((t) => t.is_active).length,
        inactive: allTenants.filter((t) => !t.is_active).length,
        assigned: allTenants.filter((t) => t.has_active_assignment).length,
        unassigned: allTenants.filter((t) => !t.has_active_assignment).length,
      });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error(TENANT_ERROR_MESSAGES.fetchTenants);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...tenants];

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((t) => t.is_active);
    } else if (statusFilter === 'inactive') {
      result = result.filter((t) => !t.is_active);
    }

    // Assignment filter
    if (assignmentFilter === 'assigned') {
      result = result.filter((t) => t.has_active_assignment);
    } else if (assignmentFilter === 'unassigned') {
      result = result.filter((t) => !t.has_active_assignment);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.user_full_name?.toLowerCase().includes(term) ||
          t.user_username?.toLowerCase().includes(term) ||
          t.user_email?.toLowerCase().includes(term) ||
          t.occupation?.toLowerCase().includes(term) ||
          t.current_room_number?.toLowerCase().includes(term)
      );
    }

    setFilteredTenants(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [tenants, searchTerm, statusFilter, assignmentFilter]);

  // Pagination
  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = filteredTenants.slice(indexOfFirstTenant, indexOfLastTenant);
  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{TENANT_PAGE_TITLES.tenantList}</h1>
        <p className="mt-2 text-gray-600">Kelola data penghuni kosan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {/* Total */}
        <div
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            setStatusFilter('all');
            setAssignmentFilter('all');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{TENANT_STATS_LABELS.totalTenants}</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active */}
        <div
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            setStatusFilter('active');
            setAssignmentFilter('all');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{TENANT_STATS_LABELS.activeTenants}</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div
          className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            setStatusFilter('inactive');
            setAssignmentFilter('all');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">{TENANT_STATS_LABELS.inactiveTenants}</p>
              <p className="text-3xl font-bold mt-2">{stats.inactive}</p>
            </div>
            <div className="bg-gray-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Assigned */}
        <div
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            setStatusFilter('all');
            setAssignmentFilter('assigned');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{TENANT_STATS_LABELS.assignedTenants}</p>
              <p className="text-3xl font-bold mt-2">{stats.assigned}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Unassigned */}
        <div
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            setStatusFilter('all');
            setAssignmentFilter('unassigned');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">{TENANT_STATS_LABELS.unassignedTenants}</p>
              <p className="text-3xl font-bold mt-2">{stats.unassigned}</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Cari Penghuni
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nama, email, pekerjaan..."
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {/* Assignment Filter */}
          <div>
            <label htmlFor="assignmentFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Penugasan Kamar
            </label>
            <select
              id="assignmentFilter"
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Semua</option>
              <option value="assigned">Memiliki Kamar</option>
              <option value="unassigned">Belum Ada Kamar</option>
            </select>
          </div>
        </div>

        {/* Active filters indicator */}
        {(searchTerm || statusFilter !== 'all' || assignmentFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredTenants.length} dari {tenants.length} penghuni
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setAssignmentFilter('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Hapus Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Tenant Grid */}
      {currentTenants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="mt-4 text-lg text-gray-600">
            {searchTerm || statusFilter !== 'all' || assignmentFilter !== 'all'
              ? TENANT_EMPTY_MESSAGES.noTenantsFilter
              : TENANT_EMPTY_MESSAGES.noTenants}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentTenants.map((tenant) => (
              <TenantCard key={tenant.id} tenant={tenant} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>

              {/* Page numbers */}
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return (
                      <span key={pageNumber} className="px-2 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TenantList;
