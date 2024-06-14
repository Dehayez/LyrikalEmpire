import axios from 'axios';

const API_URL = 'http://localhost:4000/api/beats';

export const getBeats = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addBeat = async (beat, audioFile) => {
  const formData = new FormData();

  for (const key in beat) {
    formData.append(key, beat[key]);
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

export const deleteBeat = (id) => axios.delete(`${API_URL}/${id}`);