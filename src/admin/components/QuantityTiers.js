import { __ } from "@wordpress/i18n";
import Required from "./Required";
import { useEffect, useState } from '@wordpress/element';
import TierRow from "./TierRow";

const QuantityTiers = ({ tiers, setTiers, errors }) => {


    const handleAddTier = (setError) => {
        const lastTier = tiers[tiers.length - 1];
        if (!lastTier.max) {
            setError(__('Please fill in the previous tier\'s maximum quantity first.', 'wpab-cb'));
            return;
        }
        if (lastTier.max <= lastTier.min) {
            setError(__('The maximum quantity must be greater than the minimum quantity.', 'wpab-cb'));
            return;
        }
        if (!lastTier.value) {
            setError(__('Please fill in the previous tier\'s value first.', 'wpab-cb'));
            return;
        }

        const newTier = {
            id: tiers.length,
            min: parseInt(lastTier.max, 10) + 1,
            max: '',
            value: '',
            type: lastTier.type
        };
        setTiers([...tiers, newTier]);
    };

    const handleRemoveTier = (idToRemove) => {
        if (tiers.length <= 1) return;
        setTiers(tiers.filter(tier => tier.id !== idToRemove));
    };

    const handleTierUpdate = (updatedTier) => {
        const newTiers = tiers.map(tier =>
            tier.id === updatedTier.id ? updatedTier : tier
        );
        if (updatedTier.id < tiers.length - 1 && updatedTier.max) {
            newTiers[updatedTier.id + 1].min = parseInt(updatedTier.max, 10) + 1;
        }
        setTiers(newTiers);
    };


    return (
        <div className="cb-form-input-con">
            <label htmlFor="quantity-discount">{__('DEFINE QUANTITY TIERS', 'wpab-cb')} <Required /></label>
            <span className='wpab-input-help'>{__('Define quantity tiers for the discount', 'wpab-cb')}</span>
            {tiers.map((tier, index) => (
                <TierRow
                    key={tier.id}
                    tierData={tier}
                    onUpdate={handleTierUpdate}
                    onRemove={handleRemoveTier}
                    onAdd={handleAddTier}
                    isLast={index === tiers.length - 1}
                    isFirst={index === 0}
                />
            ))}
        </div>
    );
}


export default QuantityTiers; 