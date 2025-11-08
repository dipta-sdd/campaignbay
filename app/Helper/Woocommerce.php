<?php

namespace WpabCampaignBay\Helper;

use WC_Order;
use WC_Order_Refund;
use WC_Product;
use WP_Post;
use WpabCampaignBay\Core\Common;
use WpabCampaignBay\Helper\Helper;

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

class Woocommerce
{
    /**
     * Check product type is found in product
     * @param $product - Woocommerce product object
     * @param $type - product types 
     * @return bool
     */
    static $product_taxonomy_terms = array();
    static $custom_taxonomies;
    static $checkout_post = null;

    protected static $products = array();
    protected static $product_variations = array();

    static function product_type_is($product, $type)
    {
        if (!empty($product))
            if (is_object($product) && method_exists($product, 'is_type')) {
                return $product->is_type($type);
            }
        return false;
    }

    static function get_price_html($price_html, $product, $original_price, $discount_price, $display_as_regular_price = false)
    {
        if ($display_as_regular_price || $original_price <= $discount_price) {
            return self::format_price($discount_price);
        }
        $new_price_html = self::format_sale_price(self::format_price($original_price), self::format_price($discount_price));
        if ($new_price_html)
            return $new_price_html;
        return $price_html;
    }

    static function generate_product_banner($value, $type = '', $format = null)
    {
        if ($value === null || $value === '' || $type === null || $type === '')
            return null;
        if ($format === null || $format === '') {
            $format = Common::get_instance()->get_settings(
                $type == 'percentage' ? 'product_message_format_percentage' : 'product_message_format_fixed'
            );
        }
        return Helper::generate_message($format, array(
            '{percentage_off}' => $value,
            '{amount_off}' => $value . self::get_currency_symbol(),
        ));
    }

    /**
     * Add notice
     *
     * @access public
     * @param $message string
     * @param $type string
     * @param $data array
     */
    public static function wc_add_notice($message, $type = 'success', $data = array())
    {
        if (function_exists('wc_add_notice')) {
            wc_add_notice($message, $type, $data);
        }
    }

    static function round($value)
    {
        if (function_exists('wc_get_price_decimals')) {
            return round($value, wc_get_price_decimals());
        } else {
            return round($value, get_option('woocommerce_price_num_decimals', 2));
        }
    }
    /**
     * Format the sale price
     * @param $price1
     * @param $price2
     * @return string|null
     */
    static function format_sale_price($price1, $price2)
    {
        if (function_exists('wc_format_sale_price')) {
            return apply_filters('campaignbay_format_sale_price', wc_format_sale_price($price1, $price2), $price1, $price2);
        }
        return NULL;
    }

    /**
     * Get variation prices for variable product
     * @param \WC_Product_Variable $product
     * @param bool $for_display
     * @return array|false
     */
    static function get_variation_prices($product, $for_display = false)
    {
        if (is_object($product) && method_exists($product, 'get_variation_prices')) {
            return $product->get_variation_prices($for_display);
        }
        return false;
    }

    /**
     * format the price
     * @param $price
     * @param $args
     * @return string
     */
    static function format_price($price, $args = array())
    {
        if (function_exists('wc_price')) {
            return wc_price($price, $args);
        }
        return $price;
    }

    /**
     * format currency code
     * @return string
     */
    static function get_currency_symbol($code = '')
    {
        if (function_exists('get_woocommerce_currency_symbol')) {
            return get_woocommerce_currency_symbol($code);
        }
        return $code;
    }
    /**
     * get the parent id of the particular product
     * @param $product
     * @return int
     */
    static function get_product_parent_id($product)
    {
        $parent_id = 0;
        if (is_int($product)) {
            $product = self::get_product($product);
        }
        if (!empty($product))
            if (is_object($product) && method_exists($product, 'get_parent_id')) {
                $parent_id = $product->get_parent_id();
            }
        return apply_filters('campaignbay_get_product_parent_id', $parent_id, $product);
    }

    /**
     * print the notice
     * @param $message
     * @param $type
     */
    static function print_notice($message, $type)
    {
        if (function_exists('wc_print_notice')) {
            wc_print_notice(wp_unslash($message), $type);
        }
    }
    /**
     * get available product variations
     * @param $product
     * @return array
     */
    public static function available_product_variations($product)
    {
        $product_id = self::get_product_id($product);
        if (isset(self::$product_variations[$product_id])) {
            return self::$product_variations[$product_id];
        }
        $available_variations = array();
        $is_variable_product = self::product_type_is($product, 'variable');
        if (!empty($product))
            if ($is_variable_product && is_object($product) && method_exists($product, 'get_available_variations')) {
                $available_variations = $product->get_available_variations();
            }
        self::$product_variations[$product_id] = $available_variations;
        return $available_variations;
    }


    /**
     * get the product ID
     * @param $product - woocommerce product object
     * @return null
     */
    static function get_product_id($product)
    {
        if (!empty($product)) {
            if (is_object($product) && method_exists($product, 'get_id')) {
                return $product->get_id();
            } elseif (isset($product->id)) {
                $product_id = $product->id;
                if (isset($product->variation_id)) {
                    $product_id = $product->variation_id;
                }
                return $product_id;
            } else {
                return NULL;
            }
        }
        return NULL;
    }
    /**
     * get the product ID or parent ID if variation
     * @param $product - woocommerce product object
     * @return null
     */
    static function get_product_or_parent_id($product)
    {
        if (self::product_type_is($product, 'variation')) {
            return self::get_product_parent_id($product);
        }
        return self::get_product_id($product);
    }



    /**
     * Get the product from product id
     * @param $product_id
     * @return bool|false|WC_Product|null
     */
    static function get_product($product_id)
    {
        if (isset(self::$products[$product_id])) {
            return self::$products[$product_id];
        } else if (function_exists('wc_get_product')) {
            self::$products[$product_id] = apply_filters('campaignbay_get_product', wc_get_product($product_id), $product_id);

            return self::$products[$product_id];
        }
        return false;
    }


    /**
     * Get the sale price of the product
     * @param $product
     * @return bool
     */
    static function get_product_sale_price($product)
    {
        if (!empty($product))
            if (self::is_product_in_sale($product)) {
                if (is_object($product) && method_exists($product, 'get_sale_price')) {
                    $price = $product->get_sale_price();
                    return $price;
                }
                return false;
            }
        return false;
    }

    /**
     * Check the produt in sale
     * @param $product
     * @return bool
     */
    static function is_product_in_sale($product)
    {
        if (!empty($product))
            if (is_object($product) && method_exists($product, 'is_on_sale') && method_exists($product, 'get_sale_price')) {
                if ($product->is_on_sale('')) {
                    if ($product->get_sale_price()) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        return false;
    }

    /**
     * Get the regular price of the product
     * @param $product
     * @return bool
     */
    static function get_product_regular_price($product)
    {
        if (!empty($product))
            if (is_object($product) && method_exists($product, 'get_regular_price')) {
                $price = $product->get_regular_price();
                return $price;
            }
        return false;
    }

    /**
     * Get the base price of the product
     * @param $product
     * @return bool
     */
    static function get_product_base_price($product)
    {
        $price = null;
        if (empty($product))
            return $price;
        $settings = Common::get_instance()->get_settings('global_calculate_discount_from');
        if ($settings == 'sale_price' && self::is_product_in_sale($product)) {
            $price = self::get_product_sale_price($product);
            if ($price !== false) {
                return $price;
            }
        }
        $price = self::get_product_regular_price($product);
        if ($price === false) {
            $price = self::get_product_sale_price($product);
        }
        return $price;
    }
}