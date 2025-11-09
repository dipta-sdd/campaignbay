<?php

namespace WpabCampaignBay\Engine;

use WC_Product;
use WP_Error;
use WpabCampaignBay\Core\Common;
use WpabCampaignBay\Engine\CampaignManager;
use WpabCampaignBay\Helper\Helper;
use WpabCampaignBay\Helper\Woocommerce;

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
class CartDiscount
{

	/**
	 * checking cart_allow_campaign_stacking
	 * 
	 * @since 1.0.0
	 * @return bool
	 */
	public static function cart_allow_campaign_stacking()
	{
		$settings = Common::get_instance()->get_settings();
		if (!isset($settings['cart_allowCampaignStacking']) || $settings['cart_allowCampaignStacking'] === null)
			return true;
		return $settings['cart_allowCampaignStacking'];
	}

	/**
	 * Summary of calculate_cart_discount
	 * 
	 * @since 1.0.0
	 * @param Cart $cart
	 * @return array
	 */
	public static function calculate_cart_discount($cart)
	{
		return self::calculate_discounts($cart);
	}

	/**
	 * Summary of calculate_discounts
	 * 
	 * @since 1.0.0
	 * @param Cart $cart
	 * @return array
	 */
	public static function calculate_discounts($cart = null)
	{
		/**
		 * Fires before any of CampaignBay's cart discount calculations begin.
		 *
		 * This is the primary entry point for a Pro version or third-party add-on to
		 * run its own complete set of cart discount rules. An add-on can use this hook
		 * to calculate its own discounts and add them to a custom property on the $cart object
		 * before the Free version's logic starts.
		 *
		 * @param \WC_Cart $cart The main WooCommerce cart object.
		 */
		do_action('campaignbay_before_cart_discount_calculation', $cart);

		$cart->campaignbay = array(
			'coupon' => array(),
			'fee' => array()
		);
		$discount_breakdown = array();
		if (isset($cart->cart_contents) && !empty($cart->cart_contents)) {
			foreach ($cart->cart_contents as $key => $cart_item) {
				$meta = self::get_cart_discount($cart_item);
				$simple_applied = false;
				$cart_quantity = $cart_item['quantity'];

				/**
				 * Fires just before the discount logic is processed for a single cart item.
				 *
				 * This allows an add-on to perform specific actions or modify the item's
				 * metadata (`$meta`) before the standard Quantity or BOGO rules are checked.
				 * For example, a Pro version could use this to apply a "Free Gift" flag
				 * to this specific cart item.
				 *
				 * @param array    $cart_item        The cart item being processed.
				 * @param int      $cart_quantity    The quantity of the item in the cart.
				 * @param array    $meta             The pre-calculated CampaignBay metadata for this item.
				 * @param \WC_Cart $cart             The main WooCommerce cart object.
				 * @param string   $key              The unique key for the cart item.
				 */
				do_action('campaignbay_before_cart_single_discount_calculation', $cart_item, $cart_quantity, $meta, $simple_applied, $discount_breakdown, $cart, $key);

				if ($meta === null)
					continue;

				if (isset($meta['bogo']) && isset($meta['bogo']['need_to_add']) && $meta['bogo']['settings']['auto_add_free_product'] === true) {
					// auto adding free product
					$cart_quantity += $meta['bogo']['need_to_add'];
					$cart->set_quantity($key, $cart_quantity, false);

					// correcting meta
					$meta['bogo']['free_quantity'] = $meta['bogo']['free_quantity'] + $meta['bogo']['need_to_add'];
					$meta['bogo']['need_to_add'] = 0;
				}


				if (isset($meta['bogo']) && isset($meta['bogo']['free_quantity'])) {

					$cart_quantity -= $meta['bogo']['free_quantity'];
					$cart_quantity = max($cart_quantity, 0);
					$cart->set_quantity($key, $cart_quantity, false);

				}



				$cart->cart_contents[$key]['campaignbay'] = $meta;
				if (isset($meta['simple']) && isset($meta['simple']['price'])) {
					$simple_applied = true;
					if ($meta['simple']['display_as_regular_price']) {
						$cart->cart_contents[$key]['data']->set_regular_price($meta['simple']['price']);
					} else {
						$cart->cart_contents[$key]['data']->set_regular_price($meta['base_price']);
					}
					$cart->cart_contents[$key]['data']->set_price($meta['simple']['price']);
				}

				if (
					isset($meta['quantity']) && (
						(self::cart_allow_campaign_stacking() || !isset($meta['simple'])) ||
						$meta['quantity']['price'] < $meta['simple']['price']
					)
				) {
					wpab_campaignbay_log('have quantity discount');
					// campaign stacking not allowed
					if (!self::cart_allow_campaign_stacking()) {
						// seting orginal price as base price
						wpab_campaignbay_log('seting orginal price as base price : ' . $meta['quantity']['base_price']);
						$cart->cart_contents[$key]['data']->set_regular_price($meta['quantity']['base_price']);
						$simple_applied = false;
					}
					wpab_campaignbay_log('setting quantity discount price : ' . $meta['quantity']['price']);
					$cart->cart_contents[$key]['data']->set_price($meta['quantity']['base_price']);
					$apply_as = $meta['quantity']['settings']['apply_as'] ?? 'line_total';
					if ($apply_as === 'line_total') {
						$cart->cart_contents[$key]['data']->set_price($meta['quantity']['price']);
					} elseif ($apply_as === 'coupon') {
						$data_to_add = array(
							'id' => $meta['quantity']['id'],
							'old_price' => $cart_quantity * $meta['quantity']['base_price'],
							'product_id' => $cart_item['data']->get_id(),
							'type' => $meta['quantity']['type'] === 'percentage' ? 'percent' : 'fixed_product',
							'title' => $meta['quantity']['title']
						);
						$data_to_add['discount'] = $meta['quantity']['value'];
						if ($meta['quantity']['type'] !== 'percentage')
							$data_to_add['discount'] = $meta['quantity']['discount'] * $cart_quantity;

						self::add_data(
							$cart,
							$data_to_add
						);
					} else {
						self::add_fee($cart, array(
							'id' => $meta['quantity']['id'],
							'title' => $meta['quantity']['title'],
							'discount' => $meta['quantity']['discount'] * $cart_quantity
						));
					}

					if ($apply_as !== 'coupon') {
						$campaign_id = $meta['quantity']['id'];
						if (!isset($discount_breakdown[$campaign_id]))
							$discount_breakdown[$campaign_id] = array(
								'title' => $meta['quantity']['title'],
								'old_price' => 0,
								'discount' => 0
							);
						$discount_breakdown[$campaign_id]['old_price'] = $discount_breakdown[$campaign_id]['old_price'] + ($cart_quantity * $meta['quantity']['base_price']);
						$discount_breakdown[$campaign_id]['discount'] = $discount_breakdown[$campaign_id]['discount'] + ($cart_quantity * $meta['quantity']['discount']);
					}

				}

				if ($simple_applied && isset($meta['simple'])) {

					$campaign_id = $meta['simple']['campaign'];
					if (!isset($discount_breakdown[$campaign_id]))
						$discount_breakdown[$campaign_id] = array(
							'title' => $meta['simple']['campaign_title'],
							'old_price' => 0,
							'discount' => 0
						);
					$discount_breakdown[$campaign_id]['old_price'] = $discount_breakdown[$campaign_id]['old_price'] + ($cart_quantity * $meta['base_price']);
					$discount_breakdown[$campaign_id]['discount'] = $discount_breakdown[$campaign_id]['discount'] + ($cart_quantity * $meta['simple']['discount']);
				}

				/**
				 * Fires just after the discount logic is processed for a single cart item.
				 *
				 * This allows an add-on to perform specific actions or modify the item's
				 * metadata (`$meta`) after the standard Quantity or BOGO rules are checked.
				 * For example, a Pro version could use this to apply a "Free Gift" flag
				 * to this specific cart item.
				 *
				 * @param array    $cart_item        The cart item being processed.
				 * @param int      $cart_quantity    The quantity of the item in the cart.
				 * @param array    $meta             The pre-calculated CampaignBay metadata for this item.
				 * @param \WC_Cart $cart             The main WooCommerce cart object.
				 * @param string   $key              The unique key for the cart item.
				 */
				do_action('campaignbay_before_cart_single_discount_calculation', $cart_item, $cart_quantity, $meta, $simple_applied, $discount_breakdown, $cart, $key);

			}
		}

		/**
		 * Filters the discount breakdown array for a single cart item after it
		 * has been calculated.
		 *
		 * This allows an add-on to modify the discount details for a specific item
		 * before the final cart-wide breakdown is assembled. For example, a Pro
		 * version could add a "Free Gift" entry to the breakdown for this item.
		 *
		 * @param array    $discount_breakdown The current discount breakdown for the entire cart.
		 * @param array    $cart_item          The cart item being processed.
		 * @param array    $meta               The CampaignBay metadata for this item.
		 * @param \WC_Cart $cart               The main WooCommerce cart object.
		 * @param string   $key                The unique key for the cart item.
		 *
		 * @return array The modified discount breakdown.
		 */
		$cart->campaignbay_discount_breakdown = apply_filters('campaignbay_discount_breakdown', $discount_breakdown ?? array(), $cart);

		foreach ($cart->campaignbay['coupon'] as $key => $coupon) {
			self::apply_fake_coupons($key, $cart);
		}

		foreach ($cart->campaignbay['fee'] as $key => $fee) {
			$cart->add_fee($fee['title'], $fee['discount'] * -1);
		}
		/**
		 * Fires after all CampaignBay discount calculations are complete and have been
		 * applied to the cart as either coupons or fees.
		 *
		 * This is the final hook in the calculation sequence. It's useful for add-ons
		 * that need to perform a final action based on the fully discounted cart, such
		 * as updating a session variable or triggering a third-party analytics event.
		 *
		 * @param \WC_Cart $cart The fully processed WooCommerce cart object.
		 */
		do_action('campaignbay_after_cart_discount_calculation', $cart, );

		return $cart->campaignbay['coupon'];
	}


	public static function get_cart_discount($cart_item)
	{
		/**
		 * Fires after the free version has calculated all its discount metadata for a single cart item.
		 *
		 * This action hook allows a Pro version or other extensions to inspect the discount data
		 * calculated by the free version for a specific item in the cart. It can be used to
		 * log data or to trigger other actions based on the discounts found.
		 *
		 * @since 1.1.0
		 *
		 * @param array $cart_item The complete cart item array from WooCommerce.
		 * @param array $meta      The discount metadata array calculated by CampaignBay, including
		 *                         'simple', 'quantity', 'bogo', etc.
		 */
		do_action('campaignbay_before_cart_discount_data', $cart_item);
		$product = $cart_item['data'];
		$tiers = Helper::get_quantity_tiers_with_campaign($product);
		$meta = Woocommerce::get_product($product->get_id())->get_meta('campaignbay');
		$meta['is_quantity'] = false;
		$base_price = $meta['base_price'];
		$quantity = $cart_item['quantity'];
		if (self::cart_allow_campaign_stacking()) {
			if (isset($meta['simple']) && $meta['is_simple'] === true && isset($meta['simple']['price']))
				$base_price = $meta['simple']['price'];
		}

		$tiers = Helper::get_unique_quantity_tiers($tiers, $base_price);
		$current_tier = null;
		$next_tier = null;
		foreach ($tiers as $key => $tier) {
			if (($current_tier === null || $current_tier['price'] > $tier['price']) && $tier['min'] <= $quantity && $tier['max'] >= $quantity) {
				$current_tier = $tier;
				$next_tier = null;
			} elseif (($current_tier === null || ($current_tier['min'] < $tier['min'] && $current_tier['price'] > $tier['price'])) && $next_tier === null && $tier['min'] > $quantity) {
				$next_tier = $tier;
			}
		}

		if ($current_tier !== null) {
			$meta['on_discount'] = true;
			$meta['is_quantity'] = true;
			$meta['quantity'] = array(
				'id' => $current_tier['id'],
				'title' => $current_tier['title'],
				'settings' => $current_tier['settings'],
				'price' => $current_tier['price'],
				'discount' => (float) $base_price - $current_tier['price'],
				'base_price' => $base_price,
				'type' => $current_tier['type'],
				'value' => $current_tier['value']
			);
		}
		if ($next_tier !== null) {
			$meta['quantity_next_tier'] = array(
				'settings' => $next_tier['settings']['cart_quantity_message_format'] ?? '',
				'remaining' => $next_tier['min'] - $quantity,
				'type' => $next_tier['type'],
				'value' => $next_tier['value']
			);
		}


		/**===================================
		 *=========== bogo discount ==========
		 *==================================*/
		$bogo_meta = Helper::get_bogo_meta($product, $quantity);
		if ($bogo_meta !== null || !empty($bogo_meta)) {
			if ($bogo_meta["is_bogo"])
				$meta['on_discount'] = true;
			$meta['is_bogo'] = $bogo_meta['is_bogo'];
			if (isset($bogo_meta['bogo']))
				$meta['bogo'] = $bogo_meta['bogo'];
		}

		/**
		 * Fires after the free version has calculated all its discount metadata for a single cart item.
		 *
		 * This action hook allows a Pro version or other extensions to inspect the discount data
		 * calculated by the free version for a specific item in the cart. It can be used to
		 * log data or to trigger other actions based on the discounts found.
		 *
		 * @since 1.1.0
		 *
		 * @param array $cart_item The complete cart item array from WooCommerce.
		 * @param array $meta      The discount metadata array calculated by CampaignBay, including
		 *                         'simple', 'quantity', 'bogo', etc.
		 */
		do_action('campaignbay_after_cart_discount_data', $cart_item, $meta);

		/**
		 * Filters the final discount metadata array for a single cart item before it is returned.
		 *
		 * This is the primary hook for a Pro version to add its own discount data or
		 * modify the data calculated by the free version. For example, a Pro feature
		 * like "Free Gift" could add its own data to the `$meta` array here, which
		 * would then be processed by the main cart calculation engine.
		 *
		 * @since 1.1.0
		 *
		 * @param array $meta      The discount metadata array calculated by CampaignBay.
		 * @param array $cart_item The complete cart item array from WooCommerce.
		 *
		 * @return array The potentially modified metadata array.
		 */
		return apply_filters('campaignbay_get_cart_discount', $meta, $cart_item);
	}


	public static function add_data($cart, $data = array())
	{
		if ($data['type'] === 'percent') {
			$code = 'campaignbay_' . $data['id'] . '_' . $data['discount'];

			if (!isset($cart->campaignbay['coupon'][$code]))
				$cart->campaignbay['coupon'][$code] = array(
					'id' => $data['id'],
					'old_price' => 0,
					'title' => $data['title'],
					'type' => $data['type'],
					'product_ids' => array(),
					'discount' => $data['discount'],
				);
			$cart->campaignbay['coupon'][$code]['product_ids'][] = $data['product_id'];
			$cart->campaignbay['coupon'][$code]['old_price'] = $cart->campaignbay['coupon'][$code]['old_price'] + $data['old_price'];
		} else {
			$code = 'campaignbay_' . $data['id'] . '_' . $data['product_id'];
			$cart->campaignbay['coupon'][$code] = array(
				'id' => $data['id'],
				'old_price' => $data['old_price'],
				'title' => $data['title'],
				'type' => $data['type'],
				'discount' => $data['discount'],
				'product_ids' => $data['product_id'],
			);
		}
	}

	public static function apply_fake_coupons($coupon_code, $cart)
	{
		// $coupon_code = apply_filters('woocommerce_coupon_code', $coupon_code);
		if (is_object($cart) && method_exists($cart, 'has_discount')) {
			if (!$cart->has_discount($coupon_code)) {
				if ($cart->applied_coupons) {
					foreach ($cart->applied_coupons as $code) {
						$coupon = new \WC_Coupon($coupon_code);
						if ($coupon->get_individual_use() == true) {
							return false;
						}
					}
				}
				$cart->applied_coupons[] = $coupon_code;
				return true;
			}

		}
	}

	public static function add_fee($cart, $data)
	{
		$code = 'campaignbay_' . $data['id'];
		if (!isset($cart->campaignbay['fee'][$code]))
			$cart->campaignbay['fee'][$code] = array(
				'title' => $data['title'],
				'discount' => 0,
			);
		$cart->campaignbay['fee'][$code]['discount'] += $data['discount'];

	}

}