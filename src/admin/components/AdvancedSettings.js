import { useState } from "@wordpress/element";
import MultiSelect from "./Multiselect";
import SettingCard from "./SettingCard";
import Checkbox from "./Checkbox";

const AdvancedSettings = ({ advancedSettings, setAdvancedSettings }) => {
  const [selected, setSelected] = useState(["africa"]);
  const options = [
    {
      label: "Africa",
      value: "africa",
    },
    {
      label: "America",
      value: "america",
    },
    {
      label: "Antarctica",
      value: "antarctica",
    },
    {
      label: "Asia",
      value: "asia",
    },
  ];
  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title="Advanced Settings">
        <Checkbox
          checked={advancedSettings.advanced_deleteAllOnUninstall}
          onChange={() =>
            setAdvancedSettings((prev) => ({
              ...prev,
              advanced_deleteAllOnUninstall:
                !prev.advanced_deleteAllOnUninstall,
            }))
          }
          label="Delete All Data on Uninstall"
          help={"Delete all data when the plugin is uninstalled"}
        />
      </SettingCard>
    </div>
  );
};

export default AdvancedSettings;
