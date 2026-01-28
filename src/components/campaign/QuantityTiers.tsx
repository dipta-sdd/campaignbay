import { __ } from "@wordpress/i18n";
import React, { FC } from "react";
import TierRow from "./TierRow";
import { QuantityTier, QuantityTierError } from "../../utils/types";
import Required from "./Required";
import { Section } from "./Campaign";

interface QuantityTiersProps {
  tiers: QuantityTier[];
  onUpdateTiers: (tiers: QuantityTier[]) => void;
  errors?: QuantityTierError[];
}

const QuantityTiers: FC<QuantityTiersProps> = ({
  tiers,
  onUpdateTiers,
  errors,
}) => {
  const handleAddTier = (
    setError: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const lastTier = tiers[tiers.length - 1];

    const maxAsNumber = Number(lastTier.max);
    const valueAsNumber = Number(lastTier.value);

    if (!lastTier.max || isNaN(maxAsNumber)) {
      setError(
        __(
          "Please fill in the previous tier's maximum quantity first.",
          "campaignbay",
        ),
      );
      return;
    }
    if (lastTier.min && maxAsNumber <= lastTier.min) {
      setError(
        __(
          "The maximum quantity must be greater than the minimum quantity.",
          "campaignbay",
        ),
      );
      return;
    }
    if (!lastTier.value || isNaN(valueAsNumber)) {
      setError(
        __("Please fill in the previous tier's value first.", "campaignbay"),
      );
      return;
    }

    const newTier: QuantityTier = {
      id: tiers.length,
      min: maxAsNumber + 1,
      max: "",
      value: "",
      type: lastTier.type,
    };
    onUpdateTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (idToRemove: number | string) => {
    if (tiers.length <= 1) return;
    const newTiers = tiers
      .filter((tier) => tier.id !== idToRemove)
      .map((tier, index) => ({
        ...tier,
        id: index,
      }));

    onUpdateTiers(newTiers);
  };

  const handleTierUpdate = (updatedTier: QuantityTier) => {
    const newTiers = tiers.map((tier) =>
      tier.id === updatedTier.id ? updatedTier : tier,
    );
    const currentIndex = Number(updatedTier.id);
    const nextTierIndex = currentIndex + 1;

    if (nextTierIndex < newTiers.length && updatedTier.max) {
      newTiers[nextTierIndex].min = Number(updatedTier.max) + 1;
    }

    if (nextTierIndex < newTiers.length && updatedTier.max) {
      newTiers[nextTierIndex].min = Number(updatedTier.max) + 1;
    }

    onUpdateTiers(newTiers);
  };

  return (
    <Section header={__("Quantity Tiers", "campaignbay")} required>
      {tiers.map((tier, index) => (
        <TierRow
          key={tier.id}
          tierData={tier}
          onUpdate={handleTierUpdate}
          onRemove={handleRemoveTier}
          onAdd={handleAddTier}
          isLast={index === tiers.length - 1}
          isFirst={index === 0}
          errors={errors?.[tier.id]}
        />
      ))}
    </Section>
  );
};

export default QuantityTiers;
