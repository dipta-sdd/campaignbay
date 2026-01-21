import React from 'react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  classNames?: {
    root?: string;
    box?: string;
    icon?: string;
    label?: string;
  };
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled, classNames }) => {
  return (
    <label className={`campaignbay-flex campaignbay-items-center campaignbay-gap-3 campaignbay-cursor-pointer ${disabled ? 'campaignbay-opacity-50 campaignbay-cursor-not-allowed' : ''} ${classNames?.root || ''}`}>
      <div className={`
        campaignbay-flex campaignbay-items-center campaignbay-justify-center
        campaignbay-w-4 campaignbay-h-4 campaignbay-rounded campaignbay-border-2 campaignbay-transition-all campaignbay-duration-200
        ${checked ? 'campaignbay-border-primary campaignbay-bg-primary' : 'campaignbay-border-[#949494] campaignbay-bg-transparent hover:campaignbay-border-primary'}
        ${classNames?.box || ''}
      `}>
        <svg 
            className={`campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-white campaignbay-transform campaignbay-transition-transform campaignbay-duration-200 ${checked ? 'campaignbay-scale-100' : 'campaignbay-scale-0'} ${classNames?.icon || ''}`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <input 
          type="checkbox" 
          className="!campaignbay-hidden" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
      </div>
      {label && <span className={`campaignbay-text-[13px] campaignbay-font-[400] campaignbay-leading-[20px] campaignbay-text-[#1e1e1e] ${classNames?.label || ''}`}>{label}</span>}
    </label>
  );
};