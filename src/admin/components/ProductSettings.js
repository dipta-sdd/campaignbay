import SettingCard from "./SettingCard";
import Checkbox from "./Checkbox";
import { __ } from "@wordpress/i18n";
import { Save } from "lucide-react";
import Select from "./Select";
import Input from "./Input";

const ProductSettings = ({ productSettings, setProductSettings }) => {
  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title={__("Product Page Display", "campaignbay")}>
        <Input
          className="w-100"
          label={
            <span className="wpab-input-label">
              {__(
                "Product Page Schedule or Early Bird Discount Message Format",
                "campaignbay"
              )}
            </span>
          }
          help={__(
            "Use Placeholder like {percentage_off}, {ampount_of} .",
            "campaignbay"
          )}
          value={productSettings.product_message_format_percentage}
          onChange={(value) =>
            setProductSettings((prev) => ({
              ...prev,
              product_message_format_percentage: value,
            }))
          }
        />

        <Checkbox
          checked={productSettings.product_enableQuantityTable}
          onChange={() =>
            setProductSettings((prev) => ({
              ...prev,
              product_enableQuantityTable: !prev.product_enableQuantityTable,
            }))
          }
          label={__(
            "Enable Quantity Discounts Table on Product Page",
            "campaignbay"
          )}
          help={__(
            "Show a table outlining tiered quantity based discounts",
            "campaignbay"
          )}
        />
      </SettingCard>

      <SettingCard
        title={__("Product Exclusion & Prioritization", "campaignbay")}
      >
        <Select
          label={
            <span className="wpab-input-label">
              {__("Product Page Discount Message Format", "campaignbay")}
            </span>
          }
          help={__(
            "Defines how multiple product-level discounts are applied.",
            "campaignbay"
          )}
          options={[
            {
              label: __("Apply Highest Discount", "campaignbay"),
              value: "apply_highest",
            },
            {
              label: __("Apply Lowest Discount", "campaignbay"),
              value: "apply_lowest",
            },
          ]}
          value={productSettings.product_priorityMethod}
          onChange={(value) =>
            setProductSettings((prev) => ({
              ...prev,
              product_priorityMethod: value,
            }))
          }
        />
      </SettingCard>
    </div>
  );
};

export default ProductSettings;
