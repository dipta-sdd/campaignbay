import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "./hooks/useClickOutside";
import { ChevronDown, X } from "lucide-react";
import { __ } from "@wordpress/i18n";

export interface MultiSelectOption {
  value: string | number;
  label: string;
  labelNode?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  id?: string;
  /**
   * Array of selected values
   */
  value: (string | number)[];
  /**
   * Callback when selection changes
   */
  onChange: (value: (string | number)[]) => void;
  /**
   * List of available options
   */
  options: MultiSelectOption[];
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
  /**
   * Disable the entire interaction
   */
  disabled?: boolean;
  /**
   * Custom class for the container
   */
  className?: string;
  /**
   * Helper text or label (optional)
   */
  label?: string;
  /**
   * Enable search functionality within the dropdown
   */
  enableSearch?: boolean;

  isError?: boolean;
  errorClassName?: string;
}

const CustomMultiSelect: React.FC<MultiSelectProps> = ({
  id,
  value = [],
  onChange,
  options,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  label,
  enableSearch = true,
  isError = false,
  errorClassName = "wpab-input-error",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Close dropdown when clicking outside
  useClickOutside(containerRef, () => {
    setIsOpen(false);
  });

  // Get selected options objects
  const selectedOptions = useMemo(() => {
    return options.filter((opt) => value.includes(opt.value));
  }, [options, value]);

  // Filter options based on search query (exclude already selected)
  const filteredOptions = useMemo(() => {
    let filtered = options.filter((opt) => !value.includes(opt.value));
    if (enableSearch && searchQuery) {
      filtered = filtered.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [options, value, searchQuery, enableSearch]);

  // Reset search and highlighted index when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
      setHighlightedIndex(0);
      interactionType.current = "keyboard";
    } else {
      setSearchQuery("");
    }
  }, [isOpen, enableSearch]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      isOpen &&
      listRef.current &&
      highlightedIndex >= 0 &&
      interactionType.current === "keyboard"
    ) {
      const list = listRef.current;
      const element = list.children[highlightedIndex] as HTMLElement;
      if (element) {
        const listTop = list.scrollTop;
        const listBottom = listTop + list.clientHeight;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (elementTop < listTop) {
          list.scrollTop = elementTop;
        } else if (elementBottom > listBottom) {
          list.scrollTop = elementBottom - list.clientHeight;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: MultiSelectOption) => {
    if (option.disabled) return;
    const newValue = [...value, option.value];
    onChange(newValue);
    setSearchQuery("");
    // Keep dropdown open for multi-select
  };

  const handleRemove = (optionValue: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange(newValue);
  };

  // Keyboard handler for the Search Input
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    interactionType.current = "keyboard";
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Backspace":
        if (searchQuery === "" && value.length > 0) {
          // Remove the last selected item
          handleRemove(value[value.length - 1]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(true);
      // Focus the search input when opening
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  return (
    <div
      className={`campaignbay-relative campaignbay-w-full ${className}`}
      ref={containerRef}
    >
      {label && (
        <label className="campaignbay-block campaignbay-text-sm campaignbay-font-medium campaignbay-text-gray-700 campaignbay-mb-1">
          {label}
        </label>
      )}

      {/* Trigger / Selected Items Container */}
      <div
        id={id}
        onClick={handleTriggerClick}
        className={`
          campaignbay-relative campaignbay-flex campaignbay-flex-wrap campaignbay-items-center campaignbay-gap-1 campaignbay-w-full campaignbay-min-h-[40px] !campaignbay-py-[4px] campaignbay-text-left !campaignbay-cursor-text
          campaignbay-transition-all campaignbay-duration-200 campaignbay-ease-in-out wpab-multiselect-input campaignbay-border campaignbay-border-gray-300
          ${
            disabled
              ? "campaignbay-bg-gray-100 campaignbay-cursor-not-allowed campaignbay-text-gray-400"
              : "hover:!campaignbay-border-[#183ad6]"
          }
          ${isOpen ? "!campaignbay-border-[#183ad6]" : ""}
          ${isError ? errorClassName : ""}
        `}
      >
        {/* Selected Tags */}
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="campaignbay-inline-flex campaignbay-items-center campaignbay-gap-1 campaignbay-bg-blue-100 campaignbay-text-blue-800 campaignbay-px-2 campaignbay-py-0.5 campaignbay-rounded campaignbay-text-sm campaignbay-font-medium"
          >
            {option.label}
            <button
              type="button"
              onClick={(e) => handleRemove(option.value, e)}
              className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-w-4 campaignbay-h-4 campaignbay-rounded-full hover:campaignbay-bg-blue-200 campaignbay-transition-colors"
              aria-label={`Remove ${option.label}`}
            >
              <X className="campaignbay-w-3 campaignbay-h-3" />
            </button>
          </span>
        ))}

        {/* Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          className="campaignbay-flex-1 campaignbay-min-w-[80px] campaignbay-bg-transparent !campaignbay-border-none !campaignbay-shadow-none campaignbay-outline-none campaignbay-p-1 campaignbay-text-sm campaignbay-placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
          disabled={disabled}
        />

        {/* Chevron Icon */}
        <span className="campaignbay-flex-shrink-0 campaignbay-ml-auto campaignbay-flex campaignbay-items-center">
          <ChevronDown
            className={`campaignbay-h-4 campaignbay-w-4 campaignbay-text-gray-500 campaignbay-transition-transform campaignbay-duration-200 ${
              isOpen ? "campaignbay-transform campaignbay-rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="campaignbay-absolute campaignbay-z-50 campaignbay-w-full campaignbay-bg-white campaignbay-border campaignbay-border-gray-200 campaignbay-mt-1 campaignbay-rounded campaignbay-shadow-lg"
          style={{ zIndex: 50000 }}
        >
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="campaignbay-max-h-60 campaignbay-overflow-auto focus:campaignbay-outline-none campaignbay-py-1"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredOptions.length === 0 ? (
              <li className="campaignbay-px-3 campaignbay-py-2 campaignbay-text-gray-500 campaignbay-text-sm campaignbay-text-center campaignbay-italic">
                {searchQuery
                  ? __("No results found", "campaignbay")
                  : __("No more options", "campaignbay")}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isHighlighted = highlightedIndex === index;
                const isDisabled = option.disabled;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={false}
                    onMouseEnter={() => {
                      interactionType.current = "mouse";
                      setHighlightedIndex(index);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`
                      campaignbay-px-3 campaignbay-py-2 campaignbay-cursor-pointer campaignbay-text-sm campaignbay-transition-colors
                      ${
                        isDisabled
                          ? "campaignbay-opacity-50 !campaignbay-cursor-not-allowed campaignbay-text-gray-400"
                          : ""
                      }
                      ${
                        isHighlighted && !isDisabled
                          ? "campaignbay-bg-blue-600 campaignbay-text-white"
                          : "campaignbay-text-gray-700"
                      }
                      ${option.className || ""}
                    `}
                  >
                    {option.labelNode || option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomMultiSelect;
