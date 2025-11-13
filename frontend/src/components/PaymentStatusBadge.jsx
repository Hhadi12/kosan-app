import React from 'react';
import { PAYMENT_STATUS } from '../utils/constants';

/**
 * PaymentStatusBadge Component
 *
 * Displays color-coded payment status badge
 * Handles overdue status display (pending + is_overdue = red badge)
 *
 * @param {string} status - Payment status (paid, pending, overdue, cancelled)
 * @param {boolean} isOverdue - Whether payment is overdue (from backend)
 */
const PaymentStatusBadge = ({ status, isOverdue }) => {
  // Determine which status config to use
  // If status is pending but is_overdue flag is true, show overdue style
  let statusKey = status;
  if (status === 'pending' && isOverdue) {
    statusKey = 'overdue';
  }

  // Get status configuration (label and colors)
  const statusConfig = PAYMENT_STATUS[statusKey] || PAYMENT_STATUS.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
    >
      {statusConfig.label}
    </span>
  );
};

export default PaymentStatusBadge;
