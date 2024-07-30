import React, { createContext, useState, useEffect, useContext } from 'react';
import { getGenres, getMoods, getKeywords, getFeatures } from '../services';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresData, moodsData, keywordsData, featuresData] = await Promise.all([
          getGenres(),
          getMoods(),
          getKeywords(),
          getFeatures(),
        ]);
        setGenres(genresData);
        setMoods(moodsData);
        setKeywords(keywordsData);
        setFeatures(featuresData);
        console.log('Data fetched successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ genres, moods, keywords, features }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);