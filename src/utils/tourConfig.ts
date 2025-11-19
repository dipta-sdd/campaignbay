import { TourConfig } from "../components/Guide";

export const mainTourConfig: TourConfig = {
  1: {
    text: "Click here to start creating a new marketing campaign.",
    position: "bottom-left",
    showNext: true,
    onNext: ({ next, setStep , navigate}) => {
      console.log("Next button clicked on step 2");
      navigate("/campaigns/add");
      next();
    },
  },
  2: {
    text: "Give your campaign a title. For example, 'Summer Sale'.",
    position: "bottom",
    showNext: true,
    autoFocus: true,
  },
  3: {
    text: "Once you're done, click here to save your campaign.",
    position: "bottom-left",
    showNext: false,
  },
};
