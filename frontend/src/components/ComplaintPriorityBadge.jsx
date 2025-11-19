import React from 'react';
import { COMPLAINT_PRIORITY } from '../utils/constants';

/**
 * ComplaintPriorityBadge Component
 *
 * Displays colored badge for complaint priority.
 *
 * @param {string} priority - Priority value (low, medium, high, urgent)
 */
const ComplaintPriorityBadge = ({ priority }) => {
  const priorityConfig = COMPLAINT_PRIORITY[priority];

  if (!priorityConfig) {
    return <span className="text-gray-500">-</span>;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.textColor}`}
    >
      {priorityConfig.label}
    </span>
  );
};

export default ComplaintPriorityBadge;
