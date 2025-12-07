import { __ } from "@wordpress/i18n";
import Required from "./Required";
import CbCheckbox from "./CbCheckbox";
import Tooltip from "./Tooltip";
import { renderError } from "../pages/CampaignsEdit";
import { useEffect, FC, ReactNode, Dispatch, SetStateAction } from "react";
import Placeholders from "./PlaceHolders";
import {
  CampaignSettingsErrorsType,
  CampaignSettingsType,
  CampaignType,
} from "../types";

interface CampaignSettingsProps {
  settings: CampaignSettingsType;
  setSettings: Dispatch<SetStateAction<CampaignSettingsType>>;
  errors?: CampaignSettingsErrorsType;
  type: CampaignType;
}

const CampaignSettings: FC<CampaignSettingsProps> = ({
  settings,
  setSettings,
  errors,
  type,
}) => {
  useEffect(() => {
    if (
      (type === "bogo") &&
      settings?.apply_as === "coupon"
    ) {
      setSettings((prev) => ({
        ...prev,
        apply_as: "line_total",
      }));
    }
  }, [type]);

  const handleApplyAsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value: string = e.target.value;
    if (value !== "coupon" && value !== "line_total" && value !== "fee") return;
    setSettings((prev: CampaignSettingsType) => ({
      ...settings,
      apply_as: value,
    }));
  };

  const handleCartMessageLocationChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (
      value !== "line_item_name" &&
      value !== "notice" &&
      value !== "dont_show"
    )
      return;
    setSettings((prev: CampaignSettingsType) => ({
      ...prev,
      bogo_cart_message_location: value,
    }));
  };
  return (
    <>
      <div className="cb-form-input-con">
        <label htmlFor="start-time">
          {__("DISPLAY CONFIGURATIONS", "campaignbay")} <Required />
        </label>

        {type === "earlybird" || type === "scheduled" ? (
          <>
            <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <CbCheckbox
                id="display-as-regular-price"
                checked={
                  settings?.display_as_regular_price === undefined
                    ? false
                    : settings?.display_as_regular_price
                }
                aria-label={__("Display as Regular Price", "campaignbay")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings((prev: CampaignSettingsType) => ({
                    ...settings,
                    display_as_regular_price: e.target.checked,
                  }))
                }
              />
              <label htmlFor="display-as-regular-price">
                {__("Display as Regular Price", "campaignbay")}
              </label>
              <Tooltip
                content={
                  <span className="campaignbay-text-sm">
                    {__(
                      "When checked , the campaign price will be displayed as the regular price of the product.",
                      "campaignbay"
                    )}
                  </span>
                }
                position="top"
              />

              {renderError(errors?.display_as_regular_price)}
            </div>

            <div className="cb-form-input-con !campaignbay-p-0">
              <label
                htmlFor="message-format"
                className="campaignbay-whitespace-nowrap"
              >
                {__("Discount Message Format", "campaignbay")}
              </label>
              <input
                type="text"
                id="message-format"
                aria-label={__("Discount Message Format", "campaignbay")}
                placeholder={__(
                  "Leave it blank for default message.",
                  "campaignbay"
                )}
                className={`wpab-input w-100  ${errors?.message_format ? "wpab-input-error" : ""
                  }`}
                value={settings?.message_format}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings((prev: CampaignSettingsType) => ({
                    ...prev,
                    message_format: e.target.value,
                  }))
                }
                disabled={settings?.display_as_regular_price}
              />
              <span className="wpab-input-help">
                {__(
                  "Product Page Discount Message Format. Leave Blank for default message.",
                  "campaignbay"
                )}
                <Placeholders options={["percentage_off", "amount_off"]} />
              </span>
              {renderError(errors?.message_format)}
            </div>
          </>
        ) : null}

        {type === "quantity" ? (
          <>
            {/* <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <CbCheckbox
                id="enable-quantity-table"
                checked={
                  settings?.enable_quantity_table === undefined
                    ? true
                    : settings?.enable_quantity_table
                }
                aria-label={__(
                  "Show Quantity Discounts Table on Product Page",
                  "campaignbay"
                )}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...settings,
                    enable_quantity_table: e.target.checked,
                  }))
                }
              />
              <label htmlFor="enable-quantity-table">
                {__(
                  "Show Quantity Discounts Table on Product Page",
                  "campaignbay"
                )}
              </label>
              <Tooltip
                content={
                  <span className="campaignbay-text-sm">
                    {__(
                      "Show a table outlining tiered quantity based discounts",
                      "campaignbay"
                    )}
                  </span>
                }
                position="top"
              />
              {renderError(errors?.enable_quantity_table)}
            </div> */}

            <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2  campaignbay-gap-[10px]">
              <div className="cb-form-input-con !campaignbay-p-0">
                <label htmlFor="apply_as">
                  {__("Apply Discount As", "campaignbay")} <Required />
                </label>
                <select
                  id="apply_as"
                  className={`wpab-input w-100 ${errors?.apply_as ? "wpab-input-error" : ""
                    }`}
                  value={settings?.apply_as || "line_total"}
                  onChange={handleApplyAsChange}
                >
                  <option value="line_total">
                    {__("Strike through in line total", "campaignbay")}
                  </option>
                  <option value="coupon">{__("Coupon", "campaignbay")}</option>
                  <option value="fee">{__("Fee", "campaignbay")}</option>
                </select>
                {renderError(errors?.apply_as)}
              </div>
              {/* next quantity message format */}
              <div className="cb-form-input-con !campaignbay-p-0">
                <label
                  htmlFor="message-format"
                  className="campaignbay-whitespace-nowrap"
                >
                  {__("Next Discount Message Format", "campaignbay")}
                </label>
                <input
                  type="text"
                  id="message-format"
                  placeholder={__(
                    "Leave it blank for default message.",
                    "campaignbay"
                  )}
                  aria-label={__(
                    "Cart Page Next Discount Message Format",
                    "campaignbay"
                  )}
                  className={`wpab-input w-100  ${errors?.cart_quantity_message_format
                      ? "wpab-input-error"
                      : ""
                    }`}
                  value={settings?.cart_quantity_message_format}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      cart_quantity_message_format: e.target.value,
                    }))
                  }
                />
                <span className="wpab-input-help">
                  {__(
                    "This message will be displayed on the cart item name. Leave blank for the default message.",
                    "campaignbay"
                  )}
                  <Placeholders
                    options={[
                      "remainging_quantity_for_next_offer",
                      "percentage_off",
                      "amount_off",
                    ]}
                  />
                </span>
                {renderError(errors?.cart_quantity_message_format)}
              </div>
            </div>
          </>
        ) : null}

        {type === "bogo" ? (
          <>
            {/* auto add to cart */}
            {/* <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <CbCheckbox
                id="auto-add-free-product"
                checked={
                  settings?.auto_add_free_product === undefined
                    ? true
                    : settings?.auto_add_free_product
                }
                aria-label={__(
                  "Automatically add free product to cart",
                  "campaignbay"
                )}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings((prev: CampaignSettingsType) => ({
                    ...settings,
                    auto_add_free_product: e.target.checked,
                  }))
                }
              />
              <label htmlFor="auto-add-free-product">
                {__("Automatically add free product to cart", "campaignbay")}
              </label>
              <Tooltip
                content={
                  <span className="campaignbay-text-sm">
                    {__(
                      "When checked, the free product will be automatically added to the cart.",
                      "campaignbay"
                    )}
                  </span>
                }
                position="top"
              />
              {renderError(errors?.auto_add_free_product)}
            </div> */}

            <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2  campaignbay-gap-[10px]">
              {/* apply as  */}
              {/* <div className="cb-form-input-con !campaignbay-p-0">
                <label htmlFor="apply_as">
                  {__("APPLY DISCOUNT AS", "campaignbay")} <Required />
                </label>
                <select
                  id="apply_as"
                  className={`wpab-input w-100 ${
                    errors?.apply_as ? "wpab-input-error" : ""
                  }`}
                  value={settings?.apply_as || "coupon"}
                  aria-label={__("Apply Discount As", "campaignbay")}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apply_as: e.target.value,
                    })
                  }
                >
                  <option value="line_total">
                    {__("Strike through in line total", "campaignbay")}
                  </option>
                  <option value="fee">{__("Fee", "campaignbay")}</option>
                </select>
                {renderError(errors?.apply_as)}
              </div> */}

              {/* prduct page message format */}

              <div className="cb-form-input-con !campaignbay-p-0">
                <label
                  htmlFor="message-format"
                  className="campaignbay-whitespace-nowrap"
                >
                  {__("Product Page Discount Message Format", "campaignbay")}
                </label>

                <input
                  type="text"
                  placeholder={__(
                    "Leave it blank for default message.",
                    "campaignbay"
                  )}
                  id="message-format"
                  aria-label={__(
                    "Product Page Discount Message Format",
                    "campaignbay"
                  )}
                  className={`wpab-input w-100  ${errors?.bogo_banner_message_format
                      ? "wpab-input-error"
                      : ""
                    }`}
                  value={settings?.bogo_banner_message_format}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings((prev: CampaignSettingsType) => ({
                      ...prev,
                      bogo_banner_message_format: e.target.value,
                    }))
                  }
                />


                <span className="wpab-input-help">
                  {__(
                    "This message will be displayed on the product page. Leave blank for the default message.",
                    "campaignbay"
                  )}

                  <Placeholders
                    options={["buy_quantity", "get_quantity"]}
                  />

                </span>
                {renderError(errors?.bogo_banner_message_format
                )}
              </div>

              {/* cart page message format when a bogo applyed then only show */}
              <div className="cb-form-input-con !campaignbay-p-0">
                <label
                  htmlFor="message-format"
                  className="campaignbay-whitespace-nowrap"
                >
                  {__("Cart Page Discount Message Format", "campaignbay")}
                </label>
                <input
                  type="text"
                  id="message-format"
                  placeholder={__(
                    "Leave it blank for default message.",
                    "campaignbay"
                  )}
                  aria-label={__(
                    "Cart Page Discount Message Format",
                    "campaignbay"
                  )}
                  className={`wpab-input w-100  ${errors?.cart_bogo_message_format ? "wpab-input-error" : ""
                    }`}
                  value={settings?.cart_bogo_message_format}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings((prev: CampaignSettingsType) => ({
                      ...prev,
                      cart_bogo_message_format: e.target.value,
                    }))
                  }
                />
                <span className="wpab-input-help">
                  {__(
                    "This message will be displayed on the cart page. Leave blank for the default message.",
                    "campaignbay"
                  )}
                  <Placeholders options={["title", "buy_product_name"]} />
                </span>
                {renderError(errors?.cart_bogo_message_format)}
              </div>
              {/* cart page message location , line items name or notice or dont show*/}
              <div className="cb-form-input-con !campaignbay-p-0">
                <label htmlFor="cart-message-location">
                  {__("Cart Page Message Location", "campaignbay")} <Required />
                </label>
                <select
                  id="cart-message-location"
                  className={`wpab-input w-100  ${errors?.bogo_cart_message_location ? "wpab-input-error" : ""
                    }`}
                  value={
                    settings?.bogo_cart_message_location || "line_item_name"
                  }
                  aria-label={__("Cart Page Message Location", "campaignbay")}
                  onChange={handleCartMessageLocationChange}
                >
                  <option value="line_item_name">
                    {__("Line Item Name", "campaignbay")}
                  </option>
                  <option value="notice" disabled>{__("Notice", "campaignbay")}</option>
                  <option value="dont_show">
                    {__("Don't Show", "campaignbay")}
                  </option>
                </select>
                <span className="wpab-input-help">
                  {__(
                    "Choose where the BOGO discount message will be displayed on the cart page.",
                    "campaignbay"
                  )}
                </span>
                {renderError(errors?.bogo_cart_message_location)}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

export default CampaignSettings;
