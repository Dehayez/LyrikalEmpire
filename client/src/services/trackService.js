import axios from 'axios';

const API_URL = 'http://localhost:4000/api/tracks';

export const getTracks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addTrack = async (track) => {
  const response = await axios.post(API_URL, track);
  return response.data;
};

export const deleteTrack = async (id) => {
  if (window.confirm('Are you sure you want to delete this track?')) {
    await axios.delete(`${API_URL}/${id}`);
  }
};