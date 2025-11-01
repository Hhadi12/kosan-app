import api from './axios';

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