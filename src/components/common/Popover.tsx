import React, { useState, useRef, useEffect } from 'react';

export type PopoverAlign = 
  | 'top' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom' 
  | 'bottom-left' 
  | 'bottom-right' 
  | 'left' 
  | 'right';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: PopoverAlign;
  className?: string;
  classNames?: {
    root?: string;
    triggerWrapper?: string;
    content?: string;
  };
}

export const Popover: React.FC<PopoverProps> = ({ 
  trigger, 
  content, 
  align = 'bottom-left', 
  className = '',
  classNames
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  // Position & Origin Logic
  let positionClasses = '';
  let originClass = '';

  switch (align) {
    case 'top':
      positionClasses = 'campaignbay-bottom-full campaignbay-mb-2 campaignbay-left-1/2 campaignbay--translate-x-1/2';
      originClass = 'campaignbay-origin-bottom';
      break;
    case 'top-left':
      positionClasses = 'campaignbay-bottom-full campaignbay-mb-2 campaignbay-left-0';
      originClass = 'campaignbay-origin-bottom-left';
      break;
    case 'top-right':
      positionClasses = 'campaignbay-bottom-full campaignbay-mb-2 campaignbay-right-0';
      originClass = 'campaignbay-origin-bottom-right';
      break;
    case 'bottom':
      positionClasses = 'campaignbay-top-full campaignbay-mt-2 campaignbay-left-1/2 campaignbay--translate-x-1/2';
      originClass = 'campaignbay-origin-top';
      break;
    case 'bottom-left':
      positionClasses = 'campaignbay-top-full campaignbay-mt-2 campaignbay-left-0';
      originClass = 'campaignbay-origin-top-left';
      break;
    case 'bottom-right':
      positionClasses = 'campaignbay-top-full campaignbay-mt-2 campaignbay-right-0';
      originClass = 'campaignbay-origin-top-right';
      break;
    case 'left':
      positionClasses = 'campaignbay-right-full campaignbay-mr-2 campaignbay-top-1/2 campaignbay--translate-y-1/2';
      originClass = 'campaignbay-origin-right';
      break;
    case 'right':
      positionClasses = 'campaignbay-left-full campaignbay-ml-2 campaignbay-top-1/2 campaignbay--translate-y-1/2';
      originClass = 'campaignbay-origin-left';
      break;
    default:
      positionClasses = 'campaignbay-top-full campaignbay-mt-2 campaignbay-left-0';
      originClass = 'campaignbay-origin-top-left';
  }

  // Transition classes (Opacity + Scale)
  const transitionClasses = isOpen
    ? 'campaignbay-opacity-100 campaignbay-scale-100 campaignbay-pointer-events-auto'
    : 'campaignbay-opacity-0 campaignbay-scale-95 campaignbay-pointer-events-none';

  return (
    <div ref={containerRef} className={`campaignbay-relative campaignbay-inline-block ${className} ${classNames?.root || ''}`}>
      {/* Trigger Wrapper */}
      <div onClick={toggle} className={`campaignbay-cursor-pointer campaignbay-inline-flex ${classNames?.triggerWrapper || ''}`}>
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        className={`
          campaignbay-absolute campaignbay-z-50 campaignbay-w-48
          campaignbay-bg-white campaignbay-rounded-xl campaignbay-shadow-xl campaignbay-border campaignbay-border-default
          campaignbay-transition-all campaignbay-duration-200 campaignbay-ease-out
          ${positionClasses}
          ${originClass}
          ${transitionClasses}
          ${classNames?.content || ''}
        `}
      >
        {content}
      </div>
    </div>
  );
};