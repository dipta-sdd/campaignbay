import { useParams, useNavigate } from "react-router-dom";
import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import MultiSelect from "../components/Multiselect";
import {
  __experimentalConfirmDialog as ConfirmDialog,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { check, Icon, pencil, trash } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { useToast } from "../store/toast/use-toast";
import { FC, useEffect } from "react";
import Required from "../components/Required";
import QuantityTiers from "../components/QuantityTiers";
import EBTiers from "../components/EBTiers";
import { useCbStore } from "../store/cbStore";
import { getSettings as getDateSettings } from "@wordpress/date";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import CbCheckbox from "../components/CbCheckbox";
import Tooltip from "../components/Tooltip";
import DateTimePicker from "../components/DateTimePicker";
import CampaignSettings from "../components/CampaignSettings";
import getBool from "../utils/getBool";
import {
  BogoTier,
  CampaignErrorsType,
  CampaignSettingsType,
  CampaignStatusType,
  CampaignType,
  DependentResponseType,
  DependentType,
  DiscountType,
  EBTier,
  EBTierError,
  QuantityTier,
  QuantityTierError,
  SelectOptionType,
  TargetOptionType,
  TargetType,
} from "../types";

const CampaignsEdit: FC = () => {
  const { wpSettings, woocommerce_currency_symbol } = useCbStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { timezone } = getDateSettings();

  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [campaignTitle, setCampaignTitle] = useState<string>("");
  const [campaignStatus, setCampaignStatus] =
    useState<CampaignStatusType>("active");
  const [campaignType, setCampaignType] = useState<CampaignType>("bogo");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [targetType, setTargetType] = useState<TargetType>("entire_store");
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [isExclude, setIsExclude] = useState<Boolean>(false);
  const [isExcludeSaleItems, setIsExcludeSaleItems] = useState<Boolean>(false);
  const [quantityTiers, setQuantityTiers] = useState<QuantityTier[]>([
    {
      id: 0,
      min: 1,
      max: "",
      value: "",
      type: "percentage",
    },
  ]);
  const [ebTiers, setEBTiers] = useState<EBTier[]>([
    {
      id: 0,
      quantity: "",
      value: "",
      type: "percentage",
      total: 0,
    },
  ]);
  const [bogoTiers, setBogoTiers] = useState<BogoTier>({
    id: 0,
    buy_quantity: 1,
    get_quantity: 1,
  });

  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | Date>("");
  const [endDate, setEndDate] = useState<string | Date>("");
  const [enableUsageLimit, setEnableUsageLimit] = useState<boolean>(false);
  const [usageLimit, setUsageLimit] = useState<number | null | "">(null);

  const [settings, setSettings] = useState<CampaignSettingsType>({});

  const [categories, setCategories] = useState<SelectOptionType[]>([]);
  const [products, setProducts] = useState<SelectOptionType[]>([]);
  const [tags, setTags] = useState<TargetOptionType[]>([]);

  const [errors, setErrors] = useState<CampaignErrorsType>({});
  // extra state to handle editing
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

  const [isTmpScheduledEnabled, setIsTmpScheduledEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCampaign()]);
  }, [id]);

  useEffect(() => {
    if (campaignStatus === "scheduled") {
      setScheduleEnabled(true);
      setIsTmpScheduledEnabled(true);
    } else if (isTmpScheduledEnabled) {
      setScheduleEnabled(false);
      setIsTmpScheduledEnabled(false);
    }
  }, [campaignStatus]);

  const fetchProducts = async () => {
    try {
      const response: DependentResponseType = await apiFetch({
        path: "/campaignbay/v1/campaigns/dependents?_timestamp=" + Date.now(),
        method: "GET",
      });
      setProducts(
        response?.products?.map((item: DependentType) => ({
          label: item.name,
          value: item.id,
        }))
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
    setTargetType(value);
    setTargetIds([]);
  };

  const handleCampaignTypeChange = (value: CampaignType) => {
    setCampaignType(value);
  };

  const handleCampaignStatusChange = (value: CampaignStatusType) => {
    setCampaignStatus(value);
  };

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
      exclude_sale_items: isExcludeSaleItems,
      usage_limit: enableUsageLimit ? usageLimit || null : null,
      schedule_enabled: scheduleEnabled,
      start_datetime: startDate,
      end_datetime: endDate || null,
      timezone_offset: timezone.offsetFormatted,
      tiers:
        campaignType === "quantity"
          ? quantityTiers
          : campaignType === "earlybird"
          ? ebTiers
          : campaignType === "bogo"
          ? [bogoTiers]
          : [],
      settings: getSettings(),
    };

    try {
      setIsSaving(true);
      const response = await apiFetch({
        path: "/campaignbay/v1/campaigns/" + id,
        method: "POST",
        data: campaignData,
      });
      setIsSaving(false);
      addToast(__("Campaign saved successfully", "campaignbay"), "success");
      navigate("/campaigns");
    } catch (error: any) {
      setIsSaving(false);
      if (
        error?.code === "rest_invalid_param" ||
        error?.code === "rest_validation_error"
      ) {
        setErrors(error?.data?.details);
      }
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      setIsDeleting(true);
      const response = await apiFetch({
        path: "/campaignbay/v1/campaigns/" + id,
        method: "DELETE",
      });
      setIsDeleteModalOpen(false);
      addToast(__("Campaign deleted successfully", "campaignbay"), "success");
      navigate("/campaigns");
    } catch (error) {
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchCampaign = async () => {
    try {
      const response: any = await apiFetch({
        path: `/campaignbay/v1/campaigns/${id}?_timestamp=${Date.now()}`,
      });

      setCampaignTitle(response?.title);
      setCampaignStatus(response?.status);
      setCampaignType(response?.type);
      setDiscountType(response?.discount_type);
      setDiscountValue(response?.discount_value);
      setTargetType(response?.target_type);
      setTargetIds(response?.target_ids);
      setIsExclude(getBool(response?.is_exclude));
      setIsExcludeSaleItems(getBool(response?.exclude_sale_items));
      setScheduleEnabled(getBool(response?.schedule_enabled));
      setEnableUsageLimit(response?.usage_limit ? true : false);
      setUsageLimit(response?.usage_limit);
      setStartDate(response?.start_datetime);
      setEndDate(response?.end_datetime);
      if (response?.type === "quantity") {
        setQuantityTiers([...response?.tiers]);
      } else if (response?.type === "earlybird") {
        setEBTiers([...response?.tiers]);
      } else if (response?.type === "bogo") {
        setBogoTiers({ ...(response?.tiers[0] || {}) });
      }
      setSettings({ ...response?.settings } || {});
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
      setIsLoading(false);
    }
  };
  const getSettings = () => {
    let tmpSettings: CampaignSettingsType = {};
    if (campaignType === "earlybird" || campaignType === "scheduled") {
      if (settings?.display_as_regular_price !== undefined) {
        tmpSettings["display_as_regular_price"] =
          settings.display_as_regular_price;
      }
      if (
        settings?.message_format !== undefined &&
        settings?.message_format !== ""
      ) {
        tmpSettings["message_format"] = settings.message_format;
      }
    } else if (campaignType === "quantity") {
      if (settings?.enable_quantity_table !== undefined) {
        tmpSettings["enable_quantity_table"] = settings.enable_quantity_table;
      }
      tmpSettings["apply_as"] = settings?.apply_as || "line_total";

      // cart_quantity_message_format
      if (
        settings?.cart_quantity_message_format !== undefined &&
        settings?.cart_quantity_message_format !== ""
      ) {
        tmpSettings["cart_quantity_message_format"] =
          settings.cart_quantity_message_format;
      }
    } else if (campaignType === "bogo") {
      if (settings?.auto_add_free_product !== undefined) {
        tmpSettings["auto_add_free_product"] = settings.auto_add_free_product;
      }
      if (settings?.apply_as !== undefined && settings?.apply_as !== "") {
        tmpSettings["apply_as"] = settings.apply_as;
      }
      if (
        settings?.bogo_banner_message_format !== undefined &&
        settings?.bogo_banner_message_format !== ""
      ) {
        tmpSettings["bogo_banner_message_format"] =
          settings.bogo_banner_message_format;
      }
      if (
        settings?.cart_bogo_message_format !== undefined &&
        settings?.cart_bogo_message_format !== ""
      ) {
        tmpSettings["cart_bogo_message_format"] =
          settings.cart_bogo_message_format;
      }
      if (
        settings?.bogo_cart_message_location !== undefined &&
        settings?.bogo_cart_message_location !== ""
      ) {
        tmpSettings["bogo_cart_message_location"] =
          settings.bogo_cart_message_location;
      }
    }

    return tmpSettings;
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="cb-page">
          <Navbar />
          <div className="cb-page-header-container">
            <div className="cb-page-header-title">
              {!isEditingTitle ? (
                <span>{campaignTitle}</span>
              ) : (
                <input
                  className="wpab-input"
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              )}
              {isEditingTitle ? (
                <Icon
                  icon={check}
                  className="cb-page-header-title-icon"
                  fill="currentColor"
                  onClick={() => setIsEditingTitle(false)}
                />
              ) : (
                <Icon
                  icon={pencil}
                  className="cb-page-header-title-icon"
                  fill="currentColor"
                  onClick={() => setIsEditingTitle(true)}
                />
              )}
            </div>
            <div className="cb-page-header-actions">
              <button
                className="wpab-cb-btn wpab-cb-btn-danger "
                disabled={isDeleting}
                onClick={handleDeleteCampaign}
              >
                <Icon icon={trash} fill="currentColor" />
                {__("Delete Campaign", "campaignbay")}
              </button>
              <button
                className="wpab-cb-btn wpab-cb-btn-primary "
                disabled={isSaving}
                onClick={handleSaveCampaign}
              >
                <Icon icon={check} fill="currentColor" />
                {__("Update Campaign", "campaignbay")}
              </button>
            </div>
          </div>
          <div className="cb-page-container">
            <div className="cb-form-input-con ">
              <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2 lg:campaignbay-grid-cols-4 campaignbay-gap-[10px]">
                <div className="cb-form-input-con campaignbay-col-span-2 !campaignbay-p-0">
                  <label
                    htmlFor="campaign-title"
                    className="!campaignbay-capitalize"
                  >
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

                <div className="cb-form-input-con campaignbay-col-span-2 md:campaignbay-col-span-1 !campaignbay-p-0">
                  <label
                    htmlFor="campaign-type"
                    className="!campaignbay-capitalize"
                  >
                    {__("Select Discount Type", "campaignbay")} <Required />
                  </label>
                  <select
                    id="campaign-type"
                    className={`wpab-input w-100 ${
                      errors?.type ? "wpab-input-error" : ""
                    }`}
                    value={campaignType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleCampaignTypeChange(e.target.value as CampaignType)
                    }
                  >
                    <option value="bogo">
                      {__("Buy X Get X", "campaignbay")}
                    </option>
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
                    value={campaignStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleCampaignStatusChange(
                        e.target.value as CampaignStatusType
                      )
                    }
                  >
                    <option value="active">
                      {__("Active", "campaignbay")}
                    </option>
                    <option value="inactive">
                      {__("Inactive", "campaignbay")}
                    </option>
                    <option value="scheduled">
                      {__("Scheduled", "campaignbay")}
                    </option>
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
                id="selection-type"
                className={`wpab-input w-100 ${
                  errors?.target_type ? "wpab-input-error" : ""
                }`}
                value={targetType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleSelectionTypeChange(e.target.value as TargetType)
                }
              >
                <option value="entire_store">
                  {__("Entire Store", "campaignbay")}
                </option>
                <option value="category">
                  {__("By Product Category", "campaignbay")}
                </option>
                <option value="product">
                  {__("By Product", "campaignbay")}
                </option>
                {/* <option value="tag">{__("By Tags", "campaignbay")}</option> */}
              </select>
              {renderError(errors?.target_type)}

              {targetType !== "entire_store" ? (
                <>
                  <div
                    style={{ background: "#ffffff" }}
                    className={`${
                      errors?.target_ids ? "wpab-input-error" : ""
                    }`}
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
                      checked={!!isExclude}
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
                // @ts-ignore
                className={`${errors?.tiers ? "wpab-input-error" : ""}`}
                tiers={quantityTiers}
                setTiers={setQuantityTiers}
                errors={errors?.tiers as QuantityTierError[]}
              />
            )}

            {campaignType === "earlybird" && (
              <EBTiers
                // @ts-ignore
                className={`${errors?.tiers ? "wpab-input-error" : ""}`}
                tiers={ebTiers}
                setTiers={setEBTiers}
                errors={errors?.tiers as EBTierError[]}
              />
            )}

            {campaignType === "scheduled" && (
              <div className="cb-form-input-con">
                <label htmlFor="discount-type">
                  {__("How much you want to discount?", "campaignbay")}{" "}
                  <Required />
                </label>
                {/* @ts-ignore */}
                <ToggleGroupControl
                  className={`cb-toggle-group-control ${
                    errors?.discount_type ? "wpab-input-error" : ""
                  }`}
                  __next40pxDefaultSize
                  __nextHasNoMarginBottom
                  isBlock
                  value={discountType}
                  onChange={(value) => setDiscountType(value as DiscountType)}
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
                {discountType === "fixed" && (
                  <span className="wpab-input-help">
                    {__(
                      "It will be applied per item , not in total ",
                      "campaignbay"
                    )}
                  </span>
                )}

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

            {/* Bogo */}
            {campaignType === "bogo" ? (
              <>
                <div className="cb-form-input-con">
                  <label htmlFor="discount-type">
                    {__("DEFINE QUANTITY TIERS", "campaignbay")} <Required />
                  </label>

                  <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2 campaignbay-overflow-hidden campaignbay-flex-wrap">
                    <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
                      <label
                        htmlFor="bogo-buy-amount"
                        className="!campaignbay-leading-[36px]"
                      >
                        {__("Buy Amount", "campaignbay")}
                      </label>
                      <span>
                        <input
                          type="text"
                          id="bogo-buy-amount"
                          className={`wpab-input  ${
                            // @ts-ignore
                            errors?.tiers?.[0]?.buy_quantity
                              ? "wpab-input-error"
                              : ""
                          }`}
                          value={
                            bogoTiers.buy_quantity ? bogoTiers.buy_quantity : ""
                          }
                          onChange={(e) =>
                            setBogoTiers((prev) => ({
                              ...prev,
                              buy_quantity: parseInt(e.target.value) || "",
                            }))
                          }
                        />
                        {/* @ts-ignore */}
                        {renderError(errors?.tiers?.[0]?.buy_quantity, false)}
                      </span>
                      <span className="!campaignbay-leading-[36px]"> , </span>
                    </div>
                    <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
                      <label
                        htmlFor="bogo-get-quantity"
                        className="!campaignbay-leading-[36px]"
                      >
                        {__("Get Quantity", "campaignbay")}
                      </label>
                      <span>
                        <input
                          type="text"
                          id="bogo-get-quantity"
                          className={`wpab-input  ${
                            // @ts-ignore
                            errors?.tiers?.[0]?.get_quantity
                              ? "wpab-input-error"
                              : ""
                          }`}
                          value={
                            bogoTiers.get_quantity ? bogoTiers.get_quantity : ""
                          }
                          onChange={(e) =>
                            setBogoTiers((prev) => ({
                              ...prev,
                              get_quantity: parseInt(e.target.value) || "",
                            }))
                          }
                        />
                        {/* @ts-ignore */}
                        {renderError(errors?.tiers?.[0]?.get_quantity, false)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {/* other config */}
            <div className="cb-form-input-con">
              <label htmlFor="start-time">
                {__("OTHER CONFIGURATIONS", "campaignbay")} <Required />{" "}
              </label>

              {/* Exclude Sale Items */}
              <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                <CbCheckbox
                  id="exclude-sale-items"
                  checked={!!isExcludeSaleItems}
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
                  disabled={campaignStatus === "scheduled"}
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
                      {<Required />}
                    </span>
                    <DateTimePicker
                      timezone={timezone}
                      wpSettings={wpSettings}
                      id="start-time"
                      dateTime={startDate}
                      onDateTimeChange={(date: Date | string) => {
                        setStartDate(date);
                      }}
                      disabled={!scheduleEnabled}
                    />
                    {renderError(errors?.start_datetime, false)}
                  </div>
                  <div
                    className={`${
                      errors?.end_datetime ? "wpab-input-error" : ""
                    }`}
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
                      onDateTimeChange={(date: Date | string) => {
                        setEndDate(date);
                      }}
                      disabled={!scheduleEnabled}
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
              type={campaignType}
            />

            {/* buttons */}
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
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteCampaign}
        onCancel={() => setIsDeleteModalOpen(false)}
      >
        {__("Are you sure you want to delete this campaign?", "campaignbay")}
      </ConfirmDialog>
    </>
  );
};

export default CampaignsEdit;

interface ErrorObject {
  message: string;
}

interface RenderErrorProps {
  error?: ErrorObject;
  negativeMargin?: boolean;
}
export const renderError = (
  error?: ErrorObject,
  negativeMargin = true
): React.ReactNode => {
  if (!error) {
    return null;
  }

  const marginClass = negativeMargin
    ? "campaignbay--mt-2"
    : "campaignbay-mt-[1px]";
  const className = `campaignbay-text-red-600 ${marginClass} campaignbay-text-xs`;

  return <p className={className}>{error.message}</p>;
};
