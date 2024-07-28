import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

export const addNewItem = async (itemType, itemName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/${itemType}`, { name: itemName });
    return response.data;
  } catch (error) {
    console.error(`Failed to add new ${itemType}:`, error);
    throw error;
  }
};