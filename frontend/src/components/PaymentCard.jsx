import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRupiah, formatDate } from '../utils/formatters';
import PaymentStatusBadge from './PaymentStatusBadge';
import { MONTH_NAMES } from '../utils/constants';

/**
 * PaymentCard Component
 *
 * Displays payment information in a card format
 * Shows: tenant, room, amount, period, status, dates
 * Clickable - navigates to payment detail page
 *
 * @param {object} payment - Payment object from API
 */
const PaymentCard = ({ payment }) => {
  const navigate = useNavigate();

  // Format period display (e.g., "November 2025")
  const periodDisplay = `${MONTH_NAMES[payment.payment_period_month - 1]} ${payment.payment_period_year}`;

  // Handle card click
  const handleClick = () => {
    navigate(`/pembayaran/${payment.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 overflow-hidden"
    >
      {/* Header - Status and Amount */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <PaymentStatusBadge status={payment.status} isOverdue={payment.is_overdue} />
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatRupiah(payment.amount)}</p>
            {payment.is_overdue && (
              <p className="text-xs text-red-600 mt-1">Terlambat</p>
            )}
          </div>
        </div>
      </div>

      {/* Body - Payment Info */}
      <div className="px-6 py-4">
        {/* Period */}
        <div className="mb-3">
          <p className="text-lg font-semibold text-gray-900">{periodDisplay}</p>
        </div>

        {/* Tenant and Room */}
        <div className="mb-3">
          <p className="text-gray-700 font-medium">{payment.tenant_name}</p>
          <p className="text-sm text-gray-500">Kamar {payment.room_number}</p>
        </div>

        {/* Dates */}
        <div className="space-y-1">
          {/* Due Date */}
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-28">Jatuh Tempo:</span>
            <span className="text-gray-700 font-medium">{formatDate(payment.due_date)}</span>
          </div>

          {/* Payment Date (if paid) */}
          {payment.payment_date && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-28">Dibayar:</span>
              <span className="text-green-600 font-medium">{formatDate(payment.payment_date)}</span>
            </div>
          )}
        </div>

        {/* Payment Method (if available) */}
        {payment.payment_method && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Metode: <span className="text-gray-700 font-medium">{payment.payment_method}</span>
            </p>
          </div>
        )}
      </div>

      {/* Footer - View Detail Link */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
          Lihat Detail →
        </button>
      </div>
    </div>
  );
};

export default PaymentCard;
