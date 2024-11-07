import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/playlists`;

const createPlaylist = async (playlistData, user_id) => {
  try {
    const response = await axios.post(API_URL, { ...playlistData, user_id });
    return response.data;
  } catch (error) {
    console.error('Failed to create playlist:', error);
    throw error;
  }
};

const getPlaylists = async (user_id) => {
  try {
    const response = await axios.get(API_URL, {
      params: { user_id }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch playlists:', error);
    throw error;
  }
};

const updatePlaylist = async (id, playlistData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, playlistData);
    return response.data;
  } catch (error) {
    console.error('Failed to update playlist:', error);
    throw error;
  }
};

const deletePlaylist = async (id) => {
  try {
    await removeAllBeatsFromPlaylist(id);
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete playlist:', error);
    throw error;
  }
};

const addBeatsToPlaylist = async (playlistId, beatIds) => {
  try {
    if (!Array.isArray(beatIds)) {
      beatIds = [beatIds];
    }
    const response = await axios.post(`${API_URL}/${playlistId}/beats`, { beatIds });
    return response.data;
  } catch (error) {
    console.error('Failed to add beats to playlist:', error);
    throw error;
  }
};

const removeBeatFromPlaylist = async (playlistId, beatId) => {
  try {
    const response = await axios.delete(`${API_URL}/${playlistId}/beats/${beatId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove beat from playlist:', error);
    throw error;
  }
};

const getBeatsByPlaylistId = async (playlistId) => {
  try {
    const response = await axios.get(`${API_URL}/${playlistId}/beats`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch beats for playlist:', error);
    throw error;
  }
};

const removeAllBeatsFromPlaylist = async (playlistId) => {
  try {
    const response = await axios.delete(`${API_URL}/${playlistId}/beats`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove all beats from playlist:', error);
    throw error;
  }
};

const getPlaylistById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch playlist by ID:', error);
    throw error;
  }
};

const updateBeatOrder = async (playlistId, beatOrders) => {
  try {
    const response = await axios.put(`${API_URL}/${playlistId}/beats/order`, { beatOrders });
    return response.data;
  } catch (error) {
    console.error('Failed to update beat order:', error);
    throw error;
  }
};

export {
  createPlaylist,
  getPlaylists,
  updatePlaylist,
  deletePlaylist,
  addBeatsToPlaylist,
  getBeatsByPlaylistId,
  removeBeatFromPlaylist,
  getPlaylistById,
  removeAllBeatsFromPlaylist,
  updateBeatOrder
};