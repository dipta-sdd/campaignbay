import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import apiFetch from "@wordpress/api-fetch";
import { CbStore, CampaignBaySettingsType } from "../utils/types";

interface CbStoreContextType {
  store: CbStore;
  updateStore: <K extends keyof CbStore>(key: K, value: CbStore[K]) => void;
  updateSettings: <K extends keyof CampaignBaySettingsType>(
    key: K,
    value: CampaignBaySettingsType[K],
  ) => void;
}

const CbStoreContext = createContext<CbStoreContextType | null>(null);

interface CbStoreProviderProps {
  children: ReactNode;
  value: CbStore;
}

export const CbStoreProvider: React.FC<CbStoreProviderProps> = ({
  children,
  value: initialValue,
}) => {
  const [store, setStore] = useState<CbStore>(initialValue);
  const isInitialized = useRef(false);

  // Setup API fetch middleware only once
  useEffect(() => {
    if (!isInitialized.current) {
      apiFetch.use(apiFetch.createNonceMiddleware(initialValue.nonce));
      apiFetch.use(apiFetch.createRootURLMiddleware(initialValue.rest_url));
      isInitialized.current = true;
    }
  }, [initialValue.nonce, initialValue.rest_url]);

  // Update a specific key in the store
  const updateStore = <K extends keyof CbStore>(key: K, value: CbStore[K]) => {
    setStore((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Update a specific setting within campaignbay_settings
  const updateSettings = <K extends keyof CampaignBaySettingsType>(
    key: K,
    value: CampaignBaySettingsType[K],
  ) => {
    setStore((prev) => ({
      ...prev,
      campaignbay_settings: {
        ...prev.campaignbay_settings,
        [key]: value,
      },
    }));
  };

  const contextValue: CbStoreContextType = {
    store,
    updateStore,
    updateSettings,
  };

  return (
    <CbStoreContext.Provider value={contextValue}>
      {children}
    </CbStoreContext.Provider>
  );
};

export const useCbStore = (): CbStore => {
  const context = useContext(CbStoreContext);

  if (!context) {
    throw new Error("useCbStore must be used within a CbStoreProvider");
  }

  return context.store;
};

// Hook to get both store and update functions
export const useCbStoreActions = () => {
  const context = useContext(CbStoreContext);

  if (!context) {
    throw new Error("useCbStoreActions must be used within a CbStoreProvider");
  }

  return {
    store: context.store,
    updateStore: context.updateStore,
    updateSettings: context.updateSettings,
  };
};

export default CbStoreContext;
