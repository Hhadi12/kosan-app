/**
 * Tenant API Functions
 *
 * This file contains all functions for communicating with the Tenant API endpoints.
 * All functions use the configured axios instance which automatically adds authentication tokens.
 */

import api from './axios';

/**
 * Get all tenants with optional filtering
 *
 * @param {Object} filters - Optional filter parameters
 * @param {boolean} filters.is_active - Filter by active status (true/false)
 * @param {boolean} filters.has_assignment - Filter by assignment status
 * @returns {Promise} - Returns { count: number, tenants: Array }
 */
export const getAllTenants = async (filters = {}) => {
  try {
    // Build query parameters from filters object
    const params = new URLSearchParams();

    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.has_assignment !== undefined) params.append('has_assignment', filters.has_assignment);

    const queryString = params.toString();
    const url = queryString ? `/tenants/?${queryString}` : '/tenants/';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
};

/**
 * Get a specific tenant by ID with full details and assignment history
 *
 * @param {number} id - Tenant ID
 * @returns {Promise} - Returns tenant object with user, current_assignment, assignment_history
 */
export const getTenantById = async (id) => {
  try {
    const response = await api.get(`/tenants/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tenant ${id}:`, error);
    throw error;
  }
};

/**
 * Get current logged-in user's tenant profile
 *
 * @returns {Promise} - Returns tenant profile for current user
 */
export const getMyProfile = async () => {
  try {
    const response = await api.get('/tenants/me/');
    return response.data;
  } catch (error) {
    console.error('Error fetching my profile:', error);
    throw error;
  }
};

/**
 * Get all active tenants only (Admin only)
 *
 * @returns {Promise} - Returns { count: number, tenants: Array }
 */
export const getActiveTenants = async () => {
  try {
    const response = await api.get('/tenants/active/');
    return response.data;
  } catch (error) {
    console.error('Error fetching active tenants:', error);
    throw error;
  }
};

/**
 * Update tenant information (Admin only)
 *
 * @param {number} id - Tenant ID
 * @param {Object} tenantData - Tenant data to update
 * @param {string} tenantData.id_number - National ID number
 * @param {string} tenantData.emergency_contact_name - Emergency contact name
 * @param {string} tenantData.emergency_contact_phone - Emergency contact phone
 * @param {string} tenantData.occupation - Tenant's occupation
 * @returns {Promise} - Returns updated tenant object
 */
export const updateTenant = async (id, tenantData) => {
  try {
    // Use PATCH for partial updates
    const response = await api.patch(`/tenants/${id}/update/`, tenantData);
    return response.data;
  } catch (error) {
    console.error(`Error updating tenant ${id}:`, error);
    throw error;
  }
};

/**
 * Soft delete a tenant (Admin only)
 * Sets is_active to False. Cannot delete tenant with active assignment.
 *
 * @param {number} id - Tenant ID
 * @returns {Promise} - Returns success message
 */
export const deleteTenant = async (id) => {
  try {
    const response = await api.delete(`/tenants/${id}/delete/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting tenant ${id}:`, error);
    throw error;
  }
};

/**
 * Assign tenant to a room (Admin only)
 *
 * @param {number} tenantId - Tenant ID
 * @param {Object} assignmentData - Assignment details
 * @param {string} assignmentData.room - Room number (e.g., "A101")
 * @param {string} assignmentData.move_in_date - Move-in date (YYYY-MM-DD)
 * @param {string} assignmentData.lease_end_date - Optional lease end date (YYYY-MM-DD)
 * @param {number} assignmentData.monthly_rent - Monthly rent amount
 * @returns {Promise} - Returns created assignment object (with ASN-XXX id)
 */
export const assignRoom = async (tenantId, assignmentData) => {
  try {
    const response = await api.post(`/tenants/${tenantId}/assign/`, assignmentData);
    return response.data;
  } catch (error) {
    console.error(`Error assigning room to tenant ${tenantId}:`, error);
    throw error;
  }
};

/**
 * Unassign tenant from current room (end lease) (Admin only)
 *
 * @param {number} tenantId - Tenant ID
 * @param {Object} data - Unassignment details
 * @param {string} data.move_out_date - Move-out date (YYYY-MM-DD), defaults to today
 * @returns {Promise} - Returns success message and updated assignment
 */
export const unassignRoom = async (tenantId, data = {}) => {
  try {
    const response = await api.post(`/tenants/${tenantId}/unassign/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error unassigning tenant ${tenantId}:`, error);
    throw error;
  }
};

/**
 * Change tenant's room assignment (Admin only)
 * Ends current assignment and creates new one
 *
 * @param {number} tenantId - Tenant ID
 * @param {Object} changeData - Room change details
 * @param {number} changeData.new_room - New room ID
 * @param {string} changeData.move_in_date - Move-in date for new room (YYYY-MM-DD)
 * @param {string} changeData.move_out_date - Move-out date from old room (YYYY-MM-DD)
 * @param {number} changeData.monthly_rent - Monthly rent for new room
 * @param {string} changeData.lease_end_date - Optional lease end date (YYYY-MM-DD)
 * @returns {Promise} - Returns new assignment object
 */
export const changeRoom = async (tenantId, changeData) => {
  try {
    const response = await api.post(`/tenants/${tenantId}/change-room/`, changeData);
    return response.data;
  } catch (error) {
    console.error(`Error changing room for tenant ${tenantId}:`, error);
    throw error;
  }
};

/**
 * Get tenant currently assigned to a specific room
 *
 * @param {string} roomNumber - Room number (e.g., "A101", "B201")
 * @returns {Promise} - Returns tenant object if room occupied, null if available
 */
export const getTenantByRoom = async (roomNumber) => {
  try {
    const response = await api.get(`/tenants/by-room/${roomNumber}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tenant for room ${roomNumber}:`, error);
    throw error;
  }
};
