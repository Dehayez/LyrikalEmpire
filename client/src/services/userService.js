import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const register = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/register`, userData);
};

const login = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/login`, userData);
};

export default {
  register,
  login,
};