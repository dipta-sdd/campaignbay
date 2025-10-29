import { FC, Dispatch, SetStateAction } from "react";
import { __ } from "@wordpress/i18n";
import Checkbox from "./Checkbox";
import SettingCard from "./SettingCard";
import Input from "./Input";
import Placeholders from "./PlaceHolders";

export interface CartSettingsType {
  cart_quantity_message_format_percentage: string;
  cart_quantity_message_format_fixed: string;
  cart_bogo_message_format: string;
  cart_allowWcCouponStacking: boolean;
  cart_allowCampaignStacking: boolean;
}

interface CartSettingsProps {
  cartSettings: CartSettingsType;
  setCartSettings: Dispatch<SetStateAction<CartSettingsType>>;
  setEdited: Dispatch<SetStateAction<boolean>>;
}

const CartSettings: FC<CartSettingsProps> = ({
  cartSettings,
  setCartSettings,
  setEdited,
}) => {
  return (
    <div className="wpab-cb-settings-tab">
      <SettingCard title={__("Cart Page Display", "campaignbay")}>
        <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2 campaignbay-gap-[10px] campaignbay-w-full">
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
            onChange={(value: string) => {
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
            onChange={(value: string) => {
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
            onChange={(value: string) => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_bogo_message_format: value,
              }));
            }}
          />
        </div>
      </SettingCard>
      <SettingCard title={__("Cart Discount Options", "campaignbay")}>
        <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2 campaignbay-gap-[10px] campaignbay-w-full">
          <Checkbox
            checked={cartSettings.cart_allowWcCouponStacking}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_allowWcCouponStacking: e.target.checked,
              }));
            }}
            label="Allow Stacking with WooCommerce Coupons"
            help="If checked, your campaign discounts can be combined with standard WooCommerce coupons."
          />
          <Checkbox
            checked={cartSettings.cart_allowCampaignStacking}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEdited(true);
              setCartSettings((prev) => ({
                ...prev,
                cart_allowCampaignStacking: e.target.checked,
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
