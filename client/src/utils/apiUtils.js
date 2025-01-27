import axios from 'axios';
import { getAuthHeaders } from './authUtils';

const handleApiError = (error) => {
  console.error('API request error:', error);
  if (error.response) {
    throw new Error(error.response.data.error);
  } else {
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

export const apiRequest = async (method, url = '', baseURL, data = null, params = null, auth = true, headers = {}) => {
  try {
    const config = {
      method,
      url: `${baseURL}${url}`,
      ...(auth && getAuthHeaders()),
      ...(data && { data }),
      ...(params && { params }),
      headers: {
        ...headers,
        ...(auth && getAuthHeaders().headers),
      },
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};