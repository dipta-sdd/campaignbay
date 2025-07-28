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
			$this->add_action( 'woocommerce_before_calculate_totals', 'apply_discounts_to_cart' );
			$this->add_filter( 'woocommerce_get_price_html', 'display_discounted_price_html');
			$this->add_filter( 'woocommerce_product_is_on_sale', 'filter_is_product_on_sale');
			$this->add_action( 'woocommerce_single_product_summary', 'action_single_product_summary', 9, 0 );
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
						'campaign_id' => null,
						'campaign_type' => null,
						'best_price'    => null,
						// Campaign specific fields , for display purposes
						'campaign_title' => null,
						'tiers' => array(),
						'discount_value' => null,
						'discount_type' => null,
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
						'campaign_id' => null,
						'campaign_type' => null,
						'best_price'    => null,
						// Campaign specific fields , for display purposes
						'campaign_title' => null,
						'tiers' => array(),
						'discount_value' => null,
						'discount_type' => null,
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
					'campaign_id' => null,
					'campaign_type' => null,
					'best_price'    => null,
					// Campaign specific fields , for display purposes
					'campaign_title' => null,
					'tiers' => array(),
					'discount_value' => null,
					'discount_type' => null,
				),
			);

			if ( empty( $active_campaigns ) ) {
				$this->product_discount_cache[ $product_id ] = $discount_data;
				return $discount_data;
			}

			// 3. Loop through all active campaigns to categorize and evaluate them.
			foreach ( $active_campaigns as $campaign ) {
				if( ! $campaign->is_applicable_to_product( $product_id ) ) {
					continue;
				}
				$campaign_type = $campaign->get_meta( 'campaign_type' );
				$discounted_price = null;
				if ( 'scheduled' === $campaign_type ) {
					$discounted_price = $this->calculate_simple_price( $campaign, $base_price );
				} elseif ( 'quantity' === $campaign_type || 'earlybird' === $campaign_type ) {
					$tiers = $campaign->get_meta('campaign_tiers');
					if ( is_array( $tiers ) && ! empty( $tiers ) ) {
						//always use the first tier for quantity and earlybird campaigns
						//later we will use sale counts for earlybird campaigns
						$discounted_price = $this->calculate_tier_price( $tiers[0], $base_price );
					}
				}

				// else if( 'bogo' === $campaign_type ){
				// 	$discounted_price = $this->calculate_bogo_price( $campaign->get_meta('campaign_tiers')[0], $base_price );
				// }
				if( $this->is_better_campaign( $discount_data['discounts']['best_price'], $discounted_price )){
					$discount_data['on_campaign'] = true;	
					$discount_data['discounts']['best_price'] = $discounted_price;
					$discount_data['discounts']['campaign_id'] = $campaign->get_id();
					$discount_data['discounts']['campaign_type'] = $campaign_type;
					$discount_data['discounts']['campaign_title'] = $campaign->get_title();
					$discount_data['discounts']['tiers'] = $campaign->get_meta('campaign_tiers');
					$discount_data['discounts']['discount_value'] = $campaign->get_meta('discount_value');
					$discount_data['discounts']['discount_type'] = $campaign->get_meta('discount_type');
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
		 * @access public
		 * @param WC_Cart $cart The cart object.
		 */
		public function apply_discounts_to_cart( $cart ) {
			if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
				return;
			}

			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
				$product       = $cart_item['data'];
				$quantity      = $cart_item['quantity'];
				$discount_data = $this->get_or_calculate_product_discount( $product );

				if ( ! $discount_data['on_campaign'] ) {
					continue;
				}

				$base_price    = $discount_data['base_price'];
				$final_price   = $discount_data['discounts']['best_price']; // Start with the pre-calculated best price.
				$campaign_type = $discount_data['discounts']['campaign_type'];

				// For tiered campaigns, we must re-evaluate the price based on the actual cart quantity.
				if ( 'quantity' === $campaign_type || 'earlybird' === $campaign_type ) {
					$tiers = $discount_data['discounts']['tiers'];
					if ( is_array( $tiers ) && ! empty( $tiers ) ) {
						$tier_price_for_quantity = null;

						foreach ( $tiers as $tier ) {
							$min = isset( $tier['min'] ) ? (int) $tier['min'] : 0;
							$max = isset( $tier['max'] ) && '' !== $tier['max'] ? (int) $tier['max'] : PHP_INT_MAX;

							if ( $quantity >= $min && $quantity <= $max ) {
								$tier_price_for_quantity = $this->calculate_tier_price( $tier, $base_price );
								break; // Found the correct tier, no need to search further.
							}
						}

						// If a specific tier was found for this quantity, that is now our final price.
						if ( null !== $tier_price_for_quantity ) {
							$final_price = $tier_price_for_quantity;
						}
					}
				}

				// --- Future BOGO Logic Placeholder ---
				if ( 'bogo' === $campaign_type ) {
					// BOGO logic will be handled here.
				}

				// After all checks, apply the final, best price to the cart item.
				$final_price = max( 0, $final_price );

				if ( $final_price < $product->get_price() ) {
					$cart_item['data']->set_price( $final_price );
				}
			}
		}

		/**
		 * Calculate the simple price for a campaign.
		 *
		 * @since 1.0.0
		 * @access private
		 * @param WPAB_CB_Campaign $campaign The campaign object.
		 * @param float       $base_price The base price of the product.
		 * @return float The calculated price.
		 */
		private function calculate_simple_price( $campaign, $base_price ) {
			$discount_value = (float) $campaign->get_meta( 'discount_value' );
			$discount_type = $campaign->get_meta( 'discount_type' );
			if ( 'percentage' === $discount_type ) {
				return $base_price - ( $base_price * ( $discount_value / 100 ) );
			}
			return $base_price - $discount_value;	
		}

		/**
		 * Calculate the price for a tier.
		 *
		 * @since 1.0.0
		 * @access private
		 * @param array     $tier The tier array.
		 * @param float     $base_price The base price of the product.
		 * @return float The calculated price.
		 */
		private function calculate_tier_price( $tier, $base_price ) {
			if( ! is_array( $tier ) || empty( $tier ) ){
				return null;
			}
			$tier_value = isset( $tier['value'] ) ? (float) $tier['value'] : 0;
			if ( 'percentage' === ( $tier['type'] ?? 'percentage' ) ) {
				return $base_price - ( $base_price * ( $tier_value / 100 ) );
			}
			return $base_price - $tier_value;
		}

		/**
		 * Check if a campaign is better than the current best campaign.
		 *
		 * @since 1.0.0
		 * @access private
		 * @param float     $best_price The current best price.
		 * @param float     $tier_price The price of the tier.
		 * @return bool True if the campaign is better, false otherwise.
		 */
		private function is_better_campaign( $best_price, $tier_price ) {
			if( ! $tier_price ){
				return false;
			}
			if( 'apply_highest' === wpab_cb_get_options( 'product_priorityMethod' ) ){
				return ! $best_price || $tier_price < $best_price ;
			}
			return ! $best_price || $tier_price > $best_price;
		}


		/**
		 * Modify the price HTML on product/shop pages to show the discount.
		 *
		 * @since 1.0.0
		 * @access public
		 * @param string     $price_html The original price HTML.
		 * @param WC_Product $product    The product object.
		 * @return string The modified price HTML.
		 */
		public function display_discounted_price_html( $price_html, $product ) {
			// Get the discount data for the product.
			$discount_data = $this->get_or_calculate_product_discount( $product );

			// Case 1: Campaign is active and provides the best price.
			if ( $discount_data['on_campaign']  ) {
				if( wpab_cb_get_options('product_showDiscountedPrice') ){
					$regular_price = (float) $product->get_regular_price( 'edit' );
					$sale_price    = (float) $discount_data['discounts']['best_price'];

					// Format the price using WooCommerce's standard sale price function.
					return wc_format_sale_price(
						wc_price( $regular_price ),
						wc_price( $sale_price )
					);
				} else{
					return wc_price( $discount_data['discounts']['best_price'] );
				}
				
			}

			// Case 3: No discounts of any kind are active. Return the original HTML.
			return $price_html;
		}


		/**
		 * Filter the product is on sale.
		 *
		 * @since 1.0.0
		 * @access public
		 * @param bool      $is_on_sale The original is on sale value.
		 * @param WC_Product $product    The product object.
		 * @return bool The modified is on sale value.
		 */
		public function filter_is_product_on_sale( $is_on_sale, $product ) {
			$discount_data = $this->get_or_calculate_product_discount( $product );
			return $is_on_sale || ( $discount_data['on_campaign']  );
		}

		/**
		 * Action to display the product summary message.
		 *
		 * @since 1.0.0
		 * @access public
		 */
		public function action_single_product_summary() {
			global $product;

			if ( ! $product instanceof WC_Product ) {
				wpab_cb_log('Invalid product type: ' . gettype( $product ), 'ERROR' );
				return;
			}
			$discount_data = $this->get_or_calculate_product_discount( $product );

			// Only show the message if our campaign is active.
			if ( $discount_data['on_campaign'] ) {
				$format = wpab_cb_get_options( 'product_messageFormat' );

				// Don't proceed if the format string is empty.
				if ( empty( $format ) ) {
					return;
				}

				$base_price = $discount_data['base_price'];
				$best_price = $discount_data['discounts']['best_price'];
				
				// Don't show if there's no actual saving.
				if ( $best_price >= $base_price ) {
					return;
				}

				$amount_off = $base_price - $best_price;
				$percentage_off = round( ( $amount_off / $base_price ) * 100 );

				$replacements = array(
					'{percentage_off}' => $percentage_off . '%',
					'{amount_off}'     => wp_strip_all_tags( wc_price( $amount_off ) ),
				);

				$message_text = str_replace( array_keys( $replacements ), array_values( $replacements ), $format );
				// Echo the final HTML with a CSS class for styling.
				echo '<div class="wpab-cb-product-save-message">' . esc_html( $message_text ) . '</div>';
			}
		}
	}


}

if ( ! function_exists( 'wpab_cb_pricing_engine' ) ) {
	/**
	 * Returns the single instance of the Pricing Engine class.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return WPAB_CB_Pricing_Engine
	 */
	function wpab_cb_pricing_engine() {
		return WPAB_CB_Pricing_Engine::get_instance();
	}
}