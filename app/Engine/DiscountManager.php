<?php

namespace WpabCb\Engine;

use WC_Product;
use WpabCb\Engine\CampaignManager;
use WP_Error;
use WpabCb\Core\Common;

/**
 * The file that defines the DiscountManager class.
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
class DiscountManager {

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   DiscountManager
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
		$this->define_hooks();
	}

	/**
	 * Defines all hooks this class needs to run.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function define_hooks() {
		$hooks = [
			['filter' , 'campaignbay_get_product','add_discount_data', 20, 2 ],
		];
		foreach($hooks as $hook){
			$this->add_hook(...$hook);
		}
        // $this->add_hook('filter' , 'campaignbay_get_product','add_discount_data', 20, 2 );
	}

	public function add_discount_data($product, $product_id){
		$product = ProductDiscount::create($product)->apply_discounts()->get_product();
		// error_log(print_r( $product->campaignbay_data, true));
		return $product;
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