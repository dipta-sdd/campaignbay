// src/components/TierRow.jsx
import { useState, FC } from "react";
import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useCbStore } from "../store/cbStore";
import { EBTier, EBTierError } from "../types";

interface EBTierRowProps {
  tierData: EBTier;
  onUpdate: (updatedTier: EBTier) => void;
  onRemove: (id: number) => void;
  onAdd: (setError: React.Dispatch<React.SetStateAction<string>>) => void;
  isLast: boolean;
  isFirst: boolean;
  errors?: EBTierError;
}

const EBTierRow: FC<EBTierRowProps> = ({
  tierData,
  onUpdate,
  onRemove,
  onAdd,
  isLast,
  isFirst,
  errors,
}) => {
  const [error, setError] = useState<string>("");
  const { woocommerce_currency_symbol } = useCbStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const tmpValue = name === "value" ? Number(value) : value;
    const updatedTier: EBTier = { ...tierData, [name]: tmpValue };
    setError("");
    onUpdate(updatedTier);
  };

  const handleTypeToggle = (newType: string | number | undefined) => {
    if (newType !== "percentage" && newType !== "currency") return;
    onUpdate({ ...tierData, type: newType });
  };

  return (
    <div className={`cb-quantity-tier-row ${error ? "has-error" : ""}`}>
      <div className="tier-inputs">
        <div className="wpab-grid-2">
          <div className="wpab-tier-input-grid-child">
            <span className="wpab-input-label">
              {isFirst
                ? __("For First", "campaignbay")
                : __("For Next", "campaignbay")}
            </span>
            <input
              type="number"
              name="quantity"
              value={tierData.quantity}
              className={`min-input wpab-input ${
                errors?.quantity ? "wpab-input-error" : ""
              }`}
              onChange={handleChange}
              min="1"
              placeholder="e.g., 10"
            />
            <span className="wpab-input-label">
              {__("Orders ", "campaignbay")}

              {"( " + (Number(tierData.total) + 1) + " - "}
              {tierData.quantity
                ? Number(tierData.total) + Number(tierData.quantity)
                : ""}
              {" ),"}
            </span>
          </div>
          <div className="wpab-tier-input-grid-child">
            <span className="wpab-input-label">
              {__("give ", "campaignbay")}
            </span>
            <input
              type="number"
              name="value"
              value={tierData.value}
              onChange={handleChange}
              placeholder="e.g., 10"
              className={`value-input wpab-input ${
                errors?.value ? "wpab-input-error" : ""
              }`}
              min="0"
            />
            <div className="type-toggle">
              <ToggleGroupControl
                className="cb-toggle-group-control"
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                isBlock
                value={tierData.type}
                onChange={(value) => handleTypeToggle(value)}
              >
                <ToggleGroupControlOption label={"%"} value="percentage" />
                <ToggleGroupControlOption
                  label={woocommerce_currency_symbol || "$"}
                  value="currency"
                />
              </ToggleGroupControl>
            </div>
          </div>
        </div>
      </div>

      {isFirst || isLast ? (
        <div className="tier-actions">
          {!isFirst && (
            <button
              type="button"
              className="remove-tier"
              onClick={() => onRemove(tierData.id)}
            >
              – Remove this tier
            </button>
          )}
          {isLast && (
            <button
              type="button"
              className="add-tier"
              onClick={() => {
                onAdd(setError);
              }}
            >
              + Add another tier
            </button>
          )}
        </div>
      ) : null}
      {error && <p className="error-message m-0">{error}</p>}
    </div>
  );
};

export default EBTierRow;
