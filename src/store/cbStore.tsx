import React, { createContext, useContext, ReactNode } from "react";
import apiFetch from "@wordpress/api-fetch";
import { CbStore } from "../old/types";

type CbStoreContextType = CbStore | null;
const CbStoreContext = createContext<CbStoreContextType>(null);
interface CbStoreProviderProps {
  children: ReactNode;
  value: CbStore;
}

export const CbStoreProvider: React.FC<CbStoreProviderProps> = ({
  children,
  value,
}) => {
  apiFetch.use(apiFetch.createNonceMiddleware(value.nonce));
  apiFetch.use(apiFetch.createRootURLMiddleware(value.rest_url));
  return (
    <CbStoreContext.Provider value={value}>{children}</CbStoreContext.Provider>
  );
};

export const useCbStore = (): CbStore => {
  const context = useContext(CbStoreContext);

  if (!context) {
    throw new Error("useCbStore must be used within a CbStoreProvider");
  }

  return context;
};

export default CbStoreContext;
