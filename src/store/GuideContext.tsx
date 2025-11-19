import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  RefObject,
  useEffect,
  useState,
} from "react";
import { TourConfig } from "../components/Guide";
import { mainTourConfig } from "../utils/tourConfig";

export interface GuideContextType {
  tourStep: number;
  setTourStep: (step: number) => void;
  registerRef: (step: number, ref: RefObject<HTMLElement>) => void;
  getRef: (step: number) => RefObject<HTMLElement> | undefined;
  config: TourConfig;
  setConfig: (config: TourConfig) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tourStep, setTourStep] = useState<number>(1);
  const [config, setConfig] = useState<TourConfig>(mainTourConfig);
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

export const useGuideStep = <T extends HTMLElement>(
  step: number
): RefObject<T> => {
  const ref = useRef<T>(null);
  const { registerRef } = useGuide();

  useEffect(() => {
    registerRef(step, ref as RefObject<HTMLElement>);
  }, [registerRef, step]);

  return ref;
};
