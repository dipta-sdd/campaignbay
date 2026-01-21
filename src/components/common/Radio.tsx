import React from 'react';

interface RadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  classNames?: {
    root?: string;
    circle?: string;
    dot?: string;
    label?: string;
  };
}

export const Radio: React.FC<RadioProps> = ({ label, checked, onChange, disabled, classNames }) => {
  return (
    <label className={`campaignbay-flex campaignbay-items-center campaignbay-gap-3 campaignbay-cursor-pointer ${disabled ? 'campaignbay-opacity-50 campaignbay-cursor-not-allowed' : ''} ${classNames?.root || ''}`}>
      <div className={`
        campaignbay-relative campaignbay-flex campaignbay-items-center campaignbay-justify-center
        campaignbay-w-5 campaignbay-h-5 campaignbay-rounded-full campaignbay-border-2 campaignbay-transition-all campaignbay-duration-200
        ${checked ? 'campaignbay-border-primary campaignbay-bg-primary' : 'campaignbay-border-gray-300 campaignbay-bg-white hover:campaignbay-border-primary'}
        ${classNames?.circle || ''}
      `}>
        {/* Inner white dot for selected state */}
        <div 
            className={`
                campaignbay-w-2 campaignbay-h-2 campaignbay-bg-white campaignbay-rounded-full campaignbay-transform campaignbay-transition-transform campaignbay-duration-200
                ${checked ? 'campaignbay-scale-100' : 'campaignbay-scale-0'}
                ${classNames?.dot || ''}
            `} 
        />
        <input 
          type="radio" 
          className="campaignbay-hidden" 
          checked={checked} 
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <span className={`campaignbay-text-[15px] campaignbay-font-semibold ${checked ? 'campaignbay-text-gray-900' : 'campaignbay-text-gray-700'} ${classNames?.label || ''}`}>{label}</span>
    </label>
  );
};