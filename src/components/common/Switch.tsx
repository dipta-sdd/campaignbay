import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  classNames?: {
    root?: string;
    thumb?: string;
  };
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  disabled, 
  size = 'medium', 
  className = '', 
  classNames 
}) => {
  
  const sizeConfig = {
    small: {
      switch: 'campaignbay-h-4 campaignbay-w-7',
      thumb: 'campaignbay-h-3 campaignbay-w-3',
      translate: 'campaignbay-translate-x-3'
    },
    medium: {
      switch: 'campaignbay-h-6 campaignbay-w-11',
      thumb: 'campaignbay-h-5 campaignbay-w-5',
      translate: 'campaignbay-translate-x-5'
    },
    large: {
      switch: 'campaignbay-h-7 campaignbay-w-14',
      thumb: 'campaignbay-h-6 campaignbay-w-6',
      translate: 'campaignbay-translate-x-7'
    }
  };

  const currentSize = sizeConfig[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        campaignbay-group campaignbay-relative campaignbay-inline-flex campaignbay-shrink-0 campaignbay-cursor-pointer campaignbay-items-center campaignbay-rounded-full campaignbay-border-2 campaignbay-border-transparent campaignbay-transition-colors campaignbay-duration-200 campaignbay-ease-in-out focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-primary focus:campaignbay-ring-offset-2
        ${currentSize.switch}
        ${checked ? 'campaignbay-bg-green-500' : 'campaignbay-bg-black'}
        ${disabled ? 'campaignbay-opacity-50 campaignbay-cursor-not-allowed' : ''}
        ${className}
        ${classNames?.root || ''}
      `}
    >
      <span className="campaignbay-sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        className={`
          campaignbay-pointer-events-none campaignbay-inline-block campaignbay-transform campaignbay-rounded-full campaignbay-bg-white campaignbay-shadow campaignbay-ring-0 campaignbay-transition campaignbay-duration-200 campaignbay-ease-in-out
          ${currentSize.thumb}
          ${checked ? currentSize.translate : 'campaignbay-translate-x-0'}
          ${classNames?.thumb || ''}
        `}
      />
    </button>
  );
};
