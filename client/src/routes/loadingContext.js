import React, { createContext, useContext } from 'react';

const loadingContext = createContext();

export const getLoadingFunc = () => {
  return useContext(loadingContext);
};

export default loadingContext;