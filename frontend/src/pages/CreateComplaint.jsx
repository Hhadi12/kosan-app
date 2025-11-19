import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { createComplaint } from '../api/complaintApi';
import { getAllRooms } from '../api/roomApi';
import {
  COMPLAINT_CATEGORY_OPTIONS,
  COMPLAINT_PRIORITY_OPTIONS,
  COMPLAINT_PAGE_TITLES,
  COMPLAINT_BUTTON_LABELS,
  COMPLAINT_FORM_LABELS,
  COMPLAINT_ERROR_MESSAGES,
  COMPLAINT_SUCCESS_MESSAGES,
  COMPLAINT_INFO_MESSAGES,
} from '../utils/constants';

/**
 * CreateComplaint Page
 *
 * Form to create new complaint (tenant only).
 */
const CreateComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    room: '',
    attachment: null,
  });

  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Fetch available rooms (optional field)
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await getAllRooms();
      setRooms(data.rooms || []); // Extract rooms array from response
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]); // Set empty array on error
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setFormData({ ...formData, attachment: null });
      setPreviewUrl(null);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(COMPLAINT_ERROR_MESSAGES.fileTooLarge);
      e.target.value = null;
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error(COMPLAINT_ERROR_MESSAGES.invalidFileType);
      e.target.value = null;
      return;
    }

    setFormData({ ...formData, attachment: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul harus diisi';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = COMPLAINT_ERROR_MESSAGES.titleTooShort;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi harus diisi';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = COMPLAINT_ERROR_MESSAGES.descriptionTooShort;
    }

    if (!formData.category) {
      newErrors.category = COMPLAINT_ERROR_MESSAGES.selectCategory;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const complaintData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      };

      if (formData.room) {
        complaintData.room = formData.room;
      }

      if (formData.attachment) {
        complaintData.attachment = formData.attachment;
      }

      const result = await createComplaint(complaintData);
      console.log('Created complaint result:', result); // Debug log
      toast.success(COMPLAINT_SUCCESS_MESSAGES.complaintCreated);

      // Check if id exists in result
      if (result && result.id) {
        navigate(`/keluhan/${result.id}`);
      } else {
        // Fallback: navigate to list if no id
        console.warn('No ID in result, navigating to list');
        navigate('/keluhan');
      }
    } catch (error) {
      console.error('Error creating complaint:', error);

      // Handle validation errors from backend
      if (error.response?.data) {
        const backendErrors = {};
        Object.keys(error.response.data).forEach((key) => {
          backendErrors[key] = error.response.data[key][0];
        });
        setErrors(backendErrors);
      }

      toast.error(COMPLAINT_ERROR_MESSAGES.createComplaint);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/keluhan')}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            ← {COMPLAINT_BUTTON_LABELS.backToList}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {COMPLAINT_PAGE_TITLES.createComplaint}
          </h1>
          <p className="text-gray-600 mt-2">
            {COMPLAINT_INFO_MESSAGES.createComplaintHint}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {COMPLAINT_FORM_LABELS.title} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Lampu kamar rusak"
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {COMPLAINT_FORM_LABELS.category} <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Pilih kategori...</option>
              {COMPLAINT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {COMPLAINT_FORM_LABELS.priority}
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {COMPLAINT_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Room (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {COMPLAINT_FORM_LABELS.room}
            </label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tidak terkait kamar spesifik</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} - {room.room_type}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {COMPLAINT_FORM_LABELS.description} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan detail keluhan Anda..."
              rows={5}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {COMPLAINT_FORM_LABELS.attachment}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              {COMPLAINT_INFO_MESSAGES.attachmentHint}
            </p>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-sm rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/keluhan')}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {COMPLAINT_BUTTON_LABELS.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mengirim...' : COMPLAINT_BUTTON_LABELS.submitComplaint}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
