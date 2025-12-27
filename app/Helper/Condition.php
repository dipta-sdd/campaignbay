<?php

/**
 * The Condition helper class.
 *
 * This file is responsible for defining the Condition class, which contains all the logic
 * for matching a product against a campaign's targeting rules and conditions.
 * It is a core component of the discount engine.
 *
 * @link       https://campaignbay.github.io
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/Helper
 */

namespace WpabCampaignBay\Helper;

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

/**
 * The Condition helper class.
 *
 * This file is responsible for defining the Condition class, which contains all the logic
 * for matching a product against a campaign's targeting rules and conditions.
 * It is a core component of the discount engine.
 *
 * @link       https://campaignbay.github.io
 * @since      1.0.7
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/Helper
 */
class Condition
{
    /**
     * Check if a product matches the campaign's targeting rules and conditions.
     * 
     * This function checks if the product matches the campaign's targeting rules and conditions.
     *
     * @since 1.0.7
     *
     * @param \WC_Product $product The product to check.
     * @param \WpabCampaignBay\Model\Campaign $campaign The campaign to check against.
     *
     * @return bool True if the product matches the campaign's targeting rules and conditions, false otherwise.
     */
    public static function check_product_level_conditions($product, $campaign)
    {
        $conditions = $campaign->get_conditions();
        $rules = $conditions['rules'];
        $match_type = $conditions['match_type'] ?? 'any';

        foreach ($rules as $rule) {
            $result = self::pass_product_level_rule($product, $rule);
            if ($match_type === 'all' && !$result) {
                return false;
            }
            if ($match_type === 'any' && $result) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a product matches a specific rule.
     * 
     * This function checks if the product matches a specific rule based on the rule type and condition.
     *
     * @since 1.0.7
     *
     * @param \WC_Product $product The product to check.
     * @param array $rule The rule to check against.
     *
     * @return bool True if the product matches the rule, false otherwise.
     */
    public static function pass_product_level_rule($product, $rule)
    {
        $result = true;
        $type = $rule['type'];
        $condition = $rule['condition'];
        switch ($type) {
            case 'user_role':
                $result = self::check_user_role($condition);
                break;
            default:
                $result = false;
                break;
        }

        /**
         * Filters the result of a product level rule check.
         * 
         * This filter allows plugins and themes to modify the result of a product level rule check.
         *
         * @since 1.0.7
         *
         * @param bool $result The result of the rule check.
         * @param \WC_Product $product The product to check.
         * @param array $rule The rule to check against.
         *
         * @return bool The filtered result of the rule check.
         */
        return apply_filters('campaignbay_pass_product_level_rule', $result, $product, $rule);
    }

    /**
     * Check if a user has a specific role.
     * 
     * This function checks if the current user has a specific role based on the condition.
     * 
     * @since 1.0.7
     *
     * @param array $condition The condition to check against.
     *
     * @return bool True if the user has the role, false otherwise.
     */
    public static function check_user_role($condition)
    {
        $result = true;
        $role = $condition['option'];
        $is_included = $condition['is_included'];
        $user = wp_get_current_user();
        if (empty($user) && $is_included)
            return true;
        if (empty($user) && !$is_included)
            return false;

        $user_roles = $user->roles;
        if ($is_included) {
            $result = in_array($role, $user_roles);
        } else {
            $result = !in_array($role, $user_roles);
        }
        return $result;
    }
}
