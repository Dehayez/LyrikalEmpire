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

// Add associations
export const addBeatKeywords = async (beatId, keywordIds) => {
  const { data } = await axios.post(`${API_URL}/${beatId}/keywords`, { keywordIds });
  return data;
};

export const addBeatGenres = async (beatId, genreIds) => {
  const { data } = await axios.post(`${API_URL}/${beatId}/genres`, { genreIds });
  return data;
};

export const addBeatMoods = async (beatId, moodIds) => {
  const { data } = await axios.post(`${API_URL}/${beatId}/moods`, { moodIds });
  return data;
};

export const addBeatFeatures = async (beatId, featureIds) => {
  const { data } = await axios.post(`${API_URL}/${beatId}/features`, { featureIds });
  return data;
};

// Remove associations
export const removeBeatKeyword = async (beatId, keywordId) => {
  const { data } = await axios.delete(`${API_URL}/${beatId}/keywords/${keywordId}`);
  return data;
};

export const removeBeatGenre = async (beatId, genreId) => {
  const { data } = await axios.delete(`${API_URL}/${beatId}/genres/${genreId}`);
  return data;
};

export const removeBeatMood = async (beatId, moodId) => {
  const { data } = await axios.delete(`${API_URL}/${beatId}/moods/${moodId}`);
  return data;
};

export const removeBeatFeature = async (beatId, featureId) => {
  const { data } = await axios.delete(`${API_URL}/${beatId}/features/${featureId}`);
  return data;
};