import { Icon, plus } from "@wordpress/icons";
// @ts-ignore
import logo_32px from "./../../../assets/img/campaign_bay.svg";
import { useState, useEffect, FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { useGuide, useGuideStep } from "../../store/GuideContext";
import { TOUR_STEPS } from "../../utils/tourSteps";
import AddCampaignModal from "../Onboarding/AddCampaignModal";
import CustomModal from "./CustomModal";

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
                  className={`campaignbay-text-default campaignbay-font-[700]
                    campaignbay-cursor-pointer campaignbay-py-[8px] campaignbay-px-[16px] campaignbay-border-b md:campaignbay-border-b-0 campaignbay-border-gray-300 last:campaignbay-border-gray-300 ${
                    activeTab === menu.path
                      ? "campaignbay-text-blue-800 campaignbay-bg-gray-100 campaignbay-rounded-[0] md:campaignbay-rounded-[8px]"
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
              className="campaignbay-flex campaignbay-justify-center campaignbay-items-center campaignbay-px-[16px] campaignbay-py-[8px] campaignbay-rounded-[8px] campaignbay-border campaignbay-border-[#3858e9] campaignbay-text-[#3858e9] !campaignbay-text-default campaignbay-font-[700] campaignbay-whitespace-nowrap !campaignbay-gap-2 campaignbay-transition-all campaignbay-duration-300 campaignbay-ease-in-out hover:campaignbay-bg-[#3858e9] hover:campaignbay-text-white campaignbay-m-[12px] md:campaignbay-m-[0]"
              onClick={() => {
                if (tourStep === 1) {
                  setTourStep(TOUR_STEPS.BLANK_CAMPAIGN);
                }
                setIsModalOpen(true);
              }}
            >
              {__("Add Campaign", "campaignbay")}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 10C0 4.44444 4.44444 0 10 0C15.5556 0 20 4.44444 20 10C20 15.5556 15.5556 20 10 20C4.44444 20 0 15.5556 0 10ZM11 9V5H9V9H5V11H9V15H11V11H15V9H11Z"
                  
                />
              </svg>
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
