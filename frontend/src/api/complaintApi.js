import axios from './axios';

/**
 * Complaint API Functions
 *
 * All API calls for complaint management system.
 * Uses axios instance with auth token interceptor.
 *
 * Backend API Base: /api/complaints/
 */

// ============================================================
// COMPLAINT ENDPOINTS
// ============================================================

/**
 * Get all complaints (admin) or own complaints (tenant)
 * @param {Object} filters - Optional filters (status, category, priority, search)
 * @returns {Promise} Array of complaints
 */
export const getAllComplaints = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  const url = queryString ? `/complaints/?${queryString}` : '/complaints/';

  const response = await axios.get(url);
  return response.data;
};

/**
 * Get complaint detail by ID
 * @param {string} id - Complaint ID (CPL-XXX format)
 * @returns {Promise} Complaint detail object
 */
export const getComplaintById = async (id) => {
  const response = await axios.get(`/complaints/${id}/`);
  return response.data;
};

/**
 * Create new complaint (tenant only)
 * @param {Object} complaintData - Complaint data
 * @returns {Promise} Created complaint object
 */
export const createComplaint = async (complaintData) => {
  // If attachment exists, use FormData for file upload
  if (complaintData.attachment) {
    const formData = new FormData();
    formData.append('title', complaintData.title);
    formData.append('description', complaintData.description);
    formData.append('category', complaintData.category);
    formData.append('priority', complaintData.priority);

    if (complaintData.room) {
      formData.append('room', complaintData.room);
    }

    formData.append('attachment', complaintData.attachment);

    const response = await axios.post('/complaints/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // No attachment, use regular JSON
    const response = await axios.post('/complaints/create/', complaintData);
    return response.data;
  }
};

/**
 * Update complaint (admin only)
 * @param {string} id - Complaint ID (CPL-XXX format)
 * @param {Object} updateData - Fields to update (status, priority, resolution_notes)
 * @returns {Promise} Updated complaint object
 */
export const updateComplaint = async (id, updateData) => {
  const response = await axios.put(`/complaints/${id}/update/`, updateData);
  return response.data;
};

/**
 * Delete complaint (admin only)
 * @param {string} id - Complaint ID (CPL-XXX format)
 * @returns {Promise} void
 */
export const deleteComplaint = async (id) => {
  await axios.delete(`/complaints/${id}/delete/`);
};

// ============================================================
// COMMENT ENDPOINTS
// ============================================================

/**
 * Get all comments for a complaint
 * @param {string} complaintId - Complaint ID (CPL-XXX format)
 * @returns {Promise} Array of comments
 */
export const getCommentsByComplaint = async (complaintId) => {
  const response = await axios.get(`/complaints/${complaintId}/comments/`);
  return response.data;
};

/**
 * Add comment to complaint
 * @param {string} complaintId - Complaint ID (CPL-XXX format)
 * @param {string} comment - Comment text
 * @returns {Promise} Created comment object
 */
export const addComment = async (complaintId, comment) => {
  const response = await axios.post(`/complaints/${complaintId}/comments/create/`, {
    comment,
  });
  return response.data;
};

/**
 * Delete comment (own comment or admin)
 * @param {string} commentId - Comment ID (CMT-XXX format)
 * @returns {Promise} void
 */
export const deleteComment = async (commentId) => {
  await axios.delete(`/complaints/comments/${commentId}/delete/`);
};

// ============================================================
// STATISTICS ENDPOINT
// ============================================================

/**
 * Get complaint statistics (admin only)
 * @returns {Promise} Statistics object
 */
export const getComplaintStats = async () => {
  const response = await axios.get('/complaints/stats/');
  return response.data;
};

// Export all functions as default
export default {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getCommentsByComplaint,
  addComment,
  deleteComment,
  getComplaintStats,
};
