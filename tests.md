### **Part 1: Foundational & Scheduled Discount Test Plan**

#### **Section 1: Installation, Activation & Dependencies**

- [ ] **TC-1.1:** **Clean Activation:** Activate the plugin for the first time on a clean WordPress install with WooCommerce already active.
  - **Expected:** Plugin activates without errors. The `wp_wpab_cb_logs` database table is created. Default settings are populated in the `wp_options` table.
- [ ] **TC-1.2:** **Missing WooCommerce Check:** Deactivate the WooCommerce plugin. Attempt to activate CampaignBay.
  - **Expected:** Activation is blocked. A clear, user-friendly error message is displayed, stating that WooCommerce is required.
- [ ] **TC-1.3:** **Re-activation:** Deactivate and immediately reactivate the plugin.
  - **Expected:** Plugin activates without errors. No data is lost. No database errors occur.

#### **Section 2: Admin UI & General Usability**

- [x] **TC-2.1:** **Admin Menu:** After activation, verify the "Campaigns" menu item appears correctly in the WordPress admin sidebar with the correct SVG icon.
  - **Expected:** Menu item is present. Icon is correctly sized and aligned.
- [x] **TC-2.2:** **Submenu Navigation:** Click on the main "Campaigns" menu and all its submenus (Dashboard, All Campaigns, Add Campaign, Settings, Help).
  - **Expected:** All pages load correctly without errors. The React application initializes properly on each page.
- [x] **TC-2.3:** **"Settings" Link on Plugins Page:** Navigate to the main WordPress Plugins page.
  - **Expected:** A "Settings" link and a "Documentation" link appear next to "Deactivate" for the CampaignBay plugin. The "Settings" link correctly navigates to the `#/settings` page.
- [x] **TC-2.4:** **Logs Modal:** Navigate to Settings > Global. Click the "View Logs" button.
  - **Expected:** The log viewer modal opens. It either shows "No logs recorded for today" or the content of the log file. The "Refresh" and "Clear Logs" buttons are present.
- [x] **TC-2.5:** **Clear Logs Functionality:** In the logs modal, click "Clear Log Files" and confirm the action.
  - **Expected:** A confirmation prompt appears. After confirming, a success notice is shown. The log file on the server is deleted. Clicking "Refresh" now shows "No logs recorded for today".

#### **Section 3: Scheduled Discount Campaign - End-to-End Tests**

##### **3.1: Campaign Creation & Configuration**

- [x] **TC-3.1.1:** **Create a Future-Dated Campaign:**
  1.  Go to "Add Campaign".
  2.  **Discount Type:** `Scheduled Discount`.
  3.  **Status:** `Active`.
  4.  **Enable Scheduling:** ON (this should be forced).
  5.  **Start Date:** Set to tomorrow at 10:00 AM.
  6.  **End Date:** Set to next week at 10:00 PM.
  7.  **Target:** `Entire Store`.
  8.  **Discount:** `15` `Percent (%)`.
  9.  Save the campaign.
  - **Expected:** Campaign saves successfully. The status in the "All Campaigns" list is **Scheduled**. In WP Crontrol, an activation and deactivation hook are correctly scheduled for the future UTC timestamps.
- [x] **TC-3.1.2:** **Create an Immediately Active Campaign:**
  1.  Go to "Add Campaign".
  2.  **Discount Type:** `Scheduled Discount`.
  3.  **Status:** `Active`.
  4.  **Enable Scheduling:** OFF.
  5.  Save the campaign.
  - **Expected:** Campaign saves successfully. The status in the "All Campaigns" list is **Active**.
- [x] **TC-3.1.3:** **Create a Draft Campaign:** Create any scheduled discount but set the **Status** to `Inactive`.
  - **Expected:** Campaign saves successfully. Status is **Inactive**. No cron jobs are scheduled.

##### **3.2: Frontend Display & Pricing (Scheduled Discount)**

- [x] **TC-3.2.1:** **Shop Page Display:** With the "Immediately Active" campaign (TC-3.1.2) running, view the main shop page.
  - **Expected:** All products show a strikethrough regular price and the new, 15% lower price. The "Sale!" badge appears on products.
- [x] **TC-3.2.2:** **Single Product Page Display:** View the product page for a simple product.
  - **Expected:** Price display is correct. The "You save X!" message appears correctly under the price.
- [ ] **TC-3.2.3:** **Variable Product Display:** View a variable product. Select a variation.
  - **Expected:** The price display updates correctly to show the discounted price for the selected variation.

##### **3.3: Cart & Checkout Logic (Scheduled Discount)**

- [x] **TC-3.3.1:** **Basic Cart Application:** Add a product to the cart with the "Immediately Active" campaign running.
  - **Expected:** The line item price in the cart shows the strikethrough price. The subtotal is correct. In the cart totals, a single line item for the campaign appears with the correct total discount amount.
- [x] **TC-3.3.2:** **Setting: Exclude Sale Items (ON):** In settings, turn ON "Automatically Exclude Sale Items". Add a product that has a native WooCommerce sale price to the cart.
  - **Expected:** The product's price in the cart is the native WooCommerce sale price. The CampaignBay discount is **not** applied.
- [x] **TC-3.3.3:** **Setting: Exclude Sale Items (OFF):** In settings, turn OFF "Automatically Exclude Sale Items". Add the same native sale product to the cart.
  - **Expected:** The CampaignBay discount is applied to the product's **regular price**, ignoring the native sale price (or applies to the sale price, depending on your chosen logic, but the behavior must be consistent).
- [x] **TC-3.3.4:** **Setting: Stacking (Disabled):** In settings, turn OFF "Allow Stacking with WooCommerce Coupons". With a campaign discount active in the cart, try to apply a valid WooCommerce coupon.
  - **Expected:** The coupon is rejected. A clear error message is displayed ("A store promotion is already active...").
- [x] **TC-3.3.5:** **Setting: Stacking (Enabled):** In settings, turn ON "Allow Stacking...". Repeat the previous test.
  - **Expected:** Both the campaign discount (as a changed price) and the WooCommerce coupon (as a separate line item) are applied successfully.

##### **3.4: Scheduling & Automation (Scheduled Discount)**

- [x] **TC-3.4.1:** **Scheduled Activation:** Let the start time for your future-dated campaign (TC-3.1.1) pass. Visit the site to trigger WP-Cron.
  - **Expected:** The campaign's status automatically changes from **Scheduled** to **Active**. Discounts now appear on the frontend. The activation cron job is removed.
- [x] **TC-3.4.2:** **Scheduled Deactivation:** Let the end time for the same campaign pass. Visit the site.
  - **Expected:** The campaign's status automatically changes from **Active** to **Expired**. Discounts are no longer active on the frontend. The deactivation cron job is removed.
- [x] **TC-3.4.3:** **Manual Deactivation:** While a scheduled campaign is running, edit it and change its status to `Draft`.
  - **Expected:** The campaign becomes inactive immediately. The deactivation cron job in WP Crontrol is removed.

#### **Section 4: Quantity-Based Discount Campaign**

##### **4.1: Campaign Creation & Configuration**

- [x] **TC-4.1.1:** **Create a Percentage-Based Quantity Campaign:**
  1.  Go to "Add Campaign".
  2.  **Discount Type:** `Quantity Based Discount`.
  3.  **Status:** `Active`, **Enable Scheduling:** OFF.
  4.  **Target:** A specific simple product (e.g., "T-Shirt").
  5.  **Define Quantity Tiers:**
      - Tier 1: Min `3`, Max `5`, Value `10`, Type `%`
      - Tier 2: Min `6`, Max `10`, Value `15`, Type `%`
      - Tier 3: Min `11`, Max ``, Value `20`, Type `%`
  6.  Save the campaign.
  - **Expected:** Campaign saves successfully with status **Active**.
- [x] **TC-4.1.2:** **Create a Fixed-Amount Quantity Campaign:**
  1.  Create a new campaign similar to above.
  2.  **Target:** A different specific simple product (e.g., "Mug" that costs $15).
  3.  **Define Quantity Tiers:**
      - Tier 1: Min `2`, Max `4`, Value `2`, Type `$`
      - Tier 2: Min `5`, Max ``, Value `4`, Type `$`
  4.  Save the campaign.
  - **Expected:** Campaign saves successfully with status **Active**.

##### **4.2: Frontend Display & Pricing (Quantity Discount)**

- [x] **TC-4.2.1:** **Shop Page Display:** View the shop page.
  - **Expected:** The "T-Shirt" and "Mug" products should show a discounted price. The price shown should be based on the **first tier** of the discount (e.g., the price for buying 3 T-Shirts or 2 Mugs). A "Sale!" badge should be present.
- [x] **TC-4.2.2:** **Single Product Page Display:** View the product page for the "T-Shirt".
  - **Expected:** The price display is correct for the first tier. The "You save X!" message is displayed. A quantity pricing table (if you have that feature) should clearly show the different tiers.

##### **4.3: Cart & Checkout Logic (Quantity Discount)**

- [ ] **TC-4.3.1:** **Below First Tier:** Add **2** "T-Shirts" to the cart.
  - **Expected:** The price per T-Shirt in the cart is the **regular price**. The "add more to save" inline notice appears, saying `Add 1 more to get 10% off!`.
- [ ] **TC-4.3.2:** **Inside First Tier:** Update the quantity to **4**.
  - **Expected:** The price per T-Shirt is now 10% off. The "add more to save" notice updates to "Add 2 more to get 15% off!".
- [ ] **TC-4.3.3:** **Inside Second Tier:** Update the quantity to **7**.
  - **Expected:** The price per T-Shirt is now 15% off. The "add more to save" notice updates to "Add 4 more to get 20% off!".
- [ ] **TC-4.3.4:** **Inside Final Tier:** Update the quantity to **12**.
  - **Expected:** The price per T-Shirt is now 20% off. The "add more to save" notice **disappears**.
- [ ] **TC-4.3.5:** **Fixed Discount Test:** Add **3** "Mugs" to the cart (original price $15).
  - **Expected:** The price per Mug is now `$13` `($15 - $2)`. The inline notice shows the next tier (`Add 2 more to get $4 off!`).
- [ ] **TC-4.3.6:** **Fixed Discount Final Tier:** Update the quantity to **6**.
  - **Expected:** The price per Mug is now` $11
($15 - $4)`. The inline notice disappears.

#### **Section 5: Early Bird Discount Campaign**

##### **5.1: Campaign Creation & Configuration**

- [x] **TC-5.1.1:** **Create an Early Bird Campaign:**
  1.  Go to "Add Campaign".
  2.  **Discount Type:** `EarlyBird Discount`.
  3.  **Status:** `Active`, **Enable Scheduling:** OFF.
  4.  **Target:** `Entire Store`.
  5.  **Define Tiers:**
      - Tier 1: Max Orders `2`, Value `50`, Type `%`
      - Tier 2: Max Orders `5`, Value `25`, Type `%`
  6.  Save the campaign.
  - **Expected:** Campaign saves successfully with status **Active**.

##### **5.2: Cart & Checkout Logic (Early Bird Discount)**

- [x] **TC-5.2.1:** **First Order (First Tier):** With the campaign usage at 0, add any product to the cart and proceed to checkout.
  - **Expected:** A **50% discount** is applied to the product in the cart.
- [x] **TC-5.2.2:** **Complete First Order:** Complete the purchase.
  - **Expected:** The order is successful. Check the `wp_wpab_cb_logs` table: a `sale` log has been created for this campaign. The usage count for the campaign is now **1**.
- [x] **TC-5.2.3:** **Second Order (Still First Tier):** As a different customer (or in an incognito window), add a product to the cart.
  - **Expected:** A **50% discount** is still applied, as the usage count (1) is less than the tier max (2).
- [x] **TC-5.2.4:** **Complete Second Order:** Complete the purchase.
  - **Expected:** Order is successful. The campaign usage count is now **2**.
- [x] **TC-5.2.5:** **Third Order (Second Tier):** As a new customer, add a product to the cart.
  - **Expected:** The discount applied is now **25%**, as the usage count (2) has met the max for the first tier and now falls into the second tier (max 5).
- [x] **TC-5.2.6:** **Complete Orders 3, 4, and 5.**
  - **Expected:** All three orders receive a 25% discount. After the 5th total order, the campaign usage count is **5**.
- [x] **TC-5.2.7:** **Sixth Order (Offer Expired):** As a new customer, add a product to the cart.
  - **Expected:** **No discount** is applied, as the usage count (5) has met or exceeded the maximum for all defined tiers.

##### **5.3: Order Cancellation & Counter Logic (Early Bird)**

- [ ] **TC-5.3.1:** **Cancel an Order:** Take the 5th order (which used the 25% discount) and change its status from `Processing` to `Cancelled`.
  - **Expected:** The `OrderManager` detects the status change. The campaign usage count in the database is now **decremented to 4**.
- [ ] **TC-5.3.2:** **Re-test Availability:** As a new customer, add a product to the cart.
  - **Expected:** A **25% discount** is now available again, as the usage count is back to 4, which falls within the second tier. This confirms the counter logic is working correctly.

#### **Section 6: "All Campaigns" Page - Filters & Sorting**

- [ ] **TC-6.1:** **Filter by Status:**
  1.  On the "All Campaigns" page, use the "Filter by Status" dropdown.
  2.  Select `Active`.
  - **Expected:** The table updates to show only campaigns with the `wpab_cb_active` status.
  3.  Select `Scheduled`.
  - **Expected:** The table updates to show only campaigns with the `wpab_cb_scheduled` status.
  4.  Repeat for `Expired` and `Inactive` (`draft`).
  - **Expected:** The table filters correctly for each status.
- [ ] **TC-6.2:** **Filter by Discount Type:**
  1.  Use the "Filter by Discount" dropdown.
  2.  Select `Quantity Based Discount`.
  - **Expected:** The table updates to show only campaigns with `campaign_type = 'quantity'`.
  3.  Repeat for `Scheduled Discount` and `EarlyBird Discount`.
  - **Expected:** The table filters correctly for each type.
- [ ] **TC-6.3:** **Combined Filtering:**
  1.  Filter by Status: `Active`.
  2.  Filter by Discount Type: `Quantity Based Discount`.
  3.  Click "Apply".
  - **Expected:** The table shows only campaigns that are **both** `Active` and of `Quantity` type.
- [ ] **TC-6.4:** **Search Functionality:**
  1.  In the search box, type a unique word from one of your campaign titles.
  2.  Click the search icon or press Enter.
  - **Expected:** The table updates to show only the campaign(s) that match the search term.
- [ ] **TC-6.5:** **Sorting Functionality:**
  1.  Click the "Campaign Name" table header.
  - **Expected:** The table sorts the campaigns by title alphabetically (A-Z). A "sort up" icon appears.
  2.  Click the "Campaign Name" header again.
  - **Expected:** The table sorts by title in reverse alphabetical order (Z-A). A "sort down" icon appears.
  3.  Click the "Start Date" header.
  - **Expected:** The table sorts by the campaign start date, oldest first.
  4.  Click the "End Date" header.
  - **Expected:** The table sorts by the campaign end date, oldest first.

#### **Section 7: "All Campaigns" Page - Bulk Actions & Pagination**

- [ ] **TC-7.1:** **Checkbox Selection:**
  1.  Click the checkbox on three individual campaign rows.
  - **Expected:** The rows become highlighted. The footer appears, showing "3 ITEMS SELECTED".
  2.  Click the "Select All" checkbox in the table header.
  - **Expected:** All campaigns on the current page are selected. The footer updates accordingly. The "Select All" checkbox becomes checked.
  3.  Click the "Select All" checkbox again.
  - **Expected:** All campaigns are deselected. The footer disappears.
- [ ] **TC-7.2:** **Bulk Action: Deactivate:**
  1.  Select two `Active` campaigns.
  2.  From the "Bulk Actions" dropdown, select `Deactivate` and click "Apply".
  - **Expected:** A confirmation modal appears. After confirming, the selected campaigns have their status changed to `Inactive` (`draft`). A success notice is shown.
- [ ] **TC-7.3:** **Bulk Action: Activate:**
  1.  Select two `Inactive` campaigns.
  2.  From the "Bulk Actions" dropdown, select `Activate` and click "Apply".
  - **Expected:** The campaigns' statuses change to `Active`. A success notice is shown.
- [ ] **TC-7.4:** **Bulk Action: Delete:**
  1.  Select one or more campaigns using the checkboxes.
  2.  From the footer, click the trash can icon.
  - **Expected:** The confirmation modal appears, showing the correct count of items to be deleted. After confirming, the campaigns are deleted, and the table view updates.
- [ ] **TC-7.5:** **Pagination:**
  1.  Ensure you have more campaigns than the "per page" limit (e.g., more than 10).
  2.  Click the "Next Page" arrow in the footer.
  - **Expected:** The table correctly displays the next set of campaigns.
  3.  Click the "Previous Page" arrow.
  - **Expected:** The table correctly returns to the first page.

#### **Section 8: Critical Edge Cases & Conflict Scenarios**

- [ ] **TC-8.1:** **Overlapping Campaigns:** Create two active "Scheduled Discount" campaigns that both apply to the same product. One offers 10% off, the other offers 20% off.
  - **Expected:** On the frontend and in the cart, the product receives the **20% discount**, respecting your "Apply Highest Discount" setting. Only one discount line for the winning campaign appears in the cart totals.
- [ ] **TC-8.2:** **Empty Cart:** Visit the cart page when it is completely empty.
  - **Expected:** No PHP errors or warnings are generated.
- [ ] **TC-8.3:** **Zero Price Product:** Add a product that costs $0.00 to the cart with a campaign active.
  - **Expected:** No discount is applied. No PHP errors are generated. The price remains $0.00.
- [ ] **TC-8.4:** **100% Discount:** Create a campaign for a 100% discount. Add the product to the cart.
  - **Expected:** The item price in the cart becomes `$0.00`. The cart total is correctly calculated.
- [ ] **TC-8.5:** **Greater than 100% Discount:** Create a campaign for a 110% discount.
  - **Expected:** The item price in the cart becomes `$0.00`. The cart total is clamped to `$0.00` and does not go negative.
- [ ] **TC-8.6:** **API Order (No Campaign):** Create an order via the WooCommerce REST API for a product that is not part of any campaign.
  - **Expected:** The order is created successfully with the original product price. No errors occur.
- [ ] **TC-8.7:** **Plugin Deactivation:** Deactivate the CampaignBay plugin.
  - **Expected:** All frontend discounts disappear. The cart recalculates to show regular prices. No fatal errors occur on the frontend or backend.
