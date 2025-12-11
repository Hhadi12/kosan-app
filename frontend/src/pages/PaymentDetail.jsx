import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import {
  getPaymentById,
  markAsPaid,
  deletePayment,
  uploadProof,
  downloadReceipt,
} from '../api/paymentApi';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  PAYMENT_PAGE_TITLES,
  PAYMENT_BUTTON_LABELS,
  PAYMENT_FORM_LABELS,
  PAYMENT_ERROR_MESSAGES,
  PAYMENT_SUCCESS_MESSAGES,
  PAYMENT_CONFIRM_MESSAGES,
  PAYMENT_LOADING_MESSAGES,
  PAYMENT_METHODS,
  MONTH_NAMES,
  BANK_ACCOUNT,
} from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * PaymentDetail Page
 *
 * Detailed view of a single payment
 * Shows all payment information and action buttons
 * Admin: Can mark as paid, upload proof, delete, download receipt
 * Tenant: Can view own payments, upload proof, download receipt
 */
const PaymentDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch payment detail
  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const data = await getPaymentById(id);
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment:', error);
      toast.error(PAYMENT_ERROR_MESSAGES.fetchPayment);
      navigate('/pembayaran');
    } finally {
      setLoading(false);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (!isAdmin()) return;

    const confirmed = window.confirm(
      PAYMENT_CONFIRM_MESSAGES.markAsPaid(
        payment.tenant_name,
        formatRupiah(payment.amount)
      )
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await markAsPaid(id, {
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
      });
      toast.success(PAYMENT_SUCCESS_MESSAGES.markedAsPaid);
      fetchPayment(); // Refresh data
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error(PAYMENT_ERROR_MESSAGES.markPaidFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!isAdmin()) return;

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await deletePayment(id);
      toast.success(PAYMENT_SUCCESS_MESSAGES.paymentDeleted);
      navigate('/pembayaran');
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error(PAYMENT_ERROR_MESSAGES.deletePayment);
      setActionLoading(false);
    }
  };

  // Handle file upload
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(PAYMENT_ERROR_MESSAGES.fileTooLarge);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error(PAYMENT_ERROR_MESSAGES.invalidFileType);
      return;
    }

    try {
      setActionLoading(true);
      await uploadProof(id, file);
      toast.success(PAYMENT_SUCCESS_MESSAGES.proofUploaded);
      fetchPayment(); // Refresh to show uploaded proof
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast.error(PAYMENT_ERROR_MESSAGES.uploadFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle download receipt
  const handleDownloadReceipt = async () => {
    if (payment.status !== 'paid') {
      toast.error('Kwitansi hanya tersedia untuk pembayaran yang sudah lunas');
      return;
    }

    try {
      setActionLoading(true);
      const periodDisplay = `${MONTH_NAMES[payment.payment_period_month - 1]}_${
        payment.payment_period_year
      }`;
      await downloadReceipt(id, payment.tenant_name, periodDisplay);
      toast.success(PAYMENT_SUCCESS_MESSAGES.receiptDownloaded);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error(PAYMENT_ERROR_MESSAGES.downloadFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{PAYMENT_LOADING_MESSAGES.loadingPayments}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const periodDisplay = `${MONTH_NAMES[payment.payment_period_month - 1]} ${
    payment.payment_period_year
  }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Kembali
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {PAYMENT_PAGE_TITLES.paymentDetail}
              </h1>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {formatRupiah(payment.amount)}
              </p>
            </div>
            <PaymentStatusBadge status={payment.status} isOverdue={payment.is_overdue} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Pembayaran
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{PAYMENT_FORM_LABELS.period}:</span>
                  <span className="font-medium text-gray-900">{periodDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{PAYMENT_FORM_LABELS.amount}:</span>
                  <span className="font-medium text-gray-900">
                    {formatRupiah(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{PAYMENT_FORM_LABELS.due_date}:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(payment.due_date)}
                  </span>
                </div>
                {payment.payment_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{PAYMENT_FORM_LABELS.payment_date}:</span>
                    <span className="font-medium text-green-600">
                      {formatDate(payment.payment_date)}
                    </span>
                  </div>
                )}
                {payment.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {PAYMENT_FORM_LABELS.payment_method}:
                    </span>
                    <span className="font-medium text-gray-900">
                      {PAYMENT_METHODS[payment.payment_method] || payment.payment_method}
                    </span>
                  </div>
                )}
                {payment.payment_reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {PAYMENT_FORM_LABELS.payment_reference}:
                    </span>
                    <span className="font-medium text-gray-900">
                      {payment.payment_reference}
                    </span>
                  </div>
                )}
                {payment.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600">{PAYMENT_FORM_LABELS.notes}:</span>
                    <p className="mt-1 text-gray-900">{payment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tenant Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Penghuni & Kamar
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nama Penghuni:</span>
                  <Link
                    to={`/penghuni/${payment.tenant}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {payment.tenant_name} →
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nomor Kamar:</span>
                  <Link
                    to={`/rooms/${payment.room_number}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {payment.room_number} →
                  </Link>
                </div>
                {payment.tenant_info && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">
                        {payment.tenant_info.email}
                      </span>
                    </div>
                    {payment.tenant_info.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telepon:</span>
                        <span className="font-medium text-gray-900">
                          {payment.tenant_info.phone}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bank Information */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Informasi Rekening Transfer
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Bank:</span>
                  <span className="font-medium text-blue-900">
                    {payment.bank_name || BANK_ACCOUNT.bank_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Nama Pemilik:</span>
                  <span className="font-medium text-blue-900">
                    {payment.bank_account_name || BANK_ACCOUNT.account_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Nomor Rekening:</span>
                  <span className="font-bold text-blue-900">
                    {payment.bank_account_number || BANK_ACCOUNT.account_number}
                  </span>
                </div>
              </div>
            </div>

            {/* Proof of Payment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {PAYMENT_FORM_LABELS.proof_of_payment}
              </h2>
              {payment.proof_of_payment_url ? (
                <div>
                  <a
                    href={payment.proof_of_payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Lihat Bukti Pembayaran →
                  </a>
                  <p className="mt-2 text-sm text-gray-500">
                    Klik untuk membuka bukti pembayaran di tab baru
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Belum ada bukti pembayaran</p>
              )}

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={actionLoading}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? PAYMENT_LOADING_MESSAGES.uploadingProof
                  : PAYMENT_BUTTON_LABELS.uploadProof}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Format: JPG, PNG, PDF. Maksimal 5MB
              </p>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            {/* Download Receipt Button */}
            {payment.status === 'paid' && (
              <button
                onClick={handleDownloadReceipt}
                disabled={actionLoading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {actionLoading
                  ? PAYMENT_LOADING_MESSAGES.downloadingReceipt
                  : PAYMENT_BUTTON_LABELS.downloadReceipt}
              </button>
            )}

            {/* Admin Actions */}
            {isAdmin() && (
              <>
                {/* Mark as Paid (if pending) */}
                {payment.status === 'pending' && (
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={actionLoading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {actionLoading
                      ? PAYMENT_LOADING_MESSAGES.markingPaid
                      : PAYMENT_BUTTON_LABELS.markAsPaid}
                  </button>
                )}

                {/* Delete Button (if not paid) */}
                {payment.status !== 'paid' && (
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    Hapus Pembayaran
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 mb-6">
                {PAYMENT_CONFIRM_MESSAGES.deletePayment(periodDisplay)}
              </p>
              <p className="text-sm text-red-600 mb-6">
                {PAYMENT_CONFIRM_MESSAGES.deleteWarning}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {actionLoading ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetail;
