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
			if ( null === self::$instance ) {
				$instance = new self();
			}
			return $instance;
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
		 * Defines all hooks this class needs to run.
		 *
		 * @since 1.0.0
		 * @access private
		 */
		private function define_hooks() {
			$this->add_action( 'woocommerce_before_calculate_totals', 'apply_discounts_to_cart', 20 );
			$this->add_filter( 'woocommerce_get_price_html', 'display_discounted_price_html', 100, 2 );
		}

		/**
		 * Adds a new action or filter to the hooks array.
		 *
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
		private function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
			$this->add_hook( 'action', $hook, $callback, $priority, $accepted_args );
		}
		private function add_filter( $hook, $callback, $priority = 10, $accepted_args = 2 ) {
			$this->add_hook( 'filter', $hook, $callback, $priority, $accepted_args );
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
		 * Master calculation method. Gets all applicable discounts for a product, using the cache if available.
		 *
		 * This function serves as the single source of truth for a product's potential discounts.
		 * It categorizes discounts into 'simple' (direct price changes), 'bogo', and 'quantity',
		 * and finds the single best 'simple' discount while collecting all others.
		 *
		 * @since 1.0.0
		 * @param WC_Product $product The product object.
		 * @return array An array containing all applicable discount information, structured by type.
		 */
		public function get_or_calculate_product_discount( $product ) {

			
			if ( ! $product instanceof WC_Product ) {
				wpab_cb_log('Invalid product type: ' . gettype( $product ), 'ERROR' );
				return array(
					'base_price' => 0,
					'on_sale'   => false,
					'on_campaign' => false,
					'discounts'  => array(
						'simple'   => 0,
						'bogo'     => array(),
						'quantity' => array(),
						'earlybird' => array(),
					),
				);
			}
			$product_id = $product->get_id();
			if( wpab_cb_get_options('product_excludeSaleItems') && $product->is_on_sale('edit') ) {
				return array(
					'base_price' => (float) $product->get_sale_price('edit'),
					'on_sale'   => true,
					'on_campaign' => false,
					'discounts'  => array(
						'simple'   => (float) $product->get_sale_price('edit'),
						'bogo'     => array(),
						'quantity' => array(),
					),
				);
			}
			



			// 1. Check the request-level cache first for ultimate performance.
			if ( isset( $this->product_discount_cache[ $product_id ] ) ) {
				return $this->product_discount_cache[ $product_id ];
			}

			$campaign_manager = wpab_cb_campaign_manager();
			$active_campaigns = $campaign_manager->get_active_campaigns();
			$base_price       = (float) $product->get_price('edit');

			$discount_data = array(
				'base_price' => $base_price,
				'on_sale'   => false,
				'on_campaign' => false,
				'discounts'  => array(
					'simple'   => null,
					'bogo'     => array(),
					'quantity' => array(),
					'earlybird' => array(),
				),
			);

			if ( empty( $active_campaigns ) ) {
				$this->product_discount_cache[ $product_id ] = $discount_data;
				return $discount_data;
			}

			// 3. Loop through all active campaigns to categorize and evaluate them.
			foreach ( $active_campaigns as $campaign ) {
				if( ! $campaign->is_applicable_to_product( $product_id ) ) {
					wpab_cb_log('Campaign ( ' . $campaign->get_id() . ') is not applicable to product ( ' . $product->get_title() . ')', 'DEBUG');
					continue;
				}
				$discount_data['on_campaign'] = true;
				$campaign_type = $campaign->get_meta( 'campaign_type' );

				switch ( $campaign_type ) {
					case 'scheduled':
						$discount_type = $campaign->get_meta( 'discount_type' );
						$discount_value = $campaign->get_meta( 'discount_value' );
						
						if( $discount_type === 'percentage' ){
							$discount_value = $base_price * $discount_value / 100;
						}
						$discounted_price = $base_price - $discount_value;
						if( ! $discount_data['discounts']['simple'] ){
							$discount_data['discounts']['simple'] = $discounted_price;
						}
						if( 'apply_highest' === wpab_cb_get_options( 'product_priorityMethod' ) ){
							$discount_data['discounts']['simple'] = min( $discount_data['discounts']['simple'], $discounted_price );
						} else{
							$discount_data['discounts']['simple'] = max( $discount_data['discounts']['simple'], $discounted_price );
						}
						break;
					case 'earlybird':
						$discount_data['discounts']['earlybird'][] = $campaign->get_meta('campaign_tiers');
						break;
					case 'bogo':
						$discount_data['discounts']['bogo'][] = $campaign->get_meta('campaign_tiers');
						break;

					case 'quantity':
						$discount_data['discounts']['quantity'][] = $campaign->get_meta('campaign_tiers');
						break;
				}
			}

			// 4. Store the final, structured result in the cache for this page load.
			$this->product_discount_cache[ $product_id ] = $discount_data;
			return $discount_data;
		}

		/**
		 * Apply discounts to the cart by calling the master calculation method.
		 *
		 * @since 1.0.0
		 * @param WC_Cart $cart The cart object.
		 */
		public function apply_discounts_to_cart( $cart ) {
			if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
				return;
			}

			wpab_cb_log('Applying discounts to cart', 'DEBUG');

			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
				$product       = $cart_item['data'];
				$quantity      = $cart_item['quantity'];
				$discount_data = $this->get_or_calculate_product_discount( $product );

				// If there are no campaigns for this product at all, skip it.
				if ( ! $discount_data['on_campaign'] ) {
					continue;
				}

				$base_price          = $discount_data['base_price'];
				
				// If the product already has a discounted price
				$best_price_so_far = $discount_data['discounts']['simple'] ?? null;

				// --- Evaluate Quantity Discounts ---
				// Check if any quantity tier offers a better price than the best simple discount.
				if ( ! empty( $discount_data['discounts']['quantity'] ) ) {
					foreach ( $discount_data['discounts']['quantity'] as $tiers ) {
						if ( ! is_array( $tiers ) ) {
							continue;
						}
						foreach ( $tiers as $tier ) {
							// Check if the quantity in the cart fits within this tier's range.
							$min = isset( $tier['min'] ) ? (int) $tier['min'] : 0;
							$max = isset( $tier['max'] ) && '' !== $tier['max'] ? (int) $tier['max'] : PHP_INT_MAX;
	
							if ( $quantity >= $min && $quantity <= $max ) {
								wpab_cb_log('\n\nQuantity fits within this tier\'s range.', 'DEBUG');
								wpab_cb_log('Tier: ' . print_r($tier, true), 'DEBUG');
								wpab_cb_log('Quantity: ' . $quantity, 'DEBUG');
								
								$tier_value = isset( $tier['value'] ) ? (float) $tier['value'] : 0;
								$tier_type  = isset( $tier['type'] ) ? $tier['type'] : 'percentage';
								$tier_price = $base_price;
	
								if ( 'percentage' === $tier_type ) {
									$tier_value =  $base_price * $tier_value / 100 ;
								} 
								$tier_price = $base_price - $tier_value;
								
								wpab_cb_log('Tier price: ' . $tier_price, 'DEBUG');
								if( ! $best_price_so_far ){
									$best_price_so_far = $tier_price;
								}
								// If this tier's price is better, it becomes the new best price.
								if( 'apply_highest' === wpab_cb_get_options( 'product_priorityMethod' ) ){
									$best_price_so_far = min( $best_price_so_far, $tier_price );
								} else{
									$best_price_so_far = max( $best_price_so_far, $tier_price );
								}
							}
						}
					}
				}

				// --- Future Logic for BOGO and Early Bird would go here ---
				// BOGO might add a free product or a notice.
				// Early Bird might check a global counter.

				// After all checks, apply the final, best price to the cart item.
				// Ensure the price doesn't go below zero.
				$final_price = max( 0, $best_price_so_far );

				// Only set the price if it's different, to avoid unnecessary recalculations.
				if ( $final_price < $product->get_price() ) {
				    $cart_item['data']->set_price( $final_price );
				}


				// wpab_cb_log('Cart item data: ' . print_r($cart_item, true), 'DEBUG');
			}
		}

		public function add_campaign_data_to_order_items( $item, $cart_item_key, $values, $order ) {
			if ( ! empty( $values['wpab_cb_applied_campaigns'] ) ) {
				$item->add_meta_data( '_wpab_cb_campaigns', $values['wpab_cb_applied_campaigns'] );
			}
		}

		private function _calculate_simple_price( $campaign, $base_price ) {
			$discount_value = (float) $campaign->get_meta( 'discount_value' );
			if ( 'percentage' === $campaign->get_meta( 'discount_type' ) ) {
				return $base_price - ( $base_price * ( $discount_value / 100 ) );
			}
			return $base_price - $discount_value;
		}

		private function _calculate_tier_price( $tier, $base_price ) {
			$tier_value = isset( $tier['value'] ) ? (float) $tier['value'] : 0;
			if ( 'percentage' === ( $tier['type'] ?? 'percentage' ) ) {
				return $base_price - ( $base_price * ( $tier_value / 100 ) );
			}
			return $base_price - $tier_value;
		}


		/**
		 * Modify the price HTML on product/shop pages to show the discount.
		 *
		 * @since 1.0.0
		 * @param string     $price_html The original price HTML.
		 * @param WC_Product $product    The product object.
		 * @return string The modified price HTML.
		 */
		public function display_discounted_price_html( $price_html, $product ) {
			// Get the discount data for the product.
			$discount_data = $this->get_or_calculate_product_discount( $product );

			// If the product is on a campaign and the discounted price is less than the base price, show the discounted price.
			if ( $discount_data['on_campaign'] && $discount_data['discounts']['simple'] < $discount_data['base_price'] ) {
				// Get the original price HTML.	
				$original_price_html = wc_get_price_to_display( $product, array( 'price' => $product->get_regular_price() ) );
				// Get the discounted price HTML.
				$sale_price_html     = wc_get_price_to_display( $product, array( 'price' => $discount_data['discounts']['simple'] ) );
				// Format the sale price HTML.	
				$price_html = wc_format_sale_price( $original_price_html, $sale_price_html );
			}
			return $price_html;
		}
	}
}

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