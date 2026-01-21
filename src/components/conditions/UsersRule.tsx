import { FC, useEffect, useState } from "react";
import Skeleton from "../common/Skeleton";
import MultiSelect from "../common/MultiSelect";
import Select, { SelectOption } from "../common/Select";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { UsersCondition } from "./type";
import { RuleErrors } from "./type";

interface UsersRuleProps {
  condition: UsersCondition;
  onChange: (condition: UsersCondition) => void;
  errors: RuleErrors;
}
const UsersRule: FC<UsersRuleProps> = ({ condition, onChange, errors }) => {
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: any = await apiFetch({
        path: "/campaignbay/v1/resources/users?_timestamp=" + Date.now(),
        method: "GET",
      });
      setUsers(
        response.map((user: any) => ({
          label: user.name + " - " + user.email,
          value: user.id,
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (value: number[]) => {
    onChange({ ...condition, options: value });
  };

  if (loading) {
    return (
      <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2 campaignbay-flex-wrap md:campaignbay-flex-nowrap">
        <Skeleton className="!campaignbay-w-[98px] !campaignbay-h-[40px]" />
        <Skeleton className="!campaignbay-w-[108px] !campaignbay-h-[18px]" />
        <Skeleton className="!campaignbay-w-[241px] !campaignbay-h-[40px]" />
      </div>
    );
  }

  return (
    <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2 campaignbay-flex-wrap md:campaignbay-flex-nowrap">
      <span>
        <Select
          isError={!!errors?.is_included}
          differentDropdownWidth={true}
          className="!campaignbay-w-max"
          placeholder={__("Select", "campaignbay")}
          value={condition?.is_included ? "include" : "exclude"}
          onChange={(value: string | number) =>
            onChange({ ...condition, is_included: value === "include" })
          }
          options={[
            {
              label: __("Include", "campaignbay"),
              value: "include",
              className: "campaignbay-text-green-600",
            },
            {
              label: __("Exclude", "campaignbay"),
              value: "exclude",
              className: "campaignbay-text-red-600",
              variant: "buy_pro",
            },
          ]}
        />
      </span>
      <span className="wpab-input-label !campaignbay-text-nowrap">
        {__("the following users:", "campaignbay")}
      </span>
      <MultiSelect
        isError={!!errors?.options}
        options={users}
        value={condition?.options || []}
        // @ts-ignore
        onChange={handleChange}
        placeholder={__("Search and select users...", "campaignbay")}
      />
    </div>
  );
};

export default UsersRule;