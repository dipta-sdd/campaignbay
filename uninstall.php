<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * This file is executed when a user clicks the "Delete" link for the CampaignBay
 * plugin in the WordPress admin panel. It is not executed on deactivation.
 *
 * @link       https://wpanchorbay.com
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Get the plugin's settings.
$options = get_option( 'campaignbay' ); // Use your actual option name.

// --- The Gatekeeper Check ---
// We only proceed with deletion if the user has explicitly opted in.
if ( ! empty( $options['advanced_deleteAllOnUninstall'] ) && true === $options['advanced_deleteAllOnUninstall'] ) {

	$all_campaigns_query = new WP_Query(
		array(
			'post_type'      => 'wpab_cb_campaign',
			'post_status'    => 'any', // Get all statuses, including drafts, trash, etc.
			'posts_per_page' => -1,
			'fields'         => 'ids',
		)
	);
	if ( $all_campaigns_query->have_posts() ) {
		foreach ( $all_campaigns_query->get_posts() as $post_id ) {
			wp_delete_post( $post_id, true ); // `true` forces permanent deletion.
		}
	}

	global $wpdb;
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}campaignbay_logs" );

	delete_option( 'campaignbay' );

	$editable_roles = get_editable_roles();
	foreach ( $editable_roles as $role_name => $role_info ) {
		$role = get_role( $role_name );
		if ( $role ) {
			$role->remove_cap( 'manage_campaignbay' );
		}
	}
}

// Note: Do not remove the log directory itself, as WordPress manages the uploads folder.