import Checkbox from "./Checkbox";
import SettingCard from "./SettingCard";
import Select from "./Select";
import Input from "./Input";

const CartSettings = ({ cartSettings, setCartSettings }) => {
    return (
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
                    checked={cartSettings.cart_allowCampaignStacking}
                    onChange={() => setCartSettings(prev => ({
                        ...prev,
                        cart_allowCampaignStacking: !prev.cart_allowCampaignStacking
                    }))}
                    label="Allow Stacking with Other Discount Campaigns"
                    help="If checked, multiple active discount campaigns can apply to the same cart."
                />

                {/* <Select
                    label="DISPLAY 'YOUSAVED' MESSAGE"
                    options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                    value={cartSettings.display_youSavedMessage}
                    onChange={value => setCartSettings(prev => ({
                        ...prev,
                        display_youSavedMessage: value
                    }))}
                /> */}

                <Input label={"'You Saved'Message Format"}
                    className="w-100"
                    value={cartSettings.cart_savedMessageFormat}
                    onChange={value => setCartSettings(prev => ({
                        ...prev,
                        cart_savedMessageFormat: value
                    }))}
                />
            </SettingCard>

            <SettingCard title="Cart Display & Promotion">
                <Checkbox
                    checked={cartSettings.cart_showNextDiscountBar}
                    onChange={() => setCartSettings(prev => ({
                        ...prev,
                        cart_showNextDiscountBar: !prev.cart_showNextDiscountBar
                    }))}
                    label="Show 'Next Discount' Progress bar in Cart"
                    help={"Displays a message like 'Add $X more to get Y% off"}
                />
                <Input label={"'Next Discount' Message Format"}
                    className="w-100"
                    value={cartSettings.cart_nextDiscountFormat}
                    onChange={value => setCartSettings(prev => ({
                        ...prev,
                        cart_nextDiscountFormat: value
                    }))}
                    help={"Use placeholder like {remaining_amount} and {discount_percentage}."}
                />
                <Checkbox
                    checked={cartSettings.cart_showDiscountBreakdown}
                    onChange={() => setCartSettings(prev => ({
                        ...prev,
                        cart_showDiscountBreakdown: !prev.cart_showDiscountBreakdown
                    }))}
                    label="Display Applied Discount Details ni CartSummary"
                    help={"Show a breakdown of which discounts were applied ni the cart totals area"}
                />
            </SettingCard>
        </div>
    );
};

export default CartSettings;
