import { Icon, plus } from "@wordpress/icons";
import logo_32px from "../../../assets/img/logo-32px.png";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
export default function Navbar() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menus = [
    {
      label: "Dashboard",
      path: "/",
    },

    {
      label: "Campaigns",
      path: "/campaigns",
    },

    {
      label: "Settings",
      path: "/settings",
    },
  ];
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  useEffect(() => {
    setActiveTab(currentPath);
    // alert(currentPath);
  }, [currentPath]);

  return (
    <>
      <div className="campaignbay-bg-white campaignbay-p-0 !campaignbay-border-0 !campaignbay-border-b !campaignbay-border-gray-300 campaignbay-z-50 campaignbay-relative">
        <div className="campaignbay-flex campaignbay-px-12 campaignbay-justify-between campaignbay-items-center campaignbay-flex-wrap md:campaignbay-flex-nowrap campaignbay-gap-4 campaignbay-relative">
          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-4 campaignbay-py-12">
            <img
              src={logo_32px}
              alt="CampaignBay Logo"
              className="campaignbay-h-32 campaignbay-w-auto"
            />
          </div>
          <div
            className={` campaignbay-flex-1 md:campaignbay-flex-none campaignbay-flex-col md:campaignbay-flex-row campaignbay-justify-stretch md:campaignbay-items-center campaignbay-absolute md:campaignbay-relative campaignbay-top-[102%] md:campaignbay-top-auto campaignbay-left-0  campaignbay-w-full md:campaignbay-w-auto campaignbay-gap-0 md:campaignbay-gap-6 campaignbay-bg-white !campaignbay-border-0  ${
              isMobileMenuOpen
                ? "campaignbay-flex  "
                : " campaignbay-hidden md:campaignbay-flex"
            }`}
          >
            <nav className="campaignbay-items-stretch md:campaignbay-items-center  campaignbay-gap-0 md:campaignbay-gap-0 campaignbay-flex campaignbay-flex-col md:campaignbay-flex-row campaignbay-w-full">
              {menus.map((menu) => (
                <span
                  key={menu.path}
                  className={`campaignbay-text-base campaignbay-font-medium campaignbay-cursor-pointer campaignbay-p-12 md:campaignbay-p-4 campaignbay-py-8 campaignbay-pl-8 md:campaignbay-pl-0 campaignbay-border-b md:campaignbay-border-b-0 campaignbay-border-gray-300 last:campaignbay-border-gray-300 ${
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
              className="campaignbay-flex campaignbay-justify-center
               campaignbay-items-center campaignbay-p-8 campaignbay-px-12 campaignbay-rounded-[2px] campaignbay-border campaignbay-border-blue-800 campaignbay-text-blue-900 !campaignbay-text-base campaignbay-whitespace-nowrap !campaignbay-gap-0 campaignbay-transition-all campaignbay-duration-300 campaignbay-ease-in-out hover:campaignbay-bg-blue-800 hover:campaignbay-text-white campaignbay-m-12 md:campaignbay-m-0"
              onClick={() => navigate("/campaigns/add")}
            >
              {__("Add Campaign", "campaignbay")}
              <Icon
                icon={plus}
                fill="currentColor"
                size={20}
                style={{ marginTop: "2px" }}
              />
            </button>
          </div>

          {/* toggle button for mobile */}
          <button
            className="campaignbay-flex md:campaignbay-hidden campaignbay-items-center campaignbay-gap-2 campaignbay-text-gray-800 hover:campaignbay-text-blue-800 tr"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="campaignbay-transition-all campaignbay-duration-300 campaignbay-ease-in-out"
            >
              {isMobileMenuOpen ? (
                <>
                  <path
                    d="M6 6L18 18"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M3 12H21"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 6H21"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 18H21"
                    stroke="#6B7280"
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
      {/* menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="campaignbay-fixed campaignbay-top-0 campaignbay-left-0 campaignbay-w-full campaignbay-h-full campaignbay-bg-black campaignbay-opacity-60 campaignbay-z-40 md:campaignbay-hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
