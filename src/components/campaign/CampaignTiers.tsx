import { useState } from "@wordpress/element";
import { __, _n } from "@wordpress/i18n";
import { FC, useEffect } from "react";
import {
  BogoTier,
  Campaign as CampaignInerface,
  CampaignErrorsType,
  DiscountType,
  EBTier,
  EBTierError,
  QuantityTier,
  QuantityTierError,
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

interface CampaignTiersProps {
  campaign: CampaignInerface;
  setCampaign: React.Dispatch<React.SetStateAction<CampaignInerface>>;
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
  const [quantityTiers, setQuantityTiers] = useState<QuantityTier[]>([
    {
      id: 0,
      min: 1,
      max: "",
      value: "",
      type: "percentage",
    },
  ]);
  const [ebTiers, setEBTiers] = useState<EBTier[]>([
    {
      id: 0,
      quantity: "",
      value: "",
      type: "percentage",
      total: 0,
    },
  ]);
  const [bogoTiers, setBogoTiers] = useState<BogoTier>({
    id: 0,
    buy_quantity: 1,
    get_quantity: 1,
  });

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================
  const bogoBuyInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.BOGO_BUY);
  const bogoGetInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.BOGO_GET);
  const schedValueInputRef = useGuideStep<HTMLInputElement>(
    TOUR_STEPS.SCHED_VALUE,
  );
  const schedTypeInputRef = useGuideStep<HTMLInputElement>(
    TOUR_STEPS.SCHED_TYPE,
  );
  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================

  useEffect(() => {
    if (campaign.type === "quantity" && campaign?.tiers?.length > 0)
      setQuantityTiers([...(campaign.tiers as QuantityTier[])]);
    else if (campaign.type === "earlybird" && campaign?.tiers?.length > 0)
      setEBTiers([...(campaign.tiers as EBTier[])]);
    else if (campaign.type === "bogo" && campaign?.tiers?.length > 0)
      setBogoTiers({ ...(campaign.tiers[0] as BogoTier) });
  }, []);

  useEffect(() => {
    if (campaign.type === "quantity")
      setCampaign((prev) => ({ ...prev, tiers: [...quantityTiers] }));
    else if (campaign.type === "earlybird")
      setCampaign((prev) => ({ ...prev, tiers: [...ebTiers] }));
    else if (campaign.type === "bogo")
      setCampaign((prev) => ({ ...prev, tiers: [{ ...bogoTiers }] }));
    else setCampaign((prev) => ({ ...prev, tiers: [] }));
  }, [quantityTiers, ebTiers, bogoTiers]);

  return (
    <>
      {campaign.type === "quantity" && (
        <QuantityTiers
          tiers={quantityTiers}
          setTiers={setQuantityTiers}
          errors={errors?.tiers as QuantityTierError[]}
        />
      )}

      {campaign.type === "earlybird" && (
        <EBTiers
          tiers={ebTiers}
          setTiers={setEBTiers}
          errors={errors?.tiers as EBTierError[]}
        />
      )}

      {campaign.type === "scheduled" && (
        <Section header={__("Discount", "campaignbay")}>
          <div className="campaignbay-flex campaignbay-gap-2 campaignbay-justify-start campaignbay-items-start">
            <Label>{__("Discount will be applied", "campaignbay")}</Label>
            <div>
              <NumberInput
                value={
                  campaign.discount_value === "" ||
                  campaign.discount_value === null
                    ? undefined
                    : (campaign.discount_value as number)
                }
                onChange={(value) => {
                  setCampaign((prev: CampaignInerface) => ({
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
      {campaign.type === "bogo" || campaign.type === null ? (
        <Section header={__("BOGO", "campaignbay")}>
            <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2 campaignbay-flex-wrap">
              <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
                <Label>{__("Buy", "campaignbay")}</Label>
                <NumberInput
                  value={
                    bogoTiers.buy_quantity === ""
                      ? undefined
                      : bogoTiers.buy_quantity
                  }
                  classNames={{
                    root: "campaignbay-w-min",
                  }}
                  onChange={(value) =>
                    setBogoTiers((prev) => ({
                      ...prev,
                      buy_quantity: value === null ? "" : value,
                    }))
                  }
                />

                <Label className="campaignbay-text-nowrap">
                  {_n(
                    "piece ,",
                    "pieces ,",
                    bogoTiers.buy_quantity || 1,
                    "campaignbay",
                  )}
                </Label>
              </div>
              <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
                <Label>{__("Get", "campaignbay")}</Label>
                <NumberInput
                classNames={{
                  root: "campaignbay-w-min",
                }}
                  value={
                    bogoTiers.get_quantity === ""
                      ? undefined
                      : bogoTiers.get_quantity
                  }
                  onChange={(value) =>
                    setBogoTiers((prev) => ({
                      ...prev,
                      get_quantity: value === null ? "" : value,
                    }))
                  }
                />
                <Label className="campaignbay-text-nowrap">
                  {_n(
                    "piece",
                    "pieces",
                    bogoTiers.get_quantity || 1,
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

export const Label = ({ children , className}: { children: React.ReactNode , className?: string}) => {
  return (
    <label className={`campaignbay-text-[13px] campaignbay-leading-[16px] campaignbay-font-[400] campaignbay-text-[#1e1e1e] campaignbay-py-[12px] ${className}`}>
      {children}
    </label>
  );
};
