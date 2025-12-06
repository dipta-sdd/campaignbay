<?php
/**
 * Plugin Name:       CampaignBay - Automated Discount Campaigns & Flash Sales for WooCommerce
 * Plugin URI:        https://wpanchorbay.com/campaignbay
 * Source URI:        https://github.com/dipta-sdd/campaignbay
 * Description:       Automated Discount Campaigns & Flash Sales for WooCommerce.
 * Requires at least: 5.6
 * Requires PHP:      7.0
 * Requires Plugins:  woocommerce
 * WC requires at least: 6.1
 * Version:           1.0.5
 * Stable tag:        1.0.5
 * Author:            WPAnchorBay
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

define('CAMPAIGNBAY_PATH', plugin_dir_path(__FILE__));
define('CAMPAIGNBAY_DIR', plugin_dir_path(__FILE__));
define('CAMPAIGNBAY_URL', plugin_dir_url(__FILE__));
define('CAMPAIGNBAY_VERSION', '1.0.5');
define('CAMPAIGNBAY_PLUGIN_NAME', 'campaignbay');
define('CAMPAIGNBAY_TEXT_DOMAIN', 'campaignbay');
define('CAMPAIGNBAY_OPTION_NAME', 'campaignbay');
define('CAMPAIGNBAY_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('CAMPAIGNBAY_DEV_MODE', true);

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

require_once CAMPAIGNBAY_PATH . 'app/functions.php';
if (!function_exists('is_plugin_active')) {
	include_once ABSPATH . 'wp-admin/includes/plugin.php';
}

register_activation_hook(__FILE__, 'wpab_campaignbay_activate');
register_deactivation_hook(__FILE__, 'wpab_campaignbay_deactivate');
/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
if (!function_exists('wpab_campaignbay_run')) {
	function wpab_campaignbay_run()
	{
		if (is_plugin_active('woocommerce/woocommerce.php')) {
			$plugin = \WpabCampaignBay\Core\Plugin::get_instance();
			add_action('plugins_loaded', array($plugin, 'run'));
			// $plugin->run();
		} else {
			add_action('admin_notices', 'wpab_campaignbay_woocommerce_not_active_notice');
		}

	}
}
wpab_campaignbay_run();

function wpab_campaignbay_activate()
{
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	\WpabCampaignBay\Core\Activator::activate();
}

function wpab_campaignbay_deactivate()
{
	\WpabCampaignBay\Core\Deactivator::deactivate();
}




function wpab_campaignbay_woocommerce_not_active_notice()
{
	?>
	<div class="notice notice-error">
		<p>
			<?php
			printf(
				/* translators: 1: The name of our plugin (CampaignBay). 2: The name of the required plugin (e.g., WooCommerce). */
				esc_html__('%1$s requires the %2$s plugin to be installed and activated. Please activate %2$s to continue.', 'campaignbay'),
				'<strong>CampaignBay</strong>',
				'<strong>WooCommerce</strong>'
			);
			?>
		</p>
	</div>
	<?php
}