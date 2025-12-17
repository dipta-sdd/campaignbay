import { useParams, useNavigate } from "react-router-dom";
import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";
import { check, Icon, pencil, trash } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { useToast } from "../store/toast/use-toast";
import { FC, useEffect } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { Campaign as CampaignInterface, CampaignErrorsType } from "../types";
import Campaign from "../components/Campaign";
import getBool from "../utils/getBool";

const CampaignsEdit: FC = () => {
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

  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [errors, setErrors] = useState<CampaignErrorsType>({});
  // extra state to handle editing
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

  useState<boolean>(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleSaveCampaign = async () => {
    const campaignData = {
      ...campaign,
      discount_value: Number(campaign.discount_value),
    };

    try {
      setIsSaving(true);
      const response = await apiFetch({
        path: "/campaignbay/v1/campaigns/" + id,
        method: "POST",
        data: campaignData,
      });
      setIsSaving(false);
      addToast(__("Campaign saved successfully", "campaignbay"), "success");
      navigate("/campaigns");
    } catch (error: any) {
      setIsSaving(false);
      if (
        error?.code === "rest_invalid_param" ||
        error?.code === "rest_validation_error"
      ) {
        addToast(__("Validation Error. Try again.", "campaignbay"), "error");
        setErrors(error?.data?.details);
      } else
        addToast(
          __("Something went wrong, Please reload the page.", "campaignbay"),
          "error"
        );
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      setIsDeleting(true);
      const response = await apiFetch({
        path: "/campaignbay/v1/campaigns/" + id,
        method: "DELETE",
      });
      setIsDeleteModalOpen(false);
      addToast(__("Campaign deleted successfully", "campaignbay"), "success");
      navigate("/campaigns");
    } catch (error) {
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchCampaign = async () => {
    try {
      const response: any = await apiFetch({
        path: `/campaignbay/v1/campaigns/${id}?_timestamp=${Date.now()}`,
      });
      setCampaign({
        ...response,
        schedule_enabled: getBool(response.schedule_enabled),
        exclude_sale_items: getBool(response.exclude_sale_items),
        is_exclude: getBool(response.is_exclude),
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="cb-page">
          <Navbar />
          <div className="cb-page-header-container">
            <div className="cb-page-header-title">
              {!isEditingTitle ? (
                <span>{campaign.title}</span>
              ) : (
                <input
                  className="wpab-input"
                  type="text"
                  value={campaign.title}
                  onChange={(e) =>
                    setCampaign((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              )}
              {isEditingTitle ? (
                <Icon
                  icon={check}
                  className="cb-page-header-title-icon"
                  fill="currentColor"
                  onClick={() => setIsEditingTitle(false)}
                />
              ) : (
                <Icon
                  icon={pencil}
                  className="cb-page-header-title-icon"
                  fill="currentColor"
                  onClick={() => setIsEditingTitle(true)}
                />
              )}
            </div>
            <div className="cb-page-header-actions">
              <button
                className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-danger "
                disabled={isDeleting}
                onClick={handleDeleteCampaign}
              >
                <Icon icon={trash} fill="currentColor" />
                {__("Delete Campaign", "campaignbay")}
              </button>
              <button
                className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-gap-1 campaignbay-pt-2 campaignbay-pr-3 campaignbay-pb-2 campaignbay-pl-2 campaignbay-cursor-pointer campaignbay-rounded-sm campaignbay-text-[13px] campaignbay-leading-[18px] campaignbay-font-medium campaignbay-border-0 wpab-cb-btn wpab-cb-btn-primary "
                disabled={isSaving}
                onClick={handleSaveCampaign}
              >
                <Icon icon={check} fill="currentColor" />
                {__("Update Campaign", "campaignbay")}
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
                {__("Update Campaign", "campaignbay")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteCampaign}
        onCancel={() => setIsDeleteModalOpen(false)}
      >
        {__("Are you sure you want to delete this campaign?", "campaignbay")}
      </ConfirmDialog>
    </>
  );
};

export default CampaignsEdit;

interface ErrorObject {
  message: string;
}

interface RenderErrorProps {
  error?: ErrorObject;
  negativeMargin?: boolean;
}
export const renderError = (
  error?: ErrorObject,
  negativeMargin = true
): React.ReactNode => {
  if (!error) {
    return null;
  }

  const marginClass = negativeMargin
    ? "campaignbay--mt-2"
    : "campaignbay-mt-[1px]";
  const className = `campaignbay-text-red-600 ${marginClass} campaignbay-text-xs`;

  return <p className={className}>{error.message}</p>;
};
