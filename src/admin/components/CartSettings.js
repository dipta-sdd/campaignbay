import SettingCard from "./SettingCard";

const CartSettings = ({ cartSettings, setCartSettings, isSaving, handleSave }) => (
    <div className="wpab-cb-settings-tab">
        <SettingCard title="Cart Discount Options">
        <Checkbox
            checked={cartSettings.allowStackingWithCoupons}
            onChange={() => setCartSettings(prev => ({
                ...prev,
                allowStackingWithCoupons: !prev.allowStackingWithCoupons
            }))}
            label="Allow Stacking with WooCommerce Coupons"
            help="If checked, your campaign discounts can be combined with standard WooCommerce coupons."
        />
        <Checkbox
            checked={cartSettings.allowStackingWithOtherCampaigns}
            onChange={() => setCartSettings(prev => ({
                ...prev,
                allowStackingWithOtherCampaigns: !prev.allowStackingWithOtherCampaigns
            }))}
            label="Allow Stacking with Other Discount Campaigns"
            help="If checked, multiple active discount campaigns can apply to the same cart."
        />
        </SettingCard>
    </div>
);

export default CartSettings;
