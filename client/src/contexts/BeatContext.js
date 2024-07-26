import React, { createContext, useState, useContext, useEffect } from 'react';

const BeatContext = createContext();

export const BeatProvider = ({ children }) => {
  const [hoveredBeat, setHoveredBeat] = useState(null);

  return (
    <BeatContext.Provider value={{ hoveredBeat, setHoveredBeat }}>
      {children}
    </BeatContext.Provider>
  );
};

export const useBeat = () => useContext(BeatContext);