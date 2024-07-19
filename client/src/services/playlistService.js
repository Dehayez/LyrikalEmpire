import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/playlists`;

const createPlaylist = async (playlistData) => {
  try {
    const response = await axios.post(API_URL, playlistData);
    return response.data;
  } catch (error) {
    console.error('Failed to create playlist:', error);
    throw error;
  }
};

const getPlaylists = async () => {
  try {
    const response = await axios.get(API_URL);
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
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete playlist:', error);
    throw error;
  }
};

const addBeatToPlaylist = async (playlistId, beatId) => {
  try {
    const response = await axios.post(`${API_URL}/${playlistId}/beats/${beatId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to add beat to playlist:', error);
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

export {
  createPlaylist,
  getPlaylists,
  updatePlaylist,
  deletePlaylist,
  addBeatToPlaylist,
  removeBeatFromPlaylist
};