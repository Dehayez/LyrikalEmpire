import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';

const API_URL = `${API_BASE_URL}/api/keywords`;

export const getKeywords = async () => {
  return await apiRequest('get', '', API_URL);
};

export const getKeywordsWithCounts = async () => {
  return await apiRequest('get', '/with-counts', API_URL);
};

export const addKeyword = async (name) => {
  return await apiRequest('post', '', API_URL, { name });
};

export const updateKeyword = async (id, data) => {
  return await apiRequest('put', `/${id}`, API_URL, data);
};

export const deleteKeyword = async (id) => {
  return await apiRequest('delete', `/${id}`, API_URL);
};