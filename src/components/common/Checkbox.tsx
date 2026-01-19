import React from 'react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled }) => {
  return (
    <label className={`campaignbay-flex campaignbay-items-center campaignbay-gap-3 campaignbay-cursor-pointer ${disabled ? 'campaignbay-opacity-50 campaignbay-cursor-not-allowed' : ''}`}>
      <div className={`
        campaignbay-flex campaignbay-items-center campaignbay-justify-center
        campaignbay-w-4 campaignbay-h-4 campaignbay-rounded campaignbay-border-[1px] campaignbay-transition-all campaignbay-duration-200
        ${checked ? 'campaignbay-border-primary campaignbay-bg-primary' : 'campaignbay-border-[#949494] campaignbay-bg-white hover:campaignbay-border-primary'}
      `}>
        <svg 
            className={`campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-white campaignbay-transform campaignbay-transition-transform campaignbay-duration-200 ${checked ? 'campaignbay-scale-100' : 'campaignbay-scale-0'}`} 
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
      {label && <span className="campaignbay-text-[15px] campaignbay-font-medium campaignbay-text-gray-700">{label}</span>}
    </label>
  );
};
