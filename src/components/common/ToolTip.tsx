import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  disabled?: boolean;
  classNames?: {
    root?: string;
    trigger?: string;
    content?: string;
    arrow?: string;
  };
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  disabled = false,
  classNames,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const show = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = window.setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const gap = 8; 

        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top + scrollY - gap;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + scrollY + gap;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.left + scrollX - gap;
            break;
          case 'right':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.right + scrollX + gap;
            break;
        }

        setCoords({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const handleScroll = () => {
        if(isVisible) setIsVisible(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
        window.removeEventListener('scroll', handleScroll, true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  const transformStyle = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)',
  }[position];

  const arrowClasses = {
    top: 'campaignbay-top-full campaignbay-left-1/2 campaignbay--translate-x-1/2 campaignbay-border-t-gray-900',
    bottom: 'campaignbay-bottom-full campaignbay-left-1/2 campaignbay--translate-x-1/2 campaignbay-border-b-gray-900',
    left: 'campaignbay-left-full campaignbay-top-1/2 campaignbay--translate-y-1/2 campaignbay-border-l-gray-900',
    right: 'campaignbay-right-full campaignbay-top-1/2 campaignbay--translate-y-1/2 campaignbay-border-r-gray-900',
  }[position];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={`campaignbay-inline-block ${classNames?.trigger || ''}`}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
            className={`
                campaignbay-absolute campaignbay-z-[60] campaignbay-pointer-events-none
                ${className}
                ${classNames?.root || ''}
            `}
            style={{
                top: coords.top,
                left: coords.left,
                transform: transformStyle,
            }}
        >
            <div className={`campaignbay-animate-tooltip campaignbay-relative campaignbay-px-2.5 campaignbay-py-1.5 campaignbay-bg-gray-900 campaignbay-text-white campaignbay-text-xs campaignbay-rounded campaignbay-shadow-lg campaignbay-whitespace-nowrap ${classNames?.content || ''}`}>
                {content}
                <div 
                    className={`
                        campaignbay-absolute campaignbay-border-[5px] campaignbay-border-transparent
                        ${arrowClasses}
                        ${classNames?.arrow || ''}
                    `} 
                />
            </div>
        </div>,
        document.body
      )}
    </>
  );
};