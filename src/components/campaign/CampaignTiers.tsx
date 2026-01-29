import { useState } from "@wordpress/element";
import { __, _n } from "@wordpress/i18n";
import { FC, useEffect } from "react";
import {
  BogoTier,
  Campaign as CampaignInterfaceBase,
  CampaignErrorsType,
  DiscountType,
  EBTier,
  EBTierError,
  QuantityTier,
  QuantityTierError,
  CampaignType,
} from "../../utils/types";
import { useGuideStep } from "../../store/GuideContext";
import { TOUR_STEPS } from "../../utils/tourSteps";
import { SelectOption } from "../common/Select";
import { useCbStore } from "../../store/cbStore";
import { renderError, Section } from "./Campaign";
import { Toggler } from "../common/Toggler";
import Required from "./Required";
import { Input } from "../common/Input";
import { NumberInput } from "../common/NumberInput";
import QuantityTiers from "./QuantityTiers";
import EBTiers from "./EBTiers";
// @ts-ignore
interface CampaignInterface extends CampaignInterfaceBase {
  type: CampaignType | null;
}
interface CampaignTiersProps {
  campaign: CampaignInterface;
  setCampaign: React.Dispatch<React.SetStateAction<CampaignInterface>>;
  errors: CampaignErrorsType;
  products: SelectOption[];
}

const CampaignTiers: FC<CampaignTiersProps> = ({
  campaign,
  setCampaign,
  errors,
  products,
}) => {
  const { woocommerce_currency_symbol } = useCbStore();
  // Ensure tiers structure is correct when type changes
  useEffect(() => {
    if (campaign.type === "quantity") {
      if (!campaign.tiers || campaign.tiers.length === 0) {
        setCampaign((prev) => ({
          ...prev,
          tiers: [
            {
              id: 0,
              min: 1,
              max: "",
              value: "",
              type: "percentage",
            },
          ] as QuantityTier[],
        }));
      }
    } else if (campaign.type === "earlybird") {
      if (!campaign.tiers || campaign.tiers.length === 0) {
        setCampaign((prev) => ({
          ...prev,
          tiers: [
            {
              id: 0,
              quantity: "",
              value: "",
              type: "percentage",
              total: 0,
            },
          ] as EBTier[],
        }));
      }
    } else if (campaign.type === "bogo") {
      if (!campaign.tiers || campaign.tiers.length === 0) {
        setCampaign((prev) => ({
          ...prev,
          tiers: [
            {
              id: 0,
              buy_quantity: 1,
              get_quantity: 1,
            },
          ] as BogoTier[],
        }));
      }
    } else if (campaign.tiers && campaign.tiers.length > 0) {
      // Clear tiers if not needed for current type (optional cleanup)
      setCampaign((prev) => ({ ...prev, tiers: [] }));
    }
  }, [campaign.type]);

  // Type guard helpers
  const isQuantityTiers = (tiers: any[]): tiers is QuantityTier[] => {
    return campaign.type === "quantity";
  };
  const isEBTiers = (tiers: any[]): tiers is EBTier[] => {
    return campaign.type === "earlybird";
  };
  const isBogoTier = (tier: any): tier is BogoTier => {
    return campaign.type === "bogo";
  };

  return (
    <>
      {campaign.type === "quantity" && isQuantityTiers(campaign.tiers) && (
        <QuantityTiers
          tiers={campaign.tiers}
          onUpdateTiers={(newTiers) =>
            setCampaign((prev) => ({ ...prev, tiers: newTiers }))
          }
          errors={errors?.tiers as QuantityTierError[]}
        />
      )}

      {campaign.type === "earlybird" && isEBTiers(campaign.tiers) && (
        <EBTiers
          tiers={campaign.tiers}
          onUpdateTiers={(newTiers) =>
            setCampaign((prev) => ({ ...prev, tiers: newTiers }))
          }
          errors={errors?.tiers as EBTierError[]}
        />
      )}

      {campaign.type === "scheduled" && (
        <Section header={__("Discount", "campaignbay")} required>
          <div className="campaignbay-flex campaignbay-gap-2 campaignbay-justify-start campaignbay-items-start">
            <Label>{__("Discount will be applied", "campaignbay")}</Label>
            <div>
              <NumberInput
                error={errors?.discount_value?.message}
                classNames={{
                  root: "campaignbay-min-w-min campaignbay-w-min",
                }}
                value={
                  campaign.discount_value === "" ||
                  campaign.discount_value === null
                    ? undefined
                    : (campaign.discount_value as number)
                }
                onChange={(value) => {
                  setCampaign((prev: CampaignInterface) => ({
                    ...prev,
                    discount_value: value,
                  }));
                }}
              />
            </div>
            <div>
              <Toggler
                classNames={{
                  button: "campaignbay-text-nowrap",
                }}
                options={[
                  {
                    label: __("Percentage %", "campaignbay"),
                    value: "percentage",
                  },
                  {
                    label:
                      (woocommerce_currency_symbol || "$") +
                      " " +
                      __("per Item", "campaignbay"),
                    value: "fixed",
                  },
                ]}
                value={campaign.discount_type}
                onChange={(value) =>
                  setCampaign((prev) => ({
                    ...prev,
                    discount_type: value as DiscountType,
                  }))
                }
              />

              {renderError(errors?.discount_type)}
            </div>
          </div>
        </Section>
      )}

      {/* Bogo */}
      {campaign.type === "bogo" &&
      campaign.tiers &&
      campaign.tiers[0] &&
      isBogoTier(campaign.tiers[0]) ? (
        <Section header={__("BOGO", "campaignbay")} required>
          <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2 campaignbay-flex-wrap">
            <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
              <Label>{__("Buy", "campaignbay")}</Label>
              <NumberInput
                value={
                  (campaign.tiers[0] as BogoTier).buy_quantity === "" ||
                  (campaign.tiers[0] as BogoTier).buy_quantity === null
                    ? undefined
                    : Number((campaign.tiers[0] as BogoTier).buy_quantity)
                }
                // @ts-ignore
                error={errors?.tiers?.[0]?.buy_quantity?.message}
                classNames={{
                  root: "campaignbay-min-w-min campaignbay-w-min",
                }}
                onChange={(value) => {
                  const newTiers = [...campaign.tiers];
                  newTiers[0] = {
                    ...newTiers[0],
                    buy_quantity: value === null ? "" : value,
                  } as BogoTier;
                  setCampaign((prev) => ({
                    ...prev,
                    tiers: newTiers,
                  }));
                }}
              />

              <Label className="campaignbay-text-nowrap">
                {_n(
                  "piece ,",
                  "pieces ,",
                  (campaign.tiers[0] as BogoTier).buy_quantity || 1,
                  "campaignbay",
                )}
              </Label>
            </div>
            <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
              <Label>{__("Get", "campaignbay")}</Label>
              <NumberInput
                // @ts-ignore
                error={errors?.tiers?.[0]?.get_quantity?.message}
                classNames={{
                  root: "campaignbay-min-w-min campaignbay-w-min",
                }}
                value={
                  (campaign.tiers[0] as BogoTier).get_quantity === "" ||
                  (campaign.tiers[0] as BogoTier).get_quantity === null
                    ? undefined
                    : Number((campaign.tiers[0] as BogoTier).get_quantity)
                }
                onChange={(value) => {
                  const newTiers = [...campaign.tiers];
                  newTiers[0] = {
                    ...newTiers[0],
                    get_quantity: value === null ? "" : value,
                  } as BogoTier;
                  setCampaign((prev) => ({
                    ...prev,
                    tiers: newTiers,
                  }));
                }}
              />
              <Label className="campaignbay-text-nowrap">
                {_n(
                  "piece",
                  "pieces",
                  (campaign.tiers[0] as BogoTier).get_quantity || 1,
                  "campaignbay",
                )}
              </Label>
            </div>
          </div>
        </Section>
      ) : null}
    </>
  );
};

export default CampaignTiers;

export const Label = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <label
      className={`campaignbay-text-[13px] campaignbay-leading-[16px] campaignbay-font-[400] campaignbay-text-[#1e1e1e] campaignbay-py-[12px] ${className}`}
    >
      {children}
    </label>
  );
};
