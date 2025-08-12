// src/components/TierRow.jsx
import { useState } from '@wordpress/element';
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useCbStore } from '../store/cbStore';
const TierRow = ({ id, tierData, onUpdate, onRemove, onAdd, isLast, isFirst }) => {
    const [error, setError] = useState('');

    const { woocommerce_currency_symbol } = useCbStore();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Create a new object for the update
        const updatedTier = { ...tierData, [name]: value };

        // **Inline Validation Logic**
        if (name === 'max' && value && parseInt(value, 10) < tierData.min) {
            setError('Max quantity must be greater than min quantity.');
        } else {
            setError('');
        }

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
                        <span className='wpab-input-label'>Buy from</span>
                        <input
                            type="number"
                            name="min"
                            value={tierData.min}
                            readOnly // Min is non-editable to enforce connected tiers
                            className="min-input wpab-input"
                        />
                        <span className='wpab-input-label'>to</span>
                        <input
                            type="number"
                            name="max"
                            value={tierData.max}
                            min={tierData.min}
                            onChange={handleChange}
                            placeholder="e.g., 5"
                            className="max-input wpab-input"
                        />
                    </div>
                    <div className='wpab-tier-input-grid-child'>

                        <span className='wpab-input-label'>items, get</span>
                        <input
                            type="number"
                            name="value"
                            min="0"
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

export default TierRow;