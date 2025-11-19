import React from 'react';

/**
 * ComplaintStats Component
 *
 * Displays complaint statistics cards on dashboard.
 * Admin only.
 *
 * @param {Object} stats - Statistics object from API
 * @param {Function} onStatClick - Callback when stat card is clicked
 */
const ComplaintStats = ({ stats, onStatClick }) => {
  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Keluhan',
      value: stats.total_complaints || 0,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      filter: null,
    },
    {
      label: 'Baru',
      value: stats.open_complaints || 0,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      filter: 'open',
    },
    {
      label: 'Dalam Proses',
      value: stats.in_progress_complaints || 0,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      filter: 'in_progress',
    },
    {
      label: 'Selesai',
      value: stats.resolved_complaints || 0,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      filter: 'resolved',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          onClick={() => onStatClick && onStatClick(card.filter)}
          className={`${card.bgColor} border-2 ${card.borderColor} rounded-lg p-6 ${
            onStatClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintStats;
