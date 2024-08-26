import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/beats`;

export const getBeats = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addBeat = async (beat, audioFile) => {
  const formData = new FormData();

  for (const key in beat) {
    if (beat[key] !== null) {
        formData.append(key, beat[key]);
    }
  }

  if (audioFile) {
    formData.append('audio', audioFile, audioFile.name);
  }

  const { data } = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

export const updateBeat = async (id, updatedBeat) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updatedBeat);
  return data;
};

export const deleteBeat = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete beat:', error);
    throw error;
  }
};

export const addAssociationsToBeat = async (beatId, associationType, associationIds) => {
  try {
    const response = await axios.post(`${API_URL}/${beatId}/${associationType}`, { associationIds });
    return response.data;
  } catch (error) {
    console.error(`Failed to add ${associationType} to beat:`, error);
    throw error;
  }
};

export const removeAssociationFromBeat = async (beatId, associationType, associationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${beatId}/${associationType}/${associationId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to remove ${associationType} association from beat:`, error);
    throw error;
  }
};

export const getAssociationsByBeatId = async (beatId, associationType) => {
  try {
    const response = await axios.get(`${API_URL}/${beatId}/${associationType}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${associationType} for beat:`, error);
    throw error;
  }
};

export const removeAllAssociationsFromBeat = async (beatId, associationType) => {
  try {
    const response = await axios.delete(`${API_URL}/${beatId}/${associationType}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to remove all ${associationType} from beat:`, error);
    throw error;
  }
};

export const getBeatsByAssociation = async (associationType, associationIds) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        associationType,
        associationIds: associationIds.join(',')
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch beats with ${associationType} and IDs ${associationIds}:`, error);
    throw error;
  }
};