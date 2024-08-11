import React, { createContext, useContext } from "react";

const selectedChatsArrObjContext = createContext();

export const getSelectedFunc = () => {
  return useContext(selectedChatsArrObjContext);
};

export default selectedChatsArrObjContext;
