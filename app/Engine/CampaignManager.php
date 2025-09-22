<?php

namespace WpabCb\Engine;

use WpabCb\Engine\Campaign;

/**
 * The file that defines the Campaign Manager class.
 *
 * A class definition that fetches and caches all active discount campaigns.
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
 * The Campaign Manager class.
 *
 * This class is responsible for querying for all active campaigns and caching the result
 * to prevent redundant database calls, especially on high-traffic frontend pages.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class CampaignManager {

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   CampaignManager
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
	 * Array of active campaign objects.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var Campaign[]|null
	 */
	private $active_campaigns = null;

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
	 * @see CampaignManager::get_instance()
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function __construct() {
		$this->hooks = array(
			array(
				'hook'     => 'campaignbay_campaign_save',
				'callback' => 'clear_cache',
				'priority' => 10,
				'accepted_args'     => 2,
				'type'     => 'action',
			),
			array(
				'hook'     => 'campaignbay_campaign_delete',
				'callback' => 'clear_cache',
				'priority' => 10,
				'accepted_args'     => 1,
				'type'     => 'action',
			),
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
	 * Get all active campaigns, using a multi-level cache.
	 *
	 * @since 1.0.0
	 * @return Campaign[] An array of active campaign objects.
	 */
	public function get_active_campaigns() {
		if ( null !== $this->active_campaigns ) {
			return $this->active_campaigns;
		}
		
		$cached_campaigns = get_transient( 'campaignbay_active_campaigns' );
		if ( false !== $cached_campaigns ) {
			campaignbay_log('cached_campaigns found', 'DEBUG' );
			$this->active_campaigns = $cached_campaigns;
			return $this->active_campaigns;
		}
		
		campaignbay_log('no cached campaigns found, fetching from database', 'DEBUG' );
		
		global $wpdb;
		$table_name = $wpdb->prefix . 'campaignbay_campaigns';
		
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table_name} WHERE status = %s ORDER BY date_created ASC",
				'active'
			)
		);
		
		$campaign_objects = array();
		if ( $results ) {
			foreach ( $results as $row ) {
				// Decode JSON fields
				$row->target_ids = ! empty( $row->target_ids ) ? json_decode( $row->target_ids, true ) : array();
				$row->tiers = ! empty( $row->tiers ) ? json_decode( $row->tiers, true ) : array();
				
				$campaign = new Campaign( $row );
				if ( $campaign ) {
					// Usage count is now stored directly in the table, no need to load separately
					$campaign_objects[ $campaign->get_id() ] = $campaign;
				}
			}
		} else {
			campaignbay_log('query has no campaigns', 'DEBUG' );
		}

		set_transient( 'campaignbay_active_campaigns', $campaign_objects, 60 * MINUTE_IN_SECONDS );
		$this->active_campaigns = $campaign_objects;
		return $this->active_campaigns;
	}

	/**
	 * Clears the active campaign transient cache.
	 *
	 * @since 1.0.0
	 */
	public function clear_cache($source = 'unknown') {
		campaignbay_log('clearing cache from ' . $source, 'DEBUG' );
		delete_transient( 'campaignbay_active_campaigns' );
		$this->active_campaigns = null;
	}
}