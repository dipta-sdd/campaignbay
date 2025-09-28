import { useState } from "react";

export default function TabPanel({ tabs, children }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.name);
  const style = {
    width: "100%",
    maxWidth: "min(100% - 20px, 1500px)",
  };
  return (
    <>
      <div className="wpab-cb-settings-tabs ">
        <div
          className="campaignbay-flex campaignbay-flex-row campaignbay-gap-0 campaignbay-justify-start campaignbay-items-center"
          style={style}
        >
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className={`campaignbay-px-[16px] campaignbay-flex campaignbay-items-center campaignbay-h-[48px] campaignbay-cursor-pointer campaignbay-font-medium ${
                tab.name === activeTab
                  ? "campaignbay-border-b-2 campaignbay-border-blue-800"
                  : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.title}
            </div>
          ))}
        </div>
      </div>
      <div className="wpab-cb-settings-tab-content">
        {children(tabs.find((tab) => tab.name === activeTab))}
      </div>
    </>
  );
}
