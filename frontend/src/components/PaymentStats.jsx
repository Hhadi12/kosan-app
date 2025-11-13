import React from 'react';
import { formatRupiah } from '../utils/formatters';
import { PAYMENT_STATS_LABELS } from '../utils/constants';

/**
 * PaymentStats Component
 *
 * Displays payment statistics in card format
 * Shows: total, paid, pending, overdue counts and amounts
 * Cards are clickable to filter payment list
 *
 * @param {object} stats - Statistics object from API
 * @param {function} onStatClick - Handler for stat card click
 */
const PaymentStats = ({ stats, onStatClick }) => {
  if (!stats) return null;

  // Define stat cards configuration
  const statCards = [
    {
      id: 'total',
      title: PAYMENT_STATS_LABELS.totalPayments,
      count: stats.total_payments || 0,
      amount: stats.total_amount || 0,
      icon: '💰',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      id: 'paid',
      title: PAYMENT_STATS_LABELS.paidPayments,
      count: stats.paid_count || 0,
      amount: stats.paid_amount || 0,
      icon: '✓',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      id: 'pending',
      title: PAYMENT_STATS_LABELS.pendingPayments,
      count: stats.pending_count || 0,
      amount: stats.pending_amount || 0,
      icon: '⏳',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      id: 'overdue',
      title: PAYMENT_STATS_LABELS.overduePayments,
      count: stats.overdue_count || 0,
      amount: stats.overdue_amount || 0,
      icon: '⚠',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card) => (
        <div
          key={card.id}
          onClick={() => onStatClick && onStatClick(card.id)}
          className={`${card.bgColor} border-2 ${card.borderColor} rounded-lg p-6 ${
            onStatClick ? 'cursor-pointer hover:shadow-lg' : ''
          } transition-shadow`}
        >
          {/* Icon and Title */}
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${card.textColor}`}>{card.title}</h3>
            <span className="text-2xl">{card.icon}</span>
          </div>

          {/* Count */}
          <div className={`text-3xl font-bold ${card.textColor} mb-2`}>{card.count}</div>

          {/* Amount */}
          <div className="text-sm text-gray-600">{formatRupiah(card.amount)}</div>
        </div>
      ))}
    </div>
  );
};

export default PaymentStats;
