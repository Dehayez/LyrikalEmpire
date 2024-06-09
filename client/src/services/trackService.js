import axios from 'axios';

const API_URL = 'http://localhost:4000/api/tracks';

export const getTracks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addTrack = async (track, audioFile) => {
  let formData = new FormData();
  for (let key in track) {
    formData.append(key, track[key]);
  }
  if (audioFile) {
    formData.append('audio', audioFile, audioFile.name);
  }
  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteTrack = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};