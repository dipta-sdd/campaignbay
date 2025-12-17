import { useState, useRef } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
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
import { useGuide, useGuideStep } from "../store/GuideContext";
import { TOUR_STEPS } from "../utils/tourSteps";
import MultiSelect from "./Multiselect";
import CustomSelect from "./ui/CustomSelect";
import { getSettings } from "../utils/settings";

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
  const usageCheckboxRef = useRef<HTMLInputElement>(null);
  const scheduleCheckboxRef = useRef<HTMLInputElement>(null);

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================
  const { tourStep, setConfig } = useGuide();
  const campaignTitleInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.TITLE);
  const campaignTypeInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.TYPE);
  const campaignStatusInputRef = useGuideStep<HTMLSelectElement>(TOUR_STEPS.STATUS);
  const targetTypeInputRef = useGuideStep<HTMLSelectElement>(TOUR_STEPS.TARGET_TYPE);
  const targetIdsInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.TARGET_IDS);
  const usageToggleRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.USAGE_TOGGLE);
  const usageInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.USAGE_INPUT);
  const scheduleToggleRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.SCHED_TOGGLE);
  const startTimeInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.START_TIME);
  const endTimeInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.END_TIME);

  useEffect(() => {
    if (!tourStep) return;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [TOUR_STEPS.USAGE_TOGGLE]: {
        ...prevConfig[TOUR_STEPS.USAGE_TOGGLE],
        onNext: ({ setStep }) => {
          setStep(enableUsageLimit ? TOUR_STEPS.USAGE_INPUT : TOUR_STEPS.SCHED_TOGGLE);
        },
      },
      [TOUR_STEPS.SCHED_TOGGLE]: {
        ...prevConfig[TOUR_STEPS.SCHED_TOGGLE],
        onPrev: ({ setStep }) => {
          setStep(enableUsageLimit ? TOUR_STEPS.USAGE_INPUT : TOUR_STEPS.USAGE_TOGGLE);
        },
      }
    }));

  }, [enableUsageLimit, setConfig]);

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================

  useEffect(() => {
    fetchDependency();
    setSettings(campaign.settings);
    if (campaign.usage_limit) setEnableUsageLimit(true);
  }, []);
  useEffect(() => {
    setCampaign((prev) => ({ ...prev, settings: { ...getSettings(campaign.type, settings) } }));
  }, [campaign.type]);
  useEffect(() => {
    setCampaign((prev) => ({ ...prev, settings: { ...getSettings(campaign.type, settings) } }));
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
  const handleSelectionTypeChange = (value: CampaignType) => {
    setCampaign((prev) => ({ ...prev, type: value }));
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
              className={`wpab-input w-100 ${errors?.title ? "wpab-input-error" : ""
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
            <CustomSelect
              con_ref={campaignTypeInputRef}
              options={[
                { label: __("Buy X Get X", "campaignbay"), value: "bogo" },
                { label: __("Scheduled Discount", "campaignbay"), value: "scheduled" },
                { label: __("Quantity Based Discount", "campaignbay"), value: "quantity" },
                { label: __("EarlyBird Discount", "campaignbay"), value: "earlybird" },
                { label: __("Buy X Get Y - Advanced", "campaignbay"), value: "bogo_pro", variant: "buy_pro" },
                {
                  label: __("Paired Discount", "campaignbay"),
                  value: "paired",
                  variant: "buy_pro",
                },

              ]}
              value={campaign.type as string}
              onChange={(value) =>
                setCampaign((prev) => ({ ...prev, type: value as CampaignType }))
              }
            />
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
              ref={campaignStatusInputRef}
              className={`wpab-input w-100 ${errors?.status ? "wpab-input-error" : ""
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
              {/* toaddpro */}
              {campaign.status === "expired" && (
                <option value="expired">{__("Expired", "campaignbay")}</option>
              )}
            </select>
            {renderError(errors?.status)}
          </div>
        </div>
      </div>


      <div className="cb-form-input-con">
        <label htmlFor="selection-type">
          {__("DISCOUNT TARGET", "campaignbay")} <Required />
        </label>
        <select
          ref={targetTypeInputRef}
          id="selection-type"
          className={`wpab-input w-100 ${errors?.target_type ? "wpab-input-error" : ""
            }`}
          value={campaign.target_type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setCampaign((prev) => ({
              ...prev,
              target_type: e.target.value as TargetType,
            }))
          }
        >
          <option value="entire_store">
            {__("Entire Store", "campaignbay")}
          </option>
          <option value="category">
            {__("By Product Category", "campaignbay")}
          </option>
          <option value="product">{__("By Product", "campaignbay")}</option>
          {/* <option value="tag">{__("By Tags", "campaignbay")}</option> */}
        </select>
        {renderError(errors?.target_type)}

        {campaign.target_type !== "entire_store" ? (
          <>
            <div
              style={{ background: "#ffffff" }}
              className={`${errors?.target_ids ? "wpab-input-error" : ""}`}
            >
              <MultiSelect
                con_ref={targetIdsInputRef}
                label={
                  campaign.target_type === "product"
                    ? __("Select Products *", "campaignbay")
                    : campaign.target_type === "category"
                      ? __("Select Categories *", "campaignbay")
                      : ""
                }
                options={
                  campaign.target_type === "product"
                    ? products
                    : campaign.target_type === "category"
                      ? categories
                      : []
                }
                value={campaign.target_ids}
                onChange={(value: number[]) =>
                  setCampaign((prev) => ({
                    ...prev,
                    target_ids: [...value],
                  }))
                }
              />
              {renderError(errors?.target_ids, false)}
            </div>
            <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <CbCheckbox
                id="exclude-items"
                checked={!!campaign.is_exclude}
                onChange={(e) =>
                  setCampaign((prev) => ({
                    ...prev,
                    is_exclude: e.target.checked,
                  }))
                }
              />
              <label
                htmlFor="exclude-items"
                className="!campaignbay-text-gray-700"
              >
                {__("Exclude Items", "campaignbay")}
              </label>
              <Tooltip
                content={
                  <span className="campaignbay-text-sm">
                    {__(
                      "When checked , selected items will be excluded from the discount",
                      "campaignbay"
                    )}
                    <a
                      className="campaignbay-ml-2 campaignbay-text-blue-600 hover:campaignbay-text-blue-700"
                      href="https://docs.wpanchorbay.com/core-concepts/targeting-and-conditions.html#inverting-the-logic-the-exclude-items-checkbox"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read More
                    </a>
                  </span>
                }
                position="top"
              />

              {renderError(errors?.isExclude)}
            </div>
          </>
        ) : null}
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
        <div
          ref={usageToggleRef}
          className="campaignbay-flex campaignbay-items-center campaignbay-gap-2"
          tabIndex={-1}
          onFocus={(e) => {
            if (e.target === e.currentTarget) {
              usageCheckboxRef.current?.focus();
            }
          }}
        >
          <CbCheckbox
            id="enable-usage-limit"
            checked={enableUsageLimit}
            onChange={(e) => setEnableUsageLimit(e.target.checked)}
            ref={usageCheckboxRef}
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
              ref={usageInputRef}
              type="number"
              id="usage-limit"
              className={`wpab-input w-100  ${errors?.usage_limit ? "wpab-input-error" : ""
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
        <div
          ref={scheduleToggleRef}
          className="campaignbay-flex campaignbay-items-center campaignbay-gap-2"
          tabIndex={-1}
          onFocus={(e) => {
            if (e.target === e.currentTarget) {
              scheduleCheckboxRef.current?.focus();
            }
          }}
        >
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
            ref={scheduleCheckboxRef}
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
                inputRef={startTimeInputRef}
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
                inputRef={endTimeInputRef}
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
