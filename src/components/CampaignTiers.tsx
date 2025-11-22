import { useState } from "@wordpress/element";
import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { FC, useEffect } from "react";
import Required from "./Required";
import QuantityTiers from "./QuantityTiers";
import EBTiers from "./EBTiers";
import { useCbStore } from "../store/cbStore";
import {
  BogoTier,
  Campaign as CampaignInerface,
  CampaignErrorsType,
  DiscountType,
  EBTier,
  EBTierError,
  QuantityTier,
  QuantityTierError,
  SelectOptionType,
} from "../types";
import { renderError } from "../pages/CampaignsEdit";
import { useGuideStep } from "../store/GuideContext";
import { TOUR_STEPS } from "../utils/tourSteps";

interface CampaignTiersProps {
  campaign: CampaignInerface;
  setCampaign: React.Dispatch<React.SetStateAction<CampaignInerface>>;
  errors: CampaignErrorsType;
  products: SelectOptionType[];
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
  const schedValueInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.SCHED_VALUE);
  const schedTypeInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.SCHED_TYPE);
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
          // @ts-ignore
          className={`${errors?.tiers ? "wpab-input-error" : ""}`}
          tiers={quantityTiers}
          setTiers={setQuantityTiers}
          errors={errors?.tiers as QuantityTierError[]}
        />
      )}

      {campaign.type === "earlybird" && (
        <EBTiers
          // @ts-ignore
          className={`${errors?.tiers ? "wpab-input-error" : ""}`}
          tiers={ebTiers}
          setTiers={setEBTiers}
          errors={errors?.tiers as EBTierError[]}
        />
      )}


      {campaign.type === "scheduled" && (
        <div className="cb-form-input-con">
          <label htmlFor="discount-type">
            {__("How much you want to discount?", "campaignbay")} <Required />
          </label>
          {/* @ts-ignore */}
          <ToggleGroupControl
            ref={schedTypeInputRef}
            className={`cb-toggle-group-control ${errors?.discount_type ? "wpab-input-error" : ""
              }`}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            isBlock
            value={campaign.discount_type}
            onChange={(value) =>
              setCampaign((prev) => ({
                ...prev,
                discount_type: value as DiscountType,
              }))
            }
          >
            <ToggleGroupControlOption
              label={__("Percentage %", "campaignbay")}
              value="percentage"
            />
            <ToggleGroupControlOption
              label={
                __("Currency ", "campaignbay") +
                (woocommerce_currency_symbol || "$")
              }
              value="fixed"
            />
          </ToggleGroupControl>
          {campaign.discount_type === "fixed" && (
            <span className="wpab-input-help">
              {__("It will be applied per item , not in total ", "campaignbay")}
            </span>
          )}

          {renderError(errors?.discount_type)}

          <div className="cb-input-with-suffix">
            <input
              ref={schedValueInputRef}
              value={campaign.discount_value ? campaign.discount_value : ""}
              type="text"
              name="discount-value"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`wpab-input w-100 ${errors?.discount_value ? "wpab-input-error" : ""
                }`}
              placeholder="Enter Value"
              onChange={(e) =>
                setCampaign((prev) => ({
                  ...prev,
                  discount_value: parseInt(e.target.value),
                }))
              }
            />
            <span className="cb-suffix">
              {campaign.discount_type === "percentage"
                ? "%"
                : woocommerce_currency_symbol || "$"}
            </span>
          </div>
          {renderError(errors?.discount_value)}
        </div>
      )}

      {/* Bogo */}
      {campaign.type === "bogo" ? (
        <>
          <div className="cb-form-input-con">
            <label htmlFor="discount-type">
              {__("DEFINE QUANTITY TIERS", "campaignbay")} <Required />
            </label>

            <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2 campaignbay-overflow-hidden campaignbay-flex-wrap">
              <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
                <label
                  htmlFor="bogo-buy-amount"
                  className="!campaignbay-leading-[36px]"
                >
                  {__("Buy Amount", "campaignbay")}
                </label>
                <span>
                  <input
                    ref={bogoBuyInputRef}
                    type="number"
                    id="bogo-buy-amount"
                    className={`wpab-input  ${
                      // @ts-ignore
                      errors?.tiers?.[0]?.buy_quantity ? "wpab-input-error" : ""
                      }`}
                    value={bogoTiers.buy_quantity ? bogoTiers.buy_quantity : ""}
                    onChange={(e) =>
                      setBogoTiers((prev) => ({
                        ...prev,
                        buy_quantity: parseInt(e.target.value) || "",
                      }))
                    }
                  />
                  {/* @ts-ignore  */}
                  {renderError(errors?.tiers?.[0]?.buy_quantity, false)}
                </span>
                <span className="!campaignbay-leading-[36px]"> , </span>
              </div>
              <div className="campaignbay-flex campaignbay-items-start  campaignbay-gap-[10px]">
                <label
                  htmlFor="bogo-get-quantity"
                  className="!campaignbay-leading-[36px]"
                >
                  {__("Get Quantity", "campaignbay")}
                </label>
                <span>
                  <input
                    type="number"
                    ref={bogoGetInputRef}
                    id="bogo-get-quantity"
                    className={`wpab-input  ${
                      // @ts-ignore
                      errors?.tiers?.[0]?.get_quantity ? "wpab-input-error" : ""
                      }`}
                    value={bogoTiers.get_quantity ? bogoTiers.get_quantity : ""}
                    onChange={(e) =>
                      setBogoTiers((prev) => ({
                        ...prev,
                        get_quantity: parseInt(e.target.value) || "",
                      }))
                    }
                  />
                  {/* @ts-ignore  */}
                  {renderError(errors?.tiers?.[0]?.get_quantity, false)}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default CampaignTiers;
