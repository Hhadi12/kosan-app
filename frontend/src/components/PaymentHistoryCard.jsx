import React from 'react';
import { formatRupiah } from '../utils/formatters';
import { HISTORY_LABELS, HISTORY_STATUS_COLORS } from '../utils/constants';

/**
 * PaymentHistoryCard Component
 *
 * Displays a summary of payment history for the last 12 months.
 * Shows statistics (on-time, late, unpaid) and a scrollable list of payments.
 *
 * @param {Object} summary - Payment summary with counts
 * @param {Array} history - Array of payment history items
 */
const PaymentHistoryCard = ({ summary, history }) => {
  /**
   * Get status color class based on payment status and late flag
   */
  const getStatusColor = (status, isLate) => {
    if (status === 'paid' && !isLate) return HISTORY_STATUS_COLORS.on_time.text;
    if (status === 'paid' && isLate) return HISTORY_STATUS_COLORS.late.text;
    if (status === 'pending') return HISTORY_STATUS_COLORS.unpaid.text;
    return 'text-gray-600';
  };

  /**
   * Get Indonesian status label
   */
  const getStatusLabel = (status, isLate) => {
    if (status === 'paid' && !isLate) return HISTORY_LABELS.ON_TIME;
    if (status === 'paid' && isLate) return HISTORY_LABELS.LATE;
    if (status === 'pending') return HISTORY_LABELS.UNPAID;
    return status;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{HISTORY_LABELS.PAYMENT_HISTORY}</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={`text-center p-3 ${HISTORY_STATUS_COLORS.on_time.bg} rounded-lg`}>
          <div className={`text-2xl font-bold ${HISTORY_STATUS_COLORS.on_time.text}`}>
            {summary?.on_time || 0}
          </div>
          <div className="text-sm text-gray-600">{HISTORY_LABELS.ON_TIME}</div>
        </div>
        <div className={`text-center p-3 ${HISTORY_STATUS_COLORS.late.bg} rounded-lg`}>
          <div className={`text-2xl font-bold ${HISTORY_STATUS_COLORS.late.text}`}>
            {summary?.late || 0}
          </div>
          <div className="text-sm text-gray-600">{HISTORY_LABELS.LATE}</div>
        </div>
        <div className={`text-center p-3 ${HISTORY_STATUS_COLORS.unpaid.bg} rounded-lg`}>
          <div className={`text-2xl font-bold ${HISTORY_STATUS_COLORS.unpaid.text}`}>
            {summary?.unpaid || 0}
          </div>
          <div className="text-sm text-gray-600">{HISTORY_LABELS.UNPAID}</div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history && history.length > 0 ? (
          history.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {item.month_name} {item.year}
                </div>
                <div className="text-sm text-gray-500">
                  {formatRupiah(item.amount)}
                </div>
              </div>
              <div className={`font-medium ${getStatusColor(item.status, item.is_late)}`}>
                {getStatusLabel(item.status, item.is_late)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            {HISTORY_LABELS.NO_PAYMENT_HISTORY}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryCard;
