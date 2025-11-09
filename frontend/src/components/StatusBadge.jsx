import React from 'react';
import { ROOM_STATUS } from '../utils/constants';

/**
 * StatusBadge Component
 *
 * Displays a colored badge showing the room status.
 * Colors change based on status: green (available), red (occupied), yellow (maintenance)
 *
 * @param {Object} props
 * @param {string} props.status - Room status (available, occupied, maintenance)
 *
 * @example
 * <StatusBadge status="available" />
 * <StatusBadge status="occupied" />
 */
const StatusBadge = ({ status }) => {
  // Get status configuration from constants
  const statusConfig = ROOM_STATUS[status] || ROOM_STATUS.available;

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${statusConfig.bgColor}
        ${statusConfig.textColor}
        border ${statusConfig.borderColor}
      `}
    >
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;
