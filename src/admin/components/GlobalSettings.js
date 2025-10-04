import Checkbox from "./Checkbox";
import SettingCard from "./SettingCard";
import Select from "./Select";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";

import Toggle from "./Toggle";
import { Eye, Save, Trash2 } from "lucide-react";
import { Icon, seen, trash } from "@wordpress/icons";
import LogViewerModal from "./LogViewerModal";
import { useToast } from "../store/toast/use-toast";
import apiFetch from "@wordpress/api-fetch";

const GlobalSettings = ({ globalSettings, setGlobalSettings }) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);
  const { addToast } = useToast();
  const openLogViewer = () => {
    setIsLogModalOpen(true);
  };

  const handleClearLogs = async () => {
    setIsClearingLogs(true);
    let wasSuccessful = false;

    try {
      const response = await apiFetch({
        path: "/campaignbay/v1/logs",
        method: "DELETE",
      });

      // 3. Display a success notice.
      addToast(__("Log files cleared successfully.", "campaignbay"), "success");
      wasSuccessful = true;
    } catch (error) {
      // 4. Display an error notice if something goes wrong.
      const errorMessage = error.message || "An unknown error occurred.";
      addToast(
        __("Error clearing logs: ", "campaignbay") + errorMessage,
        "error"
      );
      console.error("Clear logs error:", error);
      wasSuccessful = false;
    }
    setIsClearingLogs(false);
    return wasSuccessful;
  };

  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title={__("Global Options", "campaignbay")}>
        <Toggle
          label={__("Enable Discount Add-on", "campaignbay")}
          help={__(
            "Turn off to temporarily disable all discount campaigns.",
            "campaignbay"
          )}
          checked={globalSettings.global_enableAddon}
          onChange={() =>
            setGlobalSettings((prev) => ({
              ...prev,
              global_enableAddon: !prev.global_enableAddon,
            }))
          }
        />
        <Select
          className="w-100"
          label={__("Bulk Table Position", "campaignbay")}
          help={__("Select the position to show the bulk table", "campaignbay")}
          options={[
            { label: __("Below Cart", "campaignbay"), value: "below_cart" },
            { label: __("Above Cart", "campaignbay"), value: "above_cart" },
          ]}
          value={globalSettings.position_to_show_bulk_table}
          onChange={(value) =>
            setGlobalSettings((prev) => ({
              ...prev,
              position_to_show_bulk_table: value,
            }))
          }
        />
        <Select
          className="w-100"
          label={__("Discount Bar Position", "campaignbay")}
          help={__(
            "Select the position to show the discount bar",
            "campaignbay"
          )}
          options={[
            { label: __("Below Cart", "campaignbay"), value: "below_cart" },
            { label: __("Above Cart", "campaignbay"), value: "above_cart" },
          ]}
          value={globalSettings.position_to_show_discount_bar}
          onChange={(value) =>
            setGlobalSettings((prev) => ({
              ...prev,
              position_to_show_discount_bar: value,
            }))
          }
        />

        <Select
          className="w-100"
          label={__("Calculate Discount From", "campaignbay")}
          help={__(
            "Select the price to calculate discounts from",
            "campaignbay"
          )}
          options={[
            {
              label: __("Regular Price", "campaignbay"),
              value: "regular_price",
            },
            { label: __("Sale Price", "campaignbay"), value: "sale_price" },
          ]}
          value={globalSettings.global_calculate_discount_from}
          onChange={(value) =>
            setGlobalSettings((prev) => ({
              ...prev,
              global_calculate_discount_from: value,
            }))
          }
        />
      </SettingCard>
      <SettingCard title={__("Performence & Caching", "campaignbay")}>
        <Checkbox
          checked={globalSettings.perf_enableCaching}
          onChange={() =>
            setGlobalSettings((prev) => ({
              ...prev,
              perf_enableCaching: !prev.perf_enableCaching,
            }))
          }
          label={__("Enable Discount Caching", "campaignbay")}
          help={__(
            "Improve performance by caching discount rule calculations. Clear cache if rules don't seem to apply immediately",
            "campaignbay"
          )}
        />

        <div className="wpab-cb-btn-con-bottom">
          <button className="wpab-cb-btn wpab-cb-btn-outline-danger">
            <Icon icon={trash} fill="currentColor" />
            {__("Clear Discount Cache", "campaignbay")}
          </button>
        </div>
      </SettingCard>
      <SettingCard title={__("Debugging & Logging", "campaignbay")}>
        <Checkbox
          checked={globalSettings.debug_enableMode}
          onChange={() =>
            setGlobalSettings((prev) => ({
              ...prev,
              debug_enableMode: !prev.debug_enableMode,
            }))
          }
          label={__("Enable Debug Mode", "campaignbay")}
          help={__(
            "Show detailed error messages and logging for troubleshooting.",
            "campaignbay"
          )}
        />

        <div className="wpab-cb-btn-con-bottom">
          <button
            className="wpab-cb-btn wpab-cb-btn-outline-primary"
            onClick={openLogViewer}
          >
            <Icon icon={seen} fill="currentColor" />
            {__("View Logs", "campaignbay")}
          </button>
          <button
            className="wpab-cb-btn wpab-cb-btn-outline-danger"
            onClick={handleClearLogs}
            disabled={isClearingLogs}
          >
            <Icon icon={trash} fill="currentColor" />
            {__("Clear Log Files", "campaignbay")}
          </button>
        </div>
      </SettingCard>
      <LogViewerModal
        isLogModalOpen={isLogModalOpen}
        setIsLogModalOpen={setIsLogModalOpen}
        handleClearLogs={handleClearLogs}
        isClearingLogs={isClearingLogs}
      />
    </div>
  );
};

export default GlobalSettings;
