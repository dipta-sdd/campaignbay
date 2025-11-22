import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { check, Icon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { useToast } from "../store/toast/use-toast";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Campaign as CampaignInterface, CampaignErrorsType } from "../types";
import Campaign from "../components/Campaign";
import { useGuide, useGuideStep } from "../store/GuideContext";
import { TOUR_STEPS } from "../utils/tourSteps";

const CampaignsAdd: FC = () => {
  const [campaign, setCampaign] = useState<CampaignInterface>({
    id: 0,
    title: "",
    status: "active",
    type: "bogo",
    discount_type: "percentage",
    discount_value: "",
    target_type: "entire_store",
    target_ids: [],
    is_exclude: false,
    exclude_sale_items: false,
    usage_limit: null,
    schedule_enabled: false,
    start_datetime: "",
    end_datetime: "",
    tiers: [
      {
        id: 0,
        buy_quantity: 1,
        get_quantity: 1,
      },
    ],
    settings: {},
    conditions: [],
  });
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [errors, setErrors] = useState<CampaignErrorsType>({});

  const handleSaveCampaign = async () => {
    setTourStep(0);
    const campaignData = {
      ...campaign,
      discount_value: Number(campaign.discount_value) || 0,
    };
    try {
      const response = await apiFetch({
        path: "/campaignbay/v1/campaigns",
        method: "POST",
        data: campaignData,
      });
      addToast(__("Campaign saved successfully", "campaignbay"), "success");
      navigate(`/campaigns`);
    } catch (error: any) {
      if (
        error?.code === "rest_invalid_param" ||
        error?.code === "rest_validation_error"
      ) {
        addToast(__("Validation Error. Try again.", "campaignbay"), "error");
        setErrors(error?.data?.details || {});
      } else
        addToast(
          __("Something went wrong, Please reload the page.", "campaignbay"),
          "error"
        );
    }
  };

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================
  const saveBtnRef = useGuideStep<HTMLButtonElement>(TOUR_STEPS.SAVE_BTN);
  const { tourStep, setConfig, setTourStep } = useGuide();
  const TYPE_TO_STEP_MAP: Record<string, number> = {
    bogo: TOUR_STEPS.BOGO_BUY,
    quantity: TOUR_STEPS.QTY_RANGE,
    scheduled: TOUR_STEPS.SCHED_TYPE,
    earlybird: TOUR_STEPS.EB_QUANTITY,
  };

  useEffect(() => {
    if (!tourStep) return;
    const nextStepId = TYPE_TO_STEP_MAP[campaign.type] || TOUR_STEPS.BOGO_BUY;

    if (campaign.target_type === "entire_store") {
      setConfig((prevConfig) => ({
        ...prevConfig,
        [TOUR_STEPS.TARGET_TYPE]: {
          ...prevConfig[TOUR_STEPS.TARGET_TYPE],
          onNext: ({ setStep }) => {
            setStep(nextStepId);
          },
        }
      }));
    } else {
      setConfig((prevConfig) => ({
        ...prevConfig,
        [TOUR_STEPS.TARGET_TYPE]: {
          ...prevConfig[TOUR_STEPS.TARGET_TYPE],
          onNext: ({ setStep }) => {
            setStep(TOUR_STEPS.TARGET_IDS);
          },
        },
        [TOUR_STEPS.TARGET_IDS]: {
          ...prevConfig[TOUR_STEPS.TARGET_IDS],
          onNext: ({ setStep }) => {
            setStep(nextStepId);
          },
        },
      }));
    }
  }, [campaign.target_type, campaign.type, setConfig]);

  useEffect(() => {
    if (!tourStep) return;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [TOUR_STEPS.SCHED_TOGGLE]: {
        ...prevConfig[TOUR_STEPS.SCHED_TOGGLE],
        onNext: ({ setStep }) => {
          setStep(campaign.schedule_enabled ? TOUR_STEPS.START_TIME : TOUR_STEPS.SAVE_BTN);
        },
      }
    }));

  }, [campaign.schedule_enabled, setConfig]);


  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================

  return (
    <div className="cb-page">
      <Navbar />
      <div className="cb-page-header-container">
        <div className="cb-page-header-title">
          {__("Add Campaign", "campaignbay")}
        </div>
        <div className="cb-page-header-actions">
          <button
            className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-primary "
            onClick={handleSaveCampaign}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Campaign", "campaignbay")}
          </button>
        </div>
      </div>
      <div className="cb-page-container">
        <Campaign
          campaign={campaign}
          setCampaign={setCampaign}
          errors={errors}
        />
        {/* buttons */}
        <div className="wpab-btn-bottom-con">
          <button
            ref={saveBtnRef}
            className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-primary"
            onClick={handleSaveCampaign}
          >
            <Icon icon={check} fill="currentColor" />
            {__("Save Changes", "campaignbay")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignsAdd;
