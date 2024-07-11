import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const API_URL = `${API_BASE_URL}/api/moods`;

export const getMoods = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addMood = async (mood, audioFile) => {
  const formData = new FormData();

  for (const key in mood) {
    if (mood[key] !== null) {
        formData.append(key, mood[key]);
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

export const updateMood = async (id, updatedMood) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updatedMood);
  return data;
};

export const deleteMood = (id) => axios.delete(`${API_URL}/${id}`);