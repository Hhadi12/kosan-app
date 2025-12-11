import api from './axios';

// =============================================================================
// Admin User Management (admin only)
// =============================================================================

// Get all users (admin only)
export const getAllUsers = async () => {
  const response = await api.get('/users/');
  return response.data;
};

// Get user by ID (admin only)
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}/`);
  return response.data;
};

// Update user (admin only)
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}/update/`, userData);
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}/delete/`);
  return response.data;
};

// =============================================================================
// Profile Management (current user)
// =============================================================================

// Get current user's profile
export const getProfile = async () => {
  const response = await api.get('/users/profile/');
  return response.data;
};

// Update profile (name, phone)
export const updateProfile = async (data) => {
  const response = await api.put('/users/profile/update/', data);
  return response.data;
};

// Change email (requires password confirmation)
export const changeEmail = async (data) => {
  const response = await api.post('/users/profile/change-email/', data);
  return response.data;
};

// Change password
export const changePassword = async (data) => {
  const response = await api.post('/users/profile/change-password/', data);
  return response.data;
};

// =============================================================================
// Tenant History (Phase 8.4)
// =============================================================================

// Get current user's 12-month history (payments + complaints)
export const getMyHistory = async () => {
  const response = await api.get('/users/profile/history/');
  return response.data;
};

// Get specific user's history (admin only)
export const getUserHistory = async (userId) => {
  const response = await api.get(`/users/${userId}/history/`);
  return response.data;
};

// Default export for convenience
export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changeEmail,
  changePassword,
  getMyHistory,
  getUserHistory,
};