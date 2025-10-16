import { Icon } from "@wordpress/icons";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function DropdownMenu({ controls }) {
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
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
    setIsOpen(!isOpen);
  };

  const handleMenuAction = (action) => {
    console.log(`${action} clicked`);
    setIsOpen(false);
  };

  return (
    <>
      <div className="campaignbay-relative">
        {/* Trigger Button */}
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="campaignbay-p-2 hover:campaignbay-bg-gray-100 campaignbay-rounded-md campaignbay-transition-colors"
          aria-label="More options"
        >
          <EllipsisVertical size={16} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="campaignbay-fixed campaignbay-bg-white campaignbay-rounded-sm campaignbay-shadow-lg campaignbay-border campaignbay-border-gray-200 campaignbay-p-0 campaignbay-z-50 campaignbay-dropdown"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            {/* Edit Option */}
            {controls?.map((control, index) => (
              <>
                <button
                  onClick={control.onClick}
                  key={index}
                  className="campaignbay-w-full campaignbay-flex campaignbay-items-center campaignbay-gap-3 campaignbay-px-3.5 campaignbay-py-2.5 campaignbay-text-sm campaignbay-text-gray-700 hover:campaignbay-bg-blue-200 campaignbay-border-l-2 campaignbay-border-gray-50 hover:campaignbay-border-blue-500 campaignbay-transition-colors campaignbay-text-left"
                >
                  <Icon icon={control.icon} fill="currentColor" />
                  {control.title}
                </button>
              </>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
