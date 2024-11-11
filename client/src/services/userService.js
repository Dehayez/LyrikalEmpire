import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const register = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/register`, userData)
    .catch(error => {
      if (error.response) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    });
};

const login = (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/login`, userData)
    .then(response => {
      const { accessToken, refreshToken, email, username, id } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return { accessToken, refreshToken, email, username, id };
    })
    .catch(error => {
      if (error.response) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    });
};

const loginWithGoogle = (tokenId) => {
  return axios.post(`${API_BASE_URL}/api/users/auth/google`, { tokenId })
    .then(response => {
      const { accessToken, refreshToken, email, username } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return { accessToken, refreshToken, email, username };
    })
    .catch(error => {
      if (error.response) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    });
};

const getUserDetails = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('User is not logged in');
  }

  return axios.get(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(response => {
    const { email, username, id } = response.data;
    return { email, username, id };
  });
};

const updateUserDetails = (userData) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('User is not logged in');
  }

  return axios.put(`${API_BASE_URL}/api/users/me`, userData, {
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

const refreshToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  return axios.post(`${API_BASE_URL}/api/users/refresh-token`, { token: refreshToken })
    .then(response => {
      const { accessToken } = response.data;
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