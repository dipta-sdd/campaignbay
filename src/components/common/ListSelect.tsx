import React from 'react';

export interface ListItem {
  label: string;
  value: string;
}

interface ListSelectProps {
  items: ListItem[];
  selectedValues: string[];
  onChange: (value: string) => void;
  className?: string;
  classNames?: {
    root?: string;
    item?: string;
    iconWrapper?: string;
    icon?: string;
    label?: string;
  };
}

export const ListSelect: React.FC<ListSelectProps> = ({ items, selectedValues, onChange, className = '', classNames }) => {
  return (
    <div className={`campaignbay-flex campaignbay-flex-col campaignbay-border campaignbay-border-default campaignbay-rounded-lg campaignbay-bg-white campaignbay-overflow-hidden ${className} ${classNames?.root || ''}`}>
      {items.map((item, index) => {
        const isSelected = selectedValues.includes(item.value);
        return (
          <div 
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`
              campaignbay-flex campaignbay-items-center campaignbay-gap-3 campaignbay-px-4 campaignbay-py-3 
              campaignbay-cursor-pointer campaignbay-transition-colors
              hover:campaignbay-bg-gray-50
              ${index !== items.length - 1 ? 'campaignbay-border-b campaignbay-border-gray-100' : ''}
              ${classNames?.item || ''}
            `}
          >
            <div className={`campaignbay-w-5 campaignbay-flex campaignbay-justify-center ${classNames?.iconWrapper || ''}`}>
                {isSelected && (
                    <svg className={`campaignbay-w-4 campaignbay-h-4 campaignbay-text-gray-900 ${classNames?.icon || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>
            <span className={`campaignbay-text-sm ${isSelected ? 'campaignbay-text-gray-900 campaignbay-font-medium' : 'campaignbay-text-gray-500'} ${classNames?.label || ''}`}>
                {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};