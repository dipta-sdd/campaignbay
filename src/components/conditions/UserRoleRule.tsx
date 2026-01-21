import { RuleErrors, UserRuleCondition } from "./type";
import { FC } from "react";
import { useCbStore } from "../../store/cbStore";
import Select from "../common/Select";
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
      <span className="text-[12px] campaignbay-leading-[16px] campaignbay-font-[400] campaignbay-text-[#757575]">
        {__("Apply this campaign to only users with", "campaignbay")}
      </span>
    
      <Select
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
      <span className="text-[12px] campaignbay-leading-[16px] campaignbay-font-[400] campaignbay-text-[#757575]">{__("role.", "campaignbay")}</span>
    </div>
  );
};

export default UserRoleRule;
