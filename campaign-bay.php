<?php
/**
 * Plugin Name:       CampaignBay
 * Plugin URI:        https://wpanchorbay.com/CampaignBay
 * Description:       CampaignBay for WooCommerce Product Discount WordPress Plugin.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            WP Anchor Bay
 * Author URI:        https://wpanchorbay.com
 * License:           MIT
 * License URI:       MIT
 * Text Domain:       wpab-cb
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'WPAB_CB_PATH', plugin_dir_path( __FILE__ ) );
define( 'WPAB_CB_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPAB_CB_URL', plugin_dir_url( __FILE__ ) );
define( 'WPAB_CB_VERSION', '1.0.0' );
define( 'WPAB_CB_PLUGIN_NAME', 'wpab-cb' );
define( 'WPAB_CB_TEXT_DOMAIN', 'wpab-cb' );
define( 'WPAB_CB_OPTION_NAME', 'wpab_cb' );
define( 'WPAB_CB_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'WPAB_CB_DEV_MODE', true );


/**
 * The code that runs during plugin activation.
 */
function wpab_cb_activate() {
	require_once WPAB_CB_PATH . 'includes/class-activator.php';
	WPAB_CB_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function wpab_cb_deactivate() {
	require_once WPAB_CB_PATH . 'includes/class-deactivator.php';
	WPAB_CB_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'wpab_cb_activate' );
register_deactivation_hook( __FILE__, 'wpab_cb_deactivate' );

/**
 * The core plugin class.
 */
require WPAB_CB_PATH . 'includes/main.php';

/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
function wpab_cb_run() {
	$plugin = new WPAB_CB();
	$plugin->run();
}
wpab_cb_run();
