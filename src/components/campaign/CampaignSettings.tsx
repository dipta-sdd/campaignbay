import { __ } from "@wordpress/i18n";
import Required from "./Required";
import { FC, Dispatch, SetStateAction } from "react";
import {
  CampaignSettingsErrorsType,
  CampaignSettingsType,
  CampaignType,
} from "../../utils/types";
import { Checkbox } from "../common/Checkbox";
import { renderError } from "./Campaign";
import Select from "../common/Select";
import CopyToClipboard from "../common/CopyToClipboard";
import { Input } from "../common/Input";

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
  const handleApplyAsChange = (value: string | number) => {
    if (value !== "coupon" && value !== "line_total" && value !== "fee") return;
    setSettings((prev: CampaignSettingsType) => ({
      ...settings,
      apply_as: value,
    }));
  };

  const handleCartMessageLocationChange = (value: string | number) => {
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
      {type === "earlybird" || type === "scheduled" ? (
        <>
          <div className="campaignbay-flex campaignbay-flex-col campaignbay-items-start campaignbay-gap-2">
            <Checkbox
              checked={
                settings?.display_as_regular_price === undefined
                  ? false
                  : settings?.display_as_regular_price
              }
              aria-label={__("Display as Regular Price", "campaignbay")}
              onChange={(checked) =>
                setSettings((prev: CampaignSettingsType) => ({
                  ...settings,
                  display_as_regular_price: checked,
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
                <Checkbox
                  checked={
                    settings?.show_product_message === undefined
                      ? true
                      : settings?.show_product_message
                  }
                  aria-label={__(
                    "Show Product Page Promotional Message",
                    "campaignbay",
                  )}
                  onChange={(checked) =>
                    setSettings((prev: CampaignSettingsType) => ({
                      ...settings,
                      show_product_message: checked,
                    }))
                  }
                />
                <label htmlFor="auto-add-free-product">
                  {__("Show Product Page Promotional Message", "campaignbay")}
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
                    aria-label={__("Discount Message Format", "campaignbay")}
                    placeholder={__(
                      "Leave it blank for default message.",
                      "campaignbay",
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
                      "campaignbay",
                    )}
                    <Placeholders options={["percentage_off", "amount_off"]} />
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
            <Select
              id="apply_as"
              isError={!!errors?.apply_as}
              value={settings?.apply_as || "line_total"}
              onChange={handleApplyAsChange}
              options={[
                {
                  value: "line_total",
                  label: __("Strike through in line total", "campaignbay"),
                },
                { value: "coupon", label: __("Coupon", "campaignbay") },
                { value: "fee", label: __("Fee", "campaignbay") },
              ]}
            />
            {renderError(errors?.apply_as)}
          </div>

          {/* cart page message location , line items name or notice or dont show*/}
          <div className="cb-form-input-con !campaignbay-p-0">
            <label htmlFor="cart-message-location">
              {__("Cart Page Next Discount Message Location", "campaignbay")}{" "}
              <Required />
            </label>
            <Select
              id="cart-message-location"
              isError={!!errors?.cart_quantity_message_location}
              value={
                settings?.cart_quantity_message_location || "line_item_name"
              }
              aria-label={__(
                "Cart Page Next Discount Message Location",
                "campaignbay",
              )}
              onChange={handleCartMessageLocationChange}
              options={[
                {
                  value: "line_item_name",
                  labelNode: (
                    <span className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                      {__("Line Item Name", "campaignbay")}
                      <span className="campaignbay-text-xs campaignbay-opacity-50 !campaignbay-font-normal">
                        May not work in block theme.
                      </span>
                    </span>
                  ),
                  label: __("Line Item Name", "campaignbay"),
                },
                {
                  value: "notice",
                  label: __("Notice", "campaignbay"),
                  variant: "coming_soon",
                },
                {
                  value: "dont_show",
                  label: __("Don't Show", "campaignbay"),
                },
              ]}
            />
            <span className="wpab-input-help">
              {__(
                "Choose where the next quantity discount message will be displayed on the cart page.",
                "campaignbay",
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
                  "campaignbay",
                )}
                aria-label={__(
                  "Cart Page Next Discount Message Format",
                  "campaignbay",
                )}
                className={`wpab-input w-100  ${
                  errors?.cart_quantity_message_format ? "wpab-input-error" : ""
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
                  "campaignbay",
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
          <div className="campaignbay-flex campaignbay-flex-col campaignbay-items-start campaignbay-gap-[4px]">
            <Label>
              {__("Cart Page Discount Message Format", "campaignbay")}
            </Label>
            <Input
              type="text"
              id="message-format"
              placeholder={__(
                "Leave it blank for default message.",
                "campaignbay",
              )}
              aria-label={__(
                "Cart Page Discount Message Format",
                "campaignbay",
              )}
              error={errors?.cart_bogo_message_format?.message || ""}
              value={settings?.cart_bogo_message_format}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSettings((prev: CampaignSettingsType) => ({
                  ...prev,
                  cart_bogo_message_format: e.target.value,
                }))
              }
            />
            <span className="campaignbay-text-[13px] campaignbay-font-[400] campaignbay-text-[#1e1e1e] campaignbay-leading-[16px] ">
              {__(
                "This message will be displayed on the cart page. Leave blank for the default message.",
                "campaignbay",
              )}
              <Placeholders options={["title", "buy_product_name"]} />
            </span>
          </div>
          {/* cart page message location , line items name or notice or dont show*/}
          <div className="cb-form-input-con !campaignbay-p-0">
            <label htmlFor="bogo-cart-message-location">
              {__("Cart Page Message Location", "campaignbay")} <Required />
            </label>
            <Select
              id="bogo-cart-message-location"
              isError={!!errors?.bogo_cart_message_location}
              value={settings?.bogo_cart_message_location || "line_item_name"}
              aria-label={__("Cart Page Message Location", "campaignbay")}
              onChange={handleCartMessageLocationChange}
              options={[
                {
                  value: "line_item_name",
                  labelNode: (
                    <span className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                      {__("Line Item Name", "campaignbay")}
                      <span className="campaignbay-text-xs campaignbay-opacity-50 !campaignbay-font-normal">
                        May not work in block theme.
                      </span>
                    </span>
                  ),
                  label: __("Line Item Name", "campaignbay"),
                },
                {
                  value: "notice",
                  label: __("Notice", "campaignbay"),
                  variant: "coming_soon",
                },
                {
                  value: "dont_show",
                  label: __("Don't Show", "campaignbay"),
                },
              ]}
            />
            <span className="wpab-input-help">
              {__(
                "Choose where the BOGO discount message will be displayed on the cart page.",
                "campaignbay",
              )}
            </span>
            {renderError(errors?.bogo_cart_message_location)}
          </div>
          <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2">
            <Checkbox
              checked={
                settings?.show_bogo_message === undefined
                  ? true
                  : settings?.show_bogo_message
              }
              aria-label={__(
                "Show BOGO Promotional Message at product page",
                "campaignbay",
              )}
              onChange={(checked) =>
                setSettings((prev: CampaignSettingsType) => ({
                  ...settings,
                  show_bogo_message: checked,
                }))
              }
            />
            <label htmlFor="auto-add-free-product">
              {__(
                "Show BOGO Promotional Message at product page",
                "campaignbay",
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
                  "campaignbay",
                )}
                id="message-format"
                aria-label={__(
                  "Product Page Discount Message Format",
                  "campaignbay",
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
                  "campaignbay",
                )}

                <Placeholders options={["buy_quantity", "get_quantity"]} />
              </span>
              {renderError(errors?.bogo_banner_message_format)}
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default CampaignSettings;

interface PlaceholderProps {
  text: string;
}

export const Placeholder: FC<PlaceholderProps> = ({ text }) => {
  return (
    <span className="campaignbay-bg-gray-200 campaignbay-my-[2px] campaignbay-mx-[4px] campaignbay-p-[2px] campaignbay-px-[4px] campaignbay-rounded-md campaignbay-inline-flex campaignbay-items-center campaignbay-justify-center campaignbay-gap-[4px]">
      <span className="campaignbay-mr-[2px] campaignbay-text-gray-600">{`{${text}}`}</span>
      <CopyToClipboard text={`{${text}}`} />
    </span>
  );
};

interface PlaceholdersProps {
  options: string[];
}

export const Placeholders: FC<PlaceholdersProps> = ({ options }) => {
  return (
    <span className="campaignbay-inline campaignbay-text-wrap">
      {" "}
      Use placeholder like
      {options.map((option, index) => {
        return <Placeholder key={index} text={option} />;
      })}
      .
    </span>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => {
  return (
    <label className="campaignbay-text-[11px] campaignbay-font-[400] campaignbay-text-[#1e1e1e] campaignbay-leading-[16px] campaignbay-uppercase">
      {children}
    </label>
  );
};
