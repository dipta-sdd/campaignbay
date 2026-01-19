import React, { useState, useRef, useEffect } from 'react';

export interface TogglerOption {
  label: React.ReactNode;
  value: string | number;
}

interface TogglerProps {
  options: TogglerOption[];
  value: string | number;
  onChange: (value: any) => void;
  className?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  classNames?: {
    root?: string;
    pill?: string;
    button?: string;
  };
}

export const Toggler: React.FC<TogglerProps> = ({
  options,
  value,
  onChange,
  className = '',
  fullWidth = false,
  size = 'medium',
  disabled = false,
  classNames = {},
}) => {
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Size configuration
  const sizeClasses = {
    small: 'campaignbay-px-[16px] campaignbay-py-[4px] campaignbay-text-small',
    medium: 'campaignbay-px-[24px] campaignbay-py-[8px] campaignbay-text-default',
    large: 'campaignbay-px-[32px] campaignbay-py-[12px] campaignbay-text-[15px]',
  };

  useEffect(() => {
    // Find the currently selected element
    const activeIndex = options.findIndex((opt) => opt.value === value);
    const activeEl = itemsRef.current[activeIndex];

    if (activeEl) {
      // Update pill position and width based on the active element's dimensions
      setPillStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [value, options, size]); // Recalculate when value, options, or size changes

  return (
    <div
      className={`
        campaignbay-relative campaignbay-inline-flex campaignbay-items-center
        campaignbay-bg-white campaignbay-border campaignbay-border-default campaignbay-rounded-lg
        campaignbay-p-[4px] campaignbay-select-none
        ${fullWidth ? 'campaignbay-flex campaignbay-w-full' : ''}
        ${disabled ? 'campaignbay-opacity-50 campaignbay-cursor-not-allowed campaignbay-pointer-events-none' : ''}
        ${className}
        ${classNames.root || ''}
      `}
      role="group"
      aria-disabled={disabled}
    >
      {/* Sliding Background Pill */}
      <div
        className={`
            campaignbay-absolute campaignbay-top-[4px] campaignbay-bottom-[4px]
            campaignbay-bg-primary campaignbay-rounded-[6px] campaignbay-shadow-sm
            campaignbay-transition-all campaignbay-duration-300 campaignbay-ease-[cubic-bezier(0.4,0,0.2,1)]
            campaignbay-pointer-events-none
            ${classNames.pill || ''}
        `}
        style={{
          left: pillStyle?.left ?? 0,
          width: pillStyle?.width ?? 0,
          opacity: pillStyle ? 1 : 0, // Prevent initial flash at wrong position
        }}
      />

      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            ref={(el) => { itemsRef.current[index] = el; }}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(option.value)}
            className={`
              campaignbay-relative campaignbay-z-10 campaignbay-flex-1
              campaignbay-font-medium campaignbay-rounded-[6px]
              campaignbay-transition-colors campaignbay-duration-300
              focus:campaignbay-outline-none focus-visible:campaignbay-ring-2 focus-visible:campaignbay-ring-primary/20
              ${sizeClasses[size]}
              ${isSelected ? 'campaignbay-text-white' : 'campaignbay-text-secondary hover:campaignbay-text-gray-700'}
              ${classNames.button || ''}
            `}
            aria-pressed={isSelected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
