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
			'title'         => '',
			'status'        => 'draft',
			'campaign_type' => '',
		);
		$args     = wp_parse_args( $args, $defaults );

		// --- Validation ---
		if ( empty( $args['title'] ) ) {
			return new WP_Error( 'missing_title', 'A campaign title is required.' );
		}
		if ( empty( $args['campaign_type'] ) ) {
			return new WP_Error( 'missing_campaign_type', 'A campaign type is required.' );
		}
		$allowed_types = array( 'earlybird', 'bogo', 'recurring', 'amount_discount', 'quantity_discount' );
		if ( ! in_array( $args['campaign_type'], $allowed_types, true ) ) {
			return new WP_Error( 'invalid_campaign_type', 'The provided campaign type is not valid.' );
		}

		// --- Create Post ---
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

		// --- Update Meta Data ---
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
		$meta_keys = self::get_meta_keys();
		foreach ( $meta_keys as $key ) {
			$this->meta[ $key ] = get_post_meta( $this->id, '_wpab_cb_' . $key, true );
		}
	}

	/**
	 * A helper function to get all defined meta keys.
	 *
	 * @since 1.0.0
	 * @static
	 * @return array
	 */
	public static function get_meta_keys() {
		return array(
			'campaign_type', 
			'rule_status',// The current state of the rule. (e.g., 'active', 'scheduled', 'expired', 'inactive').
			'discount_type',  // The type of discount (e.g., 'percentage', 'fixed').
			'discount_value', // The value of the discount.
			'target_type', // The type of target (e.g., 'product', 'category').
			'target_ids', // The IDs of the target products or categories.
            'min_quantity', // Minimum quantity required for the discount to apply.
			'exclude_sale_items', // Whether to exclude items on sale from the discount.
            'apply_to_shipping', // Whether the discount applies to shipping costs.
			'schedule_enabled', // Whether the campaign has a schedule.
			'start_timestamp', // The start time of the campaign in Unix timestamp.
			'end_timestamp', // The end time of the campaign in Unix timestamp.
			'timezone_string', // The timezone string for the campaign.
            'priority', // The priority of the campaign.
            'usage_limit', // The total number of times the campaign can be used.
		);
	}

	/**
	 * Updates post meta from a given array of arguments.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param array $args The arguments to save as metadata.
	 */
	private function update_meta_from_args( $args ) {
		$meta_keys = self::get_meta_keys();

		foreach ( $meta_keys as $key ) {
			if ( isset( $args[ $key ] ) ) {
				// Simple sanitization, can be expanded.
				$value = is_array( $args[ $key ] ) ? array_map( 'sanitize_text_field', $args[ $key ] ) : sanitize_text_field( $args[ $key ] );
				$this->update_meta( $key, $value );
			}
		}
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

