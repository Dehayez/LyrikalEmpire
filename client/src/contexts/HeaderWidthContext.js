import React, { createContext, useState, useContext, useEffect } from 'react';

const HeaderWidthContext = createContext();

export const HeaderWidthProvider = ({ children }) => {
  const [headerWidths, setHeaderWidths] = useState({});

  return (
    <HeaderWidthContext.Provider value={{ headerWidths, setHeaderWidths }}>
      {children}
    </HeaderWidthContext.Provider>
  );
};

export const useHeaderWidths = () => useContext(HeaderWidthContext);