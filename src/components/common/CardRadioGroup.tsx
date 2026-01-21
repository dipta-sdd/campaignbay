import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SelectionCard } from './SelectionCard';

export interface CardOption {
  value: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'buy_pro' | 'coming_soon';
}

interface CardRadioGroupProps {
  options: CardOption[];
  value: string;
  onChange: (value: string) => void;
  layout?: 'vertical' | 'horizontal' | 'responsive';
  className?: string;
  classNames?: {
    root?: string;
    card?: {
        root?: string;
        iconWrapper?: string;
        circle?: string;
        dot?: string;
        textWrapper?: string;
        title?: string;
        description?: string;
    };
  };
}

export const CardRadioGroup: React.FC<CardRadioGroupProps> = ({
  options,
  value,
  onChange,
  layout = 'responsive',
  className = '',
  classNames
}) => {
  let containerClass = '';
  
  switch (layout) {
    case 'vertical':
      containerClass = 'campaignbay-flex campaignbay-flex-col campaignbay-gap-4';
      break;
    case 'horizontal':
      containerClass = 'campaignbay-flex campaignbay-flex-row campaignbay-gap-4 campaignbay-overflow-x-auto campaignbay-pb-2'; // Added overflow handling for safe horizontal scrolling if needed
      break;
    case 'responsive':
    default:
      containerClass = 'campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2 campaignbay-gap-4';
      break;
  }

  // Tooltip State
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>, isPro: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (isPro) {
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate center position
      const centerX = rect.left + rect.width / 2;
      // Position above the card
      const topY = rect.top;

      setTooltipState({
        visible: true,
        top: topY,
        left: centerX,
        width: rect.width,
      });
    } else {
      setTooltipState(null);
    }
  };

  const handleCardMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
  };

  return (
    <>
      <div className={`${containerClass} ${className} ${classNames?.root || ''}`}>
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.title}
            description={option.description}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            icon={option.icon}
            disabled={option.disabled}
            variant={option.variant}
            onMouseEnter={(e) => handleCardMouseEnter(e, option.variant === 'buy_pro')}
            onMouseLeave={handleCardMouseLeave}
            classNames={classNames?.card}
          />
        ))}
      </div>

      {/* Tooltip Portal */}
      {tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="campaignbay-fixed campaignbay-z-[50001] campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-gap-1.5 campaignbay-bg-gray-900 campaignbay-text-white campaignbay-text-xs campaignbay-p-2 campaignbay-min-w-[140px] campaignbay-rounded-md campaignbay-shadow-lg"
            style={{
              top: tooltipState.top - 10, // Slight offset upwards from the card top
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="campaignbay-font-medium campaignbay-whitespace-nowrap">
              Upgrade to unlock
            </span>
            <a
              href="#"
              target="_blank"
              onClick={(e) => e.preventDefault()}
              className="campaignbay-w-full campaignbay-bg-[#f02a74] hover:!campaignbay-bg-[#e71161] campaignbay-text-white hover:!campaignbay-text-white campaignbay-font-bold campaignbay-py-1.5 campaignbay-px-3 campaignbay-transition-colors focus:campaignbay-outline-none focus:campaignbay-ring-0 campaignbay-cursor-pointer campaignbay-text-center campaignbay-rounded"
            >
              Buy Pro
            </a>
            {/* Tooltip Arrow */}
            <div className="campaignbay-absolute campaignbay-top-full campaignbay-left-1/2 -campaignbay-translate-x-1/2 campaignbay-border-4 campaignbay-border-transparent campaignbay-border-t-gray-900"></div>
          </div>,
          document.body
        )}
    </>
  );
};
