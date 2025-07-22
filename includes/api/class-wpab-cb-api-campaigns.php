<?php // phpcs:ignore Class file names should be based on the class name with "class-" prepended.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The REST API Controller for Campaigns.
 *
 * @link       https://wpanchorbay.com
 * @since      1.0.0
 *
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBay/includes/api
 */

if ( ! class_exists( 'WPAB_CB_Api_Campaigns' ) ) {
	/**
	 * The Campaign API controller class.
	 *
	 * This class defines the REST API endpoints for managing campaigns.
	 * It uses the WPAB_CB_Campaign class to interact with the database.
	 *
	 * @since      1.0.0
	 * @package    WPAB_CampaignBay
	 * @author     WP Anchor Bay <wpanchorbay@gmail.com>
	 */
	class WPAB_CB_Api_Campaigns extends WPAB_CB_Api {

		/**
		 * Gets an instance of this object.
		 * Prevents duplicate instances which avoid artefacts and improves performance.
		 *
		 * @static
		 * @access public
		 * @return object
		 * @since 1.0.0
		 */
		public static function get_instance() {
			// Store the instance locally to avoid private static replication.
			static $instance = null;

			// Only run these methods if they haven't been ran previously.
			if ( null === $instance ) {
				$instance = new self();
			}

			// Always return the instance.
			return $instance;
		}

		/**
		 * Initialize the class.
		 *
		 * @since 1.0.0
		 */
		public function run() {
			$this->rest_base = 'campaigns';
			add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		}

		/**
		 * Register the routes for the objects of the controller.
		 *
		 * @since 1.0.0
		 */
		public function register_routes() {
			$namespace = $this->namespace . $this->version;

			// Route for getting a collection of campaigns and creating a new one.
			register_rest_route(
				$namespace,
				'/' . $this->rest_base,
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_items' ),
						'permission_callback' => array( $this, 'permissions_check' ),
						'args'                => $this->get_collection_params(),
					),
					array(
						'methods'             => WP_REST_Server::CREATABLE,
						'callback'            => array( $this, 'create_item' ),
						'permission_callback' => array( $this, 'permissions_check' ),
						'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
					),
					'schema' => array( $this, 'get_item_schema' ), // Corrected from get_public_item_schema
				)
			);

			// Route for a single campaign.
			register_rest_route(
				$namespace,
				'/' . $this->rest_base . '/(?P<id>[\d]+)',
				array(
					'args'   => array(
						'id' => array(
							'description' => __( 'Unique identifier for the campaign.', WPAB_CB_TEXT_DOMAIN ),
							'type'        => 'integer',
						),
					),
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_item' ),
						'permission_callback' => array( $this, 'permissions_check' ),
					),
					array(
						'methods'             => WP_REST_Server::EDITABLE,
						'callback'            => array( $this, 'update_item' ),
						'permission_callback' => array( $this, 'permissions_check' ),
						'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
					),
					array(
						'methods'             => WP_REST_Server::DELETABLE,
						'callback'            => array( $this, 'delete_item' ),
						'permission_callback' => array( $this, 'permissions_check' ),
					),
					'schema' => array( $this, 'get_item_schema' ), // Corrected from get_public_item_schema
				)
			);
		}

		/**
		 * Check if a given request has access to manage campaigns.
		 *
		 * @since 1.0.0
		 * @param WP_REST_Request $request Full details about the request.
		 * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
		 */
		public function permissions_check( $request ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return new WP_Error( 'rest_forbidden', __( 'You do not have permission to manage campaigns.', WPAB_CB_TEXT_DOMAIN ), array( 'status' => 401 ) );
			}
			return true;
		}

		/**
		 * Get a collection of campaigns.
		 *
		 * @since 1.0.0
		 * @param WP_REST_Request $request Full details about the request.
		 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
		 */
		public function get_items( $request ) {
			$args = array(
				'post_type'      => 'wpab_cb_campaign',
				'post_status'    => 'any',
				'posts_per_page' => $request['per_page'],
				'paged'          => $request['page'],
				's'              => $request['search'],
			);

			$query         = new WP_Query( $args );
			$response_data = array();

			if ( $query->have_posts() ) {
				foreach ( $query->get_posts() as $post ) {
					$campaign = wpab_cb_get_campaign( $post );
					if ( $campaign ) {
						$response_data[] = $this->prepare_item_for_response( $campaign, $request );
					}
				}
			}

			$response = new WP_REST_Response( $response_data, 200 );
			$response->header( 'X-WP-Total', $query->found_posts );
			$response->header( 'X-WP-TotalPages', $query->max_num_pages );

			return $response;
		}

		/**
		 * Get one campaign.
		 *
		 * @since 1.0.0
		 * @param WP_REST_Request $request Full details about the request.
		 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
		 */
		public function get_item( $request ) {
			$id       = (int) $request['id'];
			$campaign = wpab_cb_get_campaign( $id );

			if ( ! $campaign ) {
				return new WP_Error( 'rest_campaign_not_found', __( 'Campaign not found.', WPAB_CB_TEXT_DOMAIN ), array( 'status' => 404 ) );
			}

			$data = $this->prepare_item_for_response( $campaign, $request );
			return new WP_REST_Response( $data, 200 );
		}

		/**
		 * Create one campaign.
		 *
		 * @since 1.0.0
		 * @param WP_REST_Request $request Full details about the request.
		 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
		 */
		public function create_item( $request ) {
			$params   = $request->get_json_params();
			$campaign = WPAB_CB_Campaign::create( $params );

			if ( is_wp_error( $campaign ) ) {
				return $campaign;
			}

			$data     = $this->prepare_item_for_response( $campaign, $request );
			$response = new WP_REST_Response( $data, 201 );
			$response->header( 'Location', rest_url( sprintf( '%s/%s/%d', $this->namespace . $this->version, $this->rest_base, $campaign->get_id() ) ) );

			return $response;
		}

		/**
		 * Update one campaign.
		 *
		 * @since 1.0.0
		 * @param WP_REST_Request $request Full details about the request.
		 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
		 */
		public function update_item( $request ) {
			$id       = (int) $request['id'];
			$campaign = wpab_cb_get_campaign( $id );

			if ( ! $campaign ) {
				return new WP_Error( 'rest_campaign_not_found', __( 'Campaign not found.', WPAB_CB_TEXT_DOMAIN ), array( 'status' => 404 ) );
			}

			$params = $request->get_json_params();
			$result = $campaign->update( $params );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			// Get the fresh, updated campaign object to return.
			$updated_campaign = wpab_cb_get_campaign( $id );
			$data             = $this->prepare_item_for_response( $updated_campaign, $request );

			return new WP_REST_Response( $data, 200 );
		}

		/**
		 * Delete one campaign.
		 *
		 * @since 1.0.0
		 * @param WP_REST_Request $request Full details about the request.
		 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
		 */
		public function delete_item( $request ) {
			$id       = (int) $request['id'];
			$campaign = wpab_cb_get_campaign( $id );

			if ( ! $campaign ) {
				return new WP_Error( 'rest_campaign_not_found', __( 'Campaign not found.', WPAB_CB_TEXT_DOMAIN ), array( 'status' => 404 ) );
			}

			$previous_data = $this->prepare_item_for_response( $campaign, $request );
			$result        = WPAB_CB_Campaign::delete( $id, true );

			if ( ! $result ) {
				return new WP_Error( 'rest_cannot_delete', __( 'The campaign could not be deleted.', WPAB_CB_TEXT_DOMAIN ), array( 'status' => 500 ) );
			}

			return new WP_REST_Response( array( 'deleted' => true, 'previous' => $previous_data ), 200 );
		}

		/**
		 * Prepare the item for the REST response.
		 *
		 * @since 1.0.0
		 * @param WPAB_CB_Campaign $campaign Campaign object.
		 * @param WP_REST_Request  $request  Request object.
		 * @return array
		 */
		public function prepare_item_for_response( $campaign, $request ) {
			$data = array(
				'id'     => $campaign->get_id(),
				'title'  => $campaign->get_title(),
				'status' => $campaign->get_status(),
			);

			$meta_keys = wpab_cb_get_campaign_meta_keys();
			foreach ( $meta_keys as $key ) {
				$data[ $key ] = $campaign->get_meta( $key );
			}

			return $data;
		}

		/**
		 * Get the query params for collections.
		 *
		 * @since 1.0.0
		 * @return array
		 */
		public function get_collection_params() {
			return array(
				'page'     => array(
					'description'       => 'Current page of the collection.',
					'type'              => 'integer',
					'default'           => 1,
					'sanitize_callback' => 'absint',
				),
				'per_page' => array(
					'description'       => 'Maximum number of items to be returned in result set.',
					'type'              => 'integer',
					'default'           => 10,
					'sanitize_callback' => 'absint',
				),
				'search'   => array(
					'description'       => 'Limit results to those matching a string.',
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				),
			);
		}

		/**
		 * Get the Campaign's schema, conforming to JSON Schema.
		 *
		 * @since 1.0.0
		 * @return array
		 */
		public function get_item_schema() {
			if ( isset( $this->schema ) ) {
				return $this->add_additional_fields_schema( $this->schema );
			}

			$schema = array(
				'$schema'    => 'http://json-schema.org/draft-04/schema#',
				'title'      => 'campaign',
				'type'       => 'object',
				'properties' => array(
					'id'                  => array(
						'description' => __( 'Unique identifier for the campaign.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'integer',
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
					),
					'title'               => array(
						'description' => __( 'The title for the campaign.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'string',
						'context'     => array( 'view', 'edit' ),
						'required'    => true,
					),
					'status'              => array(
						'description' => __( 'A named status for the campaign.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'string',
						'enum'        => array( 'draft', 'publish', 'wpab_cb_active', 'wpab_cb_scheduled', 'wpab_cb_expired' ),
						'context'     => array( 'view', 'edit' ),
					),
					'campaign_type'       => array(
						'description' => __( 'The core type of the campaign.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'string',
						'enum'        => array( 'earlybird', 'bogo', 'recurring', 'amount_discount', 'quantity_discount' ),
						'context'     => array( 'view', 'edit' ),
						'required'    => true,
					),
					'rule_status'         => array(
						'description' => __( 'The current state of the rule.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'string',
						'context'     => array( 'view', 'edit' ),
					),
					'discount_type'       => array(
						'description' => __( 'The type of discount (percentage, fixed).', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'string',
						'enum'        => array( 'percentage', 'fixed' ),
						'context'     => array( 'view', 'edit' ),
					),
					'discount_value'      => array(
						'description' => __( 'The numeric value of the discount.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'number',
						'context'     => array( 'view', 'edit' ),
					),
					'target_type'         => array(
						'description' => __( 'The scope of the rule (store, categories, products).', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'string',
						'enum'        => array( 'store', 'categories', 'products' ),
						'context'     => array( 'view', 'edit' ),
					),
					'target_ids'          => array(
						'description' => __( 'Array of category or product IDs.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'array',
						'items'       => array( 'type' => 'integer' ),
						'context'     => array( 'view', 'edit' ),
					),
					'min_quantity'        => array(
						'description' => __( 'Minimum quantity required for the discount.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'integer',
						'context'     => array( 'view', 'edit' ),
					),
					'exclude_sale_items'  => array(
						'description' => __( 'Prevent double-discounting.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'boolean',
						'context'     => array( 'view', 'edit' ),
					),
					'apply_to_shipping'   => array(
						'description' => __( 'Whether the discount applies to shipping costs.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'boolean',
						'context'     => array( 'view', 'edit' ),
					),
					'schedule_enabled'    => array(
						'description' => __( 'Whether scheduling is active for this rule.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'boolean',
						'context'     => array( 'view', 'edit' ),
					),
					'start_timestamp'     => array(
						'description' => __( 'The rule\'s start date/time (Unix Timestamp).', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'integer',
						'context'     => array( 'view', 'edit' ),
					),
					'end_timestamp'       => array(
						'description' => __( 'The rule\'s end date/time (Unix Timestamp).', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'integer',
						'context'     => array( 'view', 'edit' ),
					),
					'timezone_string'     => array(
						'description' => __( 'The timezone identifier.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'string',
						'context'     => array( 'view', 'edit' ),
					),
					'priority'            => array(
						'description' => __( 'The priority of the campaign.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'integer',
						'context'     => array( 'view', 'edit' ),
					),
					'usage_limit'         => array(
						'description' => __( 'The total number of times the campaign can be used.', WPAB_CB_TEXT_DOMAIN ),
						'type'        => 'integer',
						'context'     => array( 'view', 'edit' ),
					),
				),
			);

			$this->schema = $schema;

			return $this->add_additional_fields_schema( $this->schema );
		}
	}
}

/**
 * Function to get the instance of the API Campaigns controller.
 *
 * @return WPAB_CB_Api_Campaigns
 */
function wpab_cb_api_campaigns() {
	return WPAB_CB_Api_Campaigns::get_instance();
}

// Initialize and run the API controller.
wpab_cb_api_campaigns()->run();