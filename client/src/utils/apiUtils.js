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
    console.log('API Request Method:', method); // Log the method
    console.log('API Request URL:', url); // Log the URL
    console.log('API Request Base URL:', baseURL); // Log the base URL
    console.log('API Request Data:', data); // Log the data
    console.log('API Request Params:', params); // Log the params
    console.log('API Request Auth:', auth); // Log the auth
    console.log('API Request Headers:', headers); // Log the headers

    const config = {
      method,
      url: `${baseURL}${url}`, // Ensure baseURL and url are correctly defined
      ...(auth && getAuthHeaders()),
      ...(data && { data }),
      ...(params && { params }),
      headers: {
        ...headers,
        ...(auth && getAuthHeaders().headers),
      },
    };
    console.log('API Request Config:', config); // Log the request config for debugging
    const response = await axios(config);
    console.log('API Response:', response); // Log the response for debugging
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};