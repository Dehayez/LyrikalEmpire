import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { getGenres, getMoods, getKeywords, getFeatures } from '../services';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [genresData, moodsData, keywordsData, featuresData] = await Promise.all([
        getGenres(),
        getMoods(),
        getKeywords(),
        getFeatures()
      ]);
      setGenres(genresData);
      setMoods(moodsData);
      setKeywords(keywordsData);
      setFeatures(featuresData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value = useMemo(() => ({
    genres,
    moods,
    keywords,
    features,
    loading,
    error,
    refetch: fetchData
  }), [genres, moods, keywords, features, loading, error]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);