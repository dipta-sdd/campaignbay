import apiFetch from "@wordpress/api-fetch";
import { createContext, useContext } from "@wordpress/element";

// Create the context
const cbStore = createContext(null);

// Provider component
export const CbStoreProvider = ({ children, value }) => {
  console.log("adding middlewire");
  apiFetch.use(apiFetch.createNonceMiddleware(value?.nonce));
  apiFetch.use(apiFetch.createRootURLMiddleware(value?.rest_url));
  console.log(value?.nonce);
  console.log(value?.rest_url);
  return <cbStore.Provider value={value}>{children}</cbStore.Provider>;
};

// Custom hook for easy access
export const useCbStore = () => {
  const context = useContext(cbStore);
  if (!context) {
    throw new Error("useCbStore must be used within a CbStoreProvider");
  }
  return context;
};

export default cbStore;
