// FILE: EBTierRow.tsx
import { useState, FC } from "react";
import { __ } from "@wordpress/i18n";
import { useCbStore } from "../../store/cbStore";
import { EBTier, EBTierError } from "../../utils/types";
import { useGuideStep } from "../../store/GuideContext";
import { TOUR_STEPS } from "../../utils/tourSteps";
import { Toggler } from "../common/Toggler";
import { NumberInput } from "../common/NumberInput";
import { Label } from "./CampaignTiers";

interface EBTierRowProps {
  tierData: EBTier;
  onUpdate: (updatedTier: EBTier) => void;
  onRemove: (id: number | string) => void;
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

  const handleQuantityChange = (value: number | null) => {
    const updatedTier: EBTier = {
      ...tierData,
      quantity: value === null ? "" : value,
    };
    setError("");
    onUpdate(updatedTier);
  };

  const handleValueChange = (value: number | null) => {
    const updatedTier: EBTier = {
      ...tierData,
      value: value === null ? "" : value,
    };
    setError("");
    onUpdate(updatedTier);
  };

  const handleTypeToggle = (newType: string) => {
    if (newType !== "percentage" && newType !== "currency") return;
    onUpdate({ ...tierData, type: newType });
  };

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================
  const ebQuantityInputRef = useGuideStep<HTMLInputElement>(
    TOUR_STEPS.EB_QUANTITY,
  );
  const ebValueInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.EB_VALUE);
  const ebToggleInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.EB_TOGGLE);
  const ebAddBtnInputRef = useGuideStep<HTMLButtonElement>(
    TOUR_STEPS.EB_ADD_BTN,
  );
  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================

  const orderRangeStart = Number(tierData.total) + 1;
  const orderRangeEnd = tierData.quantity
    ? Number(tierData.total) + Number(tierData.quantity)
    : "";

  return (
    <div
      className={`campaignbay-rounded-[8px] campaignbay-p-[10px] ${
        error
          ? "campaignbay-border-red-200 campaignbay-bg-red-50"
          : "campaignbay-border-[#dddddd] campaignbay-bg-[#f0f0f0]"
      }`}
    >
      <div className="campaignbay-flex campaignbay-flex-wrap campaignbay-gap-4 campaignbay-items-start">
        {/* First part: For First/Next X Orders */}
        <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2 campaignbay-flex-nowrap">
          <Label className="campaignbay-text-nowrap">
            {isFirst
              ? __("For First", "campaignbay")
              : __("For Next", "campaignbay")}
          </Label>
          <NumberInput
            value={tierData.quantity === "" ? undefined : tierData.quantity}
            onChange={handleQuantityChange}
            min={1}
            placeholder="e.g., 10"
            error={errors?.quantity?.message}
            classNames={{
              root: "campaignbay-min-w-min campaignbay-w-min",
            }}
          />
          <Label className="campaignbay-text-nowrap">
            {__("Orders", "campaignbay")}{" "}
            <span className="campaignbay-text-gray-500">
              ({orderRangeStart} - {orderRangeEnd}),
            </span>
          </Label>
        </div>

        {/* Second part: give X % or $ */}
        <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2 campaignbay-flex-nowrap">
          <Label className="campaignbay-text-nowrap">
            {__("Get", "campaignbay")}
          </Label>
          <NumberInput
            value={tierData.value === "" ? undefined : tierData.value}
            onChange={handleValueChange}
            min={0}
            placeholder="e.g., 10"
            error={errors?.value?.message}
            classNames={{
              root: "campaignbay-min-w-min campaignbay-w-min",
            }}
          />
          <Toggler
            options={[
              { label: "%", value: "percentage" },
              { label: woocommerce_currency_symbol || "$", value: "currency" },
            ]}
            value={tierData.type || "percentage"}
            onChange={handleTypeToggle}
          />
          <Label className="campaignbay-text-nowrap">
            {tierData.type === "percentage" ? "Off." : "Off per Piece."}
          </Label>
        </div>
      </div>

      {/* Actions: Add / Remove tier */}
      {(!isFirst || isLast) && (
        <div
          className={`campaignbay-flex campaignbay-gap-3 campaignbay-mt-[10px] campaignbay-pt-1.5 campaignbay-border-t ${
            error
              ? "campaignbay-border-red-200"
              : "campaignbay-border-[#dddddd]"
          }`}
        >
          {!isFirst && (
            <button
              type="button"
              onClick={() => onRemove(tierData.id)}
              className="campaignbay-text-[13px] campaignbay-text-red-600 hover:campaignbay-text-red-800 campaignbay-font-[500] campaignbay-transition-colors campaignbay-cursor-pointer campaignbay-bg-transparent campaignbay-border-none"
            >
              {__("– Remove this tier", "campaignbay")}
            </button>
          )}
          {isLast && (
            <button
              ref={isFirst ? ebAddBtnInputRef : null}
              type="button"
              onClick={() => onAdd(setError)}
              className="campaignbay-text-[13px] campaignbay-text-[#3858e9] hover:campaignbay-text-[#2a45b8] campaignbay-font-[500] campaignbay-transition-colors campaignbay-cursor-pointer campaignbay-bg-transparent campaignbay-border-none"
            >
              {__("+ Add another tier", "campaignbay")}
            </button>
          )}
        </div>
      )}

      {error && (
        <span className="campaignbay-mt-1 campaignbay-text-xs campaignbay-text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};

export default EBTierRow;
