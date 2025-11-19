import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import MultiSelect from "../components/Multiselect";
import { __ } from "@wordpress/i18n";
import { useToast } from "../store/toast/use-toast";
import { FC, useEffect } from "react";
import Required from "../components/Required";
import { useCbStore } from "../store/cbStore";
import { getSettings as getDateSettings } from "@wordpress/date";
import DateTimePicker from "../components/DateTimePicker";
import CbCheckbox from "../components/CbCheckbox";
import Tooltip from "../components/Tooltip";
import {
  Campaign as CampaignInerface,
  CampaignErrorsType,
  CampaignSettingsType,
  CampaignStatusType,
  CampaignType,
  DependentResponseType,
  DependentType,
  SelectOptionType,
  TargetType,
} from "../types";
import CampaignTiers from "./CampaignTiers";
import { renderError } from "../pages/CampaignsEdit";
import CampaignSettings from "./CampaignSettings";
import { useGuideStep } from "../store/GuideContext";

interface CampaignProps {
  campaign: CampaignInerface;
  setCampaign: React.Dispatch<React.SetStateAction<CampaignInerface>>;
  errors: CampaignErrorsType;
}

const Campaign: FC<CampaignProps> = ({ campaign, setCampaign, errors }) => {
  const { wpSettings } = useCbStore();
  const { addToast } = useToast();
  const { timezone } = getDateSettings();
  const [isTmpScheduledEnabled, setIsTmpScheduledEnabled] =
    useState<boolean>(false);
  const [settings, setSettings] = useState<CampaignSettingsType>({});
  const [enableUsageLimit, setEnableUsageLimit] = useState<boolean>(false);
  const [categories, setCategories] = useState<SelectOptionType[]>([]);
  const [products, setProducts] = useState<SelectOptionType[]>([]);

  const campaignTitleInputRef = useGuideStep<HTMLInputElement>(2);
  const saveCampaignBtnRef = useGuideStep<HTMLButtonElement>(3);

  useEffect(() => {
    fetchDependency();
    setSettings(campaign.settings);
    if (campaign.usage_limit) setEnableUsageLimit(true);
  }, []);
  useEffect(() => {
    setCampaign((prev) => ({ ...prev, settings: { ...getSettings() } }));
  }, [campaign.type]);
  useEffect(() => {
    setCampaign((prev) => ({ ...prev, settings: { ...getSettings() } }));
  }, [settings]);

  useEffect(() => {
    if (campaign.status === "scheduled") {
      setCampaign((prev) => ({ ...prev, schedule_enabled: true }));
      setIsTmpScheduledEnabled(true);
    } else if (isTmpScheduledEnabled) {
      setCampaign((prev) => ({ ...prev, schedule_enabled: false }));
      setIsTmpScheduledEnabled(false);
    }
  }, [campaign.status]);

  const fetchDependency = async () => {
    try {
      const response: DependentResponseType = await apiFetch({
        path: "/campaignbay/v1/campaigns/dependents?_timestamp=" + Date.now(),
        method: "GET",
      });
      setProducts(
        response.products.map((item: DependentType) => ({
          label: item.name,
          value: item.id,
        })) || []
      );
      setCategories(
        response?.categories?.map((item: DependentType) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error: any) {
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    }
  };
  const handleSelectionTypeChange = (value: TargetType) => {
    setCampaign((prev) => ({ ...prev, target_type: value, target_ids: [] }));
  };

  const getSettings = () => {
    let tmpSettings: CampaignSettingsType = {};

    if (campaign.type === "earlybird" || campaign.type === "scheduled") {
      tmpSettings["display_as_regular_price"] =
        settings.display_as_regular_price === undefined
          ? false
          : settings.display_as_regular_price;

      tmpSettings["message_format"] = settings.message_format || "";
    } else if (campaign.type === "quantity") {
      tmpSettings["enable_quantity_table"] =
        settings.enable_quantity_table === undefined
          ? true
          : settings.enable_quantity_table;

      tmpSettings["apply_as"] = settings?.apply_as || "line_total";

      tmpSettings["cart_quantity_message_format"] =
        settings.cart_quantity_message_format || "";
    } else if (campaign.type === "bogo") {
      tmpSettings["auto_add_free_product"] =
        settings.auto_add_free_product !== undefined
          ? settings.auto_add_free_product
          : true;

      // @ts-ignore
      if (settings?.apply_as !== undefined && settings?.apply_as !== "") {
        tmpSettings["apply_as"] = settings.apply_as;
      }
      tmpSettings["bogo_banner_message_format"] =
        settings.bogo_banner_message_format || "";

      tmpSettings["cart_bogo_message_format"] =
        settings.cart_bogo_message_format || "";

      tmpSettings["bogo_cart_message_location"] =
        settings.bogo_cart_message_location || "line_item_name";
    }
    return tmpSettings;
  };
  return (
    <>
      <div className="cb-form-input-con ">
        <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2 lg:campaignbay-grid-cols-4 campaignbay-gap-[10px]">
          <div className="cb-form-input-con campaignbay-col-span-2 !campaignbay-p-0">
            <label htmlFor="campaign-title" className="!campaignbay-capitalize">
              {__("Campaign Title", "campaignbay")} <Required />
            </label>
            <input
              ref={campaignTitleInputRef}
              type="text"
              id="campaign-title"
              className={`wpab-input w-100 ${
                errors?.title ? "wpab-input-error" : ""
              }`}
              value={campaign.title}
              onChange={(e) =>
                setCampaign((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            {renderError(errors?.title)}
          </div>

          <div className="cb-form-input-con campaignbay-col-span-2 md:campaignbay-col-span-1 !campaignbay-p-0">
            <label htmlFor="campaign-type" className="!campaignbay-capitalize">
              {__("Select Discount Type", "campaignbay")} <Required />
            </label>
            <select
              id="campaign-type"
              className={`wpab-input w-100 ${
                errors?.type ? "wpab-input-error" : ""
              }`}
              value={campaign.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCampaign((prev) => ({
                  ...prev,
                  type: e.target.value as CampaignType,
                }))
              }
            >
              <option value="bogo">{__("Buy X Get X", "campaignbay")}</option>
              <option value="scheduled">
                {__("Scheduled Discount", "campaignbay")}
              </option>
              <option value="quantity">
                {__("Quantity Based Discount", "campaignbay")}
              </option>
              <option value="earlybird">
                {__("EarlyBird Discount", "campaignbay")}
              </option>
            </select>
            {renderError(errors?.type)}
          </div>

          <div className="cb-form-input-con campaignbay-col-span-2  md:campaignbay-col-span-1 !campaignbay-p-0">
            <label
              htmlFor="campaign-status"
              className="!campaignbay-capitalize"
            >
              {__("Select Status", "campaignbay")} <Required />
            </label>
            <select
              id="campaign-status"
              className={`wpab-input w-100 ${
                errors?.status ? "wpab-input-error" : ""
              }`}
              value={campaign.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCampaign((prev) => ({
                  ...prev,
                  status: e.target.value as CampaignStatusType,
                }))
              }
            >
              <option value="active">{__("Active", "campaignbay")}</option>
              <option value="inactive">{__("Inactive", "campaignbay")}</option>
              <option value="scheduled">
                {__("Scheduled", "campaignbay")}
              </option>
            </select>
            {renderError(errors?.status)}
          </div>
        </div>
      </div>

      <CampaignTiers
        campaign={campaign}
        setCampaign={setCampaign}
        errors={errors}
        products={products}
      />

      {/* other config */}
      <div className="cb-form-input-con">
        <label htmlFor="start-time">
          {__("OTHER CONFIGURATIONS", "campaignbay")} <Required />{" "}
        </label>

        {/* Exclude Sale Items */}
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
          <CbCheckbox
            id="exclude-sale-items"
            checked={!!campaign.exclude_sale_items}
            onChange={(e) =>
              setCampaign((prev) => ({
                ...prev,
                exclude_sale_items: e.target.checked,
              }))
            }
          />
          <label htmlFor="exclude-sale-items" className="">
            {__("Exclude Sale Items", "campaignbay")}
          </label>
          <Tooltip
            content={
              <span className="campaignbay-text-sm">
                {__(
                  "When checked , sale items will be excluded from the discount",
                  "campaignbay"
                )}
              </span>
            }
            position="top"
          />
          {renderError(errors?.exclude_sale_items, false)}
        </div>

        {/* usage limit */}
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
          <CbCheckbox
            id="enable-usage-limit"
            checked={enableUsageLimit}
            onChange={(e) => setEnableUsageLimit(e.target.checked)}
          />
          <label htmlFor="enable-usage-limit" className="">
            {__("Enable Usage Limit", "campaignbay")}
          </label>
          <Tooltip
            content={
              <span className="campaignbay-text-sm">
                {__(
                  "When checked , usage limit will be enabled for the campaign. Campaign will be disabled when the limit is reached.",
                  "campaignbay"
                )}
              </span>
            }
            position="top"
          />
        </div>

        {enableUsageLimit && (
          <div className="cb-form-input-con !campaignbay-p-0">
            <label
              htmlFor="usage-limit"
              className="campaignbay-whitespace-nowrap"
            >
              {__("Usage Limit", "campaignbay")}
            </label>
            <input
              type="text"
              id="usage-limit"
              className={`wpab-input w-100  ${
                errors?.usage_limit ? "wpab-input-error" : ""
              }`}
              value={campaign.usage_limit ? campaign.usage_limit : ""}
              onChange={(e) =>
                setCampaign((prev) => ({
                  ...prev,
                  usage_limit: parseInt(e.target.value) || null,
                }))
              }
            />
            {renderError(errors?.usage_limit)}
          </div>
        )}

        {/* Schedule */}
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
          <CbCheckbox
            id="schedule"
            checked={campaign.schedule_enabled}
            onChange={(e) =>
              setCampaign((prev) => ({
                ...prev,
                schedule_enabled: e.target.checked,
              }))
            }
            disabled={campaign.status === "scheduled"}
          />
          <label htmlFor="schedule" className="">
            {__("Schedule", "campaignbay")}
          </label>
          <Tooltip
            content={
              <span className="campaignbay-text-sm">
                {__(
                  "When checked , the campaign will be scheduled to run between the start and end dates",
                  "campaignbay"
                )}
              </span>
            }
            position="top"
          />
        </div>

        {campaign.schedule_enabled && (
          <div className="wpab-grid-2 cb-date-time-fix" style={{ gap: "16px" }}>
            <div
              className={`${errors?.start_datetime ? "wpab-input-error" : ""}`}
            >
              <span
                className="wpab-input-label"
                style={{ display: "block", marginBottom: "10px" }}
              >
                {__("Start Time", "campaignbay")}
                {<Required />}
              </span>
              <DateTimePicker
                timezone={timezone}
                wpSettings={wpSettings}
                id="start-time"
                dateTime={campaign.start_datetime}
                onDateTimeChange={(date: Date | string) => {
                  setCampaign((prev) => ({
                    ...prev,
                    start_datetime: date,
                  }));
                }}
                disabled={!campaign.schedule_enabled}
              />
              {renderError(errors?.start_datetime, false)}
            </div>
            <div
              className={`${errors?.end_datetime ? "wpab-input-error" : ""}`}
            >
              <span
                className="wpab-input-label"
                style={{ display: "block", marginBottom: "10px" }}
              >
                {__("End Time", "campaignbay")}
              </span>
              <DateTimePicker
                timezone={timezone}
                id="end-time"
                dateTime={campaign.end_datetime}
                onDateTimeChange={(date: Date | string) => {
                  setCampaign((prev) => ({
                    ...prev,
                    end_datetime: date,
                  }));
                }}
                disabled={!campaign.schedule_enabled}
              />
              {renderError(errors?.end_datetime, false)}
            </div>
          </div>
        )}
      </div>

      <CampaignSettings
        settings={settings}
        setSettings={setSettings}
        errors={errors?.settings}
        type={campaign.type}
      />
    </>
  );
};

export default Campaign;
