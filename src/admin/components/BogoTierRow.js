// src/components/TierRow.jsx
import { useState } from '@wordpress/element';

import { __ } from '@wordpress/i18n';
import SearchSelect from './SearchSelect';

const BogoTierRow = ({ id, tierData, onUpdate, onRemove, onAdd, isLast, isFirst, products }) => {
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedTier = { ...tierData, [name]: value };
        setError('');
        onUpdate(updatedTier);
    };

    const handleBuyChange = (value) => {
        const updatedTier = { ...tierData, buy_product: value };
        setError('');
        onUpdate(updatedTier);
    };

    const handleGetChange = (value) => {
        const updatedTier = { ...tierData, get_product: value };
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
                            {__('Buy', 'wpab-cb')}
                        </span>
                        <SearchSelect
                            className='wpab-bogo-select'
                            options={products}
                            value={tierData.buy_product}
                            onChange={(value) => handleBuyChange(value)}
                        />
                        <input
                            type="number"
                            name="buy_quantity"
                            value={tierData.buy_quantity}
                            className="min-input wpab-input wpab-bogo-input"
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                    <div className='wpab-tier-input-grid-child'>

                        <span className='wpab-input-label'>{__('Get ', 'wpab-cb')}</span>
                        <SearchSelect
                            className='wpab-bogo-select'
                            options={products}
                            value={tierData.get_product}
                            onChange={(value) => handleGetChange(value)}
                        />
                        <input
                            type="number"
                            name="get_quantity"
                            value={tierData.get_quantity}
                            onChange={handleChange}
                            placeholder="e.g., 10"
                            className="value-input wpab-input wpab-bogo-input"
                        />
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

export default BogoTierRow;