import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getRoomById, updateRoom } from '../api/roomApi';
import {
  PAGE_TITLES,
  BUTTON_LABELS,
  FORM_LABELS,
  ROOM_TYPE_OPTIONS,
  ROOM_STATUS_OPTIONS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  INFO_MESSAGES,
  LOADING_MESSAGES,
} from '../utils/constants';

/**
 * EditRoom Page
 *
 * Form page for editing an existing room (Admin only).
 * Pre-fills form with current room data.
 */
const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'single',
    floor: 1,
    capacity: 1,
    price: '',
    status: 'available',
    facilities: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch room data and populate form
  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getRoomById(id);
        setFormData({
          room_number: data.room_number,
          room_type: data.room_type,
          floor: data.floor,
          capacity: data.capacity,
          price: data.price,
          status: data.status,
          facilities: data.facilities || '',
          description: data.description || '',
        });
      } catch (err) {
        console.error('Error fetching room:', err);
        setError(ERROR_MESSAGES.fetchRoom);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-adjust capacity when room_type changes
    if (name === 'room_type') {
      let defaultCapacity = formData.capacity;
      if (value === 'single') defaultCapacity = 1;
      else if (value === 'double' && formData.capacity > 2) defaultCapacity = 2;

      setFormData({
        ...formData,
        [name]: value,
        capacity: defaultCapacity,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  // Validate form
  const validateForm = () => {
    // Required fields
    if (!formData.room_number.trim()) {
      setError(VALIDATION_MESSAGES.required(FORM_LABELS.room_number));
      return false;
    }

    if (!formData.price || formData.price <= 0) {
      setError(VALIDATION_MESSAGES.positive(FORM_LABELS.price));
      return false;
    }

    if (formData.floor < 1) {
      setError(VALIDATION_MESSAGES.minFloor);
      return false;
    }

    if (formData.capacity < 1 || formData.capacity > 10) {
      setError(VALIDATION_MESSAGES.capacityRange);
      return false;
    }

    // Capacity validation based on room type
    if (formData.room_type === 'single' && formData.capacity > 1) {
      setError(VALIDATION_MESSAGES.singleCapacity);
      return false;
    }

    if (formData.room_type === 'double' && formData.capacity > 2) {
      setError(VALIDATION_MESSAGES.doubleCapacity);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const response = await updateRoom(id, {
        ...formData,
        room_number: formData.room_number.trim().toUpperCase(),
        price: parseFloat(formData.price),
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
      });

      toast.success(SUCCESS_MESSAGES.roomUpdated);
      navigate(`/rooms/${id}`);
    } catch (err) {
      console.error('Error updating room:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || ERROR_MESSAGES.updateRoom;
      setError(errorMsg);
      setSaving(false);
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

  // Error loading room
  if (error && !saving) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <Link
            to="/rooms"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mt-4"
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to={`/rooms/${id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {BUTTON_LABELS.back}
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">{PAGE_TITLES.editRoom}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {INFO_MESSAGES.requiredFields} • Kamar: {formData.room_number}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Room Number */}
          <div className="mb-6">
            <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-2">
              {FORM_LABELS.room_number} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="room_number"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              placeholder="Contoh: A101, B205"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Akan otomatis diubah menjadi huruf kapital</p>
          </div>

          {/* Room Type */}
          <div className="mb-6">
            <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-2">
              {FORM_LABELS.room_type} <span className="text-red-500">*</span>
            </label>
            <select
              id="room_type"
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {ROOM_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Floor and Capacity - Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Floor */}
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
                {FORM_LABELS.floor} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                {FORM_LABELS.capacity} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">{INFO_MESSAGES.capacityHint}</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              {FORM_LABELS.price} (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="50000"
              placeholder="1500000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Harga sewa per bulan dalam Rupiah</p>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              {FORM_LABELS.status}
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ROOM_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Facilities */}
          <div className="mb-6">
            <label htmlFor="facilities" className="block text-sm font-medium text-gray-700 mb-2">
              {FORM_LABELS.facilities} (opsional)
            </label>
            <textarea
              id="facilities"
              name="facilities"
              value={formData.facilities}
              onChange={handleChange}
              rows="3"
              placeholder="Contoh: AC, WiFi, Kamar Mandi Dalam, Lemari, Kasur"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {FORM_LABELS.description} (opsional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Tambahkan deskripsi atau catatan tentang kamar ini..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/rooms/${id}`)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              disabled={saving}
            >
              {BUTTON_LABELS.cancel}
            </button>

            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? LOADING_MESSAGES.saving : BUTTON_LABELS.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoom;
