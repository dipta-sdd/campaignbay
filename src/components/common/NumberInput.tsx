import React, { useCallback, useState, useEffect } from "react";
import { borderClasses, errorWithInClasses, hoverWithInClasses, transitionClasses } from "./classes";

interface NumberInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  classNames?: {
    wrapper?: string;
    root?: string;
    label?: string;
    input?: string;
    buttonContainer?: string;
    incrementButton?: string;
    decrementButton?: string;
    error?: string;
  };
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label,
  error,
  className = "",
  disabled = false,
  placeholder = "0",
  classNames,
}) => {
  // Local state to handle string input (allows empty string, trailing decimals, etc.)
  const [localValue, setLocalValue] = useState<string | number>(value ?? "");

  // Sync local state when prop value changes externally
  useEffect(() => {
    setLocalValue((prev) => {
      if (value === null || value === undefined) {
        return "";
      }
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
      const currentValue = value === null || value === undefined ? 0 : value;
      let newValue = Number(currentValue) + Number(step);

      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;

      onChange(newValue);
    }
  }, [value, step, max, min, onChange, disabled]);

  const handleDecrement = useCallback(() => {
    if (!disabled) {
      const currentValue = value === null || value === undefined ? 0 : value;
      let newValue = Number(currentValue) - Number(step);

      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;

      onChange(newValue);
    }
  }, [value, step, min, max, onChange, disabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);

    if (inputValue === "") {
      onChange(null);
      return;
    }

    if (inputValue === "-") {
      // We allow the input to be just a minus sign locally
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
    // On blur, reset to the prop value if the local input is invalid.
    // If local is empty, ensure prop value is respected (which might be null).
    if (localValue === "" || localValue === "-") {
      if (value !== null && value !== undefined) {
        setLocalValue(value);
      } else {
        setLocalValue("");
      }
      return;
    }

    const parsed = parseFloat(localValue.toString());

    if (isNaN(parsed)) {
      // Should not happen given regex checks usually, but safety fallback
      setLocalValue(value ?? "");
      return;
    }

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
    <div className={`campaignbay-w-full ${classNames?.wrapper || ""}`}>
      {label && (
        <label
          className={`campaignbay-block campaignbay-text-sm campaignbay-font-bold campaignbay-text-gray-900 campaignbay-mb-2 ${
            classNames?.label || ""
          }`}
        >
          {label}
        </label>
      )}

      <div
        className={`
          campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-overflow-hidden
          campaignbay-rounded-[8px] campaignbay-bg-white campaignbay-min-w-min
          ${borderClasses}
          ${transitionClasses}
          ${
            error
              ? errorWithInClasses
              : hoverWithInClasses
          }
          ${
            disabled
              ? "campaignbay-opacity-50 campaignbay-cursor-not-allowed campaignbay-bg-gray-50"
              : ""
          }
          ${className}
          ${classNames?.root || ""}
        `}
      >
        <input
          type="number"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            !campaignbay-border-none !campaignbay-outline-none focus:!campaignbay-outline-none focus:!campaignbay-border-none focus:!campaignbay-shadow-none
            campaignbay-px-[12px] campaignbay-py-[9px] campaignbay-text-[13px] campaignbay-leading-[20px] 
            campaignbay-text-[#1e1e1e] campaignbay-font-[400] 
            campaignbay-min-w-[60px]
            campaignbay-w-full campaignbay-bg-transparent campaignbay-border-none campaignbay-outline-none campaignbay-placeholder-gray-400
            hide-spin-button
            ${disabled ? "campaignbay-cursor-not-allowed" : ""}
            ${classNames?.input || ""}
          `}
          placeholder={placeholder}
        />

        <div
          className={`campaignbay-flex campaignbay-items-center campaignbay-px-2 !campaignbay-pl-0.5 campaignbay-space-x-1 campaignbay-select-none ${
            classNames?.buttonContainer || ""
          }`}
        >
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || (value !== null && value !== undefined && value >= max)}
            className={`
              campaignbay-p-2 !campaignbay-pr-0.5 campaignbay-text-gray-500 campaignbay-transition-colors campaignbay-duration-150
              hover:campaignbay-text-gray-900 focus:campaignbay-outline-none active:campaignbay-scale-95
              disabled:campaignbay-opacity-30 disabled:hover:campaignbay-text-gray-500
              ${classNames?.incrementButton || ""}
            `}
            aria-label="Increase value"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || (value !== null && value !== undefined && value <= min)}
            className={`
              campaignbay-p-2 campaignbay-text-gray-500 campaignbay-transition-colors campaignbay-duration-150
              hover:campaignbay-text-gray-900 focus:campaignbay-outline-none active:campaignbay-scale-95
              disabled:campaignbay-opacity-30 disabled:hover:campaignbay-text-gray-500
              ${classNames?.decrementButton || ""}
            `}
            aria-label="Decrease value"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <span
          className={`campaignbay-mt-1 campaignbay-text-xs campaignbay-text-red-500 ${
            classNames?.error || ""
          }`}
        >
          {error}
        </span>
      )}
    </div>
  );
};
