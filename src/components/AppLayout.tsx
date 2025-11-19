import { Outlet } from "react-router-dom";
import { FC } from "react";
import { GuideProvider } from "../store/GuideContext";
import Guide, { TourConfig } from "./Guide";
import { mainTourConfig } from "../utils/tourConfig";

const AppLayout: FC = () => {
  return (
    <div className="wpab-cb-container radius-large">
      <GuideProvider>
        <Outlet />

        <Guide/>
      </GuideProvider>
    </div>
  );
};

export default AppLayout;
