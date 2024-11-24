import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';

const API_URL = `${API_BASE_URL}/api/moods`;

export const getMoods = async () => {
  return await apiRequest('get', '', API_URL);
};

export const getMoodsWithCounts = async () => {
  return await apiRequest('get', '/with-counts', API_URL);
};

export const addMood = async (name) => {
  return await apiRequest('post', '', API_URL, { name });
};

export const updateMood = async (id, data) => {
  return await apiRequest('put', `/${id}`, API_URL, data);
};

export const deleteMood = async (id) => {
  return await apiRequest('delete', `/${id}`, API_URL);
};