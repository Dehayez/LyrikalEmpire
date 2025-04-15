import React, { createContext, useContext } from 'react';
import { usePanels } from '../hooks/usePanels';

const PanelContext = createContext();

export const PanelProvider = ({ children }) => {
  const panelState = usePanels();

  return (
    <PanelContext.Provider value={panelState}>
      {children}
    </PanelContext.Provider>
  );
};

export const usePanel = () => useContext(PanelContext);