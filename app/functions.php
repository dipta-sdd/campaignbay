<?php
/**
 * Reusable functions.
 *
 * @package    WPAB_CampaignBay
 * @since 1.0.0
 * @author     dipta-sdd <sankarsandipta@gmail.com>
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


if ( ! function_exists( 'wpab_cb_default_options' ) ) :
	/**
	 * Get the Plugin Default Options.
	 *
	 * @since 1.0.0
	 *
	 * @return array Default Options
	 *
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_cb_default_options() {
		$default_options = array(
			/*==================================================
			* Global Settings Tab
			==================================================*/
			'global_enableAddon'     => true,
			'global_defaultPriority' => 10,
			'global_calculationMode' => 'after_tax',
			'global_decimalPlaces'   => 2,

			/*==================================================
			* Performance & Caching (from Global Tab)
			==================================================*/
			'perf_enableCaching'     => true,

			/*==================================================
			* Debugging & Logging (from Global Tab)
			==================================================*/
			'debug_enableMode'       => false,
			'debug_logLevel'         => 'errors_only',

			/*==================================================
			* Product Settings Tab
			==================================================*/
			'product_showDiscountedPrice' => true,
			'product_messageFormat'       => esc_html__( 'You save {percentage_off}!', WPAB_CB_TEXT_DOMAIN ),
			'product_enableQuantityTable' => true,
			'product_excludeSaleItems'    => true,
			'product_priorityMethod'      => 'apply_highest',

			/*==================================================
			* Cart Settings Tab
			==================================================*/
			'cart_allowWcCouponStacking'  => false,
			'cart_allowCampaignStacking'  => false,
			'cart_savedMessageFormat'     => esc_html__( 'You saved {saved_amount} on this order!', WPAB_CB_TEXT_DOMAIN ),
			'cart_showNextDiscountBar'    => true,
			'cart_nextDiscountFormat'     => esc_html__( 'Spend {remaining_amount} more for {discount_percentage} off!', WPAB_CB_TEXT_DOMAIN ),
			'cart_showDiscountBreakdown'  => true,

			/*==================================================
			* Promotion Settings Tab
			==================================================*/
			'promo_enableBar'             => false,
			'promo_barPosition'           => 'top_of_page',
			'promo_barBgColor'            => '#000000',
			'promo_barTextColor'          => '#FFFFFF',
			'promo_barContent'            => esc_html__( 'FLASH SALE! {percentage_off} on all shirts!', WPAB_CB_TEXT_DOMAIN ),
			'promo_barLinkUrl'            => '',
			'promo_barDisplayPages'       => array( 'shop_page', 'product_pages' ),
			'promo_enableCustomBadges'    => true,

			/*==================================================
			* Advance Settings Tab
			==================================================*/
			'advanced_deleteAllOnUninstall' => false,
			'advanced_customCss'            => '',
			'advanced_customJs'             => '',
		);

		return apply_filters( WPAB_CB_OPTION_NAME  . '_default_options', $default_options );
	}
endif;

if ( ! function_exists( 'wpab_cb_get_options' ) ) :

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
	function wpab_cb_get_options( $key = '' ) {
		$options = get_option( WPAB_CB_OPTION_NAME );

		$default_options = wpab_cb_default_options();
		if ( ! empty( $key ) ) {
			if ( isset( $options[ $key ] ) ) {
				return $options[ $key ];
			}
			return isset( $default_options[ $key ] ) ? $default_options[ $key ] : false;
		} else {
			if ( ! is_array( $options ) ) {
				$options = array();
			}

			return array_merge( $default_options, $options );
		}
	}
endif;

if ( ! function_exists( 'wpab_cb_update_options' ) ) :
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
	function wpab_cb_update_options( $key_or_data, $val = '' ) {
		if ( is_string( $key_or_data ) ) {
			$options                 = wpab_cb_get_options();
			$options[ $key_or_data ] = $val;
		} else {
			$options = $key_or_data;
		}
		update_option( WPAB_CB_OPTION_NAME, $options );
	}
endif;


if ( ! function_exists( 'wpab_cb_file_system' ) ) {
	/**
	 *
	 * WordPress file system wrapper
	 *
	 * @since 1.0.0
	 *
	 * @return string|WP_Error directory path or WP_Error object if no permission
	 *
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_cb_file_system() {
		global $wp_filesystem;
		if ( ! $wp_filesystem ) {
			require_once ABSPATH . 'wp-admin' . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'file.php';
		}

		WP_Filesystem();
		return $wp_filesystem;
	}
}

if ( ! function_exists( 'wpab_cb_parse_changelog' ) ) {

	/**
	 * Parse changelog
	 *
	 * @since 1.0.0
	 * @return string
	 *
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_cb_parse_changelog() {

		$wp_filesystem = wpab_cb_file_system();

		$changelog_file = apply_filters( WPAB_CB_OPTION_NAME  . '_changelog_file', WPAB_CB_PATH . 'readme.txt' );

		/*Check if the changelog file exists and is readable.*/
		if ( ! $changelog_file || ! is_readable( $changelog_file ) ) {
			return '';
		}

		$content = $wp_filesystem->get_contents( $changelog_file );

		if ( ! $content ) {
			return '';
		}

		$matches   = null;
		$regexp    = '~==\s*Changelog\s*==(.*)($)~Uis';
		$changelog = '';

		if ( preg_match( $regexp, $content, $matches ) ) {
			$changes = explode( '\r\n', trim( $matches[1] ) );

			foreach ( $changes as $index => $line ) {
				$changelog .= wp_kses_post( preg_replace( '~(=\s*Version\s*(\d+(?:\.\d+)+)\s*=|$)~Uis', '', $line ) );
			}
		}

		return wp_kses_post( $changelog );
	}
}

if ( ! function_exists( 'wpab_cb_get_white_label' ) ) :
	/**
	 * Get white label options for this plugin.
	 *
	 * @since 1.0.0
	 * @param string $key optional option key.
	 * @return mixed All Options Array Or Options Value
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function wpab_cb_get_white_label( $key = '' ) {
		$plugin_name = apply_filters(
			WPAB_CB_OPTION_NAME  . '_white_label_plugin_name',
			esc_html__( 'WP React Plugin Boilerplate', WPAB_CB_TEXT_DOMAIN )
		);
		
		$options = apply_filters(
			WPAB_CB_OPTION_NAME  . '_white_label',
			 array(
				'plugin_name'      => esc_html( __('WPAB - WooCommerce Smart Campaigns', 'wpab-cb') ),
				'short_name'       => esc_html__( 'Smart Campaigns', WPAB_CB_TEXT_DOMAIN ),
				'menu_label'       => esc_html__( 'Campaigns', 'wpab-cb' ),
				'custom_icon'  	   => WPAB_CB_URL . 'assets/img/logo-2.svg',
				'author_name'      => 'WP Anchor Bay',
				'author_uri'       => 'https://wpanchorbay.com',
				'support_uri'      => 'https://wpanchorbay.com/support',
				'docs_uri'         => 'https://wpanchorbay.com/docs',
				'menu_icon'        => 'dashicons-awards',
				'position'         => 57,
			)
		);
		if ( ! empty( $key ) ) {
			return $options[ $key ];
		} else {
			return $options;
		}
	}
endif;



if(! function_exists('wpab_cb_log')) {

	/**
	 * Log messages to the debug log.
	 *
	 * @param mixed $message The message to log.
	 * @param string $level The log level (e.g.,'DEBUG', 'INFO', 'ERROR', 'NOTICE', 'WARNING', 'CRITICAL', 'ALERT', 'EMERGENCY' ).
	 * @param bool $dev_mode Whether to log messages in development mode.
	 */
	function wpab_cb_log( $message, $level = 'INFO', $dev_mode = true ) {
		
		if ( ! $dev_mode || ! defined( 'WPAB_CB_DEV_MODE' ) || ! WPAB_CB_DEV_MODE ) {
			return;
		}
		$upload_dir = wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/'. WPAB_CB_TEXT_DOMAIN .'-logs/';
		
		if ( ! is_dir( $log_dir ) ) {
			wp_mkdir_p( $log_dir );
		}
		
		$log_file = $log_dir . 'plugin-log-' . date('Y-m-d') . '.log';

		$formatted_message = '';
		if ( is_array( $message ) || is_object( $message ) ) {
			$formatted_message = print_r( $message, true );
		} else {
			$formatted_message = $message;
		}

		$log_entry = sprintf(
			"[%s] [%s]: %s\n",
			date('Y-m-d H:i:s'),
			strtoupper( $level ),
			$formatted_message
		);
		file_put_contents( $log_file, $log_entry, FILE_APPEND | LOCK_EX );
	}
}


// in includes/functions.php

if ( ! function_exists( 'wpab_cb_get_campaign_meta_keys' ) ) :
	/**
	 * Get the campaign meta keys.
	 *
	 * This function returns an array of meta keys that are used by the campaign post type.
	 * These keys are registered with the REST API for the React UI.
	 *
	 * @since 1.0.0
	 * @return array Array of meta keys.
	 */
	function wpab_cb_get_campaign_meta_keys() {
		return array(
			'campaign_type',
			'discount_type',
			'discount_value',
			'target_type',
			'target_ids',
			'exclude_sale_items',
			'apply_to_shipping',
			'schedule_enabled',
			'start_datetime',
			'end_datetime',
			'timezone_string',
			'campaign_tiers'
		);
	}
endif;

