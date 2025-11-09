```/**
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
