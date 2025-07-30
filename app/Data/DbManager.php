<?php

namespace WpabCb\Data;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class DbManager {
    /**
     * The single instance of the class.
     *
     * @since 1.0.0
     * @var   DbManager
     * @access private
     */
    private static $instance = null;
    /**
     * Gets an instance of this object.
     * Prevents duplicate instances which avoids artefacts and improves performance.
     *
     * @static
     * @access public
     * @since 1.0.0
     * @return object
     */
    public static function get_instance() {
		// Store the instance locally to avoid private static replication.
		static $instance = null;
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

    /**
     * A dummy constructor to prevent the class from being loaded more than once.
     *
     * @see DbManager::get_instance()
     *
     * @since 1.0.0
     * @access private
     */
    private function __construct() {
        // Prevent direct instantiation.
    }

    /**
     * Run the database manager.
     *
     * This method is called to initialize the database manager and create necessary tables.
     *
     * @since 1.0.0
     */
    public function create_tables() {
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $this->create_logs_table();
        $this->create_counters_table();
    }

    /**
     * Create the logs table.
     *
     * This table stores analytics and activity data.
     *
     * @since 1.0.0
     * @access private
     */
    private function create_logs_table() {
		global $wpdb;
		$table_name      = $wpdb->prefix . 'wpab_cb_logs';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			log_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			campaign_id BIGINT(20) UNSIGNED NOT NULL,
			order_id BIGINT(20) UNSIGNED DEFAULT 0 NOT NULL,
			user_id BIGINT(20) UNSIGNED DEFAULT 0 NOT NULL,
			log_type VARCHAR(20) NOT NULL,
			log_details TEXT ,
            timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (log_id),
			KEY campaign_id (campaign_id),
			KEY log_type (log_type),
			KEY timestamp (timestamp)
		) $charset_collate;";

		dbDelta( $sql );
	}

	/**
	 * Create the counters table.
	 *
	 * This table handles high-frequency counters like usage limits.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function create_counters_table() {
		global $wpdb;
		$table_name      = $wpdb->prefix . 'wpab_cb_counters';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			campaign_id BIGINT(20) UNSIGNED NOT NULL,
			counter_key VARCHAR(50) NOT NULL,
			counter_value INT(11) DEFAULT 0 NOT NULL,
			last_updated DATETIME DEFAULT '0000-00-00 00:00:00' NOT NULL,
			PRIMARY KEY  (campaign_id, counter_key),
			KEY campaign_id (campaign_id)
		) $charset_collate;";

		dbDelta( $sql );
	}
}