import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import { formatPrice } from '../utils/formatters';
import { ROOM_TYPES, BUTTON_LABELS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { isFavorite, toggleFavorite } from '../utils/favoritesUtils';

/**
 * RoomCard Component
 *
 * Displays room information in a card layout.
 * Shows room number, type, floor, price, capacity, and status.
 * Includes action buttons based on user role.
 * Tenants can favorite rooms for quick access.
 *
 * @param {Object} props
 * @param {Object} props.room - Room object with all details
 *
 * @example
 * <RoomCard room={roomObject} />
 */
const RoomCard = ({ room }) => {
  const { isAdmin } = useAuth();
  const [favorited, setFavorited] = useState(false);

  // Check favorite status on mount
  useEffect(() => {
    setFavorited(isFavorite(room.room_number));
  }, [room.room_number]);

  // Handle favorite toggle
  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Prevent card click/navigation
    const newStatus = toggleFavorite(room.room_number);
    setFavorited(newStatus);

    if (newStatus) {
      toast.success(`${room.room_number} ditambahkan ke favorit`);
    } else {
      toast.success(`${room.room_number} dihapus dari favorit`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
        <div className="flex justify-between items-start">
          {/* Room Number */}
          <h3 className="text-2xl font-bold text-gray-800">{room.room_number}</h3>

          <div className="flex items-center gap-2">
            {/* Favorite Button - Tenants Only */}
            {!isAdmin() && (
              <button
                onClick={handleFavoriteClick}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors"
                title={favorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                {favorited ? (
                  <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            )}

            {/* Status Badge */}
            <StatusBadge status={room.status} />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-4">
        {/* Room Type and Floor */}
        <div className="flex items-center text-gray-600 mb-3">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium">
            {ROOM_TYPES[room.room_type]} • Lantai {room.floor}
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-blue-600">
            {formatPrice(room.price)}
            <span className="text-sm font-normal text-gray-500"> /bulan</span>
          </p>
        </div>

        {/* Capacity */}
        <div className="flex items-center text-gray-600 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Kapasitas: {room.capacity} orang</span>
        </div>

        {/* Facilities (if available) */}
        {room.facilities && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 line-clamp-2">
              <span className="font-semibold">Fasilitas:</span> {room.facilities}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer - Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-2">
          {/* View Detail Button - Always visible */}
          <Link
            to={`/rooms/${room.room_number}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
          >
            {BUTTON_LABELS.view}
          </Link>

          {/* Edit Button - Admin only */}
          {isAdmin() && (
            <Link
              to={`/rooms/${room.room_number}/edit`}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {BUTTON_LABELS.edit}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
