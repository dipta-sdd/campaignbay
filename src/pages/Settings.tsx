import { useState, useEffect, FC } from "react";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { Icon, check } from "@wordpress/icons";

import { useToast } from "../store/toast/use-toast";
import {
  AdvancedSettingsType,
  CampaignBaySettingsType,
  CartSettingsType,
  GlobalSettingsType,
  ProductSettingsType,
} from "../types";

import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import TabPanel from "../components/TabPanel";
import GlobalSettings from "../components/GlobalSettings";
import ProductSettings from "../components/ProductSettings";
import CartSettings from "../components/CartSettings";
import AdvancedSettings from "../components/AdvancedSettings";
import { FloatingHelpButton } from "./Campaigns";

export type ActiveTab = "global" | "product" | "cart" | "advanced";

const Settings: FC = () => {
  const [settings, setSettings] = useState<CampaignBaySettingsType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [edited, setEdited] = useState<boolean>(false);
  const { addToast } = useToast();

  const [productSettings, setProductSettings] =
    useState<ProductSettingsType | null>(null);
  const [globalSettings, setGlobalSettings] =
    useState<GlobalSettingsType | null>(null);
  const [cartSettings, setCartSettings] = useState<CartSettingsType | null>(
    null
  );
  const [advancedSettings, setAdvancedSettings] =
    useState<AdvancedSettingsType | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("global");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response: CampaignBaySettingsType = await apiFetch({
        path: "/campaignbay/v1/settings?_timestamp=" + Date.now(),
      });
      setSettings(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load settings");
      // setIsLoading(false);
      addToast(
        __("Something went wrong . Please refresh the page.", "campaignbay"),
        "error"
      );
    }
  };

  useEffect(() => {
    if (!settings) {
      return;
    }
    setProductSettings({
      product_message_format_percentage:
        settings.product_message_format_percentage,
      product_message_format_fixed: settings.product_message_format_fixed,
      bogo_banner_message_format: settings.bogo_banner_message_format,
      show_discount_table: settings.show_discount_table,
      discount_table_options: settings.discount_table_options,
      product_priorityMethod: settings.product_priorityMethod,
      product_enableQuantityTable: settings.product_enableQuantityTable,
    });

    setGlobalSettings({
      global_enableAddon: settings.global_enableAddon,
      global_calculate_discount_from: settings.global_calculate_discount_from,
      position_to_show_bulk_table: settings.position_to_show_bulk_table,
      position_to_show_discount_bar: settings.position_to_show_discount_bar,
      perf_enableCaching: settings.perf_enableCaching,
      debug_enableMode: settings.debug_enableMode,
    });
    setCartSettings({
      cart_allowWcCouponStacking: settings.cart_allowWcCouponStacking,
      cart_allowCampaignStacking: settings.cart_allowCampaignStacking,
      cart_quantity_message_format_percentage:
        settings.cart_quantity_message_format_percentage,
      cart_quantity_message_format_fixed:
        settings.cart_quantity_message_format_fixed,
      cart_bogo_message_format: settings.cart_bogo_message_format,
    });
    setAdvancedSettings({
      advanced_deleteAllOnUninstall: settings.advanced_deleteAllOnUninstall,
    });
  }, [settings, activeTab]);

  const updateSettings = async () => {
    try {
      setIsSaving(true);
      let data = {};
      switch (activeTab) {
        case "global":
          data = {
            ...globalSettings,
          };
          break;
        case "product":
          data = {
            ...productSettings,
          };
          break;
        case "cart":
          data = {
            ...cartSettings,
          };
          break;

        case "advanced":
          data = {
            ...advancedSettings,
          };
          break;
        default:
          data = {
            ...globalSettings,
          };
          break;
      }
      const response: CampaignBaySettingsType = await apiFetch({
        path: "/campaignbay/v1/settings",
        method: "POST",
        data: {
          ...settings,
          ...data,
        },
      });
      setSettings(response);
      addToast(__("Settings updated successfully", "campaignbay"), "success");
      setEdited(false);
    } catch (error: any) {
      setError(error);
      setIsSaving(false);
      addToast(
        __("Something went wrong. Please try again.", "campaignbay"),
        "error"
      );
    }
  };

  const changeActiveTab = (tab: ActiveTab) => {
    if (tab === activeTab) {
      return;
    }
    setActiveTab(tab);
    setEdited(false);
  };
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="campaignbay-block campaignbay-w-full campaignbay-p-0 campaignbay-m-0 campaignbay-h-auto">
      <Navbar />
      <div className="wpab-cb-page-header">
        <div className="cb-container">
          <h1 className="campaignbay-text-[20px] campaignbay-font-medium campaignbay-leading-[24px] campaignbay-m-0 campaignbay-p-0 campaignbay-normal-case">
            {" "}
            {__("Settings", "campaignbay")}
          </h1>
          <button
            className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-primary"
            disabled={isSaving || !edited}
            onClick={updateSettings}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Settings", "campaignbay")}
          </button>
        </div>
      </div>
      {/* <div className="wpab-cb-settings-tabs-container"> */}
      <TabPanel
        activeTab={activeTab}
        setActiveTab={changeActiveTab}
        tabs={[
          {
            name: "global",
            title: "Global Settings",
          },
          {
            name: "product",
            title: "Product Settings",
          },
          {
            name: "cart",
            title: "Cart Settings",
          },
          {
            name: "advanced",
            title: "Advanced Settings",
          },
        ]}
      >
        {activeTab === "global" && globalSettings && (
          <GlobalSettings
            globalSettings={globalSettings}
            setGlobalSettings={setGlobalSettings}
            setEdited={setEdited}
          />
        )}
        {activeTab === "product" && productSettings && (
          <ProductSettings
            productSettings={productSettings}
            setProductSettings={setProductSettings}
            isSaving={isSaving}
            updateSettings={updateSettings}
            setEdited={setEdited}
          />
        )}
        {activeTab === "cart" && cartSettings && (
          <CartSettings
            cartSettings={cartSettings}
            setCartSettings={setCartSettings}
            setEdited={setEdited}
          />
        )}
        {activeTab === "advanced" && advancedSettings && (
          <AdvancedSettings
            advancedSettings={advancedSettings}
            setAdvancedSettings={setAdvancedSettings}
            setEdited={setEdited}
          />
        )}
      </TabPanel>
      <div className="wpab-button-con-card">
        <div className="cb-container ">
          <button
            className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-primary"
            disabled={isSaving || !edited}
            onClick={updateSettings}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Changes", "campaignbay")}
          </button>
        </div>
      </div>
      {/* </div> */}
      <FloatingHelpButton />
    </div>
  );
};
export default Settings;
