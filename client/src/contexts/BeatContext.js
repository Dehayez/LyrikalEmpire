import React, { createContext, useContext, useState } from 'react';

const BeatContext = createContext();

export const useBeat = () => useContext(BeatContext);

export const BeatProvider = ({ children }) => {
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [isInputFocused, setInputFocused] = useState(false);

  return (
    <BeatContext.Provider value={{ hoveredBeat, setHoveredBeat, isInputFocused, setInputFocused }}>
      {children}
    </BeatContext.Provider>
  );
};