import { Outlet } from "react-router-dom";
import { FC } from "react";
import { GuideProvider } from "../../store/GuideContext";
import Guide from "../../old/Guide";
import TourGuard from "../../old/TourGuard";
import Navbar from "./Navbar";

const AppLayout: FC = () => {
  return (
    <div className="wpab-cb-container radius-large">
      <GuideProvider>
        <Navbar />
        <Outlet />
        <TourGuard />
        <Guide />
      </GuideProvider>
    </div>
  );
};

export default AppLayout;
