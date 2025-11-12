/**
 * EditTenant Page
 *
 * Form for editing tenant information (Admin only).
 * Cannot change linked user - only edit tenant profile fields.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTenantById, updateTenant } from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';
import {
  TENANT_PAGE_TITLES,
  TENANT_FORM_LABELS,
  TENANT_SUCCESS_MESSAGES,
  TENANT_ERROR_MESSAGES,
  BUTTON_LABELS,
  VALIDATION_MESSAGES,
} from '../utils/constants';
import toast from 'react-hot-toast';

const EditTenant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState(null);

  const [formData, setFormData] = useState({
    id_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    occupation: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }

    fetchTenant();
  }, [id]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const data = await getTenantById(id);
      setTenant(data);

      // Populate form with existing data
      setFormData({
        id_number: data.id_number || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        occupation: data.occupation || '',
      });
    } catch (error) {
      console.error('Error fetching tenant:', error);
      toast.error(TENANT_ERROR_MESSAGES.fetchTenant);
      navigate('/penghuni');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // ID number validation (optional but if provided, should be valid)
    if (formData.id_number && formData.id_number.length < 8) {
      newErrors.id_number = 'Nomor KTP harus minimal 8 karakter';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.emergency_contact_phone) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.emergency_contact_phone)) {
        newErrors.emergency_contact_phone = 'Format nomor telepon tidak valid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      // Prepare data - only send fields that have values
      const updateData = {};
      if (formData.id_number) updateData.id_number = formData.id_number;
      if (formData.emergency_contact_name)
        updateData.emergency_contact_name = formData.emergency_contact_name;
      if (formData.emergency_contact_phone)
        updateData.emergency_contact_phone = formData.emergency_contact_phone;
      if (formData.occupation) updateData.occupation = formData.occupation;

      await updateTenant(id, updateData);

      toast.success(TENANT_SUCCESS_MESSAGES.tenantUpdated);
      navigate(`/penghuni/${id}`);
    } catch (error) {
      console.error('Error updating tenant:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        TENANT_ERROR_MESSAGES.updateTenant;
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  const tenantName = tenant.user?.username || 'Penghuni';

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
        <h1 className="text-3xl font-bold text-gray-900">{TENANT_PAGE_TITLES.editTenant}</h1>
        <p className="text-gray-600 mt-2">Edit informasi untuk: {tenantName}</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* User Info (Read-only) */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pengguna</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Username</label>
                <p className="mt-1 text-sm text-gray-900">{tenant.user?.username || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{tenant.user?.email || '-'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Informasi pengguna tidak dapat diubah di halaman ini
            </p>
          </div>

          {/* Editable Fields */}
          <div className="px-6 py-6 space-y-6">
            {/* ID Number */}
            <div>
              <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-2">
                {TENANT_FORM_LABELS.id_number}
              </label>
              <input
                type="text"
                id="id_number"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.id_number ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Contoh: 3175082901950001"
                disabled={saving}
              />
              {errors.id_number && <p className="mt-1 text-sm text-red-600">{errors.id_number}</p>}
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                {TENANT_FORM_LABELS.occupation}
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.occupation ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Contoh: Mahasiswa, Karyawan, Wiraswasta"
                disabled={saving}
              />
              {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label
                htmlFor="emergency_contact_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {TENANT_FORM_LABELS.emergency_contact_name}
              </label>
              <input
                type="text"
                id="emergency_contact_name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.emergency_contact_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nama kontak darurat"
                disabled={saving}
              />
              {errors.emergency_contact_name && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name}</p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label
                htmlFor="emergency_contact_phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {TENANT_FORM_LABELS.emergency_contact_phone}
              </label>
              <input
                type="text"
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.emergency_contact_phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Contoh: 081234567890"
                disabled={saving}
              />
              {errors.emergency_contact_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Nomor telepon yang dapat dihubungi dalam keadaan darurat
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              {BUTTON_LABELS.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : BUTTON_LABELS.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTenant;
