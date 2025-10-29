import { __ } from "@wordpress/i18n";
import React, { FC } from "react";
import TierRow from "./TierRow";
import {
  QuantityTier,
  QuantityTierError,
  QuantityTierErrorMap,
} from "../types";
import Required from "./Required";

interface QuantityTiersProps {
  tiers: QuantityTier[];
  setTiers: React.Dispatch<React.SetStateAction<QuantityTier[]>>;
  errors?: QuantityTierError[];
}

const QuantityTiers: FC<QuantityTiersProps> = ({ tiers, setTiers, errors }) => {
  const handleAddTier = (
    setError: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const lastTier = tiers[tiers.length - 1];

    const maxAsNumber = Number(lastTier.max);
    const valueAsNumber = Number(lastTier.value);

    if (!lastTier.max || isNaN(maxAsNumber)) {
      setError(
        __(
          "Please fill in the previous tier's maximum quantity first.",
          "campaignbay"
        )
      );
      return;
    }
    if (lastTier.min && maxAsNumber <= lastTier.min) {
      setError(
        __(
          "The maximum quantity must be greater than the minimum quantity.",
          "campaignbay"
        )
      );
      return;
    }
    if (!lastTier.value || isNaN(valueAsNumber)) {
      setError(
        __("Please fill in the previous tier's value first.", "campaignbay")
      );
      return;
    }

    const newTier: QuantityTier = {
      // Revert to using array length for the ID, as required by the backend.
      id: tiers.length,
      min: maxAsNumber + 1,
      max: "",
      value: "",
      type: lastTier.type,
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (idToRemove: number | string) => {
    if (tiers.length <= 1) return;
    const newTiers = tiers
      .filter((tier) => tier.id !== idToRemove)
      .map((tier, index) => ({
        ...tier,
        id: index,
      }));

    setTiers(newTiers);
  };

  const handleTierUpdate = (updatedTier: QuantityTier) => {
    const newTiers = tiers.map((tier) =>
      tier.id === updatedTier.id ? updatedTier : tier
    );
    const currentIndex = Number(updatedTier.id);
    const nextTierIndex = currentIndex + 1;

    if (nextTierIndex < newTiers.length && updatedTier.max) {
      newTiers[nextTierIndex].min = Number(updatedTier.max) + 1;
    }

    setTiers(newTiers);
  };

  return (
    <div className="cb-form-input-con">
      <label htmlFor="quantity-discount">
        {__("DEFINE QUANTITY TIERS", "campaignbay")} <Required />
      </label>
      <span className="wpab-input-help">
        {__("Define quantity tiers for the discount", "campaignbay")}
      </span>
      {tiers.map((tier, index) => (
        <TierRow
          key={tier.id} // The key is now always a unique, sequential number.
          tierData={tier}
          onUpdate={handleTierUpdate}
          onRemove={handleRemoveTier}
          onAdd={handleAddTier}
          isLast={index === tiers.length - 1}
          isFirst={index === 0}
          errors={errors?.[tier.id]}
        />
      ))}
    </div>
  );
};

export default QuantityTiers;
