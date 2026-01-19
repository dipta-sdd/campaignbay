import React, { useState, useRef, useEffect } from "react";

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  align = "left",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  // Transition classes
  const transitionClasses = isOpen
    ? "campaignbay-opacity-100 campaignbay-scale-100 campaignbay-translate-y-0 campaignbay-pointer-events-auto"
    : "campaignbay-opacity-0 campaignbay-scale-95 -campaignbay-translate-y-2 campaignbay-pointer-events-none";

  const originClass =
    align === "right"
      ? "campaignbay-origin-top-right"
      : "campaignbay-origin-top-left";
  const positionClass =
    align === "right" ? "campaignbay-right-0" : "campaignbay-left-0";

  return (
    <div
      ref={containerRef}
      className={`campaignbay-relative campaignbay-inline-block ${className}`}
    >
      {/* Trigger Wrapper */}
      <div onClick={toggle} className="campaignbay-cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        className={`
          campaignbay-absolute campaignbay-z-50 campaignbay-mt-2 campaignbay-w-[500px]
          campaignbay-bg-white campaignbay-rounded-[8px] campaignbay-shadow-xl campaignbay-border campaignbay-border-default
          campaignbay-transition-all campaignbay-duration-200 campaignbay-ease-out
          ${originClass}
          ${positionClass}
          ${transitionClasses}
        `}
      >
        {content}
      </div>
    </div>
  );
};
