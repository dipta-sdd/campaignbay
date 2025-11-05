<?php

namespace WpabCampaignBay\Helper;

use WpabCampaignBay\Core\Common;

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

class Filter
{
    /**
     * The single instance of the class.
     *
     * @since 1.0.0
     * @var   DiscountManager
     * @access private
     */
    private static $instance = null;

    /**
     * 
     * @since 1.0.0
     * @access private
     * @var array
     */
    private $settings = array();


    /**
     * Gets an instance of this object.
     *
     * @static
     * @access public
     * @since 1.0.0
     * @return object
     */
    public static function get_instance()
    {
        static $instance = null;
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor to define and build the hooks array.
     *
     * @since 1.0.0
     */
    private function __construct()
    {
        $this->settings = Common::get_instance()->get_settings();
    }



    /**
     * Match rule filters against product
     * @param $product
     * @param $campaign 
     * @param array $cart_item
     * @return bool
     */
    public function match($product, $campaign)
    {
        $settings = Common::get_instance()->get_settings();
        if (is_a($product, 'WC_Product')) {
            $is_on_sale = Woocommerce::is_product_in_sale($product);
            $product_id = Woocommerce::get_product_or_parent_id($product);
            $type = $campaign->get_target_type();
            $is_exclude = $campaign->get_is_exclude();
            $exclude_sale_item = $campaign->get_exclude_sale_items();

            if ($is_on_sale && $exclude_sale_item) {
                return false;
            }
            if ('entire_store' === $type) {
                return true;
            } else if ('product' === $type) {
                $result = $this->compareWithProducts($campaign->get_target_ids(), $is_exclude, $product_id, $product);
                return $result;
            }
            // elseif ('category' === $type) {
            //     return $this->compareWithCategories($product, $values, $method);
            // } elseif ('tags' === $type) {
            //     $product = Woocommerce::getParentProduct($product);
            //     return $this->compareWithTags($product, $values, $method);
            // } 
            // elseif ('product_attributes' === $type) {
            //     return $this->compareWithAttributes($product, $values, $method, $cart_item);
            // } elseif ('product_sku' === $type) {
            //     return $this->compareWithSku($product, $values, $method);
            // } elseif ('product_on_sale' === $type) {
            //     return $this->compareWithOnSale($product, $method);
            // } elseif (in_array($type, array_keys(Woocommerce::getCustomProductTaxonomies()))) {
            //     return $this->compareWithCustomTaxonomy($product_id, $values, $method, $type);
            // }
        }
        return false;
    }



    /**
     * Compare product's tags against tag filters
     * @param $product
     * @param $target_ids
     * @param $is_exclude
     * @return bool
     */
    protected function compareWithTags($product, $target_ids, $is_exclude)
    {
        $tag_ids = Woocommerce::getProductTags($product);
        $is_product_has_tag = count(array_intersect($tag_ids, $target_ids)) > 0;
        if ('in_list' === $is_exclude) {
            return $is_product_has_tag;
        } elseif ('not_in_list' === $is_exclude) {
            return !$is_product_has_tag;
        }
        return false;
    }

    /**
     * Compare product's categories against category filters
     * @param $product
     * @param $target_ids
     * @param $is_exclude
     * @return bool
     */
    protected function compareWithCategories($product, $target_ids, $is_exclude)
    {
        $categories = Woocommerce::getProductCategories($product);
        $is_product_in_category = count(array_intersect($categories, $target_ids)) > 0;
        if ('in_list' === $is_exclude) {
            return $is_product_in_category;
        } elseif ('not_in_list' === $is_exclude) {
            return !$is_product_in_category;
        }
        return false;
    }

    /**
     * Compare products against product filter values
     * @param $target_ids
     * @param $is_exclude
     * @param $product_id
     * @param $product
     * @return bool
     */
    protected function compareWithProducts($target_ids, $is_exclude, $product_id, $product)
    {
        $result = $this->checkInList($product_id, $is_exclude, $target_ids);
        return $result;
    }

    /**
     * Compare products against product is on sale values
     * @param $product
     * @param $is_exclude
     * @return bool
     */
    protected function compareWithOnSale($product, $is_exclude)
    {
        if ('in_list' === $is_exclude) {
            return (Woocommerce::isProductInSale($product)) ? true : false;
        } elseif ('not_in_list' === $is_exclude) {
            return (Woocommerce::isProductInSale($product)) ? false : true;
        } elseif ('any' === $is_exclude) {
            return false;
        }

    }

    /**
     * Check product in list
     * @param $product_id
     * @param $is_exclude
     * @param $target_ids
     * @return bool
     */
    function checkInList($product_id, $is_exclude, $target_ids)
    {
        $result = false;
        $target_ids = array_map('strval', $target_ids);
        $product_id = (string) ($product_id);
        if (!$is_exclude) {
            $result = (in_array($product_id, $target_ids, true));
        } else {
            $result = !(in_array($product_id, $target_ids, true));
        }
        return $result;
    }
}
