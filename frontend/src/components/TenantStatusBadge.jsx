/**
 * TenantStatusBadge Component
 *
 * Displays tenant status as a colored badge.
 * Similar pattern to StatusBadge for rooms.
 */

import { TENANT_STATUS } from '../utils/constants';

const TenantStatusBadge = ({ isActive }) => {
  const status = isActive ? 'active' : 'inactive';
  const config = TENANT_STATUS[status];

  if (!config) {
    return <span className="text-sm text-gray-500">-</span>;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.label}
    </span>
  );
};

export default TenantStatusBadge;
