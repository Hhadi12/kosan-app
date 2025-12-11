import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import PaymentHistoryCard from '../components/PaymentHistoryCard';
import ComplaintHistoryCard from '../components/ComplaintHistoryCard';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, changeEmail, changePassword, getMyHistory } from '../api/userApi';
import {
  PROFILE_PAGE_TITLES,
  PROFILE_FORM_LABELS,
  PROFILE_BUTTON_LABELS,
  PROFILE_SUCCESS_MESSAGES,
  PROFILE_ERROR_MESSAGES,
  PROFILE_LOADING_MESSAGES,
  PROFILE_INFO_MESSAGES,
  ROLE_LABELS,
  TENANT_STATUS,
  HISTORY_LABELS,
} from '../utils/constants';
import { formatDate } from '../utils/formatters';

/**
 * Profile Page Component
 *
 * Displays user profile information with options to:
 * - View profile details
 * - Edit profile (name, phone)
 * - Change email (requires password)
 * - Change password
 */
const Profile = () => {
  const { user: authUser } = useAuth();

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [emailForm, setEmailForm] = useState({
    new_email: '',
    password: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Saving states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // History states (Phase 8.4)
  const [history, setHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch history when profile is loaded (for tenant users only)
  useEffect(() => {
    if (profile && profile.role === 'user') {
      fetchHistory();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(PROFILE_ERROR_MESSAGES.fetchProfile);
      toast.error(PROFILE_ERROR_MESSAGES.fetchProfile);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenant history (Phase 8.4)
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getMyHistory();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      // Don't show error toast - history is supplementary
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle edit profile form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle email form change
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edit profile
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const response = await updateProfile(editForm);
      setProfile(response.user);
      toast.success(PROFILE_SUCCESS_MESSAGES.profileUpdated);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg = err.response?.data?.phone?.[0] || PROFILE_ERROR_MESSAGES.updateProfile;
      toast.error(errorMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Submit email change
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingEmail(true);
      await changeEmail(emailForm);
      // Refetch profile to get updated email
      await fetchProfile();
      toast.success(PROFILE_SUCCESS_MESSAGES.emailChanged);
      setShowEmailModal(false);
      setEmailForm({ new_email: '', password: '' });
    } catch (err) {
      console.error('Error changing email:', err);
      const errorMsg =
        err.response?.data?.new_email?.[0] ||
        err.response?.data?.password?.[0] ||
        PROFILE_ERROR_MESSAGES.changeEmail;
      toast.error(errorMsg);
    } finally {
      setSavingEmail(false);
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate password match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error(PROFILE_ERROR_MESSAGES.passwordMismatch);
      return;
    }

    // Validate minimum length
    if (passwordForm.new_password.length < 8) {
      toast.error(PROFILE_ERROR_MESSAGES.passwordTooShort);
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword(passwordForm);
      toast.success(PROFILE_SUCCESS_MESSAGES.passwordChanged);
      setShowPasswordModal(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMsg =
        err.response?.data?.current_password?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        PROFILE_ERROR_MESSAGES.changePassword;
      toast.error(errorMsg);
    } finally {
      setSavingPassword(false);
    }
  };

  // Close modals and reset forms
  const closeEditModal = () => {
    setShowEditModal(false);
    if (profile) {
      setEditForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      });
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailForm({ new_email: '', password: '' });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProfile}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {PROFILE_PAGE_TITLES.myProfile}
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                {profile?.first_name?.[0]?.toUpperCase() ||
                  profile?.username?.[0]?.toUpperCase() ||
                  'U'}
              </div>
              <div className="ml-6 text-white">
                <h2 className="text-2xl font-bold">
                  {profile?.full_name || profile?.username}
                </h2>
                <p className="opacity-90">{profile?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {ROLE_LABELS[profile?.role] || profile?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {PROFILE_FORM_LABELS.userId}
                </label>
                <p className="mt-1 text-lg text-gray-900 font-mono">{profile?.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {PROFILE_FORM_LABELS.email}
                </label>
                <p className="mt-1 text-lg text-gray-900">{profile?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {PROFILE_FORM_LABELS.firstName}
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {profile?.first_name || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {PROFILE_FORM_LABELS.lastName}
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {profile?.last_name || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {PROFILE_FORM_LABELS.phone}
                </label>
                <p className="mt-1 text-lg text-gray-900">{profile?.phone || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {PROFILE_FORM_LABELS.dateJoined}
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {profile?.date_joined ? formatDate(profile.date_joined) : '-'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {PROFILE_BUTTON_LABELS.editProfile}
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {PROFILE_BUTTON_LABELS.changeEmail}
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {PROFILE_BUTTON_LABELS.changePassword}
              </button>
            </div>
          </div>
        </div>

        {/* Tenant Info Card (if applicable) */}
        {profile?.tenant_profile && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {PROFILE_INFO_MESSAGES.tenantInfoLabel}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    {PROFILE_INFO_MESSAGES.currentRoom}
                  </label>
                  {profile.tenant_profile.current_room ? (
                    <Link
                      to={`/rooms/${profile.tenant_profile.current_room.room_number}`}
                      className="mt-1 text-lg text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Kamar {profile.tenant_profile.current_room.room_number}
                    </Link>
                  ) : (
                    <p className="mt-1 text-lg text-gray-500">Belum ada kamar</p>
                  )}
                </div>

                {/* Move In Date */}
                {profile.tenant_profile.current_assignment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      {PROFILE_INFO_MESSAGES.moveInDate}
                    </label>
                    <p className="mt-1 text-lg text-gray-900">
                      {formatDate(profile.tenant_profile.current_assignment.move_in_date)}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    {PROFILE_INFO_MESSAGES.status}
                  </label>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      profile.tenant_profile.is_active
                        ? TENANT_STATUS.active.bgColor + ' ' + TENANT_STATUS.active.textColor
                        : TENANT_STATUS.inactive.bgColor + ' ' + TENANT_STATUS.inactive.textColor
                    }`}
                  >
                    {profile.tenant_profile.is_active
                      ? TENANT_STATUS.active.label
                      : TENANT_STATUS.inactive.label}
                  </span>
                </div>

                {/* Occupation */}
                {profile.tenant_profile.occupation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pekerjaan</label>
                    <p className="mt-1 text-lg text-gray-900">
                      {profile.tenant_profile.occupation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Section (Phase 8.4) - Tenant users only */}
        {profile?.role === 'user' && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {HISTORY_LABELS.SECTION_TITLE}
            </h2>

            {loadingHistory ? (
              <div className="text-center py-8 text-gray-500">
                {HISTORY_LABELS.LOADING}
              </div>
            ) : history ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PaymentHistoryCard
                  summary={history.payment_summary}
                  history={history.payment_history}
                />
                <ComplaintHistoryCard
                  summary={history.complaint_summary}
                  history={history.complaint_history}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
                {HISTORY_LABELS.LOAD_ERROR}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Modal title={PROFILE_PAGE_TITLES.editProfile} onClose={closeEditModal}>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.firstName}
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={editForm.first_name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama depan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.lastName}
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={editForm.last_name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama belakang"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.phone}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: 08123456789"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {PROFILE_BUTTON_LABELS.cancel}
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {savingProfile ? PROFILE_LOADING_MESSAGES.savingProfile : PROFILE_BUTTON_LABELS.save}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <Modal title={PROFILE_PAGE_TITLES.changeEmail} onClose={closeEmailModal}>
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.newEmail}
                </label>
                <input
                  type="email"
                  name="new_email"
                  value={emailForm.new_email}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan email baru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.passwordConfirm}
                </label>
                <input
                  type="password"
                  name="password"
                  value={emailForm.password}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan password untuk konfirmasi"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {PROFILE_INFO_MESSAGES.emailConfirmRequired}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEmailModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {PROFILE_BUTTON_LABELS.cancel}
              </button>
              <button
                type="submit"
                disabled={savingEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {savingEmail ? PROFILE_LOADING_MESSAGES.changingEmail : PROFILE_BUTTON_LABELS.changeEmail}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <Modal title={PROFILE_PAGE_TITLES.changePassword} onClose={closePasswordModal}>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.currentPassword}
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan password saat ini"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.newPassword}
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan password baru"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {PROFILE_INFO_MESSAGES.passwordMinLength}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {PROFILE_FORM_LABELS.confirmPassword}
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Konfirmasi password baru"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closePasswordModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {PROFILE_BUTTON_LABELS.cancel}
              </button>
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {savingPassword ? PROFILE_LOADING_MESSAGES.changingPassword : PROFILE_BUTTON_LABELS.changePassword}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

/**
 * Reusable Modal Component
 */
const Modal = ({ title, children, onClose }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
