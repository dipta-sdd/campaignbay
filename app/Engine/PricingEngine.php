<?php

namespace WpabCb\Engine;

use WC_Product;
use \WpabCb\Engine\CampaignManager;

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
		// load the product summary hook
		$this->add_action( 'woocommerce_single_product_summary', 'action_single_product_summary', 9, 0 );
		// load the price html hook
		$this->add_filter( 'woocommerce_get_price_html', 'display_discounted_price_html');
		// load the price html hook
		$this->add_filter( 'woocommerce_variable_price_html', 'display_variable_price_html', 10, 3);

		$this->add_filter( 'woocommerce_variation_prices', 'filter_variation_prices',10,2);

		// load the product is on sale hook
		$this->add_filter( 'woocommerce_product_is_on_sale', 'filter_is_product_on_sale');

		// load the before calculate totals hook
		$this->add_action( 'woocommerce_before_calculate_totals', 'apply_discounts_and_prepare_notices' );

		$this->add_action( 'woocommerce_after_calculate_totals', 'cart_after_calculate_totals' );

		// do later: add free product auto add to cart
		// $this->add_filter( 'woocommerce_add_cart_item', 'add_to_cart_item_filter', 20, 1 );


		// Conditionally add the hook for the discount breakdown in cart totals, based on settings.
		if( wpab_cb_get_options('cart_showDiscountBreakdown') ){
			$this->add_action( 'woocommerce_cart_calculate_fees', 'add_cart_discount_fee', 20, 1 );
		}

		// Conditionally add the hook for inline "add more" notices in the cart, based on settings.
		if( wpab_cb_get_options('cart_showNextDiscountBar') ){
			$this->add_filter( 'woocommerce_after_cart_item_name', 'display_inline_cart_notice', 10, 2 );
		}

		// Cart item hooks for formatting the price and subtotal columns.
		$this->add_filter( 'woocommerce_cart_item_price', 'display_cart_item_price', 10, 3);
		$this->add_filter( 'woocommerce_cart_item_subtotal', 'display_cart_item_subtotal', 10, 3);


		// product variation single variation hooks
		$this->add_filter( 'woocommerce_variation_prices_price', 'filter_variation_prices_price', 10, 3);
		$this->add_filter( 'woocommerce_variation_prices_sale_price', 'filter_variation_prices_sale_price', 10, 3);

		// remove cart item action hook 
		// remove bogo free product from cart
		$this->add_action( 'woocommerce_remove_cart_item', 'remove_bogo_free_product_from_cart', 10, 2);
		$this->add_action( 'woocommerce_order_details_before_order_table_items', 'order_details_before_order_table_items', 10, 1);


	}

	public function order_details_before_order_table_items( $order ){
		wpab_cb_log('order', $order, 'DEBUG' );
	}

	public function remove_bogo_free_product_from_cart( $cart_item_key, $cart ){
		if( ! isset( $cart->cart_contents[$cart_item_key]['cb_discount_data']['bogo_free_cart_id'] ) ){
			return;
		}
		$free_bogo_product_to_remove = $cart->cart_contents[$cart_item_key]['cb_discount_data']['bogo_free_cart_id'];
		if( ! isset( $cart->cart_contents[$free_bogo_product_to_remove] ) ){
			return;
		}
		if( isset( $cart->cart_contents[$free_bogo_product_to_remove] ) ){
			unset( $cart->cart_contents[$free_bogo_product_to_remove] );
		}
	}

	/**
	 * Filter the variation prices price.
	 * This is used to apply the simple price to the variation prices.
	 *
	 * @since 1.0.0
	 * @hook woocommerce_variation_prices_price
	 * @param float $price The original price.
	 * @param WC_Product_Variation $variation The variation object.
	 * @param WC_Product_Variable $product The product object.
	 * @return float The modified price.
	 */
	public function filter_variation_prices_price( $price, $variation, $product ){
		$discount_data = $this->get_or_calculate_product_discount( $variation );
		if( $discount_data['on_campaign'] && isset( $discount_data['discounts']['simple']['price'] ) ){
			return $discount_data['discounts']['simple']['price'] < $price ? $discount_data['discounts']['simple']['price'] : $price;
		}
		return $price;
	}
	
	/**
	 * Filter the variation prices sale price.
	 * This is used to apply the simple price to the variation prices.
	 *
	 * @since 1.0.0
	 * @hook woocommerce_variation_prices_sale_price
	 * @param float $price The original price.
	 * @param WC_Product_Variation $variation The variation object.
	 * @param WC_Product_Variable $product The product object.
	 * @return float The modified price.
	 */
	public function filter_variation_prices_sale_price( $price, $variation, $product ){
		$discount_data = $this->get_or_calculate_product_discount( $variation );
		if( $discount_data['on_campaign'] && isset( $discount_data['discounts']['simple']['price'] ) ){
			return $discount_data['discounts']['simple']['price'] < $price ? $discount_data['discounts']['simple']['price'] : $price;
		}
		return $price;
	}

	/**
	 * Filter the variable price html.
	 * This is used to apply the simple price to the variable price html.
	 *
	 * @since 1.0.0
	 * @hook woocommerce_variable_price_html
	 * @param string $price_html The original price html.
	 * @param WC_Product_Variable $product The product object.
	 * @return string The modified price html.
	 */
	public function display_variable_price_html( $price_html, $product){

		$prices = $product->get_variation_prices(true);
		if ( empty( $prices['price'] ) ){
			return $price_html;
		}
		$min_price     = current( $prices['price'] );
		$max_price     = end( $prices['price'] );
		$min_reg_price = current( $prices['regular_price'] );
		$max_reg_price = end( $prices['regular_price'] );

		$sale_price = $min_price !== $max_price ? wc_format_price_range( $min_price, $max_price ) : wc_price( $min_price );
		$regular_price = $min_reg_price !== $max_reg_price ? wc_format_price_range( $min_reg_price, $max_reg_price ) : wc_price( $min_reg_price );
		$price_html = wc_format_sale_price( $regular_price, $sale_price );
		return $price_html;
	}

	// no need work is done by filter_variation_prices_price & filter_variation_prices_sale_price
	/**
	 * Test variation prices filter.
	 * This is used to  the variation prices.
	 *
	 * @since 1.0.0
	 * @hook woocommerce_variation_prices
	 * @param array $prices The prices array.
	 * @param WC_Product $product The product object.
	 * @return array The modified prices array.
	 */
	public function filter_variation_prices( $prices, $product ){
		foreach( $prices['price'] as $key => $price ){
			$product_variation = wc_get_product( $key );
			$discount_data = $this->get_or_calculate_product_discount( $product_variation );
			if( $discount_data['on_campaign'] && isset( $discount_data['discounts']['simple']['price']) && $discount_data['discounts']['simple']['price'] ){
				$simple_price = $discount_data['discounts']['simple']['price'];
				$prices['sale_price'][$key] = $simple_price;
				$prices['price'][$key] = $simple_price < $prices['price'][$key] ? $simple_price : $prices['price'][$key];
			}
		}
		return $prices;
	}

	/**
	 * Add to cart item filter.
	 * This is used to add the free product to the cart if the quantity is greater than the buy quantity.
	 *
	 * @since 1.0.0
	 * @hook woocommerce_add_cart_item
	 * @param array $cart_item The cart item data.
	 * @return array The modified cart item data.
	 */
	// public function add_to_cart_item_filter( $cart_item ){
	// 	$allow_campaign_stacking = wpab_cb_get_options('cart_allowCampaignStacking');
	// }


	/**
	 * Cart after calculate totals filter.
	 * This is used to calculate the total discount and apply it to the cart.
	 * woocommerce_after_calculate_totals cannot do the job because it is calculated after that hook.
	 *
	 * @since 1.0.0
	 * @hook woocommerce_after_calculate_totals
	 * @param WC_Cart $cart The cart object.
	 */
	public function cart_after_calculate_totals( $cart ){
		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
            return;
        }

		// wpab_cb_log('cart_after_calculate_totals',print_r($cart, true), 'DEBUG' );
		if( wpab_cb_get_options('cart_showDiscountBreakdown') ){
			$discount_breakdown = $cart->wpab_cb_discount_breakdown ?? array();
			wpab_cb_log('discount_breakdown enabled', 'DEBUG' );
			foreach( $discount_breakdown as $campaign_id => $campaign_data ){
				$total_old_price = $campaign_data['total_old_price'];
				$total_new_price = $campaign_data['total_new_price'];
				$discount_value = $total_old_price - $total_new_price;

				$current_subtotal = $cart->get_subtotal();
				$current_total = $cart->get_total('edit');
				$cart->set_subtotal( $current_subtotal + $discount_value, true );
				$cart->set_total( $current_total + $discount_value, true );

				if( defined( 'WP_DEBUG' ) && WP_DEBUG ){
					wpab_cb_log('campaign: ' . $campaign_id . '  ' . $campaign_data['title'] , 'DEBUG' );
					wpab_cb_log('discount: ' . $discount_value, 'DEBUG' );
					wpab_cb_log('current_total: ' . $current_total, 'DEBUG' );
					wpab_cb_log('current_subtotal: ' . $current_subtotal, 'DEBUG' );
					wpab_cb_log('new_total: ' . $cart->get_total('edit'), 'DEBUG' );
					wpab_cb_log('new_subtotal: ' . $cart->get_subtotal(), 'DEBUG' );
				}
				
			}
		}

        $bogo_discount_value = 0;
        $bogo_discount_tax   = 0;
		
        // Loop through the cart to find our "tagged" BOGO items and sum their value.
        foreach ( $cart->get_cart() as $cart_item ) {
            $bogo_free_quantity = $this->total_bogo_free_quantity($cart_item['cb_bogo_free_quantity']) ?? 0;
            if ( $bogo_free_quantity > 0 ) {
                $product = $cart_item['data'];
                // Use the item's current price (it might already have a simple/quantity discount).
                $price_per_item = (float) $product->get_price();
				if( isset( $cart_item['cb_discount_data']['new_price'] ) && $cart_item['cb_discount_data']['new_price']  ){
					$price_per_item = (float) $cart_item['cb_discount_data']['new_price'];
				}
                $quantity = (int) $cart_item['quantity'];
                // Calculate the value of the free items for this line.
                $line_discount = $price_per_item * min( $bogo_free_quantity , $quantity);
                $bogo_discount_value += $line_discount;
                
                // Calculate the tax that needs to be removed as well.
                $line_taxes = $cart_item['line_tax_data']['subtotal'] ?? array();
                if ( ! empty( $line_taxes ) ) {
                    $tax_per_item = array_sum( $line_taxes ) / $cart_item['quantity'];
                    $bogo_discount_tax += $tax_per_item * $bogo_free_quantity;
                }
            }
        }


        // If we found a BOGO discount, adjust the cart totals.
        if ( $bogo_discount_value > 0 ) {
            // Get the current totals.
            $current_subtotal = $cart->get_subtotal();
            $current_tax_total = $cart->get_subtotal_tax();
			$current_total = $cart->get_total('edit');

            $cart->set_subtotal( (int)($current_subtotal - $bogo_discount_value ));
			$cart->set_total( (int)($current_total - $bogo_discount_value ));
            $cart->set_subtotal_tax( (int)($current_tax_total - $bogo_discount_tax) );
        }

		
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

		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			return;
		}

		// Initialize the discount breakdown array.
		// This is used to store the discount breakdown for each campaign.
		$cart->wpab_cb_discount_breakdown = array();
		$cart->wpab_cb_hidden_discount = 0;
		$triggered_bogo_offers = array();
		

		$allow_campaign_stacking = wpab_cb_get_options('cart_allowCampaignStacking');
		


		foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
			// wpab_cb_log('cart_item', $cart_item, 'DEBUG' );
			if( isset( $cart_item['cb_discount_data']['is_free_product'] ) && $cart_item['cb_discount_data']['is_free_product'] ){
				continue;
			}

			// Initialize our custom notice key for this item.
			$cart->cart_contents[ $cart_item_key ]['cb_discount_data'] = array(
				'message' => null,
				'old_price' => null,
				'new_price' => null,
				'bogo_free_quantity' => null,
			);
			// Get the product, quantity and discount data.
			$product       = $cart_item['data'];
			$quantity      = $cart_item['quantity'];
			$discount_data = $this->get_or_calculate_product_discount( $product );

			// If the product is not on a campaign, skip it.
			if ( ! $discount_data['on_campaign'] ) {
				continue;
			}

			// Price Calculation Logic
			// Get the base price and the best price for the product.
			$base_price = $discount_data['base_price'];
			$best_price = $base_price;


			if( isset( $discount_data['discounts']['simple'] ) ){
				$simple_price = $discount_data['discounts']['simple']['price'] ?? $base_price;
				// If the campaign stacking is allowed, use the simple price as the base price.
				$base_price = $simple_price;
				$cart_item['data']->set_price( $simple_price );
			}
			
			// Initialize the quantity price and the next tier.
			// These will be used to calculate the price based on the quantity.
			$quantity_price = null;
			$needed_quantity = null;
			
			// If the campaign is a quantity campaign, we need to calculate the price based on the quantity.
			if( isset( $discount_data['discounts']['quantity']['price'] ) && ! empty( $discount_data['discounts']['quantity']['tiers'] )){

				
				// Sort the tiers by the minimum quantity.
				$tiers = $discount_data['discounts']['quantity']['tiers'];
				usort($tiers, function( $a, $b ) { return (int) ( $a['min'] ?? 0 ) <=> (int) ( $b['min'] ?? 0 ); });
				
				// Initialize the current and next tier.
				$current_tier = null;
				
				$next_tier_price = null;

				// Loop through the tiers and find the current and next tier.
				foreach ( $tiers as $tier ) {
					if( (int) $tier['min']  > $quantity ){
						$next_tier = $tier;
						$next_tier_price = $this->calculate_tier_price( $next_tier, $base_price );
						if( $next_tier_price < $simple_price ){
							break;
						}
					}
					if ( (int) $tier['max']  >= $quantity && (int) $tier['min'] <= $quantity ) {
						$current_tier = $tier;
					}
				}

				// If the current tier is found, calculate the price based on the current tier.
				if( $current_tier ){
					$quantity_price = $this->calculate_tier_price( $current_tier, $base_price );
				}
				
				// If the next tier is found and the next discount bar is enabled, calculate the price based on the next tier.
				if( $next_tier_price && $next_tier_price < $simple_price && wpab_cb_get_options('cart_showNextDiscountBar') ){

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
						$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['message'] = $message;
					}
				}
			}

			if ( $quantity_price && $quantity_price < $base_price ) {

			
				$cart_item['data']->set_price( $quantity_price );
				$campaign_id = $discount_data['discounts']['quantity']['campaign_id'];

				// storing the discount data in the cart item array for other actions and filters.
				$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['old_price'] = $product->get_regular_price();
				$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['new_price'] = $quantity_price;
				$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['quantity'] = $quantity;
				$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['on_campaign'] = true;
				$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['campaign_type'] = 'quantity';
				$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['campaign_id'] = $campaign_id;
				$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['campaign_title'] = $discount_data['discounts']['quantity']['campaign_title'];

				// Initialize the discount breakdown array if it doesn't exist.
				if ( ! isset( $cart->wpab_cb_discount_breakdown[ $campaign_id ] ) ) {
					$cart->wpab_cb_discount_breakdown[ $campaign_id ] = array(
						'title'    => $discount_data['discounts']['quantity']['campaign_title'],
						'total_old_price' => 0,
						'total_new_price' => 0,
					);
				}

				// Add the discount to the discount breakdown array.
				$cart->wpab_cb_discount_breakdown[ $campaign_id ]['total_old_price'] += (float) $base_price * (float) $quantity;
				$cart->wpab_cb_discount_breakdown[ $campaign_id ]['total_new_price'] += (float) $quantity_price * (float) $quantity;
			}
			// Check if this specific item triggers a BOGO offer.
			if(
				$discount_data['discounts']['bogo'] &&
				(
					$allow_campaign_stacking ||
					! $quantity_price ||
					$this->is_better_campaign( $quantity_price, $discount_data['discounts']['bogo']['price'] )
				)
			){
				$bogo_tier = $discount_data['discounts']['bogo']['bogo_tier'] ?? null;
				$free_product_id = $bogo_tier['get_product'] ?? null;
				$campaign_id = $discount_data['discounts']['bogo']['campaign_id'] ?? null;
				if( ! $free_product_id || ! $bogo_tier || ! $bogo_tier['buy_quantity'] || ! $campaign_id ){
					continue;
				}
				if($bogo_tier && $bogo_tier['buy_quantity'] > 0 && $bogo_tier['buy_quantity'] <= $quantity ){

					$fulfil_counts = floor($quantity / $bogo_tier['buy_quantity']);
					$cart_id = $this->add_bogo_free_product_to_cart($cart, $free_product_id, $fulfil_counts, $product, $campaign_id);
					$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['bogo_free_cart_id'] = $cart_id;
					if( !$cart_id ){
						$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['bogo_free_cart_id'] = null;
						if(isset($triggered_bogo_offers[$free_product_id] )){
							if(isset($triggered_bogo_offers[$free_product_id][$campaign_id])){
								$triggered_bogo_offers[$free_product_id][$campaign_id] += $fulfil_counts;
							} else{
								$triggered_bogo_offers[$free_product_id][$campaign_id] = $fulfil_counts;
							}
						} else{
							$triggered_bogo_offers[$free_product_id] = array(
								$campaign_id => $fulfil_counts,
							);
						}
						if( ! $allow_campaign_stacking ){
							$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['message'] = null;
						}
					}
				}else{
					$bogo_needed_quantity = (int) $bogo_tier['buy_quantity'] - (int) $quantity;
					wpab_cb_log('removing bogo item', 'DEBUG' );
					$cart_id = $this->add_bogo_free_product_to_cart($cart, $free_product_id, 0, $product, $campaign_id);
					$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['bogo_free_cart_id'] = null;
					if( ! $needed_quantity || $bogo_needed_quantity < $needed_quantity ){
						$format = wpab_cb_get_options( 'cart_bogoMessageFormat' ) ?? 'Buy {buy_quantity} more and get {get_product_quantity} {get_product} for free!';
						
						$get_product = '<a href="' . esc_url( $bogo_tier['get_link'] ) . '"><strong>' . esc_html( $bogo_tier['get_product_title'] ) . '</strong></a>';
						
						$replacements = array(
							'{buy_quantity}' => $bogo_needed_quantity,
							'{get_product_quantity}' => $bogo_tier['get_quantity'],
							'{get_product}' => $get_product,
						);
						$message = str_replace( array_keys( $replacements ), array_values( $replacements ), $format );	
						$cart->cart_contents[ $cart_item_key ]['cb_discount_data']['message'] = $message;
					}
					
				}
			}
			
			if( defined( 'WP_DEBUG' ) && WP_DEBUG ){
				wpab_cb_log('------------------------------------------------------------------------------------------------', 'DEBUG' );
				wpab_cb_log('cart_item_key: ' . $cart_item_key . ' ' . $product->get_name() . ' ' . $product->get_id(), 'DEBUG' );
				wpab_cb_log('quantity: ' . $quantity, 'DEBUG' );
				wpab_cb_log('regular_price: ' . $product->get_regular_price(), 'DEBUG' );
				wpab_cb_log('campaign_price: ' . $base_price, 'DEBUG' );
				wpab_cb_log('price: ' . $product->get_price(), 'DEBUG' );
				wpab_cb_log('quantity_price: ' . $quantity_price, 'DEBUG' );
				wpab_cb_log('campaign_id: ' . $campaign_id, 'DEBUG' );
			}
			
		}

		// wpab_cb_log('cart_contents', $cart->cart_contents, 'DEBUG' );

		
		$this->apply_bogo_logic($cart, $triggered_bogo_offers);
		// if($triggered_bogo_offers){
		// 	wpab_cb_log('triggered_bogo_offers', $triggered_bogo_offers, 'DEBUG' );
		// }

	}

	/**
	 * Apply the BOGO logic to the cart.
	 * This function is used to mark the free product quantity in the cart item.
	 * This quantity will be used to calculate the total quantity of the free products.
	 *
	 * @since 1.0.0
	 * @param WC_Cart $cart The cart object.
	 * @param array $triggered_bogo_offers The triggered BOGO offers.
	 */
	private function apply_bogo_logic($cart , $triggered_bogo_offers){
		foreach( $cart->cart_contents as $cart_item_key => $cart_item ){
			$product_id = $cart_item['data']->get_id();
			$product_parent_id = $cart_item['data']->is_type('variation') ? $cart_item['data']->get_parent_id() : null;
			if( isset( $triggered_bogo_offers[$product_id] ) ){
				$cart->cart_contents[ $cart_item_key ]['cb_bogo_free_quantity'] = $triggered_bogo_offers[$product_id];
				unset($triggered_bogo_offers[$product_id]);
			}elseif( $product_parent_id && isset( $triggered_bogo_offers[$product_parent_id] ) ){
				$cart->cart_contents[ $cart_item_key ]['cb_bogo_free_quantity'] = $triggered_bogo_offers[$product_parent_id];
				unset($triggered_bogo_offers[$product_parent_id]);
			}
			else{
				$cart->cart_contents[ $cart_item_key ]['cb_bogo_free_quantity'] = null;
			}
		}
		// wpab_cb_log('apply_bogo_logic', print_r($triggered_bogo_offers, true), 'DEBUG' );
		if(empty($triggered_bogo_offers)){
			return;
		}
	}

	/**
	 * Calculate the total quantity of a free products.
	 *
	 * @since 1.0.0
	 * @param array $quantities The quantities of a free products not all products.
	 * @return int The total quantity of the free products.
	 */
	private function total_bogo_free_quantity($quantities){
		if( ! $quantities || empty( $quantities ) || ! is_array( $quantities ) ){
			return 0;
		}
		$total= 0;
		foreach( $quantities as $quantity ){
			$total += $quantity;
		}
		return $total;
	}

	private function add_bogo_free_product_to_cart($cart, $product_id, $quantity , $buy_product, $campaign_id = null){
		
		$product_id = absint($product_id);
		$quantity = absint($quantity);
		if( ! $product_id || $quantity === null){
			return null;
		}
		$product = wc_get_product($product_id);
		$regular_price = $product->get_regular_price();
		if( ! $product || $product->is_type('variable') || $product->is_type('variation') || $product->is_type('grouped') || ! $product->is_purchasable() ){
			wpab_cb_log('Invalid product type . cannot add bogo free product to cart: ' . gettype( $product ), 'ERROR' );
			return null;
		}

		$product_data = wc_get_product($product_id);
		$product_data->set_price(0);
		$product_data->set_sale_price(0);
		if( ! $product_data->is_purchasable() || ! $product_data->is_in_stock() || !$product_data->has_enough_stock( $quantity )  ){}
		$cart_id = $cart->generate_cart_id( $product_id, 0, null, array() );
		$cart_id .= 'cb' . $buy_product->get_id();
		if( !$cart_id ){
			return null;
		}

		$cart_item_data = array(
			'cb_discount_data' => array(
				'is_free_product' => true,
				'message' => null,
				'on_campaign' => true,
				'campaign_id' => $campaign_id,
				'quantity' => $quantity,
				'old_price' => $regular_price,
				'new_price' => 0,
			),
		);
		if( $quantity < 1 ){
			wpab_cb_log('removing bogo item (quantity is less than 1) ' . $cart_id . ' ' . $product_data->get_name(), 'DEBUG' );
			unset($cart->cart_contents[$cart_id]);
			return null;
		}

		$cart->cart_contents[ $cart_id ] = array_merge(
			$cart_item_data,
			array(
				'key'          => $cart_id,
				'product_id'   => $product_id,
				'variation_id' => null,
				'variation'    => array(),
				'quantity'     => $quantity,
				'data'         => $product_data,
				'data_hash'    => wc_get_cart_item_data_hash( $product_data ),
			)
		);

		wpab_cb_log('added bogo free product to cart: ' . $cart_id . ' ' . $product_data->get_name(), 'DEBUG' );
		return $cart_id;
		
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
		$discount_data = $cart_item['cb_discount_data'];
		// If no message is set, return.
		if ( ! $discount_data['message'] ) {
			return;
		}
		// Echo the message.
		echo '<div class="wpab-cb-cart-item-notice" style="font-size: 0.9em; color: #777;">' . wp_kses_post( $discount_data['message'] ) . '</div>';
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
		$discount_data = $cart_item['cb_discount_data'];
		// If no discount data is set, return the original price.
		// if (  ! $discount_data['new_price'] || ! $discount_data['old_price']) {
		// 	return $price;
		// }
		
		if ( ! isset( $discount_data['new_price']) || $discount_data['new_price'] === null || !$discount_data['old_price']) {
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
		
		// If the product is a variation, use the parent product's price as the regular price.
		if ( $product->is_type( 'variable' ) ) {
			return $price_html;
		}
		// Get the discount data for the product.
		$discount_data = $this->get_or_calculate_product_discount( $product );
		// Get the regular price.
		$regular_price = (float) $product->get_regular_price( 'edit' );
		// If the campaign is active and provides the best price, return the formatted price.
		if ( $discount_data['on_campaign'] && isset( $discount_data['discounts']['best_price'] ) && $discount_data['discounts']['best_price'] < $regular_price ) {
			// If the option to show the discounted price is enabled, return the formatted price.
			if( wpab_cb_get_options('product_showDiscountedPrice') && isset( $discount_data['discounts']['best_price'] ) ){
			
				$sale_price    = (float) $discount_data['discounts']['best_price'];
			
				// Format the price using WooCommerce's standard sale price function.
				$price_html = wc_format_sale_price(
					wc_price( $regular_price ),
					wc_price( $sale_price )
				);

			} else{
				// If the option to show the discounted price is disabled, return the sale price.
				$price_html = wc_price( $discount_data['discounts']['best_price'] );
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
			$simple_message = $this->generate_product_summary_simple_message( $discount_data );
			$bogo_message = $this->generate_product_summary_bogo_message( $discount_data );
			$simple_message ? $this->print_notice( $simple_message ) : null;
			$bogo_message ? $this->print_notice( $bogo_message ) : null;

		}
	}

	/**
	 * Generate the product summary message for the BOGO campaign.
	 *
	 * @since 1.0.0
	 * @param array $discount_data The discount data.
	 * @return string The message text.
	 */
	public function generate_product_summary_bogo_message( $discount_data ) {
		if( ! isset( $discount_data['discounts']['bogo'] ) || ! $discount_data['discounts']['bogo'] ){
			return null;
		}
		$format = wpab_cb_get_options( 'product_bogoMessageFormat' );
		if( empty( $format ) ){
			return null;
		}
		$tier = $discount_data['discounts']['bogo']['bogo_tier'];
		$get_product_quantity = $tier['get_quantity'];
		$get_product_title = $tier['get_product_title'];
		$buy_product_quantity = $tier['buy_quantity'];
		$buy_product_title = $tier['buy_product_title'];
		$get_product_link = $tier['get_link'];
		$campaign_title = $discount_data['discounts']['bogo']['campaign_title'];
		$replacements = array(
			'{campaign_name_strong}' => '<strong>' . esc_html( $campaign_title ) . '</strong>',
			'{campaign_name}'        => esc_html( $campaign_title ),
			'{buy_product_quantity}' => absint( $buy_product_quantity ),
			'{buy_product}'          => '<strong>' . esc_html( $buy_product_title ) . '</strong>',
			'{get_product_quantity}' => absint( $get_product_quantity ),
			'{get_product}'          => '<a href="' . esc_url( $get_product_link ) . '"><strong>' . esc_html( $get_product_title ) . '</strong></a>',
		);
		$message = str_replace( array_keys( $replacements ), array_values( $replacements ), $format );
		// wp_kses_post to allow safe HTML tags (<strong>, <a>) but strip out anything dangerous.
		return $message;
	}

	/**
	 * Generate the product summary message for the simple campaign.
	 *
	 * @since 1.0.0
	 * @param array $discount_data The discount data.
	 * @return string The message text.	
	 */
	public function generate_product_summary_simple_message( $discount_data ) {
		if( ! isset( $discount_data['discounts']['simple']['price'] ) || ! $discount_data['discounts']['simple']['price'] ){
			return null;
		}
		// Get the format for the product summary message.
		$format = wpab_cb_get_options( 'product_messageFormat' );
		if( empty( $format ) ){
			return null;
		}
		// Get the base price and the best price for the product.
		$base_price = $discount_data['base_price'];
		$discounted_price = (float) $discount_data['discounts']['simple']['price'];
		
		// Don't show if there's no actual saving.
		if ( $discounted_price >= $base_price ) {
			return null;
		}

		// Calculate the amount off and the percentage off.
		$amount_off = $base_price - $discounted_price;
		$percentage_off = round( ( $amount_off / $base_price ) * 100 );

		// Replace the placeholders in the format with the amount off and the percentage off.
		$replacements = array(
			'{percentage_off}' => $percentage_off . '%',
			'{amount_off}'     => wp_strip_all_tags( wc_price( $amount_off ) ),
		);
		$message_text = str_replace( array_keys( $replacements ), array_values( $replacements ), $format );
		
		// Echo the final HTML with a CSS class for styling.
		// echo '<div class="wpab-cb-product-save-message">' . esc_html( $message_text ) . '</div>';
		// echo '<div class="woocommerce-info" style="margin-bottom: 0px; border-top: none;">' . wp_kses_post( $message_text ) . '</div>';
		return $message_text;
	}

	/**
	 * Print the notice.
	 *
	 * @since 1.0.0
	 * @param string $message The message to print.
	 */
	public function print_notice( $message ) {
		echo '<div class="woocommerce-info" style="margin-bottom: 0px; border-top: none;">' . wp_kses_post( $message ) . '</div>';
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
		$discount_data = $cart_item['cb_discount_data'];
		// 
		$bogo_free_product_quantity = $this->total_bogo_free_quantity($cart_item['cb_bogo_free_quantity']) ?? 0;
		// If no discount data is set, or the option to show the discounted price is disabled, return the original subtotal.
		if ( ! $discount_data['new_price'] || ! $discount_data['old_price'] || ! $discount_data['quantity'] || ! wpab_cb_get_options('product_showDiscountedPrice') ) {
			$quantity = $cart_item['quantity'];
			$price = $cart_item['data']->get_price();
			$regular_price = $price * $quantity;
			$sale_price = $price * max(0, ($quantity - $bogo_free_product_quantity));
		}
		if( isset( $discount_data['is_free_product'] ) && $discount_data['is_free_product'] ){
			$regular_price = (float) $discount_data['old_price'] * (int) $discount_data['quantity'];
			$sale_price    = 0;
		}
		else{
		// Get the regular price and the sale price.
		$regular_price = (float) $discount_data['old_price'] * (int) $discount_data['quantity'];
		$sale_price    = (float) $discount_data['new_price'] *  max(0, (int) $discount_data['quantity'] -  $bogo_free_product_quantity);
		}

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
		if( ! is_array( $cart->wpab_cb_discount_breakdown ) || empty( $cart->wpab_cb_discount_breakdown ) ) {
			return;
		}
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
				'discounts'  => array(),
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
				'discounts'  => array(),
			);
		}
		
		// Check the request-level cache first to avoid recalculating the discount for the same product.
		if ( isset( $this->product_discount_cache[ $product_id ] ) ) {
			// Log the cache hit.
			return $this->product_discount_cache[ $product_id ];
		}

		// Get the campaign manager.
		$campaign_manager = CampaignManager::get_instance();
		// Get all active campaigns.
		$active_campaigns = $campaign_manager->get_active_campaigns();

		$base_price = (float) $product->get_price('edit');
		// Initialize the discount data array.
		$discount_data = array(
			'base_price' => $base_price,
			'on_sale'   => false,
			'on_campaign' => false,
			'discounts'  => array(
				'simple' => array(),
				'bogo' => array(),
				'quantity' => array(),
			),
		);

		if ( empty( $active_campaigns ) || ! is_array( $active_campaigns ) ) {
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

			$type_data = array(
				'campaign_id' => $campaign->get_id(),
				'campaign_type' => $campaign_type,
				'campaign_title' => $campaign->get_title(),
			);

			// If the campaign is a scheduled campaign, calculate the simple price.
			if ( 'scheduled' === $campaign_type ) {
				
				$discounted_price = $this->calculate_simple_price( $campaign, $base_price );
				$type_data['discount_value'] = $campaign->get_meta('discount_value');
				$type_data['discount_type'] = $campaign->get_meta('discount_type');

			}elseif( 'earlybird' === $campaign_type ){
				$tiers = $campaign->get_meta('campaign_tiers');
				// If the tiers are empty, skip the campaign.
				if ( ! is_array( $tiers ) || empty( $tiers ) ) {
					continue;
				}
				$discounted_price = $this->calculate_tier_price( $tiers[0], $base_price );
				$type_data['tiers'] = $tiers;
			}
			elseif ( 'quantity' === $campaign_type) {
				$tiers = $campaign->get_meta('campaign_tiers');
				// If the tiers are empty, skip the campaign.
				if ( ! is_array( $tiers ) || empty( $tiers ) ) {
					continue;
				}
				// Calculate the tier price.
				$discounted_price = $this->calculate_tier_price( $tiers[0], $base_price );
				$type_data['tiers'] = $tiers;
			} 
			elseif( 'bogo' === $campaign_type ){
				$tiers = $campaign->get_meta('campaign_tiers');
				$parent_product_id = null;
				if($product->is_type('variation')){
					$parent_product_id = $product->get_parent_id();
				}
				$bogo_tier = $this->get_bogo_tier( $tiers, $product_id, $parent_product_id );
				if( ! $bogo_tier ){
					continue;
				}
				$get_product_id = $bogo_tier['get_product'];
				$get_product = wc_get_product( $get_product_id );
				if( ! $get_product ){
					wpab_cb_log('get_product not fund for product: ' . $get_product_id, 'ERROR' );
					continue;
				}

				// need to add condition edit or view depending on settings
				$discounted_price = (float) $product->get_price('edit') - ($get_product->get_price() / $bogo_tier['buy_quantity'] * $bogo_tier['get_quantity']);
				$bogo_tier['get_product_title'] = $get_product->get_title();
				$bogo_tier['buy_product_title'] = $product->get_title();
				$bogo_tier['get_link'] = $get_product->get_permalink();
				$type_data['bogo_tier'] = $bogo_tier;
			}
			// If the campaign is a scheduled or earlybird campaign, use the simple key.
			$campaign_type_key = $campaign_type;
			if( 'scheduled' === $campaign_type || 'earlybird' === $campaign_type ){
				$campaign_type_key = 'simple';
			}
			if( ! $discounted_price ){
				continue;
			}
			if( isset( $discount_data['discounts'][$campaign_type_key]['price'] ) && ! $this->is_better_campaign( $discount_data['discounts'][$campaign_type_key]['price'], $discounted_price )){
				continue;
			}

			$discount_data['on_campaign'] = true;	
			$discount_data['discounts'][$campaign_type_key] = $type_data;
			$discount_data['discounts'][$campaign_type_key]['price'] = $discounted_price;
		}
		$best_price = $base_price;
		if( isset( $discount_data['discounts']['simple']['price'] ) && $discount_data['discounts']['simple']['price'] < $best_price ){
			$best_price = $discount_data['discounts']['simple']['price'];
		}
		$discount_data['discounts']['best_price'] = $best_price;

		// Store the final, structured result in the cache for this page load.
		$this->product_discount_cache[ $product_id ] = $discount_data;
		if( defined( 'WP_DEBUG' ) && WP_DEBUG ){
			wpab_cb_log('------------------------------------------------------------------------------------------------', 'DEBUG' );
			wpab_cb_log('product_discount_cache: ' . $product_id . ' ' . $product->get_name(), 'DEBUG' );
			wpab_cb_log('base_price: ' . $base_price, 'DEBUG' );
			wpab_cb_log('best_price: ' . $best_price, 'DEBUG' );
			wpab_cb_log('on_sale: ' . $discount_data['on_sale'], 'DEBUG' );
			wpab_cb_log('on_campaign: ' . $discount_data['on_campaign'], 'DEBUG' );
			if( $discount_data['discounts']['simple']['price'] ){
				$simple = $discount_data['discounts']['simple'];
				wpab_cb_log('	simple_price: ' . $simple['price'], 'DEBUG' );
				wpab_cb_log('	simple_campaign_id: ' . $simple['campaign_id'], 'DEBUG' );
				wpab_cb_log('	simple_campaign_type: ' . $simple['campaign_type'], 'DEBUG' );
				wpab_cb_log('	simple_campaign_title: ' . $simple['campaign_title'], 'DEBUG' );
			}
			if( $discount_data['discounts']['bogo']['price'] ){
				$bogo = $discount_data['discounts']['bogo'];
				wpab_cb_log('	bogo_price: ' . $bogo['price'], 'DEBUG' );
				wpab_cb_log('	bogo_campaign_id: ' . $bogo['campaign_id'], 'DEBUG' );
				wpab_cb_log('	bogo_campaign_type: ' . $bogo['campaign_type'], 'DEBUG' );
				wpab_cb_log('	bogo_campaign_title: ' . $bogo['campaign_title'], 'DEBUG' );
			}
			if( $discount_data['discounts']['quantity']['price'] ){
				$quantity = $discount_data['discounts']['quantity'];
				wpab_cb_log('	quantity_price: ' . $quantity['price'], 'DEBUG' );
				wpab_cb_log('	quantity_campaign_id: ' . $quantity['campaign_id'], 'DEBUG' );
				wpab_cb_log('	quantity_campaign_type: ' . $quantity['campaign_type'], 'DEBUG' );
				wpab_cb_log('	quantity_campaign_title: ' . $quantity['campaign_title'], 'DEBUG' );
			}
		}
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
	 * Calculate the price for a BOGO campaign.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param WPAB_CB_Campaign $campaign The campaign object.	
	 * @param int     $product_id The product ID.
	 * @param float     $base_price The base price of the product.
	 * @return float The calculated price.
	 */
	private function get_bogo_tier( $tiers, $product_id, $parent_product_id ) {
		if( ! is_array( $tiers ) || empty( $tiers ) ){
			return null;
		}
		if( $parent_product_id ){
			foreach( $tiers as $tier ){
				if( $tier['buy_product'] === $product_id || $tier['buy_product'] === $parent_product_id ){
					return $tier;
				}
			}
		}else {
			foreach( $tiers as $tier ){
				if( $tier['buy_product'] === $product_id ){
					return $tier;
				}
			}
		}
	
		return null;
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
		if( ! $best_price ){
			return true;
		}
		// If the priority method is set to apply the highest price, return true if the tier price is less than the best price.
		if( 'apply_highest' === wpab_cb_get_options( 'product_priorityMethod' ) ){
			return  $tier_price < $best_price ;
		}
		// If the priority method is set to apply the lowest price, return true if the tier price is greater than the best price.
		return $tier_price > $best_price;
	}
}