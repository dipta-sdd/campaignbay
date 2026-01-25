import { Outlet } from "react-router-dom";
import { FC } from "react";
import { GuideProvider } from "../../store/GuideContext";
import Guide from "../../old/Guide";
import TourGuard from "../../old/TourGuard";
import Navbar from "./Navbar";
import { useCbStore } from "../../store/cbStore";
import FirstCampaign from "../Onboarding/FirstCampaign";

const AppLayout: FC = () => {
  const { onboarding } = useCbStore();
  console.log(onboarding);
  return (
    <div className="wpab-cb-container radius-large">
      <GuideProvider>
        <Navbar />
        {!onboarding.first_campaign ? <FirstCampaign/> : null}
        <Outlet />
        <TourGuard />
        <Guide />
      </GuideProvider>
    </div>
  );
};

export default AppLayout;
