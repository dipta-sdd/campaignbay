import React, { useState, useRef, useEffect, FC, ReactNode } from "react";
import { Icon, cautionFilled } from "@wordpress/icons";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children?: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  contentClassName?: string;
}

interface PositionState {
  top: number;
  left: number;
}

export const Tooltip: FC<TooltipProps> = ({
  children = (
    <Icon
      icon={cautionFilled}
      className="campaignbay-text-gray-400"
      fill="currentColor"
    />
  ),
  content,
  position = "top",
  delay = 200,
  className = "",
  contentClassName = "",
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<PositionState>({
    top: 0,
    left: 0,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // If there's a timeout to hide the tooltip, cancel it
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Set a timeout to show the tooltip if it's not already visible
    if (!showTimeoutRef.current && !isVisible) {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    // If there's a timeout to show the tooltip, cancel it
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Set a short timeout to hide the tooltip, allowing the user to move their cursor to it
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100); // A small delay before hiding
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8; // Space between trigger and tooltip

    let top, left;

    // Corrected positioning for a `position: fixed` element
    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }

    // Boundary collision checks to keep the tooltip within the viewport
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding;
    }
    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();

      const handleResizeOrScroll = () => calculatePosition();
      window.addEventListener("resize", handleResizeOrScroll);
      window.addEventListener("scroll", handleResizeOrScroll, true); // Use capture phase for scroll

      return () => {
        window.removeEventListener("resize", handleResizeOrScroll);
        window.removeEventListener("scroll", handleResizeOrScroll, true);
      };
    }
  }, [isVisible, position]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const getArrowClasses = () => {
    const baseArrow =
      "campaignbay-absolute campaignbay-w-2 campaignbay-h-2 campaignbay-bg-gray-800 campaignbay-transform campaignbay-rotate-45";

    switch (position) {
      case "top":
        return `${baseArrow} campaignbay--bottom-1 campaignbay-left-1/2 campaignbay--translate-x-1/2`;
      case "bottom":
        return `${baseArrow} campaignbay--top-1 campaignbay-left-1/2 campaignbay-translate-x-1/2`;
      case "left":
        return `${baseArrow} campaignbay--right-1 campaignbay-top-1/2 campaignbay--translate-y-1/2`;
      case "right":
        return `${baseArrow} campaignbay--left-1 campaignbay-top-1/2 campaignbay--translate-y-1/2`;
      default:
        return `${baseArrow} campaignbay--bottom-1 campaignbay-left-1/2 campaignbay-translate-x-1/2`;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`campaignbay-inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        // Added for accessibility
        aria-describedby={isVisible ? "tooltip-content" : undefined}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          // MODIFIED: Removed `pointer-events-none` and added event handlers
          className="campaignbay-fixed campaignbay-z-50"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            maxWidth: "300px",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            // Added for accessibility
            id="tooltip-content"
            role="tooltip"
            className={`
              campaignbay-relative campaignbay-px-3 campaignbay-py-2 campaignbay-text-sm campaignbay-text-gray-200 campaignbay-bg-gray-800 campaignbay-rounded-lg campaignbay-shadow-lg
              campaignbay-animate-in campaignbay-fade-in-0 campaignbay-zoom-in-95 campaignbay-duration-200
              ${contentClassName}
            `}
          >
            {content}
            <div className={getArrowClasses()} />
          </div>
        </div>
      )}
    </>
  );
};

export default Tooltip;
