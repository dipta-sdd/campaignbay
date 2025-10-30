import { FC, ReactNode, Dispatch, SetStateAction } from "react";
import { ActiveTab } from "../pages/Settings";

interface Tab {
  name: ActiveTab;
  title: string;
}
interface TabPanelProps {
  tabs: Tab[];
  activeTab: ActiveTab;
  setActiveTab: (v: ActiveTab) => void;
  children: ReactNode;
}

const TabPanel: FC<TabPanelProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  children,
}) => {
  const style: React.CSSProperties = {
    width: "100%",
    maxWidth: "min(100% - 20px, 1500px)",
  };

  return (
    <>
      <div className="wpab-cb-settings-tabs">
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
      <div className="wpab-cb-settings-tab-content">{children}</div>
    </>
  );
};

export default TabPanel;
