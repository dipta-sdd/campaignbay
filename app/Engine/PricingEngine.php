<?php

namespace WpabCb\Engine;

use WC_Product;
use \WpabCb\Engine\CampaignManager;
use WP_Error;
use WpabCb\Core\Common;

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
if ( ! defined( 'ABSPATH' ) ) {
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
class PricingEngine {

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   CAMPAIGNBAY_Pricing_Engine
	 * @access private
	 */
	private static $instance = null;

	/**
	 * The array of hooks to be registered.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var array
	 */
	private $hooks = array();

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
	 * Gets an instance of this object.
	 *
	 * @static
	 * @access public
	 * @since 1.0.0
	 * @return object
	 */
	public static function get_instance() {
		// Store the instance locally to avoid private static replication.
		static $instance = null;
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor to define and build the hooks array.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {

		$this->settings = Common::get_instance()->get_settings();

		if($this->settings['global_enableAddon']){
			$this->define_hooks();
		}
	}

	/**
	 * Defines all hooks this class needs to run.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function define_hooks() {

		// $default_priority = campaignbay_get_options('global_defaultPriority') ?? 10;

		// $enabled_plugin = campaignbay_get_options('global_enableAddon');
		// if(!$enabled_plugin){
		// 	return;
		// }
		// /**
		//  * load the product summary hook
		//  * priority 9 is the last hook before the price html hook
		//  * cannot use $default_priority
		//  */

		// $this->add_action( 'woocommerce_single_product_summary', 'action_single_product_summary', 9, 0 );
		// // load the price html hook
		// $this->add_filter( 'woocommerce_get_price_html', 'display_discounted_price_html', $default_priority, 2);
		// // load the price html hook
		// $this->add_filter( 'woocommerce_variable_price_html', 'display_variable_price_html', $default_priority, 3);

		// $this->add_filter( 'woocommerce_variation_prices', 'filter_variation_prices', $default_priority, 2);

		// // load the product is on sale hook
		// $this->add_filter( 'woocommerce_product_is_on_sale', 'filter_is_product_on_sale', $default_priority, 2);

		// // load the before calculate totals hook
		// $this->add_action( 'woocommerce_before_calculate_totals', 'apply_discounts_and_prepare_notices', $default_priority, 1 );

		// $this->add_action( 'woocommerce_after_calculate_totals', 'cart_after_calculate_totals', $default_priority, 1 );

		

		// // Conditionally add the hook for inline "add more" notices in the cart, based on settings.
		// if( campaignbay_get_options('cart_showNextDiscountBar') ){
		// 	$this->add_filter( 'woocommerce_after_cart_item_name', 'display_inline_cart_notice', $default_priority, 2 );
		// }

		// // Cart item hooks for formatting the price and subtotal columns.
		// $this->add_filter( 'woocommerce_cart_item_price', 'display_cart_item_price', $default_priority, 3);
		// $this->add_filter( 'woocommerce_cart_item_subtotal', 'display_cart_item_subtotal', $default_priority, 3);


		// // product variation single variation hooks
		// $this->add_filter( 'woocommerce_variation_prices_price', 'filter_variation_prices_price', $default_priority, 3);
		// $this->add_filter( 'woocommerce_variation_prices_regular_price', 'filter_variation_prices_regular_price', $default_priority, 3);
		// $this->add_filter( 'woocommerce_variation_prices_sale_price', 'filter_variation_prices_sale_price', $default_priority, 3);

		// // save the discount breakdown to the order meta
		// $this->add_action( 'woocommerce_checkout_create_order', 'save_discount_breakdown_to_order_meta', $default_priority, 2 );
		// $this->add_action( 'woocommerce_store_api_checkout_update_order_meta', 'save_discount_breakdown_to_order_meta', $default_priority, 1 );

		// // prevent coupon stacking
		// if( ! campaignbay_get_options('cart_allowWcCouponStacking') ){
		// 	$this->add_action( 'woocommerce_coupon_is_valid_for_product', 'prevent_coupon_stacking_to_product', $default_priority, 4 );
		// }

	}

	
	
	
	/**
	 * Adds a new action or filter to the hooks array.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param string $type 'action' or 'filter'.
	 * @param string $hook The hook name.
	 * @param string $callback The callback method on this object.
	 * @param int    $priority The priority.
	 * @param int    $accepted_args The number of accepted arguments.
	 */
	private function add_hook( $type, $hook, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->hooks[] = array(
			'type'          => $type,
			'hook'          => $hook,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args,
		);
	}

	/**
	 * Adds a new action to the hooks array.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param string $hook The hook name.
	 * @param string $callback The callback method on this object.
	 * @param int    $priority The priority.
	 * @param int    $accepted_args The number of accepted arguments.
	 */
	private function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->add_hook( 'action', $hook, $callback, $priority, $accepted_args );
	}

	/**
	 * Adds a new filter to the hooks array.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param string $hook The hook name.
	 * @param string $callback The callback method on this object.
	 * @param int    $priority The priority.
	 * @param int    $accepted_args The number of accepted arguments.
	 */
	private function add_filter( $hook, $callback, $priority = 10, $accepted_args = 2 ) {
		$this->add_hook( 'filter', $hook, $callback, $priority, $accepted_args );
	}


	/**
	 * Returns the complete array of hooks to be registered by the main loader.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return array
	 */
	public function get_hooks() {
		return $this->hooks;
	}


}