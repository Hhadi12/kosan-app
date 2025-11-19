import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintStatusBadge from './ComplaintStatusBadge';
import ComplaintPriorityBadge from './ComplaintPriorityBadge';
import { COMPLAINT_CATEGORIES } from '../utils/constants';
import { formatDate } from '../utils/formatters';

/**
 * ComplaintCard Component
 *
 * Displays complaint summary in a card.
 * Clickable to navigate to complaint detail.
 *
 * @param {Object} complaint - Complaint object
 */
const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

  const category = COMPLAINT_CATEGORIES[complaint.category];

  return (
    <div
      onClick={() => navigate(`/keluhan/${complaint.id}`)}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{category?.icon || '📝'}</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{complaint.title}</h3>
            <p className="text-sm text-gray-500">{category?.label || complaint.category}</p>
          </div>
        </div>
        <ComplaintPriorityBadge priority={complaint.priority} />
      </div>

      {/* Description Preview */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {complaint.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="space-y-1">
          <div className="flex items-center text-gray-600">
            <span className="font-medium">Penghuni:</span>
            <span className="ml-2">{complaint.tenant_name}</span>
          </div>
          {complaint.room_number && (
            <div className="flex items-center text-gray-600">
              <span className="font-medium">Kamar:</span>
              <span className="ml-2">{complaint.room_number}</span>
            </div>
          )}
          <div className="flex items-center text-gray-500">
            <span>{formatDate(complaint.created_at)}</span>
            {complaint.comment_count > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>💬 {complaint.comment_count} komentar</span>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <ComplaintStatusBadge status={complaint.status} />
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
