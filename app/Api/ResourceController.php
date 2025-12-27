<?php

namespace WpabCampaignBay\Api;

use WpabCampaignBay\Core\Common;

if (!defined('ABSPATH')) {
	exit;
}

// Import WordPress REST API classes

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WpabCampaignBay\Admin\Admin;

/**
 * Class used to manage a plugin's resources via the REST API.
 *
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay_Api_Settings
 */

/**
 * Get Plugin's resources via the REST API.
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay_Api_Settings
 * @author     dipta-sdd <sankarsandipta@gmail.com>
 *
 * @see ApiController
 */
/**
 * ResourceController
 *
 * @see WP_REST_Settings_Controller
 * @package    WPAB_CampaignBay
 * @since 1.0.0
 */
class ResourceController extends ApiController
{

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   ResourceController
	 * @access private
	 */
	private static $instance = null;
	/**
	 * Initialize the class and set up actions.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function run()
	{
		$this->type = 'campaignbay_api_resources';
		$this->rest_base = 'resources';

		/*Custom Rest Routes*/
		add_action('rest_api_init', array($this, 'register_routes'));
	}

	/**
	 * Register REST API route.
	 *
	 * @since    1.0.0
	 * @access public
	 * @return void
	 */
	public function register_routes()
	{
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/' . $this->rest_base . '/users',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE, // POST
					'callback'            => array($this, 'get_user'),
					'permission_callback' => array($this, 'get_item_permissions_check'),
				),
			)
		);
	}

	public function get_user($request)
	{
		$args = array(
			'orderby' => 'display_name',
			'order'   => 'ASC',
		);

		$search = $request->get_param('search');
		if (!empty($search)) {
			$args['search'] = '*' . sanitize_text_field($search) . '*';
		}

		$users = get_users($args);
		$response = array();

		foreach ($users as $user) {
			$response[] = array(
				'id' => $user->ID,
				'name' => $user->display_name,
				'email' => $user->user_email,
			);
		}


		return rest_ensure_response($response);
	}

	/**
	 * Prepares a value for output based off a schema array.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param mixed $value  Value to prepare.
	 * @param array $schema Schema to match.
	 * @return mixed The prepared value.
	 */
	protected function prepare_value($value, $schema)
	{

		$sanitized_value = rest_sanitize_value_from_schema($value, $schema);

		return $sanitized_value;
	}

	/**
	 * Gets an instance of this class.
	 * Prevents duplicate instances which avoid artefacts and improves performance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return ResourceController
	 */
	public static function get_instance()
	{
		// Store the instance locally to avoid private static replication.
		static $instance = null;
		if (null === self::$instance) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
