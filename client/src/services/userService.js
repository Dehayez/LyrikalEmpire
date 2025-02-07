import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';
import { jwtDecode } from 'jwt-decode';

const API_URL = `${API_BASE_URL}/users`;

const register = async (userData) => {
  return await apiRequest('post', '/register', API_URL, userData, null, false);
};

const login = async (userData) => {
  const response = await apiRequest('post', '/login', API_URL, userData, null, false);
  const { accessToken, refreshToken, email, username, id } = response;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  return { accessToken, refreshToken, email, username, id };
};

const loginWithGoogle = async (tokenId) => {
  const response = await apiRequest('post', '/auth/google', API_URL, { tokenId }, null, false);
  const { accessToken, refreshToken, email, username } = response;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  return { accessToken, refreshToken, email, username };
};

const getUserDetails = async () => {
  const response = await apiRequest('get', '/me', API_URL);
  const { email, username, id } = response;
  return { email, username, id };
};

const updateUserDetails = async (userData) => {
  return await apiRequest('put', '/me', API_URL, userData);
};

const confirmEmail = async (token) => {
  return await apiRequest('get', `/confirm/${token}`, API_URL, null, null, false);
};

const resendConfirmationEmail = async (email) => {
  return await apiRequest('post', '/resend-confirmation', API_URL, { email }, null, false);
};

const requestPasswordReset = async (email) => {
  return await apiRequest('post', '/request-password-reset', API_URL, { email }, null, false);
};

const verifyResetCode = async (email, resetCode) => {
  return await apiRequest('post', '/verify-reset-code', API_URL, { email, resetCode }, null, false);
};

const resetPassword = async (email, resetCode, password) => {
  return await apiRequest('post', '/reset-password', API_URL, { email, resetCode, password }, null, false);
};

const verifyToken = async (token) => {
  return await apiRequest('post', '/verify-token', API_URL, { token }, null, false);
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiRequest('post', '/token/refresh-token', API_URL, { token: refreshToken }, null, false);
  const { accessToken } = response;
  localStorage.setItem('accessToken', accessToken);
  console.log(`[INFO] Access Token refreshed: ${accessToken}`);
  return accessToken;
};

const startTokenRefresh = () => {
  const refresh = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const decodedToken = jwtDecode(accessToken);
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decodedToken.exp - now - 60;

        if (timeLeft > 0) {
          setTimeout(refresh, timeLeft * 1000);
          return;
        }
      }

      const newAccessToken = await refreshToken();
      const newDecodedToken = jwtDecode(newAccessToken);
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = newDecodedToken.exp - now - 60;
      setTimeout(refresh, timeLeft * 1000);
    } catch (error) {
      console.error('[ERROR] Failed to refresh token:', error);
    }
  };

  refresh();
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
  verifyResetCode,
  resetPassword,
  verifyToken,
  refreshToken,
  startTokenRefresh,
};