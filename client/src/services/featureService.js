import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/features`;

export const getFeatures = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addFeature = async (feature, audioFile) => {
  const formData = new FormData();

  for (const key in feature) {
    if (feature[key] !== null) {
        formData.append(key, feature[key]);
    }
  }

  if (audioFile) {
    formData.append('audio', audioFile, audioFile.name);
  }

  const { data } = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

export const updateFeature = async (id, updatedFeature) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updatedFeature);
  return data;
};

export const deleteFeature = (id) => axios.delete(`${API_URL}/${id}`);