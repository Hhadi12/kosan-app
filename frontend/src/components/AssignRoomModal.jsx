/**
 * AssignRoomModal Component
 *
 * Modal dialog for assigning a tenant to a room.
 * Features:
 * - Dropdown of available rooms
 * - Move-in date picker
 * - Monthly rent input (defaults to room price)
 * - Lease end date (optional)
 * - Form validation
 */

import { useState, useEffect } from 'react';
import { getAvailableRooms } from '../api/roomApi';
import { assignRoom } from '../api/tenantApi';
import {
  TENANT_FORM_LABELS,
  TENANT_BUTTON_LABELS,
  TENANT_ERROR_MESSAGES,
  BUTTON_LABELS,
  VALIDATION_MESSAGES,
} from '../utils/constants';
import toast from 'react-hot-toast';

const AssignRoomModal = ({ isOpen, onClose, tenant, onSuccess }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [formData, setFormData] = useState({
    room: '',
    move_in_date: new Date().toISOString().split('T')[0], // Today's date
    lease_end_date: '',
    monthly_rent: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch available rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableRooms();
    }
  }, [isOpen]);

  const fetchAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      const data = await getAvailableRooms();
      setAvailableRooms(data.rooms || []);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error(TENANT_ERROR_MESSAGES.noAvailableRooms);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Update monthly_rent when room is selected
  const handleRoomChange = (e) => {
    const roomNumber = e.target.value;
    setFormData((prev) => ({ ...prev, room: roomNumber }));

    if (roomNumber) {
      const selectedRoom = availableRooms.find((r) => r.room_number === roomNumber);
      if (selectedRoom) {
        setFormData((prev) => ({
          ...prev,
          monthly_rent: selectedRoom.price,
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.room) {
      newErrors.room = VALIDATION_MESSAGES.required(TENANT_FORM_LABELS.select_room);
    }

    if (!formData.move_in_date) {
      newErrors.move_in_date = VALIDATION_MESSAGES.required(TENANT_FORM_LABELS.move_in_date);
    }

    if (!formData.monthly_rent || formData.monthly_rent <= 0) {
      newErrors.monthly_rent = VALIDATION_MESSAGES.required(TENANT_FORM_LABELS.monthly_rent);
    }

    // Validate lease_end_date is after move_in_date (if provided)
    if (formData.lease_end_date && formData.move_in_date) {
      if (new Date(formData.lease_end_date) <= new Date(formData.move_in_date)) {
        newErrors.lease_end_date = 'Tanggal akhir sewa harus setelah tanggal masuk';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API
      const assignmentData = {
        room: formData.room,  // room_number is a string (e.g., "A101")
        move_in_date: formData.move_in_date,
        monthly_rent: parseFloat(formData.monthly_rent),
      };

      // Add lease_end_date if provided
      if (formData.lease_end_date) {
        assignmentData.lease_end_date = formData.lease_end_date;
      }

      await assignRoom(tenant.id, assignmentData);

      toast.success(`Penghuni berhasil ditambahkan ke kamar`);

      // Reset form and close
      setFormData({
        room: '',
        move_in_date: new Date().toISOString().split('T')[0],
        lease_end_date: '',
        monthly_rent: '',
      });
      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning room:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        TENANT_ERROR_MESSAGES.assignRoom;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        room: '',
        move_in_date: new Date().toISOString().split('T')[0],
        lease_end_date: '',
        monthly_rent: '',
      });
      setErrors({});
      onClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {TENANT_BUTTON_LABELS.assignRoom}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                disabled={loading}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {tenant && (
              <p className="mt-2 text-sm text-gray-600">
                Penghuni: <span className="font-medium">{tenant.user?.username}</span>
              </p>
            )}
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Room Selection */}
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  {TENANT_FORM_LABELS.select_room} <span className="text-red-500">*</span>
                </label>
                {loadingRooms ? (
                  <div className="text-sm text-gray-500">Memuat kamar tersedia...</div>
                ) : availableRooms.length === 0 ? (
                  <div className="text-sm text-red-600">{TENANT_ERROR_MESSAGES.noAvailableRooms}</div>
                ) : (
                  <select
                    id="room"
                    name="room"
                    value={formData.room}
                    onChange={handleRoomChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.room ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">-- Pilih Kamar --</option>
                    {availableRooms.map((room) => (
                      <option key={room.room_number} value={room.room_number}>
                        {room.room_number} - {room.room_type} (Rp{' '}
                        {Number(room.price).toLocaleString('id-ID')}/bulan)
                      </option>
                    ))}
                  </select>
                )}
                {errors.room && <p className="mt-1 text-sm text-red-600">{errors.room}</p>}
              </div>

              {/* Move-in Date */}
              <div>
                <label
                  htmlFor="move_in_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {TENANT_FORM_LABELS.move_in_date} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="move_in_date"
                  name="move_in_date"
                  value={formData.move_in_date}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.move_in_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.move_in_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.move_in_date}</p>
                )}
              </div>

              {/* Lease End Date (Optional) */}
              <div>
                <label
                  htmlFor="lease_end_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {TENANT_FORM_LABELS.lease_end_date} <span className="text-gray-400">(Opsional)</span>
                </label>
                <input
                  type="date"
                  id="lease_end_date"
                  name="lease_end_date"
                  value={formData.lease_end_date}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.lease_end_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.lease_end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.lease_end_date}</p>
                )}
              </div>

              {/* Monthly Rent */}
              <div>
                <label
                  htmlFor="monthly_rent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {TENANT_FORM_LABELS.monthly_rent} <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="monthly_rent"
                    name="monthly_rent"
                    value={formData.monthly_rent}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.monthly_rent ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={loading}
                    min="0"
                  />
                </div>
                {errors.monthly_rent && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthly_rent}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Harga akan otomatis terisi saat memilih kamar
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={loading}
              >
                {BUTTON_LABELS.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || loadingRooms || availableRooms.length === 0}
              >
                {loading ? 'Menyimpan...' : TENANT_BUTTON_LABELS.assignRoom}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignRoomModal;
