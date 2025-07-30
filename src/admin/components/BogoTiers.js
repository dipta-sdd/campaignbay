import { __ } from "@wordpress/i18n";
import Required from "./Required";
import { useEffect, useState } from '@wordpress/element';
import BogoTierRow from "./BogoTierRow";

const BogoTiers = ({ tiers, setTiers, products }) => {



    const handleAddTier = (setError) => {
        const lastTier = tiers[tiers.length - 1];
        const newTier = {
            id: tiers.length,
            buy_product: null,
            get_product: null,
            buy_quantity: 1,
            get_quantity: 1,
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
        setTiers(newTiers);
    };

    return (
        <div className="cb-form-input-con">
            <label htmlFor="quantity-discount">{__('DISCOUNT TIERS FOR FIRST SALES', 'campaignbay')} <Required /></label>
            <span className='wpab-input-help'>{__('Define discount tiers based on the number of sales of the selected products', 'campaignbay')}</span>
            {tiers.map((tier, index) => (
                <BogoTierRow
                    key={tier.id}
                    products={products}
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


export default BogoTiers; 