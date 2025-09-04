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
        $this->create_campaigns_table();
        $this->create_logs_table();
    }

    /**
     * Create the campaigns table.
    /**
     * Create the campaigns table.
     *
     * This table stores campaign data.
     *
     * @since 1.0.0
     * @access private
     */
    private function create_campaigns_table() {
        global $wpdb;
        $table_name      = $wpdb->prefix . 'campaignbay_campaigns';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            campaign_type VARCHAR(20) NOT NULL,
        
            -- Discount Details --
            discount_type VARCHAR(20) DEFAULT NULL,
            discount_value DECIMAL(10, 2) DEFAULT NULL,
        
            -- Targeting Details --
            target_type VARCHAR(20) NOT NULL,
            target_ids LONGTEXT DEFAULT NULL,
            exclude_sale_items BOOLEAN NOT NULL DEFAULT 0,
        
            -- Scheduling Details --
            schedule_enabled BOOLEAN NOT NULL DEFAULT 0,
            start_datetime DATETIME DEFAULT NULL,
            end_datetime DATETIME DEFAULT NULL,
            timezone_string VARCHAR(100) DEFAULT NULL,
        
            -- Tiered Data (for Quantity/Earlybird) --
            campaign_tiers JSON DEFAULT NULL,
        
            -- Usage and Control --
            usage_count INT(11) DEFAULT 0 NOT NULL,
            priority INT(11) DEFAULT 10 NOT NULL,
        
            -- Timestamps --
            date_created DATETIME NOT NULL,
            date_modified DATETIME NOT NULL,
            
            PRIMARY KEY (id),
            KEY status (status),
            KEY campaign_type (campaign_type),
            KEY start_datetime (start_datetime),
            KEY end_datetime (end_datetime)
        ) $charset_collate;";

        dbDelta( $sql );
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
		$table_name      = $wpdb->prefix . 'campaignbay_logs';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			log_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			campaign_id BIGINT(20) UNSIGNED NOT NULL,
			order_id BIGINT(20) UNSIGNED DEFAULT 0 NOT NULL,
			user_id BIGINT(20) UNSIGNED DEFAULT 0 NOT NULL,
			log_type VARCHAR(20) NOT NULL,
            base_total DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
			total_discount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
			order_total DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
			order_status VARCHAR(20) DEFAULT '' NOT NULL,
            extra_data JSON DEFAULT NULL,
            timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (log_id),
			KEY campaign_id (campaign_id),
			KEY order_status (order_status),
			KEY timestamp (timestamp)
		) $charset_collate;";

		dbDelta( $sql );
	}

}





// CREATE TABLE {$wpdb->prefix}campaignbay_campaigns (
//     -- Core Fields --
//     id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
//     title VARCHAR(255) NOT NULL,
//     status VARCHAR(20) NOT NULL DEFAULT 'draft',
//     campaign_type VARCHAR(20) ENUM(
//     'scheduled_sales',
//     'quantity_tiered',
//     'early_bird',
//     'bogo',
//     'bundle',
//     'free_shipping_gift',
//     'storewide',
//     'category_product_tag',
//     'user_role',
//     'purchase_history',
//     'cart_checkout',
//     'location_based',
//     'nth_order',
//     'next_buy_bonus',
//     'day_based'
//   ) NOT NULL,
    
//     -- Discount Action Details (The "THEN" part of the rule) --
//     discount_type VARCHAR(20) DEFAULT NULL,
//     discount_value DECIMAL(10, 2) DEFAULT NULL,
//     campaign_tiers JSON DEFAULT NULL,
    
//     -- Conditions & Targeting (The "IF" part of the rule) --
//     target_type VARCHAR(20) DEFAULT NULL,
//     target_ids LONGTEXT DEFAULT NULL,
//     is_exclude BOOLEAN NOT NULL DEFAULT 0, -- <-- NEW COLUMN
//     exclude_sale_items BOOLEAN NOT NULL DEFAULT 0,
    
//     -- Scheduling Details --
//     schedule_enabled BOOLEAN NOT NULL DEFAULT 0,
//     start_datetime DATETIME DEFAULT NULL,
//     end_datetime DATETIME DEFAULT NULL,
    
//     -- Usage & Control --
//     usage_count INT(11) NOT NULL DEFAULT 0,
//     usage_limit INT(11) DEFAULT NULL,
//     priority INT(11) NOT NULL DEFAULT 10,
    
//     -- Timestamps --
//     date_created DATETIME NOT NULL,
//     date_modified DATETIME NOT NULL,
    
//     PRIMARY KEY  (id),
//     KEY `status` (`status`),
//     KEY `campaign_type` (`campaign_type`),
//     KEY `date_range` (start_datetime, end_datetime)
// ) {$wpdb->get_charset_collate()};