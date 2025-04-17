import React, { createContext, useContext, useState } from 'react';

const XPContext = createContext();

export const XPProvider = ({ children }) => {
  const [currentXP, setCurrentXP] = useState(0);

  return (
    <XPContext.Provider value={{ currentXP, setCurrentXP }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => useContext(XPContext);