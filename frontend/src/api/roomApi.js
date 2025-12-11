/**
 * Room API Functions
 *
 * This file contains all functions for communicating with the Room API endpoints.
 * All functions use the configured axios instance which automatically adds authentication tokens.
 */

import api from './axios';

/**
 * Get all rooms with optional filtering
 *
 * @param {Object} filters - Optional filter parameters
 * @param {string} filters.status - Filter by status (available, occupied, maintenance)
 * @param {string} filters.room_type - Filter by room type (single, double, shared)
 * @param {number} filters.floor - Filter by floor number
 * @param {number} filters.min_price - Filter by minimum price
 * @param {number} filters.max_price - Filter by maximum price
 * @returns {Promise} - Returns { count: number, rooms: Array }
 */
export const getAllRooms = async (filters = {}) => {
  try {
    // Build query parameters from filters object
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.room_type) params.append('room_type', filters.room_type);
    if (filters.floor) params.append('floor', filters.floor);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);

    const queryString = params.toString();
    const url = queryString ? `/rooms/?${queryString}` : '/rooms/';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

/**
 * Get a specific room by room number
 *
 * @param {string} roomNumber - Room number (e.g., "A101", "B201")
 * @returns {Promise} - Returns room object
 */
export const getRoomById = async (roomNumber) => {
  try {
    const response = await api.get(`/rooms/${roomNumber}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching room ${roomNumber}:`, error);
    throw error;
  }
};

/**
 * Create a new room (Admin only)
 *
 * @param {Object} roomData - Room data
 * @param {string} roomData.room_number - Room number (e.g., "A101")
 * @param {string} roomData.room_type - Room type (single, double, shared)
 * @param {number} roomData.floor - Floor number
 * @param {number} roomData.capacity - Maximum occupants
 * @param {number} roomData.price - Monthly rent price
 * @param {string} roomData.status - Room status (available, occupied, maintenance)
 * @param {string} roomData.facilities - Optional facilities description
 * @param {string} roomData.description - Optional room description
 * @returns {Promise} - Returns created room object
 */
export const createRoom = async (roomData) => {
  try {
    const response = await api.post('/rooms/create/', roomData);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Update an existing room (Admin only)
 *
 * @param {string} roomNumber - Room number (e.g., "A101", "B201")
 * @param {Object} roomData - Room data to update (partial update supported)
 * @returns {Promise} - Returns updated room object
 */
export const updateRoom = async (roomNumber, roomData) => {
  try {
    // Use PATCH for partial updates
    const response = await api.patch(`/rooms/${roomNumber}/update/`, roomData);
    return response.data;
  } catch (error) {
    console.error(`Error updating room ${roomNumber}:`, error);
    throw error;
  }
};

/**
 * Delete a room (Admin only)
 *
 * @param {string} roomNumber - Room number (e.g., "A101", "B201")
 * @returns {Promise} - Returns success message
 */
export const deleteRoom = async (roomNumber) => {
  try {
    const response = await api.delete(`/rooms/${roomNumber}/delete/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting room ${roomNumber}:`, error);
    throw error;
  }
};

/**
 * Get all available rooms only
 *
 * @returns {Promise} - Returns { count: number, rooms: Array }
 */
export const getAvailableRooms = async () => {
  try {
    const response = await api.get('/rooms/available/');
    return response.data;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
};
