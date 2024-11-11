import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';

const API_URL = `${API_BASE_URL}/api/users`;

const register = (userData) => {
  return apiRequest('post', '/register', API_URL, userData);
};

const login = (userData) => {
  return apiRequest('post', '/login', API_URL, userData)
    .then(response => {
      const { accessToken, refreshToken, email, username, id } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return { accessToken, refreshToken, email, username, id };
    });
};

const loginWithGoogle = (tokenId) => {
  return apiRequest('post', '/auth/google', API_URL, { tokenId })
    .then(response => {
      const { accessToken, refreshToken, email, username } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return { accessToken, refreshToken, email, username };
    });
};

const getUserDetails = () => {
  return apiRequest('get', '/me', API_URL)
    .then(response => {
      const { email, username, id } = response;
      return { email, username, id };
    });
};

const updateUserDetails = (userData) => {
  return apiRequest('put', '/me', API_URL, userData)
    .then(response => response);
};

const confirmEmail = (token) => {
  return apiRequest('get', `/confirm/${token}`, API_URL);
};

const resendConfirmationEmail = (email) => {
  return apiRequest('post', '/resend-confirmation', API_URL, { email });
};

const requestPasswordReset = (email) => {
  return apiRequest('post', '/request-password-reset', API_URL, { email });
};

const resetPassword = (token, password) => {
  return apiRequest('post', `/reset-password/${token}`, API_URL, { password });
};

const verifyToken = (token) => {
  return apiRequest('post', '/verify-token', API_URL, { token });
};

const refreshToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  return apiRequest('post', '/refresh-token', API_URL, { token: refreshToken })
    .then(response => {
      const { accessToken } = response;
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    })
    .catch(error => {
      if (error.response) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    });
};

export default {
  register,
  login,
  loginWithGoogle,
  getUserDetails,
  updateUserDetails,
  confirmEmail,
  resendConfirmationEmail,
  requestPasswordReset,
  resetPassword,
  verifyToken,
  refreshToken,
};