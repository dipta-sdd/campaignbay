<?php
/**
 * Fired during plugin activation
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
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/includes
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class WPAB_CB_Activator {

	/**
	 * The main activation method.
	 *
	 * This is fired when the plugin is activated.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
		// Set up the default options if they don't exist.
		if ( ! get_option( WPAB_CB_OPTION_NAME ) ) {
			wpab_cb_update_options( wpab_cb_default_options() );
		}

		// Create custom database tables.
		self::create_custom_tables();

		// Flush rewrite rules to recognize the CPT.
		flush_rewrite_rules();

		// Secure the log directory.
		self::secure_log_directory();
	}

	/**
	 * Instantiates the DB Manager and creates the custom tables.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private static function create_custom_tables() {
		require_once WPAB_CB_PATH . 'includes/class-wpab-cb-db-manager.php';
		$db_manager = wpab_cb_db_manager();
		$db_manager->create_tables();
	}

	/**
	 * Secures the log directory by creating an .htaccess file and an index.php file.
	 *
	 * @since    1.0.0
	 * @access private
	 */
	private static function secure_log_directory() {
		$upload_dir = wp_upload_dir();
		$log_dir    = $upload_dir['basedir'] . '/' . WPAB_CB_TEXT_DOMAIN . '-logs/';

		if ( ! is_dir( $log_dir ) ) {
			wp_mkdir_p( $log_dir );
		}

		$htaccess_file = $log_dir . '.htaccess';
		if ( ! file_exists( $htaccess_file ) ) {
			$htaccess_content = "
			# Protect log files from direct access
			<Files *.log>
				Order allow,deny
				Deny from all
			</Files>
			";
			file_put_contents( $htaccess_file, $htaccess_content ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_file_put_contents
		}

		// --- Create blank index.php file for security ---
		$index_file = $log_dir . 'index.php';
		if ( ! file_exists( $index_file ) ) {
			$index_content = "<?php\n// Silence is golden.\n";
			file_put_contents( $index_file, $index_content ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_file_put_contents
		}
	}
}