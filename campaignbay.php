<?php
/**
 * Plugin Name:       CampaignBay
 * Plugin URI:        https://campaignbay.github.io
 * Description:       CampaignBay for WooCommerce Product Discount WordPress Plugin.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Requires Plugins:  woocommerce
 * WC requires at least: 6.1
 * Version:           1.0.0
 * Author:            WP Anchor Bay
 * Author URI:        https://wpanchorbay.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       campaignbay
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// --- 1. Define all your constants as before ---
define( 'CAMPAIGNBAY_PATH', plugin_dir_path( __FILE__ ) );
define( 'CAMPAIGNBAY_DIR', plugin_dir_path( __FILE__ ) );
define( 'CAMPAIGNBAY_URL', plugin_dir_url( __FILE__ ) );
define( 'CAMPAIGNBAY_VERSION', '0.0.5' );
define( 'CAMPAIGNBAY_PLUGIN_NAME', 'campaignbay' );
define( 'CAMPAIGNBAY_TEXT_DOMAIN', 'campaignbay' );
define( 'CAMPAIGNBAY_OPTION_NAME', 'campaignbay' );
define( 'CAMPAIGNBAY_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'CAMPAIGNBAY_DEV_MODE', true );

spl_autoload_register( function ( $class ) {
	// Only handle our plugin's classes
	if ( strpos( $class, 'WpabCb\\' ) !== 0 ) {
		return;
	}
	// Convert namespace to file path
	$file = CAMPAIGNBAY_PATH . 'app/' . str_replace( '\\', '/', substr( $class, 7 ) ) . '.php';
	
	// Load the file if it exists
	if ( file_exists( $file ) ) {
		require_once $file;
	}
} );

require_once CAMPAIGNBAY_PATH . 'app/functions.php';


register_activation_hook( __FILE__, [ \WpabCb\Core\Activator::class, 'activate' ] );
register_deactivation_hook( __FILE__, [ \WpabCb\Core\Deactivator::class, 'deactivate' ] );

/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
function campaignbay_run() {
	$plugin = \WpabCb\Core\Plugin::get_instance();
	$plugin->run();
}
campaignbay_run();
