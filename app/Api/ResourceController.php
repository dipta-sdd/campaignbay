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
					'methods' => WP_REST_Server::READABLE, // POST
					'callback' => array($this, 'get_user'),
					'permission_callback' => array($this, 'get_item_permissions_check'),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/' . $this->rest_base . '/products',
			array(
				array(
					'methods' => WP_REST_Server::READABLE,
					'callback' => array($this, 'get_products'),
					'permission_callback' => array($this, 'get_item_permissions_check'),
				),
			)
		);

		register_rest_route(
			
			$namespace,
			'/' . $this->rest_base . '/categories',
			array(
				array(
					'methods' => WP_REST_Server::READABLE,
					'callback' => array($this, 'get_categories'),
					'permission_callback' => array($this, 'get_item_permissions_check'),
				),
			)
		);
	}

	public function get_user($request)
	{
		$args = array(
			'orderby' => 'display_name',
			'order' => 'ASC',
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

	public function get_products($request)
	{
		$args = array(
			'post_type' => array('product', 'product_variation', 'variable_product'),
			'post_status' => 'publish',
			'numberposts' => -1,          // Get all products
			'orderby' => 'title',
			'order' => 'ASC',
		);

		$search = $request->get_param('search');
		if (!empty($search)) {
			$args['s'] = sanitize_text_field($search);
		}

		$product_posts = get_posts($args);

		$products = array();
		foreach ($product_posts as $post) {
			// We only need the ID and title for the selector component.
			if ($post->post_parent > 0) {
				if (!isset($products[$post->post_parent]))
					$products[$post->post_parent]['variants'] = array();
				$products[$post->post_parent]['variants'][] = array(
					'id' => $post->ID,
					'name' => $post->post_title,
				);
			} else
				$products[$post->ID] = array(
					'id' => $post->ID,
					'name' => $post->post_title,
				);
		}

		$products = array_values($products);
		return rest_ensure_response($products);
	}

	public function get_categories($request)
	{
		$args = array(
			'taxonomy' => 'product_cat',
			'hide_empty' => false, // Include categories that don't have products yet
			'orderby' => 'name',
			'order' => 'ASC',
		);

		$search = $request->get_param('search');
		if (!empty($search)) {
			$args['search'] = sanitize_text_field($search);
		}

		$category_terms = get_terms($args);

		$categories = array();
		// get_terms can return a WP_Error, so we must check for it.
		if (!is_wp_error($category_terms)) {
			foreach ($category_terms as $term) {
				$categories[] = array(
					'id' => $term->term_id,
					'name' => $term->name,
				);
			}
		}

		return rest_ensure_response($categories);
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
