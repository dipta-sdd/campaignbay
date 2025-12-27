import { FC } from "react";
import { useCbStore } from "../../store/cbStore";
import CustomMultiSelect from "../ui/CustomMultiSelect";
import CustomSelect from "../ui/CustomSelect";
import { UserRolesCondition } from "./type";
import { __ } from "@wordpress/i18n";
import { RuleErrors } from "./type";

interface UserRolesRuleProps {
  condition: UserRolesCondition;
  onChange: (condition: UserRolesCondition) => void;
  errors: RuleErrors;
}
const UserRolesRule: FC<UserRolesRuleProps> = ({
  condition,
  onChange,
  errors,
}) => {
  const { wpSettings } = useCbStore();
  const userRoles = wpSettings?.user_roles?.map((role) => ({
    label: role.name,
    value: role.value,
  }));
  const handleChange = (value: (string | number)[]) => {
    onChange({ ...condition, options: value as string[] });
  };
  return (
    <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2 campaignbay-flex-wrap md:campaignbay-flex-nowrap">
      <span className="wpab-input-label !campaignbay-text-nowrap">
        {__("Apply this campaign to only users", "campaignbay")}
      </span>
      <span>
        <CustomSelect
          isError={!!errors?.is_included}
          differentDropdownWidth={true}
          className="!campaignbay-w-max"
          placeholder={__("Select", "campaignbay")}
          value={condition?.is_included ? "with" : "without"}
          onChange={(value: string | number) =>
            onChange({ ...condition, is_included: value === "with" })
          }
          options={[
            {
              label: __("with", "campaignbay"),
              value: "with",
              className: "campaignbay-text-green-600",
            },
            {
              label: __("without", "campaignbay"),
              value: "without",
              className: "campaignbay-text-red-600",
            },
          ]}
        />
      </span>
      <CustomMultiSelect
        isError={!!errors?.options}
        options={userRoles}
        value={condition?.options || []}
        onChange={handleChange}
        placeholder={__("Select roles...", "campaignbay")}
      />
      <span className="wpab-input-label !campaignbay-text-nowrap">
        {__("roles.", "campaignbay")}
      </span>
    </div>
  );
};

export default UserRolesRule;
