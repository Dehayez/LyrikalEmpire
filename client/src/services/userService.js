import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const register = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/register`, userData);
};

const login = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/login`, userData);
};

const confirmEmail = (token) => {
  return axios.get(`${API_BASE_URL}/api/users/confirm/${token}`);
};

export default {
  register,
  login,
  confirmEmail,
};