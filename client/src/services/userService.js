import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const register = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/register`, userData);
};

const login = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/login`, userData)
    .then(response => {
      const { token, email, username } = response.data;
      return { token, email, username };
    });
};

const getUserDetails = (token) => {
  if (!token) {
    throw new Error('User is not logged in');
  }

  return axios.get(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(response => response.data);
};

const confirmEmail = (token) => {
  return axios.get(`${API_BASE_URL}/api/users/confirm/${token}`);
};

const resendConfirmationEmail = (email) => {
  return axios.post(`${API_BASE_URL}/api/users/resend-confirmation`, { email });
};

const requestPasswordReset = (email) => {
  return axios.post(`${API_BASE_URL}/api/users/request-password-reset`, { email });
};

const resetPassword = (token, password) => {
  return axios.post(`${API_BASE_URL}/api/users/reset-password/${token}`, { password });
};

const verifyToken = (token) => {
  return axios.post(`${API_BASE_URL}/api/users/verify-token`, { token });
};

export default {
  register,
  login,
  getUserDetails,
  confirmEmail,
  resendConfirmationEmail,
  requestPasswordReset,
  resetPassword,
  verifyToken,
};