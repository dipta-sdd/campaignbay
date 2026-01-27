import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { borderClasses, hoverBorderClasses } from "./classes";

// Inline Icons to replace lucide-react
const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

export interface MultiSelectOption {
  value: string | number;
  label: string;
  labelNode?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  id?: string;
  ref?: React.Ref<HTMLDivElement>;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  enableSearch?: boolean;
  isError?: boolean;
  errorClassName?: string;
  classNames?: {
    wrapper?: string;
    label?: string;
    container?: string;
    tag?: string;
    dropdown?: string;
    option?: string;
    search?: string;
    error?: string;
  };
  isCompact?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  ref,
  value = [],
  onChange,
  options,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  label,
  enableSearch = true,
  isError = false,
  errorClassName = "campaignbay-border-danger",
  classNames = {},
  isCompact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Handle outside click logic including Portal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;
      
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      
      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

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
    // Keep dropdown open for multi-select convenience
    requestAnimationFrame(() => {
        searchInputRef.current?.focus();
    });
  };

  const handleRemove = (optionValue: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange(newValue);
  };

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
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  return (
    <div
      className={`campaignbay-relative campaignbay-w-full ${className} ${classNames.wrapper || ''}`}
      ref={containerRef}
    >
      {label && (
        <label className={`campaignbay-block campaignbay-text-sm campaignbay-font-bold campaignbay-text-gray-900 campaignbay-mb-2 ${classNames.label || ''}`}>
          {label}
        </label>
      )}

      {/* Trigger / Selected Items Container */}
      <div
        id={id}
        ref={ref}
        onClick={handleTriggerClick}
        className={`
          campaignbay-relative campaignbay-flex campaignbay-flex-wrap campaignbay-items-center campaignbay-gap-2 campaignbay-w-full campaignbay-px-4 campaignbay-text-left !campaignbay-cursor-text
          campaignbay-transition-all campaignbay-duration-200 campaignbay-ease-in-out campaignbay-border campaignbay-rounded-[8px] campaignbay-bg-white
          ${borderClasses}
          ${isCompact ? "campaignbay-py-[4px]" : "campaignbay-py-[7px]"}
          ${
            disabled
              ? "campaignbay-bg-gray-50 campaignbay-cursor-not-allowed campaignbay-text-gray-400 campaignbay-border-gray-200"
              : `hover:!campaignbay-border-primary`
          }
          ${isOpen ? hoverBorderClasses : ""}
          ${isError ? errorClassName : ""}
          ${classNames.container || ''}
        `}
      >
        {/* Selected Tags */}
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className={`
                campaignbay-inline-flex campaignbay-items-center campaignbay-gap-1 campaignbay-bg-gray-100 campaignbay-text-gray-800 campaignbay-px-2 campaignbay-py-[2px] campaignbay-rounded-none campaignbay-text-[13px] campaignbay-leading-[20px] campaignbay-font-[400]
                ${classNames.tag || ''}
            `}
          >
            {option.label}
            <button
              type="button"
              onClick={(e) => handleRemove(option.value, e)}
              className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-w-4 campaignbay-h-4 campaignbay-rounded-full hover:campaignbay-bg-gray-200 campaignbay-transition-colors campaignbay-text-gray-500"
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
          className={`
            campaignbay-flex-1 campaignbay-min-w-[80px] campaignbay-bg-transparent !campaignbay-border-none !campaignbay-shadow-none campaignbay-outline-none campaignbay-px-1 campaignbay-py-[2px]  !campaignbay-text-[13px] !campaignbay-leading-[20px] campaignbay-font-[400] campaignbay-text-gray-900 campaignbay-placeholder-gray-400 !campaignbay-min-h-[24px]
            ${classNames.search || ''}
          `}
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

      {/* Dropdown Panel via Portal */}
      {isOpen &&
        createPortal(
            <div
            ref={dropdownRef}
            className={`
                campaignbay-fixed campaignbay-z-[50000] campaignbay-w-full campaignbay-bg-white campaignbay-border campaignbay-border-gray-200 campaignbay-rounded-[12px] campaignbay-p-[4px] campaignbay-shadow-xl
                ${classNames.dropdown || ''}
            `}
            style={{
                width: containerRef.current?.getBoundingClientRect().width,
                left: containerRef.current?.getBoundingClientRect().left,
                top: (containerRef.current?.getBoundingClientRect().bottom || 0) - 1,
            }}
            >
            <ul
                ref={listRef}
                role="listbox"
                tabIndex={-1}
                className="campaignbay-max-h-[204px] campaignbay-overflow-auto focus:campaignbay-outline-none"
                style={{ scrollbarWidth: "none" }}
            >
                {filteredOptions.length === 0 ? (
                <li className="campaignbay-px-3 campaignbay-py-2 campaignbay-text-gray-500 campaignbay-text-sm campaignbay-text-center campaignbay-italic !campaignbay-mb-0 campaignbay-rounded-[8px]">
                    {searchQuery ? "No results found" : "No more options"}
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
                        campaignbay-px-4 campaignbay-py-2.5 campaignbay-cursor-pointer campaignbay-text-sm campaignbay-transition-colors campaignbay-border-b campaignbay-border-gray-50 last:campaignbay-border-0 !campaignbay-mb-0  campaignbay-rounded-[8px]
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
                        ${classNames.option || ''}
                        `}
                    >
                        {option.labelNode || option.label}
                    </li>
                    );
                })
                )}
            </ul>
            </div>,
            document.body
        )}
    </div>
  );
};

export default MultiSelect;
