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

export const getBeatAssociations = async (beatId, associationType) => {
  const { data } = await axios.get(`${API_URL}/${beatId}/${associationType}`);
  return data;
};

export const addBeatAssociation = async (beatId, associationType, associationIds) => {
  try {
    const payload = { [`${associationType}Ids`]: associationIds };
    console.log('Sending payload:', payload); // Add this line for debugging
    const { data } = await axios.post(`${API_URL}/${beatId}/${associationType}`, payload);
    return data;
  } catch (error) {
    console.error('Error updating associations:', error);
    throw error;
  }
};

export const removeBeatAssociation = async (beatId, associationType, associationId) => {
  const { data } = await axios.delete(`${API_URL}/${beatId}/${associationType}/${associationId}`);
  return data;
};