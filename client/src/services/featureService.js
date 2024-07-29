import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/features`;

export const getFeatures = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addFeature = async (data) => {
  const formData = new FormData();

  for (const key in data) {
    if (data[key] !== null) {
        formData.append(key, data[key]);
    }
  }

  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const updateFeature = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteFeature = (id) => axios.delete(`${API_URL}/${id}`);