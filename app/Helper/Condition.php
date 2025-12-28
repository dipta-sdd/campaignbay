<?php

/**
 * The Condition helper class.
 *
 * This file is responsible for defining the Condition class, which contains all the logic
 * for matching a product against a campaign's targeting rules and conditions.
 * It is a core component of the discount engine.
 *
 * @link       https://wpanchorbay.com/campaignbay
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/Helper
 */

namespace WpabCampaignBay\Helper;

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

/**
 * Condition Class.
 *
 * Handles the evaluation of specific conditions and rules defined within a campaign.
 * This class serves as a static helper to validate products against complex user
 * or cart-level rules.
 *
 * @since      1.0.7
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/Helper
 */
class Condition
{
    /**
     * Evaluates product-level conditions for a campaign.
     *
     * Iterates through all configured rules in the campaign and determines if the product
     * matches based on the match type ('any' or 'all').
     *
     * @since 1.0.7
     * @access public
     * @static
     *
     * @param \WC_Product                       $product  The WooCommerce product to evaluate.
     * @param \WpabCampaignBay\Model\Campaign   $campaign The campaign configuration object.
     *
     * @return bool True if conditions are met, false otherwise.
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
     * Validates a single product rule.
     * 
     * Routes the validation logic to the appropriate handler based on the rule type
     * (e.g., user_role).
     *
     * @since 1.0.7
     * @access public
     * @static
     *
     * @param \WC_Product $product The product being checked.
     * @param array       $rule    The rule configuration array containing type and conditions.
     *
     * @return bool True if the rule is passed.
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
         * @param string $type The type of the rule.
         * @param array $condition The condition to check against.
         *
         * @return bool The filtered result of the rule check.
         */
        return apply_filters('campaignbay_pass_product_level_condition', $result, $product, $type, $condition);
    }

    /**
     * Verifies if the current user matches the required role condition.
     * 
     * Checks the currently logged-in user's roles against the condition settings,
     * supporting both inclusion ("is") and exclusion ("is not") logic.
     * Handles edge cases for guests (non-logged-in users).
     * 
     * @since 1.0.7
     * @access public
     * @static
     *
     * @param array $condition Array definition containing 'option' (role) and 'is_included' (bool).
     *
     * @return bool True if condition is satisfied.
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
