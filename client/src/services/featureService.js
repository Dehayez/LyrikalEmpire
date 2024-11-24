import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';

const API_URL = `${API_BASE_URL}/api/features`;

export const getFeatures = async () => {
  return await apiRequest('get', '', API_URL);
};

export const getFeaturesWithCounts = async () => {
  return await apiRequest('get', '/with-counts', API_URL);
};

export const addFeature = async (name) => {
  return await apiRequest('post', '', API_URL, { name });
};

export const updateFeature = async (id, data) => {
  return await apiRequest('put', `/${id}`, API_URL, data);
};

export const deleteFeature = async (id) => {
  return await apiRequest('delete', `/${id}`, API_URL);
};