import React, { useState, FC, Dispatch, SetStateAction } from "react";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { Icon, seen, trash } from "@wordpress/icons";

import SettingCard from "./SettingCard";
import Checkbox from "./Checkbox";
import Select from "./Select";
import Toggle from "./Toggle";
import LogViewerModal from "./LogViewerModal";
import { useToast } from "../store/toast/use-toast";
import { GlobalSettingsType } from "../types";

interface GlobalSettingsProps {
  globalSettings: GlobalSettingsType;
  setGlobalSettings: Dispatch<SetStateAction<GlobalSettingsType | null>>;
  setEdited: Dispatch<SetStateAction<boolean>>;
}

const GlobalSettings: FC<GlobalSettingsProps> = ({
  globalSettings,
  setGlobalSettings,
  setEdited,
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isClearingLogs, setIsClearingLogs] = useState<boolean>(false);
  const { addToast } = useToast();

  const openLogViewer = () => {
    setIsLogModalOpen(true);
  };

  const handleClearLogs = async (): Promise<boolean> => {
    setIsClearingLogs(true);
    let wasSuccessful = false;
    try {
      await apiFetch({ path: "/campaignbay/v1/logs", method: "DELETE" });
      addToast(__("Log files cleared successfully.", "campaignbay"), "success");
      wasSuccessful = true;
    } catch (error: any) {
      const errorMessage =
        error.message || __("An unknown error occurred.", "campaignbay");
      addToast(
        `${__("Error clearing logs:", "campaignbay")} ${errorMessage}`,
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEdited(true);
            setGlobalSettings((prev) => ({
              ...prev,
              global_enableAddon: e.target.checked,
            }));
          }}
        />
        <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2 campaignbay-gap-[10px] campaignbay-w-full">
          <Select
            className="w-100"
            label={__("Bulk Table Position", "campaignbay")}
            help={__(
              "Select the position to show the bulk table",
              "campaignbay"
            )}
            options={[
              {
                label: __("Below Cart", "campaignbay"),
                value: "woocommerce_after_add_to_cart_form",
              },
              {
                label: __("Above Cart", "campaignbay"),
                value: "woocommerce_before_add_to_cart_form",
              },
              {
                label: __("Below Meta", "campaignbay"),
                value: "woocommerce_product_meta_end",
              },
              {
                label: __("Above Meta", "campaignbay"),
                value: "woocommerce_product_meta_start",
              },
            ]}
            value={globalSettings.position_to_show_bulk_table}
            onChange={(value) => {
              setEdited(true);
              setGlobalSettings((prev) => ({
                ...prev,
                position_to_show_bulk_table: String(value),
              }));
            }}
          />
          <Select
            className="w-100"
            label={__("Discount Bar Position", "campaignbay")}
            help={__(
              "Select the position to show the discount bar",
              "campaignbay"
            )}
            options={[
              {
                label: __("Below Cart", "campaignbay"),
                value: "woocommerce_after_add_to_cart_form",
              },
              {
                label: __("Above Cart", "campaignbay"),
                value: "woocommerce_before_add_to_cart_form",
              },
              {
                label: __("Below Meta", "campaignbay"),
                value: "woocommerce_product_meta_end",
              },
              {
                label: __("Above Meta", "campaignbay"),
                value: "woocommerce_product_meta_start",
              },
            ]}
            value={globalSettings.position_to_show_discount_bar}
            onChange={(value) => {
              setEdited(true);
              setGlobalSettings((prev) => ({
                ...prev,
                position_to_show_discount_bar: String(value),
              }));
            }}
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
            onChange={(value) => {
              setEdited(true);
              setGlobalSettings((prev) => ({
                ...prev,
                global_calculate_discount_from: value as
                  | "regular_price"
                  | "sale_price",
              }));
            }}
          />
        </div>
      </SettingCard>
      <SettingCard title={__("Performance & Caching", "campaignbay")}>
        <Checkbox
          checked={globalSettings.perf_enableCaching}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEdited(true);
            setGlobalSettings((prev) => ({
              ...prev,
              perf_enableCaching: e.target.checked,
            }));
          }}
          label={__("Enable Discount Caching", "campaignbay")}
          help={__(
            "Improve performance by caching discount rule calculations. Clear cache if rules don't seem to apply immediately",
            "campaignbay"
          )}
        />
        <div className="wpab-cb-btn-con-bottom">
          <button className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-outline-danger">
            <Icon icon={trash} fill="currentColor" />
            {__("Clear Discount Cache", "campaignbay")}
          </button>
        </div>
      </SettingCard>
      <SettingCard title={__("Debugging & Logging", "campaignbay")}>
        <Checkbox
          checked={globalSettings.debug_enableMode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEdited(true);
            setGlobalSettings((prev) => ({
              ...prev,
              debug_enableMode: e.target.checked,
            }));
          }}
          label={__("Enable Debug Mode", "campaignbay")}
          help={__(
            "Show detailed error messages and logging for troubleshooting.",
            "campaignbay"
          )}
        />
        <div className="wpab-cb-btn-con-bottom">
          <button
            className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-outline-primary"
            onClick={openLogViewer}
          >
            <Icon icon={seen} fill="currentColor" />
            {__("View Logs", "campaignbay")}
          </button>
          <button
            className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-outline-danger"
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
