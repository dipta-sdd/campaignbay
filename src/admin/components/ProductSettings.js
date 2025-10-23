import SettingCard from "./SettingCard";
import Checkbox from "./Checkbox";
import { __ } from "@wordpress/i18n";
import Select from "./Select";
import Input from "./Input";
import { Icon, pencil } from "@wordpress/icons";
import QuantityTableEditModal from "./QuantityTableEditModal";
import { useState } from "react";
import Placeholders from "./PlaceHolders";

const ProductSettings = ({
  productSettings,
  setProductSettings,
  setEdited,
  isSaving,
  updateSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title={__("Product Page Display", "campaignbay")}>
        <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2  campaignbay-gap-[10px] campaignbay-w-full">
          <Input
            className="w-100"
            label="Product Page Percentage Schedule or Early Bird Discount Message Format"
            help={<Placeholders options={["percentage_off"]} />}
            value={productSettings.product_message_format_percentage}
            onChange={(value) => {
              setEdited(true);
              setProductSettings((prev) => ({
                ...prev,
                product_message_format_percentage: value,
              }));
            }}
          />
          <Input
            className="w-100"
            label="Product Page Fixed Schedule or Early Bird Discount Message Format"
            help={<Placeholders options={["ampount_of"]} />}
            value={productSettings.product_message_format_fixed}
            onChange={(value) => {
              setEdited(true);
              setProductSettings((prev) => ({
                ...prev,
                product_message_format_fixed: value,
              }));
            }}
          />

          <Input
            className="w-100"
            label="Product Page BOGO Discount Message Format"
            help={<Placeholders options={["buy_quantity", "get_quantity"]} />}
            value={productSettings.bogo_banner_message_format}
            onChange={(value) => {
              setEdited(true);
              setProductSettings((prev) => ({
                ...prev,
                bogo_banner_message_format: value,
              }));
            }}
          />
          <span>
            <Checkbox
              checked={productSettings.show_discount_table}
              onChange={() => {
                setEdited(true);
                setProductSettings((prev) => ({
                  ...prev,
                  show_discount_table: !prev.show_discount_table,
                }));
              }}
              label={__(
                "Enable Quantity Discounts Table on Product Page",
                "campaignbay"
              )}
              help={__(
                "Show a table outlining tiered quantity based discounts",
                "campaignbay"
              )}
            />
            <div className="wpab-cb-btn-con-bottom !campaignbay-justify-start">
              <button
                className="wpab-cb-btn wpab-cb-btn-outline-primary"
                onClick={() => setIsModalOpen(true)}
              >
                <Icon icon={pencil} fill="currentColor" />
                {__("Customize Table", "campaignbay")}
              </button>
            </div>
          </span>
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
          onChange={(value) => {
            setEdited(true);
            setProductSettings((prev) => ({
              ...prev,
              product_priorityMethod: value,
            }));
          }}
        />
      </SettingCard>
      <QuantityTableEditModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        options={productSettings.discount_table_options}
        setOptions={(value) => {
          {
            setEdited(true);
            setProductSettings((prev) => ({
              ...prev,
              discount_table_options: { ...value },
            }));
          }
        }}
        isSaving={isSaving}
        updateSettings={updateSettings}
      />
    </div>
  );
};

export default ProductSettings;
