import { TabPanel, Animate, Notice } from "@wordpress/components";
import GlobalSettings from "../components/GlobalSettings";
import ProductSettings from "./../components/ProductSettings";
import CartSettings from "./../components/CartSettings";
import PromotionSettings from "./../components/PromotionSettings";
import AdvancedSettings from "./../components/AdvancedSettings";
import { useEffect, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import Loader from "../components/Loader";
import { useToast } from "../store/toast/use-toast";
import { check, Icon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import Navbar from "../components/Navbar";
const Settings = () => {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();
  const [productSettings, setProductSettings] = useState({});
  const [globalSettings, setGlobalSettings] = useState({});
  const [cartSettings, setCartSettings] = useState({});
  const [promotionSettings, setPromotionSettings] = useState({});
  const [advancedSettings, setAdvancedSettings] = useState({});
  const [formData, setFormData] = useState("global");
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiFetch({
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
      product_messageFormat: settings.product_messageFormat,
      product_enableQuantityTable: settings.product_enableQuantityTable,
      product_priorityMethod: settings.product_priorityMethod,
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
    });
    setAdvancedSettings({
      advanced_deleteAllOnUninstall: settings.advanced_deleteAllOnUninstall,
      advanced_customCss: settings.advanced_customCss,
      advanced_customJs: settings.advanced_customJs,
    });
  }, [settings]);

  const updateSettings = async () => {
    try {
      setIsSaving(true);
      console.log(formData);
      let data = {};
      switch (formData) {
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
      // console.log(data);
      const response = await apiFetch({
        path: "/campaignbay/v1/settings",
        method: "POST",
        data: {
          ...settings,
          ...data,
        },
      });
      setSettings(response);
      setIsSaving();
      addToast(__("Settings updated successfully", "campaignbay"), "success");
    } catch (error) {
      console.log(error);
      setError(error);
      setIsSaving(false);
      addToast(
        __("Something went wrong. Please try again.", "campaignbay"),
        "error"
      );
    }
  };
  console.log(cartSettings);
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="wpab-cb-page ">
      <Navbar />
      <div className="wpab-cb-page-header">
        <div className="cb-container">
          <h1 className="wpab-cb-page-header-text">
            {" "}
            {__("Settings", "campaignbay")}
          </h1>
          <button
            className="wpab-cb-btn wpab-cb-btn-primary"
            disabled={isSaving}
            onClick={updateSettings}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Settings", "campaignbay")}
          </button>
        </div>
      </div>
      {/* <div className="wpab-cb-settings-tabs-container"> */}
      <TabPanel
        className="wpab-cb-settings-tabs"
        // activeClass='wpab-cb-settings-active-tab'
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
        {(tab) =>
          (() => {
            switch (tab.name) {
              case "global":
                setFormData("global");
                return (
                  <GlobalSettings
                    globalSettings={globalSettings}
                    setGlobalSettings={setGlobalSettings}
                  />
                );
              case "product":
                setFormData("product");
                return (
                  <ProductSettings
                    productSettings={productSettings}
                    setProductSettings={setProductSettings}
                  />
                );
              case "cart":
                setFormData("cart");
                return (
                  <CartSettings
                    cartSettings={cartSettings}
                    setCartSettings={setCartSettings}
                  />
                );
              case "advanced":
                setFormData("advanced");
                return (
                  <AdvancedSettings
                    advancedSettings={advancedSettings}
                    setAdvancedSettings={setAdvancedSettings}
                  />
                );
              default:
                setFormData("global");
                return (
                  <GlobalSettings
                    globalSettings={globalSettings}
                    setGlobalSettings={setGlobalSettings}
                  />
                );
            }
          })()
        }
      </TabPanel>
      <div className="wpab-button-con-card">
        <div className="cb-container ">
          <button
            className="wpab-cb-btn wpab-cb-btn-primary"
            disabled={isSaving}
            onClick={updateSettings}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Changes", "campaignbay")}
          </button>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};
export default Settings;
