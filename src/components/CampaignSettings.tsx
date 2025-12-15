import { __ } from "@wordpress/i18n";
import Required from "./Required";
import CbCheckbox from "./CbCheckbox";
import { renderError } from "../pages/CampaignsEdit";
import { useEffect, FC, Dispatch, SetStateAction } from "react";
import Placeholders from "./PlaceHolders";
import {
  CampaignSettingsErrorsType,
  CampaignSettingsType,
  CampaignType,
} from "../types";
import Tooltip from "./Tooltip";
import { getSettings } from "../utils/settings";

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
      cart_quantity_message_location: value,
    }));
  };

  // console.table(getSettings(type, settings));

  return (
    <>
      <div className="cb-form-input-con">
        <label htmlFor="start-time">
          {__("DISPLAY CONFIGURATIONS", "campaignbay")} <Required />
        </label>
        <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2  campaignbay-gap-[10px]">
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

                {renderError(errors?.display_as_regular_price)}
              </div>
              {settings?.display_as_regular_price !== true ? (
                <>
                  <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2 ">
                    <CbCheckbox
                      id="auto-add-free-product"
                      checked={
                        settings?.show_product_message === undefined
                          ? true
                          : settings?.show_product_message
                      }
                      aria-label={__(
                        "Show Product Page Promotional Message",
                        "campaignbay"
                      )}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSettings((prev: CampaignSettingsType) => ({
                          ...settings,
                          show_product_message: e.target.checked,
                        }))
                      }
                    />
                    <label htmlFor="auto-add-free-product">
                      {__(
                        "Show Product Page Promotional Message",
                        "campaignbay"
                      )}
                    </label>
                    {renderError(errors?.show_product_message)}
                  </div>
                  {settings?.show_product_message === true ||
                  settings?.show_product_message === undefined ? (
                    <div className="cb-form-input-con !campaignbay-p-0 campaignbay-col-span-1 md:campaignbay-col-span-2">
                      <label
                        htmlFor="message-format"
                        className="campaignbay-whitespace-nowrap"
                      >
                        {__("Discount Message Format", "campaignbay")}
                      </label>
                      <input
                        type="text"
                        id="message-format"
                        aria-label={__(
                          "Discount Message Format",
                          "campaignbay"
                        )}
                        placeholder={__(
                          "Leave it blank for default message.",
                          "campaignbay"
                        )}
                        className={`wpab-input w-100  ${
                          errors?.message_format ? "wpab-input-error" : ""
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
                        <Placeholders
                          options={["percentage_off", "amount_off"]}
                        />
                      </span>
                      {renderError(errors?.message_format)}
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {type === "quantity" ? (
            <>
              <div className="cb-form-input-con !campaignbay-p-0">
                <label htmlFor="apply_as">
                  {__("Apply Discount As", "campaignbay")} <Required />
                </label>
                <select
                  id="apply_as"
                  className={`wpab-input w-100 ${
                    errors?.apply_as ? "wpab-input-error" : ""
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

              {/* cart page message location , line items name or notice or dont show*/}
              <div className="cb-form-input-con !campaignbay-p-0">
                <label htmlFor="cart-message-location">
                  {__(
                    "Cart Page Next Discount Message Location",
                    "campaignbay"
                  )}{" "}
                  <Required />
                </label>
                <select
                  id="cart-message-location"
                  className={`wpab-input w-100  ${
                    errors?.cart_quantity_message_location
                      ? "wpab-input-error"
                      : ""
                  }`}
                  value={
                    settings?.cart_quantity_message_location || "line_item_name"
                  }
                  aria-label={__(
                    "Cart Page Next Discount Message Location",
                    "campaignbay"
                  )}
                  onChange={handleCartMessageLocationChange}
                >
                  <option value="line_item_name">
                    {__("Line Item Name", "campaignbay")}
                  </option>
                  <option value="notice" disabled>
                    {__("Notice", "campaignbay")}
                  </option>
                  <option value="dont_show">
                    {__("Don't Show", "campaignbay")}
                  </option>
                </select>
                <span className="wpab-input-help">
                  {__(
                    "Choose where the next quantity discount message will be displayed on the cart page.",
                    "campaignbay"
                  )}
                </span>
                {renderError(errors?.cart_quantity_message_location)}
              </div>
              {/* quantity message format */}
              {settings?.cart_quantity_message_location !== "dont_show" ? (
                <div className="cb-form-input-con !campaignbay-p-0 campaignbay-col-span-1 md:campaignbay-col-span-2">
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
                    className={`wpab-input w-100  ${
                      errors?.cart_quantity_message_format
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
              ) : null}
            </>
          ) : null}

          {type === "bogo" ? (
            <>
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
                  className={`wpab-input w-100  ${
                    errors?.cart_bogo_message_format ? "wpab-input-error" : ""
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
                  className={`wpab-input w-100  ${
                    errors?.bogo_cart_message_location ? "wpab-input-error" : ""
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
                  <option value="notice" disabled>
                    {__("Notice", "campaignbay")}
                  </option>
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
              <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2">
                <CbCheckbox
                  id="auto-add-free-product"
                  checked={
                    settings?.show_bogo_message === undefined
                      ? true
                      : settings?.show_bogo_message
                  }
                  aria-label={__(
                    "Show BOGO Promotional Message at product page",
                    "campaignbay"
                  )}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings((prev: CampaignSettingsType) => ({
                      ...settings,
                      show_bogo_message: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="auto-add-free-product">
                  {__(
                    "Show BOGO Promotional Message at product page",
                    "campaignbay"
                  )}
                </label>
                {renderError(errors?.show_bogo_message)}
              </div>

              {/* prduct page message format */}
              {settings?.show_bogo_message === true ||
              settings?.show_bogo_message === undefined ? (
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
                    className={`wpab-input w-100  ${
                      errors?.bogo_banner_message_format ? "wpab-input-error" : ""
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

                    <Placeholders options={["buy_quantity", "get_quantity"]} />
                  </span>
                  {renderError(errors?.bogo_banner_message_format)}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default CampaignSettings;
