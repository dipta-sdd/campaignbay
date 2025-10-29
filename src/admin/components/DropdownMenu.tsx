import React, { FC, useState, useRef, useEffect, ReactNode } from "react";
import { Icon } from "@wordpress/icons";
import { EllipsisVertical } from "lucide-react";

// Define the shape of a single control object for the menu
interface DropdownControl {
  onClick: () => void;
  icon: ReactNode;
  title: ReactNode;
}

// Define the component's props interface
interface DropdownMenuProps {
  controls: DropdownControl[];
}

// Define the shape of the position state object
interface PositionState {
  top: number;
  left: number;
}

const DropdownMenu: FC<DropdownMenuProps> = ({ controls }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<PositionState>({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ensure the event target is a Node before calling .contains()
      if (!(event.target instanceof Node)) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right - 160 + 18, // 160px is the dropdown width
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="campaignbay-relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="campaignbay-p-2 hover:campaignbay-bg-gray-100 campaignbay-rounded-md campaignbay-transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="More options"
      >
        <EllipsisVertical size={16} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="campaignbay-fixed campaignbay-bg-white campaignbay-rounded-sm campaignbay-shadow-lg campaignbay-border campaignbay-border-gray-200 campaignbay-p-0 campaignbay-z-50 campaignbay-dropdown"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          role="menu"
        >
          {controls.map((control, index) => (
            <button
              key={index}
              onClick={() => {
                control.onClick();
                setIsOpen(false); // Close menu on action
              }}
              className="campaignbay-w-full campaignbay-flex campaignbay-items-center campaignbay-gap-3 campaignbay-px-3.5 campaignbay-py-2.5 campaignbay-text-sm campaignbay-text-gray-700 hover:campaignbay-bg-blue-200 campaignbay-border-l-2 campaignbay-border-gray-50 hover:campaignbay-border-blue-500 campaignbay-transition-colors campaignbay-text-left"
              role="menuitem"
            >
              {/* @ts-ignore */}
              <Icon icon={control.icon} fill="currentColor" />
              <span>{control.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
