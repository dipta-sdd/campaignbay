import { FC, Dispatch, SetStateAction } from "react";
import SettingCard from "./SettingCard";
import Checkbox from "./Checkbox";
import { __ } from "@wordpress/i18n";

export interface AdvancedSettingsType {
  advanced_deleteAllOnUninstall: boolean;
}

interface AdvancedSettingsProps {
  advancedSettings: AdvancedSettingsType;
  setAdvancedSettings: Dispatch<SetStateAction<AdvancedSettingsType>>;
  setEdited: Dispatch<SetStateAction<boolean>>;
}

const AdvancedSettings: FC<AdvancedSettingsProps> = ({
  advancedSettings,
  setAdvancedSettings,
  setEdited,
}) => {
  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title={__("Advanced Settings", "campaignbay")}>
        <Checkbox
          checked={advancedSettings.advanced_deleteAllOnUninstall}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEdited(true);
            setAdvancedSettings((prev) => ({
              ...prev,
              advanced_deleteAllOnUninstall: e.target.checked,
            }));
          }}
          label={__("Delete All Data on Uninstall", "campaignbay")}
          help={__(
            "Delete all data when the plugin is uninstalled",
            "campaignbay"
          )}
        />
      </SettingCard>
    </div>
  );
};

export default AdvancedSettings;
