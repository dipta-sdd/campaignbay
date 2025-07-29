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

			// Product hooks for displaying discounts on single product pages.
			$this->add_action( 'woocommerce_single_product_summary', 'action_single_product_summary', 9, 0 );
			$this->add_filter( 'woocommerce_get_price_html', 'display_discounted_price_html');
			$this->add_filter( 'woocommerce_product_is_on_sale', 'filter_is_product_on_sale');

			// Main cart hook for all calculations.
			$this->add_action( 'woocommerce_before_calculate_totals', 'apply_discounts_and_prepare_notices' );

			// Conditionally add the hook for the discount breakdown in cart totals, based on settings.
			if( wpab_cb_get_options('cart_showDiscountBreakdown') ){
				wpab_cb_log('add_cart_discount_fee', 'DEBUG');
				$this->add_action( 'woocommerce_cart_calculate_fees', 'add_cart_discount_fee', 20, 1 );
			}

			// Conditionally add the hook for inline "add more" notices in the cart, based on settings.
			if( wpab_cb_get_options('cart_showNextDiscountBar') ){
				$this->add_filter( 'woocommerce_after_cart_item_name', 'display_inline_cart_notice', 10, 2 );
			}

			// Cart item hooks for formatting the price and subtotal columns.
			$this->add_filter( 'woocommerce_cart_item_price', 'display_cart_item_price', 10, 3);
			$this->add_filter( 'woocommerce_cart_item_subtotal', 'display_cart_item_subtotal', 10, 3);
		}




		/**
		 * Apply discounts to the cart by calling the master calculation method.
		 * This is the main function that is called when the cart is calculated.
		 * It is responsible for calculating the discounts and applying them to the cart.
		 * It is also responsible for preparing the notices that are displayed to the user.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_before_calculate_totals
		 * @param WC_Cart $cart The cart object.
		 */
		public function apply_discounts_and_prepare_notices( $cart ) {
			wpab_cb_log('woocommerce_before_calculate_totals', 'DEBUG');
			if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
				return;
			}
			// Initialize the discount breakdown array.
			// This is used to store the discount breakdown for each campaign.
			$cart->wpab_cb_discount_breakdown = array();

			// Loop through each item in the cart.
			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {

				// Initialize our custom notice key for this item.
				$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data'] = array(
					'message' => null,
					'old_price' => null,
					'new_price' => null,
				);

				$product       = $cart_item['data'];
				$quantity      = $cart_item['quantity'];
				$discount_data = $this->get_or_calculate_product_discount( $product );
				// If the product is not on a campaign, skip it.
				if ( ! $discount_data['on_campaign'] ) {
					continue;
				}

				// --- 1. Price Calculation Logic ---
				// Get the base price and the best price for the product.
				$base_price        = $discount_data['base_price'];
				$best_price = $discount_data['discounts']['best_price'];
				$campaign_type = $discount_data['discounts']['campaign_type'];

				// If the campaign is a quantity campaign, we need to calculate the price based on the quantity.
				if( $campaign_type === 'quantity' ){

					if ( ! empty( $discount_data['discounts']['tiers'] ) ) {

						// Sort the tiers by the minimum quantity.
						$tiers = $discount_data['discounts']['tiers'];
						usort($tiers, function( $a, $b ) { return (int) ( $a['min'] ?? 0 ) <=> (int) ( $b['min'] ?? 0 ); });
						
						// Initialize the current and next tier.
						$current_tier = null;
						$next_tier = null;
						// Loop through the tiers and find the current and next tier.
						foreach ( $tiers as $tier ) {
							if( (int) $tier['min']  > $quantity ){
								$next_tier = $tier;
								break;
							}
							if ( (int) $tier['max']  >= $quantity ) {
								$current_tier = $tier;
							}
						}

						// If the current tier is found, calculate the price based on the current tier.
						if( $current_tier ){
							$best_price = $this->calculate_tier_price( $current_tier, $base_price );
						}

						// If the next tier is found and the next discount bar is enabled, calculate the price based on the next tier.
						if( $next_tier && wpab_cb_get_options('cart_showNextDiscountBar') ){
							// Get the format for the next discount bar.
							$format = wpab_cb_get_options( 'cart_nextDiscountFormat' );
							if ( !empty( $format ) ) {
								// Get the needed quantity and the discount value.
								$needed_quantity = (int) $next_tier['min'] - $quantity;
								$discount_value  = (float) $next_tier['value'];
								$discount_type   = $next_tier['type'];
								$discount_string = ( 'percentage' === $discount_type ) ? $discount_value . '%' : wc_price( $discount_value );

								// Replace the placeholders in the format with the needed quantity and the discount value.
								$replacements = array(
									'{remaining_amount}' => $needed_quantity,
									'{discount_percentage}'     => $discount_string,
								);
								$message = str_replace( array_keys( $replacements ), array_values( $replacements ), $format );
								
								// Attach the generated message to the cart item array.
								$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['message'] = $message;
							}
						}

					}
					
				}

				// Making sure the price is not negative.
				$final_price = max( 0, $best_price );
				// If the final price is less than the base price, set the price of the product to the final price.
				if ( $final_price < $base_price ) {

					// If the discount breakdown is shown, the discount will be applied to the cart total.
					// So we don't need to set the price of the product to the final price.
					if( ! wpab_cb_get_options('cart_showDiscountBreakdown') ){
						$cart_item['data']->set_price( $final_price );
					}

					// storing the discount data in the cart item array for other actions and filters.
					$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['old_price'] = $base_price;
					$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['new_price'] = $final_price;
					$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['quantity'] = $quantity;
					$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['on_campaign'] = true;
					$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['campaign_type'] = $campaign_type;
					$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['campaign_id'] = $discount_data['discounts']['campaign_id'];
					$cart->cart_contents[ $cart_item_key ]['wpab_cb_discount_data']['campaign_title'] = $discount_data['discounts']['campaign_title'];

					$campaign_id = $discount_data['discounts']['campaign_id'];

					// Initialize the discount breakdown array if it doesn't exist.
					if ( ! isset( $cart->wpab_cb_discount_breakdown[ $campaign_id ] ) ) {
						$cart->wpab_cb_discount_breakdown[ $campaign_id ] = array(
							'title'    => $discount_data['discounts']['campaign_title'],
							'total_old_price' => 0,
							'total_new_price' => 0,
						);
					}

					// Add the discount to the discount breakdown array.
					$cart->wpab_cb_discount_breakdown[ $campaign_id ]['total_old_price'] += (float) $base_price * (float) $quantity;
					$cart->wpab_cb_discount_breakdown[ $campaign_id ]['total_new_price'] += (float) $final_price * (float) $quantity;
				}		
			}
		}

		/**
		 * Displays a promotional notice directly under the product name in the cart.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_cart_item_name
		 * @param array  $cart_item The cart item data.
		 * @param string $cart_item_key The key for the cart item.
		 * @return void
		 */
		public function display_inline_cart_notice( $cart_item, $cart_item_key ) {
			// Get the discount data for the cart item.
			$discount_data = $cart_item['wpab_cb_discount_data'];
			// If no message is set, return.
			if ( ! $discount_data['message'] ) {
				return;
			}
			// Echo the message.
			echo '<div class="wpab-cb-cart-item-notice" style="font-size: 0.9em; color: #777;">' . $discount_data['message'] . '</div>';
		}

		/**
		 * Display the cart item price.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_cart_item_price
		 * @param string     $price The original price.
		 * @param array      $cart_item The cart item data.
		 * @param string     $cart_item_key The key for the cart item.
		 * @return string The modified price.
		 */
		public function display_cart_item_price( $price, $cart_item, $cart_item_key ) {
			// Get the discount data for the cart item.
			$discount_data = $cart_item['wpab_cb_discount_data'];
			// If no discount data is set, return the original price.
			if ( ! $discount_data['new_price'] || ! $discount_data['old_price']) {
				return $price;
			}
			// Get the regular price and the sale price.
			$regular_price = (float) $discount_data['old_price'];
			$sale_price    = (float) $discount_data['new_price'];
			// Format the price using WooCommerce's standard sale price function.
			$formatted_price =wc_format_sale_price(
				wc_price( $regular_price ),
				wc_price( $sale_price )
			);
			// Return the formatted price.
			return $formatted_price;
		}

		/**
		 * Modify the price HTML on product/shop pages to show the discount.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_get_price_html
		 * @param string     $price_html The original price HTML.
		 * @param WC_Product $product    The product object.
		 * @return string The modified price HTML.
		 */
		public function display_discounted_price_html( $price_html, $product ) {
			// Get the discount data for the product.
			$discount_data = $this->get_or_calculate_product_discount( $product );

			// If the campaign is active and provides the best price, return the formatted price.
			if ( $discount_data['on_campaign']  ) {

				// If the option to show the discounted price is enabled, return the formatted price.
				if( wpab_cb_get_options('product_showDiscountedPrice') ){
				
					// Get the regular price and the sale price.
					$regular_price = (float) $product->get_regular_price( 'edit' );
					$sale_price    = (float) $discount_data['discounts']['best_price'];
				
					// Format the price using WooCommerce's standard sale price function.
					return wc_format_sale_price(
						wc_price( $regular_price ),
						wc_price( $sale_price )
					);

				} else{
					
					// If the option to show the discounted price is disabled, return the sale price.
					return wc_price( $discount_data['discounts']['best_price'] );
				}
				
			}

			// If no discounts are active, return the original price HTML.
			return $price_html;
		}


		/**
		 * Filter the product is on sale.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_product_is_on_sale
		 * @param bool      $is_on_sale The original is on sale value.
		 * @param WC_Product $product    The product object.
		 * @return bool The modified is on sale value.
		 */
		public function filter_is_product_on_sale( $is_on_sale, $product ) {
			// Get the discount data for the product.
			$discount_data = $this->get_or_calculate_product_discount( $product );
			// If the campaign is active, return true.
			return $is_on_sale || ( $discount_data['on_campaign']  );
		}

		/**
		 * Action to display the product summary message.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_single_product_summary
		 */
		public function action_single_product_summary() {
			global $product;
			// If the product is not a valid WC_Product object, log an error and return.
			if ( ! $product instanceof WC_Product ) {
				wpab_cb_log('Invalid product type: ' . gettype( $product ), 'ERROR' );
				return;
			}
			// Get the discount data for the product.
			$discount_data = $this->get_or_calculate_product_discount( $product );

			// Only show the message if our campaign is active.
			if ( $discount_data['on_campaign'] ) {
				// Get the format for the product summary message.
				$format = wpab_cb_get_options( 'product_messageFormat' );
				// If the format is empty, return.
				// Don't proceed if the format string is empty.
				if ( empty( $format ) ) {
					return;
				}

				// Get the base price and the best price for the product.
				$base_price = $discount_data['base_price'];
				$best_price = $discount_data['discounts']['best_price'];
				
				// Don't show if there's no actual saving.
				if ( $best_price >= $base_price ) {
					return;
				}

				// Calculate the amount off and the percentage off.
				$amount_off = $base_price - $best_price;
				$percentage_off = round( ( $amount_off / $base_price ) * 100 );

				// Replace the placeholders in the format with the amount off and the percentage off.
				$replacements = array(
					'{percentage_off}' => $percentage_off . '%',
					'{amount_off}'     => wp_strip_all_tags( wc_price( $amount_off ) ),
				);
				$message_text = str_replace( array_keys( $replacements ), array_values( $replacements ), $format );
				
				// Echo the final HTML with a CSS class for styling.
				echo '<div class="wpab-cb-product-save-message">' . esc_html( $message_text ) . '</div>';
			}
		}

		/**
		 * Display the cart item subtotal.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_cart_item_subtotal
		 * @param string $subtotal The original subtotal.
		 * @param array  $cart_item The cart item data.
		 * @param string $cart_item_key The key for the cart item.
		 * @return string The modified subtotal.
		 */
		public function display_cart_item_subtotal( $subtotal, $cart_item, $cart_item_key ) {
			// Get the discount data for the cart item.
			$discount_data = $cart_item['wpab_cb_discount_data'];
			
			// If no discount data is set, or the option to show the discounted price is disabled, return the original subtotal.
			if ( ! $discount_data['new_price'] || ! $discount_data['old_price'] || ! $discount_data['quantity'] || ! wpab_cb_get_options('product_showDiscountedPrice') ) {
				return $subtotal;
			}

			// Get the regular price and the sale price.
			$regular_price = (float) $discount_data['old_price'] * (int) $discount_data['quantity'];
			$sale_price    = (float) $discount_data['new_price'] * (int) $discount_data['quantity'];
			
			// Format the price using WooCommerce's standard sale price function.
			return wc_format_sale_price(
				wc_price( $regular_price ),
				wc_price( $sale_price )
			);
		}

		/**
		 * Add a fee to the cart for the discount.
		 *
		 * @since 1.0.0
		 * @hook woocommerce_cart_calculate_fees
		 * @param WC_Cart $cart The cart object.
		 */
		public function add_cart_discount_fee( $cart ) {
			// Loop through each campaign's discount breakdown and add a fee for each.	
			foreach ( $cart->wpab_cb_discount_breakdown as $campaign_id => $campaign_data ) {
				// The fee is negative (discount), so total_new_price - total_old_price is negative.
				$cart->add_fee( $campaign_data['title'],  $campaign_data['total_new_price'] -$campaign_data['total_old_price']);
			}
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
			// If the product is not a valid WC_Product object, log an error and return.
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

			// Get the product ID.
			$product_id = $product->get_id();
			// If the option to exclude sale items is enabled and the product is on sale, return the sale price.
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
			
			// Check the request-level cache first to avoid recalculating the discount for the same product.
			if ( isset( $this->product_discount_cache[ $product_id ] ) ) {
				// Log the cache hit.
				wpab_cb_log('Cache hit for product: ' . $product->get_title(), 'DEBUG');
				return $this->product_discount_cache[ $product_id ];
			}

			// Get the campaign manager.
			$campaign_manager = wpab_cb_campaign_manager();
			// Get all active campaigns.
			$active_campaigns = $campaign_manager->get_active_campaigns();
			// Get the base price of the product.
			$base_price       = (float) $product->get_price('edit');
			// Initialize the discount data array.
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
				// If there are no active campaigns, return the discount data.
				$this->product_discount_cache[ $product_id ] = $discount_data;
				return $discount_data;
			}

			// 3. Loop through all active campaigns to categorize and evaluate them.
			foreach ( $active_campaigns as $campaign ) {
				// If the campaign is not applicable to the product, skip it.
				if( ! $campaign->is_applicable_to_product( $product_id ) ) {
					continue;
				}

				// Get the campaign type.
				$campaign_type = $campaign->get_meta( 'campaign_type' );
				// Initialize the discounted price.
				$discounted_price = null;
				
				// If the campaign is a scheduled campaign, calculate the simple price.
				if ( 'scheduled' === $campaign_type ) {
					$discounted_price = $this->calculate_simple_price( $campaign, $base_price );
				} elseif ( 'quantity' === $campaign_type || 'earlybird' === $campaign_type ) {
				
					// Get the tiers for the campaign.
					$tiers = $campaign->get_meta('campaign_tiers');
				
					// If the tiers are not empty, calculate the tier price.
					if ( is_array( $tiers ) && ! empty( $tiers ) ) {
						// Always use the first tier for quantity and earlybird campaigns
						//later we will use sale counts for earlybird campaigns
						$discounted_price = $this->calculate_tier_price( $tiers[0], $base_price );
					}
				}

				// else if( 'bogo' === $campaign_type ){
				// 	$discounted_price = $this->calculate_bogo_price( $campaign->get_meta('campaign_tiers')[0], $base_price );
				// }
				
				// If the discounted price is better than the current best price, update the discount data.
				if( $this->is_better_campaign( $discount_data['discounts']['best_price'], $discounted_price )){
					// Set the on_campaign flag to true.
					$discount_data['on_campaign'] = true;	
					// Setting all the discount data.
					$discount_data['discounts']['best_price'] = $discounted_price;
					$discount_data['discounts']['campaign_id'] = $campaign->get_id();
					$discount_data['discounts']['campaign_type'] = $campaign_type;
					$discount_data['discounts']['campaign_title'] = $campaign->get_title();
					$discount_data['discounts']['tiers'] = $campaign->get_meta('campaign_tiers');
					$discount_data['discounts']['discount_value'] = $campaign->get_meta('discount_value');
					$discount_data['discounts']['discount_type'] = $campaign->get_meta('discount_type');
				}
			}

			// Store the final, structured result in the cache for this page load.
			$this->product_discount_cache[ $product_id ] = $discount_data;
			return $discount_data;
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
			// Get the discount value and type.
			$discount_value = (float) $campaign->get_meta( 'discount_value' );
			$discount_type = $campaign->get_meta( 'discount_type' );
			
			// If the discount type is percentage calculate the fixed discount value.
			if ( 'percentage' === $discount_type ) {
				$discount_value = $base_price * ( $discount_value / 100 ) ;
			}
			// Return the calculated price.
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
			// If the tier is not an array or is empty, return null.
			if( ! is_array( $tier ) || empty( $tier ) ){
				return null;
			}
			// Get the tier value and type.
			$tier_value = isset( $tier['value'] ) ? (float) $tier['value'] : 0;
			$tier_type = isset( $tier['type'] ) ? $tier['type'] : 'percentage';

			// If the tier type is percentage, calculate the fixed discount value.
			if ( 'percentage' === $tier_type ) {
				$tier_value = $base_price * ( $tier_value / 100 ) ;
			}
			// Return the calculated price.
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
			// If the tier price is not set, return false.
			if( ! $tier_price ){
				return false;
			}
			// If the priority method is set to apply the highest price, return true if the tier price is less than the best price.
			if( 'apply_highest' === wpab_cb_get_options( 'product_priorityMethod' ) ){
				return ! $best_price || $tier_price < $best_price ;
			}
			// If the priority method is set to apply the lowest price, return true if the tier price is greater than the best price.
			return ! $best_price || $tier_price > $best_price;
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