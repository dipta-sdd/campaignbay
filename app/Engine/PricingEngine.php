<?php

namespace WpabCb\Engine;

use WC_Product;
use WP_Error;
use WpabCb\Core\Base;
use WpabCb\Core\Common;
use WpabCb\Engine\CampaignManager;
use WpabCb\Helper\Helper;
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

	public $coupons = array();

	private $calculated_totals = false;

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
			['filter', 'woocommerce_variable_price_html', 'get_variable_price_html', 20, 2],
			['filter', 'woocommerce_product_is_on_sale', 'is_on_sale', 20, 2],
			['action', 'woocommerce_before_add_to_cart_form', 'display_product_discount_message', 20, 0],
			['action', 'woocommerce_before_add_to_cart_form', 'display_product_quantity_table', 20, 0],


			['action', 'woocommerce_before_cart', 'ensure_cart_calculate_totals', 20, 1],
			['action', 'woocommerce_before_mini_cart', 'ensure_cart_calculate_totals', 20, 1],
			['action', 'woocommerce_before_mini_cart_contents', 'ensure_cart_calculate_totals', 20, 1],

			['action', 'woocommerce_before_calculate_totals', 'before_calculate_totals', 20, 1],
			// ['filter', 'woocommerce_after_calculate_totals', 'after_calculate_totals', 20, 1],
			['filter', 'woocommerce_get_shop_coupon_data', 'validate_fake_coupon_data', 10, 2],
			['filter', 'woocommerce_cart_totals_coupon_label', 'change_virtual_coupon_label', 10, 2],
			['filter', 'woocommerce_coupon_is_valid', 'validate_fake_coupon', 10, 3]
		];

		// add_action('woocommerce_after_calculate_totals', array($this, 'after_calculate_totals'), 10, 1);
		// add_action('woocommerce_before_calculate_totals', array($this, 'before_calculate_totals'), 10, 1);
		foreach ($hooks as $hook) {
			$this->add_hook(...$hook);
		}
	}
	// position for banners
	// woocommerce_before_single_product
	// woocommerce_before_add_to_cart_form
	// woocommerce_after_add_to_cart_form
	// woocommerce_product_meta_start
	// woocommerce_product_meta_end

	public function get_price_html($price_html, $product)
	{
		if (Woocommerce::product_type_is($product, 'variable')) {
			return $price_html;
		}
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');

		if (!is_array($meta) || empty($meta) || !$meta['on_discount'] || !isset($meta['simple']))
			return $price_html;
		$price_html = Woocommerce::get_price_html(
			$price_html,
			$product,
			$meta['original_price'],
			$meta['simple']['price'],
			$meta['simple']['display_as_regular_price']
		);
		return $price_html;
	}

	public function get_variable_price_html($price_html, $product)
	{
		if (!Woocommerce::product_type_is($product, 'variable')) {
			return $price_html;
		}
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		if (!is_array($meta) || empty($meta) || !$meta['on_discount'] || !isset($meta['simple']))
			return $price_html;

		$prices = Woocommerce::get_variation_prices($product);
		foreach ($meta['simple'] as $key => $value) {
			$prices['price'][$key] = $value['price'];
			if ($value['display_as_regular_price'] !== null && $value['display_as_regular_price'] === true)
				$prices['regular_price'][$key] = $value['price'];
		}
		$min_price = current($prices['price']);
		$max_price = end($prices['price']);
		$min_reg_price = current($prices['regular_price']);
		$max_reg_price = end($prices['regular_price']);

		if ($min_price !== $max_price) {
			$price_html = wc_format_price_range($min_price, $max_price);
		}
		if ($min_reg_price !== $max_reg_price) {
			$reg_price = wc_format_price_range($min_reg_price, $max_reg_price);
		}
		if ($min_reg_price !== $min_price && $max_reg_price !== $max_price) {
			$price_html = wc_format_sale_price($reg_price, $price_html);
		}
		return $price_html;
	}


	public function is_on_sale($is_on_sale, $product)
	{
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
			$meta['simple']['value'],
			$meta['simple']['type'],
			$format = $meta['simple']['message_format']
		);
		if ($message == '')
			return;
		Woocommerce::print_notice(
			$message,
			'success'
		);
	}



	public function display_product_quantity_table()
	{
		if (!Common::get_instance()->get_settings('show_discount_table'))
			return;

		global $product;
		$tiers = Helper::get_quantity_tiers_with_campaign($product);
		$tiers = Helper::get_unique_quantity_tiers($tiers, (float) Woocommerce::get_product_base_price($product));
		if (empty($tiers))
			return;
		echo Helper::generate_quantity_table($tiers);

		return;
	}

	public function before_calculate_totals($cart)
	{
		$this->coupons = CartDiscount::calculate_cart_discount($cart);
		$this->calculated_totals = true;
	}

	public function after_calculate_totals($cart)
	{

		if (!isset($cart->campaignbay['coupon']))
			return;
		remove_action('woocommerce_after_calculate_totals', array($this, 'after_calculate_totals'), 10);
		remove_action('woocommerce_before_calculate_totals', array($this, 'before_calculate_totals'), 10);
		foreach ($cart->campaignbay['coupon'] as $key => $coupon) {
		}

		add_action('woocommerce_after_calculate_totals', array($this, 'after_calculate_totals'), 10, 1);
		add_action('woocommerce_before_calculate_totals', array($this, 'before_calculate_totals'), 10, 1);
	}

	public function validate_fake_coupon_data($data, $coupon_code)
	{

		if ($coupon_code !== false && $coupon_code !== 0 && isset($this->coupons[$coupon_code])) {

			$data = array(
				'id' => $coupon_code,
				'amount' => $this->coupons[$coupon_code]['discount'],
				'individual_use' => false,
				'product_ids' => $this->coupons[$coupon_code]['product_ids'] ?? array(),
				'exclude_product_ids' => array(),
				'usage_limit' => '',
				'usage_limit_per_user' => '',
				'limit_usage_to_x_items' => '',
				'usage_count' => '',
				'date_created' => gmdate('Y-m-d'),
				'expiry_date' => '',
				'apply_before_tax' => 'yes',
				'free_shipping' => false,
				'product_categories' => array(),
				'exclude_product_categories' => array(),
				'exclude_sale_items' => false,
				'minimum_amount' => '',
				'maximum_amount' => '',
				'customer_email' => '',
				'discount_type' => $this->coupons[$coupon_code]['type']
			);
		} elseif ($this->calculated_totals === false) {
			// before calculating total
			$data = array(
				'id' => $coupon_code,
				'amount' => 0,
				'individual_use' => false,
				'product_ids' => array(),
				'exclude_product_ids' => array(),
				'usage_limit' => '',
				'usage_limit_per_user' => '',
				'limit_usage_to_x_items' => '',
				'usage_count' => '',
				'date_created' => gmdate('Y-m-d'),
				'expiry_date' => '',
				'apply_before_tax' => 'yes',
				'free_shipping' => false,
				'product_categories' => array(),
				'exclude_product_categories' => array(),
				'exclude_sale_items' => false,
				'minimum_amount' => '',
				'maximum_amount' => '',
				'customer_email' => '',
				'discount_type' => 'fixed_cart'
			);
		}
		return $data;
	}
	public function change_virtual_coupon_label($label, $coupon_code)
	{
		$code = $coupon_code->get_code();
		if (isset($this->coupons[$code])) {
			return $this->coupons[$code]['title'];
		}
		return $label;
	}

	public function validate_fake_coupon($value, $coupon, $discount)
	{
		if (isset($this->coupons[$coupon->get_code()])) {
			return true;
		}
		return $value;
	}

	public function ensure_cart_calculate_totals()
	{
		if (!did_action('woocommerce_before_calculate_totals')) {
			return;
		}

		if (function_exists('WC')) {
			if (isset(WC()->cart) && WC()->cart != null) {
				if (is_object(WC()->cart) && method_exists(WC()->cart, 'calculate_totals')) {
					WC()->cart->calculate_totals();
				}
			}
		}
	}

}