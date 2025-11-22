import { Outlet } from "react-router-dom";
import { FC } from "react";
import { GuideProvider } from "../store/GuideContext";
import Guide from "./Guide";
import TourGuard from "./TourGuard";

const AppLayout: FC = () => {
  return (
    <div className="wpab-cb-container radius-large">
      <GuideProvider>
        <Outlet />
        <TourGuard />
        <Guide />
      </GuideProvider>
    </div>
  );
};

export default AppLayout;
