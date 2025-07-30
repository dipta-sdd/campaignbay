<?php // phpcs:ignore Class file names should be based on the class name with "class-" prepended.

namespace WpabCb\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fired during plugin deactivation
 *
 *
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBayincludes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBayincludes
 * @author     dipta-sdd <sankarsandipta@gmail.com>
 */
class Deactivator {

	/**
	 * Fired during plugin deactivation.
	 *
	 * Removing options and all data related to plugin if user select remove data on deactivate.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
		// if the user has selected to delete all data on deactivation, remove the options.
		if ( wpab_cb_get_options( 'deleteAll' ) ) {
			delete_option( WPAB_CB_OPTION_NAME );
		}
	}
} 
