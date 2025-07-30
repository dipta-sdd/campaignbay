// src/components/TierRow.jsx
import { useState } from '@wordpress/element';
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCbStore } from '../store/cbStore';

const EBTierRow = ({ id, tierData, onUpdate, onRemove, onAdd, isLast, isFirst }) => {
    const [error, setError] = useState('');

    const { woocommerce_currency_symbol } = useCbStore();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedTier = { ...tierData, [name]: value };
        setError('');
        onUpdate(updatedTier);
    };

    const handleTypeToggle = (newType) => {
        onUpdate({ ...tierData, type: newType });
    };

    return (
        <div className={`cb-quantity-tier-row ${error ? 'has-error' : ''}`}>
            <div className='tier-inputs'>
                <div className='wpab-grid-2'>
                    <div className='wpab-tier-input-grid-child'>
                        <span className='wpab-input-label'>
                            {
                                isFirst ?
                                    __('For First', 'campaignbay') :
                                    __('For Next', 'campaignbay')
                            }

                        </span>
                        <input
                            type="number"
                            name="quantity"
                            value={tierData.quantity}
                            className="min-input wpab-input"
                            onChange={handleChange}
                            min="0"
                            placeholder="e.g., 10"
                        />
                        <span className='wpab-input-label'>
                            {__('Sales ', 'campaignbay')}

                            {/* {  tierData.quantity ?
                                '(' + (parseInt(tierData.total, 10) + parseInt(1)) + '-' + (parseInt(tierData.total, 10) + parseInt(tierData.quantity, 10)) + ')'
                                : null
                            }  */}

                            {'( ' + (parseInt(tierData.total, 10) + parseInt(1)) + ' - '}
                            {tierData.quantity ? (parseInt(tierData.total, 10) + parseInt(tierData.quantity, 10)) : ''}
                            {' ),'}
                        </span>
                    </div>
                    <div className='wpab-tier-input-grid-child'>

                        <span className='wpab-input-label'>{__('give ', 'campaignbay')}</span>
                        <input
                            type="number"
                            name="value"
                            value={tierData.value}
                            onChange={handleChange}
                            placeholder="e.g., 10"
                            className="value-input wpab-input"
                        />
                        <div className="type-toggle">
                            <ToggleGroupControl
                                className="cb-toggle-group-control"
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                isBlock
                                value={tierData.type}
                                onChange={(value) => handleTypeToggle(value)}
                            >
                                <ToggleGroupControlOption
                                    label={'%'}
                                    value="percentage"
                                />
                                <ToggleGroupControlOption
                                    label={woocommerce_currency_symbol || '$'}
                                    value="currency"
                                />
                            </ToggleGroupControl>
                        </div>
                    </div>
                </div>

            </div>

            {(isFirst || isLast) ?
                (<div className="tier-actions">
                    {!isFirst && (
                        <button type="button" className="remove-tier" onClick={() => onRemove(tierData.id)}>
                            – Remove this tier
                        </button>
                    )}
                    {isLast && (
                        <button type="button" className="add-tier" onClick={() => {
                            onAdd(setError);
                        }}>
                            + Add another tier
                        </button>
                    )}
                </div>) : null}
            {error && <p className="error-message m-0">{error}</p>}
        </div>
    );
};

export default EBTierRow;