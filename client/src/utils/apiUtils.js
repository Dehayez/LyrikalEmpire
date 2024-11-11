import axios from 'axios';
import { getAuthHeaders } from './authUtils';

export const apiRequest = async (method, url, baseURL, data = null, params = null) => {
  try {
    const config = {
      method,
      url: `${baseURL}${url}`,
      ...getAuthHeaders(),
      ...(data && { data }),
      ...(params && { params }),
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Failed to ${method} ${url}:`, error);
    throw error;
  }
};