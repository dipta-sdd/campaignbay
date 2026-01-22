import React from 'react';

// Icons
const LockKeyhole = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="16" r="1"/>
    <rect x="3" y="10" width="18" height="12" rx="2"/>
    <path d="M7 10V7a5 5 0 0 1 10 0v3"/>
  </svg>
);

const Hourglass = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 22h14"/>
    <path d="M5 2h14"/>
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
  </svg>
);

interface SelectionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'buy_pro' | 'coming_soon';
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  classNames?: {
    root?: string;
    iconWrapper?: string;
    circle?: string;
    dot?: string;
    textWrapper?: string;
    title?: string;
    description?: string;
  };
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
    title, 
    description, 
    selected, 
    onClick, 
    icon, 
    disabled,
    variant,
    onMouseEnter,
    onMouseLeave,
    classNames 
}) => {
  const isPro = variant === 'buy_pro';
  const isComingSoon = variant === 'coming_soon';
  const isDisabled = disabled || isPro || isComingSoon;

  return (
    <div 
      onClick={() => !isDisabled && onClick()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        campaignbay-relative campaignbay-p-[20px] campaignbay-rounded-[8px] campaignbay-transition-all campaignbay-duration-200
        campaignbay-flex campaignbay-items-start campaignbay-gap-[10px]
        ${isDisabled 
            ? 'campaignbay-bg-gray-50 campaignbay-border campaignbay-border-gray-200 campaignbay-cursor-not-allowed' 
            : 'campaignbay-cursor-pointer'
        }
        ${!isDisabled && selected 
          ? 'campaignbay-bg-primary campaignbay-border campaignbay-border-primary campaignbay-shadow-sm campaignbay-shadow-primary/20' 
          : !isDisabled 
            ? 'campaignbay-bg-white campaignbay-border campaignbay-border-gray-100 hover:campaignbay-border-gray-300'
            : ''
        }
        ${classNames?.root || ''}
      `}
    >
        {/* Badges */}
        {isPro && (
            <div className="campaignbay-absolute campaignbay-top-3 campaignbay-right-3" title="Upgrade to Pro">
                <LockKeyhole className="campaignbay-w-5 campaignbay-h-5 campaignbay-text-[#f02a74]" />
            </div>
        )}
        {isComingSoon && (
            <div className="campaignbay-absolute campaignbay-top-3 campaignbay-right-3">
                <span className="campaignbay-bg-pink-100 campaignbay-text-pink-600 campaignbay-px-2 campaignbay-py-0.5 campaignbay-rounded-full campaignbay-text-[10px] campaignbay-font-bold campaignbay-uppercase campaignbay-flex campaignbay-items-center campaignbay-gap-1">
                    <Hourglass className="campaignbay-w-3 campaignbay-h-3" />
                    Soon
                </span>
            </div>
        )}

      <div className={`campaignbay-mt-1 ${classNames?.iconWrapper || ''}`}>
        <div className={`
            campaignbay-w-5 campaignbay-h-5 campaignbay-rounded-full campaignbay-border-2 campaignbay-flex campaignbay-items-center campaignbay-justify-center
            ${isDisabled ? 'campaignbay-border-gray-300 campaignbay-bg-gray-100' : ''}
            ${!isDisabled && selected ? 'campaignbay-border-white' : !isDisabled ? 'campaignbay-border-gray-300' : ''}
            ${classNames?.circle || ''}
        `}>
            {!isDisabled && selected && <div className={`campaignbay-w-2.5 campaignbay-h-2.5 campaignbay-bg-white campaignbay-rounded-full ${classNames?.dot || ''}`} />}
        </div>
      </div>
      <div className={classNames?.textWrapper || ''}>
        <h3 className={`campaignbay-text-[15px] campaignbay-leading-[24px] campaignbay-font-[700] campaignbay-mb-1 ${!isDisabled && selected ? 'campaignbay-text-white' : 'campaignbay-text-gray-900'} ${isDisabled ? '!campaignbay-text-gray-400' : ''} ${classNames?.title || ''}`}>
          {title}
        </h3>
        <p className={`campaignbay-text-[13px] campaignbay-leading-[20px] ${!isDisabled && selected ? 'campaignbay-text-blue-100' : 'campaignbay-text-gray-500'} ${isDisabled ? '!campaignbay-text-gray-400' : ''} ${classNames?.description || ''}`}>
          {description}
        </p>
      </div>
    </div>
  );
};
