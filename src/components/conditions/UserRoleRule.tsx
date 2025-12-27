import { RuleErrors, UserRuleCondition } from "./type";
import { FC } from "react";
import { useCbStore } from "../../store/cbStore";
import CustomSelect from "../ui/CustomSelect";
import { __ } from "@wordpress/i18n";

interface UserRoleRuleProps {
  condition: UserRuleCondition;
  onChange: (condition: UserRuleCondition) => void;
  errors: RuleErrors;
}

const UserRoleRule: FC<UserRoleRuleProps> = ({
  condition,
  onChange,
  errors,
}) => {
  const { wpSettings } = useCbStore();
  const userRoles = wpSettings?.user_roles?.map((role) => ({
    label: role.name,
    value: role.value,
  }));
  return (
    <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
      <span className="wpab-input-label">
        {__("Apply this campaign to only users ", "campaignbay")}
      </span>
      <CustomSelect
        isError={!!errors?.is_included}
        differentDropdownWidth={true}
        className="!campaignbay-w-max"
        placeholder={__("Select User Role", "campaignbay")}
        value={condition?.is_included ? "with" : "without"}
        onChange={(value: string | number) =>
          onChange({ ...condition, is_included: value === "with" })
        }
        options={[
          {
            label: "with",
            value: "with",
            className: "campaignbay-text-green-500",
          },
          {
            label: "without",
            value: "without",
            className: "campaignbay-text-red-500",
            variant: "buy_pro",
          },
        ]}
      />
      <CustomSelect
        isError={!!errors?.option}
        differentDropdownWidth={true}
        className="!campaignbay-w-max"
        placeholder={__("Select User Role", "campaignbay")}
        value={condition?.option || ""}
        onChange={(value: string | number) =>
          onChange({ ...condition, option: value as string })
        }
        options={userRoles}
      />
      <span className="wpab-input-label">{__("role.", "campaignbay")}</span>
    </div>
  );
};

export default UserRoleRule;
