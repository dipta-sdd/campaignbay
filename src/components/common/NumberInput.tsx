import React, { useCallback, useState, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  classNames?: {
    root?: string;
    input?: string;
    buttonContainer?: string;
    incrementButton?: string;
    decrementButton?: string;
  };
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  className = '',
  disabled = false,
  classNames,
}) => {
  // Local state to handle string input (allows empty string, trailing decimals, etc.)
  const [localValue, setLocalValue] = useState<string | number>(value);

  // Sync local state when prop value changes externally
  useEffect(() => {
    setLocalValue(prev => {
        // If the current local value numerically matches the new prop value,
        // keep the local string to preserve cursor position and formatting (e.g. "1.0" vs 1).
        const parsed = parseFloat(prev.toString());
        if (!isNaN(parsed) && parsed === value) {
            return prev;
        }
        return value;
    });
  }, [value]);

  const handleIncrement = useCallback(() => {
    if (!disabled) {
        const newValue = value + step;
        if (newValue <= max) {
            onChange(newValue);
        } else {
            onChange(max);
        }
    }
  }, [value, step, max, onChange, disabled]);

  const handleDecrement = useCallback(() => {
    if (!disabled) {
        const newValue = value - step;
        if (newValue >= min) {
            onChange(newValue);
        } else {
            onChange(min);
        }
    }
  }, [value, step, min, onChange, disabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);

    if (inputValue === '' || inputValue === '-') {
        // We allow the input to be empty or just a minus sign locally
        return;
    }

    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue)) {
      if (newValue <= max && newValue >= min) {
        onChange(newValue);
      }
    }
  };

  const handleBlur = () => {
      // On blur, reset to the prop value if the local input is empty or invalid.
      if (localValue === '' || localValue === '-' || isNaN(parseFloat(localValue.toString()))) {
          setLocalValue(value);
          return;
      }

      const parsed = parseFloat(localValue.toString());
      let finalValue = parsed;

      // Clamp value on blur if it exceeds bounds
      if (parsed > max) {
          finalValue = max;
      } else if (parsed < min) {
          finalValue = min;
      }

      setLocalValue(finalValue);
      
      // If the value changed due to clamping or was not synced yet (because it was out of bounds during typing), update parent
      if (finalValue !== value) {
           onChange(finalValue);
      }
  };

  return (
    <div
      className={`
        campaignbay-flex campaignbay-items-center campaignbay-justify-between
        campaignbay-border campaignbay-border-gray-300 campaignbay-rounded-lg campaignbay-bg-white
        campaignbay-transition-all campaignbay-duration-200 campaignbay-ease-in-out
        focus-within:campaignbay-border-blue-500 focus-within:campaignbay-ring-1 focus-within:campaignbay-ring-blue-500
        ${disabled ? 'campaignbay-opacity-50 campaignbay-cursor-not-allowed campaignbay-bg-gray-50' : 'hover:campaignbay-border-gray-400'}
        ${className}
        ${classNames?.root || ''}
      `}
    >
      <input
        type="number"
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`
          campaignbay-w-full campaignbay-px-4 campaignbay-py-3 campaignbay-bg-transparent campaignbay-border-none campaignbay-outline-none 
          campaignbay-text-gray-800 campaignbay-text-lg campaignbay-font-medium campaignbay-placeholder-gray-400
          ${disabled ? 'campaignbay-cursor-not-allowed' : ''}
          ${classNames?.input || ''}
        `}
        placeholder="0"
      />
      
      <div className={`campaignbay-flex campaignbay-items-center campaignbay-px-2 campaignbay-space-x-1 campaignbay-select-none ${classNames?.buttonContainer || ''}`}>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={`
            campaignbay-p-2 campaignbay-text-gray-500 campaignbay-transition-colors campaignbay-duration-150
            hover:campaignbay-text-gray-900 focus:campaignbay-outline-none active:campaignbay-scale-95
            disabled:campaignbay-opacity-30 disabled:hover:campaignbay-text-gray-500
            ${classNames?.incrementButton || ''}
          `}
          aria-label="Increase value"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={`
            campaignbay-p-2 campaignbay-text-gray-500 campaignbay-transition-colors campaignbay-duration-150
            hover:campaignbay-text-gray-900 focus:campaignbay-outline-none active:campaignbay-scale-95
            disabled:campaignbay-opacity-30 disabled:hover:campaignbay-text-gray-500
            ${classNames?.decrementButton || ''}
          `}
          aria-label="Decrease value"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
