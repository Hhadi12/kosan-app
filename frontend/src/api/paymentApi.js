import api from './axios';

/**
 * Payment API Functions
 * Handles all payment-related API calls
 */

// 1. Get all payments with filters
export const getAllPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to query params
    if (filters.status) params.append('status', filters.status);
    if (filters.tenant) params.append('tenant', filters.tenant);
    if (filters.payment_period_month) params.append('payment_period_month', filters.payment_period_month);
    if (filters.payment_period_year) params.append('payment_period_year', filters.payment_period_year);
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);
    if (filters.page) params.append('page', filters.page);

    const queryString = params.toString();
    const url = queryString ? `/payments/?${queryString}` : '/payments/';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// 2. Get payment by ID
export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/payments/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// 3. Create new payment (admin only)
export const createPayment = async (data) => {
  try {
    const response = await api.post('/payments/create/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// 4. Update payment (admin only)
export const updatePayment = async (id, data) => {
  try {
    const response = await api.patch(`/payments/${id}/update/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// 5. Delete payment (admin only)
export const deletePayment = async (id) => {
  try {
    await api.delete(`/payments/${id}/delete/`);
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// 6. Mark payment as paid (admin only)
export const markAsPaid = async (id, data) => {
  try {
    const response = await api.post(`/payments/${id}/mark-paid/`, data);
    return response.data;
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    throw error;
  }
};

// 7. Get payments by tenant
export const getPaymentsByTenant = async (tenantId, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.payment_period_year) params.append('payment_period_year', filters.payment_period_year);
    if (filters.ordering) params.append('ordering', filters.ordering);

    const queryString = params.toString();
    const url = queryString
      ? `/payments/tenant/${tenantId}/?${queryString}`
      : `/payments/tenant/${tenantId}/`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    throw error;
  }
};

// 8. Upload proof of payment
export const uploadProof = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('proof_of_payment', file);

    const response = await api.post(`/payments/${id}/upload-proof/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading proof:', error);
    throw error;
  }
};

// 9. Download receipt PDF
export const downloadReceipt = async (id, tenantName, period) => {
  try {
    const response = await api.get(`/payments/${id}/receipt/`, {
      responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Create filename
    const filename = `kwitansi_${period}_${tenantName}.pdf`.toLowerCase().replace(/\s+/g, '_');
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

// 10. Get payment statistics (admin only)
export const getPaymentStats = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.year) params.append('year', filters.year);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const queryString = params.toString();
    const url = queryString ? `/payments/statistics/?${queryString}` : '/payments/statistics/';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
};

// 11. Generate monthly payments (admin only)
export const generateMonthlyPayments = async (data) => {
  try {
    const response = await api.post('/payments/generate-monthly/', data);
    return response.data;
  } catch (error) {
    console.error('Error generating monthly payments:', error);
    throw error;
  }
};

// 12. Export payments (admin only)
export const exportPayments = async (format = 'csv', filters = {}) => {
  try {
    const params = new URLSearchParams({ ...filters, format });

    const response = await api.get(`/payments/export/?${params.toString()}`, {
      responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Create filename
    const extension = format === 'csv' ? 'csv' : 'pdf';
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `pembayaran_export_${timestamp}.${extension}`);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting payments:', error);
    throw error;
  }
};
