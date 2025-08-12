<?php

namespace WpabCb\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Import necessary classes
use WpabCb\Engine\Campaign;
use WpabCb\Engine\CampaignManager;
use WP_Post;

/**
 * Handles the WP-Cron scheduling for campaigns.
 *
 * This class is responsible for scheduling, unscheduling, and executing the activation
 * and expiration of time-based campaigns based on their post status.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class Scheduler {

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   Scheduler
	 * @access private
	 */
	private static $instance = null;

	/**
	 * The array of hooks to be registered by the main loader.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var array
	 */
	private $hooks = array();

	// Define our custom hook names as constants for consistency and to avoid typos.
	const ACTIVATION_HOOK   = 'wpab_cb_activate_campaign_event';
	const DEACTIVATION_HOOK = 'wpab_cb_deactivate_campaign_event';


	/**
	 * Gets an instance of this object.
	 *
	 * @static
	 * @access public
	 * @since 1.0.0
	 * @return Scheduler
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Private constructor to define hooks and enforce singleton pattern.
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
		// The main trigger to set up schedules when a campaign is saved or updated.
		$this->add_action( 'wpab_cb_campaign_save', 'handle_campaign_save', 10, 2 );

		// The hooks that our cron events will trigger to change the campaign status.
		$this->add_action( self::ACTIVATION_HOOK, 'run_campaign_activation', 10, 1 );
		$this->add_action( self::DEACTIVATION_HOOK, 'run_campaign_deactivation', 10, 1 );

		// Hook to clean up schedules if a campaign is deleted from the database.
		$this->add_action( 'wpab_cb_campaign_delete', 'clear_campaign_schedules_on_delete', 10, 1 );
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
	 * Main handler that runs when a campaign post is saved.
	 * It decides whether to schedule or unschedule events based on the new post status.
	 *
	 * @param int     $campaign_id The post ID of the campaign.
	 * @param WP_Post $campaign    The post object.
	 */
	public function handle_campaign_save( $campaign_id, $campaign ) {
		// First, always clear any previously scheduled events for this campaign.
		// This handles cases where a user unschedules a campaign by changing its status to draft or active.
		$this->clear_campaign_schedules( $campaign_id );
		$status = $campaign->get_status();
		if ( 'wpab_cb_scheduled' !== $status ) {
			wpab_cb_log( sprintf( 'Campaign #%d status is "%s", not "scheduled". No new events will be scheduled.', $campaign_id, $campaign->get_status() ), 'DEBUG' );
			return;
		}

		$start_datetime = $campaign->get_meta( 'start_datetime' );
		$end_datetime   = $campaign->get_meta( 'end_datetime' );
		$site_timezone = wp_timezone_string();
		wpab_cb_log( 'start_datetime ('. $site_timezone .'): ' . $start_datetime, 'DEBUG' );
		wpab_cb_log( 'end_datetime ('. $site_timezone .'): ' . $end_datetime, 'DEBUG' );
		$start_datetime = date( 'Y-m-d H:i:s', strtotime( $start_datetime . ' ' . $site_timezone ) );
		$end_datetime = date( 'Y-m-d H:i:s', strtotime( $end_datetime . ' ' . $site_timezone ) );
		wpab_cb_log( 'start_datetime (UTC): ' . $start_datetime, 'DEBUG' );
		wpab_cb_log( 'end_datetime (UTC): ' . $end_datetime, 'DEBUG' );
		// // Convert ISO 8601 date strings to Unix timestamps for scheduling.
		$start_timestamp = $start_datetime ? strtotime( $start_datetime ) : null;
		$end_timestamp   = $end_datetime ? strtotime( $end_datetime ) : null;
		$current_time    = time();
	
		// Schedule the activation event if the start time is in the future.
		if ( $start_timestamp && $start_timestamp > $current_time ) {
			wp_schedule_single_event( $start_timestamp, self::ACTIVATION_HOOK, array( 'campaign_id' => $campaign_id ) );
			wpab_cb_log( sprintf( 'Scheduled activation for campaign #%s at timestamp %s.', $campaign_id, $start_timestamp ), 'INFO' );
		} elseif ( $start_timestamp && $start_timestamp <= $current_time ) {
			$this->run_campaign_activation( $campaign_id );
			wpab_cb_log( sprintf( 'Campaign #%s activation time is in the past, running activation now.', $campaign_id ), 'INFO' );
		}

		// Schedule the deactivation event if the end time is in the future.
		if ( $end_timestamp && $end_timestamp > $current_time ) {
			wp_schedule_single_event( $end_timestamp, self::DEACTIVATION_HOOK, array( 'campaign_id' => $campaign_id ) );
			wpab_cb_log( sprintf( 'Scheduled deactivation for campaign #%s at timestamp %s.', $campaign_id, $end_timestamp ), 'INFO' );
		}
	}

	/**
	 * Runs when the activation cron event fires. Changes status to 'active'.
	 *
	 * @param int $campaign_id The ID of the campaign to activate.
	 */
	public function run_campaign_activation( $campaign_id ) {
		wpab_cb_log( sprintf( 'WP-Cron: Running activation for campaign #%d.', $campaign_id ), 'INFO' );
		
		// Update the post status to 'active'.
		wp_update_post(
			array(
				'ID'          => $campaign_id,
				'post_status' => 'wpab_cb_active',
			)
		);
		// Clear the main campaign cache so the change is reflected immediately on the frontend.
		CampaignManager::get_instance()->clear_cache('scheduler');
	}

	/**
	 * Runs when the deactivation cron event fires. Changes status to 'expired'.
	 *
	 * @param int $campaign_id The ID of the campaign to expire.
	 */
	public function run_campaign_deactivation( $campaign_id ) {
		wpab_cb_log( sprintf( 'WP-Cron: Running deactivation for campaign #%d.', $campaign_id ), 'INFO' );
		
		// Update the post status to 'expired'.
		wp_update_post(
			array(
				'ID'          => $campaign_id,
				'post_status' => 'wpab_cb_expired',
			)
		);
		// Clear the main campaign cache.
		CampaignManager::get_instance()->clear_cache('scheduler');
	}

	/**
	 * Clears schedules when a post is about to be deleted.
	 *
	 * @param int $campaign_id The post ID being deleted.
	 */
	public function clear_campaign_schedules_on_delete( $campaign_id ) {
		if ( 'wpab_cb_campaign' === get_post_type( $campaign_id ) ) {
			$this->clear_campaign_schedules( $campaign_id );
		}
	}

	/**
	 * Clears all scheduled cron events associated with a specific campaign.
	 *
	 * @param int $campaign_id The post ID of the campaign.
	 */
	private function clear_campaign_schedules( $campaign_id	 ) {
		// We must pass the same arguments array we used when scheduling to ensure the correct hook is cleared.
		$args = array( 'campaign_id' => $campaign_id );
		wp_clear_scheduled_hook( self::ACTIVATION_HOOK, $args );
		wp_clear_scheduled_hook( self::DEACTIVATION_HOOK, $args );
		wpab_cb_log( sprintf( 'Cleared all schedules for campaign #%d.', $campaign_id ), 'DEBUG' );
	}

	/**
	 * Adds a new action to the hooks array.
	 *
	 * @param string $hook The hook name.
	 * @param string $callback The callback method on this object.
	 * @param int    $priority The priority.
	 * @param int    $accepted_args The number of accepted arguments.
	 */
	private function add_action( $hook, $callback, $priority = 10, $accepted_args = 2 ) {
		$this->hooks[] = array(
			'type'          => 'action',
			'hook'          => $hook,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args,
		);
	}
}