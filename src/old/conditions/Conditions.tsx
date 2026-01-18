import { __ } from "@wordpress/i18n";
import { CampaignErrorsType, CampaignType } from "../../types";

import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { Dispatch, FC, SetStateAction, useMemo } from "react";
import CustomSelect from "../ui/CustomSelect";
import {
  AllConditionsType,
  ConditionInterface,
  ConditionRuleType,
  ConditionsInterface,
} from "./type";
import Rule from "./Rule";

interface ConditionsProps {
  conditions: ConditionsInterface;
  setConditions:
    | Dispatch<SetStateAction<ConditionsInterface>>
    | ((conditions: ConditionsInterface) => void);
  errors: CampaignErrorsType;
  type: CampaignType;
}

const Conditions: FC<ConditionsProps> = ({
  conditions,
  setConditions,
  errors,
  type,
}) => {
  const handleAddNewCondition = (type: ConditionRuleType) => {
    const newCondition: ConditionInterface = {
      type: type,
      condition: { ...defaultConditions[type] },
    };
    setConditions({
      ...conditions,
      rules: [...(conditions?.rules || []), newCondition],
    });
  };

  const ifAny = useMemo(
    () => (type: ConditionRuleType) => {
      return conditions?.rules?.some(
        (rule: ConditionInterface) => rule.type === type
      );
    },
    [conditions?.rules]
  );

  const getOptions = () => {
    const disabledUserRole = ifAny("user_role") || ifAny("user_roles");
    return [
      {
        label: __("User Role", "campaignbay"),
        labelNode: disabledUserRole ? (
          <span className="campaignbay-text-pink-500">
            {__("User Role", "campaignbay")}
            <span className="campaignbay-text-gray-500 campaignbay-ml-2">
              -- Already in Use
            </span>
          </span>
        ) : (
          __("User Role", "campaignbay")
        ),
        value: "user_role",
        disabled: disabledUserRole,
      },
      {
        label: __("Cart Total", "campaignbay"),
        value: "cart_total",
        variant: "coming_soon",
      },
      // {
      //   label: __("User Roles", "campaignbay"),
      //   value: "user_roles",
      //   variant: "buy_pro",
      // },
      // {
      //   label: __("Users", "campaignbay"),
      //   value: "users",
      //   variant: "buy_pro",
      // },
    ];
  };

  return (
    <>
      <div className="cb-form-input-con">
        <label htmlFor="start-time">
          {__("CONDITIONS / RULES", "campaignbay")}
        </label>
        <span className="wpab-input-help">
          {__("Define conditions or rules for the discount", "campaignbay")}
        </span>
        <div className="campaignbay-inline-flex campaignbay-gap-2 campaignbay-items-center campaignbay-fix-toggle-group ">
          <CustomSelect
            placeholder={__("Add New Condition", "campaignbay")}
            className="!campaignbay-w-max"
            differentDropdownWidth
            value={""}
            onChange={(value) =>
              handleAddNewCondition(value as ConditionRuleType)
            }
            // @ts-ignore
            options={getOptions()}
          />

          <ToggleGroupControl
            className="cb-toggle-group-control !campaignbay-text-nowrap"
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            isBlock
            value={conditions.match_type || "any"}
            // @ts-ignore
            onChange={(value: "any" | "all") =>
              setConditions({
                ...conditions,
                match_type: value,
              })
            }
          >
            <ToggleGroupControlOption
              label={__("Match Any", "campaignbay")}
              value="any"
            />
            <ToggleGroupControlOption
              label={__("Match All", "campaignbay")}
              value="all"
            />
          </ToggleGroupControl>
        </div>
        <span className="wpab-input-help  !campaignbay-mt-0 !campaignbay-mb-2">
          {conditions.match_type === "any"
            ? __(
                "Note: If any of the conditions are met, the discount will be applied",
                "campaignbay"
              )
            : __(
                "Note: If all of the conditions are met, the discount will be applied",
                "campaignbay"
              )}
        </span>
        <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
          {conditions?.rules?.length > 0 ? (
            conditions?.rules?.map(
              (rule: ConditionInterface, index: number) => (
                <Rule
                  key={index}
                  // @ts-ignore
                  errors={errors?.rules?.[index] || null}
                  rule={rule}
                  onChange={(updatedRule) => {
                    const newRules = [...conditions.rules];
                    newRules[index] = updatedRule;
                    setConditions({
                      ...conditions,
                      rules: newRules,
                    });
                  }}
                  onDelete={() => {
                    const newRules = [...conditions.rules];
                    newRules.splice(index, 1);
                    setConditions({
                      ...conditions,
                      rules: newRules,
                    });
                  }}
                />
              )
            )
          ) : (
            <span className="cb-quantity-tier-row !campaignbay-border-red-200">
              <span className="campaignbay-text-red-500 campaignbay-text-center campaignbay-w-full">
                {__("No conditions added", "campaignbay")}
              </span>
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Conditions;

const defaultConditions: Record<string, AllConditionsType> = {
  user_role: {
    option: "",
    is_included: true,
  },
  user_roles: {
    options: [],
    is_included: true,
  },
  users: {
    options: [],
    is_included: true,
  },
};
