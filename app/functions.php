<?php
/**
 * Reusable functions.
 *
 * @package    WPAB_CampaignBay
 * @since 1.0.0
 * @author     dipta-sdd <sankarsandipta@gmail.com>
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}


if (!function_exists('wpab_campaignbay_default_options')):
	/**
	 * Get the Plugin Default Options.
	 *
	 * @since 1.0.0
	 *
	 * @return array Default Options
	 *
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_campaignbay_default_options()
	{
		// The default options.
		$default_options = array(
			/*==================================================
			* Global Settings Tab
			==================================================*/
			'global_enableAddon' => true,
			'global_calculate_discount_from' => 'regular_price',
			'position_to_show_bulk_table' => 'woocommerce_after_add_to_cart_form',
			'position_to_show_discount_bar' => 'woocommerce_before_add_to_cart_form',

			/*==================================================
			* Performance & Caching (from Global Tab)
			==================================================*/
			'perf_enableCaching' => true,

			/*==================================================
			* Debugging & Logging (from Global Tab)
			==================================================*/
			'debug_enableMode' => true,

			/*==================================================
			* Product Settings Tab
			==================================================*/
			'product_message_format_percentage' => esc_html('You save {percentage_off}%'),
			'product_message_format_fixed' => esc_html('You save {amount_off} per item'),
			'bogo_banner_message_format' => esc_html('Buy {buy_quantity} and {get_quantity} free!!!!!!'),
			'product_priorityMethod' => 'apply_highest',
			'show_discount_table' => 'true',
			'discount_table_options' => array(
				'show_header' => true,
				'title' => array(
					'show' => true,
					'label' => 'Title',
				),
				'range' => array(
					'show' => true,
					'label' => 'Range',
				),
				'discount' => array(
					'show' => true,
					'label' => 'Discount',
					'content' => 'price'
				)
			),


			/*==================================================
			* Cart Settings Tab
			==================================================*/
			'cart_allowWcCouponStacking' => false,
			'cart_allowCampaignStacking' => false,
			'cart_quantity_message_format_percentage' => esc_html('Add {remainging_quantity_for_next_offer} more and get {percentage_off}% off'),
			'cart_quantity_message_format_fixed' => esc_html('Add {remainging_quantity_for_next_offer} more and get {amount_off} off per item!!'),
			'cart_bogo_message_format' => esc_html('{title} discount applied.'),

			/*==================================================
			* Advance Settings Tab
			==================================================*/
			'advanced_deleteAllOnUninstall' => false,
		);
		// Return the filtered default options.
		return apply_filters(CAMPAIGNBAY_OPTION_NAME . '_default_options', $default_options);
	}
endif;

if (!function_exists('wpab_campaignbay_get_options')):

	/**
	 * Get the Plugin Saved Options.
	 *
	 * @since 1.0.0
	 *
	 * @param string $key optional option key.
	 *
	 * @return mixed All Options Array Or Options Value
	 *
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_campaignbay_get_options($key = '')
	{
		// Get the options from the database.
		$options = get_option(CAMPAIGNBAY_OPTION_NAME);

		// Get the default options.
		$default_options = wpab_campaignbay_default_options();
		// If a key is provided, return the option value.
		if (!empty($key)) {
			if (isset($options[$key])) {
				return $options[$key];
			}
			return isset($default_options[$key]) ? $default_options[$key] : false;
		} else {
			// If no key is provided, return all options.
			if (!is_array($options)) {
				$options = array();
			}

			// Merge the default options with the saved options.
			return array_merge($default_options, $options);
		}
	}
endif;

if (!function_exists('wpab_campaignbay_update_options')):
	/**
	 * Update the Plugin Options.
	 *
	 * @since 1.0.0
	 *
	 * @param string|array $key_or_data array of options or single option key.
	 * @param string       $val value of option key.
	 *
	 * @return mixed All Options Array Or Options Value
	 *
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_campaignbay_update_options($key_or_data, $val = '')
	{
		// If a key is provided, update the option value.
		if (is_string($key_or_data)) {
			$options = wpab_campaignbay_get_options();
			$options[$key_or_data] = $val;
		} else {
			// If no key is provided, update all options.
			$options = $key_or_data;
		}
		// Update the options in the database.
		update_option(CAMPAIGNBAY_OPTION_NAME, $options);
	}
endif;



if (!function_exists('wpab_campaignbay_get_white_label')):
	/**
	 * Get white label options for this plugin.
	 *
	 * @since 1.0.0
	 * @param string $key optional option key.
	 * @return mixed All Options Array Or Options Value
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_campaignbay_get_white_label($key = '')
	{
		// The plugin name.
		$plugin_name = apply_filters(
			CAMPAIGNBAY_OPTION_NAME . '_white_label_plugin_name',
			esc_html('WP React Plugin Boilerplate')
		);

		// The white label options.
		$options = apply_filters(
			CAMPAIGNBAY_OPTION_NAME . '_white_label',
			array(
				'plugin_name' => esc_html('CampaignBay - WooCommerce Smart Campaigns'),
				'short_name' => esc_html('CampaignBay'),
				'menu_label' => esc_html('CampaignBay'),
				'custom_icon' => CAMPAIGNBAY_URL . 'assets/img/dash_icon_campaign_bay_light.svg',
				'menu_icon' => CAMPAIGNBAY_URL . 'assets/img/dash_icon_campaign_bay_light.svg',
				'author_name' => 'WP Anchor Bay',
				'author_uri' => 'https://wpanchorbay.com',
				'support_uri' => 'https://wpanchorbay.com/support',
				'docs_uri' => 'https://docs.wpanchorbay.com',
				// 'menu_icon'        => 'dashicons-awards',
				'position' => 57,
			)
		);
		// If a key is provided, return the option value.
		if (!empty($key)) {
			return $options[$key];
		} else {
			// If no key is provided, return all options.
			return $options;
		}
	}
endif;



if (!function_exists('wpab_campaignbay_log')) {

	/**
	 * Log messages to the debug log.
	 *
	 * @param mixed $message The message to log.
	 * @param string $level The log level (e.g.,'DEBUG', 'INFO', 'ERROR', 'NOTICE', 'WARNING', 'CRITICAL', 'ALERT', 'EMERGENCY' ).
	 * @param bool $dev_mode Whether to log messages in development mode.
	 */
	function wpab_campaignbay_log($message, $level = 'INFO', $dev_mode = true)
	{
		$enable_logging = wpab_campaignbay_get_options('debug_enableMode');
		// if (!$enable_logging && !defined('WP_DEBUG') && !WP_DEBUG && $level !== 'error') {
		if (!$enable_logging && ($level !== 'ERROR' || $level !== 'error')) {
			return;
		}
		$upload_dir = wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/' . CAMPAIGNBAY_TEXT_DOMAIN . '-logs/';

		if (!is_dir($log_dir)) {
			wp_mkdir_p($log_dir);
		}

		$log_file = $log_dir . 'plugin-log-' . gmdate('Y-m-d') . '.log';

		$formatted_message = '';
		if (is_array($message) || is_object($message)) {
			$formatted_message = json_encode($message);
		} else {
			$formatted_message = $message;
		}
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
		$log_level = is_string($level) ? strtoupper($level) : (is_array($level) || is_object($level) ? print_r($level, true) : '');
		$log_entry = sprintf(
			"[%s] [%s]: %s\n",
			current_time('mysql'),
			$log_level,
			$formatted_message
		);
		file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
	}
}