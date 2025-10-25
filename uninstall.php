<?php
/**
 * Fired when the user clicks the "Delete" link for the CampaignBay plugin.
 *
 * This file is executed when a user uninstalls the plugin. It ensures that all
 * custom database tables, options, and other data are cleaned up if the user
 * has opted in to data removal.
 *
 * @link       https://campaignbay.github.io
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}


// Get the plugin's settings using the correct option name.
$options = get_option('campaignbay');

/**
 * --- The Gatekeeper Check ---
 *
 * We only proceed with the full data deletion if the user has explicitly
 * checked the "Delete All Data on Uninstall" box in the plugin's advanced settings.
 * This is a crucial safety feature to prevent accidental data loss.
 */
if (!empty($options['advanced_deleteAllOnUninstall']) && true === $options['advanced_deleteAllOnUninstall']) {

	// Access the global WordPress database object.
	global $wpdb;

	// --- 1. Define the custom table names ---
	$campaigns_table = $wpdb->prefix . 'campaignbay' . '_campaigns';
	$logs_table = $wpdb->prefix . 'campaignbay' . '_logs';

	// --- 2. Drop the custom database tables ---
	//phpcs:ignore
	$wpdb->query("DROP TABLE IF EXISTS {$campaigns_table}");
	//phpcs:ignore
	$wpdb->query("DROP TABLE IF EXISTS {$logs_table}");

	// --- 3. Delete the plugin's options from the wp_options table ---
	delete_option('campaignbay');

	// --- 4. (Optional) Clean up custom capabilities if you added any ---
	// This code is safe to run even if you haven't added capabilities yet.
	$editable_roles = get_editable_roles();
	foreach ($editable_roles as $role_name => $role_info) {
		$role = get_role($role_name);
		if ($role && $role->has_cap('manage_campaignbay')) { // Example capability
			$role->remove_cap('manage_campaignbay');
		}
	}

	$custom_capability = 'manage_campaignbay';

	$admin_role = get_role('administrator');
	if ($admin_role && $admin_role->has_cap($custom_capability)) {
		$admin_role->remove_cap($custom_capability);
	}

	$manager_role = get_role('shop_manager');
	if ($manager_role && $manager_role->has_cap($custom_capability)) {
		$manager_role->remove_cap($custom_capability);
	}
}
