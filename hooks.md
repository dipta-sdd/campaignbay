```
    /**
    * Fires before any of CampaignBay's cart discount calculations begin.
    *
    * This is the primary entry point for a Pro version or third-party add-on to
    * run its own complete set of cart discount rules. An add-on can use this hook
    * to calculate its own discounts and add them to a custom property on the $cart object
    * before the Free version's logic starts.
    *
    * @since 1.0.0
    * @hook campaignbay_before_cart_discount_calculation
    *
    * @param \WC_Cart $cart The main WooCommerce cart object.
    */
    do_action('campaignbay_before_cart_discount_calculation', $cart);
```

```
    /**
    * Fires just before the discount logic is processed for a single cart item.
    *
    * This allows an add-on to perform specific actions or modify the item's
    * metadata (`$meta`) before the standard Quantity or BOGO rules are checked.
    * For example, a Pro version could use this to apply a "Free Gift" flag
    * to this specific cart item.
    *
    * @since 1.0.0
    * @hook campaignbay_before_cart_single_discount_calculation
    *
    * @param array    $cart_item        The cart item being processed.
    * @param int      $cart_quantity    The quantity of the item in the cart.
    * @param array    $meta             The pre-calculated CampaignBay metadata for this item.
    * @param \WC_Cart $cart             The main WooCommerce cart object.
    * @param string   $key              The unique key for the cart item.
    */
    do_action('campaignbay_before_cart_single_discount_calculation', $cart_item, $cart_quantity, $meta, $simple_applied, $discount_breakdown, $cart, $key);
```

```
    /**
    * Fires just after the discount logic is processed for a single cart item.
    *
    * This allows an add-on to perform specific actions or modify the item's
    * metadata (`$meta`) after the standard Quantity or BOGO rules are checked.
    * For example, a Pro version could use this to apply a "Free Gift" flag
    * to this specific cart item.
    *
    * @param array    $cart_item        The cart item being processed.
    * @param int      $cart_quantity    The quantity of the item in the cart.
    * @param array    $meta             The pre-calculated CampaignBay metadata for this item.
    * @param \WC_Cart $cart             The main WooCommerce cart object.
    * @param string   $key              The unique key for the cart item.
    */
    do_action('campaignbay_before_cart_single_discount_calculation', $cart_item, $cart_quantity, $meta, $simple_applied, $discount_breakdown, $cart, $key);
```

```
    /**
    * Filters the discount breakdown array for a single cart item after it
    * has been calculated.
    *
    * This allows an add-on to modify the discount details for a specific item
    * before the final cart-wide breakdown is assembled. For example, a Pro
    * version could add a "Free Gift" entry to the breakdown for this item.
    *
    * @since 1.0.0
    * @hook campaignbay_discount_breakdown
    *
    *
    * @param array    $discount_breakdown The current discount breakdown for the entire cart.
    * @param array    $cart_item          The cart item being processed.
    * @param array    $meta               The CampaignBay metadata for this item.
    * @param \WC_Cart $cart               The main WooCommerce cart object.
    * @param string   $key                The unique key for the cart item.
    *
    * @return array The modified discount breakdown.
    */
    $cart->campaignbay_discount_breakdown = apply_filters('campaignbay_discount_breakdown', $discount_breakdown ?? array(), $cart);
```

```
    /**
    * Fires after all CampaignBay discount calculations are complete and have been
    * applied to the cart as either coupons or fees.
    *
    * This is the final hook in the calculation sequence. It's useful for add-ons
    * that need to perform a final action based on the fully discounted cart, such
    * as updating a session variable or triggering a third-party analytics event.
    *
    * @since 1.0.0
    * @hook campaignbay_after_cart_discount_calculation
    *
    * @param \WC_Cart $cart The fully processed WooCommerce cart object.
    */
    do_action('campaignbay_after_cart_discount_calculation', $cart, );
```

```
    /**
    * Fires after the free version has calculated all its discount metadata for a single cart item.
    *
    * This action hook allows a Pro version or other extensions to inspect the discount data
    * calculated by the free version for a specific item in the cart. It can be used to
    * log data or to trigger other actions based on the discounts found.
    *
    * @since 1.1.0
    * @hook campaignbay_after_cart_discount_data
    *
    * @param array $cart_item The complete cart item array from WooCommerce.
    * @param array $meta      The discount metadata array calculated by CampaignBay, including
    *                         'simple', 'quantity', 'bogo', etc.
    */
    do_action('campaignbay_before_cart_discount_data', $cart_item);
```

```
    /**
    * Fires after the free version has calculated all its discount metadata for a single cart item.
    *
    * This action hook allows a Pro version or other extensions to inspect the discount data
    * calculated by the free version for a specific item in the cart. It can be used to
    * log data or to trigger other actions based on the discounts found.
    *
    * @since 1.1.0
    * @hook campaignbay_before_cart_discount_data
    *
    * @param array $cart_item The complete cart item array from WooCommerce.
    * @param array $meta      The discount metadata array calculated by CampaignBay, including
    *                         'simple', 'quantity', 'bogo', etc.
    */
    do_action('campaignbay_after_cart_discount_data', $cart_item, $meta);
```

```
    /**
    * Filters the final discount metadata array for a single cart item before it is returned.
    *
    * This is the primary hook for a Pro version to add its own discount data or
    * modify the data calculated by the free version. For example, a Pro feature
    * like "Free Gift" could add its own data to the `$meta` array here, which
    * would then be processed by the main cart calculation engine.
    *
    * @since 1.1.0
    * @hook campaignbay_get_cart_discount
    *
    * @param array $meta      The discount metadata array calculated by CampaignBay.
    * @param array $cart_item The complete cart item array from WooCommerce.
    *
    * @return array The potentially modified metadata array.
    */
    return apply_filters('campaignbay_get_cart_discount', $meta, $cart_item);
```

```
    /**
    * Fires when a product-level campaign type not native to the free version is being processed.
    *
    * This hook is the primary entry point for Pro add-ons to integrate their own
    * campaign logic into the pricing engine. A function hooked here should
    * perform its calculations and can modify the `$product_discount_processor`
    * object directly if needed (since it's passed by reference).
    *
    * @since 1.0.0
    * @hook campaignbay_product_discount_calculation_pro
    *
    * @param \WC_Product $product The product object currently being processed.
    * @param \WpabCampaignBay\Engine\ProductDiscount $product_discount_processor The instance of the current pricing processor object.
    * @param object $campaign The campaign object that needs to be processed.
    * @param float $original_price The product's original regular price.
    * @param float $base_price The price being used as the starting point for calculations (could be sale price).
    * @param float|null $best_price The best discounted price found so far in the loop.
    * @param object|null $applied_campaign The campaign object corresponding to the current best price.
    * @param array|null $applied_tier The tier data (if any) corresponding to the current best price.
    */
    do_action('campaignbay_product_discount_calculation_pro', $this->product, $this, $campaign, $original_price, $base_price, $best_price, $applied_campaign, $applied_tier);
```

```
    /**
    * Fires within the campaign loop, just before the current campaign's price is compared to the best price.
    *
    * This action hook is a powerful entry point for Pro add-ons to run their own logic for custom
    * campaign types. A Pro add-on could hook here, check if `$campaign` is a "Pro" type,
    * run its own price calculation, and then use the 'campaignbay_product_best_price' filter
    * to inject its calculated price into the competition.
    *
    * @since 1.0.0
    * @hook campaignbay_product_discount_before_appling
    *
    * @param WC_Product $product          The WooCommerce product object currently being processed.
    * @param object     $product_discount The instance of the ProductDiscount class.
    * @param object     $campaign         The specific campaign object being evaluated in this loop iteration.
    * @param float      $original_price   The product's original regular price.
    * @param float      $base_price       The price being used as the base for calculations (could be regular or sale price).
    * @param float|null $best_price       The best discounted price found so far from previous campaigns in the loop.
    * @param object|null $applied_campaign The campaign object that corresponds to the current best price.
    * @param object|null $applied_tier     The specific tier (if any) of the applied campaign.
    */
    do_action('campaignbay_product_discount_before_appling', $this->product, $this, $campaign, $original_price, $base_price, $best_price, $applied_campaign, $applied_tier);
```

```
    /**
    * Fires within the campaign loop, just before the current campaign's price is compared to the best price.
    *
    * This action hook is a powerful entry point for Pro add-ons to run their own logic for custom
    * campaign types. A Pro add-on could hook here, check if `$campaign` is a "Pro" type,
    * run its own price calculation, and then use the 'campaignbay_product_best_price' filter
    * to inject its calculated price into the competition.
    *
    * @since 1.0.0
    * @hook campaignbay_product_discount_before_appling
    *
    * @param WC_Product $product          The WooCommerce product object currently being processed.
    * @param object     $product_discount The instance of the ProductDiscount class.
    * @param object     $campaign         The specific campaign object being evaluated in this loop iteration.
    * @param float      $original_price   The product's original regular price.
    * @param float      $base_price       The price being used as the base for calculations (could be regular or sale price).
    * @param float|null $best_price       The best discounted price found so far from previous campaigns in the loop.
    * @param object|null $applied_campaign The campaign object that corresponds to the current best price.
    * @param object|null $applied_tier     The specific tier (if any) of the applied campaign.
    */
    do_action('campaignbay_product_discount_after_appling', $this->product, $this, $campaign, $original_price, $base_price, $best_price, $applied_campaign, $applied_tier);
```

```
    /**
    * Filters the final array of calculated discount metadata before it is attached to the product object.
    *
    * This is the primary filter for extending or modifying the data that gets stored with the product.
    * A Pro add-on could use this to add its own flags or data (e.g., 'free_shipping_applied' => true)
    * to the metadata, which can then be used by other parts of the plugin, like the cart.
    *
    * @since 1.0.0
    * @hook campaignbay_product_discount_meta
    *
    * @param array      $data    The array of calculated discount data for the product.
    * @param WC_Product $product The WooCommerce product object this data will be attached to.
    *
    * @return array The modified data array.
    */
    $this->product->add_meta_data('campaignbay', apply_filters('campaignbay_product_discount_meta', $this->data, $this->product), true);
```

```
    /**
    * Fires after a new campaign is created and all its data is saved.
    *
    * @since 1.0.0
    * @hook campaignbay_campaign_save
    *
    * @param int      $campaign_id The ID of the new campaign.
    * @param Campaign $campaign    The campaign object.
    */
    do_action('campaignbay_campaign_save', $campaign_id, $campaign);
```

```
    /**
    * Fires after a campaign is updated and all its data is saved.
    *
    * @since 1.0.0
    * @hook campaignbay_campaign_save
    *
    * @param int      $campaign_id The ID of the updated campaign.
    * @param Campaign $campaign    The campaign object.
    */
    do_action('campaignbay_campaign_save', $this->id, $this);
```

```
    /**
    * Fires before a campaign is deleted.
    *
    * @since 1.0.0
    * @hook campaignbay_before_campaign_delete
    *
    * @param int $campaign_id The ID of the deleted campaign.
    */
    do_action('campaignbay_before_campaign_delete', $campaign_id);
```

```
    /**
    * Fires after a campaign is deleted.
    *
    * @since 1.0.0
    * @hook campaignbay_campaign_delete
    *
    * @param int $campaign_id The ID of the deleted campaign.
    */
    do_action('campaignbay_campaign_delete', $campaign_id);
```

```
    /**
    * Fires after a campaign is updated and all its data is saved.
    *
    * @since 1.0.0
    * @hook campaignbay_campaign_save
    *
    * @param int      $campaign_id The ID of the updated campaign.
    * @param Campaign $campaign    The campaign object.
    */
    do_action('campaignbay_campaign_save', $this->id, $this);
```

```
    /**
    * Fires after a campaign's usage count is updated.
    *
    * @since 1.0.0
    * @hook campaignbay_campaign_usage_incremented
    *
    * @param int      $campaign_id The ID of the updated campaign.
    * @param Campaign $campaign    The campaign object with the new usage count.
    */
    do_action('campaignbay_campaign_usage_incremented', $this->id, $this);
```

```
    /**
    * Filters the default options for the plugin.
    *
    * This allows other developers or add-ons to modify the plugin's default settings
    * before they are returned or saved for the first time. It provides a clean way
    * to extend or change the core default behavior without altering the plugin's code.
    *
    * @since 1.0.0
    *
    * @param array $default_options The array of default plugin options.
    * @return array The filtered array of default options.
    */
    return apply_filters(CAMPAIGNBAY_OPTION_NAME . '_default_options', $default_options);
```

```
    /**
    * Filters the generic white-label plugin name.
    *
    * This filter provides a simple hook to change the plugin's name for white-labeling
    * purposes. It's a general-purpose filter, often superseded by the more detailed
    * array provided in the `_white_label` filter below.
    *
    * @since 1.0.0
    * @hook campaignbay_white_label_plugin_name
    *
    * @param string The default plugin name string.
    * @return string The filtered plugin name.
    */
    $plugin_name = apply_filters('campaignbay_white_label_plugin_name',esc_html('CampaignBay')
    );
```

```
    /**
    * Filters the entire array of white-label settings for the plugin.
    *
    * This is the main filter for re-branding the plugin. It allows developers to
    * change all branding-related text and URLs that are used to build the admin menu,
    * localize scripts for the React UI, and provide support links.
    *
    * @since 1.0.0
    * @hook campaignbay_white_label
    *
    * @param array $options An associative array of white-label settings.
    *    @type string $plugin_name The full, formal name of the plugin.
    *    @type string $short_name The shorter name used in UI elements.
    *    @type string $menu_label The text for the main admin menu item.
    *    @type string $custom_icon The URL to the icon used in custom UI components.
    *    @type string $menu_icon The URL to the icon for the admin menu, or a Dashicon slug.
    *    @type string $author_name The name of the plugin author.
    *    @type string $author_uri The URL for the plugin author's website.
    *    @type string $support_uri The URL for the plugin's support forum or page.
    *    @type string $docs_uri The URL for the plugin's documentation.
    *    @type int $position The position of the menu item in the WordPress admin sidebar.
    * @return array The filtered array of white-label settings.
    */
    $options = apply_filters('campaignbay_white_label',array(.........));
```

```
    /**
    * Filters the data passed from PHP to the main admin JavaScript application.
    *
    * This array is made available in the frontend as a global JavaScript object
    * (e.g., `window.wpab_cb_Localize`). It serves as the primary "bootstrap" data,
    * providing the React application with all the necessary server-side information
    * it needs to initialize and function correctly. This includes API details,
    * security nonces, global settings, and localization data.
    *
    * @since 1.0.0
    * @hook campaignbay_admin_localize
    *
    * @param array $localize An associative array of data to be passed to the JavaScript application.
    *    @type string $version                 The current version of the plugin, useful for cache-busting or debugging.
    *    @type string $root_id                 The ID of the HTML element where the React application will be mounted.
    *    @type string $nonce                   The security nonce required for making authenticated WordPress REST API requests.
    *    @type string $store                   A unique identifier for the plugin, often used for JavaScript state management stores (e.g., Redux).
    *    @type string $rest_url                The root URL of the WordPress REST API (e.g., 'https://example.com/wp-json/'). Essential for making API calls robustly.
    *    @type array  $white_label             An array of white-label settings (plugin name, author, support links, etc.) for display in the UI.
    *    @type string $woocommerce_currency_symbol The active currency symbol for the WooCommerce store (e.g., '$').
    *    @type array  $wpSettings              An array of core WordPress settings needed by the frontend.
    *        @type string $dateFormat          The site's configured date format (e.g., 'F j, Y').
    *        @type string $timeFormat          The site's configured time format (e.g., 'g:i a').
    *    @type array  $campaignbay_settings    An array containing all the saved global settings for the CampaignBay plugin.
    * @return array The filtered localization data array.
    */
    $localize = apply_filters('campaignbay_admin_localize',array(......));
```

```
    /**
    * Filters the entire settings schema for the plugin.
    *
    * This schema is used with the WordPress `register_setting` function to define the
    * structure, data types, default values, and sanitization callbacks for all of the
    * plugin's global options. It powers the REST API endpoint that the React-based
    * settings page uses to read and write data.
    *
    * The structure is a flat associative array where each key represents a single setting.
    * A `[tab_name]_[setting_name]` naming convention is used to organize the settings
    * logically, even though they are stored in a single database option.
    *
    * Developers can use this filter to add, modify, or remove settings from the CampaignBay
    * settings page, allowing for powerful extensibility.
    *
    * @since 1.0.0
    * @hook campaignbay_options_properties
    *
    * @param array $setting_properties The associative array of setting properties.
    *    @type string $key The unique key for the setting (e.g., 'global_enableAddon').
    *    @type array  $value An array defining the schema for the setting.
    *        @type string   $type              The data type ('string', 'boolean', 'integer', 'object', 'array').
    *        @type mixed    $default           The default value for the setting.
    *        @type callable $sanitize_callback The function to use for sanitizing the setting's value upon saving.
    *        @type array    $properties        For 'object' types, a nested associative array defining the properties of the object.
    *
    * @return array The filtered array of setting properties.
    */
    $setting_properties = apply_filters('campaignbay_options_properties',array(....));
```

```
    /**
    * Filters the REST API schema for a single campaign item.
    *
    * This filter allows other developers to extend the campaign's REST API endpoint
    * by adding, modifying, or removing properties from its JSON schema. This is useful
    * for add-ons that need to save their own custom data alongside a campaign.
    *
    * The `add_additional_fields_schema` function is called after this filter, ensuring that
    * any fields registered via `register_rest_field` are also included.
    *
    * @since 1.0.0
    * @hook  campaignbay_campaign_schema
    *
    * @param array $schema The campaign item schema array.
    * @return array The filtered campaign item schema array.
    */
    return $this->add_additional_fields_schema(apply_filters('campaignbay_campaign_schema', $this->schema));
```

```
    /**
    * Filters the number of days to retain log entries before they are automatically purged.
    *
    * This filter controls the duration for which campaign and activity logs are kept in the
    * custom database table. Developers can use this to increase or decrease the log retention
    * period to suit specific store needs (e.g., longer retention for auditing, or shorter
    * retention to conserve database space on high-volume stores).
    *
    * @since 1.0.0
    * @hook  campaignbay_log_retention_days
    *
    * @param int $days_to_keep The default number of days to keep logs (default: 7).
    * @return int The filtered number of days.
    */
    $days_to_keep = apply_filters( 'campaignbay_log_retention_days', 7);
```

```
    /**
    * Filters the REST API schema for the global settings object.
    *
    * This filter allows other developers to extend the plugin's main settings page
    * by adding their own setting fields to the REST API endpoint. Any properties
    * added here should also have their default values added via the
    * `campaignbay_default_options` filter to ensure proper functionality.
    *
    * @since 1.0.0
    * @hook  campaignbay_rest_settings_item_schema
    *
    * @param array $schema The associative array defining the entire settings schema.
    * @return array The filtered settings schema array.
    */
    $schema = apply_filters("campaignbay_rest_settings_item_schema", $schema);
```

```
    /**
    * Filters the HTML output for a sale price display (strikethrough price).
    *
    * This hook allows developers to completely override the final HTML string for a
    * product's sale price as formatted by the plugin. It passes the original regular
    * and sale prices, allowing for custom formatting, different separators, or the
    * addition of extra HTML elements.
    *
    * @since 1.0.0
    * @hook  campaignbay_format_sale_price
    *
    * @param string      $html_price    The default sale price HTML (e.g., '<del>...</del><ins>...</ins>').
    * @param string|float $regular_price The product's regular price.
    * @param string|float $sale_price    The product's sale price.
    *
    * @return string The modified sale price HTML.
    */
    return apply_filters('campaignbay_format_sale_price', wc_format_sale_price($price1, $price2), $price1, $price2);
```

```
    /**
    * Filters the parent ID of a given product.
    *
    * This hook is used primarily to identify the main variable product ID from a
    * variation object. Developers can use this filter to provide a custom parent ID,
    * which is useful for complex product types like bundles or composites that may
    * have their own unique parent/child relationships.
    *
    * @since 1.0.0
    * @hook  campaignbay_get_product_parent_id
    *
    * @param int        $parent_id The determined parent ID (0 if not a variation).
    * @param WC_Product $product   The product object being checked.
    *
    * @return int The filtered parent ID.
    */
    return apply_filters('campaignbay_get_product_parent_id', $parent_id, $product);
```

```
    /**
    * Filters the WooCommerce product object retrieved by the plugin.
    *
    * This hook is applied after the plugin fetches a product object using `wc_get_product()`.
    * It allows developers to intercept and modify the product object before it is used
    * in any of the plugin's internal calculations or caching mechanisms. This can be used
    * for advanced scenarios, such as substituting a different product object for testing
    * or complex bundling logic.
    *
    * @since 1.0.0
    * @hook  campaignbay_get_product
    *
    * @param WC_Product|false $product_object The retrieved product object, or false if not found.
    * @param int              $product_id     The ID of the product that was requested.
    *
    * @return WC_Product|false The filtered product object.
    */
    self::$products[$product_id] = apply_filters('campaignbay_get_product', wc_get_product($product_id), $product_id);
```
