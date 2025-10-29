import React, { useState, FC, Dispatch, SetStateAction } from "react";
import { __ } from "@wordpress/i18n";
import { Icon, pencil } from "@wordpress/icons";

import SettingCard from "./SettingCard";
import Checkbox from "./Checkbox";
import Select from "./Select";
import Input from "./Input";
import QuantityTableEditModal from "./QuantityTableEditModal";
import Placeholders from "./PlaceHolders";
import { DiscountTableOptionsType, ProductSettingsType } from "../types";

interface ProductSettingsProps {
  productSettings: ProductSettingsType;
  setProductSettings: Dispatch<SetStateAction<ProductSettingsType | null>>;
  setEdited: Dispatch<SetStateAction<boolean>>;
  isSaving: boolean;
  updateSettings: () => void;
}

const ProductSettings: FC<ProductSettingsProps> = ({
  productSettings,
  setProductSettings,
  setEdited,
  isSaving,
  updateSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title={__("Product Page Display", "campaignbay")}>
        <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2 campaignbay-gap-[10px] campaignbay-w-full">
          <Input
            className="w-100"
            label="Product Page Percentage Schedule or Early Bird Discount Message Format"
            help={<Placeholders options={["percentage_off"]} />}
            value={productSettings.product_message_format_percentage}
            onChange={(value: string) => {
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
            help={<Placeholders options={["amount_off"]} />}
            value={productSettings.product_message_format_fixed}
            onChange={(value: string) => {
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
            onChange={(value: string) => {
              setEdited(true);
              setProductSettings((prev) => ({
                ...prev,
                bogo_banner_message_format: value,
              }));
            }}
          />
          <div>
            <Checkbox
              checked={productSettings.show_discount_table}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEdited(true);
                setProductSettings((prev) => ({
                  ...prev,
                  show_discount_table: e.target.checked,
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
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title={__("Product Exclusion & Prioritization", "campaignbay")}
      >
        <Select
          label="Product Page Discount Message Format"
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
              product_priorityMethod: value as "apply_highest" | "apply_lowest",
            }));
          }}
        />
      </SettingCard>

      <QuantityTableEditModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        options={productSettings.discount_table_options}
        setOptions={(value: DiscountTableOptionsType) => {
          setEdited(true);
          setProductSettings((prev) => ({
            ...prev,
            discount_table_options: value,
          }));
        }}
        isSaving={isSaving}
        updateSettings={updateSettings}
      />
    </div>
  );
};

export default ProductSettings;
