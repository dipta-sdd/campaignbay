<?php
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

if ( ! class_exists( 'WPAB_CB_Pricing_Engine' ) ) {
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
	class WPAB_CB_Pricing_Engine {

		/**
		 * The single instance of the class.
		 *
		 * @since 1.0.0
		 * @var   WPAB_CB_Pricing_Engine
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
		 * Gets an instance of this object.
		 *
		 * @static
		 * @access public
		 * @since 1.0.0
		 * @return object
		 */
		public static function get_instance() {
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
			$this->define_hooks();
		}

		/**
		 * Defines all hooks this class needs to run using our fluent methods.
		 *
		 * @since 1.0.0
		 * @access private
		 */
		private function define_hooks() {
			$this->add_action( 'woocommerce_before_calculate_totals', 'apply_discounts', 20 );
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
			$this->hooks[] = array(
				'type'          => 'action',
				'hook'          => $hook,
				'callback'      => $callback,
				'priority'      => $priority,
				'accepted_args' => $accepted_args,
			);
		}

		/**
		 * Returns the complete array of hooks to be registered by the main loader.
		 *
		 * @since 1.0.0
		 * @return array
		 */
		public function get_hooks() {
			return $this->hooks;
		}

		/**
		 * Apply discounts to the cart.
		 * (This method remains unchanged)
		 *
		 * @since 1.0.0
		 * @param WC_Cart $cart The cart object.
		 */
		public function apply_discounts( $cart ) {
			wpab_cb_log( 'woocommerce_before_calculate_totals', 'DEBUG' );
			if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
				return;
			}
			$campaign_manager = wpab_cb_campaign_manager();
			$active_campaigns = $campaign_manager->get_active_campaigns();
			wpab_cb_log( 'active_campaigns: ', 'DEBUG' );
			wpab_cb_log( json_encode( $active_campaigns ), 'DEBUG' );
			if ( empty( $active_campaigns ) ) {
				return;
			}
			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
				$product = $cart_item['data'];
				wpab_cb_log( 'product price: ' . $product->get_price(), 'DEBUG' );

				foreach ( $active_campaigns as $campaign ) {
					if ( 'percentage' === $campaign->get_meta( 'discount_type' ) ) {
						$original_price = $product->get_price();
						$discount_value = (float) $campaign->get_meta( 'discount_value' );
						wpab_cb_log( 'discount_value: ' . $discount_value, 'DEBUG' );
						$new_price      = $original_price - ( $original_price * ( $discount_value / 100 ) );
						wpab_cb_log( 'new_price: ' . $new_price, 'DEBUG' );
						$cart_item['data']->set_price( $new_price );
					}
				}
			}
		}
	}
}

// ... (keep the wpab_cb_pricing_engine function)
if ( ! function_exists( 'wpab_cb_pricing_engine' ) ) {
	/**
	 * Returns the single instance of the Pricing Engine class.
	 *
	 * @since 1.0.0
	 * @return WPAB_CB_Pricing_Engine
	 */
	function wpab_cb_pricing_engine() {
		return WPAB_CB_Pricing_Engine::get_instance();
	}
}