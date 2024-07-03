import axios from 'axios';

const API_URL = 'http://localhost:4000/api/genres';

export const getGenres = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const addGenre = async (genre) => {
  const formData = new FormData();

  for (const key in genre) {
    if (genre[key] !== null) {
        formData.append(key, genre[key]);
    }
  }

  const { data } = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

export const updateGenre = async (id, updatedGenre) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updatedGenre);
  return data;
};

export const deleteGenre = (id) => axios.delete(`${API_URL}/${id}`);