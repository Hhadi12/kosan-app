import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createPayment } from '../api/paymentApi';
import { getAllTenants } from '../api/tenantApi';
import {
  PAYMENT_PAGE_TITLES,
  PAYMENT_FORM_LABELS,
  PAYMENT_SUCCESS_MESSAGES,
  PAYMENT_ERROR_MESSAGES,
  PAYMENT_LOADING_MESSAGES,
  MONTH_OPTIONS,
  BUTTON_LABELS,
} from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * CreatePayment Page (Admin Only)
 *
 * Form to create new payment manually
 * Auto-fills amount from tenant's current room assignment
 */
const CreatePayment = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    tenant: '',
    payment_period_month: '',
    payment_period_year: new Date().getFullYear(),
    amount: '',
    due_date: '',
    notes: '',
  });

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTenants, setFetchingTenants] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch active tenants with room assignments
  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setFetchingTenants(true);
      const data = await getAllTenants({ has_assignment: true });
      setTenants(data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Gagal memuat data penghuni');
    } finally {
      setFetchingTenants(false);
    }
  };

  // Handle tenant selection - auto-fill amount
  const handleTenantChange = (tenantId) => {
    setFormData({ ...formData, tenant: tenantId });

    if (!tenantId) {
      setSelectedTenant(null);
      return;
    }

    const tenant = tenants.find((t) => t.id === parseInt(tenantId));
    setSelectedTenant(tenant);

    // Auto-fill amount from current assignment
    if (tenant?.current_assignment?.monthly_rent) {
      setFormData((prev) => ({
        ...prev,
        tenant: tenantId,
        amount: tenant.current_assignment.monthly_rent,
      }));
    }
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Auto-calculate due date (5th of the month)
  useEffect(() => {
    if (formData.payment_period_month && formData.payment_period_year) {
      const dueDate = new Date(
        formData.payment_period_year,
        formData.payment_period_month - 1,
        5
      );
      const dueDateString = dueDate.toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, due_date: dueDateString }));
    }
  }, [formData.payment_period_month, formData.payment_period_year]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenant) newErrors.tenant = 'Pilih penghuni';
    if (!formData.payment_period_month) newErrors.payment_period_month = 'Pilih bulan';
    if (!formData.payment_period_year) newErrors.payment_period_year = 'Masukkan tahun';
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = 'Jumlah harus lebih dari 0';
    if (!formData.due_date) newErrors.due_date = 'Pilih tanggal jatuh tempo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      setLoading(true);

      // Get assignment ID from selected tenant
      const assignmentId = selectedTenant?.current_assignment?.id;

      const paymentData = {
        tenant: parseInt(formData.tenant),
        assignment: assignmentId || null,
        payment_period_month: parseInt(formData.payment_period_month),
        payment_period_year: parseInt(formData.payment_period_year),
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        notes: formData.notes,
      };

      const newPayment = await createPayment(paymentData);
      toast.success(PAYMENT_SUCCESS_MESSAGES.paymentCreated);
      navigate(`/pembayaran/${newPayment.id}`);
    } catch (error) {
      console.error('Error creating payment:', error);

      // Handle specific error messages
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.response?.status === 400) {
        toast.error(PAYMENT_ERROR_MESSAGES.duplicatePeriod);
      } else {
        toast.error(PAYMENT_ERROR_MESSAGES.createPayment);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← {BUTTON_LABELS.back}
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {PAYMENT_PAGE_TITLES.createPayment}
          </h1>
          <p className="mt-2 text-gray-600">
            Buat pembayaran baru untuk penghuni yang memiliki kamar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {fetchingTenants ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data penghuni...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tenant Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {PAYMENT_FORM_LABELS.tenant} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tenant}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih Penghuni</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.user_full_name || tenant.user_email} - Kamar{' '}
                      {tenant.current_room_number || 'N/A'}
                    </option>
                  ))}
                </select>
                {errors.tenant && <p className="mt-1 text-sm text-red-500">{errors.tenant}</p>}
              </div>

              {/* Room Info (read-only) */}
              {selectedTenant && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">Informasi Kamar</p>
                  <div className="mt-2 space-y-1 text-sm text-blue-800">
                    <p>
                      Kamar: <span className="font-semibold">{selectedTenant.current_assignment?.room_number}</span>
                    </p>
                    <p>
                      Sewa Bulanan:{' '}
                      <span className="font-semibold">
                        Rp {parseFloat(selectedTenant.current_assignment?.monthly_rent || 0).toLocaleString('id-ID')}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Period */}
              <div className="grid grid-cols-2 gap-4">
                {/* Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {PAYMENT_FORM_LABELS.payment_period_month}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.payment_period_month}
                    onChange={(e) => handleChange('payment_period_month', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.payment_period_month ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Bulan</option>
                    {MONTH_OPTIONS.slice(1).map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  {errors.payment_period_month && (
                    <p className="mt-1 text-sm text-red-500">{errors.payment_period_month}</p>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {PAYMENT_FORM_LABELS.payment_period_year}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.payment_period_year}
                    onChange={(e) => handleChange('payment_period_year', e.target.value)}
                    min="2020"
                    max="2030"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.payment_period_year ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.payment_period_year && (
                    <p className="mt-1 text-sm text-red-500">{errors.payment_period_year}</p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {PAYMENT_FORM_LABELS.amount} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  min="0"
                  step="1000"
                  placeholder="Masukkan jumlah pembayaran"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                <p className="mt-1 text-xs text-gray-500">Otomatis terisi dari sewa bulanan kamar</p>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {PAYMENT_FORM_LABELS.due_date} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.due_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Default: Tanggal 5 di bulan periode pembayaran
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {PAYMENT_FORM_LABELS.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows="3"
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
                >
                  {BUTTON_LABELS.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? PAYMENT_LOADING_MESSAGES.creatingPayment : BUTTON_LABELS.save}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePayment;
