<?php

namespace WpabCb\Engine;

use WC_Product;
use WP_Error;
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
class CartDiscount
{

	public static function cart_allow_campaign_stacking()
	{
		$settings = Common::get_instance()->get_settings();
		if (!isset($settings['cart_allowCampaignStacking']) || $settings['cart_allowCampaignStacking'] === null)
			return true;
		return $settings['cart_allowCampaignStacking'];
	}

	public static function calculate_cart_discount($cart)
	{
		return self::calculate_discounts($cart);
	}

	public static function calculate_discounts($cart = null)
	{

		$cart->campaignbay = array(
			'coupon' => array(),
			'fee' => array()
		);
		if (isset($cart->cart_contents) && !empty($cart->cart_contents)) {
			foreach ($cart->cart_contents as $key => $cart_item) {
				$meta = self::get_quantity_discount($cart_item);
				// error_log(print_r($meta, true));
				if ($meta === null)
					continue;
				$cart->cart_contents[$key]['campaignbay'] = $meta;
				if (isset($meta['simple']) && isset($meta['simple']['price'])) {
					if ($meta['simple']['display_as_regular_price']) {
						$cart->cart_contents[$key]['data']->set_regular_price($meta['simple']['price']);
					} else {
						$cart->cart_contents[$key]['data']->set_regular_price($meta['base_price']);
					}
					$cart->cart_contents[$key]['data']->set_price($meta['simple']['price']);
				}
				if (isset($meta['quantity'])) {
					$cart->cart_contents[$key]['data']->set_price($meta['quantity']['base_price']);
					$apply_as = $meta['quantity']['settings']['apply_as'] ?? 'line_total';
					if ($apply_as === 'line_total') {
						$cart->cart_contents[$key]['data']->set_price($meta['quantity']['price']);
					} elseif ($apply_as === 'coupon') {
						$data_to_add = array(
							'id' => $meta['quantity']['id'],
							'product_id' => $cart_item['data']->get_id(),
							'type' => $meta['quantity']['type'] === 'percentage' ? 'percent' : 'fixed_product',
							'title' => $meta['quantity']['title']
						);
						$data_to_add['discount'] = $meta['quantity']['value'];
						if ($meta['quantity']['type'] !== 'percentage')
							$data_to_add['discount'] = $meta['quantity']['discount'] * $cart_item['quantity'];

						self::add_data(
							$cart,
							$data_to_add
						);
					} else {
						self::add_fee($cart, array(
							'id' => $meta['quantity']['id'],
							'title' => $meta['quantity']['title'],
							'discount' => $meta['quantity']['discount'] * $cart_item['quantity']
						));
					}

				}
			}
		}

		// error_log('______++++++======' . print_r($cart->campaignbay, true));
		foreach ($cart->campaignbay['coupon'] as $key => $coupon) {
			self::apply_fake_coupons($key, $cart);
		}

		foreach ($cart->campaignbay['fee'] as $key => $fee) {
			$cart->add_fee($fee['title'], $fee['discount'] * -1);
		}


		return $cart->campaignbay['coupon'];
	}

	public static function get_quantity_discount($cart_item)
	{
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
			if ($current_tier !== null && $tier['min'] > $quantity) {
				$next_tier = $tier;
				break;
			}
			if ($current_tier === null && $tier['min'] <= $quantity && $tier['max'] >= $quantity) {
				$current_tier = $tier;
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
		return $meta;
	}


	public static function add_data($cart, $data = array())
	{
		if ($data['type'] === 'percent') {
			$code = 'campaignbay_' . $data['id'] . '_' . $data['discount'];

			if (!isset($cart->campaignbay['coupon'][$code]))
				$cart->campaignbay['coupon'][$code] = array(
					'title' => $data['title'],
					'type' => $data['type'],
					'product_ids' => array(),
					'discount' => $data['discount'],
				);
			$cart->campaignbay['coupon'][$code]['product_ids'][] = $data['product_id'];
		} else {
			$code = 'campaignbay_' . $data['id'] . '_' . $data['product_id'];
			$cart->campaignbay['coupon'][$code] = array(
				'title' => $data['title'],
				'type' => $data['type'],
				'discount' => $data['discount'],
				'product_ids' => $data['product_id'],
			);
		}
		// error_log('add_data' . print_r($cart->campaignbay['coupon'][$code], true));
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
				do_action('woocommerce_applied_coupon', $coupon_code);
				return true;
			}

		}
	}

	public static function add_fee($cart, $data)
	{
		// error_log('before add fee   ' . print_r($cart->campaignbay['fee'], true));
		// error_log('adding fee___' . print_r($data, true));
		$code = 'campaignbay_' . $data['id'];
		if (!isset($cart->campaignbay['fee'][$code]))
			$cart->campaignbay['fee'][$code] = array(
				'title' => $data['title'],
				'discount' => 0,
			);
		$cart->campaignbay['fee'][$code]['discount'] += $data['discount'];

		// error_log('add_fee   ' . print_r($cart->campaignbay['fee'], true));
	}

}