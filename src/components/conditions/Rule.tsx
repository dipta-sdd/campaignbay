import { FC } from "react";
import { ConditionInterface, RuleErrors } from "./type";
import UsersRule from "./UsersRule";
import { Trash2 } from "lucide-react";
import { UserRuleCondition, UserRolesCondition, UsersCondition } from "./type";
import UserRoleRule from "./UserRoleRule";
import UserRolesRule from "./UserRolesRule";

interface RuleProps {
  rule: ConditionInterface;
  onChange: (rule: ConditionInterface) => void;
  onDelete: () => void;
  errors: RuleErrors;
}

const Rule: FC<RuleProps> = ({ rule, onChange, onDelete, errors }) => {
  return (
    <div
      className={`cb-quantity-tier-row !campaignbay-flex-row !campaignbay-items-center campaignbay-gap-2 !campaignbay-justify-between`}
    >
      {(() => {
        switch (rule.type) {
          case "user_role":
            return (
              <UserRoleRule
                errors={errors}
                condition={rule.condition as UserRuleCondition}
                onChange={(condition) => onChange({ ...rule, condition })}
              />
            );
          case "user_roles":
            return (
              <UserRolesRule
                errors={errors}
                condition={rule.condition as UserRolesCondition}
                onChange={(condition) => onChange({ ...rule, condition })}
              />
            );
          case "users":
            return (
              <UsersRule
                errors={errors}
                condition={rule.condition as UsersCondition}
                onChange={(condition) => onChange({ ...rule, condition })}
              />
            );
        }
      })()}
      <div className="campaignbay-self-start campaignbay-flex campaignbay-items-start campaignbay-justify-start campaignbay-gap-2">
        <button
          onClick={onDelete}
          className="campaignbay-p-2 campaignbay-rounded-[4px] campaignbay-border campaignbay-border-red-500 campaignbay-text-red-500 hover:campaignbay-bg-red-500 hover:campaignbay-text-white"
        >
          {" "}
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default Rule;
