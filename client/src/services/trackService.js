import axios from 'axios';

const API_URL = 'http://localhost:4000/api/tracks';

export const getTracks = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addTrack = async (track, audioFile) => {
  const formData = new FormData();

  for (const key in track) {
    formData.append(key, track[key]);
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

export const deleteTrack = (id) => axios.delete(`${API_URL}/${id}`);