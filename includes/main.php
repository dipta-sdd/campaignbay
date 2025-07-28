<?php // phpcs:ignore Class file names should be based on the class name with "class-" prepended.
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

  
/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    WPAB_CampaignBay
 * @subpackage WPAB_CampaignBayincludes
 * @author     dipta-sdd <sankarsandipta@gmail.com>
 */
class WPAB_CB {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      WPAB_CB_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * Define the core functionality of the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {

		$this->load_dependencies();
		$this->set_locale();
		$this->define_core_hooks();
		$this->define_admin_hooks();
		$this->define_public_hooks();

	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - WPAB_CB_Loader. Orchestrates the hooks of the plugin.
	 * - WPAB_CB_i18n. Defines internationalization functionality.
	 * - WPAB_CB_Admin. Defines all hooks for the admin area.
	 * - WPAB_CB_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {
		
		/**Plugin Core Functions*/
		require_once WPAB_CB_PATH . 'includes/functions.php';
		/**
		 * The class responsible for defining all custom post types and statuses.
		 */
		require_once WPAB_CB_PATH . 'includes/class-wpab-cb-post-types.php';

		/**
		 * The class responsible for defining all campaign related functionality.
		 */
		require_once WPAB_CB_PATH . 'includes/class-campaign.php';

		/**
		 * The class responsible for defining all campaign related functionality.
		 */
		require_once WPAB_CB_PATH . 'includes/class-campaign-manager.php';

		/**
		 * The class responsible for defining all campaign related functionality.
		 */
		require_once WPAB_CB_PATH . 'includes/class-pricing-engine.php';
		


		/* API */
		require_once WPAB_CB_PATH . 'includes/api/index.php';


		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once WPAB_CB_PATH . 'includes/class-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once WPAB_CB_PATH . 'includes/class-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in both admin and public area.
		 */
		require_once WPAB_CB_PATH . 'includes/class-include.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */

		require_once WPAB_CB_PATH . 'includes/class-admin.php';

		$this->loader = new WPAB_CB_Loader();
		
	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the WPAB_CB_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new WPAB_CB_i18n();

		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );
	}

	/**
	 * Register all of the hooks related to both admin and public-facing areas functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_core_hooks() {

		$plugin_include = wpab_cb_include();

		/* Register scripts and styles */
		$this->loader->add_action( 'init', $plugin_include, 'register_scripts_and_styles' );
		/* Register custom post types and statuses */
		$post_types = wpab_cb_post_types();
		$this->loader->add_action( 'init', $post_types, 'register_post_type' );
		$this->loader->add_action( 'init', $post_types, 'register_post_statuses' );
		$campaign_manager = wpab_cb_campaign_manager();
		$pricing_engine   = wpab_cb_pricing_engine();

		// A list of all components that provide a get_hooks() method.
		$components_with_hooks = array(
			$campaign_manager,
			$pricing_engine,
		);

		foreach ( $components_with_hooks as $component ) {
			$hooks = $component->get_hooks();
			foreach ( $hooks as $hook ) {
				if ( 'action' === $hook['type'] ) {
					$this->loader->add_action(
						$hook['hook'],
						$component,
						$hook['callback'],
						$hook['priority'],
						$hook['accepted_args']
					);
				} elseif ( 'filter' === $hook['type'] ) {
					$this->loader->add_filter(
						$hook['hook'],
						$component,
						$hook['callback'],
						$hook['priority'],
						$hook['accepted_args']
					);
				}
			}
		}
		
	}

	/**
	 * Register all of the hooks related to the public area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {
		if ( is_admin() ) {
			return;
		}
		// Enqueue the public CSS for the plugin.
		$this->loader->add_action(
			'wp_enqueue_scripts',
			$this,
			'enqueue_public_styles'
		);

	}

	public function enqueue_public_styles() {
		wp_enqueue_style( 'wpab-cb-public', WPAB_CB_URL . 'build/public.css', array(), WPAB_CB_VERSION );
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = wpab_cb_admin();
		if ( ! is_admin() ) {
			// wpab_cb_log('Not in admin area', 'DEBUG');
			return;
		}
		// wpab_cb_log('In admin area', 'DEBUG');

		$this->loader->add_action( 'admin_menu', $plugin_admin, 'add_admin_menu' );
		$this->loader->add_filter( 'admin_body_class', $plugin_admin, 'add_has_sticky_header' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_resources' );

		/*Register Settings*/
		$this->loader->add_action( 'rest_api_init', $plugin_admin, 'register_settings' );
		$this->loader->add_action( 'admin_init', $plugin_admin, 'register_settings' );
		$plugin_basename = plugin_basename( WPAB_CB_PATH . 'campaign-bay.php' );
		$this->loader->add_filter( 'plugin_action_links_' . $plugin_basename, $plugin_admin, 'add_plugin_links', 10, 4 );
	}



	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    WPAB_CB_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}
}
