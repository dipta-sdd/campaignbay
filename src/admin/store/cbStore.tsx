import React, { createContext, useContext, ReactNode } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { CbStore } from '../types'; // Assuming your types are in '../types.ts'

// 1. Define the type for the context value. It can be the full CbStore object or null initially.
type CbStoreContextType = CbStore | null;

// 2. Create the context with the correct type.
const CbStoreContext = createContext<CbStoreContextType>(null);

// 3. Define the props for the provider component.
interface CbStoreProviderProps {
  children: ReactNode; // `ReactNode` is the correct type for children in React.
  value: CbStore;
}

/**
 * The provider component that makes the cbStore available to all child components.
 * It also configures the @wordpress/api-fetch instance with the nonce and root URL.
 */
export const CbStoreProvider: React.FC<CbStoreProviderProps> = ({ children, value }) => {
  // Configure api-fetch once when the provider mounts.
  // The value object is now strongly typed.
  apiFetch.use(apiFetch.createNonceMiddleware(value.nonce));
  apiFetch.use(apiFetch.createRootURLMiddleware(value.rest_url));

  return (
    <CbStoreContext.Provider value={value}>
      {children}
    </CbStoreContext.Provider>
  );
};

/**
 * Custom hook for easy and type-safe access to the cbStore context.
 * It ensures the context is available and returns the strongly-typed store object.
 */
export const useCbStore = (): CbStore => {
  const context = useContext(CbStoreContext);

  // This check acts as a type guard.
  // If context is null, we throw an error.
  // TypeScript knows that if the hook proceeds, 'context' is guaranteed to be of type 'CbStore'.
  if (!context) {
    throw new Error("useCbStore must be used within a CbStoreProvider");
  }
  
  // The return type is correctly inferred as `CbStore`, not `CbStore | null`.
  return context;
};

export default CbStoreContext;