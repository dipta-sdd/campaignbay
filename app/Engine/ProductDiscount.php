<?php

namespace WpabCb\Engine;

use WC_Product;
use WP_Error;
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
class ProductDiscount
{

	private $settings = array();

	private $product = null;

	private $campaigns = array();

	private $data = array();

	/**
	 * Private constructor to prevent direct instantiation.
	 * Use the static `create()` method instead.
	 *
	 * @since 1.0.0
	 * @param WC_Product $product The product object to be processed.
	 */
	private function __construct(WC_Product $product)
	{
		$this->product = $product;
		$this->settings = Common::get_instance()->get_settings();
		$this->campaigns = CampaignManager::get_instance()->get_active_campaigns();
	}

	/**
	 * Static factory method to begin the processing chain.
	 *
	 * This is the entry point. It creates an instance of the processor for a given product.
	 *
	 * @since 1.0.0
	 * @param WC_Product|int $product The product object or product ID.
	 * @return self|null Returns a new instance for chaining, or null if the product is invalid.
	 */
	public static function create($product)
	{
		if (is_numeric($product)) {
			$product = wc_get_product($product);
		}

		if (!$product instanceof WC_Product) {
			// Return null or a dummy object if the product is invalid to prevent fatal errors.
			return null;
		}

		return new self($product);
	}


	/**
	 * Calculates and applies the best discount to the product object.
	 *
	 * This is the main "worker" method. It loops through campaigns, finds the best
	 * price, sets the sale price on the product object, and attaches custom
	 * metadata about the discount.
	 *
	 * @since 1.0.0
	 * @return self Returns the instance to allow for further chaining.
	 */
	public function apply_discounts()
	{
		$original_price = (float) Woocommerce::get_product_regular_price($this->product);
		$base_price = (float) Woocommerce::get_product_base_price($this->product);
		$best_price = null;
		$applied_campaign = null;
		$this->data = array(
			'original_price' => $original_price,
			'base_price' => $base_price,
			'on_discount' => false,
			'is_on_sale' => false,
		);

		foreach ($this->campaigns as $campaign) {
			if (!$campaign->is_applicable_to_product($this->product)) {
				continue;
			}
			$new_price = $this->get_discounted_price($base_price, $campaign);
			if ($this->is_better_price($new_price, $best_price)) {
				$best_price = $new_price;
				$applied_campaign = $campaign;
				error_log('_____');
			}
		}
		if ($applied_campaign !== null) {
			error_log(print_r($applied_campaign->get_settings(), true));
			$this->data['on_discount'] = true;
			$this->data['is_simple'] = true;
			$simple = array();
			$simple['applied_campaign'] = $applied_campaign->get_id();
			$simple['applied_campaign_title'] = $applied_campaign->get_title();
			$simple['discounted_price'] = $best_price;
			$simple['message_format'] = $applied_campaign->get_settings()['message_format'] ?? '';
			$simple['value'] = $applied_campaign->get_discount_value() ?? null;
			$simple['type'] = $applied_campaign->get_discount_type() ?? null;
			$simple['display_as_regular_price'] = $applied_campaign->get_settings()['display_as_regular_price'] ?? false;
			$this->data['simple'] = $simple;
			// add on sale badge
			if (!$simple['display_as_regular_price'])
				$this->data['is_on_sale'] = true;
		}
		$this->product->add_meta_data('campaignbay', $this->data, true);
		return $this;
	}

	/**
	 * Returns the final, modified product object.
	 *
	 * @since 1.0.0
	 * @return WC_Product The processed product object.
	 */
	public function get_product()
	{
		return $this->product;
	}

	/**
	 * Calculates the discounted price for a single campaign.
	 * This method acts as a dispatcher, calling the correct calculation logic based on the campaign type.
	 *
	 * @since 1.0.0
	 * @param float   $base_price The base price before discount.
	 * @param object  $campaign The campaign object.
	 * @return float The final discounted price for this campaign.
	 */
	public function get_discounted_price($base_price, $campaign)
	{
		do_action('campaignbay_before_calculate_discounted_price', $campaign, $this->product, $base_price);

		$final_price = $base_price;
		if ($campaign->get_type() === 'scheduled') {
			$final_price = $this->calculate_scheduled_price($campaign, $base_price);
		}

		do_action('campaignbay_after_calculate_discounted_price', $campaign, $this->product, $final_price, $base_price);

		return Woocommerce::round($final_price);
	}

	/**
	 * Handles the price calculation for "scheduled" type campaigns.
	 * This is a sub-dispatcher that checks for percentage or fixed discounts.
	 *
	 * @since 1.0.0
	 * @param object $campaign The campaign object.
	 * @param float  $base_price The price before discount.
	 * @return float The calculated price.
	 */
	public function calculate_scheduled_price($campaign, $base_price)
	{
		$discount_type = $campaign->get_discount_type();
		$discount_value = $campaign->get_discount_value();
		$calculated_price = $base_price;

		if ($discount_type === 'percentage') {
			$calculated_price = $this->calculate_percentage_price($base_price, $discount_value);
		} elseif ($discount_type === 'fixed') {
			$calculated_price = $this->calculate_fixed_price($base_price, $discount_value);
		}

		return $calculated_price;
	}

	/**
	 * Calculates a price based on a fixed amount discount.
	 *
	 * @since 1.0.0
	 * @param float $base_price The price before discount.
	 * @param float $discount_value The fixed amount to subtract.
	 * @return float The final price, ensuring it's not below zero.
	 */
	public function calculate_fixed_price($base_price, $discount_value)
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
	public function calculate_percentage_price($base_price, $discount_value)
	{
		$discount_amount = ($discount_value / 100) * $base_price;
		return max(0, $base_price - $discount_amount);
	}

	public function is_better_price($new_price, $current_best_price)
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
		error_log('_____' . $setting);
		return false;
	}


}