import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/moods`;

export const getMoods = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addMood = async (name) => {
  const response = await axios.post(API_URL, { name });
  return response.data;
};

export const updateMood = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteMood = (id) => axios.delete(`${API_URL}/${id}`);