import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { check, Icon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { useToast } from "../store/toast/use-toast";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Campaign as CampaignInterface, CampaignErrorsType } from "../types";
import Campaign from "../components/Campaign";

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
