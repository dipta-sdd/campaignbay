# CampaignBay End-to-End Test Plan

This document outlines the comprehensive test suite for the CampaignBay WooCommerce plugin. It is designed to cover every setting, campaign type, and user flow.

## 1. Universal Campaign Features
*These tests apply to ALL campaign types (Simple, Earlybird, Quantity, BOGO).*

### 1.1. Scheduling
- [ ] **Start/End Date**: Set a start and end date.
    - [ ] Verify inactive before start date.
    - [ ] Verify active during period.
    - [ ] Verify inactive after end date.
- [ ] **Timezone**: Verify dates respect WordPress timezone settings.

### 1.2. Usage Limits
- [ ] **Order Count**: Set usage limit to X orders.
    - [ ] Place X separate orders using the campaign. Verify discount applies.
    - [ ] Place (X+1)th order. Verify discount does NOT apply.
    - [ ] **Note**: Verify this counts *orders*, not the quantity of items within an order.

### 1.3. Targeting & Product Types
*For EACH campaign type below, verify targeting works for:*
- [ ] **Simple Products**: Direct targeting.
- [ ] **Variable Products**: Direct targeting (parent or specific variation).
- [ ] **Categories**: Target a category -> Verify applied to Simple & Variable products in that category.
- [ ] **Tags**: Target a tag -> Verify applied to Simple & Variable products with that tag.
- [ ] **Entire Store**: Verify applied to all eligible products.

### 1.4. Exclusions
- [ ] **Exclude Sale Items**:
    - [ ] Enable setting. Test on product with existing WC Sale Price. Verify campaign ignored.
    - [ ] Test on regular price product. Verify campaign applied.
- [ ] **Exclude Specific Products**: Target "Entire Store" but exclude Product A. Verify Product A gets no discount.

---

## 2. Simple Campaign Tests

### 2.1. Discount Logic
- [ ] **Percentage**: Verify % calculation.
- [ ] **Fixed Amount**: Verify fixed amount off (e.g., $10 off).

### 2.2. Settings & Formats
- [ ] **Display as Regular Price**: Enable. Verify price appears as flat regular price.
- [ ] **Message Format (Percentage)**:
    - [ ] Set global `product_message_format_percentage`. Verify on product page.
    - [ ] Override in campaign. Verify override.
- [ ] **Message Format (Fixed)**:
    - [ ] Set global `product_message_format_fixed`. Verify on product page.
    - [ ] Override in campaign. Verify override.

---

## 3. Earlybird Campaign Tests
*Technically shares logic with Scheduled/Simple, but test separately to ensure the "Earlybird" type works.*

- [ ] **Create Earlybird Campaign**: Set up with specific start/end dates.
- [ ] **Verify Discount**: Check discount applies during window.
- [ ] **Message Format**: Verify `message_format` setting specific to this campaign.

---

## 4. Quantity Discount (Tiered) Tests

### 4.1. Tier Logic
- [ ] **Starting Tier**: Verify first tier can start from quantity 1.
- [ ] **Multiple Tiers**: Setup ranges (e.g., 1-5, 6-10, 11+). Verify correct discount at each step.

### 4.2. Specific Settings
- [ ] **Enable Quantity Table**: Toggle on/off. Verify table visibility on product page.
- [ ] **Apply As**:
    - [ ] **Line Total**: Verify discount reduces the line item unit price.
    - [ ] **Fee**: Verify discount is added as a negative fee line in cart totals.
    - [ ] **Coupon**: Verify discount is added as a virtual coupon code.

### 4.3. Message Formats
- [ ] **Cart Quantity Message (Percentage)**:
    - [ ] Verify global `cart_quantity_message_format_percentage`.
    - [ ] Verify campaign override.
- [ ] **Cart Quantity Message (Fixed)**:
    - [ ] Verify global `cart_quantity_message_format_fixed`.
    - [ ] Verify campaign override.

---

## 5. BOGO (Buy X Get X) Tests

### 5.1. Logic
- [ ] **Buy X Get X**: Verify it applies to the **same product** only.
    - [ ] Buy Quantity defined by user.
    - [ ] Get Quantity defined by user.
    - [ ] Verify math: (e.g., Buy 2 Get 1). Add 3 items -> Pay for 2.

### 5.2. Specific Settings
- [ ] **Auto Add Free Product**:
    - [ ] Enable: Add "Buy" quantity. Verify "Get" quantity is automatically added/adjusted.
- [ ] **Apply As**:
    - [ ] **Line Total**: Discount applied to line item.
    - [ ] **Fee**: Discount applied as negative fee.
- [ ] **BOGO Cart Message Location**:
    - [ ] **Line Item Name**: Message appended to product name.
    - [ ] **Notice**: Message appears as a WC notice.
    - [ ] **Don't Show**: Message hidden.

### 5.3. Message Formats
- [ ] **Banner Message**: Verify `bogo_banner_message_format` (Global & Override).
- [ ] **Cart Message**: Verify `cart_bogo_message_format` (Global & Override).

---

## 6. Global Settings & Configuration Verification

### 6.1. General
- [ ] **Global Enable**: Toggle off -> Verify all discounts stop.
- [ ] **Calculate Discount From**:
    - [ ] `regular_price`: Base discount on regular price.
    - [ ] `sale_price`: Base discount on sale price (if applicable).

### 6.2. Display & Positioning
- [ ] **Bulk Table Position**: Change hook (e.g., `woocommerce_after_add_to_cart_form`). Verify position.
- [ ] **Discount Bar Position**: Change hook (e.g., `woocommerce_before_add_to_cart_form`). Verify position.

### 6.3. Product Settings
- [ ] **Priority Method**:
    - [ ] `apply_highest`: Create 10% and 20% campaigns. Verify 20% applies.
    - [ ] `apply_lowest`: Create 10% and 20% campaigns. Verify 10% applies.
    - [ ] `apply_first`: Create 2 campaigns. Verify the one created/loaded first applies.
- [ ] **Show Discount Table**: Toggle `true`/`false`.
- [ ] **Discount Table Options**:
    - [ ] **Show Header**: Toggle on/off.
    - [ ] **Title**: Toggle on/off. Check label change.
    - [ ] **Range**: Toggle on/off. Check label change.
    - [ ] **Discount**: Toggle on/off. Check label change. Check content (`price` vs `value`).

### 6.4. Cart Settings
- [ ] **WC Coupon Stacking**:
    - [ ] `true`: Apply WC Coupon + Campaign. Verify both apply.
    - [ ] `false`: Apply WC Coupon + Campaign. Verify restriction.
- [ ] **Campaign Stacking**:
    - [ ] `true`: Apply Simple + Quantity campaign. Verify both apply.
    - [ ] `false`: Apply Simple + Quantity campaign. Verify only one applies.

### 6.5. Performance & Debugging
- [ ] **Performance Caching**:
    - [ ] Enable `perf_enableCaching`. Browse site, add items. Verify no errors/crashes.
- [ ] **Debugging**:
    - [ ] Enable `debug_enableMode`. Perform actions. Check `WooCommerce -> Status -> Logs` (or plugin specific log) for debug entries.

### 6.6. Advanced
- [ ] **Delete All On Uninstall**:
    - [ ] Enable. Uninstall plugin. Verify settings/tables are deleted from DB.

---

## 7. End-to-End Flows
- [ ] **Guest Checkout**: Verify pricing persists through checkout.
- [ ] **Logged-in Checkout**: Verify pricing persists and order history is correct.
- [ ] **Order Admin**: Verify order line items and meta data ("CampaignBay Discount Breakdown") are correct in backend.
