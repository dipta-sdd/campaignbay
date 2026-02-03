import { Outlet } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useCbStore } from "../../store/cbStore";
import FirstCampaign from "../Onboarding/FirstCampaign";
import { __ } from "@wordpress/i18n";
import { GuideProvider } from "../../store/GuideContext";
import { WandSparkles } from "lucide-react";

const AppLayout: FC = () => {
  const { onboarding } = useCbStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  useEffect(() => {
    if (!onboarding?.first_campaign) {
      setShowOnboarding(true);
    }
  }, [onboarding]);
  return (
    <div className="wpab-cb-container radius-large">
      <GuideProvider>
        <Navbar />
        <Notifications />
        <FirstCampaign isOpen={showOnboarding} setIsOpen={setShowOnboarding} />
        <Outlet />
        {/* <TourGuard />
        <Guide /> */}
        <button
          className="campaignbay-fixed campaignbay-bottom-[20px] campaignbay-right-[20px] campaignbay-text-white campaignbay-rounded-full campaignbay-p-[12px] campaignbay-shadow-xl campaignbay-transition-all campaignbay-duration-300 hover:campaignbay-scale-110 hover:campaignbay-shadow-[#EE00FF]/30 campaignbay-z-[100]"
          style={{ background: "linear-gradient(to bottom, #EE00FF, #3300B3)" }}
          onClick={() => setShowOnboarding(true)}
        >
          <WandSparkles size={24} />
        </button>
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
            <a
              href="#/settings"
              className="campaignbay-text-blue-800 campaignbay-underline campaignbay-underline-offset-4"
            >
              {__("Settings", "campaignbay")}
            </a>
            {__(" to start using CampaignBay.", "campaignbay")}
          </p>
        </div>
      </div>
    );
  }
  return null;
};
