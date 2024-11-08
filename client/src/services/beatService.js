import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/beats`;

export const getBeats = async (user_id) => {
  const { data } = await axios.get(API_URL, {
    params: { user_id }
  });
  return data;
};

export const addBeat = async (beat, audioFile, user_id) => {
  const formData = new FormData();

  for (const key in beat) {
    if (beat[key] !== null && key !== 'audio') {
      formData.append(key, beat[key]);
    }
  }

  if (audioFile) {
    formData.append('audio', audioFile, audioFile.name);
  }

  formData.append('user_id', user_id);

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

export const replaceAudio = async (beatId, newAudioFile) => {
  const formData = new FormData();
  formData.append('audio', newAudioFile, newAudioFile.name);

  try {
    const { data } = await axios.put(`${API_URL}/${beatId}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Failed to replace audio:', error);
    throw error;
  }
};

export const addAssociationsToBeat = async (beatId, associationType, associationId) => {
  try {
    const response = await axios.post(`${API_URL}/${beatId}/${associationType}`, { association_id: associationId });
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

export const getBeatsByAssociation = async (associationType, associationIds, allBeats) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        associationType,
        associationIds: associationIds.join(',')
      }
    });
    const fetchedBeats = response.data.reverse();
    return allBeats ? fetchedBeats.filter(beat => allBeats.some(b => b.id === beat.id)) : fetchedBeats;
  } catch (error) {
    console.error(`Failed to fetch beats with ${associationType} and IDs ${associationIds}:`, error);
    throw error;
  }
};