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
class CartDiscount
{

	private $settings = array();

	private $campaigns = array();

	private $data = array();

	private $cart = array();

	/**
	 * Private constructor to prevent direct instantiation.
	 * Use the static `create()` method instead.
	 *
	 * @since 1.0.0
	 * @param WC_Cart $cart The cart object.
	 * @return void
	 */
	private function __construct()
	{
		$this->settings = Common::get_instance()->get_settings();
		$this->campaigns = CampaignManager::get_instance()->get_active_campaigns();
	}
	public static function calculate_cart_discount($cart)
	{
		campaignbay_log('calculate_cart_discount');
		self::$cart = $cart;
		self::calculate_discounts();
	}

	public static function calculate_discounts()
	{

	}


}