import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  CampaignErrorsType,
  Campaign as CampaignInerfaceBase,
  CampaignSettingsType,
  CampaignType,
  TargetType,
} from "../../utils/types";
import { CardOption, CardRadioGroup } from "../common/CardRadioGroup";
import { Checkbox } from "../common/Checkbox";
import { useGuide, useGuideStep } from "../../store/GuideContext";
import { TOUR_STEPS } from "../../utils/tourSteps";
import Select, { SelectOption } from "../common/Select";
import apiFetch from "@wordpress/api-fetch";
import { useCbStore } from "../../store/cbStore";
import { useToast } from "../../store/toast/use-toast";
import { getSettings } from "../../utils/settings";
import { __ } from "@wordpress/i18n";
import MultiSelect from "../common/MultiSelect";
import Conditions from "../conditions/Conditions";
import { ConditionsInterface } from "../conditions/type";
import CampaignTiers from "./CampaignTiers";
import { NumberInput } from "../common/NumberInput";
import CustomDateTimePicker from "./CustomDateTimePicker";
import CampaignSettings from "./CampaignSettings";
import Button from "../common/Button";
import { check, handle, Icon } from "@wordpress/icons";
import { Switch } from "../common/Switch";
import HeaderContainer from "../common/HeaderContainer";
import { EditableText } from "../common/EditableText";
// @ts-ignore
interface CampaignInterface extends CampaignInerfaceBase {
  type: CampaignType | null;
}

export const DISCOUNT_TYPES: CardOption[] = [
  {
    value: "bogo",
    title: "Buy X Get X Discount",
    description: "Offer free items when customers buy a specific quantity",
  },
  {
    value: "earlybird",
    title: "EarlyBird Discount",
    description:
      "Offer exclusive discounts for the first X orders of a product",
  },
  {
    value: "quantity",
    title: "Quantity Based Discount",
    description:
      "Encourage bulk purchases with tiered discounts based on quantity",
  },
  {
    value: "scheduled",
    title: "Scheduled Discount",
    description: "Set up time-limited discounts that run during specific dates",
  },
];

export interface DependentType {
  id: number;
  name: string;
}

export interface TargetOptionType {
  label: string;
  value: number;
}

export interface DependentResponseType {
  products: DependentType[];
  categories: DependentType[];
}

interface CampaignProps {
  campaign: CampaignInterface;
  setCampaign: React.Dispatch<React.SetStateAction<CampaignInterface>>;
  errors: CampaignErrorsType;
  handleSave: () => void;
  buttonText: string;
  isSaving: boolean;
  isLoading: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}
const Campaign: FC<CampaignProps> = ({
  campaign,
  setCampaign,
  errors,
  handleSave,
  buttonText,
  isSaving,
  isLoading,
  showDeleteButton = false,
  onDelete,
}) => {
  const [enableUsageLimit, setEnableUsageLimit] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [settings, setSettings] = useState<CampaignSettingsType>({});
  const { addToast } = useToast();

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================
  const { tourStep, setConfig } = useGuide();
  const campaignTitleInputRef = useGuideStep<HTMLInputElement>(
    TOUR_STEPS.TITLE,
  );
  const campaignTypeInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.TYPE);
  const campaignStatusInputRef = useGuideStep<HTMLDivElement>(
    TOUR_STEPS.STATUS,
  );
  const targetTypeInputRef = useGuideStep<HTMLDivElement>(
    TOUR_STEPS.TARGET_TYPE,
  );
  const targetIdsInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.TARGET_IDS);
  const usageToggleRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.USAGE_TOGGLE);
  const usageInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.USAGE_INPUT);
  const scheduleToggleRef = useGuideStep<HTMLDivElement>(
    TOUR_STEPS.SCHED_TOGGLE,
  );
  const startTimeInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.START_TIME);
  const endTimeInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.END_TIME);

  useEffect(() => {
    if (!tourStep) return;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [TOUR_STEPS.USAGE_TOGGLE]: {
        ...prevConfig[TOUR_STEPS.USAGE_TOGGLE],
        onNext: ({ setStep }) => {
          setStep(
            enableUsageLimit ? TOUR_STEPS.USAGE_INPUT : TOUR_STEPS.SCHED_TOGGLE,
          );
        },
      },
      [TOUR_STEPS.SCHED_TOGGLE]: {
        ...prevConfig[TOUR_STEPS.SCHED_TOGGLE],
        onPrev: ({ setStep }) => {
          setStep(
            enableUsageLimit ? TOUR_STEPS.USAGE_INPUT : TOUR_STEPS.USAGE_TOGGLE,
          );
        },
      },
    }));
  }, [enableUsageLimit, setConfig]);

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================

  useEffect(() => {
    fetchDependency();
    setSettings(campaign.settings);
    if (campaign.usage_limit) setEnableUsageLimit(true);
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

  const handleStatusChange = (checked: boolean) => {
    if (checked && campaign.schedule_enabled && campaign.status === "expired") {
      setCampaign({ ...campaign, status: "active", schedule_enabled: false });
    } else {
      setCampaign({ ...campaign, status: checked ? "active" : "inactive" });
    }
  };
  console.log(campaign);
  return (
    <>
      <HeaderContainer className="campaignbay-py-[12px]">
        <EditableText
          value={campaign.title}
          onChange={(value) => setCampaign({ ...campaign, title: value })}
          placeholder="Campaign Title"
          className="campaignbay-w-full"
          error={errors?.title?.message}
        />
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[8px]">
          <span className="campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-uppercase">
            {campaign.status === "active" || campaign.status === "scheduled"
              ? "Active"
              : campaign.status}
          </span>

          <Switch
            size="small"
            checked={campaign.status === "active" || campaign.status === "scheduled"}
            onChange={(checked) => handleStatusChange(checked)}
          />
          <Button
            size="small"
            color="primary"
            variant="solid"
            className="campaignbay-w-max"
            disabled={isSaving || isLoading || campaign?.type === null}
            onClick={handleSave}
          >
            {buttonText}
          </Button>
          {showDeleteButton && (
            <Button
              size="small"
              color="danger"
              variant="outline"
              className="campaignbay-w-max"
              disabled={isSaving || isLoading || campaign?.type === null}
              onClick={onDelete}
            >
              {__("Delete Campaign", "campaignbay")}
            </Button>
          )}
        </div>
      </HeaderContainer>
      <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-default">
        <Card
          header={
            <h2 className="campaignbay-text-[15px] campaignbay-leading-[24px] campaignbay-text-[#1e1e1e] campaignbay-font-semibold campaignbay-pb-[15px]">
              Select Discount Type{" "}
              <span className="campaignbay-text-red-500">*</span>
            </h2>
          }
        >
          <CardRadioGroup
            classNames={{
              root: "campaignbay-w-full campaignbay-grid campaignbay-grid-cols-2 lg:campaignbay-grid-cols-4",
            }}
            layout="horizontal"
            options={DISCOUNT_TYPES}
            // @ts-ignore
            value={campaign?.type}
            onChange={(value) =>
              setCampaign({ ...campaign, type: value as CampaignType })
            }
          />
        </Card>

        <div className="campaignbay-flex campaignbay-flex-nowrap campaignbay-flex-col xl:campaignbay-flex-row campaignbay-gap-default">
          {/* left */}
          <div className="campaignbay-w-full">
            <Card
              disabled={campaign.type === null}
              className="campaignbay-w-full"
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
                    con_ref={targetTypeInputRef}
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
                          ref={targetIdsInputRef}
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
                <CampaignTiers
                  campaign={campaign as CampaignInterface}
                  setCampaign={
                    setCampaign as Dispatch<SetStateAction<CampaignInterface>>
                  }
                  errors={errors}
                  products={products}
                />
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

            <div className="campaignbay-py-[15px]">
              <Button
                size="large"
                color="primary"
                variant="solid"
                className="campaignbay-text-[15px] campaignbay-leading-[20px] campaignbay-font-[700] "
                onClick={handleSave}
                disabled={isSaving || isLoading || campaign?.type === null}
              >
                {buttonText} <Icon icon={check} fill="currentColor" />
              </Button>
            </div>
          </div>
          {/* right */}
          <Card
            disabled={campaign.type === null}
            className="campaignbay-w-full xl:campaignbay-w-[min(70%,900px)] !campaignbay-bg-[#f9fbfd]"
            header={
              <h2 className="campaignbay-text-[20px] campaignbay-leading-[20px] campaignbay-text-[#1e1e1e] campaignbay-font-semibold campaignbay-pb-[24px] campaignbay-border-b campaignbay-border-[#dddddd] campaignbay-w-full">
                Configurations
              </h2>
            }
          >
            <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-[15px] campaignbay-pt-[15px] ">
              <OtherSettings
                campaign={campaign}
                setCampaign={setCampaign}
                settings={settings}
                setSettings={setSettings}
                errors={errors}
                enableUsageLimit={enableUsageLimit}
                setEnableUsageLimit={setEnableUsageLimit}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Campaign;

export const Section = ({
  children,
  header,
  className,
  required = false,
}: {
  children: ReactNode;
  header: string;
  required?: boolean;
  className?: string;
}) => {
  return (
    <div className={`campaignbay-p-0 ${className || ""}`}>
      <div className="campaignbay-flex campaignbay-justify-start campaignbay-items-center campaignbay-text-[15px] campaignbay-leading-[24px] campaignbay-text-[#1e1e1e] campaignbay-font-semibold">
        {header}{" "}
        {required && (
          <span className="campaignbay-text-red-500 campaignbay-ml-[2px]">
            *
          </span>
        )}
      </div>
      <div className="campaignbay-pt-[15px] campaignbay-w-full campaignbay-space-y-[15px]">
        {children}
      </div>
    </div>
  );
};

export const Card = ({
  children,
  header,
  className,
  classNames,
  disabled = false,
}: {
  children: ReactNode;
  header: ReactNode;
  className?: string;
  classNames?: {
    header?: string;
    body?: string;
    children?: string;
  };
  disabled?: boolean;
}) => {
  return (
    <div
      className={`campaignbay-bg-white campaignbay-p-[24px] campaignbay-rounded-[8px] campaignbay-w-full ${
        disabled
          ? "campaignbay-opacity-25 campaignbay-pointer-events-none "
          : "campaignbay-shadow-sm"
      } ${className} ${classNames?.body || ""}`}
    >
      <div
        className={`campaignbay-flex campaignbay-justify-between campaignbay-items-center ${
          classNames?.header || ""
        }`}
      >
        {header}
      </div>
      <div className={` ${classNames?.children || ""}`}>{children}</div>
    </div>
  );
};

interface ErrorObject {
  message: string;
}

export const renderError = (
  error?: ErrorObject,
  negativeMargin = true,
): React.ReactNode => {
  if (!error) {
    return null;
  }

  const marginClass = negativeMargin
    ? "campaignbay--mt-2"
    : "campaignbay-mt-[1px]";
  const className = `campaignbay-text-red-600 ${marginClass} campaignbay-text-xs`;

  return <span className={className}>{error.message}</span>;
};

export const OtherSettings = ({
  campaign,
  setCampaign,
  settings,
  setSettings,
  errors,
  enableUsageLimit,
  setEnableUsageLimit,
}: {
  campaign: CampaignInterface;
  setCampaign: Dispatch<SetStateAction<CampaignInterface>>;
  settings: CampaignSettingsType;
  setSettings: Dispatch<SetStateAction<CampaignSettingsType>>;
  errors: CampaignErrorsType;
  enableUsageLimit: boolean;
  setEnableUsageLimit: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleScheduleChange = (checked: boolean) => {
    if (checked && campaign.status === "active") {
      setCampaign({
        ...campaign,
        status: "scheduled",
        schedule_enabled: checked,
      });
    } else if (!checked && campaign.status === "scheduled") {
      setCampaign({ ...campaign, status: "active", schedule_enabled: checked });
    } else {
      setCampaign({ ...campaign, schedule_enabled: checked ? true : false });
    }
  };
  return (
    <>
      <Section header="Others">
        <Checkbox
          label={__("Exclude Sale Item", "campaignbay")}
          checked={!!campaign.exclude_sale_items}
          onChange={(checked) =>
            setCampaign((prev) => ({ ...prev, exclude_sale_items: checked }))
          }
        />
        <div className="campaignbay-flex campaignbay-gap-[15px]">
          <Checkbox
            classNames={{
              label: "campaignbay-text-nowrap",
            }}
            label={__("Enable Usage Limit", "campaignbay")}
            checked={!!enableUsageLimit}
            onChange={(checked) => {
              setEnableUsageLimit(checked);
              if (!checked) {
                setCampaign((prev) => ({ ...prev, usage_limit: null }));
              }
            }}
          />

          <NumberInput
            disabled={!enableUsageLimit}
            classNames={{
              wrapper: "campaignbay-w-full",
            }}
            value={campaign.usage_limit}
            onChange={(value) =>
              setCampaign((prev) => ({ ...prev, usage_limit: value }))
            }
          />
        </div>

        <Checkbox
          label={__("Enable Schedule", "campaignbay")}
          checked={!!campaign.schedule_enabled}
          onChange={handleScheduleChange}
        />

        <CustomDateTimePicker
          // inputRef={endTimeInputRef}
          label={__("START DATE", "campaignbay")}
          value={campaign.start_datetime}
          onChange={(date: Date | string) => {
            setCampaign((prev) => ({
              ...prev,
              start_datetime: date,
            }));
          }}
          disabled={!campaign.schedule_enabled}
        />
        {renderError(errors?.start_datetime, false)}
        <CustomDateTimePicker
          // inputRef={endTimeInputRef}
          label={__("END DATE", "campaignbay")}
          value={campaign.end_datetime}
          onChange={(date: Date | string) => {
            setCampaign((prev) => ({
              ...prev,
              end_datetime: date,
            }));
          }}
          disabled={!campaign.schedule_enabled}
        />
        {renderError(errors?.end_datetime, false)}
      </Section>
      <Section header="Settings">
        <CampaignSettings
          settings={settings}
          setSettings={setSettings}
          errors={errors.settings}
          type={campaign.type || "bogo"}
        />
      </Section>
    </>
  );
};
