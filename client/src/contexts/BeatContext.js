import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBeats } from '../services';

const BeatContext = createContext();

export const useBeat = () => useContext(BeatContext);

export const BeatProvider = ({ children }) => {
  const [beats, setBeats] = useState([]);
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [isInputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const data = await getBeats();
        setBeats(data);
      } catch (error) {
        console.error('Failed to fetch beats:', error);
      }
    };

    fetchBeats();
  }, []);

  return (
    <BeatContext.Provider value={{ beats, setBeats, hoveredBeat, setHoveredBeat, isInputFocused, setInputFocused }}>
      {children}
    </BeatContext.Provider>
  );
};