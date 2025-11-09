import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { getRoomById, deleteRoom } from '../api/roomApi';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import {
  ROOM_TYPES,
  FORM_LABELS,
  BUTTON_LABELS,
  PAGE_TITLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
} from '../utils/constants';

/**
 * RoomDetail Page
 *
 * Displays detailed information about a specific room.
 * Admins can edit or delete the room from this page.
 */
const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // State management
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch room data
  const fetchRoom = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getRoomById(id);
      setRoom(data);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError(ERROR_MESSAGES.roomNotFound);
    } finally {
      setLoading(false);
    }
  };

  // Fetch room when component mounts
  useEffect(() => {
    fetchRoom();
  }, [id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showDeleteModal) {
        setShowDeleteModal(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showDeleteModal]);

  // Handle delete room
  const handleDelete = async () => {
    if (room.status === 'occupied') {
      toast.error('Tidak dapat menghapus kamar yang sedang terisi!');
      return;
    }

    setDeleting(true);

    try {
      await deleteRoom(id);
      toast.success(SUCCESS_MESSAGES.roomDeleted);
      navigate('/rooms');
    } catch (err) {
      console.error('Error deleting room:', err);
      const errorMsg =
        err.response?.data?.error || ERROR_MESSAGES.deleteRoom;
      toast.error(errorMsg);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{LOADING_MESSAGES.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Kamar yang Anda cari tidak ditemukan atau telah dihapus</p>
          <Link
            to="/rooms"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            {BUTTON_LABELS.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <Link
            to="/rooms"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {BUTTON_LABELS.back}
          </Link>

          {/* Room Number and Status */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{room.room_number}</h1>
              <p className="mt-1 text-sm text-gray-500">{PAGE_TITLES.roomDetail}</p>
            </div>
            <StatusBadge status={room.status} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Dasar</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {FORM_LABELS.room_type}
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {ROOM_TYPES[room.room_type]}
              </p>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {FORM_LABELS.floor}
              </label>
              <p className="text-lg font-semibold text-gray-900">Lantai {room.floor}</p>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {FORM_LABELS.capacity}
              </label>
              <p className="text-lg font-semibold text-gray-900">{room.capacity} orang</p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {FORM_LABELS.price}
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(room.price)}
                <span className="text-sm font-normal text-gray-500"> /bulan</span>
              </p>
            </div>
          </div>
        </div>

        {/* Facilities Card */}
        {room.facilities && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {FORM_LABELS.facilities}
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{room.facilities}</p>
          </div>
        )}

        {/* Description Card */}
        {room.description && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {FORM_LABELS.description}
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{room.description}</p>
          </div>
        )}

        {/* System Information Card */}
        <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Sistem</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Dibuat pada
              </label>
              <p className="text-gray-900">{formatDate(room.created_at)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Terakhir diperbarui
              </label>
              <p className="text-gray-900">{formatDate(room.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Admin Only */}
        {isAdmin() && (
          <div className="flex gap-4">
            <Link
              to={`/rooms/${room.id}/edit`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors duration-200"
            >
              {BUTTON_LABELS.edit} Kamar
            </Link>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {BUTTON_LABELS.delete} Kamar
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mb-4">
                  Apakah Anda yakin ingin menghapus kamar <strong>{room.room_number}</strong>?
                </p>
                {room.status === 'occupied' && (
                  <p className="text-red-600 font-medium mb-4">
                    ⚠️ Kamar ini sedang terisi dan tidak dapat dihapus!
                  </p>
                )}
                <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg"
                  disabled={deleting}
                >
                  {BUTTON_LABELS.cancel}
                </button>
                <button
                  onClick={handleDelete}
                  className={`flex-1 font-medium py-2 px-4 rounded-lg ${
                    room.status === 'occupied'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  disabled={deleting || room.status === 'occupied'}
                >
                  {deleting ? LOADING_MESSAGES.deleting : BUTTON_LABELS.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;
