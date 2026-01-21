import { FC, ReactNode, useEffect, useState } from "react";
import {
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
// @ts-ignore
interface CampaignInerface extends CampaignInerfaceBase {
  type: CampaignType | null;
}

const DISCOUNT_TYPES: CardOption[] = [
  {
    value: "bogo",
    title: "Buy X Get X Discount",
    description: "This is some help text to describe the input",
  },
  {
    value: "earlybird",
    title: "EarlyBird Discount",
    description: "This is some help text to describe the input",
  },
  {
    value: "quantity",
    title: "Quantity Based Discount",
    description: "This is some help text to describe the input",
  },
  {
    value: "scheduled",
    title: "Scheduled Discount",
    description: "This is some help text to describe the input",
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
  campaign: CampaignInerface;
  setCampaign: React.Dispatch<React.SetStateAction<CampaignInerface>>;
  errors: any;
}
const Campaign: FC<CampaignProps> = ({ campaign, setCampaign, errors }) => {
  const [enableUsageLimit, setEnableUsageLimit] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [settings, setSettings] = useState<CampaignSettingsType>({});
  const { wpSettings } = useCbStore();
  const { addToast } = useToast();

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================
  const { tourStep, setConfig } = useGuide();
  const campaignTitleInputRef = useGuideStep<HTMLInputElement>(
    TOUR_STEPS.TITLE
  );
  const campaignTypeInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.TYPE);
  const campaignStatusInputRef = useGuideStep<HTMLDivElement>(
    TOUR_STEPS.STATUS
  );
  const targetTypeInputRef = useGuideStep<HTMLDivElement>(
    TOUR_STEPS.TARGET_TYPE
  );
  const targetIdsInputRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.TARGET_IDS);
  const usageToggleRef = useGuideStep<HTMLDivElement>(TOUR_STEPS.USAGE_TOGGLE);
  const usageInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.USAGE_INPUT);
  const scheduleToggleRef = useGuideStep<HTMLDivElement>(
    TOUR_STEPS.SCHED_TOGGLE
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
            enableUsageLimit ? TOUR_STEPS.USAGE_INPUT : TOUR_STEPS.SCHED_TOGGLE
          );
        },
      },
      [TOUR_STEPS.SCHED_TOGGLE]: {
        ...prevConfig[TOUR_STEPS.SCHED_TOGGLE],
        onPrev: ({ setStep }) => {
          setStep(
            enableUsageLimit ? TOUR_STEPS.USAGE_INPUT : TOUR_STEPS.USAGE_TOGGLE
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
        })) || []
      );
      setCategories(
        response?.categories?.map((item: DependentType) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error: any) {
      addToast(
        __("Something went wrong, Please reload the page.", "campaignbay"),
        "error"
      );
    }
  };
  // console.log(campaign.target_ids);
  return (
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
          value={campaign?.type}
          onChange={(value) =>
            setCampaign({ ...campaign, type: value as CampaignType })
          }
        />
      </Card>

      <div className="campaignbay-flex campaignbay-gap-default">
        {/* left */}
        <div className="campaignbay-w-full">
          <Card
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
            <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-[30px] campaignbay-py-[30px] ">
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

              <Section header="Conditions" >
              <Conditions
                type={campaign?.type || "bogo" }
                errors={errors}
                conditions={campaign.conditions}
                setConditions={(conditions: ConditionsInterface) =>
                  setCampaign((prev) => ({ ...prev, conditions }))
                }
              />
            </Section>
            </div>
          </Card>
        </div>
        {/* right */}
        <Card
          className="campaignbay-w-[400px]"
          header={
            <h2 className="campaignbay-text-[15px] campaignbay-leading-[24px] campaignbay-text-[#1e1e1e] campaignbay-font-semibold">
              Select Discount Type{" "}
              <span className="campaignbay-text-red-500">*</span>
            </h2>
          }
        >
          left
        </Card>
      </div>
    </div>
  );
};

export default Campaign;

const Section = ({
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
        {required && <span className="campaignbay-text-red-500">*</span>}
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
}: {
  children: ReactNode;
  header: ReactNode;
  className?: string;
  classNames?: {
    header?: string;
    body?: string;
    children?: string;
  };
}) => {
  return (
    <div
      className={`campaignbay-bg-white campaignbay-p-[24px] campaignbay-rounded-[8px] campaignbay-shadow-sm ${className} ${
        classNames?.body || ""
      }`}
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
