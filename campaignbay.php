<?php
/**
 * Plugin Name:       CampaignBay
 * Plugin URI:        https://wpanchorbay.com/campaignbay
 * Source URI:        https://github.com/dipta-sdd/campaignbay
 * Description:       Automated Discount Campaigns & Flash Sales for WooCommerce.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Requires Plugins:  woocommerce
 * WC requires at least: 6.1
 * Version:           1.0.0
 * Stable tag:        1.0.0
 * Author:            WP Anchor Bay
 * Author URI:        https://wpanchorbay.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       campaignbay
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
	die;
}

// --- 1. Define all your constants as before ---
/**
 * The main plugin directory path.
 */
define('CAMPAIGNBAY_PATH', plugin_dir_path(__FILE__));
/**
 * The main plugin directory.
 */
define('CAMPAIGNBAY_DIR', plugin_dir_path(__FILE__));
/**
 * The main plugin URL.
 */
define('CAMPAIGNBAY_URL', plugin_dir_url(__FILE__));
/**
 * The plugin version.
 */
define('CAMPAIGNBAY_VERSION', '1.0.0');
/**
 * The plugin name.
 */
define('CAMPAIGNBAY_PLUGIN_NAME', 'campaignbay');
/**
 * The plugin text domain.
 */
define('CAMPAIGNBAY_TEXT_DOMAIN', 'campaignbay');
/**
 * The option name used in the database.
 */
define('CAMPAIGNBAY_OPTION_NAME', 'campaignbay');
/**
 * The plugin basename.
 */
define('CAMPAIGNBAY_PLUGIN_BASENAME', plugin_basename(__FILE__));
/**
 * Whether the plugin is in development mode.
 */
define('CAMPAIGNBAY_DEV_MODE', true);

/**
 * Autoloader for the plugin's classes.
 *
 * @param string $class The class to load.
 */
spl_autoload_register(function ($class) {
	// Only handle our plugin's classes
	if (strpos($class, 'WpabCampaignBay\\') !== 0) {
		return;
	}
	// Convert namespace to file path
	$file = CAMPAIGNBAY_PATH . 'app/' . str_replace('\\', '/', substr($class, 16)) . '.php';

	// Load the file if it exists
	if (file_exists($file)) {
		require_once $file;
	}
});

/**
 * Include the functions file.
 */
require_once CAMPAIGNBAY_PATH . 'app/functions.php';

/**
 * Register the activation and deactivation hooks.
 */
register_activation_hook(__FILE__, 'wpab_campaignbay_activate');
register_deactivation_hook(__FILE__, 'wpab_campaignbay_deactivate');
/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
if (!function_exists('wpab_campaignbay_run')) {
	/**
	 * The main function that runs the plugin.
	 */
	function wpab_campaignbay_run()
	{
		$plugin = \WpabCampaignBay\Core\Plugin::get_instance();
		$plugin->run();
	}
}
wpab_campaignbay_run();

/**
 * The function that runs on plugin activation.
 */
function wpab_campaignbay_activate()
{
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	\WpabCampaignBay\Core\Activator::activate();
}

/**
 * The function that runs on plugin deactivation.
 */
function wpab_campaignbay_deactivate()
{
	\WpabCampaignBay\Core\Deactivator::deactivate();
}
