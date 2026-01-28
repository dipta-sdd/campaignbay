import { FC } from "react";
import { __ } from "@wordpress/i18n";
import Required from "./Required";
import EBTierRow from "./EBTierRow";
import { EBTier, EBTierError } from "../../utils/types";
import { Section } from "./Campaign";

interface EBTiersProps {
  tiers: EBTier[];
  onUpdateTiers: (tiers: EBTier[]) => void;
  errors?: EBTierError[];
}

const EBTiers: FC<EBTiersProps> = ({ tiers, onUpdateTiers, errors }) => {
  const handleAddTier = (
    setError: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const lastTier = tiers[tiers.length - 1];
    if (!lastTier.quantity) {
      setError(
        __("Please fill in the previous tier's quantity first.", "campaignbay"),
      );
      return;
    }
    if (!lastTier.value) {
      setError(
        __("Please fill in the previous tier's value first.", "campaignbay"),
      );
      return;
    }
    const newTier: EBTier = {
      id: tiers.length,
      quantity: "",
      value: "",
      type: lastTier.type,
      total: Number(lastTier.total) + Number(lastTier.quantity),
    };
    onUpdateTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (idToRemove: number | string) => {
    if (tiers.length <= 1) return;
    onUpdateTiers(tiers.filter((tier: EBTier) => tier.id !== idToRemove));
  };

  const handleTierUpdate = (updatedTier: EBTier) => {
    const newTiers = tiers.map((tier: EBTier) => {
      if (tier.id === updatedTier.id) {
        return updatedTier;
      }
      return tier;
    });
    const tmpTiers = calculateTotal(newTiers);
    onUpdateTiers(tmpTiers);
  };

  const calculateTotal = (tiers: EBTier[]) => {
    let total = 0;
    return tiers.map((tier, index) => {
      if (index !== 0) {
        total = total + Number(tiers[index - 1].quantity);
      }
      return {
        ...tier,
        total: total,
      };
    });
  };

  return (
    <Section header={__("Early Bird Tiers", "campaignbay")} required>
      {tiers.map((tier, index) => (
        <EBTierRow
          key={tier.id}
          tierData={tier}
          onUpdate={handleTierUpdate}
          onRemove={handleRemoveTier}
          onAdd={handleAddTier}
          isLast={index === tiers.length - 1}
          isFirst={index === 0}
          errors={errors?.[tier.id as number]}
        />
      ))}
    </Section>
  );
};

export default EBTiers;
