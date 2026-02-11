import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import apiFetch from "@wordpress/api-fetch";
import { CampaignBaySettingsType } from "../components/settings/types";
import { CbStore } from "../utils/types";
import { date, getSettings as getDateSettings } from "@wordpress/date";

interface CbStoreContextType {
  store: CbStore;
  updateStore: <K extends keyof CbStore>(key: K, value: CbStore[K]) => void;
  updateSettings: <K extends keyof CampaignBaySettingsType>(
    key: K,
    value: CampaignBaySettingsType[K],
  ) => void;
  serverDate: Date;
  serverDateLoaded: boolean;
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

  // Initialize with local time, will update to server time
  const [serverDate, setServerDate] = useState(new Date());
  const [serverDateLoaded, setServerDateLoaded] = useState<boolean>(false);

  const { timezone } = getDateSettings();
  useEffect(() => {
    const updateServerTime = () => {
      const format = `${store.wpSettings?.dateFormat} ${store.wpSettings?.timeFormat}`;
      const localNow = new Date();
      const dateString = date(format, localNow, timezone?.offset);
      const d = new Date(dateString);

      if (!isNaN(d.getTime())) {
        setServerDate(d);
        if (!serverDateLoaded) {
          setServerDateLoaded(true);
        }
      }
    };

    updateServerTime();
    const timer = setInterval(updateServerTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [store.wpSettings, timezone]);

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
    serverDate,
    serverDateLoaded,
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
    serverDate: context.serverDate,
    serverDateLoaded: context.serverDateLoaded,
  };
};

export default CbStoreContext;
