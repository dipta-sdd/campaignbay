<?php

namespace WpabCb\Helper;

use WpabCb\Core\Common;
use WpabCb\Engine\CampaignManager;

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

class Helper
{
    public static function get_clean_html($html)
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
            // Since v2.5.5
            $allowed_html = apply_filters('advanced_woo_discount_rules_allowed_html_elements_and_attributes', $allowed_html);
            return wp_kses($html, $allowed_html);
        } catch (\Exception $e) {
            return '';
        }
    }

    public static function generate_message($format, $args)
    {
        $format = self::get_clean_html($format);
        if ($format == '')
            return '';
        return str_replace(array_keys($args), array_values($args), $format);
    }

    public static function get_quantity_campaigns($product)
    {
        $active_campaigns = CampaignManager::get_instance()->get_active_campaigns();
        $campaigns = array();
        foreach ($active_campaigns as $campaign) {

            if ($campaign->get_type() !== 'quantity')
                continue;
            if ($campaign->is_applicable_to_product($product))
                $campaigns[] = $campaign;
        }
        return $campaigns;
    }

    public static function get_quantity_tiers($tiers, $price)
    {
        $unique_tiers = array();
        foreach ($tiers as $tier) {
            $key = $tier['min'] . '-' . $tier['max'];
            $current_tier_price = self::get_quantity_price($price, $tier);
            if (isset($unique_tiers[$key])) {
                $unique_tier_price = $unique_tiers[$key][$price];
                $is_better = self::is_better_price($unique_tier_price, $current_tier_price);
                if ($is_better) {
                    $unique_tiers[$key] = $tier;
                    $unique_tiers[$key]['price'] = $current_tier_price;
                }
                continue;
            }
            $unique_tiers[$key] = $tier;
            $unique_tiers[$key]['price'] = $current_tier_price;
        }
        return $unique_tiers;
    }


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

    public static function generate_quantity_table($tiers)
    {
        $settings = Common::get_instance()->get_settings('discount_table_options');
        error_log(print_r($settings['discount']['content'], true));
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
        error_log($table);
        return self::get_clean_html($table);
    }
}
