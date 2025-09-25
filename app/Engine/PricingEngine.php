<?php

namespace WpabCb\Engine;

use WC_Product;
use WP_Error;
use WpabCb\Core\Base;
use WpabCb\Core\Common;
use WpabCb\Engine\CampaignManager;
use WpabCb\Helper\Woocommerce;

/**
 * The file that defines the Pricing Engine class.
 *
 * A class definition that handles all pricing interactions with WooCommerce.
 *
 * @link       https://wpanchorbay.com
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/includes
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * The Pricing Engine class.
 *
 * This class is responsible for applying discount logic by hooking into WooCommerce
 * pricing filters and actions. It is the "engine" that drives the customer-facing changes.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class PricingEngine extends Base
{

	private $settings = array();

	/**
	 * The request-level cache for calculated product discounts.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var array
	 */
	private $product_discount_cache = array();

	/**
	 * Constructor to define and build the hooks array.
	 *
	 * @since 1.0.0
	 */
	protected function __construct()
	{

		parent::__construct();
		$this->settings = Common::get_instance()->get_settings();

		if ($this->settings['global_enableAddon']) {
			$this->define_hooks();
		}
	}

	/**
	 * Defines all hooks this class needs to run.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function define_hooks()
	{
		// woocommerce_product_variation_get_price
		$hooks = [
			['filter', 'woocommerce_get_price_html', 'get_price_html', 20, 2],
			['filter', 'woocommerce_product_is_on_sale', 'is_on_sale', 20, 2],
			['action', 'woocommerce_before_add_to_cart_form', 'display_product_discount_message', 20, 0],
			// ['action' , 'woocommerce_before_single_product_summary', 'display_product_discount_message', 9 ],
			// ['filter' , 'woocommerce_product_get_price','get_price', 20, 2 ],
			// ['filter' , 'woocommerce_product_variation_get_price','get_variation_price', 1, 2 ],
		];
		foreach ($hooks as $hook) {
			$this->add_hook(...$hook);
		}
	}
	// woocommerce_before_single_product
	// woocommerce_before_add_to_cart_form
	// woocommerce_after_add_to_cart_form
	// woocommerce_product_meta_start
	// woocommerce_product_meta_end

	public function get_price_html($price_html, $product)
	{
		if (Woocommerce::product_type_is($product, 'variable'))
			return $price_html;

		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		//  
		if (!is_array($meta) || empty($meta) || !$meta['on_discount'] || !isset($meta['simple']))
			return $price_html;
		$price_html = Woocommerce::get_price_html(
			$price_html,
			$product,
			$meta['original_price'],
			$meta['simple']['discounted_price'],
			$meta['simple']['display_as_regular_price']
		);
		return $price_html;
	}


	public function is_on_sale($is_on_sale, $product)
	{
		if (Woocommerce::product_type_is($product, 'variable'))
			return $is_on_sale;
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		if (!is_array($meta) || empty($meta) || !isset($meta['is_on_sale']))
			return $is_on_sale;
		return $meta['is_on_sale'] ? $meta['is_on_sale'] : $is_on_sale;
	}


	public function display_product_discount_message()
	{
		global $product;
		if (!$product)
			return;
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		if (!is_array($meta) || empty($meta) || !$meta['on_discount'] || !isset($meta['simple']))
			return;
		$message = Woocommerce::generate_product_banner(
			$format = $meta['simple']['message_format'],
			$meta['simple']['value'],
			$meta['simple']['type']
		);
		if ($message == '')
			return;
		Woocommerce::print_notice(
			$message,
			'success'
		);
	}


	// public function get_price($price, $product){
	// 	if(Woocommerce::product_type_is($product, 'variable')) return $price;
	// 	$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
	// 	if($meta && is_array($meta) && isset($meta['is_simple']) && $meta['is_simple'] && isset($meta['simple']['discounted_price']) ){
	// 		$price = $meta['simple']['discounted_price'];
	// 	}
	// 	return $price;
	// }

	// public function get_variation_price($price, $product){
	// 	// error_log('get_variation_price ' . $product->get_name(). ' - ' . $price);
	// 	$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
	// 	if($meta && is_array($meta) && isset($meta['is_simple']) && $meta['is_simple'] && isset($meta['simple']['discounted_price']) ){
	// 		error_log(print_r($meta, true));
	// 		$price = $meta['simple']['discounted_price'];
	// 	}
	// 	return $price;
	// }
}