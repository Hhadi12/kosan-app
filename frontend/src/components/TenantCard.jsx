/**
 * TenantCard Component
 *
 * Displays tenant information in a card format.
 * Used in TenantList page for grid display.
 */

import { Link } from 'react-router-dom';
import TenantStatusBadge from './TenantStatusBadge';
import { TENANT_BUTTON_LABELS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

const TenantCard = ({ tenant }) => {
  const { isAdmin } = useAuth();

  // Get tenant name from user data
  const tenantName = tenant.user_full_name || tenant.user_username || 'Nama tidak tersedia';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header: Name and Status */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{tenantName}</h3>
            <p className="text-sm text-gray-600 mt-1">{tenant.user_email}</p>
          </div>
          <TenantStatusBadge isActive={tenant.is_active} />
        </div>
      </div>

      {/* Body: Tenant Information */}
      <div className="px-6 py-4 space-y-3">
        {/* Phone */}
        {tenant.user_phone && (
          <div className="flex items-center text-sm">
            <svg
              className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="text-gray-700">{tenant.user_phone}</span>
          </div>
        )}

        {/* Occupation */}
        {tenant.occupation && (
          <div className="flex items-center text-sm">
            <svg
              className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-700">{tenant.occupation}</span>
          </div>
        )}

        {/* Current Room */}
        <div className="flex items-center text-sm">
          <svg
            className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {tenant.current_room_number ? (
            <span className="text-gray-700 font-medium">Kamar {tenant.current_room_number}</span>
          ) : (
            <span className="text-gray-500 italic">Belum ada kamar</span>
          )}
        </div>
      </div>

      {/* Footer: Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between space-x-3">
          <Link
            to={`/penghuni/${tenant.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {TENANT_BUTTON_LABELS.viewDetail}
          </Link>

          {isAdmin() && (
            <Link
              to={`/penghuni/${tenant.id}/edit`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {TENANT_BUTTON_LABELS.editProfile}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantCard;
