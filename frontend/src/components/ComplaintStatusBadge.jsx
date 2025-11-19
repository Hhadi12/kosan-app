import React from 'react';
import { COMPLAINT_STATUS } from '../utils/constants';

/**
 * ComplaintStatusBadge Component
 *
 * Displays colored badge for complaint status.
 *
 * @param {string} status - Status value (open, in_progress, resolved, closed)
 */
const ComplaintStatusBadge = ({ status }) => {
  const statusConfig = COMPLAINT_STATUS[status];

  if (!statusConfig) {
    return <span className="text-gray-500">-</span>;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
    >
      {statusConfig.label}
    </span>
  );
};

export default ComplaintStatusBadge;
