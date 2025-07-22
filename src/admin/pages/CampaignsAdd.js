import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import MultiSelect from '../components/Multiselect';
import {
    TimePicker,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useToast } from '../store/toast/use-toast';
import { useEffect } from 'react';
import Required from '../components/Required';
import QuantityTiers from '../components/QuantityTiers';
import EBTiers from '../components/EBTiers';
import BogoTiers from '../components/BogoTiers';
import { useCbStore } from '../store/cbStore';

const CampaignsAdd = () => {
    const { woocommerce_currency_symbol } = useCbStore();
    const [campaignType, setCampaignType] = useState('bogo');
    const [selectionType, setSelectionType] = useState('entire_store');
    const [selections, setSelections] = useState([]);
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState('');
    const { addToast } = useToast();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [tags, setTags] = useState([]);
    const [quantityTiers, setQuantityTiers] = useState([]);
    const [ebTiers, setEBTiers] = useState([]);
    const [bogoTiers, setBogoTiers] = useState([]);


    const fetchCategories = async () => {


        try {
            const response = await apiFetch({ path: '/wc/v3/products/categories' });
            setCategories(response.map(item => ({
                label: item.name,
                value: item.id
            })));
        } catch (error) {
            console.error('Error fetching categories:', error);
            addToast({
                type: 'error',
                message: __('Something went wrong, Please reload the page.', 'wpab-cb'),
            });
        }
    }
    const fetchProducts = async () => {
        try {
            const response = await apiFetch({ path: '/wc/v3/products' });
            setProducts(response.map(item => ({
                label: item.name,
                value: item.id
            })));
        } catch (error) {
            console.error('Error fetching Products:', error);
            addToast({
                type: 'error',
                message: __('Something went wrong, Please reload the page.', 'wpab-cb'),
            });
        }
    }
    const fetchTags = async () => {
        try {
            const response = await apiFetch({ path: '/wc/v3/products/tags' });
            setTags(response.map(item => ({
                label: item.name,
                value: item.id
            })));
        } catch (error) {
            console.error('Error fetching Products:', error);
            addToast({
                type: 'error',
                message: __('Something went wrong, Please reload the page.', 'wpab-cb'),
            });
        }
    }


    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const handleSelectionTypeChange = (value) => {
        setSelectionType(value);
        setSelections([]);
        // if (value === 'product') {
        //     fetchProducts();
        // }
        if (value === 'tags') {
            fetchTags();
        }
    }

    const handleCampaignTypeChange = (value) => {
        setCampaignType(value);
        if (value === 'bogo') {
            handleSelectionTypeChange('product');
        }
    }



    return (
        <div className="cb-page">
            <div className="cb-page-header-container">
                <div className="cb-page-header-title">{__('Add Campaign', 'wpab-cb')}</div>
                <div className="cb-page-header-actions">
                    <button className="wpab-cb-btn wpab-cb-btn-primary ">
                        <Icon icon={check} fill="currentColor" />
                        {__('Save Campaign', 'wpab-cb')}
                    </button>
                </div>
            </div>
            <div className="cb-page-container">
                <div className="cb-form-input-con">
                    <label htmlFor="campaign-type">{__('SELECT DISCOUNT TYPE', 'wpab-cb')}   <Required /></label>
                    <select type="text" id="campaign-type" className="wpab-input w-100" value={campaignType} onChange={(e) => handleCampaignTypeChange(e.target.value)}>
                        <option value="sheduled">{__('Sheduled Discount', 'wpab-cb')}</option>
                        <option value="quantity">{__('Quantity Based Discount', 'wpab-cb')}</option>
                        <option value="earlybird">{__('EarlyBird Discount', 'wpab-cb')}</option>
                        <option value="bogo">{__('Buy X Get Y (BOGO) Discount', 'wpab-cb')}</option>
                    </select>
                </div>

                {campaignType !== 'bogo' && (
                    <div className="cb-form-input-con">
                        <label htmlFor="selection-type">{__('SELECT FOR USERS', 'wpab-cb')}  <Required /></label>
                        <select type="text" id="selection-type" className="wpab-input w-100" value={selectionType} onChange={(e) => handleSelectionTypeChange(e.target.value)}>
                            {campaignType !== 'bogo' && (<option value="entire_store">{__('Entire Store', 'wpab-cb')}</option>)}
                            {campaignType !== 'bogo' && (<option value="category">{__('By Product Category', 'wpab-cb')}</option>)}
                            <option value="product">{__('By Product', 'wpab-cb')}</option>
                            {campaignType !== 'bogo' && (<option value="tag">{__('By Tags', 'wpab-cb')}</option>)}


                        </select>

                        {selectionType !== 'entire_store' ?
                            <div style={{ background: '#ffffff' }}>
                                <MultiSelect
                                    label={
                                        selectionType === 'product' ? __('Select Products *', 'wpab-cb') : selectionType === 'tag' ? __('Select Tags *', 'wpab-cb') : selectionType === 'category' ? __('Select Categories *', 'wpab-cb') : ''
                                    }
                                    options={selectionType === 'product' ? products : selectionType === 'tag' ? tags : selectionType === 'category' ? categories : []}
                                    value={selections}
                                    onChange={setSelections}
                                />
                            </div>
                            : null
                        }
                    </div>
                )}

                {campaignType === 'bogo' && products?.length > 0 && (
                    <BogoTiers onTiersChange={setBogoTiers} initialTiers={bogoTiers} products={products} />
                )}


                {campaignType === 'quantity' && (
                    <QuantityTiers onTiersChange={setQuantityTiers} initialTiers={quantityTiers} />
                )}

                {campaignType === 'earlybird' && (
                    <EBTiers onTiersChange={setEBTiers} initialTiers={ebTiers} />
                )}

                {campaignType === 'sheduled' && (

                    <div className="cb-form-input-con">
                        <label htmlFor="discount-type">{__('How many you want to discount?', 'wpab-cb')}  <Required /></label>
                        <ToggleGroupControl
                            className="cb-toggle-group-control"
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            isBlock
                            value={discountType}
                            onChange={(value) => setDiscountType(value)}
                        >
                            <ToggleGroupControlOption
                                label={__('Percentage %', 'wpab-cb')}
                                value="percentage"
                            />
                            <ToggleGroupControlOption
                                label={__('Currency ', 'wpab-cb') + (woocommerce_currency_symbol || '$')}
                                value="currency"
                            />
                        </ToggleGroupControl>
                        <span className='wpab-input-help'>{__('If you want you will change mode', 'wpab-cb')}</span>

                        <div className='cb-input-with-suffix'>
                            <input value={discountValue} type="text" name='discount-value' inputMode='numeric' pattern="[0-9]*" className="wpab-input w-100 " placeholder="Enter Value" onChange={(e) => setDiscountValue(e.target.value)} />
                            <span className='cb-suffix'>{discountType === 'percentage' ? '%' : (woocommerce_currency_symbol || '$')}</span>
                        </div>
                    </div>
                )}
                <div className="cb-form-input-con">
                    <label htmlFor="start-time">{__('SELECT CAMPAIGN DURATION', 'wpab-cb')}  <Required /></label>
                    <div className='wpab-grid-2 cb-date-time-fix' style={{ gap: '16px' }}>
                        <div>
                            <span className='wpab-input-label' style={{ display: 'block', marginBottom: '10px' }}>{__('Start Time', 'wpab-cb')}</span>
                            <TimePicker id="start-time"
                                currentTime={startDate}
                                onChange={(date) => { setStartDate(date); }}
                            />
                        </div>
                        <div>
                            <span className='wpab-input-label' style={{ display: 'block', marginBottom: '10px' }}>{__('End Time', 'wpab-cb')}</span>
                            <TimePicker id="end-time"
                                // currentTime={startDate}
                                onChange={(date) => { setEndDate(date); }}
                            />
                        </div>

                    </div>


                </div>
                <div className='wpab-btn-bottom-con'>
                    <button className="wpab-cb-btn wpab-cb-btn-primary">
                        <Icon icon={check} fill="currentColor" />
                        {__('Save Changes', 'wpab-cb')}
                    </button>
                </div>

            </div>



        </div>
    );
};

export default CampaignsAdd;
