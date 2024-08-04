import React, { createContext, useState, useEffect, useContext } from 'react';
import { getGenres, getMoods, getKeywords, getFeatures } from '../services';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [features, setFeatures] = useState([]);

  const fetchGenres = async () => {
    const genresData = await getGenres();
    setGenres(genresData);
  };

  const fetchMoods = async () => {
    const moodsData = await getMoods();
    setMoods(moodsData);
  };

  const fetchKeywords = async () => {
    const keywordsData = await getKeywords();
    setKeywords(keywordsData);
  };

  const fetchFeatures = async () => {
    const featuresData = await getFeatures();
    setFeatures(featuresData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchGenres(), fetchMoods(), fetchKeywords(), fetchFeatures()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ genres, moods, keywords, features, fetchGenres, fetchMoods, fetchKeywords, fetchFeatures }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);