import SettingCard from "./SettingCard";
import Checkbox from './Checkbox';
import { __ } from '@wordpress/i18n';
import { Save } from 'lucide-react';
import Select from './Select';
import Input from './Input';


const ProductSettings = ({ productSettings, setProductSettings, isSaving, handleSave }) => {




    return (
        <div className="wpab-cb-settings-tab">
            <SettingCard title={__('Product Page Display', 'wpab-cb')}>

                <Checkbox checked={productSettings.product_showDiscountedPrice}
                    onChange={() => setProductSettings((prev) => ({
                        ...prev,
                        product_showDiscountedPrice: !prev.product_showDiscountedPrice
                    }))}
                    label={__('Display Discounted Price', 'wpab-cb')}
                    help={__("Display the discounted price with the original price crossed out.", 'wpab-cb')}
                />
                <Input
                    className='w-100'
                    label={<span className="wpab-input-label">{__('Product Page Discount Message Format', 'wpab-cb')}</span>}
                    help={__("Use Placeholder like {percentage_off}, {ampount_of} .", 'wpab-cb')}
                    value={productSettings.product_messageFormat}
                    onChange={(value) => setProductSettings((prev) => ({
                        ...prev,
                        product_messageFormat: value
                    }))}
                />

                <Checkbox checked={productSettings.product_enableQuantityTable}
                    onChange={() => setProductSettings((prev) => ({
                        ...prev,
                        product_enableQuantityTable: !prev.product_enableQuantityTable
                    }))}
                    label={__('Enable Quantity Discounts Table on Product Page', 'wpab-cb')}
                    help={__("Show a table outlining tiered quantity based discounts", 'wpab-cb')}
                />
            </SettingCard>

            <SettingCard title={__('Product Exclusion & Prioritization', 'wpab-cb')}>

                <Checkbox checked={productSettings.product_excludeSaleItems}
                    onChange={() => setProductSettings((prev) => ({
                        ...prev,
                        product_excludeSaleItems: !prev.product_excludeSaleItems
                    }))}
                    label={__('Automatically Exclude Sale Items from Campaigns', 'wpab-cb')}
                    help={__("Prevent double-discounting on products already set as 'Sale' in WooCommerce", 'wpab-cb')}
                />
                <Select
                    label={<span className="wpab-input-label">{__('Product Page Discount Message Format', 'wpab-cb')}</span>}
                    help={__("Defines how multiple product-level discounts are applied.", 'wpab-cb')}
                    options={[
                        { label: __('Apply Highest Discount', 'wpab-cb'), value: 'apply_highest' },
                        { label: __('Apply Lowest Discount', 'wpab-cb'), value: 'apply_lowest' }]
                    }
                    value={productSettings.product_priorityMethod}
                    onChange={(value) => setProductSettings((prev) => ({
                        ...prev,
                        product_priorityMethod: value
                    }))}
                />

            </SettingCard>

            <div className='wpab-button-con-card'>
                <button className='isLoading' disabled={isSaving} onClick={() => handleSave({ ...productSettings })}>
                    <Save className="icon" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}

export default ProductSettings;
