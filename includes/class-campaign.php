<?php
/**
 * The file that defines the Campaign model class.
 *
 * A class definition that encapsulates all data and functionality for a single discount campaign.
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
 * The Campaign model class.
 *
 * This class represents a single discount campaign and provides methods
 * to create, read, update, and delete campaign data.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class WPAB_CB_Campaign {

	/**
	 * The campaign Post ID.
	 *
	 * @since 1.0.0
	 * @access public
	 * @var int
	 */
	public $id = 0;

	/**
	 * The WP_Post object for the campaign.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var WP_Post|null
	 */
	private $post;

	/**
	 * The campaign's metadata.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var array
	 */
	private $meta = array();

	/**
	 * A flat list of all product and variation IDs this campaign applies to.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var int[]
	 */
	private $applicable_product_ids = array();

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 * @param int|WP_Post $campaign The campaign ID or WP_Post object.
	 */
	public function __construct( $campaign ) {
		if ( $campaign instanceof WP_Post ) {
			$this->id   = $campaign->ID;
			$this->post = $campaign;
		} elseif ( is_numeric( $campaign ) ) {
			$this->id   = absint( $campaign );
			$this->post = get_post( $this->id );
		}

		if ( ! $this->post || 'wpab_cb_campaign' !== $this->post->post_type ) {
			throw new Exception( 'Invalid campaign provided.' );
		}

		$this->load_meta();
		$this->load_applicable_product_ids(); // Pre-calculate the list of products this campaign applies to.
	}


	/**
	 * Populates the applicable_product_ids property based on the campaign's targeting rules.
	 * This is the core logic for pre-calculating which products are affected.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function load_applicable_product_ids() {
		$target_type = $this->get_meta( 'target_type' );
		$target_ids  = $this->get_meta( 'target_ids' );


		if ( 'entire_store' === $target_type ) {
			// For store-wide, the list is empty. The pricing engine will interpret this as "applies to all".
			$this->applicable_product_ids = array();
			return;
		}

		if ( empty( $target_ids ) || ! is_array( $target_ids ) ) {
			$this->applicable_product_ids = array();
			return;
		}

		$product_ids = array();

		if ( 'category' === $target_type ) {
			$product_ids = $this->get_products_from_categories( $target_ids );
		} elseif ( 'product' === $target_type ) {
			$product_ids = $target_ids;
		}
		// After getting the initial list, expand any variable products to include their variations.
		$this->applicable_product_ids = $this->expand_variable_products( $product_ids );
	}

	/**
	 * Gets all product IDs from a given list of category term IDs.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param int[] $category_ids An array of category term IDs.
	 * @return int[] An array of product IDs.
	 */
	private function get_products_from_categories( $category_ids ) {
		$category_ids = array_map( 'absint', $category_ids );
		$args = array(
			'product_category_id' => $category_ids,
			'limit'    => -1, // Get all matching products.
			'return'   => 'ids', // Performance: only return the IDs.
		);
		$products = wc_get_products( $args );
		if ( is_wp_error( $products ) ) {
			return array();
		}
		return $products;
	}

	/**
	 * Expands a given list of product IDs to also include all of their variation IDs.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param int[] $product_ids An array of product IDs.
	 * @return int[] A final, flat array of all parent and variation IDs.
	 */
	private function expand_variable_products( $product_ids ) {
		$final_ids = array();
		if ( empty( $product_ids ) ) {
			return $final_ids;
		}

		foreach ( $product_ids as $id ) {
			$product = wc_get_product( $id );
			if ( ! $product ) {
				continue; // Skip if product has been deleted.
			}

			// Add the parent product ID itself.
			$final_ids[] = $product->get_id();

			// If it's a variable product, get its children (the variations).
			if ( $product->is_type( 'variable' ) ) {
				$variation_ids = $product->get_children();
				if ( ! empty( $variation_ids ) ) {
					$final_ids = array_merge( $final_ids, $variation_ids );
				}
			}
		}

		// Ensure the final list has only unique, integer IDs.
		return array_unique( array_map( 'absint', $final_ids ) );
	}

	/**
	 * Get the final, pre-calculated list of all applicable product and variation IDs.
	 *
	 * @since 1.0.0
	 * @return int[]
	 */
	public function get_applicable_product_ids() {
		return $this->applicable_product_ids;
	}

	/**
	 * Checks if this campaign's targeting rules apply to a given product.
	 *
	 * This is the primary method to determine if a product is eligible for this campaign.
	 * It leverages the pre-calculated list of applicable product IDs for high performance.
	 *
	 * @since 1.0.0
	 * @param WC_Product|int $product The product object or product ID to check.
	 * @return bool True if the product is a match, false otherwise.
	 */
	public function is_applicable_to_product( $product ) {

		if ( is_numeric( $product ) ) {
			$product_id = absint( $product );
		} else {
			return false; // Invalid input.
		}

		if ( ! $product_id ) {
			return false;
		}

		// 1. Check for the simplest case: a store-wide discount.
		if ( 'entire_store' === $this->get_meta( 'target_type' ) ) {
			return true;
		}
		return in_array( $product_id, $this->get_applicable_product_ids(), true );
	}


	public static function throw_validation_error( $field = '' ) {
		return new WP_Error( 'rest_invalid_param', 'Invalid parameter(s): ' . $field,
		 array( 'params' => array( $field => 'Invalid parameter(s): ' . $field ) ) );
	}

	/**
	 * Create a new campaign.
	 *
	 * @since 1.0.0
	 * @static
	 * @param array $args The arguments to create the campaign with.
	 * @return WPAB_CB_Campaign|WP_Error The new campaign object or a WP_Error on failure.
	 */
	public static function create( $args ) {
		$defaults = array(
			'status'        => 'wpab_cb_active',
		);
		$args     = wp_parse_args( $args, $defaults );
		if ( empty( $args['title'] ) ) {
			return self::throw_validation_error( 'title' );
		}
		if ( empty( $args['campaign_type'] ) ) {
			return self::throw_validation_error( 'campaign_type' );
		}
		$allowed_types = array( 'earlybird', 'bogo', 'scheduled', 'quantity' );
		if ( ! in_array( $args['campaign_type'], $allowed_types, true ) ) {
			return self::throw_validation_error( 'campaign_type' );
		}

		$post_data = array(
			'post_title'  => sanitize_text_field( $args['title'] ),
			'post_type'   => 'wpab_cb_campaign',
			'post_status' => sanitize_key( $args['status'] ),
		);
		$campaign_id = wp_insert_post( $post_data, true );

		if ( is_wp_error( $campaign_id ) ) {
			return $campaign_id;
		}

		// --- Save Meta ---
		$campaign = new self( $campaign_id );
		$campaign->update_meta_from_args( $args );

		return $campaign;
	}



	/**
	 * Update an existing campaign's data.
	 *
	 * @since 1.0.0
	 * @param array $args The arguments to update the campaign with.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public function update( $args ) {
		// --- Update Post Data (if provided) ---
		$post_data = array();
		if ( isset( $args['title'] ) ) {
			$post_data['post_title'] = sanitize_text_field( $args['title'] );
		}
		if ( isset( $args['status'] ) ) {
			$post_data['post_status'] = sanitize_key( $args['status'] );
		}

		if ( ! empty( $post_data ) ) {
			$post_data['ID'] = $this->id;
			$result          = wp_update_post( $post_data, true );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		$this->update_meta_from_args( $args );

		return true;
	}

	/**
	 * Delete a campaign.
	 *
	 * @since 1.0.0
	 * @static
	 * @param int  $campaign_id The ID of the campaign to delete.
	 * @param bool $force_delete Whether to bypass the trash and delete permanently.
	 * @return WP_Post|false|null The deleted post object on success, false or null on failure.
	 */
	public static function delete( $campaign_id, $force_delete = true ) {
		return wp_delete_post( $campaign_id, $force_delete );
	}

	/**
	 * Loads all relevant metadata for the campaign into the object.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function load_meta() {
		$meta_keys = wpab_cb_get_campaign_meta_keys();
		foreach ( $meta_keys as $key ) {
			$this->meta[ $key ] = get_post_meta( $this->id, '_wpab_cb_' . $key, true );
		}
	}


	/**
	 * Updates post meta from a given array of arguments.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param array $args The arguments to save as metadata.
	 */
	private function update_meta_from_args( $args ) {
		$meta_keys = wpab_cb_get_campaign_meta_keys();
		foreach ( $meta_keys as $key ) {
			if ( isset( $args[ $key ] ) ) {
				$value = $this->sanitize_meta_value( $key, $args[ $key ] );
				$this->update_meta( $key, $value );
			}
		}
	}

	/**
	 * Sanitize a meta value based on its key.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param string $key The meta key.
	 * @param mixed  $value The raw value.
	 * @return mixed The sanitized value.
	 */
	private function sanitize_meta_value( $key, $value ) {
		switch ( $key ) {
			case 'discount_value':
				return floatval( $value );

			case 'min_quantity':
			case 'start_timestamp':
			case 'end_timestamp':
			case 'priority':
			case 'usage_limit':
				return absint( $value );

			case 'exclude_sale_items':
			case 'apply_to_shipping':
			case 'schedule_enabled':
				return (bool) $value;

			case 'target_ids':
				return is_array( $value ) ? array_map( 'absint', $value ) : array();

			case 'campaign_type':
			case 'rule_status':
			case 'discount_type':
			case 'target_type':
			case 'timezone_string':
				return sanitize_key( $value );
			case 'campaign_tiers':
				return is_array( $value ) ? array_map( array( $this, 'sanitize_tier_item' ), $value ) : array();

			default:
				return sanitize_text_field( $value );
		}
	}

	/**
	 * Sanitizes a single tier item from the campaign_tiers array.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param array $tier The tier array to sanitize.
	 * @return array The sanitized tier array.
	 */
	private function sanitize_tier_item( $tier ) {
		if ( ! is_array( $tier ) ) {
			return array();
		}

		$sanitized_tier = array();

		$sanitized_tier['id']    = isset( $tier['id'] ) ? absint( $tier['id'] ) : 0;
		$sanitized_tier['min']   = isset( $tier['min'] ) ? absint( $tier['min'] ) : 0;
		$sanitized_tier['max']   = isset( $tier['max'] ) ? sanitize_text_field( $tier['max'] ) : ''; // Max can be empty or a number.
		$sanitized_tier['value'] = isset( $tier['value'] ) ? floatval( $tier['value'] ) : 0;
		$sanitized_tier['type']  = isset( $tier['type'] ) ? sanitize_key( $tier['type'] ) : 'percentage';

		return $sanitized_tier;
	}


	/**
	 * Get a specific piece of metadata.
	 *
	 * @since 1.0.0
	 * @param string $key The meta key (without prefix).
	 * @return mixed The value of the meta key.
	 */
	public function get_meta( $key ) {
		return isset( $this->meta[ $key ] ) ? $this->meta[ $key ] : null;
	}

	/**
	 * Update a single piece of metadata in the database and in the object.
	 *
	 * @since 1.0.0
	 * @param string $key The meta key (without prefix).
	 * @param mixed  $value The value to save.
	 */
	public function update_meta( $key, $value ) {
		$this->meta[ $key ] = $value;
		update_post_meta( $this->id, '_wpab_cb_' . $key, $value );
	}

	/**
	 * Getters for core properties.
	 */
	public function get_id() {
		return $this->id;
	}

	public function get_title() {
		return $this->post->post_title;
	}

	public function get_status() {
		return $this->post->post_status;
	}


}


if ( ! function_exists( 'wpab_cb_get_campaign' ) ) {
	/**
	 * Helper function to get a campaign object.
	 *
	 * @since 1.0.0
	 * @param int|WP_Post $campaign The ID or post object of the campaign.
	 * @return WPAB_CB_Campaign|null The campaign object, or null if not found.
	 */
	function wpab_cb_get_campaign( $campaign ) {
		try {
			return new WPAB_CB_Campaign( $campaign );
		} catch ( Exception $e ) {
			wpab_cb_log( 'wpab_cb_get_campaign error: ' . $e->getMessage() );
			return null;
		}
	}
}

