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
  size?: 'small' | 'medium' | 'large';
  classNames?: {
    root?: string;
    item?: string;
    iconWrapper?: string;
    icon?: string;
    label?: string;
  };
}

export const ListSelect: React.FC<ListSelectProps> = ({ 
  items, 
  selectedValues, 
  onChange, 
  className = '', 
  size = 'medium',
  classNames 
}) => {

  const sizeStyles = {
    small: {
      item: 'campaignbay-px-3 campaignbay-py-2',
      label: 'campaignbay-text-xs',
      iconWrapper: 'campaignbay-w-4',
      icon: 'campaignbay-w-3 campaignbay-h-3'
    },
    medium: {
      item: 'campaignbay-px-4 campaignbay-py-3',
      label: 'campaignbay-text-sm',
      iconWrapper: 'campaignbay-w-5',
      icon: 'campaignbay-w-4 campaignbay-h-4'
    },
    large: {
      item: 'campaignbay-px-5 campaignbay-py-4',
      label: 'campaignbay-text-base',
      iconWrapper: 'campaignbay-w-6',
      icon: 'campaignbay-w-5 campaignbay-h-5'
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={`campaignbay-flex campaignbay-flex-col campaignbay-border campaignbay-border-default campaignbay-rounded-lg campaignbay-bg-white campaignbay-overflow-hidden ${className} ${classNames?.root || ''}`}>
      {items.map((item, index) => {
        const isSelected = selectedValues.includes(item.value);
        return (
          <div 
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`
              campaignbay-flex campaignbay-items-center campaignbay-gap-3 
              campaignbay-cursor-pointer campaignbay-transition-colors
              hover:campaignbay-bg-gray-50
              ${currentSize.item}
              ${index !== items.length - 1 ? 'campaignbay-border-b campaignbay-border-gray-100' : ''}
              ${classNames?.item || ''}
            `}
          >
            <div className={`campaignbay-flex campaignbay-justify-center ${currentSize.iconWrapper} ${classNames?.iconWrapper || ''}`}>
                {isSelected && (
                    <svg className={`campaignbay-text-gray-900 ${currentSize.icon} ${classNames?.icon || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>
            <span className={`${currentSize.label} ${isSelected ? 'campaignbay-text-gray-900 campaignbay-font-medium' : 'campaignbay-text-gray-500'} ${classNames?.label || ''}`}>
                {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
