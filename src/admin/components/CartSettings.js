import Checkbox from "./Checkbox";
import SettingCard from "./SettingCard";
import Select from "./Select";
import Input from "./Input";
import Placeholders from "./PlaceHolders";
import { __ } from "@wordpress/i18n";

const CartSettings = ({ cartSettings, setCartSettings, setEdited }) => {
  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title="Cart Page Display">
        <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2  campaignbay-gap-[10px] campaignbay-w-full">
          <Input
            className="w-100"
            label={__(
              "Cart Page Quantity Discount Message Format (Percentage)",
              "campaignbay"
            )}
            help={
              <Placeholders
                options={[
                  "remainging_quantity_for_next_offer",
                  "percentage_off",
                ]}
              />
            }
            value={cartSettings.cart_quantity_message_format_percentage}
            onChange={(value) => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_quantity_message_format_percentage: value,
              }));
            }}
          />
          <Input
            className="w-100"
            label={__(
              "Cart Page Quantity Discount Message Format (Fixed)",
              "campaignbay"
            )}
            help={
              <Placeholders
                options={["remainging_quantity_for_next_offer", "amount_off"]}
              />
            }
            value={cartSettings.cart_quantity_message_format_fixed}
            onChange={(value) => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_quantity_message_format_fixed: value,
              }));
            }}
          />
          <Input
            className="w-100"
            label={__("Cart Page BOGO Discount Message Format", "campaignbay")}
            help={<Placeholders options={["title"]} />}
            value={cartSettings.cart_bogo_message_format}
            onChange={(value) => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_bogo_message_format: value,
              }));
            }}
          />
        </div>
      </SettingCard>
      <SettingCard title="Cart Discount Options">
        <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2  campaignbay-gap-[10px] campaignbay-w-full">
          <Checkbox
            checked={cartSettings.cart_allowWcCouponStacking}
            onChange={() => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_allowWcCouponStacking: !prev.cart_allowWcCouponStacking,
              }));
            }}
            label="Allow Stacking with WooCommerce Coupons"
            help="If checked, your campaign discounts can be combined with standard WooCommerce coupons."
          />
          <Checkbox
            checked={cartSettings.cart_allowCampaignStacking}
            onChange={() => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_allowCampaignStacking: !prev.cart_allowCampaignStacking,
              }));
            }}
            label="Allow Stacking with Other Discount Campaigns"
            help="If checked, multiple active discount campaigns can apply to the same cart."
          />
        </div>
      </SettingCard>
    </div>
  );
};

export default CartSettings;
