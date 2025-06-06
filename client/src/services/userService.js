import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';
import { jwtDecode } from 'jwt-decode';

const API_URL = `${API_BASE_URL}/users`;
let refreshTimeoutId = null;

/**
 * Register a new user
 */
export const register = async (userData) => {
  return await apiRequest('post', '/register', API_URL, userData, null, false);
};

/**
 * Log in a user and setup token refresh
 */
export const login = async (userData) => {
  const response = await apiRequest('post', '/login', API_URL, userData, null, false);
  const { accessToken, refreshToken, email, username, id } = response;
  
  // Store tokens securely
  storeTokens(accessToken, refreshToken);
  setupTokenRefresh(accessToken);
  
  return { accessToken, refreshToken, email, username, id };
};

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = async (tokenId) => {
  const response = await apiRequest('post', '/auth/google', API_URL, { tokenId }, null, false);
  const { accessToken, refreshToken, email, username, id } = response;
  
  // Store tokens securely
  storeTokens(accessToken, refreshToken);
  setupTokenRefresh(accessToken);
  
  return { accessToken, refreshToken, email, username, id };
};

/**
 * Store tokens securely
 */
export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Clear tokens on logout
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Clear any existing refresh timers
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
};

/**
 * Logout the user
 */
export const logout = async () => {
  try {
    // Optionally notify server to invalidate refresh token
    await apiRequest('post', '/logout', API_URL);
  } catch (error) {
    console.error('[ERROR] Logout error:', error);
  } finally {
    clearTokens();
  }
};

/**
 * Get current user details
 */
export const getUserDetails = async () => {
  const response = await apiRequest('get', '/me', API_URL);
  const { email, username, id } = response;
  return { email, username, id };
};

/**
 * Update user details
 */
export const updateUserDetails = async (userData) => {
  return await apiRequest('put', '/me', API_URL, userData);
};

/**
 * Get a user by ID
 */
export const getUserById = async (userId) => {
  return await apiRequest('get', `/${userId}`, API_URL);
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  return await apiRequest('post', '/request-password-reset', API_URL, { email }, null, false);
};

/**
 * Verify confirmation code
 */
export const verifyConfirmationCode = async (email, confirmationCode) => {
  return await apiRequest('post', '/verify-confirmation-code', API_URL, { email, confirmationCode }, null, false);
};

/**
 * Verify reset code
 */
export const verifyResetCode = async (email, resetCode) => {
  return await apiRequest('post', '/verify-reset-code', API_URL, { email, resetCode }, null, false);
};

/**
 * Reset password
 */
export const resetPassword = async (email, resetCode, password) => {
  return await apiRequest('post', '/reset-password', API_URL, { email, resetCode, password }, null, false);
};

/**
 * Verify token
 */
export const verifyToken = async (token) => {
  return await apiRequest('post', '/verify-token', API_URL, { token }, null, false);
};

/**
 * Calculate time until token refresh in milliseconds
 * Refreshes at 75% of token lifetime to prevent edge cases
 */
export const calculateRefreshTime = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiry = decodedToken.exp;
    const tokenIssuedAt = decodedToken.iat || (currentTime - 60); // Fallback if iat not present
    
    const tokenLifetime = tokenExpiry - tokenIssuedAt;
    const refreshPoint = tokenLifetime * 0.75; // Refresh at 75% of lifetime
    
    const timeUntilRefresh = Math.max(
      (tokenIssuedAt + refreshPoint - currentTime) * 1000, 
      0
    );
    
    return timeUntilRefresh;
  } catch (error) {
    console.error('[ERROR] Token decode error:', error);
    return 0; // Refresh immediately if we can't decode the token
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshTokenFunction = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearTokens(); // Clean up any lingering data
      return null;
    }

    const response = await apiRequest(
      'post', 
      '/token/refresh-token', 
      API_URL, 
      { token: refreshToken }, 
      null, 
      false
    );
    
    const { accessToken, refreshToken: newRefreshToken } = response;
    storeTokens(accessToken, newRefreshToken);
    
    return accessToken;
  } catch (error) {
    console.error('[ERROR] Failed to refresh token:', error);
    // If refresh token is invalid, user must login again
    clearTokens();
    // Trigger app-level handler for unauthenticated state
    window.dispatchEvent(new CustomEvent('auth:tokenExpired'));
    return null;
  }
};

/**
 * Sets up the token refresh cycle
 */
export const setupTokenRefresh = (accessToken) => {
  // Clear any existing refresh timer
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
  }
  
  const timeUntilRefresh = calculateRefreshTime(accessToken);
  
  refreshTimeoutId = setTimeout(async () => {
    try {
      const newAccessToken = await refreshTokenFunction();
      if (newAccessToken) {
        setupTokenRefresh(newAccessToken);
      }
    } catch (error) {
      console.error('[ERROR] Token refresh cycle error:', error);
    }
  }, timeUntilRefresh);
};

/**
 * Initialize token refresh on app startup
 */
export const startTokenRefresh = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    try {
      // Verify the token is still decodable
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // If token is expired, refresh immediately
      if (decodedToken.exp <= currentTime) {
        refreshTokenFunction().then(newToken => {
          if (newToken) {
            setupTokenRefresh(newToken);
          }
        });
      } else {
        // Otherwise set up the normal refresh cycle
        setupTokenRefresh(accessToken);
      }
    } catch (error) {
      console.error('[ERROR] Invalid token during initialization:', error);
      refreshTokenFunction().then(newToken => {
        if (newToken) {
          setupTokenRefresh(newToken);
        }
      });
    }
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return false;
  
  try {
    const decodedToken = jwtDecode(accessToken);
    return decodedToken.exp > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
};

export default {
  register,
  login,
  loginWithGoogle,
  logout,
  getUserDetails,
  updateUserDetails,
  getUserById,
  verifyConfirmationCode,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  verifyToken,
  refreshToken: refreshTokenFunction,
  startTokenRefresh,
  isAuthenticated,
};