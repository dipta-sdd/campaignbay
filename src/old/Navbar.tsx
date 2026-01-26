import { Icon, plus } from "@wordpress/icons";
// @ts-ignore
import logo_32px from "./../../assets/img/campaign_bay.svg";
import { useState, useEffect, FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { useGuide, useGuideStep } from "../store/GuideContext";
import { TOUR_STEPS } from "../utils/tourSteps";
import CustomModal from "../components/common/CustomModal";
import { Plus, Tag } from "lucide-react";
import AddCampaignModal from "./Onboarding/AddCampaignModal";

interface MenuLink {
  label: string;
  path: string;
}

const Navbar: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const addCampaignBtnRef = useGuideStep<HTMLButtonElement>(TOUR_STEPS.START);
  const { setTourStep, tourStep, isModalOpen, setIsModalOpen } = useGuide();

  const menus: MenuLink[] = [
    {
      label: __("Dashboard", "campaignbay"),
      path: "/",
    },
    {
      label: __("Campaigns", "campaignbay"),
      path: "/campaigns",
    },
    {
      label: __("Settings", "campaignbay"),
      path: "/settings",
    },
  ];

  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  useEffect(() => {
    const basePath = "/" + (currentPath.split("/")[1] || "");
    // setActiveTab(currentPath);
    setActiveTab(basePath);
  }, [currentPath]);

  return (
    <>
      <div className="campaignbay-bg-white campaignbay-p-0 !campaignbay-border-0 !campaignbay-border-b !campaignbay-border-gray-300 campaignbay-z-50 campaignbay-relative">
        <div className="campaignbay-flex campaignbay-px-[12px] campaignbay-justify-between campaignbay-items-center campaignbay-flex-wrap md:campaignbay-flex-nowrap campaignbay-gap-[4px] campaignbay-relative">
          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[4px] campaignbay-py-[12px]">
            <img
              src={logo_32px}
              alt="CampaignBay Logo"
              className="campaignbay-h-[32px] campaignbay-w-auto"
            />
          </div>
          <div
            className={`campaignbay-flex-1 md:campaignbay-flex-none campaignbay-flex-col md:campaignbay-flex-row campaignbay-justify-stretch md:campaignbay-items-center campaignbay-absolute md:campaignbay-relative campaignbay-top-[102%] md:campaignbay-top-auto campaignbay-left-0 campaignbay-w-full md:campaignbay-w-auto campaignbay-gap-0 md:campaignbay-gap-[6px] campaignbay-bg-white !campaignbay-border-0 ${
              isMobileMenuOpen
                ? "campaignbay-flex"
                : "campaignbay-hidden md:campaignbay-flex"
            }`}
          >
            <nav className="campaignbay-items-stretch md:campaignbay-items-center campaignbay-gap-0 campaignbay-flex campaignbay-flex-col md:campaignbay-flex-row campaignbay-w-full">
              {menus.map((menu) => (
                <span
                  key={menu.path}
                  className={`campaignbay-text-base campaignbay-font-medium campaignbay-cursor-pointer campaignbay-p-[12px] campaignbay-py-[8px] campaignbay-pl-[8px] campaignbay-border-b md:campaignbay-border-b-0 campaignbay-border-gray-300 last:campaignbay-border-gray-300 ${
                    activeTab === menu.path
                      ? "campaignbay-text-blue-800"
                      : "campaignbay-text-gray-800 hover:campaignbay-text-blue-800"
                  }`}
                  onClick={() => {
                    navigate(menu.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {menu.label}
                </span>
              ))}
            </nav>
            <button
              ref={addCampaignBtnRef}
              className="campaignbay-flex campaignbay-justify-center campaignbay-items-center campaignbay-p-[8px] campaignbay-px-[12px] campaignbay-rounded-[4px] campaignbay-border campaignbay-border-[3858e9] campaignbay-text-[#`3858e9] !campaignbay-text-base campaignbay-whitespace-nowrap !campaignbay-gap-0 campaignbay-transition-all campaignbay-duration-300 campaignbay-ease-in-out hover:campaignbay-bg-[#3858e9] hover:campaignbay-text-white campaignbay-m-[12px] md:campaignbay-m-0"
              onClick={() => {
                if (tourStep === 1) {
                  setTourStep(TOUR_STEPS.BLANK_CAMPAIGN);
                }
                setIsModalOpen(true);
              }}
            >
              {__("Add Campaign", "campaignbay")}
              <span className="campaignbay-w-[20px] campaignbay-h-[20px] campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-bg-[#3858e9] campaignbay-rounded-full">
                <Icon
                  icon={plus}
                  fill="currentColor"
                  size={20}
                  style={{ marginTop: "2px" }}
                />
              </span>
            </button>
          </div>
          <button
            className="campaignbay-flex md:campaignbay-hidden campaignbay-items-center campaignbay-gap-[2px] campaignbay-text-gray-800 hover:campaignbay-text-blue-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="campaignbay-transition-all campaignbay-duration-300 campaignbay-ease-in-out"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <>
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M3 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 6H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="campaignbay-fixed campaignbay-top-0 campaignbay-left-0 campaignbay-w-full campaignbay-h-full campaignbay-bg-black campaignbay-opacity-60 campaignbay-z-40 md:campaignbay-hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <CustomModal
        isOpen={isModalOpen}
        showHeader={true}
        maxWidth="campaignbay-add-campaigns-modal campaignbay-w-min"
        className="campaignbay-w-full !campaignbay-rounded-[4px] !campaignbay-max-h-[92vh]"
        onClose={() => setIsModalOpen(false)}
        title={__("Add Campaign", "campaignbay")}
        classNames={{
          header: "campaignbay-bg-blue-500b campaignbay-height-[44px]",
          body: "!campaignbay-p-0 campaignbay-w-min",
          footer: "",
        }}
      >
        <AddCampaignModal onClose={() => setIsModalOpen(false)} />
      </CustomModal>
    </>
  );
};

export default Navbar;
