import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/keywords`;

export const getKeywords = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addKeyword = async (name) => {
  const response = await axios.post(API_URL, { name });
  return response.data;
};

export const updateKeyword = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteKeyword = (id) => axios.delete(`${API_URL}/${id}`);