import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  classNames?: {
    root?: string;
    label?: string;
    input?: string;
    error?: string;
  };
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  size = 'medium',
  className = '', 
  classNames, 
  ...props 
}) => {
  const sizeClasses = {
    small: 'campaignbay-px-3 campaignbay-py-2 campaignbay-text-xs',
    medium: 'campaignbay-px-4 campaignbay-py-3 campaignbay-text-sm',
    large: 'campaignbay-px-5 campaignbay-py-4 campaignbay-text-base',
  };

  return (
    <div className={`campaignbay-w-full ${classNames?.root || ''}`}>
      {label && (
        <label className={`campaignbay-block campaignbay-text-sm campaignbay-font-bold campaignbay-text-gray-900 campaignbay-mb-2 ${classNames?.label || ''}`}>
          {label}
        </label>
      )}
      <input
        className={`
          campaignbay-w-full 
          campaignbay-bg-white campaignbay-border campaignbay-rounded-lg
          campaignbay-text-gray-900 campaignbay-placeholder-gray-400
          focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-primary focus:campaignbay-border-transparent
          campaignbay-transition-all campaignbay-duration-200
          ${sizeClasses[size]}
          ${error ? 'campaignbay-border-danger focus:campaignbay-ring-danger' : 'campaignbay-border-gray-300'}
          ${props.disabled ? 'campaignbay-bg-gray-50 campaignbay-cursor-not-allowed' : ''}
          ${className}
          ${classNames?.input || ''}
        `}
        {...props}
      />
      {error && (
        <p className={`campaignbay-mt-1 campaignbay-text-xs campaignbay-text-danger ${classNames?.error || ''}`}>{error}</p>
      )}
    </div>
  );
};