<?php

namespace WpabCb\Engine;

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

// Import WordPress classes
use WP_Query;
use WP_Post;
use Exception;

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
class Campaign {

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

		if ( empty( $target_type ) || empty( $target_ids ) ) {
			return;
		}

		switch ( $target_type ) {
			case 'product':
				$this->applicable_product_ids = $this->expand_variable_products( $target_ids );
				break;
			case 'category':
				$this->applicable_product_ids = $this->get_products_from_categories( $target_ids );
				break;
		}
	}

	/**
	 * Gets all product IDs from the specified category IDs.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param array $category_ids Array of category IDs.
	 * @return array Array of product IDs.
	 */
	private function get_products_from_categories( $category_ids ) {
		$product_ids = array();

		foreach ( $category_ids as $category_id ) {
			$args = array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'tax_query'      => array(
					array(
						'taxonomy' => 'product_cat',
						'field'    => 'term_id',
						'terms'    => $category_id,
					),
				),
				'fields'         => 'ids',
			);

			$query = new WP_Query( $args );
			$product_ids = array_merge( $product_ids, $query->posts );
		}

		return $this->expand_variable_products( $product_ids );
	}

	/**
	 * Expands variable products to include their variations.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param array $product_ids Array of product IDs.
	 * @return array Array of product and variation IDs.
	 */
	private function expand_variable_products( $product_ids ) {
		$expanded_ids = array();

		foreach ( $product_ids as $product_id ) {
			$product = wc_get_product( $product_id );

			if ( ! $product ) {
				continue;
			}

			if ( $product->is_type( 'variable' ) ) {
				// For variable products, include all variations.
				$variation_ids = $product->get_children();
				$expanded_ids = array_merge( $expanded_ids, $variation_ids );
			} else {
				// For simple products, include the product itself.
				$expanded_ids[] = $product_id;
			}
		}

		return array_unique( $expanded_ids );
	}

	/**
	 * Gets the list of product IDs this campaign applies to.
	 *
	 * @since 1.0.0
	 * @return array Array of product IDs.
	 */
	public function get_applicable_product_ids() {
		return $this->applicable_product_ids;
	}

	/**
	 * Checks if this campaign applies to a specific product.
	 *
	 * @since 1.0.0
	 * @param int|WC_Product $product The product ID or WC_Product object.
	 * @return bool True if the campaign applies to the product, false otherwise.
	 */
	public function is_applicable_to_product( $product ) {
		$product_id = is_object( $product ) ? $product->get_id() : absint( $product );
		return in_array( $product_id, $this->applicable_product_ids, true );
	}

	/**
	 * Throws a validation error with a specific field message.
	 *
	 * @since 1.0.0
	 * @param string $field The field name that failed validation.
	 * @throws Exception Always throws an exception.
	 */
	public static function throw_validation_error( $field = '' ) {
		$message = 'Campaign validation failed.';
		if ( ! empty( $field ) ) {
			$message .= " Field: {$field}";
		}
		throw new Exception( $message );
	}

	/**
	 * Creates a new campaign.
	 *
	 * @since 1.0.0
	 * @param array $args The campaign arguments.
	 * @return Campaign The created campaign object.
	 * @throws Exception If validation fails.
	 */
	public static function create( $args ) {
		// Validate required fields.
		if ( empty( $args['title'] ) ) {
			self::throw_validation_error( 'title' );
		}

		if ( empty( $args['campaign_type'] ) ) {
			self::throw_validation_error( 'campaign_type' );
		}

		// Create the post.
		$post_data = array(
			'post_title'  => sanitize_text_field( $args['title'] ),
			'post_status' => 'publish',
			'post_type'   => 'wpab_cb_campaign',
		);

		$post_id = wp_insert_post( $post_data );

		if ( is_wp_error( $post_id ) ) {
			throw new Exception( 'Failed to create campaign post.' );
		}

		// Create the campaign object and update it with the provided arguments.
		$campaign = new self( $post_id );
		$campaign->update( $args );

		return $campaign;
	}

	/**
	 * Updates the campaign with new data.
	 *
	 * @since 1.0.0
	 * @param array $args The campaign arguments to update.
	 * @return bool True on success, false on failure.
	 */
	public function update( $args ) {
		// Update the post title if provided.
		if ( ! empty( $args['title'] ) ) {
			$post_data = array(
				'ID'          => $this->id,
				'post_title'  => sanitize_text_field( $args['title'] ),
			);
			wp_update_post( $post_data );
		}

		// Update the metadata.
		$this->update_meta_from_args( $args );

		// Reload the applicable product IDs.
		$this->load_applicable_product_ids();

		return true;
	}

	/**
	 * Deletes a campaign.
	 *
	 * @since 1.0.0
	 * @param int  $campaign_id The campaign ID to delete.
	 * @param bool $force_delete Whether to force delete or move to trash.
	 * @return bool True on success, false on failure.
	 */
	public static function delete( $campaign_id, $force_delete = true ) {
		$result = wp_delete_post( $campaign_id, $force_delete );
		return ! is_wp_error( $result ) && $result !== false;
	}

	/**
	 * Loads all metadata for this campaign.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function load_meta() {
		$meta_keys = array(
			'campaign_type',
			'rule_status',
			'discount_type',
			'discount_value',
			'target_type',
			'target_ids',
			'campaign_tiers',
			'timezone_string',
		);

		foreach ( $meta_keys as $key ) {
			$value = get_post_meta( $this->id, '_wpab_cb_' . $key, true );
			$this->meta[ $key ] = $value;
		}
	}

	/**
	 * Updates metadata from the provided arguments.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param array $args The arguments containing metadata.
	 */
	private function update_meta_from_args( $args ) {
		$meta_keys = array(
			'campaign_type',
			'rule_status',
			'discount_type',
			'discount_value',
			'target_type',
			'target_ids',
			'campaign_tiers',
			'timezone_string',
		);

		foreach ( $meta_keys as $key ) {
			if ( isset( $args[ $key ] ) ) {
				$sanitized_value = $this->sanitize_meta_value( $key, $args[ $key ] );
				$this->update_meta( $key, $sanitized_value );
			}
		}
	}

	/**
	 * Sanitizes a metadata value based on the key.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param string $key The metadata key.
	 * @param mixed  $value The value to sanitize.
	 * @return mixed The sanitized value.
	 */
	private function sanitize_meta_value( $key, $value ) {
		switch ( $key ) {
			case 'discount_value':
				return floatval( $value );
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

