import Checkbox from "./Checkbox";
import SettingCard from "./SettingCard";
import Select from "./Select";
import Input from "./Input";

const CartSettings = ({ cartSettings, setCartSettings }) => {
  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title="Cart Discount Options">
        <Checkbox
          checked={cartSettings.cart_allowWcCouponStacking}
          onChange={() =>
            setCartSettings((prev) => ({
              ...prev,
              cart_allowWcCouponStacking: !prev.cart_allowWcCouponStacking,
            }))
          }
          label="Allow Stacking with WooCommerce Coupons"
          help="If checked, your campaign discounts can be combined with standard WooCommerce coupons."
        />
        <Checkbox
          checked={cartSettings.cart_allowCampaignStacking}
          onChange={() =>
            setCartSettings((prev) => ({
              ...prev,
              cart_allowCampaignStacking: !prev.cart_allowCampaignStacking,
            }))
          }
          label="Allow Stacking with Other Discount Campaigns"
          help="If checked, multiple active discount campaigns can apply to the same cart."
        />
      </SettingCard>
    </div>
  );
};

export default CartSettings;
