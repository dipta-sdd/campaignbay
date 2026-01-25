import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { useToast } from "../../store/toast/use-toast";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BogoTier,
  CampaignErrorsType,
  Campaign as CampaignInterfaceBase,
  CampaignSettingsType,
  CampaignType,
  QuantityTier,
  TargetType,
} from "../../utils/types";
import { currentDateTime } from "../../utils/Dates";
import {
  Card,
  DependentResponseType,
  DependentType,
  DISCOUNT_TYPES,
  OtherSettings,
  Section,
} from "../../components/campaign/Campaign";
import CustomModal from "../common/CustomModal";
import Header from "../common/Header";
import { Stepper } from "../common/Stepper";
import Button from "../common/Button";
import { Input } from "../common/Input";
import { CardRadioGroup } from "../common/CardRadioGroup";
import Select, { SelectOption } from "../common/Select";
import MultiSelect from "../common/MultiSelect";
import { Checkbox } from "../common/Checkbox";
import CampaignTiers from "../campaign/CampaignTiers";
import Conditions from "../conditions/Conditions";
import { ConditionsInterface } from "../conditions/type";
import { scheduled } from "@wordpress/icons";
import { Tier } from "../../old/types";
import { getSettings } from "../../utils/settings";
import { ConfirmationModal } from "../common/ConfirmationModal";
// @ts-ignore
interface CampaignInterface extends CampaignInterfaceBase {
  type: CampaignType | null;
  tiers: Tier[] | null;
}

const FirstCampaign: FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [campaign, setCampaign] = useState<CampaignInterface>({
    id: 0,
    title: "",
    status: "active",
    type: null,
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
    tiers: null,
    settings: {},
    conditions: {
      match_type: "all",
      rules: [],
    },
  });
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [errors, setErrors] = useState<CampaignErrorsType>({});
  const currentDate = currentDateTime();
  const [currentStep, setCurrentStep] = useState(1);
  const [enableUsageLimit, setEnableUsageLimit] = useState(false);
  const [settings, setSettings] = useState<CampaignSettingsType>({});

  useEffect(() => {
    fetchDependency();
    updateOnboardingStatus();
  }, []);
  useEffect(() => {
    setCampaign((prev) => ({
      ...prev,
      settings: { ...getSettings(campaign?.type || "scheduled", settings) },
    }));
  }, [campaign.type, settings]);

  const fetchDependency = async () => {
    try {
      const response: DependentResponseType = await apiFetch({
        path: "/campaignbay/v1/campaigns/dependents?_timestamp=" + Date.now(),
        method: "GET",
      });
      setProducts(
        response.products.map((item: DependentType) => ({
          label: item.name,
          value: item.id,
        })) || [],
      );
      setCategories(
        response?.categories?.map((item: DependentType) => ({
          label: item.name,
          value: item.id,
        })),
      );
    } catch (error: any) {
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error",
      );
    }
  };

  const handleSaveCampaign = async () => {
    setIsSaving(true);
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
      setIsSaving(false);
      setCurrentStep(5);
      // navigate(`/campaigns`);
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
          "error",
        );
    }
    setIsSaving(false);
  };

  const handleTypeChange = (type: CampaignType) => {
    if (type === "bogo") {
      setCampaign((prev) => ({
        ...prev,
        type,
        tiers: [
          {
            id: 0,
            buy_quantity: "",
            get_quantity: "",
          },
        ],
      }));
    } else if (type === "quantity") {
      setCampaign((prev) => ({
        ...prev,
        type,
        tiers: [
          {
            id: 0,
            min: 1,
            max: "",
            value: "",
            type: "percentage",
          },
        ],
      }));
    } else if (type === "earlybird") {
      setCampaign((prev) => ({
        ...prev,
        type,
        tiers: [
          {
            id: 0,
            quantity: "",
            value: "",
            type: "percentage",
            total: 0,
          },
        ],
      }));
    } else {
      setCampaign((prev) => ({
        ...prev,
        type,
        tiers: null,
      }));
    }
  };
  const isEnableNext = (): boolean => {
    if (currentStep === 1) {
      return !!campaign.title;
    }
    if (currentStep === 2) {
      return !!campaign.type;
    }
    if (currentStep === 3) {
      if (campaign.type === "scheduled") {
        return !!campaign.discount_value;
      } else if (campaign.type === "bogo") {
        const tier = campaign.tiers?.[0] as BogoTier;
        return !!(tier?.buy_quantity && tier?.get_quantity);
      } else if (campaign.type === "quantity") {
        const tiers = campaign.tiers as QuantityTier[];
        const lastTier = tiers?.[tiers?.length - 1];
        if (!lastTier) return false;
        return !!(
          lastTier.min &&
          lastTier.max &&
          Number(lastTier.max) > Number(lastTier.min) &&
          lastTier.value
        );
      } else if (campaign.type === "earlybird") {
        // @ts-ignore
        const tier = campaign.tiers?.[0];
        // @ts-ignore
        return !!(tier?.quantity && tier?.value);
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (
        campaign.title === "" ||
        campaign.title === undefined ||
        campaign.title === null
      ) {
        setErrors({
          title: { message: "Campaign Name is required" },
        });
        return;
      }
      setCurrentStep(2);
      return;
    } else if (currentStep === 2) {
      if (campaign.type === undefined || campaign.type === null) {
        setErrors({
          type: { message: "Discount Type is required" },
        });
        return;
      }
      setCurrentStep(3);
      return;
    } else if (currentStep === 3) {
      if (campaign.type === "scheduled") {
        if (
          campaign.discount_value === "" ||
          campaign.discount_value === undefined ||
          campaign.discount_value === null ||
          campaign.discount_value === 0
        ) {
          setErrors({
            discount_value: { message: "Discount Value is required" },
          });
          return;
        }
      } else if (campaign.type === "bogo") {
        const tier = campaign.tiers?.[0] as BogoTier;
        if (
          tier?.buy_quantity === "" ||
          tier?.buy_quantity === undefined ||
          tier?.buy_quantity === null ||
          tier?.buy_quantity === 0
        ) {
          setErrors({
            tiers: [{ buy_quantity: { message: "Buy Quantity is required" } }],
          });
          return;
        }
        if (
          tier?.get_quantity === "" ||
          tier?.get_quantity === undefined ||
          tier?.get_quantity === null ||
          tier?.get_quantity === 0
        ) {
          setErrors({
            tiers: [{ get_quantity: { message: "Get Quantity is required" } }],
          });
          return;
        }
      } else if (campaign.type === "quantity") {
        const tiers = campaign.tiers as QuantityTier[];
        const lastTier = tiers[tiers.length - 1];
        if (
          lastTier?.min === undefined ||
          lastTier?.min === null ||
          lastTier?.min === 0
        ) {
          setErrors({
            tiers: [{ min: { message: "Min Quantity is required" } }],
          });
          return;
        } else if (
          lastTier?.max === undefined ||
          lastTier?.max === null ||
          lastTier?.max === 0
        ) {
          setErrors({
            tiers: [{ max: { message: "Max Quantity is required" } }],
          });
          return;
        } else if (Number(lastTier?.max) <= Number(lastTier?.min)) {
          setErrors({
            tiers: [
              {
                max: {
                  message: "Max Quantity must be greater than Min Quantity",
                },
              },
            ],
          });
          return;
        } else if (
          lastTier.value === "" ||
          lastTier.value === undefined ||
          lastTier.value === null ||
          lastTier.value === 0
        ) {
          setErrors({
            tiers: [{ value: { message: "Value is required" } }],
          });
          return;
        }
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      handleSaveCampaign();
    }
  };
  const handleBack = () => {
    if (currentStep === 1) {
      setShowConfirmation(true);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateOnboardingStatus = async () => {
    try {
      const response = await apiFetch({
        path: "/campaignbay/v1/settings/onboarding",
        method: "POST",
        data: {
          first_campaign: true,
        },
      });
      // addToast(__("Tour dismissed successfully.", "campaignbay"), "success");
    } catch (error) {
      console.error("Failed to dismiss tour:", error);
      addToast(
        __("Error connecting server, Please try again.", "campaignbay"),
        "error",
      );
    }
  };
  return (
    <>
      <CustomModal
        maxWidth="campaignbay-max-w-[min(960px,90vw)]"
        title="Campaign"
        classNames={{
          body: "campaignbay-bg-[#f1f5f9] campaignbay-p-6 campaignbay-rounded-[8px]",
        }}
        showHeader={false}
        isOpen={isOpen}
        onClose={() => {}}
      >
        {currentStep !== 5 ? (
          <>
            <Header className="campaignbay-text-center">
              Create Your First Campaign
            </Header>
            <div>
              <Stepper
                steps={[
                  "Discount Name",
                  "Discount Type",
                  "Set Discount",
                  "Discount Configuration",
                ]}
                currentStep={currentStep}
                setStep={setCurrentStep}
              />
            </div>
            <div className="campaignbay-bg-white campaignbay-rounded-[8px] campaignbay-flex campaignbay-justify-between campaignbay-flex-col campaignbay-items-center campaignbay-p-[32px] campaignbay-pt-[48px]">
              {currentStep === 1 ? (
                <div className="campaignbay-flex campaignbay-flex-col campaignbay-items-start campaignbay-gap-[12px] campaignbay-w-full">
                  <h2 className="campaignbay-text-[#1e1e1e] campaignbay-text-[18px] campaignbay-leading-[28px] campaignbay-font-bold campaignbay-text-nowrap">
                    Campaign Name
                  </h2>
                  <Input
                    classNames={{
                      input:
                        "campaignbay-text-[16px] campaignbay-leading-[24px] !campaignbay-py-[10px]",
                    }}
                    size="large"
                    placeholder="Enter your campaign name (e.g., summer sale!"
                    value={campaign.title}
                    onChange={(e) =>
                      setCampaign({ ...campaign, title: e.target.value })
                    }
                    className="campaignbay-w-full"
                    error={errors.title?.message}
                  />
                </div>
              ) : null}
              {currentStep === 2 ? (
                <Card
                  className="!campaignbay-shadow-none !campaignbay-p-0"
                  header={
                    <h2 className="campaignbay-text-[15px] campaignbay-leading-[24px] campaignbay-text-[#1e1e1e] campaignbay-font-semibold campaignbay-pb-[15px]">
                      Select Discount Type{" "}
                      <span className="campaignbay-text-red-500">*</span>
                    </h2>
                  }
                >
                  <CardRadioGroup
                    classNames={{
                      root: "campaignbay-w-full",
                    }}
                    layout="responsive"
                    options={DISCOUNT_TYPES}
                    // @ts-ignore
                    value={campaign?.type}
                    onChange={(value) =>
                      handleTypeChange(value as CampaignType)
                    }
                  />
                  {errors.type && (
                    <p className="campaignbay-text-red-500 campaignbay-text-[12px] campaignbay-mt-[8px]">
                      {errors.type?.message}
                    </p>
                  )}
                </Card>
              ) : null}
              {currentStep === 3 ? (
                <Card
                  disabled={campaign.type === null}
                  className="!campaignbay-shadow-none !campaignbay-p-0"
                  header={
                    <h2 className="campaignbay-text-[20px] campaignbay-leading-[20px] campaignbay-text-[#1e1e1e] campaignbay-font-semibold campaignbay-pb-[24px] campaignbay-border-b campaignbay-border-[#dddddd] campaignbay-w-full">
                      Discount
                      <span className="campaignbay-text-red-500 campaignbay-ml-[5px]">
                        *
                      </span>
                    </h2>
                  }
                >
                  <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-[30px] campaignbay-pt-[30px] ">
                    <Section header="Target" required>
                      <Select
                        id="selection-type"
                        // con_ref={targetTypeInputRef}
                        options={[
                          {
                            label: __("Entire Store", "campaignbay"),
                            value: "entire_store",
                          },
                          {
                            label: __("By Product Category", "campaignbay"),
                            value: "category",
                          },
                          {
                            label: __("By Product", "campaignbay"),
                            value: "product",
                          },
                        ]}
                        value={campaign.target_type}
                        onChange={(value) =>
                          setCampaign((prev) => ({
                            ...prev,
                            target_type: value as TargetType,
                          }))
                        }
                      />
                      {/* {renderError(errors?.target_type)} */}

                      {campaign.target_type !== "entire_store" ? (
                        <>
                          <div
                            style={{ background: "#ffffff" }}
                            className={`${
                              errors?.target_ids ? "wpab-input-error" : ""
                            }`}
                          >
                            <MultiSelect
                              // ref={targetIdsInputRef}
                              label={
                                campaign.target_type === "product"
                                  ? __("Select Products *", "campaignbay")
                                  : campaign.target_type === "category"
                                  ? __("Select Categories *", "campaignbay")
                                  : ""
                              }
                              options={
                                campaign.target_type === "product"
                                  ? products
                                  : campaign.target_type === "category"
                                  ? categories
                                  : []
                              }
                              value={campaign.target_ids}
                              onChange={(value: (string | number)[]) =>
                                setCampaign((prev) => ({
                                  ...prev,
                                  target_ids: [...(value as number[])],
                                }))
                              }
                            />
                            {/* {renderError(errors?.target_ids, false)} */}
                          </div>
                          <Checkbox
                            label={__("Exclude Items", "campaignbay")}
                            checked={!!campaign.is_exclude}
                            onChange={(checked) =>
                              setCampaign((prev) => ({
                                ...prev,
                                is_exclude: checked,
                              }))
                            }
                          />
                        </>
                      ) : null}
                    </Section>
                    {campaign?.type !== null &&
                    campaign.tiers &&
                    campaign?.tiers?.length > 0 ? (
                      <CampaignTiers
                        // @ts-ignore
                        campaign={campaign as CampaignInterface}
                        // @ts-ignore
                        setCampaign={setCampaign}
                        errors={errors}
                        products={products}
                      />
                    ) : null}
                    <Section header="Conditions">
                      <Conditions
                        type={campaign?.type || "bogo"}
                        errors={errors}
                        conditions={campaign.conditions}
                        setConditions={(conditions: ConditionsInterface) =>
                          setCampaign((prev) => ({ ...prev, conditions }))
                        }
                      />
                    </Section>
                  </div>
                </Card>
              ) : null}
              {currentStep === 4 ? (
                <Card
                  disabled={campaign.type === null}
                  className="!campaignbay-shadow-none !campaignbay-p-0 campaignbay-w-full"
                  header={
                    <h2 className="campaignbay-text-[20px] campaignbay-leading-[20px] campaignbay-text-[#1e1e1e] campaignbay-font-semibold campaignbay-pb-[24px] campaignbay-border-b campaignbay-border-[#dddddd] campaignbay-w-full">
                      Configurations
                    </h2>
                  }
                >
                  <div className="campaignbay-grid campaignbay-grid-cols-2 campaignbay-gap-[15px] campaignbay-pt-[15px] ">
                    <OtherSettings
                      // @ts-ignore
                      campaign={campaign}
                      // @ts-ignore
                      setCampaign={setCampaign}
                      settings={settings}
                      setSettings={setSettings}
                      errors={errors}
                      enableUsageLimit={enableUsageLimit}
                      setEnableUsageLimit={setEnableUsageLimit}
                    />
                  </div>
                </Card>
              ) : null}
              <div className="campaignbay-flex campaignbay-justify-between campaignbay-items-center campaignbay-w-full campaignbay-mt-[32px]">
                <Button
                  color="secondary"
                  onClick={handleBack}
                  variant="ghost"
                  disabled={isSaving}
                  className="!campaignbay-px-0 campaignbay-text-[#4b5563] campaignbay-text-[16px] campaignbay-leading-[24px] campaignbay-font-bold campaignbay-text-nowrap campaignbay-w-max"
                >
                  <svg
                    width="14"
                    height="16"
                    viewBox="0 0 14 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.293945 7.29377C-0.0966797 7.6844 -0.0966797 8.31877 0.293945 8.7094L5.29395 13.7094C5.68457 14.1 6.31895 14.1 6.70957 13.7094C7.1002 13.3188 7.1002 12.6844 6.70957 12.2938L3.4127 9.00002H13.0002C13.5533 9.00002 14.0002 8.55315 14.0002 8.00002C14.0002 7.4469 13.5533 7.00002 13.0002 7.00002H3.41582L6.70645 3.70627C7.09707 3.31565 7.09707 2.68127 6.70645 2.29065C6.31582 1.90002 5.68145 1.90002 5.29082 2.29065L0.29082 7.29065L0.293945 7.29377Z"
                      fill="#4B5563"
                    />
                  </svg>

                  {currentStep !== 1 ? "Back" : "Back to All Campaign"}
                </Button>
                <Button
                  size="large"
                  onClick={handleNextStep}
                  color="primary"
                  disabled={!isEnableNext() || isSaving}
                  className=" campaignbay-text-[16px] campaignbay-leading-[24px] campaignbay-font-bold campaignbay-text-nowrap campaignbay-w-max"
                >
                  Next Step
                  <svg
                    width="22"
                    height="16"
                    viewBox="0 0 22 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21.7063 8.70627C22.0969 8.31565 22.0969 7.68127 21.7063 7.29065L16.7063 2.29065C16.3156 1.90002 15.6813 1.90002 15.2906 2.29065C14.9 2.68127 14.9 3.31565 15.2906 3.70627L18.5875 7.00002H9C8.44687 7.00002 8 7.4469 8 8.00002C8 8.55315 8.44687 9.00002 9 9.00002H18.5844L15.2937 12.2938C14.9031 12.6844 14.9031 13.3188 15.2937 13.7094C15.6844 14.1 16.3188 14.1 16.7094 13.7094L21.7094 8.7094L21.7063 8.70627Z"
                      fill="white"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </>
        ) : (
          // show congets first campaign created
          <div></div>
        )}

        <ConfirmationModal
          isOpen={showConfirmation}
          onConfirm={() => {
            setShowConfirmation(false);
            setIsOpen(false);
            navigate("/campaigns");
          }}
          onCancel={() => setShowConfirmation(false)}
          title="Are you sure you want to go back ?"
          message="You will lose all the data you have entered."
          cancelLabel="No"
          confirmLabel="Yes"
        />
      </CustomModal>
    </>
  );
};

export default FirstCampaign;
