/**
 * TenantDetail Page
 *
 * Displays full tenant profile with current assignment and history.
 * Admin: Full access with management buttons
 * Tenant: Read-only view of own profile
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTenantById, deleteTenant, unassignRoom } from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';
import TenantStatusBadge from '../components/TenantStatusBadge';
import AssignmentHistory from '../components/AssignmentHistory';
import AssignRoomModal from '../components/AssignRoomModal';
import {
  TENANT_PAGE_TITLES,
  TENANT_FORM_LABELS,
  TENANT_BUTTON_LABELS,
  TENANT_EMPTY_MESSAGES,
  TENANT_ERROR_MESSAGES,
  TENANT_SUCCESS_MESSAGES,
  TENANT_CONFIRM_MESSAGES,
  BUTTON_LABELS,
} from '../utils/constants';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const data = await getTenantById(id);
      setTenant(data);
    } catch (error) {
      console.error('Error fetching tenant:', error);
      if (error.response?.status === 403) {
        toast.error(TENANT_ERROR_MESSAGES.permissionDenied || 'Akses ditolak');
        navigate('/dashboard');
      } else if (error.response?.status === 404) {
        toast.error(TENANT_ERROR_MESSAGES.tenantNotFound);
        navigate('/penghuni');
      } else {
        toast.error(TENANT_ERROR_MESSAGES.fetchTenant);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Check if has active assignment
    if (tenant?.current_assignment) {
      toast.error(TENANT_ERROR_MESSAGES.cannotDeleteWithAssignment);
      setShowDeleteModal(false);
      return;
    }

    try {
      setActionLoading(true);
      await deleteTenant(id);
      toast.success(TENANT_SUCCESS_MESSAGES.tenantDeleted);
      navigate('/penghuni');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        TENANT_ERROR_MESSAGES.deleteTenant;
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleUnassign = async () => {
    if (!tenant?.current_assignment) return;

    const tenantName = tenant.user?.username || 'penghuni';
    const roomNumber = tenant.current_assignment.room_number;

    const confirmed = window.confirm(
      TENANT_CONFIRM_MESSAGES.unassignRoom(tenantName, roomNumber)
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await unassignRoom(id);
      toast.success(TENANT_SUCCESS_MESSAGES.roomUnassigned);
      fetchTenant(); // Refresh data
    } catch (error) {
      console.error('Error unassigning room:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        TENANT_ERROR_MESSAGES.unassignRoom;
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle ESC key for delete modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowDeleteModal(false);
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showDeleteModal]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-64 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-48"></div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  const tenantName = tenant.user?.username || 'Nama tidak tersedia';
  const fullName =
    tenant.user?.first_name || tenant.user?.last_name
      ? `${tenant.user?.first_name || ''} ${tenant.user?.last_name || ''}`.trim()
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {BUTTON_LABELS.back}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{TENANT_PAGE_TITLES.tenantDetail}</h1>
      </div>

      {/* Tenant Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Header with name and status */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-6 border-b border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{fullName || tenantName}</h2>
              {fullName && <p className="text-gray-600 mt-1">@{tenantName}</p>}
            </div>
            <TenantStatusBadge isActive={tenant.is_active} />
          </div>
        </div>

        {/* Profile Information */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{TENANT_FORM_LABELS.user_email}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tenant.user?.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{TENANT_FORM_LABELS.user_phone}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tenant.user?.phone || '-'}</dd>
                </div>
                {tenant.occupation && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{TENANT_FORM_LABELS.occupation}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tenant.occupation}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Tambahan</h3>
              <dl className="space-y-3">
                {tenant.id_number && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{TENANT_FORM_LABELS.id_number}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tenant.id_number}</dd>
                  </div>
                )}
                {tenant.emergency_contact_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {TENANT_FORM_LABELS.emergency_contact_name}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{tenant.emergency_contact_name}</dd>
                  </div>
                )}
                {tenant.emergency_contact_phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {TENANT_FORM_LABELS.emergency_contact_phone}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{tenant.emergency_contact_phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Action Buttons (Admin Only) */}
        {isAdmin() && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-3">
              <Link
                to={`/penghuni/${tenant.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {BUTTON_LABELS.edit}
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={actionLoading}
              >
                {BUTTON_LABELS.delete}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Assignment */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{TENANT_FORM_LABELS.current_room}</h3>
        </div>
        <div className="px-6 py-6">
          {tenant.current_assignment ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    to={`/rooms/${tenant.current_assignment.room}`}
                    className="text-2xl font-bold text-blue-600 hover:text-blue-700"
                  >
                    Kamar {tenant.current_assignment.room_number}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {tenant.current_room?.room_type || 'Tipe tidak tersedia'}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{TENANT_FORM_LABELS.move_in_date}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(tenant.current_assignment.move_in_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{TENANT_FORM_LABELS.monthly_rent}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Rp {Number(tenant.current_assignment.monthly_rent).toLocaleString('id-ID')} / bulan
                  </dd>
                </div>
                {tenant.current_assignment.lease_end_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {TENANT_FORM_LABELS.lease_end_date}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(tenant.current_assignment.lease_end_date)}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Admin Actions */}
              {isAdmin() && (
                <div className="mt-6 flex items-center space-x-3">
                  <Link
                    to={`/rooms/${tenant.current_assignment.room}`}
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {TENANT_BUTTON_LABELS.viewRoom}
                  </Link>
                  <button
                    onClick={handleUnassign}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Memproses...' : TENANT_BUTTON_LABELS.unassign}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <p className="mt-4 text-gray-600">{TENANT_EMPTY_MESSAGES.noCurrentAssignment}</p>

              {/* Assign Room Button (Admin Only) */}
              {isAdmin() && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {TENANT_BUTTON_LABELS.assignRoom}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assignment History */}
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{TENANT_FORM_LABELS.assignment_history}</h3>
          <p className="text-sm text-gray-600 mt-1">Riwayat kamar yang pernah ditempati</p>
        </div>
        <AssignmentHistory assignments={tenant.assignment_history || []} />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {BUTTON_LABELS.confirm} Hapus
              </h3>
              <p className="text-gray-600 mb-6">
                {TENANT_CONFIRM_MESSAGES.deleteTenant(tenantName)}
              </p>
              <p className="text-sm text-red-600 mb-6">{TENANT_CONFIRM_MESSAGES.deleteWarning}</p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  {BUTTON_LABELS.cancel}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Menghapus...' : BUTTON_LABELS.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Room Modal */}
      <AssignRoomModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        tenant={tenant}
        onSuccess={fetchTenant}
      />
    </div>
  );
};

export default TenantDetail;
