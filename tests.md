# CampaignBay Plugin Test Scenarios

This document outlines comprehensive test scenarios for the CampaignBay WooCommerce discount plugin, covering its core functionalities, UI interactions, and various discount types and targeting conditions.

## Context and Credentials
*   **Test Environment URL:** http://localhost:8001/
*   **WordPress Admin Username:** admin
*   **WordPress Admin Password:** Spider@2580

---

## 1. Campaign Creation (CRUD)

### 1.1. Creating a new campaign with minimal required fields (Positive)
*   **User Story:** As an Admin, I want to create a new campaign quickly so that I can start offering discounts.
*   **Scenario:** Verify that a new campaign can be created with only the mandatory fields filled.
*   **Given:** I am on the "Add Campaign" page.
*   **When:** I enter a valid "Campaign Title" (e.g., "Minimal Test Campaign").
*   **And:** I select "Scheduled Discount" as the "SELECT DISCOUNT TYPE".
*   **And:** I select "Active" as the "SELECT STATUS".
*   **And:** I select "Entire Store" as the "DISCOUNT TARGET".
*   **And:** I select "Percentage %" and enter "10" in "Enter Value".
*   **And:** I click the "Save Campaign" button.
*   **Then:** The campaign should be saved successfully.
*   **And:** I should be redirected to the "All Campaigns" page.
*   **And:** The newly created campaign should appear in the list with status "Active".

### 1.2. Editing an existing campaign (Positive)
*   **User Story:** As an Admin, I want to modify an existing campaign so that I can update its details.
*   **Scenario:** Verify that an existing campaign's details can be updated.
*   **Given:** A campaign named "Existing Campaign" exists with a 10% discount.
*   **And:** I am on the "All Campaigns" page.
*   **When:** I click the "Edit" action for "Existing Campaign".
*   **And:** I change the "Campaign Title" to "Updated Campaign Title".
*   **And:** I change the discount value to "15".
*   **And:** I click the "Save Changes" button.
*   **Then:** The campaign should be updated successfully.
*   **And:** The campaign in the list should reflect the "Updated Campaign Title" and the new discount value.

### 1.3. Duplicating a campaign (Positive)
*   **User Story:** As an Admin, I want to duplicate a campaign so that I can create similar campaigns quickly.
*   **Scenario:** Verify that a campaign can be duplicated, creating a new campaign with identical settings.
*   **Given:** A campaign named "Original Campaign" exists.
*   **And:** I am on the "All Campaigns" page.
*   **When:** I click the "Duplicate" action for "Original Campaign".
*   **Then:** A new campaign named "Original Campaign (Copy)" (or similar) should be created.
*   **And:** The duplicated campaign should have the same settings as the original.

### 1.4. Activating/Deactivating a campaign (Positive)
*   **User Story:** As an Admin, I want to control the active status of campaigns so that I can enable or disable discounts.
*   **Scenario:** Verify that a campaign can be activated and deactivated.
*   **Given:** A campaign named "Test Campaign" exists with status "Inactive".
*   **And:** I am on the "All Campaigns" page.
*   **When:** I select "Test Campaign" using the checkbox.
*   **And:** I select "Activate" from the "Bulk Actions" dropdown.
*   **And:** I click "Apply".
*   **Then:** The status of "Test Campaign" should change to "Active".
*   **When:** I select "Test Campaign" using the checkbox.
*   **And:** I select "Deactivate" from the "Bulk Actions" dropdown.
*   **And:** I click "Apply".
*   **Then:** The status of "Test Campaign" should change to "Inactive".

### 1.5. Deleting a campaign (Positive)
*   **User Story:** As an Admin, I want to remove campaigns that are no longer needed.
*   **Scenario:** Verify that a campaign can be deleted.
*   **Given:** A campaign named "Campaign to Delete" exists.
*   **And:** I am on the "All Campaigns" page.
*   **When:** I select "Campaign to Delete" using the checkbox.
*   **And:** I select "Delete" from the "Bulk Actions" dropdown.
*   **And:** I click "Apply".
*   **And:** I confirm the deletion.
*   **Then:** "Campaign to Delete" should no longer appear in the list of campaigns.

### 1.6. Attempting to save a campaign with invalid data (Negative)
*   **User Story:** As an Admin, I want the system to prevent me from saving campaigns with invalid data.
*   **Scenario:** Verify that the system prevents saving a campaign with a non-numeric discount value.
*   **Given:** I am on the "Add Campaign" page.
*   **When:** I enter a valid "Campaign Title".
*   **And:** I select "Scheduled Discount" as the "SELECT DISCOUNT TYPE".
*   **And:** I select "Active" as the "SELECT STATUS".
*   **And:** I select "Entire Store" as the "DISCOUNT TARGET".
*   **And:** I select "Percentage %" and enter "abc" in "Enter Value".
*   **And:** I click the "Save Campaign" button.
*   **Then:** An error message should be displayed indicating invalid input for the discount value.
*   **And:** The campaign should not be saved.

### 1.7. Attempting to save a campaign with missing required fields (Negative)
*   **User Story:** As an Admin, I want the system to prevent me from saving campaigns with missing required information.
*   **Scenario:** Verify that the system prevents saving a campaign with a missing title.
*   **Given:** I am on the "Add Campaign" page.
*   **When:** I leave "Campaign Title" empty.
*   **And:** I fill in all other mandatory fields with valid data (e.g., Scheduled Discount, Active, Entire Store, 10% discount).
*   **And:** I click the "Save Campaign" button.
*   **Then:** An error message should be displayed indicating that the "Campaign Title" is required.
*   **And:** The campaign should not be saved.

---

## 2. Specific Campaign Types

### 2.1. Scheduled Discount - Basic Percentage (Positive)
*   **User Story:** As an Admin, I want to schedule a percentage discount for a specific period.
*   **Scenario:** Verify that a scheduled percentage discount is applied correctly within its active period.
*   **Given:** A product "Simple T-Shirt" costs $20.
*   **And:** A "Scheduled Discount" campaign is created for "10% off the entire store".
*   **And:** The campaign is set to "Active" with a "Start Time" in the past and an "End Time" in the future.
*   **When:** I view the "Simple T-Shirt" product page within the active period.
*   **Then:** The price should show "$18" as the final price.
*   **And:** The original price "$20" should be displayed with a strikethrough.
*   **When:** I add "Simple T-Shirt" to the cart.
*   **Then:** The cart line item for "Simple T-Shirt" should show a price of $18.
*   **And:** The cart total should be calculated based on the discounted price.

### 2.2. Scheduled Discount - Basic Fixed Amount (Positive)
*   **User Story:** As an Admin, I want to schedule a fixed amount discount for a specific period.
*   **Scenario:** Verify that a scheduled fixed amount discount is applied correctly within its active period.
*   **Given:** A product "Premium Hoodie" costs $50.
*   **And:** A "Scheduled Discount" campaign is created for "$5 off the entire store".
*   **And:** The campaign is set to "Active" with a "Start Time" in the past and an "End Time" in the future.
*   **When:** I view the "Premium Hoodie" product page within the active period.
*   **Then:** The price should show "$45" as the final price.
*   **And:** The original price "$50" should be displayed with a strikethrough.
*   **When:** I add "Premium Hoodie" to the cart.
*   **Then:** The cart line item for "Premium Hoodie" should show a price of $45.
*   **And:** The cart total should be calculated based on the discounted price.

### 2.3. Scheduled Discount - Expired Campaign (Negative)
*   **User Story:** As an Admin, I want scheduled campaigns to automatically expire and stop applying discounts.
*   **Scenario:** Verify that an expired scheduled discount is not applied.
*   **Given:** A product "Simple T-Shirt" costs $20.
*   **And:** A "Scheduled Discount" campaign is created for "10% off the entire store".
*   **And:** The campaign is set to "Active" with an "End Time" in the past.
*   **When:** I view the "Simple T-Shirt" product page.
*   **Then:** The price should show "$20" (original price).
*   **And:** No strikethrough price should be displayed.
*   **When:** I add "Simple T-Shirt" to the cart.
*   **Then:** The cart line item for "Simple T-Shirt" should show a price of $20.
*   **And:** No discount should be applied to the cart total.

### 2.4. Scheduled Discount - Future Campaign (Negative)
*   **User Story:** As an Admin, I want scheduled campaigns to only apply discounts once their start time is reached.
*   **Scenario:** Verify that a future scheduled discount is not applied before its start time.
*   **Given:** A product "Simple T-Shirt" costs $20.
*   **And:** A "Scheduled Discount" campaign is created for "10% off the entire store".
*   **And:** The campaign is set to "Active" with a "Start Time" in the future.
*   **When:** I view the "Simple T-Shirt" product page before the start time.
*   **Then:** The price should show "$20" (original price).
*   **And:** No strikethrough price should be displayed.
*   **When:** I add "Simple T-Shirt" to the cart.
*   **Then:** The cart line item for "Simple T-Shirt" should show a price of $20.
*   **And:** No discount should be applied to the cart total.

### 2.5. EarlyBird Discount - Tiered Redemption (Positive)
*   **User Story:** As an Admin, I want to offer tiered early bird discounts based on the number of redemptions.
*   **Scenario:** Verify that early bird tiers are applied correctly as the usage count increases.
*   **Given:** A product "Limited Edition Mug" costs $10.
*   **And:** An "EarlyBird Discount" campaign is created for "Limited Edition Mug" with tiers:
    *   Tier 1: First 5 sales get 20% off.
    *   Tier 2: Next 10 sales get 10% off.
*   **And:** The campaign is "Active".
*   **When:** The first 3 customers purchase "Limited Edition Mug".
*   **Then:** The price for these 3 purchases should be $8 (20% off).
*   **When:** The next 5 customers purchase "Limited Edition Mug".
*   **Then:** The price for these 5 purchases should be $9 (10% off).
*   **When:** A customer attempts to purchase "Limited Edition Mug" after all tiers are exhausted.
*   **Then:** The price should be $10 (original price).

### 2.6. EarlyBird Discount - Usage Limit (Edge Case)
*   **User Story:** As an Admin, I want to set a total usage limit for early bird campaigns.
*   **Scenario:** Verify that an early bird campaign stops applying discounts once its total usage limit is reached, even if tiers are not exhausted.
*   **Given:** A product "Special Edition T-Shirt" costs $25.
*   **And:** An "EarlyBird Discount" campaign is created for "Special Edition T-Shirt" with a single tier: First 100 sales get 10% off.
*   **And:** The campaign has a "Usage Limit" of 50.
*   **And:** The campaign is "Active".
*   **When:** 50 customers purchase "Special Edition T-Shirt".
*   **Then:** The price for these 50 purchases should be $22.50 (10% off).
*   **When:** A 51st customer attempts to purchase "Special Edition T-Shirt".
*   **Then:** The price should be $25 (original price).

### 2.7. Quantity Discount - Tiered Pricing (Positive)
*   **User Story:** As an Admin, I want to offer tiered pricing based on the quantity of items purchased.
*   **Scenario:** Verify that quantity-based discounts are applied correctly based on the quantity in the cart.
*   **Given:** A product "Bulk Item A" costs $10.
*   **And:** A "Quantity Based Discount" campaign is created for "Bulk Item A" with tiers:
    *   Buy 1-5: 0% off ($10 each)
    *   Buy 6-10: 10% off ($9 each)
    *   Buy 11+: 20% off ($8 each)
*   **And:** The campaign is "Active".
*   **When:** I add 3 "Bulk Item A" to the cart.
*   **Then:** The price per item should be $10, and the subtotal should be $30.
*   **When:** I change the quantity to 7 "Bulk Item A" in the cart.
*   **Then:** The price per item should be $9, and the subtotal should be $63.
*   **When:** I change the quantity to 12 "Bulk Item A" in the cart.
*   **Then:** The price per item should be $8, and the subtotal should be $96.

### 2.8. Quantity Discount - Apply as Coupon (Positive)
*   **User Story:** As an Admin, I want quantity discounts to appear as a coupon in the cart.
*   **Scenario:** Verify that a quantity discount applied as a coupon is reflected in the cart.
*   **Given:** A product "Bulk Item B" costs $20.
*   **And:** A "Quantity Based Discount" campaign is created for "Bulk Item B": Buy 5+, get 15% off.
*   **And:** The campaign is "Active" and "APPLY DISCOUNT AS" is set to "Coupon".
*   **When:** I add 6 "Bulk Item B" to the cart.
*   **Then:** A coupon should appear in the cart totals, reducing the total by 15% of the "Bulk Item B" subtotal.
*   **And:** The individual line item price for "Bulk Item B" should remain $20.

### 2.9. Quantity Discount - Apply as Fee (Positive)
*   **User Story:** As an Admin, I want quantity discounts to appear as a negative fee in the cart.
*   **Scenario:** Verify that a quantity discount applied as a fee is reflected in the cart.
*   **Given:** A product "Bulk Item C" costs $30.
*   **And:** A "Quantity Based Discount" campaign is created for "Bulk Item C": Buy 4+, get $10 off.
*   **And:** The campaign is "Active" and "APPLY DISCOUNT AS" is set to "Fee".
*   **When:** I add 4 "Bulk Item C" to the cart.
*   **Then:** A negative fee of $10 should appear in the cart totals.
*   **And:** The individual line item price for "Bulk Item C" should remain $30.

### 2.10. Quantity Discount - Display Table (Positive)
*   **User Story:** As a customer, I want to see a clear table of quantity discounts on the product page.
*   **Scenario:** Verify that the quantity discount table is displayed correctly on the product page.
*   **Given:** A product "Bulk Item D" has an active "Quantity Based Discount" campaign.
*   **And:** The campaign's "Show Quantity Discounts Table on Product Page" setting is enabled.
*   **When:** I view the "Bulk Item D" product page.
*   **Then:** A table displaying the quantity tiers and their corresponding discounted prices should be visible.

### 2.11. Quantity Discount - Display Table (Negative)
*   **User Story:** As an Admin, I want to hide the quantity discount table if I choose.
*   **Scenario:** Verify that the quantity discount table is not displayed when disabled.
*   **Given:** A product "Bulk Item E" has an active "Quantity Based Discount" campaign.
*   **And:** The campaign's "Show Quantity Discounts Table on Product Page" setting is disabled.
*   **When:** I view the "Bulk Item E" product page.
*   **Then:** No quantity discount table should be visible.

---

## 3. Targeting Conditions

### 3.1. Targeting - Entire Store (Positive)
*   **User Story:** As an Admin, I want to apply a discount to all products in my store.
*   **Scenario:** Verify that a discount targeting the "Entire Store" applies to any product.
*   **Given:** A "Scheduled Discount" campaign is created for "10% off" with "DISCOUNT TARGET" set to "Entire Store".
*   **And:** The campaign is "Active".
*   **When:** I add any product (e.g., "Test Product") to the cart.
*   **Then:** A 10% discount should be applied to "Test Product".

### 3.2. Targeting - By Product Category (Positive)
*   **User Story:** As an Admin, I want to apply a discount to products within a specific category.
*   **Scenario:** Verify that a discount targeting a specific product category applies only to products in that category.
*   **Given:** A product "Category Product A" in "Category X" costs $20.
*   **And:** A product "Category Product B" in "Category Y" costs $20.
*   **And:** A "Scheduled Discount" campaign is created for "10% off" with "DISCOUNT TARGET" set to "By Product Category" and "Select Categories *" set to "Category X".
*   **And:** The campaign is "Active".
*   **When:** I add "Category Product A" to the cart.
*   **Then:** A 10% discount should be applied to "Category Product A".
*   **When:** I add "Category Product B" to the cart.
*   **Then:** No discount should be applied to "Category Product B".

### 3.3. Targeting - By Product Category with Exclude Items (Negative)
*   **User Story:** As an Admin, I want to exclude specific categories from a discount.
*   **Scenario:** Verify that a discount targeting a specific product category with "Exclude Items" enabled does not apply to products in the selected category.
*   **Given:** A product "Category Product A" in "Category X" costs $20.
*   **And:** A product "Category Product B" in "Category Y" costs $20.
*   **And:** A "Scheduled Discount" campaign is created for "10% off" with "DISCOUNT TARGET" set to "By Product Category", "Select Categories *" set to "Category X", and "Exclude Items" checked.
*   **And:** The campaign is "Active".
*   **When:** I add "Category Product A" to the cart.
*   **Then:** No discount should be applied to "Category Product A".
*   **When:** I add "Category Product B" to the cart.
*   **Then:** A 10% discount should be applied to "Category Product B".

### 3.4. Targeting - By Product (Positive)
*   **User Story:** As an Admin, I want to apply a discount to specific products.
*   **Scenario:** Verify that a discount targeting specific products applies only to those products.
*   **Given:** A product "Specific Product 1" costs $30.
*   **And:** A product "Specific Product 2" costs $30.
*   **And:** A "Scheduled Discount" campaign is created for "15% off" with "DISCOUNT TARGET" set to "By Product" and "Select Products *" set to "Specific Product 1".
*   **And:** The campaign is "Active".
*   **When:** I add "Specific Product 1" to the cart.
*   **Then:** A 15% discount should be applied to "Specific Product 1".
*   **When:** I add "Specific Product 2" to the cart.
*   **Then:** No discount should be applied to "Specific Product 2".

### 3.5. Targeting - By Product with Exclude Items (Negative)
*   **User Story:** As an Admin, I want to exclude specific products from a discount.
*   **Scenario:** Verify that a discount targeting specific products with "Exclude Items" enabled does not apply to the selected products.
*   **Given:** A product "Specific Product 1" costs $30.
*   **And:** A product "Specific Product 2" costs $30.
*   **And:** A "Scheduled Discount" campaign is created for "15% off" with "DISCOUNT TARGET" set to "By Product", "Select Products *" set to "Specific Product 1", and "Exclude Items" checked.
*   **And:** The campaign is "Active".
*   **When:** I add "Specific Product 1" to the cart.
*   **Then:** No discount should be applied to "Specific Product 1".
*   **When:** I add "Specific Product 2" to the cart.
*   **Then:** A 15% discount should be applied to "Specific Product 2".

### 3.6. Targeting - By Tags (Positive)
*   **User Story:** As an Admin, I want to apply a discount to products with a specific tag.
*   **Scenario:** Verify that a discount targeting specific tags applies only to products with those tags.
*   **Given:** A product "Tagged Product A" with tag "Sale" costs $25.
*   **And:** A product "Tagged Product B" with tag "New" costs $25.
*   **And:** A "Scheduled Discount" campaign is created for "5% off" with "DISCOUNT TARGET" set to "By Tags" and "Select Tags *" set to "Sale".
*   **And:** The campaign is "Active".
*   **When:** I add "Tagged Product A" to the cart.
*   **Then:** A 5% discount should be applied to "Tagged Product A".
*   **When:** I add "Tagged Product B" to the cart.
*   **Then:** No discount should be applied to "Tagged Product B".

### 3.7. Targeting - By Tags with Exclude Items (Negative)
*   **User Story:** As an Admin, I want to exclude products with specific tags from a discount.
*   **Scenario:** Verify that a discount targeting specific tags with "Exclude Items" enabled does not apply to products with the selected tags.
*   **Given:** A product "Tagged Product A" with tag "Sale" costs $25.
*   **And:** A product "Tagged Product B" with tag "New" costs $25.
*   **And:** A "Scheduled Discount" campaign is created for "5% off" with "DISCOUNT TARGET" set to "By Tags", "Select Tags *" set to "Sale", and "Exclude Items" checked.
*   **And:** The campaign is "Active".
*   **When:** I add "Tagged Product A" to the cart.
*   **Then:** No discount should be applied to "Tagged Product A".
*   **When:** I add "Tagged Product B" to the cart.
*   **Then:** A 5% discount should be applied to "Tagged Product B".

### 3.8. Exclude Sale Items (Positive)
*   **User Story:** As an Admin, I want to prevent discounts from applying to products that are already on sale.
*   **Scenario:** Verify that a campaign with "Exclude Sale Items" enabled does not discount products already on sale.
*   **Given:** A product "On Sale Product" costs $50, currently on sale for $40.
*   **And:** A "Scheduled Discount" campaign is created for "10% off the entire store".
*   **And:** The campaign has "Exclude Sale Items" checked.
*   **And:** The campaign is "Active".
*   **When:** I view "On Sale Product" on the shop page.
*   **Then:** The price should remain $40 (sale price), and no additional discount should be applied.
*   **When:** I add "On Sale Product" to the cart.
*   **Then:** The cart line item for "On Sale Product" should be $40, and no additional discount should be applied.

### 3.9. Exclude Sale Items (Negative)
*   **User Story:** As an Admin, I want discounts to apply to products that are already on sale if I choose.
*   **Scenario:** Verify that a campaign with "Exclude Sale Items" disabled *does* discount products already on sale.
*   **Given:** A product "On Sale Product" costs $50, currently on sale for $40.
*   **And:** A "Scheduled Discount" campaign is created for "10% off the entire store".
*   **And:** The campaign has "Exclude Sale Items" unchecked.
*   **And:** The campaign is "Active".
*   **When:** I view "On Sale Product" on the shop page.
*   **Then:** The price should show $36 (10% off $40).
*   **And:** The original price $40 should be displayed with a strikethrough.
*   **When:** I add "On Sale Product" to the cart.
*   **Then:** The cart line item for "On Sale Product" should be $36.

---

## 4. Frontend Functionality (Customer View)

### 4.1. Discounted Prices on Shop and Product Pages (Positive)
*   **User Story:** As a customer, I want to clearly see discounted prices on product listings and individual product pages.
*   **Scenario:** Verify that discounted prices and strikethrough original prices are displayed correctly.
*   **Given:** A product "Discounted Item" costs $100.
*   **And:** An active "Scheduled Discount" campaign applies a 20% discount to "Discounted Item".
*   **When:** I browse the shop page.
*   **Then:** "Discounted Item" should display its price as "$80" with "$100" struck through.
*   **When:** I visit the single product page for "Discounted Item".
*   **Then:** The product price should be displayed as "$80" with "$100" struck through.

### 4.2. Promotional Banner Display (Positive)
*   **User Story:** As a customer, I want to be informed about active promotions on product pages.
*   **Scenario:** Verify that the promotional banner appears on applicable product pages.
*   **Given:** A product "Promotional Product" costs $50.
*   **And:** An active "Scheduled Discount" campaign applies a 10% discount to "Promotional Product".
*   **And:** The campaign has a custom "Discount Message Format" set (e.g., "Save {percentage_off}% today!").
*   **When:** I view the single product page for "Promotional Product".
*   **Then:** A banner with the message "Save 10% today!" should be visible above the add-to-cart form.

### 4.3. Promotional Banner Disappearance (Negative)
*   **User Story:** As a customer, I don't want to see promotional banners for inactive or inapplicable campaigns.
*   **Scenario:** Verify that the promotional banner does not appear for inactive campaigns.
*   **Given:** A product "Promotional Product" costs $50.
*   **And:** An "Scheduled Discount" campaign applies a 10% discount to "Promotional Product".
*   **And:** The campaign is "Inactive".
*   **When:** I view the single product page for "Promotional Product".
*   **Then:** No promotional banner should be visible.

### 4.4. Bulk Discount Table Display (Positive)
*   **User Story:** As a customer, I want to see a clear table of quantity discounts on the product page.
*   **Scenario:** Verify that the quantity discount table is displayed correctly on the product page.
*   **Given:** A product "Bulk Buy Product" has an active "Quantity Based Discount" campaign with multiple tiers.
*   **And:** The campaign's "Show Quantity Discounts Table on Product Page" setting is enabled.
*   **When:** I view the "Bulk Buy Product" product page.
*   **Then:** A table displaying the quantity tiers and their corresponding discounted prices should be visible.

### 4.5. Cart and Checkout - Discount Application (Positive)
*   **User Story:** As a customer, I want discounts to be correctly applied in my cart and reflected in the final total.
*   **Scenario:** Verify that product-level and cart-level discounts are correctly applied during checkout.
*   **Given:** A product "Item A" costs $50.
*   **And:** An active "Scheduled Discount" campaign applies a 10% discount to "Item A".
*   **And:** A product "Item B" costs $100.
*   **And:** An active "Quantity Based Discount" campaign applies 20% off "Item B" when 2 or more are purchased.
*   **When:** I add 1 "Item A" and 2 "Item B" to the cart.
*   **Then:** The cart line item for "Item A" should be $45.
*   **And:** The cart line item for "Item B" should be $80 each, with a subtotal of $160.
*   **And:** The cart total should be $205.
*   **When:** I proceed to checkout.
*   **Then:** The order summary should reflect the total of $205.

### 4.6. Cart and Checkout - Recalculation on Quantity Change (Positive)
*   **User Story:** As a customer, I want discounts to be recalculated automatically when I change quantities in the cart.
*   **Scenario:** Verify that quantity-based discounts are recalculated when product quantities are updated in the cart.
*   **Given:** A product "Dynamic Product" costs $10.
*   **And:** An active "Quantity Based Discount" campaign applies:
    *   Buy 1-4: $10 each
    *   Buy 5+: $8 each
*   **When:** I add 3 "Dynamic Product" to the cart.
*   **Then:** The cart subtotal should be $30.
*   **When:** I update the quantity of "Dynamic Product" to 5 in the cart.
*   **Then:** The cart subtotal should be $40 (5 * $8).

### 4.7. Cart and Checkout - Recalculation on Item Removal (Positive)
*   **User Story:** As a customer, I want discounts to be recalculated automatically when I remove items from the cart.
*   **Scenario:** Verify that cart-level discounts are recalculated when items are removed from the cart.
*   **Given:** A product "Cart Total Product" costs $20.
*   **And:** An active "Cart Total Discount" campaign (assuming this type exists, based on `DbManager.php` enum) applies $5 off the cart total if the subtotal is $50 or more.
*   **When:** I add 3 "Cart Total Product" to the cart (subtotal $60).
*   **Then:** A $5 discount should be applied to the cart total.
*   **When:** I remove 1 "Cart Total Product" from the cart (subtotal $40).
*   **Then:** The $5 discount should no longer be applied to the cart total.

---

## 5. Settings Page

### 5.1. Global Enable/Disable Addon (Positive)
*   **User Story:** As an Admin, I want to quickly enable or disable all CampaignBay functionalities.
*   **Scenario:** Verify that toggling "Enable CampaignBay" globally enables/disables all discounts.
*   **Given:** An active "Scheduled Discount" campaign exists for "10% off the entire store".
*   **And:** The "Enable CampaignBay" checkbox in "Settings > General" is checked.
*   **When:** I view any product page.
*   **Then:** The 10% discount should be applied.
*   **When:** I uncheck "Enable CampaignBay" in "Settings > General" and click "Save Changes".
*   **And:** I view any product page.
*   **Then:** No discount should be applied.
*   **When:** I check "Enable CampaignBay" in "Settings > General" and click "Save Changes".
*   **And:** I view any product page.
*   **Then:** The 10% discount should be applied again.

### 5.2. Calculate Discount From (Positive)
*   **User Story:** As an Admin, I want to choose whether discounts are calculated from the regular price or sale price.
*   **Scenario:** Verify that the "Calculate Discount From" setting correctly influences discount calculation for products on sale.
*   **Given:** A product "On Sale Item" costs $100, currently on sale for $80.
*   **And:** An active "Scheduled Discount" campaign applies a 10% discount to "On Sale Item".
*   **And:** The campaign has "Exclude Sale Items" unchecked.
*   **When:** "Calculate Discount From" in "Settings > General" is set to "Regular Price" and I view "On Sale Item".
*   **Then:** The price should be $70 (10% off $100, then $80 sale price is ignored).
*   **When:** "Calculate Discount From" in "Settings > General" is set to "Sale Price" and I view "On Sale Item".
   *   **Then:** The price should be $72 (10% off $80).

### 5.3. Product Priority Method (Positive)
*   **User Story:** As an Admin, I want to define how multiple overlapping product discounts are handled.
*   **Scenario:** Verify that the "Product Priority Method" setting correctly applies the chosen discount when multiple campaigns apply to a product.
*   **Given:** A product "Priority Product" costs $100.
*   **And:** Two active "Scheduled Discount" campaigns apply to "Priority Product":
    *   Campaign A: 10% off (created first).
    *   Campaign B: 15% off (created second).
*   **When:** "Product Priority Method" in "Settings > General" is set to "Apply Highest Discount".
*   **Then:** The product price should reflect a 15% discount ($85).
*   **When:** "Product Priority Method" in "Settings > General" is set to "Apply Lowest Discount".
*   **Then:** The product price should reflect a 10% discount ($90).
*   **When:** "Product Priority Method" in "Settings > General" is set to "Apply First Created Discount".
*   **Then:** The product price should reflect a 10% discount ($90).

### 5.4. Save and Reset Settings (Positive)
*   **User Story:** As an Admin, I want to save my settings changes and also be able to revert to default settings.
*   **Scenario:** Verify that settings can be saved and reset to their default values.
*   **Given:** I am on the "Settings > General" page.
*   **When:** I change "Calculate Discount From" to "Sale Price".
*   **And:** I click "Save Changes".
*   **Then:** The setting should persist after page refresh.
*   **When:** I click "Reset Settings".
*   **And:** I confirm the reset.
*   **Then:** "Calculate Discount From" should revert to "Regular Price" (or its default value).

---

## 6. Additional Scenarios (Based on Code Review)

### 6.1. Campaign Status Transitions (Edge Case)
*   **User Story:** As an Admin, I want campaigns to transition between statuses correctly based on schedule.
*   **Scenario:** Verify that a scheduled campaign automatically transitions from "Scheduled" to "Active" and then to "Expired".
*   **Given:** A "Scheduled Discount" campaign is created with a "Start Time" in the future and an "End Time" further in the future.
*   **And:** The campaign status is "Scheduled".
*   **When:** The current time passes the "Start Time".
*   **Then:** The campaign status should automatically change to "Active".
*   **When:** The current time passes the "End Time".
*   **Then:** The campaign status should automatically change to "Expired".

### 6.2. Campaign Stacking with `cart_allowCampaignStacking` (Edge Case)
*   **User Story:** As an Admin, I want to control whether multiple cart-level discounts can be applied simultaneously.
*   **Scenario:** Verify that the `cart_allowCampaignStacking` setting correctly enables or disables the stacking of cart-level discounts.
*   **Given:** Two active "Quantity Based Discount" campaigns (Campaign A and Campaign B) apply to the same product, both set to "APPLY DISCOUNT AS" "Coupon".
*   **When:** The global setting `cart_allowCampaignStacking` is enabled.
*   **And:** I add enough quantity of the product to trigger both campaigns.
*   **Then:** Both Campaign A and Campaign B discounts should be applied in the cart.
*   **When:** The global setting `cart_allowCampaignStacking` is disabled.
*   **And:** I add enough quantity of the product to trigger both campaigns.
*   **Then:** Only one of the campaign discounts (e.g., the one with higher priority or created first) should be applied in the cart.

### 6.3. Usage Limit for EarlyBird Campaigns (Positive)
*   **User Story:** As an Admin, I want to limit the total number of redemptions for an EarlyBird campaign.
*   **Scenario:** Verify that an EarlyBird campaign becomes inactive once its usage limit is reached.
*   **Given:** An "EarlyBird Discount" campaign is created with a usage limit of 5.
*   **And:** The campaign is "Active".
*   **When:** 5 successful orders are placed that utilize this EarlyBird campaign.
*   **Then:** The campaign's `usage_count` should be 5.
*   **And:** The campaign's status should automatically change to "Inactive" or "Expired" (depending on implementation).
*   **When:** A 6th customer attempts to purchase the product.
*   **Then:** The EarlyBird discount should not be applied.

### 6.4. Data Integrity - JSON Fields (Positive)
*   **User Story:** As an Admin, I want to ensure complex campaign data (tiers, conditions, settings) is correctly stored and retrieved.
*   **Scenario:** Verify that JSON-encoded fields are correctly saved and loaded when creating and editing campaigns.
*   **Given:** I create a "Quantity Based Discount" campaign with multiple tiers and specific settings.
*   **When:** I save the campaign.
*   **And:** I then edit the campaign.
*   **Then:** All previously entered tiers and settings should be correctly displayed in the UI.
*   **And:** The campaign should function as expected based on these complex settings.

### 6.5. REST API Interaction (Technical/Integration)
*   **User Story:** As a developer, I want the REST API endpoints to function correctly for managing campaigns.
*   **Scenario:** Verify that campaign data can be created, retrieved, updated, and deleted via the REST API.
*   **Given:** The WordPress REST API is accessible.
*   **When:** I send a POST request to `/wp-json/campaignbay/v1/campaigns` with valid campaign data.
*   **Then:** A new campaign should be created, and its details returned in the response.
*   **When:** I send a GET request to `/wp-json/campaignbay/v1/campaigns/{campaign_id}`.
*   **Then:** The details of the specified campaign should be returned.
*   **When:** I send a PUT/POST request to `/wp-json/campaignbay/v1/campaigns/{campaign_id}` with updated data.
*   **Then:** The campaign should be updated, and the updated details returned.
*   **When:** I send a DELETE request to `/wp-json/campaignbay/v1/campaigns/{campaign_id}`.
*   **Then:** The campaign should be deleted, and a success response returned.
*   **And:** The campaign should no longer be retrievable via GET.

---

## 7. Variable Product Scenarios

### 7.1. Discount on Parent Variable Product
*   **User Story:** As an Admin, I want to apply a single discount to a parent variable product and have it apply to all its variations.
*   **Scenario:** Verify that a discount applied to a parent variable product correctly discounts all its variations.
*   **Given:** A "Variable Hoodie" product exists with variations: "Small" ($40) and "Large" ($42).
*   **And:** An active campaign applies "10% off" to the parent "Variable Hoodie" product.
*   **When:** A customer selects the "Small" variation.
*   **Then:** The price displayed should be $36.
*   **When:** The customer selects the "Large" variation.
*   **Then:** The price displayed should be $37.80.

### 7.2. Discount on a Single Specific Variation
*   **User Story:** As an Admin, I want to put only one specific variation of a product on sale.
*   **Scenario:** Verify that a discount targeted to a single variation applies only to that variation.
*   **Given:** A "Variable Hoodie" product exists with variations: "Blue - Small" ($40) and "Green - Small" ($40).
*   **And:** An active campaign applies a "$5 off" discount specifically to the "Blue - Small" variation.
*   **When:** A customer selects the "Blue - Small" variation.
*   **Then:** The price displayed should be $35.
*   **When:** The customer selects the "Green - Small" variation.
*   **Then:** The price displayed should remain $40.

### 7.3. Quantity Discount with Mixed Variations
*   **User Story:** As a customer, I want my quantity discount to apply even if I mix and match different variations of the same product.
*   **Scenario:** Verify that quantities of different variations for the same parent product are combined to trigger a quantity discount.
*   **Given:** A "Variable T-Shirt" has a quantity discount: "Buy 5 or more for 20% off".
*   **When:** I add 3 "Red" variations and 2 "Blue" variations of the "Variable T-Shirt" to my cart (total of 5).
*   **Then:** The 20% discount should be applied to all 5 T-shirts in the cart.

## 8. BOGO (Buy X, Get Y) Scenarios

### 8.1. Buy One Get One Free (Same Product)
*   **User Story:** As a customer, I want to receive a "Buy One Get One Free" discount when I add the correct quantity to my cart.
*   **Scenario:** Verify that a BOGO (Buy One Get One Free) discount for the same product is applied correctly.
*   **Given:** An active "BOGO" campaign exists for "Simple Mug": "Buy one, get one free". The mug costs $15.
*   **When:** I add 1 "Simple Mug" to the cart.
*   **Then:** The subtotal should be $15.
*   **When:** I increase the quantity to 2 "Simple Mugs" in the cart.
*   **Then:** The subtotal for the line item should be $15 (one paid, one free).

### 8.2. Buy X, Get Y (Different Products)
*   **User Story:** As a customer, I want to receive a free or discounted item when I purchase a specific required item.
*   **Scenario:** Verify that a BOGO (Buy X, Get Y) discount for different products is applied correctly.
*   **Given:** An active "BOGO" campaign exists: "Buy a 'Coffee Grinder' and get a 'Simple Mug' for 50% off".
*   **And:** The "Coffee Grinder" is $100 and the "Simple Mug" is $15.
*   **When:** I add only the "Coffee Grinder" to the cart.
*   **Then:** The total should be $100.
*   **When:** I then add the "Simple Mug" to the cart.
*   **Then:** The price for the "Simple Mug" line item should be adjusted to $7.50.
*   **And:** The total cart value should be $107.50.

## 9. Advanced Cart & User Scenarios

### 9.1. Cart Subtotal Discount
*   **User Story:** As a customer, I want to receive a discount once my cart total reaches a certain amount.
*   **Scenario:** Verify that a cart subtotal-based discount is applied and removed correctly based on the subtotal threshold.
*   **Given:** An active campaign applies "10% off the entire cart if the subtotal is $100 or more".
*   **When:** My cart subtotal is $90.
*   **Then:** No discount is applied.
*   **When:** I add another item, bringing the cart subtotal to $110.
*   **Then:** A 10% discount ($11) should be applied to the cart total, making the final total $99.



### 9.3. Zero-Dollar Checkout (100% Discount)
*   **User Story:** As a customer, I want to be able to check out successfully if a discount makes my order total $0.
*   **Scenario:** Verify that a 100% discount leads to a successful zero-dollar checkout.
*   **Given:** A "Simple Mug" costs $15.
*   **And:** An active campaign provides a "100% off" discount on the "Simple Mug".
*   **When:** I add the "Simple Mug" to my cart.
*   **Then:** The cart total should be $0.
*   **When:** I proceed to checkout.
*   **Then:** The payment section should be bypassed or show "No payment required".
*   **And:** I should be able to complete the order successfully.
