import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';
import { apiRequest } from '../utils/apiUtils';

const API_URL = `${API_BASE_URL}/beats`;

export const getSignedUrl = async (fileName) => {
  try {
    const response = await axios.get(`${API_URL}/signed-url/${fileName}`);
    return response.data.signedUrl;
  } catch (error) {
    console.error('Error fetching signed URL:', error);
    throw new Error('Error fetching signed URL');
  }
};

export const getBeats = async (user_id) => {
  return await apiRequest('get', '', API_URL, null, { user_id });
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

  return await apiRequest('post', '', API_URL, formData, null, true, {
    'Content-Type': 'multipart/form-data'
  });
};

export const updateBeat = async (beatId, beatData) => {
  return await apiRequest('put', `/${beatId}`, API_URL, beatData);
};

export const deleteBeat = async (beatId) => {
  return await apiRequest('delete', `/${beatId}`, API_URL);
};

export const addAssociationToBeat = async (beatId, associationType, associationId) => {
  return await apiRequest('post', `/${beatId}/${associationType}/${associationId}`, API_URL);
};

export const removeAssociationFromBeat = async (beatId, associationType, associationId) => {
  return await apiRequest('delete', `/${beatId}/${associationType}/${associationId}`, API_URL);
};

export const getAssociationsByBeatId = async (beatId, associationType) => {
  return await apiRequest('get', `/${beatId}/${associationType}`, API_URL);
};

export const removeAllAssociationsFromBeat = async (beatId, associationType) => {
  return await apiRequest('delete', `/${beatId}/${associationType}`, API_URL);
};

export const getBeatsByAssociation = async (associationType, associationIds, allBeats, user_id) => {
  const response = await apiRequest('get', '', API_URL, null, {
    associationType,
    associationIds: associationIds.join(','),
    user_id
  });
  const fetchedBeats = response.reverse();
  return allBeats ? fetchedBeats.filter(beat => allBeats.some(b => b.id === beat.id)) : fetchedBeats;
};

export const replaceAudio = async (beatId, audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile, audioFile.name);

  return await apiRequest('post', `/${beatId}/replace-audio`, API_URL, formData, null, true, {
    'Content-Type': 'multipart/form-data'
  });
};

export const addAssociationsToBeat = async (beatId, associationType, associationId) => {
  try {
    const response = await apiRequest('post', `/${beatId}/${associationType}`, API_URL, { association_id: associationId });
    return response.data;
  } catch (error) {
    console.error(`Failed to add ${associationType} to beat:`, error);
    throw error;
  }
};