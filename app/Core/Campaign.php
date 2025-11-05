<?php

namespace WpabCampaignBay\Core;

/**
 * The file that defines the Campaign model class.
 *
 * A class definition that encapsulates all data and functionality for a single discount campaign.
 *
 * @link       https://wpanchorbay.com
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/includes
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

use DateTime;
use DateTimeZone;
use Exception;
use WP_Error;
use WpabCampaignBay\Core\Validator;
use WpabCampaignBay\Helper\Filter;
use WpabCampaignBay\Helper\Logger;

/**
 * The Campaign model class.
 *
 * This class represents a single discount campaign and provides methods
 * to create, read, update, and delete campaign data using the custom campaigns table.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
 */
class Campaign
{

	/**
	 * The campaign ID.
	 *
	 * @since 1.0.0
	 * @access public
	 * @var int
	 */
	public $id = 0;

	/**
	 * The campaign data from the database.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var object|null
	 */
	private $data;

	/**
	 * A flat list of all product and variation IDs this campaign applies to.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var int[]
	 */
	private $applicable_product_ids = array();

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 * @param int|object $campaign The campaign ID or campaign data object.
	 */
	public function __construct($campaign)
	{
		if (is_object($campaign)) {
			$this->id = $campaign->id;
			$this->data = $campaign;
		} elseif (is_numeric($campaign)) {
			$this->id = absint($campaign);
			$this->load_data();
		}

		if (!$this->data) {
			throw new Exception('Invalid campaign provided.');
		}


	}



	/**
	 * Throws a validation error with a specific field message.
	 *
	 * @since 1.0.0
	 * @param string $field The field name that failed validation.
	 * @throws Exception Always throws an exception.
	 */
	public static function throw_validation_error($field = '')
	{
		$message = 'Campaign validation failed.';
		if (!empty($field)) {
			$message .= " Field: {$field}";
		}
		throw new Exception(esc_html($message));
	}


	/**
	 * Creates a new campaign.
	 *
	 * @since 1.0.0
	 * @param array $args The campaign arguments.
	 * @return Campaign The created campaign object.
	 * @throws Exception If validation fails.
	 */
	public static function create($args)
	{
		// validating main data
		$validator = new Validator($args);
		$rules = [
			'title' => 'required|max:255',
			'type' => 'required|in:earlybird,scheduled,quantity,bogo',
			'status' => 'required|in:active,inactive,scheduled,expired',

			'discount_type' => 'nullable|in:percentage,fixed',
			'discount_value' => 'required_if:type,scheduled|numeric',
			'tiers' => 'nullable|array',

			'target_type' => 'nullable|in:entire_store,category,product,tag',
			'target_ids' => 'required_if:target_type,category,product,tag|array_of_integers',
			'exclude_sale_items' => 'required|boolean',
			'is_exclude' => 'nullable|boolean',

			'schedule_enabled' => 'boolean||required_if:status,scheduled',
			'start_datetime' => 'datetime|required_if:status,scheduled',
			'end_datetime' => 'datetime|nullable',

			'conditions' => 'nullable|array',
			'settings' => 'nullable|array',
			'usage_limit' => 'nullable|integer'
		];
		// checking validation
		if (!$validator->validate($rules)) {
			return new WP_Error('rest_validation_error', $validator->get_first_error(), array('status' => 400, 'details' => $validator->get_errors(), 'data' => $args));
		}
		// retriving validated data
		$data = $validator->get_validated_data();

		// validating tiers 
		$tmp_tiers = array();
		if ($data['type'] === 'quantity' || $data['type'] === 'earlybird' || $data['type'] === 'bogo') {
			foreach ($data['tiers'] as $tier) {
				$tier_validator = new Validator($tier);
				$tier_rules = array();
				if ($data['type'] === 'quantity') {
					$tier_rules = [
						'id' => 'nullable|integer',
						'min' => 'required|integer|min:1|gte:previous_tier_max',
						'max' => 'required|integer|min:1|gte:min',
						'value' => 'required|numeric|min:0|max_if:type,percentage,100',
						'type' => 'required|in:percentage,currency',
					];
				} elseif ($data['type'] === 'earlybird') {
					$tier_rules = [
						'id' => 'nullable|integer',
						'quantity' => 'required|integer|min:1',
						'value' => 'required|numeric|min:0|max_if:type,percentage,100',
						'type' => 'required|in:percentage,currency',
						'total' => 'required|integer|min:0'
					];
				} elseif ($data['type'] === 'bogo') {
					$tier_rules = [
						'buy_quantity' => 'required|integer|min:1',
						'get_quantity' => 'required|integer|min:1',
					];
				}
				if (!$tier_validator->validate($tier_rules)) {
					return new WP_Error(
						'rest_validation_error',
						$tier_validator->get_first_error(),
						array(
							'status' => 400,
							'details' => array('tiers' => array($tier['id'] => $tier_validator->get_errors())),
							'data' => $tier
						)
					);
				}

				$tmp_tiers[] = $tier_validator->get_validated_data();
			}
		}


		// validating settings
		$validated_settings = self::get_validated_settings($data['settings'] ?? array(), $data['type']);
		if (is_wp_error($validated_settings)) {
			return $validated_settings;
		}

		// json encoding json fields

		$data['tiers'] = wp_json_encode($tmp_tiers ? $tmp_tiers : []);
		$data['target_ids'] = wp_json_encode(isset($data['target_ids']) ? $data['target_ids'] : '[]');
		$data['conditions'] = wp_json_encode(isset($data['conditions']) ? $data['conditions'] : '[]');
		$data['settings'] = wp_json_encode(isset($data['settings']) ? $data['settings'] : '[]');

		// adding other default data
		$data['usage_count'] = 0;
		$data['date_created'] = current_time('mysql');
		$data['date_modified'] = current_time('mysql');
		$data['created_by'] = get_current_user_id();
		$data['updated_by'] = get_current_user_id();
		try {
			global $wpdb;
			$table_name = $wpdb->prefix . 'campaignbay_campaigns';
			$formats = array(
				'%s',
				'%s',
				'%s',
				'%s',
				'%f',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%d',
				'%d',
				'%s',
				'%s',
				'%d',
				'%d'
			);

			//phpcs:ignore
			$result = $wpdb->insert($table_name, $data, $formats);

			if (false === $result) {
				throw new Exception('Failed to create campaign.');
			}

			$campaign_id = $wpdb->insert_id;
			$campaign = new self($campaign_id);

			/**
			 * Fires after a new campaign is created and all its data is saved.
			 *
			 * @param int      $campaign_id The ID of the new campaign.
			 * @param Campaign $campaign    The campaign object.
			 */
			do_action('campaignbay_campaign_save', $campaign_id, $campaign);

			// Log the activity.
			Logger::get_instance()->log(
				'campaign_created',
				'created',
				array(
					'campaign_id' => $campaign->get_id(),
					'extra_data' => array(
						'title' => $campaign->get_title(),
					)
				)
			);

			return $campaign;
		} catch (Exception $e) {
			wpab_campaignbay_log('Error creating campaign: ' . $e->getMessage(), 'ERROR');
			return new WP_Error('rest_cannot_create', __('Cannot create campaign.', 'campaignbay'), array('status' => 500, 'error' => $e->getMessage()));
		}
	}

	/**
	 * Updates the campaign with new data.
	 *
	 * @since 1.0.0
	 * @param array $args The campaign arguments to update.
	 * @return bool True on success, false on failure.
	 */
	public function update($args, $partial = false)
	{
		if ($partial) {
			$args = array_merge((array) $this->data, $args);
		}
		$validator = new Validator($args);
		$rules = [
			'title' => 'required|max:255',
			'type' => 'required|in:earlybird,scheduled,quantity,bogo',
			'status' => 'required|in:active,inactive,scheduled,expired',

			'discount_type' => 'nullable|in:percentage,fixed',
			'discount_value' => 'required_if:type,scheduled|numeric',
			'tiers' => 'nullable|array',

			'target_type' => 'nullable|in:entire_store,category,product,tag',
			'target_ids' => 'required_if:target_type,category,product,tag|array_of_integers',
			'exclude_sale_items' => 'required|boolean',
			'is_exclude' => 'nullable|boolean',

			'schedule_enabled' => 'boolean||required_if:status,scheduled',
			'start_datetime' => 'datetime|required_if:status,scheduled',
			'end_datetime' => 'datetime|nullable',

			'conditions' => 'nullable',
			'settings' => 'nullable',
			'usage_limit' => 'nullable|integer'
		];

		if (!$validator->validate($rules)) {
			return new WP_Error('rest_validation_error', $validator->get_first_error(), array('status' => 400, 'details' => $validator->get_errors(), 'data' => $args));
		}
		$data = $validator->get_validated_data();
		// validating tiers
		$tmp_tiers = array();
		if ($data['type'] === 'quantity' || $data['type'] === 'earlybird' || $data['type'] === 'bogo') {
			foreach ($data['tiers'] as $tier) {
				$tier_validator = new Validator($tier);
				$tier_rules = array();
				if ($data['type'] === 'quantity') {
					$tier_rules = [
						'id' => 'nullable|integer',
						'min' => 'required|integer|min:1|gte:previous_tier_max',
						'max' => 'required|integer|min:1|gte:min',
						'value' => 'required|numeric|min:0|max_if:type,percentage,100',
						'type' => 'required|in:percentage,currency',
					];
				} elseif ($data['type'] === 'earlybird') {
					$tier_rules = [
						'id' => 'nullable|integer',
						'quantity' => 'required|integer|min:1',
						'value' => 'required|numeric|min:0|max_if:type,percentage,100',
						'type' => 'required|in:percentage,currency',
						'total' => 'required|integer|min:0'
					];
				} elseif ($data['type'] === 'bogo') {
					$tier_rules = [
						'buy_quantity' => 'required|integer|min:1',
						'get_quantity' => 'required|integer|min:1',
					];
				}
				if (!$tier_validator->validate($tier_rules)) {
					return new WP_Error(
						'rest_validation_error',
						$tier_validator->get_first_error(),
						array(
							'status' => 400,
							'details' => array('tiers' => array($tier['id'] => $tier_validator->get_errors())),
							'data' => $tier
						)
					);
				}
				$tmp_tiers[] = $tier_validator->get_validated_data();
			}
		}
		// validating settings
		$validated_settings = $this->get_validated_settings($data['settings'] ?? array(), $data['type']);
		if (is_wp_error($validated_settings)) {
			return $validated_settings;
		}
		// json encoding json fields
		$data['target_ids'] = isset($data['target_ids']) ? wp_json_encode($data['target_ids']) : wp_json_encode($this->data->target_ids ?? '[]');
		$data['settings'] = $validated_settings ? wp_json_encode($validated_settings) : wp_json_encode($this->data->settings ?? '[]');
		$data['conditions'] = isset($data['conditions']) ? wp_json_encode($data['conditions']) : wp_json_encode($this->data->conditions ?? '[]');
		$data['tiers'] = wp_json_encode(isset($tmp_tiers) ? $tmp_tiers : $this->data->tiers ?? '[]');
		// adding other default data
		$data['date_modified'] = current_time('mysql');
		$data['updated_by'] = get_current_user_id();

		try {

			global $wpdb;
			$table_name = $wpdb->prefix . 'campaignbay_campaigns';
			$formats = array();
			$formats = array(
				'%s',
				'%s',
				'%s',
				'%s',
				'%f',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%d',
				'%s',
				'%d'
			);
			if (empty($data)) {
				return true;
			}

			//phpcs:ignore
			$result = $wpdb->update(
				$table_name,
				$data,
				array('id' => $this->id),
				$formats,
				array('%d')
			);
			if (is_wp_error($result) || false === $result) {
				return false;
			}

			// Reload data
			$this->load_data();

			/**
			 * Fires after a campaign is updated and all its data is saved.
			 *
			 * @param int      $campaign_id The ID of the updated campaign.
			 * @param Campaign $campaign    The campaign object.
			 */
			do_action('campaignbay_campaign_save', $this->id, $this);

			// Log the activity.
			Logger::get_instance()->log(
				'campaign_updated',
				'updated',
				array(
					'campaign_id' => $this->get_id(),
					'extra_data' => array(
						'title' => $this->get_title(),
					)
				)
			);

			return true;
		} catch (Exception $e) {
			wpab_campaignbay_log('Error updating campaign: ' . $e->getMessage(), 'ERROR');
			return new WP_Error('rest_cannot_update', __('Cannot update campaign.', 'campaignbay'), array('status' => 500, 'error' => $e->getMessage()));
		}
	}

	/**
	 * Deletes a campaign.
	 *
	 * @since 1.0.0
	 * @param int  $campaign_id The campaign ID to delete.
	 * @param bool $force_delete Whether to force delete (unused for compatibility).
	 * @return bool True on success, false on failure.
	 */
	public static function delete($campaign_id, $force_delete = true)
	{
		$campaign = new self($campaign_id);
		$title = $campaign->get_title();

		global $wpdb;
		$table_name = $wpdb->prefix . 'campaignbay_campaigns';

		do_action('campaignbay_before_campaign_delete', $campaign_id);

		//phpcs:ignore
		$result = $wpdb->delete(
			$table_name,
			array('id' => $campaign_id),
			array('%d')
		);

		/**
		 * Fires after a campaign is deleted.
		 *
		 * @param int $campaign_id The ID of the deleted campaign.
		 */
		do_action('campaignbay_campaign_delete', $campaign_id);

		// Log the activity.
		Logger::get_instance()->log(
			'campaign_deleted',
			'deleted',
			array(
				'campaign_id' => $campaign_id,
				'extra_data' => array(
					'title' => $title,
				)
			)
		);

		return false !== $result;
	}


	public static function get_validated_settings($settings, $type)
	{
		if ($settings === null || !is_array($settings) || empty($settings)) {
			return null;
		}
		$validator = new Validator($settings);
		if ($type === 'scheduled' || $type === 'earlybird') {
			$rules = [
				'display_as_regular_price' => 'nullable|boolean',
				'message_format' => 'nullable|string',
			];
		} elseif ($type === 'quantity') {
			$rules = [
				'enable_quantity_table' => 'nullable|boolean',
				'apply_as' => 'nullable|string|in:line_total,fee,coupon',
				'cart_quantity_message_format' => 'nullable|string',
			];
		} elseif ($type === 'bogo') {
			$rules = [
				'auto_add_free_product' => 'nullable|boolean',
				'apply_as' => 'nullable|string|in:line_total,fee',
				'bogo_banner_message_format' => 'nullable|string',
				'cart_bogo_message_format' => 'nullable|string',
				'bogo_cart_message_location' => 'nullable|string|in:line_item_name,notice,dont_show',
			];
		}
		if (!$validator->validate($rules)) {
			return new WP_Error(
				'rest_validation_error',
				$validator->get_first_error(),
				array(
					'status' => 400,
					'details' => array('settings' => $validator->get_errors())
				)
			);
		}

		return $validator->get_validated_data();
	}


	/**
	 * Getters for core properties.
	 */
	/**
	 * Gets the raw campaign data object.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return object|null The campaign data object.
	 */
	public function get_data()
	{
		return $this->data;
	}
	/**
	 * Gets the campaign ID.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return int The campaign ID.
	 */
	public function get_id()
	{
		return $this->id;
	}

	/**
	 * Gets the campaign title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return int The campaign title.
	 */
	public function get_title()
	{
		return $this->data->title;
	}

	/**
	 * Gets the campaign status.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return int The campaign status.
	 */
	public function get_status()
	{
		return $this->data->status;
	}

	public function set_status($status)
	{
		if (empty($status)) {
			return false;
		}
		$allowed_statuses = array('active', 'inactive', 'scheduled', 'expired');
		if (!in_array($status, $allowed_statuses, true)) {
			wpab_campaignbay_log(
				// Translators: %s is the invalid status provided.
				sprintf(__('Invalid status "%s" provided. Status must be one of: active, inactive, scheduled, expired.', 'campaignbay'), $status)
			);
			return false;
		}

		try {

			global $wpdb;
			$table_name = $wpdb->prefix . 'campaignbay_campaigns';


			//phpcs:ignore
			$result = $wpdb->update(
				$table_name,
				array(
					'status' => $status,
				),
				array(
					'id' => $this->id,
				),
				array(
					'%s',
				),
				array(
					'%d',
				)
			);
			if (is_wp_error($result) || false === $result) {
				return false;
			}

			// Reload data
			$this->load_data();

			/**
			 * Fires after a campaign is updated and all its data is saved.
			 *
			 * @param int      $campaign_id The ID of the updated campaign.
			 * @param Campaign $campaign    The campaign object.
			 */
			do_action('campaignbay_campaign_save', $this->id, $this);

			// Log the activity.
			Logger::get_instance()->log(
				'campaign_updated',
				'updated',
				array(
					'campaign_id' => $this->get_id(),
					'extra_data' => array(
						'title' => $this->get_title(),
					)
				)
			);

			return true;
		} catch (Exception $e) {
			wpab_campaignbay_log('Error updating campaign: ' . $e->getMessage(), 'ERROR');
			return new WP_Error('rest_cannot_update', __('Cannot update campaign.', 'campaignbay'), array('status' => 500, 'error' => $e->getMessage()));
		}
	}


	/**
	 * Gets the campaign type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return int The campaign type.
	 */
	public function get_type()
	{
		return $this->data->type;
	}

	/**
	 * Gets the discount type.
	 *
	 * @since 1.0.0
	 * @return string|null The discount type.
	 */
	public function get_discount_type()
	{
		return $this->data->discount_type ?? null;
	}

	/**
	 * Gets the discount value.
	 *
	 * @since 1.0.0
	 * @return float|null The discount value.
	 */
	public function get_discount_value()
	{
		return isset($this->data->discount_value) ? floatval($this->data->discount_value) : null;
	}

	/**
	 * Gets the campaign tiers.
	 *
	 * @since 1.0.0
	 * @return array The campaign tiers.
	 */
	public function get_tiers()
	{
		return $this->data->tiers ?? array();
	}

	/**
	 * Gets the campaign conditions.
	 *
	 * @since 1.0.0
	 * @return array The campaign conditions.
	 */
	public function get_conditions()
	{
		if (is_string($this->data->conditions))
			return json_decode($this->data->conditions, true) ?? array();
		return $this->data->conditions ?? array();
	}

	/**
	 * Gets the campaign settings.
	 *
	 * @since 1.0.0
	 * @return array The campaign settings.
	 */
	public function get_settings()
	{
		if (is_string($this->data->settings))
			return json_decode($this->data->settings, true) ?? array();
		return $this->data->settings ?? array();
	}

	/**
	 * Gets the target type.
	 *
	 * @since 1.0.0
	 * @return string|null The target type.
	 */
	public function get_target_type()
	{
		return $this->data->target_type ?? null;
	}

	/**
	 * Gets the target IDs.
	 *
	 * @since 1.0.0
	 * @return array The target IDs.
	 */
	public function get_target_ids()
	{
		return $this->data->target_ids ?? array();
	}

	/**
	 * Gets whether sale items are excluded.
	 *
	 * @since 1.0.0
	 * @return bool True if sale items are excluded, false otherwise.
	 */
	public function get_exclude_sale_items()
	{
		return !empty($this->data->exclude_sale_items);
	}

	/**
	 * Gets whether products are excluded (is_exclude).
	 *
	 * @since 1.0.0
	 * @return bool True if products are excluded, false otherwise.
	 */
	public function get_is_exclude()
	{
		return !empty($this->data->is_exclude);
	}

	/**
	 * Gets the usage limit.
	 *
	 * @since 1.0.0
	 * @return int|null The usage limit, or null if unlimited.
	 */
	public function get_usage_limit()
	{
		return isset($this->data->usage_limit) ? intval($this->data->usage_limit) : null;
	}

	/**
	 * Gets whether scheduling is enabled.
	 *
	 * @since 1.0.0
	 * @return bool True if scheduling is enabled, false otherwise.
	 */
	public function get_schedule_enabled()
	{
		return !empty($this->data->schedule_enabled);
	}



	/**
	 * Gets the start datetime string.
	 *
	 * @since 1.0.0
	 * @return string|null The start datetime in 'Y-m-d H:i:s' format, or null if not set.
	 */
	public function get_start_datetime()
	{
		if (empty($this->data->start_datetime)) {
			return null;
		}
		return $this->data->start_datetime;
	}

	/**
	 * Gets the end datetime string.
	 *
	 * @since 1.0.0
	 * @return string|null The end datetime in 'Y-m-d H:i:s' format, or null if not set.
	 */
	public function get_end_datetime()
	{
		if (empty($this->data->end_datetime)) {
			return null;
		}
		return $this->data->end_datetime;
	}

	public function get_utc_time($date_string)
	{

		if (empty($date_string)) {
			return null;
		}

		try {
			$date = new DateTime($date_string, new DateTimeZone(wp_timezone_string()));
			$date->setTimezone(new DateTimeZone('UTC'));
			return $date->format('Y-m-d H:i:s');
		} catch (Exception $e) {
			return null;
		}
	}

	public function get_time_stamp($date_string)
	{
		$utc_datetime = $this->get_utc_time($date_string);
		return $utc_datetime ? strtotime($utc_datetime) : null;
	}

	/**
	 * Gets the start datetime string and converts it to the UTC timezone.
	 *
	 * @since 1.0.0
	 * @return string|null The start datetime in 'Y-m-d H:i:s' format (UTC), or null if not set.
	 */
	public function get_start_datetime_utc()
	{
		$start_datetime_site = $this->data->start_datetime;

		if (empty($start_datetime_site)) {
			return null;
		}

		try {
			$date = new DateTime($start_datetime_site, new DateTimeZone(wp_timezone_string()));
			$date->setTimezone(new DateTimeZone('UTC'));
			return $date->format('Y-m-d H:i:s');
		} catch (Exception $e) {
			wpab_campaignbay_log('Invalid start_datetime format for campaign #' . $this->id, 'ERROR');
			return null;
		}
	}

	/**
	 * Gets the end datetime string and converts it to the UTC timezone.
	 *
	 * @since 1.0.0
	 * @return string|null The end datetime in 'Y-m-d H:i:s' format (UTC), or null if not set.
	 */
	public function get_end_datetime_utc()
	{
		$end_datetime_site = $this->data->end_datetime;

		if (empty($end_datetime_site)) {
			return null;
		}

		try {
			$date = new DateTime($end_datetime_site, new DateTimeZone(wp_timezone_string()));
			$date->setTimezone(new DateTimeZone('UTC'));
			return $date->format('Y-m-d H:i:s');
		} catch (Exception $e) {
			wpab_campaignbay_log('Invalid end_datetime format for campaign #' . $this->id, 'ERROR');
			return null;
		}
	}

	/**
	 * Gets the start datetime as a UTC Unix timestamp.
	 *
	 * @since 1.0.0
	 * @return int|null The Unix timestamp, or null if no start date is set.
	 */
	public function get_start_timestamp()
	{
		$utc_datetime = $this->get_start_datetime_utc();
		return $utc_datetime ? strtotime($utc_datetime) : null;
	}

	/**
	 * Gets the end datetime as a UTC Unix timestamp.
	 *
	 * @since 1.0.0
	 * @return int|null The Unix timestamp, or null if no end date is set.
	 */
	public function get_end_timestamp()
	{
		$utc_datetime = $this->get_end_datetime_utc();
		return $utc_datetime ? strtotime($utc_datetime) : null;
	}

	/**
	 * Gets the last modified date of the campaign.
	 *
	 * @since 1.0.0
	 * @return string|null The last modified date.
	 */
	public function get_date_modified()
	{
		return $this->data->date_modified ?: null;
	}


	/**
	 * Gets the current usage count for the campaign.
	 *
	 * @since 1.0.0
	 * @return int The number of times the campaign has been used on successful orders.
	 */
	public function get_usage_count()
	{
		return (int) $this->data->usage_count;
	}


	/**
	 * Load campaign data from the database.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function load_data()
	{
		global $wpdb;
		$table_name = $wpdb->prefix . 'campaignbay_campaigns';

		//phpcs:ignore
		$this->data = $wpdb->get_row(
			$wpdb->prepare(
				//phpcs:ignore
				"SELECT * FROM {$table_name} WHERE id = %d",
				$this->id
			)
		);

		// Decode JSON fields
		if ($this->data) {
			$this->data->target_ids = !empty($this->data->target_ids) ? json_decode($this->data->target_ids, true) : array();
			$this->data->tiers = !empty($this->data->tiers) ? json_decode($this->data->tiers, true) : array();
			$this->data->conditions = !empty($this->data->conditions) ? json_decode($this->data->conditions, true) : array();
			$this->data->settings = !empty($this->data->settings) ? json_decode($this->data->settings, true) : array();
		}
	}





	/**
	 * Increments the usage count for the campaign.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return bool True on success, false on failure.
	 */
	public function increment_usage_count()
	{
		global $wpdb;
		$campaigns_table = $wpdb->prefix . 'campaignbay_campaigns';

		//phpcs:ignore 
		$result = $wpdb->query(
			$wpdb->prepare(
				//phpcs:ignore
				"UPDATE {$campaigns_table}
             SET 
                usage_count = usage_count + 1,
                status = CASE 
                            WHEN usage_limit IS NOT NULL AND usage_limit > 0 AND (usage_count + 1) >= usage_limit 
                            THEN 'expired' 
                            ELSE status 
                         END
             WHERE id = %d",
				$this->id
			)
		);

		if (is_wp_error($result) || false === $result) {
			wpab_campaignbay_log('Failed to increment usage count for campaign: #' . $this->get_id(), 'ERROR');
			return false;
		}

		// --- Sync the local object with the new data ---
		// Instead of a full reload, just update the properties we know have changed.
		$this->data->usage_count = (int) $this->data->usage_count + 1;

		// Check if the status should now be 'expired' on the object
		if ($this->data->usage_limit !== null && $this->data->usage_limit > 0 && $this->data->usage_count >= $this->data->usage_limit) {
			$this->data->status = 'expired';
		}

		wpab_campaignbay_log('Usage count incremented for campaign: #' . $this->get_id() . ' ' . $this->get_title() . ' - New count: ' . $this->data->usage_count, 'DEBUG');

		/**
		 * Fires after a campaign's usage count is updated.
		 *
		 * @param int      $campaign_id The ID of the updated campaign.
		 * @param Campaign $campaign    The campaign object with the new usage count.
		 */
		do_action('campaignbay_campaign_usage_incremented', $this->id, $this);

		return true;
	}


	/**
	 * Checks if this campaign applies to a specific product.
	 *
	 * @since 1.0.0
	 * @param int|WC_Product $product The product ID or WC_Product object.
	 * @return bool True if the campaign applies to the product, false otherwise.
	 */
	public function is_applicable_to_product($product)
	{
		return Filter::get_instance()->match($product, $this);
	}


}
