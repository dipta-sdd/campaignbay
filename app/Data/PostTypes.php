<?php

namespace WpabCb\Data;

/**
 * The file that defines the custom post types and statuses for the plugin.
 *
 * A class definition that registers all post types and statuses for backend data storage.
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
 * The custom post type and status definition class.
 *
 * This is used to register the `wpab_cb_campaign` post type and the custom statuses
 * like 'Active', 'Scheduled', and 'Expired'. The post type itself has no visible UI in the admin,
 * as it is managed entirely by a React application via the REST API.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class PostTypes {
	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   PostTypes
	 * @access private
	 */
	private static $instance = null;
	/**
	 * Gets an instance of this object.
	 * Prevents duplicate instances which avoid artefacts and improves performance.
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
	 * A dummy constructor to prevent the class from being loaded more than once.
	 *
	 * @see PostTypes::get_instance()
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function __construct() {
		/* We do nothing here! */
	}

	/**
	 * Hook into WordPress actions and filters.
	 *
	 * @since 1.0.0
	 */
	public function run() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_post_statuses' ) );
		add_action( 'init', array( $this, 'register_meta_fields' ) );
		// This filter is kept for debugging purposes. It will only have an effect
		// if a developer temporarily sets 'show_ui' to true.
		add_filter( 'display_post_states', array( $this, 'add_display_post_states' ), 10, 2 );
	}

	/**
	 * Register the `wpab_cb_campaign` Custom Post Type.
	 *
	 * This CPT is registered without a visible UI in the admin area. It serves as a
	 * backend data store to be managed by the plugin's React interface via the REST API.
	 *
	 * Note: The 'Campaign Type' (category) and other rules are stored as post meta,
	 * not registered as part of the CPT itself. This is handled by the API controller.
	 *
	 * @since 1.0.0
	 */
	public function register_post_type() {
		$labels = array(
			'name'          => _x( 'Campaigns', 'Post Type General Name', WPAB_CB_TEXT_DOMAIN ),
			'singular_name' => _x( 'Campaign', 'Post Type Singular Name', WPAB_CB_TEXT_DOMAIN ),
			'all_items'     => __( 'All Campaigns', WPAB_CB_TEXT_DOMAIN ),
			'add_new_item'  => __( 'Add New Campaign', WPAB_CB_TEXT_DOMAIN ),
			'add_new'       => __( 'Add New', WPAB_CB_TEXT_DOMAIN ),
			'edit_item'     => __( 'Edit Campaign', WPAB_CB_TEXT_DOMAIN ),
			'update_item'   => __( 'Update Campaign', WPAB_CB_TEXT_DOMAIN ),
			'search_items'  => __( 'Search Campaign', WPAB_CB_TEXT_DOMAIN ),
			'not_found'     => __( 'Not Found', WPAB_CB_TEXT_DOMAIN ),
			'not_found_in_trash' => __( 'Not found in Trash', WPAB_CB_TEXT_DOMAIN ),
		);

		$args = array(
			'label'                 => __( 'Campaign', WPAB_CB_TEXT_DOMAIN ),
			'description'           => __( 'Campaign post type for managing discount campaigns.', WPAB_CB_TEXT_DOMAIN ),
			'labels'                => $labels,
			'supports'              => array( 'title', 'editor', 'custom-fields' ),
			'taxonomies'            => array(),
			'hierarchical'          => false,
			'public'                => false,
			'show_ui'               => false, // No UI in admin - managed by React
			'show_in_menu'          => false,
			'menu_position'         => 5,
			'show_in_admin_bar'     => false,
			'show_in_nav_menus'     => false,
			'can_export'            => true,
			'has_archive'           => false,
			'exclude_from_search'   => true,
			'publicly_queryable'    => false,
			'capability_type'       => 'post',
			'show_in_rest'          => true, // Enable REST API
			'rest_base'             => 'campaigns',
		);

		register_post_type( 'wpab_cb_campaign', $args );
	}

	/**
	 * Register custom post statuses for campaigns.
	 *
	 * These statuses are used to track the lifecycle of campaigns:
	 * - Active: Currently running and applying discounts
	 * - Scheduled: Set to start at a future date/time
	 * - Expired: Past its end date/time
	 *
	 * @since 1.0.0
	 */
	public function register_post_statuses() {
		register_post_status(
			'wpab_cb_active',
			array(
				'label'                     => _x( 'Active', 'post status', WPAB_CB_TEXT_DOMAIN ),
				'public'                    => true,
				'show_in_admin_all_list'    => false,
				'show_in_admin_status_list' => true,
				/* translators: %s: number of posts. */
				'label_count'               => _n_noop( 'Active <span class="count">(%s)</span>', 'Active <span class="count">(%s)</span>', WPAB_CB_TEXT_DOMAIN ),
			)
		);

		register_post_status(
			'wpab_cb_scheduled',
			array(
				'label'                     => _x( 'Scheduled', 'post status', WPAB_CB_TEXT_DOMAIN ),
				'public'                    => true,
				'show_in_admin_all_list'    => false,
				'show_in_admin_status_list' => true,
				/* translators: %s: number of posts. */
				'label_count'               => _n_noop( 'Scheduled <span class="count">(%s)</span>', 'Scheduled <span class="count">(%s)</span>', WPAB_CB_TEXT_DOMAIN ),
			)
		);

		register_post_status(
			'wpab_cb_expired',
			array(
				'label'                     => _x( 'Expired', 'post status', WPAB_CB_TEXT_DOMAIN ),
				'public'                    => true,
				'show_in_admin_all_list'    => false,
				'show_in_admin_status_list' => true,
				/* translators: %s: number of posts. */
				'label_count'               => _n_noop( 'Expired <span class="count">(%s)</span>', 'Expired <span class="count">(%s)</span>', WPAB_CB_TEXT_DOMAIN ),
			)
		);
	}

	/**
	 * Register the meta fields for the `wpab_cb_campaign` post type.
	 *
	 * This makes them available in the REST API for the React UI.
	 *
	 * @since 1.0.0
	 */
	public function register_meta_fields() {
		$meta_keys = wpab_cb_get_campaign_meta_keys(); 

		foreach ( $meta_keys as $meta_key ) {
			register_post_meta(
				'wpab_cb_campaign',
				'_wpab_cb_' . $meta_key, 
				array(
					'show_in_rest'  => true,
					'single'        => true, 
					'type'          => 'string', // A default type, can be more specific.
					'auth_callback' => function() {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}

		// Special handling for the tiers array
		register_post_meta(
			'wpab_cb_campaign',
			'_wpab_cb_campaign_tiers',
			array(
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => 'array',
				'auth_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * Add the custom post status to the display states.
	 *
	 * This is kept for debugging. It will only have a visible effect if a developer
	 * temporarily sets 'show_ui' to true in the CPT arguments.
	 *
	 * @param array   $post_states An array of post display states.
	 * @param WP_Post $post        The current post object.
	 * @return array  The modified post states.
	 */
	public function add_display_post_states( $post_states, $post ) {
		if ( ! is_admin() || $post->post_type !== 'wpab_cb_campaign' ) {
			return $post_states;
		}

		if ( 'wpab_cb_active' === $post->post_status ) {
			$post_states['wpab_cb_active'] = __( 'Active', WPAB_CB_TEXT_DOMAIN );
		}

		if ( 'wpab_cb_scheduled' === $post->post_status ) {
			$post_states['wpab_cb_scheduled'] = __( 'Scheduled', WPAB_CB_TEXT_DOMAIN );
		}

		if ( 'wpab_cb_expired' === $post->post_status ) {
			$post_states['wpab_cb_expired'] = __( 'Expired', WPAB_CB_TEXT_DOMAIN );
		}

		return $post_states;
	}
}