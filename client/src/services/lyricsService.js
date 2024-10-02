import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/lyrics`;

export const getLyricsById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch lyric with ID ${id}:`, error);
    throw error;
  }
};

export const updateLyricsById = async (id, lyrics) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, { lyrics });
    return response.data;
  } catch (error) {
    console.error(`Failed to update lyric with ID ${id}:`, error);
    throw error;
  }
};

export const createLyrics = async (lyrics) => {
    try {
      const response = await axios.post(`${API_URL}`, { lyrics });
      return response.data.results.insertId;
    } catch (error) {
      console.error('Failed to create lyrics:', error);
      throw error;
    }
  };