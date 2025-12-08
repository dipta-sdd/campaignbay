# CampaignBay 1.0.5: Smarter BOGO, Clearer Carts, and a Stronger Engine

We are thrilled to announce the release of **CampaignBay 1.0.5**! This update represents months of work refining the core of our discount engine. We've completely rebuilt some of the most critical parts of the plugin to make your discount campaigns more powerful, more flexible, and more reliable.

Whether you're running a simple percentage-off sale, complex tiered pricing for bulk orders, or creative Buy-One-Get-One promotions, this update ensures everything works seamlessly for both you and your customers.

## 🛍️ A Complete BOGO Overhaul

One of the biggest changes in version 1.0.5 is how we handle **Buy One, Get One (BOGO)** promotions. We've completely rebuilt this system from the ground up.

### What Changed?

In previous versions, when a customer qualified for a free product through a BOGO campaign, we would add it to their cart and then remove it during price calculations. While this worked, it sometimes caused confusion—customers would see items flash in and out of their cart, and the final pricing wasn't always crystal clear.

**Now, free products stay in the cart as separate, clearly marked items.** Here's what that means for you:

*   **Crystal Clear Cart Display:** Every free or discounted item appears as its own line in the cart. Your customers can see exactly what they're getting and why.
*   **Multiple BOGO Campaigns:** If a customer qualifies for free items from multiple campaigns (say, one from a "Buy 2 Get 1" deal and another from a seasonal promotion), each free item is listed separately. No confusion, no hidden discounts.
*   **Flexible Discounts:** While our free version focuses on 100% free products (Buy X, Get X free), our backend system now supports partial discounts too. This means if you upgrade to Pro or use third-party integrations, you can create offers like "Buy Product A, Get Product B at 50% off." The engine is ready!
*   **Custom Messages for Each Item:** You can now set unique success messages for different free products. Imagine showing "🎉 Free Gift Added!" for one item and "💰 50% Off Applied!" for another. Your checkout page will look professional and personalized.

### Why It Matters

This change makes your store feel more trustworthy. Customers love transparency. When they can clearly see what's free and why, they're more confident in completing their purchase. Plus, this new system is rock-solid—it works perfectly with other WooCommerce plugins and won't cause unexpected cart issues.

## 🎨 Beautiful, Bug-Free Discount Displays

We've also spent considerable time polishing how your discounts are displayed on both product pages and in the shopping cart.

### Fixed: Variable Product Discounts

If you sell products with multiple variations (like t-shirts in different sizes and colors), you know how tricky it can be to get discounts working correctly. We've squashed **all known bugs related to variable products**:
*   Discounts now apply correctly to specific variations.
*   Quantity-based discounts work seamlessly across all variations.
*   Pricing tables display accurate information no matter which variation is selected.

### Improved: Discount Messages

Those promotional banners and "next tier" messages are crucial for driving sales. We've fixed several formatting issues that were making them look broken or inconsistent:
*   **Product Page Banners:** "You Save 20%!" messages now display perfectly, using your custom formatting.
*   **Cart Prompts:** "Add 2 more to save 15%!" messages are crisp, clear, and positioned exactly where you want them.
*   **Quantity Tables:** Bulk pricing tables now render beautifully on all screen sizes and products.

Everything looks professional and encourages customers to buy more.

## � A Stronger, Smarter Backend

While you won't see this directly, we've made massive improvements to how CampaignBay stores and processes discount data.

### What We Did

We've standardized the entire data structure. Now, whether it's a Scheduled Sale, an Early Bird discount, a Quantity Tier, or a BOGO offer, all campaigns follow the same internal format. This might sound technical, but here's what it means for you:

*   **Faster Performance:** The plugin processes discounts more efficiently, meaning faster page loads even with complex campaigns.
*   **Better Compatibility:** CampaignBay now plays nicely with virtually any other WooCommerce plugin or theme.
*   **Future-Proof:** We've built a foundation that allows us (and third-party developers) to add new campaign types and features without breaking existing functionality.

### Fixed: Third-Party Plugin Issues

We've improved our hook system to ensure better compatibility with third-party plugins. Now, external plugins can seamlessly add their own promotions without interfering with your campaigns.

## 🎯 What This Means for Your Business

With version 1.0.5, you get:
*   **More Trust:** Transparent, clearly displayed discounts that customers can easily understand.
*   **More Flexibility:** The ability to run multiple campaigns simultaneously without conflicts.
*   **More Reliability:** Fewer bugs, better performance, and seamless compatibility with other tools.
*   **More Control:** Detailed message customization and precise discount targeting.

This update ensures that your promotional campaigns do exactly what you want them to do—drive sales, delight customers, and increase your average order value.

## 🚀 Update Today!

CampaignBay 1.0.5 is available now in your WordPress dashboard. Simply navigate to **Plugins → Updates** and click the update button. The process takes just a few seconds, and all your existing campaigns will continue working—now even better than before.

*Happy Selling!*  
*The CampaignBay Team*

---

## 📋 Changelog

### Version 1.0.5

**Added:**
*   Completely rebuilt BOGO engine with separate cart items for each free product
*   Support for cross-product BOGO promotions (Pro/integrations)
*   Support for partial discount free products (Pro/integrations)
*   Distinct custom messaging for individual free products
*   Standardized discount data structure across all campaign types
*   Enhanced hook system for third-party plugin compatibility

**Fixed:**
*   Message formatting bugs on variable product pages (discount banners, save messages)
*   Message formatting bugs in cart for variable products (quantity tier prompts, next-tier messages)
*   Quantity table display issues on variable products
*   Free product removal/addition flow issues causing cart display confusion

**Improved:**
*   Cart item calculation performance
*   Overall plugin stability and compatibility
*   Internal code structure for easier maintenance and future feature additions

### Version 1.0.4

**Fixed:**
*   Error at new activation on 1.0.3 version.

### Version 1.0.3

**Fixed:**
*   Minor bug fixes and stability improvements for the admin interface.

### Version 1.0.2

**Enhanced:**
*   Added an interactive Tour Guide to help new users navigate the "Add Campaign" interface.

### Version 1.0.1

**Enhanced:**
*   Updated the plugin display name to "CampaignBay - Automated Discount Campaigns & Flash Sales for WooCommerce" for better clarity and searchability in the WordPress repository.

**Refactored:**
*   Migrated the admin interface scripts from JavaScript to TypeScript for improved long-term stability, code quality, and maintainability.

### Version 1.0.0

*   Initial release of CampaignBay.

