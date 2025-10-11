# Test Scenarios for CampaignBay Plugin

## 1. Dashboard

### 1.1. KPIs
- **Test Case 1.1.1:** Verify that the "Active Campaigns" KPI shows the correct number of active campaigns.
- **Test Case 1.1.2:** Verify that the "Total Discounted Amount" KPI shows the correct total discount amount applied from all campaigns.
- **Test Case 1.1.3:** Verify that the "Discounted Orders" KPI shows the correct number of orders that have received a discount.
- **Test Case 1.1.4:** Verify that the "Sales from Campaigns" KPI shows the correct total sales amount from orders with campaign discounts.

### 1.2. Charts
- **Test Case 1.2.1:** Verify that the "Daily Discount Value Trends" chart displays the correct data for the selected date range (Last 7 Days, Last 30 Days, Last 1 Year).
- **Test Case 1.2.2:** Verify that the "Top Performing Campaigns" chart displays the top 5 campaigns based on the number of discounted orders.
- **Test Case 1.2.3:** Verify that the "Top Performing Types" chart displays the top campaign types based on the number of discounted orders.

### 1.3. Tables
- **Test Case 1.3.1:** Verify that the "Live Campaigns" table shows all active campaigns with the correct information (Campaign Name, Type, Ending Time).
- **Test Case 1.3.2:** Verify that the "Upcoming Campaigns" table shows all scheduled campaigns with the correct information (Campaign Name, Type, Starting Time).
- **Test Case 1.3.3:** Verify that the "Recent Activity" table shows the latest campaign-related activities.

## 2. Campaigns

### 2.1. Scheduled Discount

#### 2.1.1. Campaign Creation
- **Test Case 2.1.1.1:** Create a "Scheduled Discount" campaign with a percentage discount for the entire store.
- **Test Case 2.1.1.2:** Create a "Scheduled Discount" campaign with a fixed discount for a specific product category.
- **Test Case 2.1.1.3:** Create a "Scheduled Discount" campaign with a percentage discount for a specific product.
- **Test Case 2.1.1.4:** Create a "Scheduled Discount" campaign with a fixed discount for products with a specific tag.
- **Test Case 2.1.1.5:** Create a "Scheduled Discount" campaign with a start and end date.
- **Test Case 2.1.1.6:** Create a "Scheduled Discount" campaign with "Exclude Sale Items" enabled.
- **Test Case 2.1.1.7:** Create a "Scheduled Discount" campaign with "Enable Usage Limit" enabled.
- **Test Case 2.1.1.8:** Create a "Scheduled Discount" campaign with "Display as Regular Price" enabled.

#### 2.1.2. Campaign Application
- **Test Case 2.1.2.1:** Verify that the percentage discount is applied correctly to the products in the cart.
- **Test Case 2.1.2.2:** Verify that the fixed discount is applied correctly to the products in the cart.
- **Test Case 2.1.2.3:** Verify that the discount is applied only to the specified product category.
- **Test Case 2.1.2.4:** Verify that the discount is applied only to the specified product.
- **Test Case 2.1.2.5:** Verify that the discount is applied only to the products with the specified tag.
- **Test Case 2.1.2.6:** Verify that the campaign is active only within the specified date range.
- **Test Case 2.1.2.7:** Verify that the discount is not applied to products that are on sale when "Exclude Sale Items" is enabled.
- **Test Case 2.1.2.8:** Verify that the campaign is disabled after the usage limit is reached.
- **Test Case 2.1.2.9:** Verify that the discounted price is displayed as the regular price when "Display as Regular Price" is enabled.

### 2.2. Quantity Based Discount

#### 2.2.1. Campaign Creation
- **Test Case 2.2.1.1:** Create a "Quantity Based Discount" campaign with percentage discounts for different quantity tiers.
- **Test Case 2.2.1.2:** Create a "Quantity Based Discount" campaign with fixed discounts for different quantity tiers.
- **Test Case 2.2.1.3:** Create a "Quantity Based Discount" campaign with different tiers for a specific product.

#### 2.2.2. Campaign Application
- **Test Case 2.2.2.1:** Verify that the correct percentage discount is applied based on the quantity of the product in the cart.
- **Test Case 2.2.2.2:** Verify that the correct fixed discount is applied based on the quantity of the product in the cart.
- **Test Case 2.2.2.3:** Verify that the quantity discount is applied correctly for the specified product.

### 2.3. EarlyBird Discount

#### 2.3.1. Campaign Creation
- **Test Case 2.3.1.1:** Create an "EarlyBird Discount" campaign with a percentage discount.
- **Test Case 2.3.1.2:** Create an "EarlyBird Discount" campaign with a fixed discount.
- **Test Case 2.3.1.3:** Create an "EarlyBird Discount" campaign with a usage limit.

#### 2.3.2. Campaign Application
- **Test Case 2.3.2.1:** Verify that the percentage discount is applied correctly for the "EarlyBird" campaign.
- **Test Case 2.3.2.2:** Verify that the fixed discount is applied correctly for the "EarlyBird" campaign.
- **Test Case 2.3.2.3:** Verify that the "EarlyBird" campaign is disabled after the usage limit is reached.

### 2.4. Campaign Management
- **Test Case 2.4.1:** Verify that a campaign can be duplicated.
- **Test Case 2.4.2:** Verify that a campaign can be deleted.
- **Test Case 2.4.3:** Verify that a campaign can be activated and deactivated.
- **Test Case 2.4.4:** Verify that campaigns can be filtered by status and type.
- **Test Case 2.4.5:** Verify that campaigns can be searched by name.
- **Test Case 2.4.6:** Verify that bulk actions (Activate, Deactivate, Delete) work correctly.

## 3. Settings

### 3.1. Global Settings
- **Test Case 3.1.1:** Verify that disabling "Enable Discount Add-on" disables all campaigns.
- **Test Case 3.1.2:** Verify that changing "Bulk Table Position" changes the position of the quantity discount table on the product page.
- **Test Case 3.1.3:** Verify that changing "Discount Bar Position" changes the position of the discount message on the product page.
- **Test Case 3.1.4:** Verify that changing "Calculate Discount From" to "Sale Price" calculates the discount from the sale price of the product.

### 3.2. Product Settings
- **Test Case 3.2.1:** Verify that changing the "Product Page Schedule or Early Bird Discount Message Format" changes the discount message on the product page.
- **Test Case 3.2.2:** Verify that disabling "Enable Quantity Discounts Table on Product Page" hides the quantity discount table.
- **Test Case 3.2.3:** Verify that changing the "Discount Priority" to "Apply Lowest Discount" applies the lowest discount when multiple campaigns are applicable.

### 3.3. Cart Settings
- **Test Case 3.3.1:** Verify that disabling "Allow Stacking with WooCommerce Coupons" prevents campaign discounts from being applied when a WooCommerce coupon is used.
- **Test Case 3.3.2:** Verify that disabling "Allow Stacking with Other Discount Campaigns" prevents multiple campaign discounts from being applied to the same cart.

### 3.4. Advanced Settings
- **Test Case 3.4.1:** Verify that enabling "Delete All Data on Uninstall" removes all plugin data when the plugin is uninstalled.

## 4. General Scenarios

- **Test Case 4.1:** Verify that the plugin works correctly with variable products.
- **Test Case 4.2:** Verify that the plugin works correctly with different product types (simple, variable, etc.).
- **Test Case 4.3:** Verify that the plugin works correctly with different currencies.
- **Test Case 4.4:** Verify that the plugin is compatible with the latest version of WordPress and WooCommerce.
- **Test Case 4.5:** Verify that the plugin is responsive and works well on different screen sizes.
- **Test Case 4.6:** Verify that the plugin is secure and does not have any known vulnerabilities.
- **Test Case 4.7:** Verify that the plugin is well-documented and easy to use.
- **Test Case 4.8:** Verify that the plugin is translation-ready.