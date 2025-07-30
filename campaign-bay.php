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

// --- 1. Define all your constants as before ---
define( 'WPAB_CB_PATH', plugin_dir_path( __FILE__ ) );
define( 'WPAB_CB_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPAB_CB_URL', plugin_dir_url( __FILE__ ) );
define( 'WPAB_CB_VERSION', '0.0.5' );
define( 'WPAB_CB_PLUGIN_NAME', 'wpab-cb' );
define( 'WPAB_CB_TEXT_DOMAIN', 'wpab-cb' );
define( 'WPAB_CB_OPTION_NAME', 'wpab_cb' );
define( 'WPAB_CB_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'WPAB_CB_DEV_MODE', true );
// --- 2. Simple autoloader for our namespaced classes ---
spl_autoload_register( function ( $class ) {
	// Only handle our plugin's classes
	if ( strpos( $class, 'WpabCb\\' ) !== 0 ) {
		return;
	}

	// Convert namespace to file path
	$file = WPAB_CB_PATH . 'app/' . str_replace( '\\', '/', substr( $class, 7 ) ) . '.php';
	
	// Load the file if it exists
	if ( file_exists( $file ) ) {
		require_once $file;
	}
} );

// --- 3. Include helper functions ---
require_once WPAB_CB_PATH . 'app/functions.php';


// --- 4. Update Activation/Deactivation hooks to use the new namespaced classes ---
register_activation_hook( __FILE__, [ \WpabCb\Core\Activator::class, 'activate' ] );
register_deactivation_hook( __FILE__, [ \WpabCb\Core\Deactivator::class, 'deactivate' ] );

/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
function wpab_cb_run() {
	// --- 5. Instantiate your main plugin class using its full, namespaced name ---
	$plugin = \WpabCb\Core\Plugin::get_instance();
	$plugin->run();
}
wpab_cb_run();

// composer dump-autoload -o