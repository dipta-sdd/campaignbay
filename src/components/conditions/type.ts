import { Dispatch, SetStateAction } from "react";
import { CampaignErrorsType, CampaignType, Error } from "../../types";

export type ConditionRuleType = "user_role" | "user_roles" | "users";
export type UserRuleCondition = {
  option: string;
  is_included: boolean;
};
export type UserRolesCondition = {
  options: string[];
  is_included: boolean;
};
export type UsersCondition = {
  options: number[];
  is_included: boolean;
};

export type AllConditionsType =
  | UserRuleCondition
  | UserRolesCondition
  | UsersCondition;

export type ConditionInterface = {
  type: ConditionRuleType;
  condition: AllConditionsType;
};

export type ConditionsInterface = {
  match_type: "all" | "any";
  rules: ConditionInterface[];
};

export type RuleErrors = Record<string | number, Error> | null;
