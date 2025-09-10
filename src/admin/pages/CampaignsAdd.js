import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import MultiSelect from "../components/Multiselect";
import {
  TimePicker,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { check, code, Icon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { useToast } from "../store/toast/use-toast";
import { useEffect } from "react";
import Required from "../components/Required";
import QuantityTiers from "../components/QuantityTiers";
import EBTiers from "../components/EBTiers";
import { useCbStore } from "../store/cbStore";
import { getSettings as getDateSettings } from "@wordpress/date";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DateTimePicker from "../components/DateTimePicker";
import CbCheckbox from "../components/CbCheckbox";
import Tooltip from "../components/tooltip";

const CampaignsAdd = () => {
  const { wpSettings, woocommerce_currency_symbol } = useCbStore();
  const navigate = useNavigate();
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignStatus, setCampaignStatus] = useState("scheduled");
  const [campaignType, setCampaignType] = useState("scheduled");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [targetType, setTargetType] = useState("entire_store");
  const [targetIds, setTargetIds] = useState([]);
  const [isExclude, setIsExclude] = useState(false);
  const [isExcludeSaleItems, setIsExcludeSaleItems] = useState(false);
  const [quantityTiers, setQuantityTiers] = useState([
    {
      id: 0,
      min: 1,
      max: "",
      value: "",
      type: "percentage",
    },
  ]);
  const [ebTiers, setEBTiers] = useState([
    {
      id: 0,
      quantity: null,
      value: null,
      type: "percentage",
      total: 0,
    },
  ]);
  const [bogoTiers, setBogoTiers] = useState([
    {
      id: 0,
      buy_product: null,
      get_product: null,
      buy_quantity: 1,
      get_quantity: 1,
    },
  ]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState("");
  const [enableUsageLimit, setEnableUsageLimit] = useState(false);
  const [usageLimit, setUsageLimit] = useState(null);

  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);

  const [errors, setErrors] = useState({});

  const fetchCategories = async () => {
    try {
      const response = await apiFetch({
        path: "/wc/v3/products/categories?per_page=-1&_timestamp=" + Date.now(),
        method: "GET",
      });
      setCategories(
        response.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await apiFetch({
        path: "/wc/v3/products?per_page=-1&_timestamp=" + Date.now(),
        method: "GET",
      });
      setProducts(
        response.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching Products:", error);
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    }
  };
  const fetchTags = async () => {
    try {
      const response = await apiFetch({
        path: "/wc/v3/products/tags?per_page=-1&_timestamp=" + Date.now(),
        method: "GET",
      });
      setTags(
        response.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching Products:", error);
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    }
  };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts(), fetchTags()]);
  }, []);

  useEffect(() => {
    if (campaignType === "scheduled" || campaignStatus === "scheduled") {
      setScheduleEnabled(true);
    }
  }, [campaignStatus, campaignType]);

  const handleSelectionTypeChange = (value) => {
    setTargetType(value);
    setTargetIds([]);
  };

  const handleCampaignTypeChange = (value) => {
    setCampaignType(value);
    if (value === "scheduled") {
      setCampaignStatus("scheduled");
    }
  };

  const handleCampaignStatusChange = (value) => {
    setCampaignStatus(value);
  };

  const { timezone } = getDateSettings();
  const handleSaveCampaign = async () => {
    const campaignData = {
      title: campaignTitle,
      status: campaignStatus,
      type: campaignType,
      discount_type: discountType,
      discount_value: discountValue || null,
      target_type: targetType,
      target_ids: targetIds,
      is_exclude: isExclude,
      is_exclude_sale_items: isExcludeSaleItems,
      usage_limit: usageLimit || null,
      schedule_enabled: scheduleEnabled,
      start_datetime: startDate,
      end_datetime: endDate || null,
      timezone_offset: timezone.offsetFormatted,
      tiers:
        campaignType === "quantity"
          ? quantityTiers
          : campaignType === "earlybird"
          ? ebTiers
          : [],
    };
    try {
      const response = await apiFetch({
        path: "/campaignbay/v1/campaigns",
        method: "POST",
        data: campaignData,
      });
      addToast(__("Campaign saved successfully", "campaignbay"), "success");
      navigate(`/campaigns`);
    } catch (error) {
      if (error?.code === "rest_validation_error") {
        setErrors(error?.data?.details || {});
        console.log("Validation errors:", error?.data?.details);
      }
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    }
  };

  const renderError = (error, negativeMargin = true) => {
    if (!error) return null;
    return (
      <p
        className={`campaignbay-text-red-600 ${
          negativeMargin ? "campaignbay--mt-2" : "campaignbay-mt-1"
        } campaignbay-text-xs`}
      >
        {error.message}
      </p>
    );
  };

  return (
    <div className="cb-page">
      <Navbar />
      <div className="cb-page-header-container">
        <div className="cb-page-header-title">
          {__("Add Campaign", "campaignbay")}
        </div>
        <div className="cb-page-header-actions">
          <button
            className="wpab-cb-btn wpab-cb-btn-primary "
            onClick={handleSaveCampaign}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Campaign", "campaignbay")}
          </button>
        </div>
      </div>
      <div className="cb-page-container">
        <div className="cb-form-input-con">
          <label htmlFor="campaign-type">
            {__("SELECT DISCOUNT TYPE", "campaignbay")} <Required />
          </label>
          <select
            type="text"
            id="campaign-type"
            className={`wpab-input w-100 ${
              errors?.type ? "wpab-input-error" : ""
            }`}
            value={campaignType}
            onChange={(e) => handleCampaignTypeChange(e.target.value)}
          >
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

        <div className="cb-form-input-con">
          <label htmlFor="campaign-status">
            {__("SELECT STATUS", "campaignbay")} <Required />
          </label>
          <select
            type="text"
            id="campaign-status"
            className={`wpab-input w-100 ${
              errors?.status ? "wpab-input-error" : ""
            }`}
            value={campaignStatus}
            onChange={(e) => handleCampaignStatusChange(e.target.value)}
          >
            <option value="active">{__("Active", "campaignbay")}</option>
            <option value="inactive">{__("Inactive", "campaignbay")}</option>
            <option value="scheduled">{__("Scheduled", "campaignbay")}</option>
          </select>
          {renderError(errors?.status)}
        </div>

        <div className="cb-form-input-con">
          <label htmlFor="campaign-title">
            {__("Campaign Title", "campaignbay")} <Required />
          </label>
          <input
            type="text"
            id="campaign-title"
            className={`wpab-input w-100 ${
              errors?.title ? "wpab-input-error" : ""
            }`}
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
          />
          {renderError(errors?.title)}
        </div>

        <div className="cb-form-input-con">
          <label htmlFor="selection-type">
            {__("DISCOUNT TARGET", "campaignbay")} <Required />
          </label>
          <select
            type="text"
            id="selection-type"
            className={`wpab-input w-100 ${
              errors?.target_type ? "wpab-input-error" : ""
            }`}
            value={targetType}
            onChange={(e) => handleSelectionTypeChange(e.target.value)}
          >
            <option value="entire_store">
              {__("Entire Store", "campaignbay")}
            </option>
            <option value="category">
              {__("By Product Category", "campaignbay")}
            </option>
            <option value="product">{__("By Product", "campaignbay")}</option>
            <option value="tag">{__("By Tags", "campaignbay")}</option>
          </select>
          {renderError(errors?.target_type)}

          {targetType !== "entire_store" ? (
            <>
              <div
                style={{ background: "#ffffff" }}
                className={`${errors?.target_ids ? "wpab-input-error" : ""}`}
              >
                <MultiSelect
                  label={
                    targetType === "product"
                      ? __("Select Products *", "campaignbay")
                      : targetType === "tag"
                      ? __("Select Tags *", "campaignbay")
                      : targetType === "category"
                      ? __("Select Categories *", "campaignbay")
                      : ""
                  }
                  options={
                    targetType === "product"
                      ? products
                      : targetType === "tag"
                      ? tags
                      : targetType === "category"
                      ? categories
                      : []
                  }
                  value={targetIds}
                  onChange={setTargetIds}
                />
                {renderError(errors?.target_ids, false)}
              </div>
              <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                <CbCheckbox
                  id="exclude-items"
                  checked={isExclude}
                  onChange={(e) => setIsExclude(e.target.checked)}
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
                    </span>
                  }
                  position="right"
                />

                {renderError(errors?.isExclude)}
              </div>
            </>
          ) : null}
        </div>

        {campaignType === "quantity" && (
          <QuantityTiers
            className={`${errors?.tiers ? "wpab-input-error" : ""}`}
            tiers={quantityTiers}
            setTiers={setQuantityTiers}
            errors={errors}
          />
        )}

        {campaignType === "earlybird" && (
          <EBTiers
            className={`${errors?.tiers ? "wpab-input-error" : ""}`}
            tiers={ebTiers}
            setTiers={setEBTiers}
            errors={errors}
          />
        )}

        {campaignType === "scheduled" && (
          <div className="cb-form-input-con">
            <label htmlFor="discount-type">
              {__("How many you want to discount?", "campaignbay")} <Required />
            </label>
            <ToggleGroupControl
              className={`cb-toggle-group-control ${
                errors?.discount_type ? "wpab-input-error" : ""
              }`}
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              isBlock
              value={discountType}
              onChange={(value) => setDiscountType(value)}
            >
              <ToggleGroupControlOption
                label={__("Percentage %", "campaignbay")}
                value="percentage"
              />
              <ToggleGroupControlOption
                label={
                  __("Currency ", "campaignbay") +
                  (woocommerce_currency_symbol || "$")
                }
                value="fixed"
              />
            </ToggleGroupControl>
            <span className="wpab-input-help">
              {__("If you want you will change mode", "campaignbay")}
            </span>

            {renderError(errors?.discount_type)}

            <div className="cb-input-with-suffix">
              <input
                value={discountValue ? discountValue : ""}
                type="text"
                name="discount-value"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`wpab-input w-100 ${
                  errors?.discount_value ? "wpab-input-error" : ""
                }`}
                placeholder="Enter Value"
                onChange={(e) => setDiscountValue(parseInt(e.target.value))}
              />
              <span className="cb-suffix">
                {discountType === "percentage"
                  ? "%"
                  : woocommerce_currency_symbol || "$"}
              </span>
            </div>
            {renderError(errors?.discount_value)}
          </div>
        )}
        <div className="cb-form-input-con">
          <label htmlFor="start-time">
            {__("OTHER CONFIGURATIONS", "campaignbay")} <Required />{" "}
          </label>

          {/* Exclude Sale Items */}
          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
            <CbCheckbox
              id="exclude-sale-items"
              checked={isExcludeSaleItems}
              onChange={(e) => setIsExcludeSaleItems(e.target.checked)}
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
              position="right"
            />
            {renderError(errors?.is_exclude_sale_items, false)}
          </div>

          {/* Exclude Sale Items */}
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
              position="right"
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
                value={usageLimit ? usageLimit : ""}
                onChange={(e) => setUsageLimit(parseInt(e.target.value))}
              />
              {renderError(errors?.usage_limit)}
            </div>
          )}

          {/* Schedule */}
          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
            <CbCheckbox
              id="schedule"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              disabled={
                campaignType === "scheduled" || campaignStatus === "scheduled"
              }
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
              position="right"
            />
          </div>

          {scheduleEnabled && (
            <div
              className="wpab-grid-2 cb-date-time-fix"
              style={{ gap: "16px" }}
            >
              <div
                className={`${
                  errors?.start_datetime ? "wpab-input-error" : ""
                }`}
              >
                <span
                  className="wpab-input-label"
                  style={{ display: "block", marginBottom: "10px" }}
                >
                  {__("Start Time", "campaignbay")}
                </span>
                <DateTimePicker
                  timezone={timezone}
                  wpSettings={wpSettings}
                  id="start-time"
                  dateTime={startDate}
                  onDateTimeChange={(date) => {
                    setStartDate(date);
                  }}
                  disabled={!scheduleEnabled}
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
                  dateTime={endDate}
                  onDateTimeChange={(date) => {
                    setEndDate(date);
                  }}
                  disabled={!scheduleEnabled}
                />
                {renderError(errors?.end_datetime, false)}
              </div>
            </div>
          )}
        </div>
        <div className="wpab-btn-bottom-con">
          <button
            className="wpab-cb-btn wpab-cb-btn-primary"
            onClick={handleSaveCampaign}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Changes", "campaignbay")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignsAdd;

export const formatJsDateForDb = (jsDate) => {
  // 1. Validate the input to ensure it's a valid Date object.
  if (!jsDate || !(jsDate instanceof Date) || isNaN(jsDate)) {
    return null;
  }

  // 2. Get all the date and time components.
  const year = jsDate.getFullYear();

  // getMonth() is zero-based (0=Jan, 11=Dec), so we must add 1.
  const month = String(jsDate.getMonth() + 1).padStart(2, "0");

  const day = String(jsDate.getDate()).padStart(2, "0");
  const hours = String(jsDate.getHours()).padStart(2, "0");
  const minutes = String(jsDate.getMinutes()).padStart(2, "0");
  const seconds = String(jsDate.getSeconds()).padStart(2, "0");

  // 3. Assemble the final string in the desired format.
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
