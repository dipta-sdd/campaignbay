import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGuide } from "../store/GuideContext";
import { useCbStore } from "../store/cbStore";
import { TOUR_STEPS } from "../utils/tourSteps";

const TourGuard = () => {
  const location = useLocation();
  const { tourStep, setTourStep } = useGuide();
  const { has_seen_guide } = useCbStore();

  useEffect(() => {
    if (!has_seen_guide) {
      const currentPath = location.pathname;
      if (currentPath === "/campaigns/add") {
        setTourStep(TOUR_STEPS.TITLE);
      } else {
        setTourStep(TOUR_STEPS.START);
      }
    }
  }, [has_seen_guide]);


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
          return [1];
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
