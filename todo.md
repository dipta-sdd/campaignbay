Hello Plugin Review Team,

Thank you for your time and for reviewing our plugin, CampaignBay.

We have built this plugin to be a high-performance, user-friendly discount manager for WooCommerce. We wanted to provide some key information about our architectural decisions and security practices to assist with your review process.

**1. Technical Architecture:**

- **Custom Database Tables:** You will notice the plugin creates two custom tables (`wp_campaignbay_campaigns` and `wp_campaignbay_logs`). We chose this approach instead of Custom Post Types for performance reasons. Storing campaigns and analytics in custom, indexed tables allows our dashboard and discount engine to perform complex queries much faster, which is critical for stores with many products and orders.
- **React-Based Admin Interface:** The entire admin interface is a modern React application. To ensure backward compatibility, our build process generates two separate script files in the `build/` directory: `admin.js` for modern WordPress environments, and a fully self-contained `admin-legacy.js` for older versions of WordPress that do not include React. Our PHP code detects the WordPress version and enqueues the appropriate script.
- **REST API:** The React app communicates with WordPress via a custom REST API namespace (`/campaignbay/v1/`). All endpoints are registered with a `permission_callback` to ensure only users with the `manage_options` capability can access them.
- **Scheduling:** Campaign scheduling is handled by the standard WordPress Cron (`WP-Cron`). We have also included a failsafe mechanism that runs on admin page loads to correct any campaign statuses if a cron job is missed or disabled on the user's server.

**2. Security Practices:**

We have taken security very seriously throughout development:

- All REST API endpoints are protected with a `permission_callback` and require a `X-WP-Nonce` header for all state-changing requests (`POST`, `PUT`, `DELETE`).
- All database queries are executed using `$wpdb->prepare()` to prevent SQL injection.
- All data output to the screen is escaped using appropriate functions (e.g., `esc_html`, `esc_attr`, `wp_kses_post`).
- All user input is sanitized on the backend before being processed or saved.

**3. Data Handling on Uninstall:**

The plugin includes an `uninstall.php` script for clean data removal. By default, our custom tables and options are preserved to prevent accidental data loss. However, we have provided an explicit opt-in setting in **Settings → Advanced Settings** ("Delete All Data on Uninstall") that allows a user to completely remove all plugin data from their database upon deletion.

**4. Live Demo:**

To make your review process as smooth as possible, we have set up a full live demo where you can see all features in action.

- **Frontend & Backend Demo:** `https://wpanchorbay.com/plugins/campaignbay/#demo`

We believe we have followed all the best practices and guidelines for security and development. We are excited to contribute to the WordPress community and are ready to make any changes or answer any questions you may have.

Thank you for your consideration.

Sincerely,
The WP Anchor Bay Team
