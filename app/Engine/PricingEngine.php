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


	private $discount_applied = false;

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
		$bulk_table_position = $this->settings['position_to_show_bulk_table'] ?? 'woocommerce_after_add_to_cart_form';
		$banner_position = $this->settings['position_to_show_discount_bar'] ?? 'woocommerce_before_add_to_cart_form';
		$hooks = [
			['filter', 'woocommerce_get_price_html', 'get_price_html', 20, 2],
			['filter', 'woocommerce_variable_price_html', 'get_variable_price_html', 20, 2],
			['filter', 'woocommerce_product_is_on_sale', 'is_on_sale', 20, 2],
			['action', $banner_position, 'display_product_discount_message', 20, 0],
			['action', $bulk_table_position, 'display_product_quantity_table', 20, 0],


			['action', 'woocommerce_before_cart', 'ensure_cart_calculate_totals', 20, 1],
			['action', 'woocommerce_before_mini_cart', 'ensure_cart_calculate_totals', 20, 1],
			['action', 'woocommerce_before_mini_cart_contents', 'ensure_cart_calculate_totals', 20, 1],

			['action', 'woocommerce_before_calculate_totals', 'before_calculate_totals', 20, 1],
			['action', 'woocommerce_after_calculate_totals', 'after_calculate_totals', 20, 1],
			['filter', 'woocommerce_get_shop_coupon_data', 'validate_fake_coupon_data', 10, 2],
			['filter', 'woocommerce_cart_totals_coupon_label', 'change_virtual_coupon_label', 10, 2],
			['filter', 'woocommerce_coupon_is_valid', 'validate_fake_coupon', 10, 3],
			['filter', 'woocommerce_cart_item_price', 'cart_item_price', 10, 3],
			['filter', 'woocommerce_cart_item_subtotal', 'cart_item_subtotal', 10, 3],
			['filter', 'woocommerce_cart_item_name', 'cart_item_name', 10, 3],
			['action', 'woocommerce_after_cart_item_quantity_update', 'after_cart_item_quantity_update', 10, 4],
			['action', 'woocommerce_checkout_create_order', 'save_discount_breakdown_to_order_meta', 10, 2],
			['action', 'woocommerce_store_api_checkout_update_order_meta', 'save_discount_breakdown_to_order_meta', 10, 1],
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



	/**
	 * Save the discount breakdown to the order meta.
	 *
	 * @since 1.0.0
	 * @hook woocommerce_checkout_create_order
	 * @hook woocommerce_store_api_checkout_update_order_meta
	 * @param WC_Order $order The order object.
	 * @param array $data The order data.
	 */
	public function save_discount_breakdown_to_order_meta($order, $data = null)
	{
		// The cart object is available globally via WC()->cart at this point.
		$cart = WC()->cart;




		if (!$cart)
			return;


		$discount_breakdown = $cart->campaignbay_discount_breakdown ?? array();


		$applied_coupons = $cart->get_coupon_discount_totals();
		$our_coupons = $this->coupons;
		if (is_array($applied_coupons) && !empty($applied_coupons) && !empty($our_coupons)) {
			foreach ($applied_coupons as $key => $value) {
				if (!isset($our_coupons[$key]))
					continue;
				$coupon = $our_coupons[$key];
				$campaign_id = $coupon['id'];
				if (!isset($discount_breakdown[$campaign_id]))
					$discount_breakdown[$campaign_id] = array(
						'title' => $coupon['title'],
						'old_price' => 0,
						'discount' => 0
					);
				$discount_breakdown[$campaign_id]['old_price'] = $discount_breakdown[$campaign_id]['old_price'] + $coupon['old_price'];
				$discount_breakdown[$campaign_id]['discount'] = $discount_breakdown[$campaign_id]['discount'] + $value;
			}
		}

		// Save the entire breakdown array to a single meta key on the order.
		$order->update_meta_data('_campaignbay_discount_breakdown', $discount_breakdown);
		campaignbay_log(sprintf('Saved discount breakdown to order #%d .', $order->get_id()), 'INFO');
	}

	public function get_price_html($price_html, $product)
	{
		if (Woocommerce::product_type_is($product, 'variable')) {
			return $price_html;
		}
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');

		if (!is_array($meta) || empty($meta) || !$meta['on_discount'] || !isset($meta['simple']))
			return Woocommerce::get_price_html(
				$price_html,
				$product,
				Woocommerce::get_product_regular_price($product),
				$product->get_price(),
				false
			);
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
		} else
			$price_html = Woocommerce::format_price($min_price);
		if ($min_reg_price !== $max_reg_price) {
			$reg_price = wc_format_price_range($min_reg_price, $max_reg_price);
		} else
			$reg_price = Woocommerce::format_price($min_reg_price);
		if ($min_reg_price !== $min_price && $max_reg_price !== $max_price) {
			$price_html = wc_format_sale_price($reg_price, $price_html);
		}
		return $price_html;
	}

	public function cart_item_price($price_html, $cart_item, $cart_item_key)
	{
		// campaignbay_log('cart item price ' . $cart_item['data']->get_name());
		$meta = isset($cart_item['campaignbay']) ? $cart_item['campaignbay'] : null;
		if ($meta === null || !isset($meta['on_discount']) || !$meta['on_discount'])
			return $price_html;

		$base_price = $meta['base_price'];
		$price = $base_price;
		$as_reg_price = false;
		if (isset($meta['quantity'])) {
			$quantity = $meta['quantity'];
			//seting simple discount as base price
			if (isset($meta['simple']['display_as_regular_price']) && $meta['simple']['display_as_regular_price'] === true)
				$base_price = $quantity['base_price'];
			if ($quantity['settings']['apply_as'] === 'line_total') {
				$price = $quantity['price'];
			}
		} elseif (isset($meta['simple'])) {
			$price = $meta['simple']['price'];
			$as_reg_price = $meta['simple']['display_as_regular_price'];
			$base_price = $meta['base_price'];
		} else
			return $price_html;
		$price_html = Woocommerce::get_price_html(
			$price_html,
			$cart_item['data'],
			$base_price,
			$price,
			$as_reg_price
		);
		return $price_html;
	}
	public function cart_item_subtotal($price_html, $cart_item, $cart_item_key)
	{

		$meta = isset($cart_item['campaignbay']) ? $cart_item['campaignbay'] : null;
		if ($meta === null || !isset($meta['on_discount']) || !$meta['on_discount'])
			return $price_html;

		$base_price = $meta['base_price'];
		$price = $base_price;

		$as_reg_price = false;

		if (isset($meta['quantity'])) {
			$quantity = $meta['quantity'];
			//seting simple discount as base price
			if (isset($meta['simple']['display_as_regular_price']) && $meta['simple']['display_as_regular_price'] === true)
				$base_price = $quantity['base_price'];
			if ($quantity['settings']['apply_as'] === 'line_total') {
				$price = $quantity['price'];
			}
		} elseif (isset($meta['simple'])) {
			$price = $meta['simple']['price'];
			$as_reg_price = $meta['simple']['display_as_regular_price'];
		}
		if (isset($meta['bogo']['free_quantity'])) {

			$quantity = $cart_item['quantity'];
			$sub_total = $price * $quantity;
			$free_quantity = $meta['bogo']['free_quantity'];
			$discount = Woocommerce::round(($sub_total / $quantity) * $free_quantity);
			$sub_total -= $discount;

			$price_html = Woocommerce::get_price_html(
				$price_html,
				$cart_item['data'],
				$base_price * $cart_item['quantity'],
				$sub_total,
				$as_reg_price
			);
			return $price_html;
		}

		$price_html = Woocommerce::get_price_html(
			$price_html,
			$cart_item['data'],
			$base_price * $cart_item['quantity'],
			$price * $cart_item['quantity'],
			$as_reg_price
		);
		return $price_html;
	}

	public function cart_item_name($name, $cart_item, $cart_item_key)
	{
		$meta = $cart_item['campaignbay'];
		if (isset($meta['quantity_next_tier'])) {
			$message = Helper::get_quantity_message($meta['quantity_next_tier']);
			if ($message !== '' || $message !== null)
				$name .= '<br/><span>' . $message . '</span>';
		}
		if (
			isset($meta['is_bogo']) &&
			$meta['is_bogo'] === true &&
			isset($meta['bogo'])
		) {
			$message = Helper::get_bogo_cart_message($meta['bogo']);
			$location = $meta['bogo']['settings']['bogo_cart_message_location'];
			if ($message !== '' || $message !== null) {
				if ($location === 'line_item_name')
					$name .= '<br/><span>' . $message . '</span>';
				// elseif ($location === 'notice')
				// 	Woocommerce::wc_add_notice($message, 'success');
			}
		}
		return $name;
	}


	public function is_on_sale($is_on_sale, $product)
	{
		if ($is_on_sale)
			return $is_on_sale;

		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		if (is_array($meta) && !empty($meta) && isset($meta['is_on_sale']) && $meta['is_on_sale'] === true)
			return true;

		$quantity_tiers = Helper::get_quantity_tiers_with_campaign($product);
		if (!empty($quantity_tiers))
			return true;
		return $is_on_sale;
	}


	public function display_product_discount_message()
	{
		global $product;
		if (!$product)
			return;
		Helper::render_product_bogo_message($product);
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		if (!is_array($meta) || empty($meta) || !$meta['on_discount'] || !isset($meta['simple']))
			return;

		if (isset($meta['simple']['display_as_regular_price']) && $meta['simple']['display_as_regular_price'] === true)
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
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		$price = $meta['base_price'];
		if ($this->settings['cart_allowCampaignStacking']) {
			if (isset($meta['simple']) && $meta['is_simple'] === true && isset($meta['simple']['price']))
				$price = $meta['simple']['price'];
		}
		$tiers = Helper::get_quantity_tiers_with_campaign($product);
		$tiers = Helper::get_unique_quantity_tiers($tiers, $price);
		if (empty($tiers))
			return;

		//  escaping just before echo
		Helper::generate_quantity_table($tiers);

		return;
	}


	public function after_cart_item_quantity_update($cart_item_key, $quantity, $old_quantity, $cart)
	{
		if (!did_action('woocommerce_before_calculate_totals')) {

			// add to cart message for prduct page goes here
			// campaignbay_log(' after_cart_item_quantity_update');
		}
	}

	public function before_calculate_totals($cart)
	{
		$this->coupons = CartDiscount::calculate_cart_discount($cart);
		$this->calculated_totals = true;
		$discount_breakdown = $cart->campaignbay_discount_breakdown ?? array();
		if (is_array($discount_breakdown) && !empty($discount_breakdown))
			$this->discount_applied = true;
	}

	public function after_calculate_totals($cart)
	{

		if (isset($cart->cart_contents) && !empty($cart->cart_contents)) {
			foreach ($cart->cart_contents as $key => $cart_item) {
				$quantity = $cart_item['quantity'];

				$meta = isset($cart_item['campaignbay']) ? $cart_item['campaignbay'] : null;
				if ($meta === null || !isset($meta['is_bogo']) || !isset($meta['bogo']['free_quantity']))
					continue;
				if (isset($meta['bogo']['free_quantity'])) {

					$free_quantity = $meta['bogo']['free_quantity'];
					$cart->set_quantity($key, $quantity + $free_quantity, false);

					$price = (float) $cart_item['line_total'] / $quantity;

					$campaign_id = $meta['bogo']['id'];
					if (!isset($cart->campaignbay_discount_breakdown[$campaign_id]))
						$cart->campaignbay_discount_breakdown[$campaign_id] = array(
							'title' => $meta['bogo']['title'],
							'old_price' => 0,
							'discount' => 0
						);
					$cart->campaignbay_discount_breakdown[$campaign_id]['old_price'] = $cart->campaignbay_discount_breakdown[$campaign_id]['old_price'] + (($quantity + $free_quantity) * $price);
					$cart->campaignbay_discount_breakdown[$campaign_id]['discount'] = $cart->campaignbay_discount_breakdown[$campaign_id]['discount'] + ($free_quantity * $price);
				}

			}
		}
		Helper::set_cart_session($cart);
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
		} elseif ($this->calculated_totals === false && is_string($coupon_code) && strlen($coupon_code) >= 11 && substr($coupon_code, 0, 11) === 'campaignbay') {
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
		if (!$this->settings['cart_allowWcCouponStacking'] && $this->discount_applied) {
			return false;
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