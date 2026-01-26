import { Outlet } from "react-router-dom";
import { FC } from "react";
import { GuideProvider } from "../../store/GuideContext";
import Guide from "../../old/Guide";
import TourGuard from "../../old/TourGuard";
import Navbar from "./Navbar";
import { useCbStore } from "../../store/cbStore";
import FirstCampaign from "../Onboarding/FirstCampaign";
import { __ } from "@wordpress/i18n";

const AppLayout: FC = () => {
  const { onboarding } = useCbStore();
  return (
    <div className="wpab-cb-container radius-large">
      <GuideProvider>
        <Navbar />
        <Notifications />
        {!onboarding.first_campaign ? <FirstCampaign /> : null}
        <Outlet />
        <TourGuard />
        <Guide />
      </GuideProvider>
    </div>
  );
};

export default AppLayout;

const Notifications = () => {
  const { campaignbay_settings } = useCbStore();
  if (!campaignbay_settings) return null;
  if (!campaignbay_settings.global_enableAddon) {
    return (
      <div className="campaignbay-w-full campaignbay-flex campaignbay-flex-col campaignbay-items-end campaignbay-justify-start campaignbay-p-[12px]">
        <div className="campaignbay-bg-red-50/50 campaignbay-border-red-200 campaignbay-border-[1px] campaignbay-p-[12px] campaignbay-rounded-[8px] campaignbay-flex campaignbay-items-center campaignbay-justify-start campaignbay-w-full campaignbay-backdrop-blur-[8px]">
          <p className="campaignbay-text-red-500">
            {__("CampaignBay is disabled. Enable it from ", "campaignbay")}
            <a href="#/settings" className="campaignbay-text-blue-800 campaignbay-underline campaignbay-underline-offset-4">{__("Settings", "campaignbay")}</a>
            {__(" to start using CampaignBay.", "campaignbay")}
          </p>
        </div>
      </div>
    );
  }
  return null;
};
