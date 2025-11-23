<?php
/**
 * The main Helper class.
 *
 * This file defines the Helper class, a collection of static utility methods used
 * throughout the CampaignBay plugin. It handles tasks like data filtering, price
 * calculation, HTML sanitization, and message generation.
 *
 * @link       https://campaignbay.github.io
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/Helper
 */

namespace WpabCampaignBay\Helper;

use WpabCampaignBay\Core\Common;
use WpabCampaignBay\Engine\CampaignManager;

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

/**
 * Helper Class.
 *
 * This class provides a collection of static utility methods accessible globally
 * within the plugin. It is designed as a central place for reusable logic,
 * including fetching and filtering campaigns by type, calculating discount prices,
 * generating promotional messages, and creating frontend HTML elements.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/Helper
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class Helper
{
    /**
     * Get settings.
     *
     * This method retrieves a specific setting value from the CampaignBay plugin.
     *
     * @since 1.0.0
     *
     * @param string $name The name of the setting.
     * @return mixed The value of the setting.
     */
    public static function get_settings($name)
    {
        return Common::get_instance()->get_settings($name);
    }

    /**
     * Get clean HTML.
     *
     * This method sanitizes HTML by removing script, style, and iframe tags,
     * and allows only specific HTML tags with attributes.
     *
     * @since 1.0.0
          * @param string $html The HTML to clean.
     * @param bool $echo Whether to echo the cleaned HTML.
     * @return string The cleaned HTML.
     */
    public static function get_clean_html($html, $echo = false)
    {
        try {
            $html = html_entity_decode($html);
            $html = preg_replace('/(<(script|style|iframe)\b[^>]*>).*?(<\/\2>)/is', "$1$3", $html);
            $allowed_html = array(
                'br' => array(),
                'strong' => array(),
                'span' => array('class' => array(), 'style' => array()),
                'div' => array('class' => array(), 'style' => array()),
                'p' => array('class' => array(), 'style' => array()),
                'table' => array('class' => array(), 'style' => array()),
                'tr' => array('class' => array(), 'style' => array()),
                'tbody' => array('class' => array(), 'style' => array()),
                'td' => array('class' => array(), 'style' => array()),
                'th' => array('class' => array(), 'style' => array()),
                'thead' => array('class' => array(), 'style' => array()),
            );
            if ($echo) {
                echo wp_kses($html, $allowed_html);
                return;
            }
            return wp_kses($html, $allowed_html);
        } catch (\Exception $e) {
            return '';
        }
    }
    /**
     * Generate message.
     *
     * This method generates a message by replacing placeholders in a format string with provided arguments.
     *
     * @since 1.0.0
     *
     * @param string $format The format string containing placeholders.
     * @param array $args The arguments to replace placeholders with.
     * @return string The generated message.
     */
    public static function generate_message($format, $args)
    {
        $format = self::get_clean_html($format);
        if ($format == '')
            return '';
        return self::get_clean_message(str_replace(array_keys($args), array_values($args), $format));
    }

    /**
     * Get clean message.
     *
     * This method ensures that a message is clean by removing any potentially harmful content.
     *
     * @since 1.0.0
     *
     * @param string $message The message to clean.
     * @return string The cleaned message.
     */
    public static function get_clean_message($message)
    {
        /**
         * we will implement it later. It is for failsafe if anyone forgot to clean before printing.
         *
         * Currently cleaned before printing
         */
        return $message;
    }

    /**
     * Get quantity campaigns.
     *
     * This method retrieves campaigns of type 'quantity' for a specific product.
     *
     * @since 1.0.0
     *
     * @param object $product The product object.
     * @return array The quantity campaigns.
     */
    public static function get_quantity_campaigns($product)
    {
        return self::get_type_of_campaign('quantity', $product);
    }
    /**
     * Get bogo campaigns.
     *
     * This method retrieves campaigns of type 'bogo' for a specific product.
     *
     * @since 1.0.0
     *
     * @param object $product The product object.
     * @return array The bogo campaigns.
     */
    public static function get_bogo_campaigns($product)
    {
        return self::get_type_of_campaign('bogo', $product);
    }

    /**
     * Get type of campaign.
     *
     * This method retrieves campaigns of a specific type for a specific product.
     *
     * @since 1.0.0
     *
     * @param string $type The type of campaign.
     * @param object $product The product object.
     * @return array The campaigns of the specified type.
     */
    public static function get_type_of_campaign($type, $product = null)
    {
        $active_campaigns = CampaignManager::get_instance()->get_active_campaigns();
        $campaigns = array();
        foreach ($active_campaigns as $campaign) {

            if ($campaign->get_type() !== $type)
                continue;
            if ($product === null)
                $campaigns[] = $campaign;
            elseif ($campaign->is_applicable_to_product($product))
                $campaigns[] = $campaign;
        }
        return $campaigns;
    }
    /**
     * Get quantity tiers with campaign.
     *
     * This method retrieves the tiers of a quantity campaign for a specific product.
     *
     * @since 1.0.0
     *
     * @param object $product The product object.
     * @return array The quantity tiers with campaign.
     */
    public static function get_quantity_tiers_with_campaign($product)
    {
        $quantity_campaigns = self::get_quantity_campaigns($product);
        $tiers = array();
        foreach ($quantity_campaigns as $campaign) {
            foreach ($campaign->get_tiers() as $tier) {
                $tiers[] = array(
                    'id' => $campaign->get_id(),
                    'title' => $campaign->get_title(),
                    'settings' => $campaign->get_settings(),
                    'min' => $tier['min'],
                    'max' => $tier['max'],
                    'value' => $tier['value'],
                    'type' => $tier['type'],
                );
            }
        }
        return $tiers;
    }

    /**
     * Get unique quantity tiers.
     *
     * This method retrieves the unique tiers of a quantity campaign for a specific product.
     *
     * @since 1.0.0
     *
     * @param array $tiers The tiers of the quantity campaign.
     * @param float $price The price of the product.
     * @return array The unique quantity tiers.
     */
    public static function get_unique_quantity_tiers($tiers, $price)
    {
        $unique_tiers = array();
        foreach ($tiers as $tier) {
            $key = $tier['min'] . '-' . $tier['max'];
            $current_tier_price = (float) self::get_quantity_price($price, $tier);
            if (isset($unique_tiers[$key])) {
                $unique_tier_price = (float) $unique_tiers[$key]['price'];

                $is_better = self::is_better_price($unique_tier_price, $current_tier_price);
                if ($is_better) {
                    $unique_tiers[$key] = $tier;
                    $unique_tiers[$key]['price'] = (float) $current_tier_price;
                }
                continue;
            }
            $unique_tiers[$key] = $tier;
            $unique_tiers[$key]['price'] = (float) $current_tier_price;
        }
        $unique_tiers = array_values($unique_tiers);
        usort($unique_tiers, function ($a, $b) {
            return $a['min'] - $b['min'];
        });
        return $unique_tiers;
    }

    /**
     * Get quantity message.
     *
     * This method retrieves the message of a quantity campaign for a specific tier.
     *
     * @since 1.0.0
     *
     * @param array $tier The tier of the quantity campaign.
     * @return string The quantity message.
     */
    public static function get_quantity_message($tier)
    {
        $message_format = $tier['settings']['cart_quantity_message_format'] ?? '';
        $type = $tier['type'];
        $value = $tier['value'];
        if ($message_format === '' || $message_format === null) {
            $message_format = self::get_settings($type === 'percentage' ? 'cart_quantity_message_format_percentage' : 'cart_quantity_message_format_fixed');
        }
        $message = Helper::generate_message($message_format, array(
            '{remainging_quantity_for_next_offer}' => $tier['remaining'],
            '{percentage_off}' => $value,
            '{amount_off}' => $value
        ));
        return $message;
    }

    /**
     * Get bogo tiers.
     *
     * This method retrieves the tiers of a bogo campaign for a specific product.
     *
     * @since 1.0.0
     *
     * @param object $product The product object.
     * @return array The bogo tiers.
     */
    public static function get_bogo_tiers($product)
    {
        $bogo_campaigns = self::get_bogo_campaigns($product);
        $tiers = array();
        foreach ($bogo_campaigns as $campaign) {
            $tiers[] = array(
                'id' => $campaign->get_id(),
                'title' => $campaign->get_title(),
                'settings' => $campaign->get_settings(),
                'buy_quantity' => $campaign->get_tiers()[0]['buy_quantity'],
                'get_quantity' => $campaign->get_tiers()[0]['get_quantity'],
                'ratio' => (int) (($campaign->get_tiers()[0]['get_quantity'] / $campaign->get_tiers()[0]['buy_quantity']) * 100)
            );
        }
        $tmp_tiers = array();
        foreach ($tiers as $tier) {
            if (isset($tmp_tiers[$tier['buy_quantity']]))
                continue;
            $tmp_tiers[$tier['buy_quantity']] = $tier;
        }
        $tiers = array_values($tmp_tiers);
        usort($tiers, function ($a, $b) {
            return $b['ratio'] - $a['ratio'];
        });
        return $tiers;
    }

    /**
     * Render product bogo message.
     *
     * This method renders the message of a bogo campaign for a specific product.
     *
     * @since 1.0.0
     *
     * @param object $product The product object.
     * @return string The rendered bogo message.
     */
    public static function render_product_bogo_message($product)
    {
        $tiers = self::get_bogo_tiers($product);
        usort($tiers, function ($a, $b) {
            return $a['buy_quantity'] - $b['buy_quantity'];
        });
        $message = "";
        $format = "";

        if (!empty($tiers)) {
            $tier = $tiers[0];
            $format = $tier['settings']['bogo_banner_message_format'] ?? Common::get_instance()->get_settings('bogo_banner_message_format');
            $message = self::generate_message($format, array(
                '{buy_quantity}' => $tier['buy_quantity'],
                '{get_quantity}' => $tier['get_quantity'],
            ));
        }

        /**
         * Filter hook to allow modification of the final discount bogo message string.
         *
         * This is useful for developers who want to change the wording or add extra
         * details to the promotional bogo banner on the product page.
         *
         * @since 1.0.0
         * @hook campaignbay_product_display_product_discount_message
         * 
         * @param string     $message The generated message HTML.
         * @param WC_Product $product The current product object.
         * @param string     $format  The original message format.
         */
        $message = apply_filters('campaignbay_product_display_product_bogo_message', $message, $product, $format);
        if ($message === '' || $message === null)
            return;

        Woocommerce::print_notice(
            $message,
            'success'
        );

    }

    /**
     * Get bogo meta.
     *
     * This method retrieves the meta of a bogo campaign for a specific product.
     *
     * @since 1.0.0
     *
     * @param object $product The product object.
     * @param int $quantity The quantity of the product.
     * @return array The bogo meta.
     */
    public static function get_bogo_meta($product, $quantity = null)
    {

        $bogo_tiers = self::get_bogo_tiers($product);
        $meta = array(
            'is_bogo' => false,
        );
        $current_tier = null;
        $next_tier = null;
        foreach ($bogo_tiers as $key => $tier) {
            if ($tier['buy_quantity'] <= $quantity) {
                $current_tier = $tier;
                break;
            }
        }
        if ($current_tier === null) {
            foreach ($bogo_tiers as $key => $tier) {
                if ($next_tier === null || $next_tier['buy_quantity'] > $tier['buy_quantity']) {
                    $next_tier = $tier;
                }
            }
        } else {
            $total = $current_tier['buy_quantity'] + $current_tier['get_quantity'];
            $free_quantity = (int) ($quantity / $total);
            $free_quantity *= $current_tier['get_quantity'];
            $remaining = $quantity % $total;
            $need_to_add = 0;
            if ($remaining >= $current_tier['buy_quantity']) {
                $remaining -= $current_tier['buy_quantity'];
                $need_to_add = $current_tier['get_quantity'] - $remaining;
                $free_quantity += $remaining;
            }
            $meta['is_bogo'] = true;
            $meta['bogo'] = array(
                'id' => $current_tier['id'],
                'title' => $current_tier['title'],
                'settings' => $current_tier['settings'],
                'buy_quantity' => $current_tier['buy_quantity'],
                'get_quantity' => $current_tier['get_quantity'],
                'free_quantity' => $free_quantity,
                'need_to_add' => $need_to_add,
            );
        }

        if ($next_tier !== null) {
            $meta['on_discount'] = true;
            $meta['is_bogo'] = false;
            $meta['bogo']['next_tier'] = $next_tier;
        }
        return $meta;
    }

    /**
     * Get bogo cart message.
     *
     * This method retrieves the message of a bogo campaign for a specific tier.
     *
     * @since 1.0.0
     *
     * @param array $tier The tier of the bogo campaign.
     * @return string The bogo cart message.
     */
    public static function get_bogo_cart_message($tier)
    {
        $message_format = $tier['settings']['cart_bogo_message_format'];
        if ($message_format === '' || $message_format === null)
            $message_format = self::get_settings('cart_bogo_message_format');

        return self::generate_message($message_format, array(
            '{title}' => $tier['title'],
        ));
    }

    /**
     * Is better price.
     *
     * This method determines if a new price is better than the current best price.
     *
     * @since 1.0.0
     *
     * @param float $current_best_price The current best price.
     * @param float $new_price The new price to compare.
     * @return bool True if the new price is better, false otherwise.
     */
    public static function is_better_price($current_best_price, $new_price)
    {
        if ($new_price === null)
            return false;
        if ($current_best_price === null)
            return true;
        $setting = Common::get_instance()->get_settings('product_priorityMethod');
        if ($setting === 'apply_highest') {
            return $new_price < $current_best_price;
        } elseif ($setting === 'apply_lowest') {
            return $new_price > $current_best_price;
        } elseif ($setting === 'apply_first') {
            return $current_best_price === null;
        }
        return false;
    }

    /**
     * Get quantity price.
     *
     * This method retrieves the price of a quantity campaign for a specific tier.
     *
     * @since 1.0.0
     *
     * @param float $base_price The base price of the product.
     * @param array $tier The tier of the quantity campaign.
     * @return float The quantity price.
     */
    public static function get_quantity_price($base_price, $tier)
    {
        if ($base_price === null || $tier === null || empty($tier))
            return null;
        $price = $tier['type'] === 'percentage' ? self::calculate_percentage_price($base_price, $tier['value']) : self::calculate_fixed_price($base_price, $tier['value']);
        return max(0, $price);
    }

    /**
     * Calculates a price based on a fixed amount discount.
     *
     * @since 1.0.0
     * @param float $base_price The price before discount.
     * @param float $discount_value The fixed amount to subtract.
     * @return float The final price, ensuring it's not below zero.
     */
    public static function calculate_fixed_price($base_price, $discount_value)
    {
        return max(0, $base_price - $discount_value);
    }

    /**
     * Calculates a price based on a percentage discount.
     *
     * @since 1.0.0
     * @param float $base_price The price before discount.
     * @param float $discount_value The percentage to subtract (e.g., 10 for 10%).
     * @return float The final price, ensuring it's not below zero.
     */
    public static function calculate_percentage_price($base_price, $discount_value)
    {
        $discount_amount = ($discount_value / 100) * $base_price;
        return max(0, $base_price - $discount_amount);
    }

    /**
     * Generates a table of discount tiers.
     *
     * @since 1.0.0
     *
     * @param array $tiers The tiers of the discount campaign.
     * @return string The HTML for the discount table.
     */
    public static function generate_quantity_table($tiers)
    {
        $settings = Common::get_instance()->get_settings('discount_table_options');
        $table = '<table class="campaignbay-discount-table"> ';
        //show table header
        if (
            $settings['show_header'] === true && (
                $settings['title']['show'] === true ||
                $settings['range']['show'] === true ||
                $settings['discount']['show'] === true
            )
        ) {
            $table .= '<thead><tr>';
            if ($settings['title']['show'] === true)
                $table .= '<th>' . ($settings['title']['label'] ?? 'Title') . '</th>';
            if ($settings['range']['show'] === true)
                $table .= '<th>' . ($settings['range']['label'] ?? 'Range') . '</th>';
            if ($settings['discount']['show'] === true)
                $table .= '<th>' . ($settings['discount']['label'] ?? 'Discount') . '</th>';
            $table .= '</tr></thead>';
        }

        $table .= '<tbody>';
        foreach ($tiers as $tier) {
            $table .= '<tr>';
            if ($settings['title']['show'] === true)
                $table .= '<td>' . $tier['title'] . '</td>';
            if ($settings['range']['show'] === true)
                $table .= '<td>' . $tier['min'] . ' - ' . $tier['max'] . '</td>';
            if ($settings['discount']['show'] === true && $settings['discount']['content'] === 'price')
                $table .= '<td>' . Woocommerce::format_price($tier['price']) . '</td>';
            else {
                $table .= '<td>' . ($tier['type'] === 'currency' ? Woocommerce::format_price($tier['value']) : $tier['value']);
                $table .= $tier['type'] === 'percentage' ? '%' : ' /PCS';
                $table .= '</td>';
            }

            $table .= '</tr>';
        }
        $table .= '</tbody></table>';
        self::get_clean_html($table, true);
        return;
    }

    /**
     * Get earlybird current tier.
     *
     * This method retrieves the current tier of an earlybird campaign.
     *
     * @since 1.0.0
     *
     * @param object $campaign The campaign object.
     * @return array The current tier of the earlybird campaign.
     */
    public static function earlybird_current_tier($campaign)
    {
        $usage_count = $campaign->get_usage_count();
        $current_tier = null;
        $tiers = $campaign->get_tiers();
        foreach ($tiers as $tier) {

            if ($usage_count >= $tier['quantity']) {
                $usage_count -= $tier['quantity'];
            } else {
                return $tier;
            }
        }
        return $current_tier;
    }

    /**
     * Get cart for session.
     *
     * This method retrieves the cart for the current session.
     *
     * @since 1.0.0
     *
     * @param object $cart The cart object.
     * @return array The cart for the current session.
     */
    public static function get_cart_for_session($cart)
    {
        $cart_session = array();

        foreach ($cart->cart_contents as $key => $values) {
            $cart_session[$key] = $values;
            // wpab_campaignbay_log($key . ' : ' . $values['quantity']);
            unset($cart_session[$key]['data']); // Unset product object.
        }
        return $cart_session;
    }

    /**
     * Set cart session.
     *
     * This method sets the cart for the current session.
     *
     * @since 1.0.0
     *
     * @param object $cart The cart object.
     */
    public static function set_cart_session($cart)
    {
        $cart = self::get_cart_for_session($cart);
        $wc_session = WC()->session;
        $wc_session->set('cart', empty($cart) ? null : $cart);
        // wpab_campaignbay_log('manualy updatede cart session');
    }
}
