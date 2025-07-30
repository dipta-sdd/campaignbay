import { __ } from "@wordpress/i18n";
import Required from "./Required";
import { useEffect, useState } from '@wordpress/element';
import EBTierRow from "./EBTierRow";

const EBTiers = ({ tiers, setTiers, errors }) => {


    const handleAddTier = (setError) => {
        const lastTier = tiers[tiers.length - 1];
        if (!lastTier.quantity) {
            setError(__('Please fill in the previous tier\'s quantity first.', 'campaignbay'));
            return;
        }
        if (!lastTier.value) {
            setError(__('Please fill in the previous tier\'s value first.', 'campaignbay'));
            return;
        }
        const newTier = {
            id: tiers.length,
            quantity: '',
            value: '',
            type: lastTier.type,
            total: parseInt(lastTier.total, 10) + parseInt(lastTier.quantity, 10)
        };
        setTiers([...tiers, newTier]);
    };

    const handleRemoveTier = (idToRemove) => {
        if (tiers.length <= 1) return;
        setTiers(tiers.filter(tier => tier.id !== idToRemove));
    };

    const handleTierUpdate = (updatedTier) => {
        const newTiers = tiers.map((tier, index) => {
            if (tier.id === updatedTier.id) {
                return updatedTier;
            }
            return tier;
        });
        const tmpTiers = calculateTotal(newTiers);
        setTiers(tmpTiers);
    };

    const calculateTotal = (tiers) => {
        let total = 0;
        return tiers.map((tier, index) => {

            if (index !== 0) {
                total = parseInt(total, 10) + (parseInt(tiers[index - 1].quantity, 10) || 0);
            }
            return {
                ...tier,
                total: total
            };
        });
    }


    return (
        <div className="cb-form-input-con">
            <label htmlFor="quantity-discount">{__('DISCOUNT TIERS FOR FIRST SALES', 'campaignbay')} <Required /></label>
            <span className='wpab-input-help'>{__('Define discount tiers based on the number of sales of the selected products', 'campaignbay')}</span>
            {tiers.map((tier, index) => (
                <EBTierRow
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


export default EBTiers; 