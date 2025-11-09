/**
 * Favorites Utilities
 * Manages favorite rooms in localStorage
 * Tenants-only feature
 */

const FAVORITES_KEY = 'kosan_favorites';

/**
 * Get all favorite room IDs from localStorage
 * @returns {number[]} Array of room IDs
 */
export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

/**
 * Add a room to favorites
 * @param {number} roomId - Room ID to add
 * @returns {number[]} Updated favorites array
 */
export const addFavorite = (roomId) => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(roomId)) {
      favorites.push(roomId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    return favorites;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return getFavorites();
  }
};

/**
 * Remove a room from favorites
 * @param {number} roomId - Room ID to remove
 * @returns {number[]} Updated favorites array
 */
export const removeFavorite = (roomId) => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(id => id !== roomId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return getFavorites();
  }
};

/**
 * Toggle favorite status for a room
 * @param {number} roomId - Room ID to toggle
 * @returns {boolean} New favorite status (true if now favorited)
 */
export const toggleFavorite = (roomId) => {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(roomId);

  if (isFavorite) {
    removeFavorite(roomId);
    return false;
  } else {
    addFavorite(roomId);
    return true;
  }
};

/**
 * Check if a room is favorited
 * @param {number} roomId - Room ID to check
 * @returns {boolean} True if room is favorited
 */
export const isFavorite = (roomId) => {
  const favorites = getFavorites();
  return favorites.includes(roomId);
};

/**
 * Clear all favorites
 * @returns {void}
 */
export const clearFavorites = () => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
};
