import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { getGenresWithCounts, getMoodsWithCounts, getFeaturesWithCounts, getKeywordsWithCounts } from '../services';
import { useUser } from './UserContext'; // Import the useUser hook

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser(); // Get the user context

  const fetchGenres = async () => {
    try {
      const genresData = await getGenresWithCounts();
      setGenres(genresData);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError(err);
    }
  };

  const fetchMoods = async () => {
    try {
      const moodsData = await getMoodsWithCounts();
      setMoods(moodsData);
    } catch (err) {
      console.error('Error fetching moods:', err);
      setError(err);
    }
  };

  const fetchKeywords = async () => {
    try {
      const keywordsData = await getKeywordsWithCounts();
      setKeywords(keywordsData);
    } catch (err) {
      console.error('Error fetching keywords:', err);
      setError(err);
    }
  };

  const fetchFeatures = async () => {
    try {
      const featuresData = await getFeaturesWithCounts();
      setFeatures(featuresData);
    } catch (err) {
      console.error('Error fetching features:', err);
      setError(err);
    }
  };

  const fetchData = async (user) => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    try {
      const [genresData, moodsData, keywordsData, featuresData] = await Promise.all([
        getGenresWithCounts(),
        getMoodsWithCounts(),
        getKeywordsWithCounts(),
        getFeaturesWithCounts()
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
    fetchData(user);
  }, [user]);

  const value = useMemo(() => ({
    genres,
    moods,
    keywords,
    features,
    loading,
    error,
    refetch: () => fetchData(user),
    fetchGenres,
    fetchMoods,
    fetchKeywords,
    fetchFeatures,
  }), [genres, moods, keywords, features, loading, error, user]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);