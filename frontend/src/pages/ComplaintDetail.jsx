import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ComplaintStatusBadge from '../components/ComplaintStatusBadge';
import ComplaintPriorityBadge from '../components/ComplaintPriorityBadge';
import CommentThread from '../components/CommentThread';
import {
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getCommentsByComplaint,
  addComment,
  deleteComment,
} from '../api/complaintApi';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUS_OPTIONS,
  COMPLAINT_PAGE_TITLES,
  COMPLAINT_BUTTON_LABELS,
  COMPLAINT_FORM_LABELS,
  COMPLAINT_ERROR_MESSAGES,
  COMPLAINT_SUCCESS_MESSAGES,
  COMPLAINT_INFO_MESSAGES,
  COMPLAINT_EMPTY_MESSAGES,
} from '../utils/constants';

/**
 * ComplaintDetail Page
 *
 * Displays full complaint details with comments.
 * Admin: Can update status, delete complaint
 * Tenant: View only (own complaints)
 */
const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Update status form
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  useEffect(() => {
    fetchComplaintDetail();
    fetchComments();
  }, [id]);

  const fetchComplaintDetail = async () => {
    setLoading(true);
    try {
      const data = await getComplaintById(id);
      setComplaint(data);
      setNewStatus(data.status);
      setResolutionNotes(data.resolution_notes || '');
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error(COMPLAINT_ERROR_MESSAGES.fetchComplaintDetail);
      navigate('/keluhan');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getCommentsByComplaint(id);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    // Validation: if resolving, require resolution notes
    if (newStatus === 'resolved' && !resolutionNotes.trim()) {
      toast.error(COMPLAINT_ERROR_MESSAGES.resolutionRequired);
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        status: newStatus,
      };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolution_notes = resolutionNotes;
      }

      await updateComplaint(id, updateData);
      toast.success(COMPLAINT_SUCCESS_MESSAGES.statusUpdated);
      setShowStatusUpdate(false);
      fetchComplaintDetail();
    } catch (error) {
      console.error('Error updating complaint:', error);
      const errorMsg = error.response?.data?.resolution_notes?.[0] ||
        COMPLAINT_ERROR_MESSAGES.updateComplaint;
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(COMPLAINT_INFO_MESSAGES.deleteConfirm)) {
      return;
    }

    try {
      await deleteComplaint(id);
      toast.success(COMPLAINT_SUCCESS_MESSAGES.complaintDeleted);
      navigate('/keluhan');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error(COMPLAINT_ERROR_MESSAGES.deleteComplaint);
    }
  };

  const handleAddComment = async (commentText) => {
    await addComment(id, commentText);
    toast.success(COMPLAINT_SUCCESS_MESSAGES.commentAdded);
    fetchComments();
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm(COMPLAINT_INFO_MESSAGES.deleteCommentConfirm)) {
      return;
    }

    try {
      await deleteComment(commentId);
      toast.success(COMPLAINT_SUCCESS_MESSAGES.commentDeleted);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(COMPLAINT_ERROR_MESSAGES.deleteComment);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat detail keluhan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  const category = COMPLAINT_CATEGORIES[complaint.category];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/keluhan')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← {COMPLAINT_BUTTON_LABELS.backToList}
        </button>

        {/* Complaint Detail */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{category?.icon || '📝'}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {complaint.title}
                </h1>
                <p className="text-gray-500">{category?.label}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <ComplaintStatusBadge status={complaint.status} />
              <ComplaintPriorityBadge priority={complaint.priority} />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Penghuni</p>
              <p className="font-medium">{complaint.tenant_name}</p>
            </div>
            {complaint.room_number && (
              <div>
                <p className="text-sm text-gray-600">Kamar</p>
                <p className="font-medium">{complaint.room_number}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Dibuat</p>
              <p className="font-medium">{formatDate(complaint.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lama Terbuka</p>
              <p className="font-medium">{complaint.days_open} hari</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Attachment */}
          {complaint.attachment && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Foto Bukti</h3>
              <img
                src={complaint.attachment}
                alt="Complaint attachment"
                className="max-w-md rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Resolution Notes */}
          {complaint.resolution_notes && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <h3 className="text-lg font-semibold mb-2 text-green-800">
                Catatan Penyelesaian
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {complaint.resolution_notes}
              </p>
              {complaint.resolved_by_name && (
                <p className="text-sm text-gray-600 mt-2">
                  Diselesaikan oleh: {complaint.resolved_by_name} pada{' '}
                  {formatDate(complaint.resolved_at)}
                </p>
              )}
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin() && (
            <div className="border-t pt-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {COMPLAINT_BUTTON_LABELS.updateStatus}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {COMPLAINT_BUTTON_LABELS.delete}
                </button>
              </div>

              {/* Status Update Form */}
              {showStatusUpdate && (
                <form onSubmit={handleStatusUpdate} className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    {COMPLAINT_BUTTON_LABELS.updateStatus}
                  </h3>

                  <div className="space-y-4">
                    {/* Status Select */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {COMPLAINT_FORM_LABELS.status}
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {COMPLAINT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resolution Notes (if resolving) */}
                    {(newStatus === 'resolved' || newStatus === 'closed') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {COMPLAINT_FORM_LABELS.resolutionNotes}
                          {newStatus === 'resolved' && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Jelaskan bagaimana keluhan ini diselesaikan..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {newStatus === 'resolved' && (
                          <p className="text-sm text-gray-500 mt-1">
                            {COMPLAINT_INFO_MESSAGES.resolutionRequired}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowStatusUpdate(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {COMPLAINT_BUTTON_LABELS.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {updating ? 'Memperbarui...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Comment Thread */}
        <CommentThread
          comments={comments}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ComplaintDetail;
