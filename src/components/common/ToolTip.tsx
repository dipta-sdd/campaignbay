import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

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
  docLink?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 200,
  className = "",
  disabled = false,
  classNames,
  docLink,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;

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
    const gap = 8;

    let top = 0;
    let left = 0;

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

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();

      const handleResizeOrScroll = () => calculatePosition();
      window.addEventListener("resize", handleResizeOrScroll);
      window.addEventListener("scroll", handleResizeOrScroll, true);

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

  const arrowClasses = {
    top: "campaignbay-top-full campaignbay-left-1/2 campaignbay--translate-x-1/2 campaignbay-border-t-gray-900",
    bottom:
      "campaignbay-bottom-full campaignbay-left-1/2 campaignbay--translate-x-1/2 campaignbay-border-b-gray-900",
    left: "campaignbay-left-full campaignbay-top-1/2 campaignbay--translate-y-1/2 campaignbay-border-l-gray-900",
    right:
      "campaignbay-right-full campaignbay-top-1/2 campaignbay--translate-y-1/2 campaignbay-border-r-gray-900",
  }[position];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`campaignbay-inline-block ${classNames?.trigger || ""}`}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
            campaignbay-fixed campaignbay-z-[60]
            ${className}
            ${classNames?.root || ""}
          `}
            style={{
              top: coords.top,
              left: coords.left,
              maxWidth: "300px",
            }}
          >
            <div
              className={`campaignbay-animate-tooltip campaignbay-relative campaignbay-px-2.5 campaignbay-py-1.5 campaignbay-bg-gray-900 campaignbay-text-white campaignbay-text-xs campaignbay-rounded campaignbay-shadow-lg ${
                classNames?.content || ""
              }`}
            >
              {content}
              {docLink && (
                <>
                  {" "}
                  <a
                    href={docLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="campaignbay-text-blue-400 hover:campaignbay-text-blue-300 campaignbay-underline"
                  >
                    Read More
                  </a>
                </>
              )}
              <div
                className={`
                campaignbay-absolute campaignbay-border-[5px] campaignbay-border-transparent
                ${arrowClasses}
                ${classNames?.arrow || ""}
              `}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
