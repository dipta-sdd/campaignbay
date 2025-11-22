import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGuide } from "../store/GuideContext";

const TourGuard = () => {
  const location = useLocation();
  const { tourStep, setTourStep } = useGuide();

  useEffect(() => {
    if (tourStep === 0) return;

    const currentPath = location.pathname;

    const getAllowedSteps = (path: string): number[] => {
      const range = (start: number, end: number) =>
        Array.from({ length: end - start + 1 }, (_, i) => start + i);

      const normalizedPath = path.replace(/\/+$/, "") || "/";

      switch (normalizedPath) {
        case "/":
        case "/dashboard":
        case "/campaigns":
          return [1];

        case "/campaigns/add":
          return range(2, 100);

        case "/settings":
        default:
          return [];
      }
    };

    const allowed = getAllowedSteps(currentPath);

    if (!allowed.includes(tourStep)) {
      console.warn(
        `TourGuard: Step ${tourStep} is not allowed on ${currentPath}. Closing tour.`
      );
      setTourStep(0);
    }
  }, [location.pathname, tourStep, setTourStep]);

  return null;
};

export default TourGuard;
