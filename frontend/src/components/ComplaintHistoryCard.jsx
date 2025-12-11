import React from 'react';
import { COMPLAINT_CATEGORIES, HISTORY_LABELS, HISTORY_STATUS_COLORS } from '../utils/constants';

/**
 * ComplaintHistoryCard Component
 *
 * Displays a summary of complaint history for the last 12 months.
 * Shows total count, category breakdown, and monthly complaint list.
 *
 * @param {Object} summary - Complaint summary with total and category counts
 * @param {Array} history - Array of monthly complaint data
 */
const ComplaintHistoryCard = ({ summary, history }) => {
  /**
   * Get Indonesian category label from constants
   */
  const getCategoryLabel = (category) => {
    return COMPLAINT_CATEGORIES?.[category]?.label || category;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{HISTORY_LABELS.COMPLAINT_HISTORY}</h3>

      {/* Summary */}
      <div className="mb-6">
        <div className={`text-center p-4 ${HISTORY_STATUS_COLORS.complaint.bg} rounded-lg mb-4`}>
          <div className={`text-3xl font-bold ${HISTORY_STATUS_COLORS.complaint.text}`}>
            {summary?.total || 0}
          </div>
          <div className="text-sm text-gray-600">
            {HISTORY_LABELS.TOTAL_COMPLAINTS} {HISTORY_LABELS.LAST_12_MONTHS}
          </div>
        </div>

        {/* Category breakdown */}
        {summary?.by_category && Object.keys(summary.by_category).length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(summary.by_category).map(([cat, count]) => (
              <div key={cat} className="text-sm p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-600">{getCategoryLabel(cat)}:</span>
                <span className="font-medium ml-1">{count}</span>
              </div>
            ))}
          </div>
        )}
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
                  {item.categories.map(c => getCategoryLabel(c)).join(', ')}
                </div>
              </div>
              <div className={`text-lg font-bold ${HISTORY_STATUS_COLORS.complaint.text}`}>
                {item.count}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            {HISTORY_LABELS.NO_COMPLAINT_HISTORY}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintHistoryCard;
