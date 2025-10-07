import SettingCard from "./SettingCard";
import Checkbox from "./Checkbox";
import { __ } from "@wordpress/i18n";
import { Save } from "lucide-react";
import Select from "./Select";
import Input from "./Input";
import { Icon, pencil } from "@wordpress/icons";
import QuantityTableEditModal from "./QuantityTableEditModal";
import { useState } from "react";

const ProductSettings = ({
  productSettings,
  setProductSettings,
  isSaving,
  updateSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
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

        <Checkbox
          checked={productSettings.show_discount_table}
          onChange={() =>
            setProductSettings((prev) => ({
              ...prev,
              show_discount_table: !prev.show_discount_table,
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
        <div className="wpab-cb-btn-con-bottom">
          <button
            className="wpab-cb-btn wpab-cb-btn-outline-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Icon icon={pencil} fill="currentColor" />
            {__("Customize Table", "campaignbay")}
          </button>
        </div>
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
      <QuantityTableEditModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        options={productSettings.discount_table_options}
        setOptions={(value) => {
          setProductSettings((prev) => ({
            ...prev,
            discount_table_options: { ...value },
          }));
        }}
        isSaving={isSaving}
        updateSettings={updateSettings}
      />
    </div>
  );
};

export default ProductSettings;
