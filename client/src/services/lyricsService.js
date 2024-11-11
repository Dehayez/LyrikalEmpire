import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';

const API_URL = `${API_BASE_URL}/api/lyrics`;

export const getLyricsById = async (id) => {
  return await apiRequest('get', `/${id}`, API_URL);
};

export const updateLyricsById = async (id, lyrics) => {
  return await apiRequest('put', `/${id}`, API_URL, { lyrics });
};

export const createLyrics = async (lyrics) => {
  const response = await apiRequest('post', '', API_URL, { lyrics });
  return response.results.insertId;
};