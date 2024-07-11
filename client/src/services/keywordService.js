import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/keywords`;

export const getKeywords = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addKeyword = async (keyword) => {
  const formData = new FormData();

  for (const key in keyword) {
    if (keyword[key] !== null) {
        formData.append(key, keyword[key]);
    }
  }

  const { data } = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

export const updateKeyword = async (id, updatedKeyword) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updatedKeyword);
  return data;
};

export const deleteKeyword = (id) => axios.delete(`${API_URL}/${id}`);