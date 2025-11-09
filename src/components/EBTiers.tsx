import { FC } from "react";
import { __ } from "@wordpress/i18n";
import Required from "./Required";
import EBTierRow from "./EBTierRow";
import { EBTier, EBTierError, EBTierErrorMap } from "../types";

interface EBTiersProps {
  tiers: EBTier[];
  setTiers: React.Dispatch<React.SetStateAction<EBTier[]>>;
  errors?: EBTierError[];
}

const EBTiers: FC<EBTiersProps> = ({ tiers, setTiers, errors }) => {
  const handleAddTier = (
    setError: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const lastTier = tiers[tiers.length - 1];
    if (!lastTier.quantity) {
      setError(
        __("Please fill in the previous tier's quantity first.", "campaignbay")
      );
      return;
    }
    if (!lastTier.value) {
      setError(
        __("Please fill in the previous tier's value first.", "campaignbay")
      );
      return;
    }
    const newTier: EBTier = {
      id: tiers.length,
      quantity: "",
      value: "",
      type: lastTier.type,
      total: lastTier.total + lastTier.quantity,
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (idToRemove: number) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter((tier: EBTier) => tier.id !== idToRemove));
  };

  const handleTierUpdate = (updatedTier: EBTier) => {
    const newTiers = tiers.map((tier: EBTier, index) => {
      if (tier.id === updatedTier.id) {
        return updatedTier;
      }
      return tier;
    });
    const tmpTiers = calculateTotal(newTiers);
    setTiers(tmpTiers);
  };

  const calculateTotal = (tiers: EBTier[]) => {
    let total = 0;
    return tiers.map((tier, index) => {
      if (index !== 0) {
        total = total + (tiers[index - 1].quantity || 0);
      }
      return {
        ...tier,
        total: total,
      };
    });
  };
  return (
    <div className="cb-form-input-con">
      <label htmlFor="quantity-discount">
        {__("DISCOUNT TIERS FOR FIRST SALES", "campaignbay")} <Required />
      </label>
      <span className="wpab-input-help">
        {__(
          "Define discount tiers based on the number of sales of the selected products",
          "campaignbay"
        )}
      </span>
      {tiers.map((tier, index) => (
        <EBTierRow
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
    </div>
  );
};

export default EBTiers;
