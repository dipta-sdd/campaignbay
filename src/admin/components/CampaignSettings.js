import { __ } from "@wordpress/i18n";
import Required from "./Required";
import CbCheckbox from "./CbCheckbox";
import Tooltip from "./tooltip";
import { renderError } from "../pages/CampaignsEdit";
import { useEffect, useState } from "react";
import Input from "./Input";
import { useCbStore } from "../store/cbStore";

export default function CampaignSettings({
  settings,
  setSettings,
  errors,
  type,
}) {
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
                onChange={(e) =>
                  setSettings((prev) => ({
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
                position="right"
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
                className={`wpab-input w-100  ${
                  errors?.message_format ? "wpab-input-error" : ""
                }`}
                value={settings?.message_format}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    message_format: e.target.value,
                  }))
                }
              />
              <span className="wpab-input-help">
                {__(
                  "Product Page Discount Message Format. Leave Blank for default message.",
                  "campaignbay"
                )}
              </span>
              {renderError(errors?.message_format)}
            </div>
          </>
        ) : null}

        {type === "quantity" ? (
          <>
            <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <CbCheckbox
                id="enable-quantity-table"
                checked={
                  settings?.enable_quantity_table === undefined
                    ? true
                    : settings?.enable_quantity_table
                }
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
                position="right"
              />
              {renderError(errors?.enable_quantity_table)}
            </div>

            <div className="cb-form-input-con !campaignbay-p-0">
              <label htmlFor="apply_as">
                {__("APPLY DISCOUNT AS", "campaignbay")} <Required />
              </label>
              <select
                type="text"
                id="apply_as"
                className={`wpab-input w-100 ${
                  errors?.apply_as ? "wpab-input-error" : ""
                }`}
                value={settings?.apply_as || "coupon"}
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
                <option value="coupon">{__("Coupon", "campaignbay")}</option>
                <option value="fee">{__("Fee", "campaignbay")}</option>
              </select>
              {renderError(errors?.apply_as)}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
