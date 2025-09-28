"use client";

import { Icon, cautionFilled } from "@wordpress/icons";
import { useState, useRef, useEffect, Children } from "react";

export default function Tooltip({
  children = (
    <>
      {" "}
      <Icon
        icon={cautionFilled}
        className="campaignbay-text-gray-400"
        fill="currentColor"
      />
    </>
  ),
  content,
  position = "top",
  delay = 200,
  className = "",
  contentClassName = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    let top, left;
    // for positioning error remove scrollTop
    switch (position) {
      case "top":
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left =
          triggerRect.left +
          scrollLeft +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + scrollTop + 8;
        left =
          triggerRect.left +
          scrollLeft +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top =
          triggerRect.top +
          scrollTop +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case "right":
        top =
          triggerRect.top +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollLeft + 8;
        break;
      default:
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left =
          triggerRect.left +
          scrollLeft +
          (triggerRect.width - tooltipRect.width) / 2;
    }

    // Keep tooltip within viewport bounds
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();

      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    const baseArrow =
      "campaignbay-absolute campaignbay-w-2 campaignbay-h-[0.5rem] campaignbay-bg-gray-200 campaignbay-transform campaignbay-rotate-45";

    switch (position) {
      case "top":
        return `${baseArrow} campaignbay--bottom-1 campaignbay-left-1/2 campaignbay-translate-x-1/2`;
      case "bottom":
        return `${baseArrow} campaignbay--top-1 campaignbay-left-1/2 campaignbay-translate-x-1/2`;
      case "left":
        return `${baseArrow} campaignbay--right-1 campaignbay-top-1/2 campaignbay-translate-y-1/2`;
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
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="campaignbay-fixed campaignbay-z-50 campaignbay-pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div
            className={`
              campaignbay-relative campaignbay-px-3 campaignbay-py-2 campaignbay-text-sm campaignbay-text-gray-800 campaignbay-bg-gray-200 campaignbay-rounded-lg campaignbay-shadow-lg
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
}
