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


if ( ! function_exists( 'campaignbay_default_options' ) ) :
	/**
	 * Get the Plugin Default Options.
	 *
	 * @since 1.0.0
	 *
	 * @return array Default Options
	 *
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function campaignbay_default_options() {
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
			'debug_enableMode'       => true,
			'debug_logLevel'         => 'errors_only',

			/*==================================================
			* Product Settings Tab
			==================================================*/
			'product_showDiscountedPrice' => true,
			'product_messageFormat'       => esc_html( 'You save {percentage_off}!' ),
			'product_bogoMessageFormat'   => esc_html( '{campaign_name_strong} : Buy {buy_product_quantity} of this and get {get_product_quantity} {get_product} for free!' ),
			'product_enableQuantityTable' => true,
			'product_excludeSaleItems'    => true,
			'product_priorityMethod'      => 'apply_highest',

			/*==================================================
			* Cart Settings Tab
			==================================================*/
			'cart_allowWcCouponStacking'  => true,
			'cart_allowCampaignStacking'  => false,
			'cart_savedMessageFormat'     => esc_html( 'You saved {saved_amount} on this order!' ),
			'cart_showNextDiscountBar'    => true,
			'cart_nextDiscountFormat'     => esc_html( 'Spend {remaining_amount} more for {discount_percentage} off!' ),
			'cart_bogoMessageFormat'      => esc_html( 'Buy {buy_quantity} more and get {get_product_quantity} {get_product} for free!' ),
			'cart_showDiscountBreakdown'  => true,

			/*==================================================
			* Promotion Settings Tab
			==================================================*/
			'promo_enableBar'             => false,
			'promo_barPosition'           => 'top_of_page',
			'promo_barBgColor'            => '#000000',
			'promo_barTextColor'          => '#FFFFFF',
			'promo_barContent'            => esc_html( 'FLASH SALE! {percentage_off} on all shirts!' ),
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

		return apply_filters( CAMPAIGNBAY_OPTION_NAME  . '_default_options', $default_options );
	}
endif;

if ( ! function_exists( 'campaignbay_get_options' ) ) :

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
	function campaignbay_get_options( $key = '' ) {
		$options = get_option( CAMPAIGNBAY_OPTION_NAME );

		$default_options = campaignbay_default_options();
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

if ( ! function_exists( 'campaignbay_update_options' ) ) :
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
	function campaignbay_update_options( $key_or_data, $val = '' ) {
		if ( is_string( $key_or_data ) ) {
			$options                 = campaignbay_get_options();
			$options[ $key_or_data ] = $val;
		} else {
			$options = $key_or_data;
		}
		update_option( CAMPAIGNBAY_OPTION_NAME, $options );
	}
endif;


if ( ! function_exists( 'campaignbay_file_system' ) ) {
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
	function campaignbay_file_system() {
		global $wp_filesystem;
		if ( ! $wp_filesystem ) {
			require_once ABSPATH . 'wp-admin' . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'file.php';
		}

		WP_Filesystem();
		return $wp_filesystem;
	}
}

if ( ! function_exists( 'campaignbay_parse_changelog' ) ) {

	/**
	 * Parse the changelog.txt file and convert it to HTML for the update modal.
	 *
	 * @since 1.0.0
	 * @return string The formatted HTML changelog.
	 */
	function campaignbay_parse_changelog() {
		$wp_filesystem = campaignbay_file_system();
		$changelog_file = apply_filters( CAMPAIGNBAY_OPTION_NAME . '_changelog_file', CAMPAIGNBAY_PATH . 'changelog.txt' );

		if ( ! $changelog_file || ! $wp_filesystem->is_readable( $changelog_file ) ) {
			return '';
		}

		$content = $wp_filesystem->get_contents( $changelog_file );

		if ( ! $content ) {
			return '';
		}
		
		// Find the content specifically under the "== Changelog ==" heading.
		$matches = null;
		if ( ! preg_match( '~==\s*Changelog\s*==(.*)($)~Uis', $content, $matches ) ) {
			return '';
		}

		$raw_changelog = trim( $matches[1] );
		$lines         = explode( "\n", $raw_changelog );
		$changelog_html = '';
		$in_list       = false;

		// --- NEW: A more robust line-by-line parser ---
		foreach ( $lines as $line ) {
			$line = trim( $line );

			// Check for a version heading (e.g., "= 1.1.0 =")
			if ( strpos( $line, '= ' ) === 0 ) {
				if ( $in_list ) {
					$changelog_html .= "</ul>\n";
					$in_list = false;
				}
				// Extract the version number and wrap it in an <h4> tag.
				$version = trim( str_replace( '=', '', $line ) );
				$changelog_html .= "<h4>" . esc_html( "Version " . $version ) . "</h4>\n";
			} 
			// Check for a list item (e.g., "* New feature")
			elseif ( strpos( $line, '* ' ) === 0 ) {
				if ( ! $in_list ) {
					$changelog_html .= "<ul>\n";
					$in_list = true;
				}
				// Extract the list item text and wrap it in an <li> tag.
				$item = trim( substr( $line, 1 ) );
				$changelog_html .= "<li>" . esc_html( $item ) . "</li>\n";
			}
		}
		
		// Close the final list if it was open.
		if ( $in_list ) {
			$changelog_html .= "</ul>\n";
		}

		// Sanitize the final HTML to allow only safe tags like <h4>, <ul>, <li>.
		return wp_kses_post( $changelog_html );
	}
}

if ( ! function_exists( 'campaignbay_get_white_label' ) ) :
	/**
	 * Get white label options for this plugin.
	 *
	 * @since 1.0.0
	 * @param string $key optional option key.
	 * @return mixed All Options Array Or Options Value
	 * @author     dipta-sdd <sankarsandipta@gmail.com>
	 */
	function campaignbay_get_white_label( $key = '' ) {
		$plugin_name = apply_filters(
			CAMPAIGNBAY_OPTION_NAME  . '_white_label_plugin_name',
			esc_html( 'WP React Plugin Boilerplate' )
		);
		
		$options = apply_filters(
			CAMPAIGNBAY_OPTION_NAME  . '_white_label',
			 array(
				'plugin_name'      => esc_html( 'CampaignBay - WooCommerce Smart Campaigns'),
				'short_name'       => esc_html( 'CampaignBay' ),
				'menu_label'       => esc_html( 'CampaignBay' ),
				'custom_icon'  	   => CAMPAIGNBAY_URL . 'assets/img/dash_icon_campaign_bay_light.svg',
				'menu_icon'  	   => CAMPAIGNBAY_URL . 'assets/img/dash_icon_campaign_bay_light.svg',
				'author_name'      => 'WP Anchor Bay',
				'author_uri'       => 'https://wpanchorbay.com',
				'support_uri'      => 'https://wpanchorbay.com/support',
				'docs_uri'         => 'https://docs.wpanchorbay.com',
				// 'menu_icon'        => 'dashicons-awards',
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



if(! function_exists('campaignbay_log')) {

	/**
	 * Log messages to the debug log.
	 *
	 * @param mixed $message The message to log.
	 * @param string $level The log level (e.g.,'DEBUG', 'INFO', 'ERROR', 'NOTICE', 'WARNING', 'CRITICAL', 'ALERT', 'EMERGENCY' ).
	 * @param bool $dev_mode Whether to log messages in development mode.
	 */
	function campaignbay_log( $message, $level = 'INFO', $dev_mode = true ) {
		$enable_logging = campaignbay_get_options('debug_enableMode');
		if ( ! $enable_logging || ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}
		$upload_dir = wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/'. CAMPAIGNBAY_TEXT_DOMAIN .'-logs/';
		
		if ( ! is_dir( $log_dir ) ) {
			wp_mkdir_p( $log_dir );
		}
		
		$log_file = $log_dir . 'plugin-log-' . gmdate('Y-m-d') . '.log';

		$formatted_message = '';
		if ( is_array( $message ) || is_object( $message ) ) {
			$formatted_message = json_encode( $message );
		} else {
			$formatted_message = $message;
		}
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
		$log_level = is_string($level) ? strtoupper($level) : (is_array($level) || is_object($level) ? print_r($level, true) : '');
		$log_entry = sprintf(
			"[%s] [%s]: %s\n",
			gmdate('Y-m-d H:i:s'),
			$log_level,
			$formatted_message
		);
		file_put_contents( $log_file, $log_entry, FILE_APPEND | LOCK_EX );
	}
}




