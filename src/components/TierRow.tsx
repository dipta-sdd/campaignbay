// FILE: TierRow.tsx
import React, { useState, FC } from 'react';
import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useCbStore } from '../store/cbStore';
import { QuantityTier, QuantityTierError } from '../types';
import { useGuideStep } from '../store/GuideContext';
import { TOUR_STEPS } from '../utils/tourSteps';
interface TierRowProps {
  tierData: QuantityTier;
  onUpdate: (updatedTier: QuantityTier) => void;
  onRemove: (id: number | string) => void;
  onAdd: (setError: React.Dispatch<React.SetStateAction<string>>) => void;
  isLast: boolean;
  isFirst: boolean;
  errors?: QuantityTierError;
}

const TierRow: FC<TierRowProps> = ({
  tierData,
  onUpdate,
  onRemove,
  onAdd,
  isLast,
  isFirst,
  errors,
}) => {
  const [error, setError] = useState<string>('');
  const { woocommerce_currency_symbol } = useCbStore();

  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================
  const qtyRangeInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.QTY_RANGE);
  const qtyValueInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.QTY_VALUE);
  const qtyToggleInputRef = useGuideStep<HTMLInputElement>(TOUR_STEPS.QTY_TOGGLE);
  const qtyAddBtnInputRef = useGuideStep<HTMLButtonElement>(TOUR_STEPS.QTY_ADD_BTN);
  //=================================================================================
  //============================     Guide    =======================================
  //=================================================================================  

  const handleChange = (name: 'max' | 'value', rawValue: string) => {
    // Keep value as a string for empty input, otherwise convert to number for calculations
    const value = rawValue === '' ? '' : Number(rawValue);
    const updatedTier = { ...tierData, [name]: value };

    if (name === 'max' && value !== '' && value < tierData.min) {
      setError('Max quantity must be greater than min quantity.');
    } else {
      setError('');
    }

    onUpdate(updatedTier);
  };

  const handleTypeToggle = (newType: 'percentage' | 'currency') => {
    if (newType !== 'percentage' && newType !== 'currency') return;
    onUpdate({ ...tierData, type: newType });
  };

  return (
    <div className={`cb-quantity-tier-row ${error ? 'has-error' : ''}`}>
      <div className="tier-inputs">
        <div className="wpab-grid-2">
          <div className="wpab-tier-input-grid-child">
            <span className="wpab-input-label">Buy from</span>
            <input
              type="number"
              name="min"
              value={tierData.min}
              readOnly
              className={`min-input wpab-input ${errors?.min ? 'wpab-input-error' : ''}`}
            />
            <span className="wpab-input-label">to</span>
            <input
              ref={isFirst ? qtyRangeInputRef : null}
              type="number"
              name="max"
              value={tierData.max}
              min={tierData.min}
              onChange={(e) => handleChange('max', e.target.value)}
              placeholder="e.g., 5"
              className={`max-input wpab-input ${errors?.max ? 'wpab-input-error' : ''}`}
            />
          </div>
          <div className="wpab-tier-input-grid-child">
            <span className="wpab-input-label">items, get</span>
            <input
              ref={isFirst ? qtyValueInputRef : null}
              type="number"
              name="value"
              min="0"
              value={tierData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="e.g., 10"
              className={`value-input wpab-input ${errors?.value ? 'wpab-input-error' : ''}`}
            />
            <div className="type-toggle">
              <ToggleGroupControl
                ref={isFirst ? qtyToggleInputRef : null}
                className="cb-toggle-group-control"
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                isBlock
                value={tierData.type}
                // @ts-ignore
                onChange={(value: 'percentage' | 'currency') => handleTypeToggle(value)}
              >
                <ToggleGroupControlOption label={'%'} value="percentage" />
                <ToggleGroupControlOption
                  label={woocommerce_currency_symbol || '$'}
                  value="currency"
                />
              </ToggleGroupControl>
            </div>
          </div>
        </div>
      </div>
      {(isFirst || isLast) && (
        <div className="tier-actions">
          {!isFirst && (
            <button
              type="button"
              className="remove-tier"
              onClick={() => onRemove(tierData.id)}
            >
              – Remove this tier
            </button>
          )}
          {isLast && (
            <button
              ref={isFirst ? qtyAddBtnInputRef : null}
              type="button"
              className="add-tier"
              onClick={() => onAdd(setError)}
            >
              + Add another tier
            </button>
          )}
        </div>
      )}
      {error && <p className="error-message m-0">{error}</p>}
    </div>
  );
};

export default TierRow;