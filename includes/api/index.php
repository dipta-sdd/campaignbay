<?php //phpcs:ignore
/**
 * Includes necessary files
 *
 * @package    WPAB_CampaignBay
 * @since 1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once trailingslashit( __DIR__ ) . 'class-api.php';
require_once trailingslashit( __DIR__ ) . 'class-api-settings.php';
require_once trailingslashit( __DIR__ ) . 'class-wpab-cb-api-campaigns.php';
