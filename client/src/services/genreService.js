import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/genres`;

export const getGenres = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addGenre = async (data) => {
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

export const updateGenre = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteGenre = (id) => axios.delete(`${API_URL}/${id}`);