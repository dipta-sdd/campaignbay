import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  RefObject,
  useEffect,
  useState,
} from "react";
import { GuideContextType, TourConfig } from "../types";
import { campaignTourConfig } from "../utils/tourConfig";
import { TOUR_STEPS } from "../utils/tourSteps";

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tourStep, setTourStep] = useState<number>(TOUR_STEPS.USAGE_TOGGLE);
  const [config, setConfig] = useState<TourConfig>(campaignTourConfig);
  const refs = useRef<Record<number, RefObject<HTMLElement>>>({});

  const registerRef = useCallback(
    (step: number, ref: RefObject<HTMLElement>) => {
      refs.current[step] = ref;
    },
    []
  );

  const getRef = useCallback((step: number) => {
    return refs.current[step];
  }, []);

  const value = {
    tourStep,
    setTourStep,
    registerRef,
    getRef,
    config,
    setConfig,
  };

  return (
    <GuideContext.Provider value={value}>{children}</GuideContext.Provider>
  );
};

export const useGuide = (): GuideContextType => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error("useGuide must be used within a GuideProvider");
  }
  return context;
};

export const useGuideStep = <T extends HTMLElement>(step: number) => {
  const ref = useRef<T>(null);
  const { registerRef } = useGuide();

  useEffect(() => {
    // Only register if the ref is actually attached to something
    if (ref.current) {
      registerRef(step, ref);
    }
  }, [registerRef, step]); // You might need to add ref.current to deps or use a callback ref

  // Better: Use a callback ref to know exactly when the element mounts
  const setRef = useCallback(
    (node: T | null) => {
      if (node) {
        // Create a fake RefObject to pass to your context, or update context to accept raw nodes
        registerRef(step, { current: node });
      }
    },
    [registerRef, step]
  );

  return setRef;
};
